'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flame,
  Kanban,
  CalendarCheck2,
  TrendingUp,
  Settings,
  Sparkles,
  Snowflake,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

export const DASHBOARD_NAV_ITEMS = [
  {
    href: '/dashboard',
    exact: true,
    label: 'Dashboard',
    description: 'Ringkasan harian & quick stats',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/productivity',
    exact: false,
    label: 'Productivity Map',
    description: 'Visualisasi streak & kontribusi',
    icon: Flame,
    highlight: true,
    badge: 'Unggulan',
  },
  {
    href: '/dashboard/tasks',
    exact: false,
    label: 'Tasks / Board',
    description: 'Papan Kanban personal',
    icon: Kanban,
  },
  {
    href: '/dashboard/habits',
    exact: false,
    label: 'Habits',
    description: 'Tracker kebiasaan harian',
    icon: CalendarCheck2,
  },
  {
    href: '/dashboard/insights',
    exact: false,
    label: 'Insights / Analytics',
    description: 'Analitik & tren personal',
    icon: TrendingUp,
  },
  {
    href: '/dashboard/settings',
    exact: false,
    label: 'Settings',
    description: 'Pengaturan akun & preferensi',
    icon: Settings,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { themeStyle, accentColor } = useTheme();

  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Menu Navigation Items */}
      <div className="space-y-2 px-3 py-4">
        <div
          className={`px-3 pb-1 text-[11px] font-black uppercase tracking-wider ${
            isRetro ? 'text-[#ffc93c]' : 'text-slate-400 font-semibold'
          }`}
        >
          Menu Utama
        </div>

        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          let itemClasses = '';

          if (isRetro) {
            if (isActive) {
              if (item.highlight) {
                itemClasses = isOrange
                  ? 'bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] translate-x-1'
                  : 'bg-[#2d6a3e] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] translate-x-1';
              } else {
                itemClasses =
                  'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] translate-x-1';
              }
            } else {
              itemClasses = item.highlight
                ? 'text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]'
                : 'text-[#fbf3e0]/85 hover:text-white hover:bg-white/10';
            }
          } else {
            // Minimal theme
            if (isActive) {
              itemClasses = isOrange
                ? 'bg-orange-50 text-[#ff7a2f] border border-orange-200 shadow-xs font-bold rounded-xl'
                : 'bg-emerald-50 text-[#1f4d2b] border border-emerald-200 shadow-xs font-bold rounded-xl';
            } else {
              itemClasses =
                'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors';
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-black transition-all ${itemClasses}`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isRetro
                      ? isActive
                        ? item.highlight
                          ? 'text-white'
                          : 'text-[#1a2e1f]'
                        : item.highlight
                        ? 'text-[#ffc93c]'
                        : 'text-[#fbf3e0]'
                      : isActive
                      ? isOrange
                        ? 'text-[#ff7a2f]'
                        : 'text-[#1f4d2b]'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  aria-hidden="true"
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isRetro
                      ? 'border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] bg-[#ffc93c] text-[#1a2e1f]'
                      : isOrange
                      ? 'bg-orange-100 text-[#ff7a2f] border border-orange-200 font-bold'
                      : 'bg-emerald-100 text-[#1f4d2b] border border-emerald-200 font-bold'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Gamification / Streak Freeze Widget in Sidebar */}
      <div
        className={`p-3.5 m-3 space-y-2 transition-all ${
          isRetro
            ? 'rounded-2xl border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f] bg-[#ffeed0] text-[#1a2e1f]'
            : 'rounded-xl border border-slate-200 bg-slate-50 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`flex items-center gap-1.5 text-xs font-black ${
              isRetro ? 'text-[#1a2e1f]' : 'text-slate-800'
            }`}
          >
            <Flame
              className={`w-4 h-4 animate-pulse ${
                isOrange
                  ? 'fill-[#ff7a2f] text-[#ff7a2f]'
                  : 'fill-emerald-600 text-emerald-600'
              }`}
            />
            <span>Streak 7 Hari</span>
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
              isRetro
                ? 'text-[#1a2e1f] bg-[#bfe3f0] border-[1.5px] border-[#1a2e1f] shadow-[1px_1px_0px_#1a2e1f]'
                : 'text-slate-600 bg-slate-200/70 border border-slate-300'
            }`}
          >
            <Snowflake className="w-3 h-3 text-[#0a93c7]" />
            2 Freeze
          </span>
        </div>
        <p
          className={`text-[11px] leading-snug ${
            isRetro ? 'font-medium text-[#1a2e1f]/80' : 'text-slate-500'
          }`}
        >
          Selesaikan 1 habit atau task hari ini untuk menjaga api streak tetap menyala!
        </p>
        <Link
          href="/dashboard/productivity"
          className={`mt-2 w-full py-2 flex items-center justify-center gap-1.5 transition-all text-xs font-black ${
            isRetro
              ? 'bg-[#ffc93c] hover:bg-[#ffbe1a] text-[#1a2e1f] rounded-full border-[2px] border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a2e1f] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1a2e1f]'
              : isOrange
              ? 'bg-[#ff7a2f] hover:bg-[#e5651f] text-white rounded-lg shadow-xs'
              : 'bg-[#1f4d2b] hover:bg-[#173e21] text-white rounded-lg shadow-xs'
          }`}
        >
          <span>Buka Map Penuh</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}
