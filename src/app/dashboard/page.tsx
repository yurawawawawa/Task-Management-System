import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) return null; // Redirect handled by layout

  // Ambil semua projects milik user beserta jumlah task di dalamnya
  // Prisma 8 menggunakan .include('relationName') bukan object { relationName: true }
  const projects = await db.orm.public.Project
    .where({ userId: user.id })
    .include('tasks')
    .orderBy({ createdAt: 'desc' })
    .all();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
          <p className="text-gray-500 mt-1">Manage all your projects and tasks</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
          <div className="text-gray-400 mb-4 text-5xl">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to start organizing tasks.</p>
          <Link
            href="/dashboard/projects/new"
            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors inline-block"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all block"
            >
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-2 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-auto">
                <span className="text-gray-500">
                  {project.tasks.length} {project.tasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
                <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
