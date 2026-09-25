'use server';

import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';
import { recordDailyActivity } from '@/app/lib/activity';

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

  const oldTask = await db.orm.public.Task.where({
    id: taskId,
    userId: user.id,
  }).first();

  const updated = await db.orm.public.Task.where({
    id: taskId,
    userId: user.id,
  }).update({
    status,
  });

  // Automatically record daily activity when task is marked as DONE
  if (oldTask && oldTask.status !== 'DONE' && status === 'DONE') {
    await recordDailyActivity(user.id, { type: 'task', action: 'increment' });
  } else if (oldTask && oldTask.status === 'DONE' && status !== 'DONE') {
    await recordDailyActivity(user.id, { type: 'task', action: 'decrement' });
  }

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

export async function recordHabitCompletion(action: 'increment' | 'decrement' = 'increment') {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const result = await recordDailyActivity(user.id, {
    type: 'habit',
    action,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
  revalidatePath('/dashboard/productivity');
  return result;
}
