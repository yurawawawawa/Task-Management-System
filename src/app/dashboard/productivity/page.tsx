import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import { getLevel } from '@/app/lib/streaks';
import { getUserProductivityStats } from '@/app/lib/activity';
import ProductivityClient from './ProductivityClient';

export default async function ProductivityMapPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch productivity stats and daily activity records with freeze calculation
  const stats = await getUserProductivityStats(user.id);

  // Fetch completed tasks for user to account for any tasks not yet logged in daily_activities
  const completedTasks = await db.orm.public.Task.where({
    userId: user.id,
    status: 'DONE',
  }).all();

  const countsByDate = new Map<string, number>();

  // Seed with DailyActivity records from DB
  for (const act of stats.activities) {
    countsByDate.set(act.date, act.taskCount);
  }

  // Merge any completed tasks
  for (const task of completedTasks) {
    if (!task.updatedAt) continue;
    const d = new Date(task.updatedAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!countsByDate.has(dateStr)) {
      countsByDate.set(dateStr, 1);
    }
  }

  const now = new Date();
  const todayStr = stats.todayStr;

  // Generate 364 days (52 weeks) of activities ending on Sunday
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const lastDay = new Date(now);
  lastDay.setDate(now.getDate() + daysUntilSunday);

  const activities: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];

  for (let i = 0; i < 364; i++) {
    const d = new Date(lastDay);
    d.setDate(lastDay.getDate() - (363 - i));
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = countsByDate.get(dateStr) || 0;
    const isFuture = dateStr.localeCompare(todayStr) > 0;
    const level = isFuture ? 0 : getLevel(count);

    activities.push({
      date: dateStr,
      count,
      level,
    });
  }

  return (
    <ProductivityClient
      currentStreak={stats.currentStreak}
      longestStreak={stats.longestStreak}
      totalActiveDays={stats.activeDays}
      totalCompleted={stats.totalCompleted}
      freezeCount={stats.freezeCount}
      activities={activities}
      todayStr={todayStr}
    />
  );
}
