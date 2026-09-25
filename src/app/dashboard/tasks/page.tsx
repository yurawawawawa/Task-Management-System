import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import TasksBoardClient from './TasksBoardClient';

export default async function TasksPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const tasks = await db.orm.public.Task
    .where({ userId: user.id })
    .orderBy(t => t.createdAt.desc())
    .all();

  return (
    <TasksBoardClient
      initialTasks={tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status as any,
        priority: t.priority as any,
        createdAt: t.createdAt,
      }))}
    />
  );
}
