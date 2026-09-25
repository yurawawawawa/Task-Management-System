'use client';

import { useState } from 'react';
import {
  CalendarCheck2,
  Flame,
  Plus,
  Check,
  RotateCcw,
  Trophy,
  Target,
  Sparkles,
  Trash2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { recordHabitCompletion } from '../actions';

interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  bestStreak: number;
  frequency: string;
  history: boolean[]; // 7 days (Mon to Sun)
}

const INITIAL_HABIT_DATA: Habit[] = [
  {
    id: 'h-1',
    title: 'Olahraga Pagi 20 Menit',
    category: 'Kesehatan',
    streak: 9,
    bestStreak: 15,
    frequency: 'Setiap Hari',
    history: [true, true, true, true, true, true, true],
  },
  {
    id: 'h-2',
    title: 'Belajar Coding & Review Code',
    category: 'Skill',
    streak: 7,
    bestStreak: 21,
    frequency: 'Hari Kerja',
    history: [true, true, true, true, true, false, false],
  },
  {
    id: 'h-3',
    title: 'Membaca Buku 15 Menit',
    category: 'Mindset',
    streak: 14,
    bestStreak: 14,
    frequency: 'Setiap Hari',
    history: [true, true, true, true, true, true, false],
  },
  {
    id: 'h-4',
    title: 'Minum Air Putih 2 Liter',
    category: 'Kesehatan',
    streak: 5,
    bestStreak: 30,
    frequency: 'Setiap Hari',
    history: [true, true, true, true, true, false, false],
  },
  {
    id: 'h-5',
    title: 'Journaling & Evaluasi Harian',
    category: 'Produktivitas',
    streak: 4,
    bestStreak: 10,
    frequency: 'Setiap Hari',
    history: [true, true, true, true, false, false, false],
  },
];

const WEEK_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function HabitsClient() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABIT_DATA);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Produktivitas');

  // Today is simulated as Saturday (index 5)
  const todayIndex = 5;

  const toggleDay = (habitId: string, dayIdx: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newHistory = [...h.history];
        newHistory[dayIdx] = !newHistory[dayIdx];
        const isCurrentToggled = dayIdx === todayIndex;
        let newStreak = h.streak;
        if (isCurrentToggled) {
          const isDone = newHistory[dayIdx];
          newStreak = isDone ? h.streak + 1 : Math.max(0, h.streak - 1);
          recordHabitCompletion(isDone ? 'increment' : 'decrement').catch(console.error);
        }
        return {
          ...h,
          history: newHistory,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
        };
      })
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      streak: 0,
      bestStreak: 0,
      frequency: 'Setiap Hari',
      history: [false, false, false, false, false, false, false],
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const completedTodayCount = habits.filter((h) => h.history[todayIndex]).length;
  const todayRate = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Personal Habit Tracker</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Habits
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Bangun rutinitas yang konsisten. Setiap habit yang kamu tuntaskan terhubung langsung ke Productivity Map untuk menyalakan streak harianmu!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary-hover transition-all shadow-xs active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Habit</span>
          </button>
        </div>

        {/* Quick Summary Cards */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
            <span className="text-[11px] font-black uppercase text-[#ff7a2f]">
              Selesai Hari Ini
            </span>
            <div className="text-2xl font-black text-[#1a2e1f] mt-1">
              {completedTodayCount} / {habits.length}
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              {todayRate}% target hari ini tercapai
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <span className="text-[11px] font-black uppercase text-emerald-700">
              Streak Habit Tertinggi
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1 flex items-center gap-1.5">
              <Flame className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              <span>14 Hari</span>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Membaca Buku 15 Menit
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200">
            <span className="text-[11px] font-black uppercase text-sky-700">
              Sinergi Ekosistem
            </span>
            <div className="text-2xl font-black text-sky-950 mt-1">
              100% Terhubung
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Menyumbang poin ke Productivity Map
            </span>
          </div>
        </div>
      </div>

      {/* Add Habit Form Modal/Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddHabit}
          className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-foreground text-base">Buat Habit Harian Baru</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Nama Kebiasaan
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Misal: Meditasi 10 menit, Jalan santai..."
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Kategori
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-xs font-black focus:outline-none focus:border-primary"
              >
                <option value="Produktivitas">Produktivitas</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Skill">Skill & Karir</option>
                <option value="Mindset">Mindset</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              Simpan Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit Weekly Matrix Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between pb-6 border-b border-border min-w-[600px]">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-[#ff7a2f]" />
              Pelacak Mingguan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Klik kotak hari untuk mencatat atau membatalkan checklist harianmu
            </p>
          </div>

          <div className="text-xs font-bold text-muted-foreground">
            Hari Ini: <span className="text-foreground font-black">Sabtu</span>
          </div>
        </div>

        {/* Matrix Header */}
        <div className="min-w-[600px] mt-4">
          <div className="grid grid-cols-12 gap-2 text-xs font-black text-muted-foreground py-2 border-b border-border">
            <div className="col-span-5">Nama Kebiasaan</div>
            <div className="col-span-5 grid grid-cols-7 text-center">
              {WEEK_DAYS.map((day, idx) => (
                <span
                  key={day}
                  className={idx === todayIndex ? 'text-[#ff7a2f] font-black underline underline-offset-4' : ''}
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="col-span-2 text-right pr-2">Streak</div>
          </div>

          {/* Matrix Rows */}
          <div className="divide-y divide-border">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="grid grid-cols-12 gap-2 py-4 items-center group hover:bg-muted/10 transition-colors"
              >
                {/* Habit Title & Tag */}
                <div className="col-span-5 flex items-center gap-3 pr-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-muted-foreground/40 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-foreground truncate">
                      {habit.title}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {habit.category} &middot; {habit.frequency}
                    </span>
                  </div>
                </div>

                {/* 7-Day Interactive Checks */}
                <div className="col-span-5 grid grid-cols-7 gap-1">
                  {habit.history.map((isDone, dIdx) => {
                    const isToday = dIdx === todayIndex;
                    return (
                      <button
                        key={dIdx}
                        type="button"
                        onClick={() => toggleDay(habit.id, dIdx)}
                        className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all focus-visible:outline-none ${
                          isDone
                            ? 'bg-[#ff7a2f] text-white shadow-2xs hover:scale-105'
                            : isToday
                            ? 'bg-muted/70 border-2 border-dashed border-[#ff7a2f] hover:bg-[#ff7a2f]/20'
                            : 'bg-muted/40 border border-border/80 hover:bg-muted'
                        }`}
                        title={`${WEEK_DAYS[dIdx]}: ${isDone ? 'Selesai' : 'Belum selesai'}`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Habit Streak Badge */}
                <div className="col-span-2 text-right pr-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#ff7a2f] font-black text-xs">
                    <Flame className="w-3.5 h-3.5 fill-[#ff7a2f]" />
                    <span>{habit.streak} Hari</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Callout */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Sparkles className="w-4 h-4 text-[#ff7a2f] shrink-0" />
            <span>
              Semua habit di atas otomatis menyumbang poin ke kalender Productivity Map kamu.
            </span>
          </div>

          <Link
            href="/dashboard/productivity"
            className="inline-flex items-center gap-1 font-black text-[#ff7a2f] hover:underline underline-offset-4 self-start sm:self-auto shrink-0"
          >
            <span>Lihat Dampak di Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
