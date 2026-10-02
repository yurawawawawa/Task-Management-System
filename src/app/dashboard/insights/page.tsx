import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { getUserProductivityStats } from '@/app/lib/activity';
import InsightsClient from './InsightsClient';

export default async function InsightsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const [tasks, stats] = await Promise.all([
    db.orm.public.Task.where({ userId: user.id }).all(),
    getUserProductivityStats(user.id),
  ]);

  return (
    <InsightsClient
      todayStr={stats.todayStr}
      activities={stats.activities.map((activity) => ({
        date: activity.date,
        count: activity.taskCount,
      }))}
      tasks={tasks.map((task) => ({
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }))}
    />
  );
}
