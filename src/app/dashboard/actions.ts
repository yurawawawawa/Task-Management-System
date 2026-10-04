'use server';

import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';
import { recordDailyActivity } from '@/app/lib/activity';

export async function createPersonalTask(
  title: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
  description?: string,
  dueDate?: string | null
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
    dueDate: dueDate ? `${dueDate}T23:59:59.000Z` : null,
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

export async function createHabit(title: string, category = 'Produktivitas', frequency = 'DAILY') {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const trimmed = title.trim();
  if (!trimmed) throw new Error('Habit title cannot be empty');

  const habit = await db.orm.public.Habit.create({
    userId: user.id,
    title: trimmed,
    category: category.trim() || 'Produktivitas',
    frequency,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
  return habit;
}

export async function deleteHabit(habitId: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  await db.orm.public.Habit.where({ id: habitId, userId: user.id }).delete();
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
  revalidatePath('/dashboard/productivity');
}

export async function toggleHabitCompletion(habitId: string, date: string, completed: boolean) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const habit = await db.orm.public.Habit.where({ id: habitId, userId: user.id }).first();
  if (!habit) throw new Error('Habit not found');

  const existing = await db.orm.public.HabitCompletion.where({ habitId, date }).first();
  if (completed && !existing) {
    await db.orm.public.HabitCompletion.create({ habitId, date });
    await recordDailyActivity(user.id, { type: 'habit', action: 'increment', date });
  } else if (!completed && existing) {
    await db.orm.public.HabitCompletion.where({ id: existing.id }).delete();
    await recordDailyActivity(user.id, { type: 'habit', action: 'decrement', date });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
  revalidatePath('/dashboard/productivity');
}
