'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  TrendingUp,
  CalendarCheck2,
  Sparkles,
  Snowflake,
  Clock,
  Kanban,
  Check,
  Target
} from 'lucide-react';
import { updateTaskStatus, createPersonalTask } from './actions';

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface HabitItem {
  id: string;
  name: string;
  category: string;
  streak: number;
  completedToday: boolean;
}

interface DashboardHomeClientProps {
  userName: string;
  tasks: TaskItem[];
  streakDays: number;
  weeklyCompletionRate: number;
  totalWeeklyTasks: number;
  completedWeeklyTasks: number;
}

const INITIAL_HABITS: HabitItem[] = [
  { id: 'h1', name: 'Olahraga Pagi 20 Menit', category: 'Kesehatan', streak: 9, completedToday: true },
  { id: 'h2', name: 'Belajar Coding & Refactor Code', category: 'Skill', streak: 7, completedToday: true },
  { id: 'h3', name: 'Membaca Buku 15 Menit', category: 'Mindset', streak: 14, completedToday: false },
  { id: 'h4', name: 'Minum Air Putih 2 Liter', category: 'Kesehatan', streak: 5, completedToday: true },
  { id: 'h5', name: 'Review Catatan & Refleksi', category: 'Mindset', streak: 4, completedToday: false },
];

export default function DashboardHomeClient({
  userName,
  tasks: initialTasks,
  streakDays,
  weeklyCompletionRate,
  totalWeeklyTasks,
  completedWeeklyTasks,
}: DashboardHomeClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL');

  const completedTodayCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalTasksCount = tasks.length;
  const completedHabitsCount = habits.filter((h) => h.completedToday).length;

  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await updateTaskStatus(task.id, nextStatus);
    } catch (err) {
      console.error('Failed to update task status', err);
      // rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createPersonalTask(newTaskTitle, newTaskPriority);
      if (created) {
        setTasks((prev) => [created as any, ...prev]);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE') return t.status !== 'DONE';
    if (filter === 'DONE') return t.status === 'DONE';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Greeting & Motivation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fokus Personal Hari Ini</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Halo, {userName || 'Kawan'}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Lanjutkan momentum produktifmu hari ini. Setiap task dan habit kecil yang kamu selesaikan akan menjaga api streak tetap berkobar!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/productivity"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#ff7a2f] hover:bg-[#e66922] text-white font-black text-xs transition-all shadow-sm active:scale-95"
          >
            <Flame className="w-4 h-4 fill-white" />
            <span>Productivity Map</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid: 3 Essential Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Streak Saat Ini */}
        <div className="bg-white p-5 rounded-3xl border-2 border-border shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-[#ff7a2f] flex items-center justify-center border border-[#ff7a2f]/20">
              <Flame className="w-5 h-5 fill-[#ff7a2f]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
              <Snowflake className="w-3 h-3 text-sky-600" />
              2 Freeze Aktif
            </span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tight">
            {streakDays || 7} Hari
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Streak Saat Ini &middot; Api Menyala
          </p>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Milestone berikutnya:</span>
            <span className="font-black text-[#ff7a2f]">14 Hari</span>
          </div>
        </div>

        {/* Card 2: Task Hari Ini */}
        <div className="bg-white p-5 rounded-3xl border-2 border-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Hari Ini
            </span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tight">
            {completedTodayCount} <span className="text-lg font-bold text-muted-foreground">/ {totalTasksCount}</span>
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Task Selesai Hari Ini
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${totalTasksCount > 0 ? (completedTodayCount / totalTasksCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Completion Rate Minggu Ini */}
        <div className="bg-white p-5 rounded-3xl border-2 border-border shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-700 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +8% vs Lalu
            </span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tight">
            {weeklyCompletionRate || 85}%
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Completion Rate Minggu Ini
          </p>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total terselesaikan:</span>
            <span className="font-black text-foreground">{completedWeeklyTasks || 12} task</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Tasks Hari Ini & Habits Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Task Hari Ini Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Task Hari Ini
                </h2>
                <p className="text-xs text-muted-foreground">
                  Daftar prioritas tugas yang perlu dituntaskan hari ini
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filter === 'ALL'
                      ? 'bg-white text-foreground shadow-2xs font-extrabold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Semua ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('ACTIVE')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filter === 'ACTIVE'
                      ? 'bg-white text-foreground shadow-2xs font-extrabold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Aktif ({tasks.filter((t) => t.status !== 'DONE').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('DONE')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filter === 'DONE'
                      ? 'bg-white text-foreground shadow-2xs font-extrabold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Selesai ({tasks.filter((t) => t.status === 'DONE').length})
                </button>
              </div>
            </div>

            {/* Quick Add Task Input */}
            <form onSubmit={handleCreateTask} className="mt-4 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Tambah task baru untuk hari ini..."
                className="flex-1 px-4 py-2.5 bg-muted/60 border-2 border-border/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-muted-foreground/70"
              />
              <div className="flex gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="px-3 py-2.5 bg-muted/60 border-2 border-border/80 rounded-2xl text-xs font-black focus:outline-none focus:border-primary"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTaskTitle.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:bg-primary-hover disabled:opacity-50 transition-all shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambah</span>
                </button>
              </div>
            </form>

            {/* Tasks List */}
            <div className="mt-5 space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl">
                  <p className="text-sm font-bold text-muted-foreground">
                    Tidak ada task dalam daftar ini.
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Ketik tugas baru di atas atau buka Papan Kanban untuk manajemen lengkap.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  const priorityStyles = {
                    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
                    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
                    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
                    URGENT: 'bg-red-50 text-red-700 border-red-200',
                  }[task.priority || 'MEDIUM'];

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all group ${
                        isDone
                          ? 'bg-muted/30 border-border/60 opacity-75'
                          : 'bg-white border-border hover:border-primary/40 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none"
                          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-extrabold tracking-tight truncate ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${priorityStyles}`}
                        >
                          {task.priority || 'MED'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Link to Full Board */}
            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">
                Pindah kolom Todo / In Progress / Done?
              </span>
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-1 font-black text-primary hover:underline underline-offset-4"
              >
                <span>Buka Tasks & Board</span>
                <Kanban className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Daily Habits & Productivity Map Shortcuts */}
        <div className="space-y-6">
          {/* Habits Daily Checklist Widget */}
          <div className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-[#ff7a2f]" />
                <h2 className="text-base font-black text-foreground">Habit Hari Ini</h2>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20">
                {completedHabitsCount} / {habits.length}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Checklist kebiasaan harian. Setiap centang ikut menyumbang ke skor Productivity Map!
            </p>

            <div className="mt-4 space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    habit.completedToday
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-muted/20 border-border hover:border-[#ff7a2f]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        habit.completedToday
                          ? 'bg-[#ff7a2f] border-[#ff7a2f] text-white'
                          : 'border-muted-foreground/50 bg-white'
                      }`}
                    >
                      {habit.completedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs font-extrabold truncate ${
                        habit.completedToday
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#ff7a2f] shrink-0">
                    <Flame className="w-3 h-3 fill-[#ff7a2f]" />
                    {habit.streak}d
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/habits"
              className="mt-4 w-full py-2.5 bg-muted hover:bg-muted-hover text-foreground font-black text-xs rounded-2xl border border-border flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Kelola Semua Habit</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Standalone Feature Teaser: Productivity Map */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-emerald-500/10 p-6 rounded-3xl border-2 border-border shadow-xs">
            <div className="flex items-center gap-2 text-[#ff7a2f] font-black text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Fitur Unggulan</span>
            </div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Productivity Map
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Pantau peta konsistensi produktivitasmu seperti GitHub contribution graph, cek histori streak, dan gunakan streak freeze jika perlu istirahat.
            </p>

            <Link
              href="/dashboard/productivity"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#1a2e1f] hover:bg-[#2d6a3e] text-white font-extrabold text-xs rounded-2xl transition-colors shadow-sm"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Buka Visualisasi Penuh</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
