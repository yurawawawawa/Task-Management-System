import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { getUserProductivityStats } from '@/app/lib/activity';
import DashboardHomeClient from './DashboardHomeClient';
import Link from 'next/link';
import { FolderPlus, LayoutGrid, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = await db.orm.public.Profile.where({ id: user.id }).first();

  // Fetch all tasks for the user
  const allTasks = await db.orm.public.Task
    .where({ userId: user.id })
    .orderBy(t => t.createdAt.desc())
    .all();

  // Fetch user projects
  const projects = await db.orm.public.Project
    .where({ userId: user.id })
    .include('tasks')
    .orderBy(p => p.createdAt.desc())
    .all();

  const completedTasks = allTasks.filter(t => t.status === 'DONE');

  // Fetch productivity stats with freeze calculation
  const productivityStats = await getUserProductivityStats(user.id);
  const streakDays = productivityStats.currentStreak;

  // Compute completion rate for the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTasks = allTasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
  const completedRecentTasks = recentTasks.filter(t => t.status === 'DONE');
  const weeklyCompletionRate = recentTasks.length > 0 
    ? Math.round((completedRecentTasks.length / recentTasks.length) * 100) 
    : 85;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <DashboardHomeClient
        userName={profile?.name || user.email?.split('@')[0] || 'Teman Produktif'}
        tasks={allTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status as any,
          priority: t.priority as any,
          createdAt: t.createdAt,
        }))}
        streakDays={streakDays}
        weeklyCompletionRate={weeklyCompletionRate}
        totalWeeklyTasks={recentTasks.length || allTasks.length}
        completedWeeklyTasks={completedRecentTasks.length || completedTasks.length}
      />

      {/* Projects Overview section at bottom of dashboard */}
      <div className="pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Proyek & Workspace</h2>
            <p className="text-xs text-muted-foreground">Kumpulan proyek untuk mengorganisir target jangka panjangmu</p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-muted text-foreground border-2 border-border rounded-2xl text-xs font-black transition-all shadow-2xs"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Buat Proyek Baru</span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-border text-center">
            <p className="text-sm font-bold text-muted-foreground">Belum ada proyek terpisah.</p>
            <p className="text-xs text-muted-foreground mt-1">Kamu bisa mengelola task secara langsung di Tasks / Board atau membuat proyek baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const comp = project.tasks.filter((t: any) => t.status === 'DONE').length;
              const total = project.tasks.length;
              const prog = total > 0 ? Math.round((comp / total) * 100) : 0;

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group bg-white p-5 rounded-3xl border-2 border-border hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-muted-foreground">{prog}% Selesai</span>
                    </div>
                    <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {project.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">{total} tasks</span>
                    <span className="font-bold text-foreground flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Buka <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
