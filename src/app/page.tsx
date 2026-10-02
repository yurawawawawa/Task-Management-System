import { getAuthUser } from '@/app/lib/supabase/server';
import LandingPage from '@/app/components/landing/LandingPage';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { getUserProductivityStats } from '@/app/lib/activity';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const params = await searchParams;

  // Supabase PKCE links can fall back to the site URL with a query code.
  // Send those links through the callback so the recovery session is established.
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=/reset-password`);
  }

  const user = await getAuthUser();
  if (!user) return <LandingPage user={null} />;

  const [tasks, stats] = await Promise.all([
    db.orm.public.Task.where({ userId: user.id }).orderBy((task) => task.updatedAt.desc()).all(),
    getUserProductivityStats(user.id),
  ]);

  return <LandingPage user={user} tasks={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, priority: task.priority }))} activities={stats.activities.map((activity) => ({ date: activity.date, count: activity.taskCount }))} currentStreak={stats.currentStreak} />;
}
