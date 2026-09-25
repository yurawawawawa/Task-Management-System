'use server';

import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

export async function createPersonalTask(
  title: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  description?: string
) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const trimmed = title.trim();
  if (!trimmed) throw new Error('Task title cannot be empty');

  const task = await db.orm.public.Task.create({
    userId: user.id,
    title: trimmed,
    description: description || null,
    status: 'TODO',
    priority,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard/productivity');
  return task;
}

export async function updateTaskStatus(
  taskId: string,
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const updated = await db.orm.public.Task.where({
    id: taskId,
    userId: user.id,
  }).update({
    status,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard/productivity');
  return updated;
}

export async function deleteTask(taskId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  await db.orm.public.Task.where({
    id: taskId,
    userId: user.id,
  }).delete();

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/tasks');
  revalidatePath('/dashboard/productivity');
}
