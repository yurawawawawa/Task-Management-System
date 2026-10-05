'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  TrendingUp,
  CalendarCheck2,
  CalendarDays,
  Sparkles,
  Snowflake,
  Kanban,
  Target,
  Trophy,
  Zap,
  Star,
} from 'lucide-react';
import { updateTaskStatus, createPersonalTask } from './actions';
import DeadlineCalendar from './DeadlineCalendar';
import type { Achievement } from '@/app/lib/achievements';
import TreklySelect from '@/app/components/TreklySelect';
import { TREKLY_PRIORITY_OPTIONS } from '@/app/components/treklySelectOptions';

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  dueDate?: string | null;
}

interface ActivityItem {
  date: string;
  count: number;
}

const PRIORITY_OPTIONS = TREKLY_PRIORITY_OPTIONS;

interface DashboardHomeClientProps {
  userName: string;
  tasks: TaskItem[];
  streakDays: number;
  freezeCount: number;
  weeklyCompletionRate: number;
  totalWeeklyTasks: number;
  completedWeeklyTasks: number;
  unlockedAchievements: Achievement[];
  activities: ActivityItem[];
}

function AchievementIcon({ icon }: { icon: Achievement['icon'] }) {
  if (icon === 'flame') return <Flame className="h-3.5 w-3.5" />;
  if (icon === 'sparkles') return <Sparkles className="h-3.5 w-3.5" />;
  if (icon === 'zap') return <Zap className="h-3.5 w-3.5" />;
  if (icon === 'star') return <Star className="h-3.5 w-3.5" />;
  return <Trophy className="h-3.5 w-3.5" />;
}

function formatTaskDeadline(dateValue: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`));
}

function TaskDeadlinePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;

    if (input.showPicker) {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex min-w-[142px] items-center justify-center gap-2 rounded-2xl border-2 border-border/80 bg-muted/60 px-3 py-2.5 text-xs font-bold text-foreground transition-colors hover:border-primary focus:outline-none focus:border-primary"
        aria-label={value ? `Deadline ${formatTaskDeadline(value)}` : 'Set deadline'}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
        <span>{value ? formatTaskDeadline(value) : 'Set deadline'}</span>
      </button>
      <input
        ref={inputRef}
        id="dashboard-task-due-date"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-label="Tanggal deadline"
      />
    </div>
  );
}

export default function DashboardHomeClient({
  userName,
  tasks: initialTasks,
  streakDays,
  freezeCount,
  weeklyCompletionRate,
  totalWeeklyTasks,
  completedWeeklyTasks,
  unlockedAchievements,
  activities,
}: DashboardHomeClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL');

  const completedTodayCount = tasks.filter((t) => t.status === 'DONE').length;
  const totalTasksCount = tasks.length;
  const recentActivities = activities
    .filter((activity) => activity.count > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await updateTaskStatus(task.id, nextStatus);
      router.refresh();
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
      const created = await createPersonalTask(newTaskTitle, newTaskPriority, undefined, newTaskDueDate || null);
      if (created) {
        setTasks((prev) => [created as any, ...prev]);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setIsSubmitting(false);
    }
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
          {unlockedAchievements.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5" aria-label="Achievement yang telah terbuka">
              <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Achievement
              </span>
              {unlockedAchievements.map((achievement) => (
                <span key={achievement.id} className="group relative">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-[#ff7a2f] shadow-2xs transition-transform group-hover:-translate-y-0.5"
                    aria-label={achievement.title}
                  >
                    <AchievementIcon icon={achievement.icon} />
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-48 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {achievement.title}
                  </span>
                </span>
              ))}
            </div>
          )}
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
              {freezeCount} Freeze Tersedia
            </span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tight">
            {streakDays} Hari
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
              {totalWeeklyTasks > 0 ? `${completedWeeklyTasks}/${totalWeeklyTasks}` : 'Belum ada data'}
            </span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tight">
            {weeklyCompletionRate}%
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Completion Rate Minggu Ini
          </p>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total terselesaikan:</span>
            <span className="font-black text-foreground">{completedWeeklyTasks} task</span>
          </div>
        </div>
      </div>

      <DeadlineCalendar tasks={tasks} />

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
            <form onSubmit={handleCreateTask} className="mt-4 flex flex-col lg:flex-row gap-2.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Tambah task baru untuk hari ini..."
                className="flex-1 px-4 py-2.5 bg-muted/60 border-2 border-border/80 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-muted-foreground/70"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <TaskDeadlinePicker value={newTaskDueDate} onChange={setNewTaskDueDate} />
                <TreklySelect
                  value={newTaskPriority}
                  onChange={setNewTaskPriority}
                  options={PRIORITY_OPTIONS}
                  variant="priority"
                  ariaLabel="Task priority"
                  className="min-w-[132px] flex-1 sm:flex-none"
                />
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
                <span>Buka Tasks</span>
                <Kanban className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Real activity summary & Productivity Map shortcuts */}
        <div className="space-y-6">
          {/* Recent activity widget */}
          <div className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-[#ff7a2f]" />
                <h2 className="text-base font-black text-foreground">Aktivitas Terbaru</h2>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20">
                {recentActivities.length} hari
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Ringkasan ini berasal dari task yang terselesaikan dan tercatat di database.
            </p>

            <div className="mt-4 space-y-2">
              {recentActivities.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                  Belum ada aktivitas tercatat.
                </div>
              ) : recentActivities.map((activity) => (
                <div key={activity.date} className="flex items-center justify-between p-3 rounded-2xl border-2 border-border bg-muted/20">
                  <span className="text-xs font-extrabold text-foreground">{activity.date}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#ff7a2f]">
                    <CheckCircle2 className="w-3 h-3" />
                    {activity.count} task
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/habits"
              className="mt-4 w-full py-2.5 bg-muted hover:bg-muted-hover text-foreground font-black text-xs rounded-2xl border border-border flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Lihat Semua Aktivitas</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Standalone Feature Teaser: Productivity Map */}
          <div className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs">
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Productivity Map
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Pantau peta konsistensi produktivitasmu seperti GitHub contribution graph, cek histori streak, dan gunakan streak freeze jika perlu istirahat.
            </p>

            <Link
              href="/dashboard/productivity"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#ff7a2f] hover:bg-[#e66922] text-white font-black text-xs rounded-2xl transition-colors shadow-xs"
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
