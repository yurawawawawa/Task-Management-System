import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import MobileNav from './MobileNav';
import SidebarNav from './SidebarNav';
import TreklyLogo from '@/app/components/TreklyLogo';

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
    <div className="min-h-screen bg-[#faf9f5] flex flex-col md:flex-row font-sans relative">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r-2 border-border bg-white sticky top-0 h-screen z-30">
        {/* Brand header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <TreklyLogo className="w-8 h-8 text-[#1a2e1f] group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground block leading-tight">
                Trekly
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Personal Productivity
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav links & Gamification widget */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        {/* Profile Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-black text-primary-foreground flex items-center justify-center text-xs font-black shadow-sm ring-2 ring-white shrink-0">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-foreground truncate leading-tight">
                {profile?.name || 'Trekly User'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                {authUser.email}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-border px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <TreklyLogo className="w-7 h-7 text-[#1a2e1f]" />
              <span className="font-extrabold tracking-tight text-foreground">Trekly</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-800 to-black text-primary-foreground flex items-center justify-center text-[10px] font-bold">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
