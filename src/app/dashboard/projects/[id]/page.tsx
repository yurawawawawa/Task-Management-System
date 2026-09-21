import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { notFound, redirect } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const projectId = (await params).id;

  // Fetch project with basic relations
  const project = await db.orm.public.Project.where({ id: projectId }).include('tasks').include('user').include('members').first();

  if (!project) {
    notFound();
  }

  // Ensure user has access (either owner or member)
  const isOwner = project.userId === user.id;
  const isMember = project.members.some((m: any) => m.profileId === user.id);

  if (!isOwner && !isMember) {
    notFound();
  }

  // Fetch assignees and member profiles manually to avoid nested include type issues
  const memberProfileIds = project.members.map((m: any) => m.profileId);
  const taskAssigneeIds = project.tasks.map((t: any) => t.assigneeId).filter(Boolean);
  
  const allNeededProfileIds = Array.from(new Set([...memberProfileIds, ...taskAssigneeIds]));
  let profiles: any[] = [];
  if (allNeededProfileIds.length > 0) {
    profiles = (await Promise.all(allNeededProfileIds.map(id => db.orm.public.Profile.where({ id }).first()))).filter(Boolean);
  }
  
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  // Attach profiles manually to project object
  project.members = project.members.map((m: any) => ({
    ...m,
    profile: profileMap.get(m.profileId) || null
  }));

  project.tasks = project.tasks.map((t: any) => ({
    ...t,
    assignee: t.assigneeId ? (profileMap.get(t.assigneeId) || null) : null
  }));

  return <ProjectDetailClient project={project} user={user} />;
}
