import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { recordActivity } from '@/app/lib/admin/telemetry';

type JoinPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function JoinProjectPage({ searchParams }: JoinPageProps) {
  const { token } = await searchParams;
  if (!token) redirect('/dashboard/projects?invite=invalid');

  const user = await getAuthUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/projects/join?token=${token}`)}`);
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const invite = await db.orm.public.ProjectInvite
    .where({ tokenHash })
    .include('project')
    .first();

  const isExpired = !invite || new Date(invite.expiresAt) < new Date();
  const isUsedEmailInvite = Boolean(invite?.email && invite.acceptedAt);
  if (!invite || isExpired || isUsedEmailInvite) {
    redirect('/dashboard/projects?invite=invalid');
  }

  let profile = await db.orm.public.Profile.where({ id: user.id }).first();
  if (!profile) {
    profile = await db.orm.public.Profile.create({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    });
  }

  if (invite.project.userId !== user.id) {
    const existingMember = await db.orm.public.ProjectMember
      .where({ projectId: invite.projectId, profileId: profile.id })
      .first();

    if (!existingMember) {
      await db.orm.public.ProjectMember.create({
        projectId: invite.projectId,
        profileId: profile.id,
        role: 'MEMBER',
      });
      await recordActivity(user.id, 'PROJECT_JOINED', 'project', invite.projectId);
    }
  }

  if (invite.email && !invite.acceptedAt) {
    await db.orm.public.ProjectInvite.where({ id: invite.id }).update({
      acceptedAt: new Date().toISOString(),
    });
  }

  redirect(`/dashboard/projects/${invite.projectId}`);
}
