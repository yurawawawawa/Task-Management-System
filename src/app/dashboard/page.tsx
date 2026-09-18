import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import Link from 'next/link';
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
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Projects</h1>
          <p className="text-gray-500 text-sm">Create and manage your workspaces and tasks.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-all shadow-sm active:scale-95"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-white/50">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <LayoutGrid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-1">No projects found</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Get started by creating a new project. Projects are used to group related tasks together.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center justify-center bg-white text-black border border-gray-200 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group relative bg-white p-6 rounded-2xl border border-gray-200 hover:border-black/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <button className="text-gray-400 hover:text-black transition-colors p-1" onClick={(e) => e.preventDefault()}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-black mb-1 tracking-tight truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="mt-auto pt-5 border-t border-gray-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-black">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className="bg-black h-1.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">
                      {totalTasks} tasks
                    </span>
                    <span className="text-gray-400 group-hover:text-black transition-colors flex items-center font-medium">
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
