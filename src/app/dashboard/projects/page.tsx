import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FolderPlus, LayoutGrid } from 'lucide-react';

export default async function ProjectsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const projects = await db.orm.public.Project
    .where({ userId: user.id })
    .include('tasks')
    .orderBy((project) => project.createdAt.desc())
    .all();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Workspace Personal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Projects &amp; Workspace
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Organisir target jangka panjang, task, dan progres proyekmu di satu tempat.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-border bg-white px-4 py-2.5 text-xs font-black text-foreground shadow-2xs transition-all hover:border-primary/40 hover:bg-muted"
        >
          <FolderPlus className="h-4 w-4" />
          <span>Buat Proyek Baru</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-bold text-muted-foreground">Belum ada proyek.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Buat workspace pertamamu untuk mulai mengorganisir target jangka panjang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completed = project.tasks.filter((task: any) => task.status === 'DONE').length;
            const total = project.tasks.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group flex flex-col justify-between rounded-3xl border-2 border-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-muted-foreground">{progress}% Selesai</span>
                  </div>
                  <h2 className="truncate text-base font-extrabold text-foreground transition-colors group-hover:text-primary">
                    {project.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {project.description || 'Tidak ada deskripsi'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="font-semibold text-muted-foreground">{total} tasks</span>
                  <span className="flex items-center gap-1 font-bold text-foreground transition-transform group-hover:translate-x-1">
                    Buka <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
