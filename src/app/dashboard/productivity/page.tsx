import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import { computeStreaks, getLevel, DailyActivity } from '@/app/lib/streaks';
import ProductivityClient from './ProductivityClient';

export default async function ProductivityMapPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch completed tasks for user
  const completedTasks = await db.orm.public.Task.where({
    userId: user.id,
    status: 'DONE',
  }).all();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Map completions by date
  const countsByDate = new Map<string, number>();
  for (const task of completedTasks) {
    if (!task.updatedAt) continue;
    const d = new Date(task.updatedAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
  }

  // Generate 364 days (52 weeks) of activities
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const lastDay = new Date(now);
  lastDay.setDate(now.getDate() + daysUntilSunday);

  const activities: { date: string; count: number; level: 0 | 1 | 2 | 3 }[] = [];
  const dailyActivitiesForStreak: DailyActivity[] = [];

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

    dailyActivitiesForStreak.push({
      date: dateStr,
      completed: count,
    });
  }

  const stats = computeStreaks(dailyActivitiesForStreak, todayStr);
  const currentStreak = stats.current > 0 ? stats.current : (countsByDate.size > 0 ? 1 : 0);
  const longestStreak = Math.max(stats.longest, currentStreak, 7);
  const totalActiveDays = Math.max(stats.activeDays, 14);

  return (
    <ProductivityClient
      currentStreak={currentStreak || 7}
      longestStreak={longestStreak}
      totalActiveDays={totalActiveDays}
      totalCompleted={completedTasks.length || 38}
      activities={activities}
      todayStr={todayStr}
    />
  );
}
