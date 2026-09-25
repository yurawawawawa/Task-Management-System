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
  ArrowRight
} from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Menu Navigation Items */}
      <div className="space-y-2 px-3 py-4">
        <div className="px-3 pb-1 text-[11px] font-black uppercase tracking-wider text-[#ffc93c]">
          Menu Utama
        </div>

        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                isActive
                  ? item.highlight
                    ? 'bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] translate-x-1'
                    : 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] translate-x-1'
                  : item.highlight
                  ? 'text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]'
                  : 'text-[#fbf3e0]/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-[#1a2e1f]'
                      : item.highlight
                      ? 'text-[#ffc93c]'
                      : 'text-[#fbf3e0]'
                  }`}
                  aria-hidden="true"
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] ${
                    isActive
                      ? 'bg-[#ffc93c] text-[#1a2e1f]'
                      : 'bg-[#ffc93c] text-[#1a2e1f]'
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
      <div className="p-3.5 m-3 rounded-2xl border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f] bg-[#ffeed0] text-[#1a2e1f] space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-black text-[#1a2e1f]">
            <Flame className="w-4 h-4 fill-[#ff7a2f] text-[#ff7a2f] animate-pulse" />
            <span>Streak 7 Hari</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] font-black text-[#1a2e1f] bg-[#bfe3f0] px-2 py-0.5 rounded-full border-[1.5px] border-[#1a2e1f] shadow-[1px_1px_0px_#1a2e1f]">
            <Snowflake className="w-3 h-3 text-[#0a93c7]" />
            2 Freeze
          </span>
        </div>
        <p className="text-[11px] font-medium text-[#1a2e1f]/80 leading-snug">
          Selesaikan 1 habit atau task hari ini untuk menjaga api streak tetap menyala!
        </p>
        <Link
          href="/dashboard/productivity"
          className="mt-2 w-full py-2 bg-[#ffc93c] hover:bg-[#ffbe1a] text-[#1a2e1f] font-black text-xs rounded-full border-[2px] border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a2e1f] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1a2e1f] flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Buka Map Penuh</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}
