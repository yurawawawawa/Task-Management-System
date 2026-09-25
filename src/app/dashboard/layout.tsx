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
    <div
      className="min-h-screen bg-[#fbf3e0] flex flex-col md:flex-row font-['Alegreya_Sans',sans-serif] relative text-[#1a2e1f]"
      style={{
        backgroundImage: 'radial-gradient(rgba(26, 46, 31, 0.12) 2px, transparent 2px)',
        backgroundSize: '22px 22px',
      }}
    >
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r-[3.5px] border-[#1a2e1f] bg-[#1f4d2b] text-[#fbf3e0] sticky top-0 h-screen z-30 shadow-[4px_0_0px_#1a2e1f]">
        {/* Brand header */}
        <div className="p-5 border-b-[3px] border-[#163820] bg-[#173e21] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#ffc93c] border-2 border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <TreklyLogo className="w-6 h-6 text-[#1a2e1f]" />
            </div>
            <div>
              <span className="font-['Fraunces',serif] font-black text-2xl tracking-tight text-[#fbf3e0] block leading-none">
                Trekly
              </span>
              <span className="text-[10px] font-black text-[#ffc93c] uppercase tracking-wider block mt-1">
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
        <div className="p-4 border-t-[3px] border-[#163820] bg-[#173e21] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f] flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_#1a2e1f] shrink-0">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[#fbf3e0] truncate leading-tight">
                {profile?.name || 'Trekly User'}
              </p>
              <p className="text-[11px] text-[#fbf3e0]/70 truncate leading-tight mt-0.5">
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
        <header className="md:hidden sticky top-0 z-40 w-full bg-[#1f4d2b] border-b-[3px] border-[#1a2e1f] px-4 h-16 flex items-center justify-between text-[#fbf3e0] shadow-[0_3px_0px_#1a2e1f]">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffc93c] border-2 border-[#1a2e1f] flex items-center justify-center">
                <TreklyLogo className="w-5 h-5 text-[#1a2e1f]" />
              </div>
              <span className="font-['Fraunces',serif] font-black text-xl tracking-tight text-[#fbf3e0]">
                Trekly
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f] flex items-center justify-center text-[11px] font-black shadow-[1.5px_1.5px_0px_#1a2e1f]">
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
