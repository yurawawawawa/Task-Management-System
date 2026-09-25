'use client';

import { useTheme } from '@/app/context/ThemeContext';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import MobileNav from './MobileNav';
import SidebarNav from './SidebarNav';
import TreklyLogo from '@/app/components/TreklyLogo';

interface DashboardLayoutClientProps {
  profile: any;
  authUser: any;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  profile,
  authUser,
  children,
}: DashboardLayoutClientProps) {
  const { themeStyle } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row relative transition-colors duration-200 ${
        themeStyle === 'retro'
          ? "bg-[#fbf3e0] font-['Alegreya_Sans',sans-serif] text-[#1a2e1f]"
          : "bg-[#f8fafc] font-sans text-slate-800"
      }`}
      style={
        themeStyle === 'retro'
          ? {
              backgroundImage: 'radial-gradient(rgba(26, 46, 31, 0.12) 2px, transparent 2px)',
              backgroundSize: '22px 22px',
            }
          : undefined
      }
    >
      {/* Desktop Sidebar Navigation */}
      <aside
        className={`hidden md:flex flex-col w-64 lg:w-72 shrink-0 sticky top-0 h-screen z-30 transition-all duration-200 ${
          themeStyle === 'retro'
            ? 'border-r-[3.5px] border-[#1a2e1f] bg-[#1f4d2b] text-[#fbf3e0] shadow-[4px_0_0px_#1a2e1f]'
            : 'border-r border-slate-200 bg-white text-slate-800 shadow-sm'
        }`}
      >
        {/* Brand header */}
        <div
          className={`p-5 flex items-center justify-between transition-colors ${
            themeStyle === 'retro'
              ? 'border-b-[3px] border-[#163820] bg-[#173e21]'
              : 'border-b border-slate-100 bg-white'
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                themeStyle === 'retro'
                  ? 'bg-[#ffc93c] border-2 border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f]'
                  : 'bg-primary/10 border border-primary/20 rounded-xl'
              }`}
            >
              <TreklyLogo
                className={`w-6 h-6 ${
                  themeStyle === 'retro' ? 'text-[#1a2e1f]' : 'text-primary'
                }`}
              />
            </div>
            <div>
              <span
                className={`text-2xl tracking-tight block leading-none ${
                  themeStyle === 'retro'
                    ? "font-['Fraunces',serif] font-black text-[#fbf3e0]"
                    : "font-black text-slate-900 text-xl font-sans"
                }`}
              >
                Trekly
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider block mt-1 ${
                  themeStyle === 'retro' ? 'text-[#ffc93c]' : 'text-slate-400 font-medium'
                }`}
              >
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
        <div
          className={`p-4 flex items-center justify-between transition-colors ${
            themeStyle === 'retro'
              ? 'border-t-[3px] border-[#163820] bg-[#173e21]'
              : 'border-t border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                themeStyle === 'retro'
                  ? 'bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f]'
                  : 'bg-slate-800 text-white shadow-xs'
              }`}
            >
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-black truncate leading-tight ${
                  themeStyle === 'retro' ? 'text-[#fbf3e0]' : 'text-slate-800'
                }`}
              >
                {profile?.name || 'Trekly User'}
              </p>
              <p
                className={`text-[11px] truncate leading-tight mt-0.5 ${
                  themeStyle === 'retro' ? 'text-[#fbf3e0]/70' : 'text-slate-400'
                }`}
              >
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
        <header
          className={`md:hidden sticky top-0 z-40 w-full px-4 h-16 flex items-center justify-between transition-colors ${
            themeStyle === 'retro'
              ? 'bg-[#1f4d2b] border-b-[3px] border-[#1a2e1f] text-[#fbf3e0] shadow-[0_3px_0px_#1a2e1f]'
              : 'bg-white border-b border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  themeStyle === 'retro'
                    ? 'bg-[#ffc93c] border-2 border-[#1a2e1f]'
                    : 'bg-primary/10 border border-primary/20'
                }`}
              >
                <TreklyLogo
                  className={`w-5 h-5 ${
                    themeStyle === 'retro' ? 'text-[#1a2e1f]' : 'text-primary'
                  }`}
                />
              </div>
              <span
                className={`tracking-tight ${
                  themeStyle === 'retro'
                    ? "font-['Fraunces',serif] font-black text-xl text-[#fbf3e0]"
                    : "font-black text-lg text-slate-900 font-sans"
                }`}
              >
                Trekly
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${
                themeStyle === 'retro'
                  ? 'bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f]'
                  : 'bg-slate-800 text-white'
              }`}
            >
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
