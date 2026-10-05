'use server';

import { createHash, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';
import { recordActivity } from '@/app/lib/admin/telemetry';

export async function addTask(projectId: string, title: string, assigneeId?: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const project = await db.orm.public.Project.where({ id: projectId, userId: user.id }).first();
  if (!project) throw new Error('Project not found or unauthorized');

  const task = await db.orm.public.Task.create({
    userId: user.id,
    projectId,
    title,
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: assigneeId || null,
  });
  await recordActivity(user.id, 'TASK_CREATED', 'task', task.id);

  revalidatePath(`/dashboard/projects/${projectId}`);
}

async function getAppOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  const requestHeaders = await headers();
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

function createInviteToken() {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

async function createProjectInvite(projectId: string, email?: string) {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  const project = await db.orm.public.Project.where({ id: projectId, userId: user.id }).first();
  if (!project) throw new Error('Project not found or unauthorized');

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Masukkan alamat email yang valid');
    }

    if (normalizedEmail === user.email?.toLowerCase()) {
      throw new Error('Kamu tidak bisa mengundang diri sendiri');
    }

    const collaborator = await db.orm.public.Profile.where({ email: normalizedEmail }).first();
    if (collaborator) {
      const existing = await db.orm.public.ProjectMember.where({ projectId, profileId: collaborator.id }).first();
      if (existing) throw new Error('User ini sudah menjadi collaborator');
    }
  }

  const { token, tokenHash } = createInviteToken();
  await db.orm.public.ProjectInvite.create({
    projectId,
    email: normalizedEmail || null,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: null,
  });

  const origin = await getAppOrigin();
  const joinPath = `/dashboard/projects/join?token=${encodeURIComponent(token)}`;
  const shareUrl = `${origin}${joinPath}`;

  if (normalizedEmail) {
    // Invitation links are opened by the recipient, which may be on another
    // browser/device. Use an implicit email flow so it does not depend on the
    // project owner's PKCE verifier cookie.
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'implicit',
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(joinPath)}`,
      },
    });

    if (error) {
      await db.orm.public.ProjectInvite.where({ tokenHash }).delete();
      throw new Error(`Undangan gagal dikirim: ${error.message}`);
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  await recordActivity(user.id, 'COLLABORATOR_INVITED', 'project', projectId);
  return { shareUrl, email: normalizedEmail || null };
}

export async function inviteCollaborator(projectId: string, email: string) {
  return createProjectInvite(projectId, email);
}

export async function createProjectShareLink(projectId: string) {
  return createProjectInvite(projectId);
}

export async function updateTaskStatus(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
  const user = await getAuthUser();
  if (!user) throw new Error('Unauthorized');

  // Match the project page's existing owner/member access policy server-side.
  const task = await db.orm.public.Task.where({ id: taskId }).first();
  if (!task) throw new Error('Task not found');
  if (task.userId !== user.id) {
    const membership = task.projectId
      ? await db.orm.public.ProjectMember.where({ projectId: task.projectId, profileId: user.id }).first()
      : null;
    if (!membership) throw new Error('Unauthorized');
  }
  await db.orm.public.Task.where({ id: taskId }).update({ status });
  if (task.status !== status) {
    await recordActivity(user.id, status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_UPDATED', 'task', taskId);
  }
  
  // Since we don't have the project id here easily, we might just revalidate all projects
  revalidatePath('/dashboard/projects/[id]', 'page');
}
