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
      <div className="space-y-1.5 px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
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
              className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                isActive
                  ? item.highlight
                    ? 'bg-[#ff7a2f] text-white shadow-sm'
                    : 'bg-primary text-primary-foreground shadow-sm'
                  : item.highlight
                  ? 'text-foreground hover:bg-[#ff7a2f]/10 hover:text-[#ff7a2f]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    item.highlight && !isActive
                      ? 'text-[#ff7a2f]'
                      : ''
                  }`}
                  aria-hidden="true"
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/40'
                      : 'bg-[#ff7a2f]/15 text-[#ff7a2f] border-[#ff7a2f]/30'
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
      <div className="p-3 m-3 rounded-2xl border-2 border-border bg-gradient-to-br from-amber-50/80 to-orange-50/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-black text-[#ff7a2f]">
            <Flame className="w-4 h-4 fill-[#ff7a2f]" />
            Streak 7 Hari
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
            <Snowflake className="w-3 h-3 text-sky-600" />
            2 Freeze
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Selesaikan 1 habit atau task hari ini untuk menjaga api streak tetap menyala!
        </p>
        <Link
          href="/dashboard/productivity"
          className="mt-3 w-full py-2 bg-white hover:bg-amber-100/60 text-[#1a2e1f] font-extrabold text-xs rounded-xl border border-border flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Buka Map Penuh</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
