import { db } from '@/prisma/db';
import { getTodayDateStr, daysBetween, calculateStreakWithFreeze, DailyActivity } from './streaks';
import { createClient } from './supabase/server';

interface RecordActivityOptions {
  date?: string;
  type?: 'task' | 'habit';
  action?: 'increment' | 'decrement';
}

/**
 * Records a task or habit completion per daily calendar date.
 *
 * Rules:
 * 1. If user has no activity today:
 *    - Create DailyActivity record with taskCount = 1, streakCounted = true.
 *    - This marks today as completed and qualifies for streak +1.
 * 2. If user already had activity today:
 *    - Increment taskCount, keep streakCounted = true.
 *    - Does NOT increment streak again for today.
 * 3. Handles automatic freeze protection for missed days if user has remaining freeze.
 */
export async function recordDailyActivity(
  userId: string,
  options: RecordActivityOptions = {}
) {
  const dateStr = options.date || getTodayDateStr();
  const action = options.action || 'increment';

  const existing = await db.orm.public.DailyActivity.where({
    userId,
    date: dateStr,
  }).first();

  if (action === 'decrement') {
    if (existing) {
      const newCount = Math.max(0, existing.taskCount - 1);
      await db.orm.public.DailyActivity.where({ id: existing.id }).update({
        taskCount: newCount,
      });
      return { taskCount: newCount, date: dateStr, firstToday: false };
    }
    return { taskCount: 0, date: dateStr, firstToday: false };
  }

  // Increment action
  if (existing) {
    const newCount = existing.taskCount + 1;
    await db.orm.public.DailyActivity.where({ id: existing.id }).update({
      taskCount: newCount,
      streakCounted: true,
    });
    return { taskCount: newCount, date: dateStr, firstToday: false };
  } else {
    // First activity for this date
    await db.orm.public.DailyActivity.create({
      userId,
      date: dateStr,
      taskCount: 1,
      streakCounted: true,
    });

    // Check freeze usage for gaps
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const currentFreeze = typeof user.user_metadata?.freezeCount === 'number'
          ? user.user_metadata.freezeCount
          : 2;

        const allActivities = await db.orm.public.DailyActivity.where({
          userId,
        }).all();

        const mappedDays: DailyActivity[] = allActivities.map((a) => ({
          date: a.date,
          completed: a.taskCount,
        }));

        const result = calculateStreakWithFreeze(mappedDays, dateStr, currentFreeze);

        if (result.remainingFreeze !== currentFreeze) {
          await supabase.auth.updateUser({
            data: {
              freezeCount: result.remainingFreeze,
              longestStreak: result.longest,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to sync freeze usage', err);
    }

    return { taskCount: 1, date: dateStr, firstToday: true };
  }
}

/**
 * Fetches all daily activities and streak stats for a user.
 */
export async function getUserProductivityStats(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const freezeCount = typeof user?.user_metadata?.freezeCount === 'number'
    ? user.user_metadata.freezeCount
    : 2;

  const activities = await db.orm.public.DailyActivity.where({
    userId,
  }).all();

  const todayStr = getTodayDateStr();

  const mappedDays: DailyActivity[] = activities.map((a) => ({
    date: a.date,
    completed: a.taskCount,
  }));

  const streakStats = calculateStreakWithFreeze(mappedDays, todayStr, freezeCount);

  // If freeze count was automatically reduced, update user metadata
  if (user && streakStats.remainingFreeze !== freezeCount) {
    try {
      await supabase.auth.updateUser({
        data: {
          freezeCount: streakStats.remainingFreeze,
          longestStreak: Math.max(
            user.user_metadata?.longestStreak || 0,
            streakStats.longest
          ),
        },
      });
    } catch (err) {
      console.error('Failed to update freeze count in metadata', err);
    }
  }

  // Count total completed tasks
  const completedTasks = await db.orm.public.Task.where({
    userId,
    status: 'DONE',
  }).all();

  const totalDailyCompleted = activities.reduce((acc, curr) => acc + curr.taskCount, 0);
  const totalCompleted = Math.max(completedTasks.length, totalDailyCompleted);

  return {
    todayStr,
    currentStreak: streakStats.current,
    longestStreak: streakStats.longest,
    activeDays: streakStats.activeDays,
    freezeCount: streakStats.remainingFreeze,
    usedFreezeDates: streakStats.usedFreezeDates,
    totalCompleted,
    activities,
  };
}
