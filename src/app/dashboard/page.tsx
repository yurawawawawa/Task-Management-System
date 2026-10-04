import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { getUserProductivityStats } from '@/app/lib/activity';
import DashboardHomeClient from './DashboardHomeClient';
import { getUnlockedAchievements } from '@/app/lib/achievements';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = await db.orm.public.Profile.where({ id: user.id }).first();

  // Fetch all tasks for the user
  const allTasks = await db.orm.public.Task
    .where({ userId: user.id })
    .orderBy(t => t.createdAt.desc())
    .all();

  // Fetch productivity stats with freeze calculation
  const productivityStats = await getUserProductivityStats(user.id);
  const streakDays = productivityStats.currentStreak;

  // Compute completion rate for the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTasks = allTasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
  const completedRecentTasks = recentTasks.filter(t => t.status === 'DONE');
  const weeklyCompletionRate = recentTasks.length > 0 
    ? Math.round((completedRecentTasks.length / recentTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <DashboardHomeClient
        userName={profile?.name || user.email?.split('@')[0] || 'Teman Produktif'}
        tasks={allTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status as any,
          priority: t.priority as any,
          createdAt: t.createdAt,
          dueDate: t.dueDate,
        }))}
        streakDays={streakDays}
        freezeCount={productivityStats.freezeCount}
        weeklyCompletionRate={weeklyCompletionRate}
        totalWeeklyTasks={recentTasks.length}
        completedWeeklyTasks={completedRecentTasks.length}
        unlockedAchievements={getUnlockedAchievements(
          productivityStats.currentStreak,
          productivityStats.longestStreak,
        )}
        activities={productivityStats.activities.map((activity) => ({
          date: activity.date,
          count: activity.taskCount,
        }))}
      />
    </div>
  );
}
