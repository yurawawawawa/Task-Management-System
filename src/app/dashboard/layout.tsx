import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { LayoutDashboard, CheckSquare, Settings } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/login');
  }

  const profile = await db.orm.public.Profile.where({ id: authUser.id }).first();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-[#111111] font-sans">
      {/* Side Navigation (Modern SaaS style) */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg mr-3 shadow-sm">
            T
          </div>
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            Taskora
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 bg-gray-50 text-black rounded-lg font-medium text-sm transition-colors border border-gray-100 shadow-sm">
            <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
            Projects
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-black rounded-lg font-medium text-sm transition-colors">
            <CheckSquare className="w-4 h-4 mr-3 opacity-50" />
            My Tasks
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-black rounded-lg font-medium text-sm transition-colors">
            <Settings className="w-4 h-4 mr-3 opacity-50" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-3 py-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-black text-white flex items-center justify-center text-xs font-bold shadow-inner">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sticky top-0 z-10">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight flex items-center">
            <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center font-bold text-xs mr-2">T</div>
            Taskora
          </Link>
          <LogoutButton />
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
