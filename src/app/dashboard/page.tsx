import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import Link from 'next/link';
import { ProductivityMap } from './ProductivityMap';
import { FolderPlus, MoreHorizontal, ArrowRight, LayoutGrid } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const projects = await db.orm.public.Project
    .where({ userId: user.id })
    .include('tasks')
    .orderBy(p => p.createdAt.desc())
    .all();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Overview</h1>
          <p className="text-muted-foreground text-sm">Select a project to manage its tasks.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 h-11 md:h-9 rounded-xl font-medium text-sm hover:bg-primary-hover transition-all shadow-sm active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Create Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-white/50">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-border-light">
            <LayoutGrid className="w-8 h-8 text-muted-foreground/80" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No projects found</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Get started by creating a new project. Projects are used to group related tasks together.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center justify-center bg-white text-foreground border border-border px-5 h-11 md:h-9 rounded-lg font-medium text-sm hover:bg-muted hover:border-border transition-all shadow-sm"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ProductivityMap />
          {projects.map((project) => {
            const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group relative bg-white p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border-light flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div className="text-muted-foreground/80 hover:text-foreground transition-colors p-2.5 -mr-2 -mt-2 rounded-lg hover:bg-muted flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] md:p-1.5" aria-label="More options">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="mt-auto pt-5 border-t border-border-light">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-foreground">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted-hover rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">
                      {totalTasks} tasks
                    </span>
                    <span className="text-muted-foreground/80 group-hover:text-foreground transition-colors flex items-center font-medium">
                      Open <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
