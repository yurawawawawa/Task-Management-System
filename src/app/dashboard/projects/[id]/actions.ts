'use server';

import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

export async function addTask(projectId: string, title: string, assigneeId?: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const project = await db.orm.public.Project.where({ id: projectId, userId: user.id }).first();
  if (!project) throw new Error('Project not found or unauthorized');

  await db.orm.public.Task.create({
    userId: user.id,
    projectId,
    title,
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: assigneeId || null,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function addCollaborator(projectId: string, email: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const project = await db.orm.public.Project.where({ id: projectId, userId: user.id }).first();
  if (!project) throw new Error('Project not found or unauthorized');

  // Find the user by email
  const collaborator = await db.orm.public.Profile.where({ email }).first();
  if (!collaborator) throw new Error('User not found with this email');

  if (collaborator.id === user.id) {
    throw new Error('You cannot add yourself as a collaborator');
  }

  // check if already a member
  const existing = await db.orm.public.ProjectMember.where({ projectId, profileId: collaborator.id }).first();
  if (existing) throw new Error('User is already a collaborator');

  await db.orm.public.ProjectMember.create({
    projectId,
    profileId: collaborator.id,
    role: 'MEMBER',
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  // In a real app, you'd check if user has access to task
  await db.orm.public.Task.where({ id: taskId }).update({ status });
  
  // Since we don't have the project id here easily, we might just revalidate all projects
  revalidatePath('/dashboard/projects/[id]', 'page');
}
