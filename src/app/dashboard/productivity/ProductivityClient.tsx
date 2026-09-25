'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Snowflake,
  Sparkles,
  Trophy,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatIndonesianDate } from '@/app/lib/streaks';

interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ProductivityClientProps {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalCompleted: number;
  freezeCount?: number;
  activities: ActivityDay[];
  todayStr: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function ProductivityClient({
  currentStreak,
  longestStreak,
  totalActiveDays,
  totalCompleted,
  freezeCount: initialFreezeCount = 2,
  activities,
  todayStr,
}: ProductivityClientProps) {
  const [freezeCount, setFreezeCount] = useState(initialFreezeCount);
  const [freezeActiveToday, setFreezeActiveToday] = useState(false);
  const [isUpdatingFreeze, setIsUpdatingFreeze] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'3M' | '6M' | '1Y'>('6M');
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);

  // Floating tooltip state
  const [tooltip, setTooltip] = useState<{ day: ActivityDay; x: number; y: number } | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsTooltipVisible(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleCellMouseEnter = (day: ActivityDay, e: React.MouseEvent<HTMLDivElement>) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltip({
      day,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setIsTooltipVisible(true);
  };

  const handleCellMouseLeave = () => {
    setHoveredDay(null);
    setIsTooltipVisible(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip(null);
    }, 200);
  };

  const handleUseFreeze = async () => {
    if (isUpdatingFreeze) return;
    const willActivate = !freezeActiveToday;
    if (willActivate && freezeCount <= 0) return;

    setFreezeActiveToday(willActivate);
    setFreezeCount((prev) => (willActivate ? Math.max(0, prev - 1) : Math.min(3, prev + 1)));

    setIsUpdatingFreeze(true);
    try {
      const res = await fetch('/api/productivity/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: willActivate ? 'use' : 'cancel' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.freezeCount === 'number') {
          setFreezeCount(data.freezeCount);
        }
      }
    } catch (err) {
      console.error('Failed to update freeze:', err);
    } finally {
      setIsUpdatingFreeze(false);
    }
  };

  // Filter activities based on selected range
  const daysLimit = selectedRange === '3M' ? 91 : selectedRange === '6M' ? 182 : 364;
  const filteredActivities = activities.slice(-daysLimit);

  // Group into columns of 7 days (Monday to Sunday)
  const weeks: ActivityDay[][] = [];
  let currentWeek: ActivityDay[] = [];
  filteredActivities.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    if (week.length === 0) return;
    const [y, m] = week[0].date.split('-').map(Number);
    const monthIndex = m - 1;
    if (monthIndex !== lastMonth) {
      monthLabels.push({ label: MONTH_NAMES[monthIndex], weekIndex: i });
      lastMonth = monthIndex;
    }
  });

  const achievements = [
    {
      id: 'a1',
      title: 'Penyulut Api',
      target: '3 Hari berturut-turut',
      unlocked: currentStreak >= 3 || longestStreak >= 3,
      progress: Math.min(100, Math.round((currentStreak / 3) * 100)),
      desc: 'Langkah awal memulai rutinitas produktif harian',
    },
    {
      id: 'a2',
      title: 'Konsistensi Mingguan',
      target: '7 Hari berturut-turut',
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
      desc: 'Menuntaskan satu pekan penuh tanpa jeda',
    },
    {
      id: 'a3',
      title: 'Momentum Kuat',
      target: '14 Hari berturut-turut',
      unlocked: currentStreak >= 14 || longestStreak >= 14,
      progress: Math.min(100, Math.round((currentStreak / 14) * 100)),
      desc: 'Membangun kebiasaan produktif yang kokoh',
    },
    {
      id: 'a4',
      title: 'Master Rutinitas',
      target: '30 Hari berturut-turut',
      unlocked: currentStreak >= 30 || longestStreak >= 30,
      progress: Math.min(100, Math.round((currentStreak / 30) * 100)),
      desc: 'Bulan emas produktivitas tak terhentikan',
    },
    {
      id: 'a5',
      title: 'Klub Seratus Hari',
      target: '100 Hari berturut-turut',
      unlocked: currentStreak >= 100 || longestStreak >= 100,
      progress: Math.min(100, Math.round((currentStreak / 100) * 100)),
      desc: 'Legenda konsistensi dan fokus tanpa kompromi',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3">
              <Flame className="w-3.5 h-3.5 fill-[#ff7a2f]" />
              <span>Fitur Inti Trekly</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Productivity Map
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl leading-relaxed">
              Peta konsistensi personal kamu. Setiap task yang kamu selesaikan dan habit yang kamu centang direkam di sini untuk memvisualisasikan ritme kerjamu sepanjang waktu.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-amber-50 border-2 border-amber-200/80 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ff7a2f] text-white flex items-center justify-center">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#ff7a2f] tracking-wider block">
                  Streak Saat Ini
                </span>
                <span className="text-xl font-black text-[#1a2e1f]">
                  {currentStreak} Hari
                </span>
              </div>
            </div>

            <div className="bg-sky-50 border-2 border-sky-200/80 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block">
                  Streak Freeze
                </span>
                <span className="text-xl font-black text-sky-950">
                  {freezeCount} Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification: Streak Freeze Protection Card */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-6 sm:p-7 rounded-3xl border-2 border-sky-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-200 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-foreground tracking-tight">
                  Gamifikasi: Streak Freeze Shield
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-800">
                  Pelindung Api
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Istirahat sejenak tanpa rasa bersalah. Streak Freeze akan melindungi rantai streak kamu selama 24 jam penuh jika kamu berhalangan melakukan aktivitas produktif hari ini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleUseFreeze}
              disabled={freezeCount === 0 && !freezeActiveToday}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50 ${
                freezeActiveToday
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-white hover:bg-sky-100 text-sky-800 border-2 border-sky-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {freezeActiveToday
                  ? 'Freeze Aktif Hari Ini (Nonaktifkan)'
                  : 'Gunakan 1 Freeze Hari Ini'}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-sky-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>Kapasitas penyimpanan maksimum: 3 Streak Freeze.</span>
          </div>
          <span className="font-bold text-sky-900">
            Dapatkan +1 Freeze setiap konsisten 7 hari berturut-turut.
          </span>
        </div>
      </div>

      {/* Standalone Full Contribution Graph (GitHub-Style) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Peta Kontribusi Aktivitas
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Menampilkan {filteredActivities.length} hari rekaman aktivitas dan penyelesaian tugas
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl text-xs font-black self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedRange('3M')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedRange === '3M'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              3 Bulan
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('6M')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedRange === '6M'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              6 Bulan
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange('1Y')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedRange === '1Y'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              1 Tahun
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-6 overflow-x-auto pb-4">
          <div className="min-w-max">
            {/* Month labels */}
            <div className="flex text-xs font-bold text-muted-foreground ml-8 mb-2 h-4 relative">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${(m.weekIndex / Math.max(1, weeks.length)) * 100}%`,
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid rows */}
            <div className="flex gap-2">
              {/* Day of week labels */}
              <div className="flex flex-col justify-between text-[11px] font-bold text-muted-foreground w-6 py-1">
                <span>Sen</span>
                <span>Rab</span>
                <span>Jum</span>
              </div>

              {/* Grid cells */}
              <div className="flex gap-1.5">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((day) => {
                      const isToday = day.date === todayStr;
                      const levelBg = {
                        0: 'bg-[#f4efe6] hover:bg-[#e7e0d3]',
                        1: 'bg-[#bbf7d0] hover:bg-[#86efac]',
                        2: 'bg-[#4ade80] hover:bg-[#22c55e]',
                        3: 'bg-[#16a34a] hover:bg-[#15803d]',
                        4: 'bg-[#1f4d2b] hover:bg-[#153a20]',
                      }[day.level];

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => handleCellMouseEnter(day, e)}
                          onMouseLeave={handleCellMouseLeave}
                          className={`w-3.5 h-3.5 rounded-[4px] transition-all cursor-pointer ${levelBg} ${
                            isToday ? 'ring-2 ring-[#1f4d2b] ring-offset-1' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover tooltip / info bar */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-3">
              <div className="h-5 flex items-center">
                {hoveredDay ? (
                  <span className="font-extrabold text-foreground">
                    {formatIndonesianDate(hoveredDay.date)} —{' '}
                    {hoveredDay.count > 0
                      ? `${hoveredDay.count} task terselesaikan`
                      : 'Tidak ada task terselesaikan'}
                  </span>
                ) : (
                  <span>Arahkan kursor ke kotak untuk melihat detail harian.</span>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[11px]">Sedikit</span>
                <div className="w-3.5 h-3.5 rounded-[4px] bg-[#f4efe6] border border-border/40" title="0 task" />
                <div className="w-3.5 h-3.5 rounded-[4px] bg-[#bbf7d0]" title="1 task" />
                <div className="w-3.5 h-3.5 rounded-[4px] bg-[#4ade80]" title="2-3 task" />
                <div className="w-3.5 h-3.5 rounded-[4px] bg-[#16a34a]" title="4-5 task" />
                <div className="w-3.5 h-3.5 rounded-[4px] bg-[#1f4d2b]" title="6+ task" />
                <span className="text-[11px]">Banyak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tooltip with Smooth Fade Transition */}
        {tooltip && (
          <div
            className={`fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-200 ease-out ${
              isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 8}px`,
            }}
          >
            <div className="relative bg-[#1a2e1f] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-white/10 whitespace-nowrap">
              <span>
                {formatIndonesianDate(tooltip.day.date)} —{' '}
                {tooltip.day.count > 0
                  ? `${tooltip.day.count} task terselesaikan`
                  : 'Tidak ada task terselesaikan'}
              </span>
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#1a2e1f] rotate-45 border-r border-b border-white/10" />
            </div>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase block">
              Total Kontribusi
            </span>
            <span className="text-2xl font-black text-foreground tracking-tight mt-1 block">
              {totalCompleted}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
            <span className="text-[11px] font-bold text-[#ff7a2f] uppercase block">
              Streak Terpanjang
            </span>
            <span className="text-2xl font-black text-[#ff7a2f] tracking-tight mt-1 block">
              {longestStreak} Hari
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">
              Hari Aktif
            </span>
            <span className="text-2xl font-black text-emerald-800 tracking-tight mt-1 block">
              {totalActiveDays} Hari
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200">
            <span className="text-[11px] font-bold text-sky-700 uppercase block">
              Kebugaran Ritme
            </span>
            <span className="text-2xl font-black text-sky-800 tracking-tight mt-1 block">
              94%
            </span>
          </div>
        </div>
      </div>

      {/* Gamification Milestone & Badges Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Pencapaian & Milestone Streak
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Buka lencana konsistensi dengan mempertahankan ritme produktivitas harianmu
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                item.unlocked
                  ? 'bg-gradient-to-br from-amber-50/60 to-orange-50/60 border-amber-300 shadow-2xs'
                  : 'bg-muted/20 border-border opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      item.unlocked
                        ? 'bg-[#ff7a2f] text-white shadow-xs'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      item.unlocked
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {item.unlocked ? 'Tercapai' : `${item.progress}%`}
                  </span>
                </div>

                <h3 className="font-extrabold text-foreground text-base tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs font-bold text-[#ff7a2f] mt-0.5">{item.target}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80">
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      item.unlocked ? 'bg-emerald-600' : 'bg-[#ff7a2f]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
