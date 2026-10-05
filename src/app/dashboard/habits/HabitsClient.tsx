'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarCheck2, Flame, Plus, Check, Trash2, ArrowRight } from 'lucide-react';
import { createHabit, deleteHabit, toggleHabitCompletion } from '../actions';
import TreklySelect from '@/app/components/TreklySelect';

interface HabitCompletion { id: string; date: string; }
interface Habit { id: string; title: string; category: string; frequency: string; completions: HabitCompletion[]; }
interface Task { id: string; title: string; status: string; updatedAt: string; }

const WEEK_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HABIT_CATEGORY_OPTIONS = [
  { value: 'Produktivitas', label: 'Produktivitas' },
  { value: 'Kesehatan', label: 'Kesehatan' },
  { value: 'Skill', label: 'Skill' },
  { value: 'Mindset', label: 'Mindset' },
];

export default function HabitsClient({ habits: initialHabits, tasks, todayStr, currentStreak }: { habits: Habit[]; tasks: Task[]; todayStr: string; currentStreak: number }) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Produktivitas');
  const [busyId, setBusyId] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const today = new Date(`${todayStr}T12:00:00`);
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    return WEEK_DAYS.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return { label, dateStr, isToday: dateStr === todayStr };
    });
  }, [todayStr]);

  const completedToday = habits.filter((habit) => habit.completions.some((completion) => completion.date === todayStr)).length;
  const totalCompletions = habits.reduce((total, habit) => total + habit.completions.length, 0);
  const recentTasks = tasks.filter((task) => task.status === 'DONE').slice(0, 5);

  const isCompleted = (habit: Habit, date: string) => habit.completions.some((completion) => completion.date === date);

  const handleToggle = async (habit: Habit, date: string) => {
    if (busyId) return;
    const completed = !isCompleted(habit, date);
    setBusyId(`${habit.id}:${date}`);
    setHabits((previous) => previous.map((item) => item.id !== habit.id ? item : {
      ...item,
      completions: completed
        ? [...item.completions, { id: `pending-${date}`, date }]
        : item.completions.filter((completion) => completion.date !== date),
    }));
    try {
      await toggleHabitCompletion(habit.id, date, completed);
      router.refresh();
    } catch (error) {
      console.error('Failed to toggle habit completion', error);
      setHabits(initialHabits);
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim() || busyId) return;
    setBusyId('new');
    try {
      const habit = await createHabit(newTitle, newCategory);
      setHabits((previous) => [...previous, { ...habit, completions: [] }]);
      setNewTitle('');
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to create habit', error);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (busyId) return;
    setBusyId(habitId);
    try {
      await deleteHabit(habitId);
      setHabits((previous) => previous.filter((habit) => habit.id !== habitId));
      router.refresh();
    } catch (error) {
      console.error('Failed to delete habit', error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3"><CalendarCheck2 className="w-3.5 h-3.5" /><span>Personal Habit Tracker</span></div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Habits</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">Buat rutinitasmu sendiri, lalu checklist setiap hari. Semua completion tersimpan di database dan ikut memengaruhi streak.</p>
          </div>
          <button type="button" onClick={() => setIsAdding((value) => !value)} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary-hover transition-all shadow-xs"><Plus className="w-4 h-4 stroke-[3]" />Tambah Habit</button>
        </div>
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Summary label="Selesai Hari Ini" value={`${completedToday} / ${habits.length}`} detail="Habit yang sudah dicentang" tone="amber" />
          <Summary label="Streak saat ini" value={`${currentStreak} hari`} detail="Gabungan task dan habit" tone="emerald" />
          <Summary label="Total completion" value={`${totalCompletions}`} detail="Semua checklist tersimpan" tone="sky" />
        </div>
      </div>

      {isAdding && <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs space-y-4"><div className="flex items-center justify-between"><h2 className="font-black text-foreground">Buat habit baru</h2><button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold text-muted-foreground">Tutup</button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Contoh: Baca buku 15 menit" className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary" autoFocus /><TreklySelect value={newCategory} onChange={setNewCategory} options={HABIT_CATEGORY_OPTIONS} ariaLabel="Kategori habit" className="w-full" /></div><div className="flex justify-end"><button type="submit" disabled={!newTitle.trim() || busyId === 'new'} className="px-5 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground disabled:opacity-50">Simpan Habit</button></div></form>}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between pb-6 border-b border-border min-w-[600px]"><div><h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2"><CalendarCheck2 className="w-5 h-5 text-[#ff7a2f]" />Pelacak Mingguan</h2><p className="text-xs text-muted-foreground mt-0.5">Klik hari untuk menyimpan atau membatalkan completion.</p></div><span className="text-xs font-bold text-muted-foreground">{todayStr}</span></div>
        <div className="min-w-[600px] mt-4"><div className="grid grid-cols-12 gap-2 text-xs font-black text-muted-foreground py-2 border-b border-border"><div className="col-span-5">Nama Habit</div><div className="col-span-5 grid grid-cols-7 text-center">{weekDays.map((day) => <span key={day.dateStr} className={day.isToday ? 'text-[#ff7a2f] underline underline-offset-4' : ''}>{day.label}</span>)}</div><div className="col-span-2 text-right pr-2">Streak</div></div>
          <div className="divide-y divide-border">{habits.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Belum ada habit. Tambahkan habit pertamamu di atas.</p> : habits.map((habit) => { const habitDates = new Set(habit.completions.map((completion) => completion.date)); const streak = calculateHabitStreak(habitDates, todayStr); return <div key={habit.id} className="grid grid-cols-12 gap-2 py-4 items-center group"><div className="col-span-5 flex items-center gap-3 pr-2"><button type="button" onClick={() => handleDelete(habit.id)} disabled={busyId === habit.id} className="text-muted-foreground/40 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30" title="Hapus habit"><Trash2 className="w-4 h-4" /></button><div className="min-w-0"><p className="text-sm font-extrabold text-foreground truncate">{habit.title}</p><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{habit.category} · {habit.frequency === 'DAILY' ? 'Setiap Hari' : habit.frequency}</span></div></div><div className="col-span-5 grid grid-cols-7 gap-1">{weekDays.map((day) => { const done = habitDates.has(day.dateStr); const future = day.dateStr > todayStr; return <button key={day.dateStr} type="button" onClick={() => handleToggle(habit, day.dateStr)} disabled={future || busyId !== null} className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all ${done ? 'bg-[#ff7a2f] text-white shadow-2xs hover:scale-105' : day.isToday ? 'bg-muted/70 border-2 border-dashed border-[#ff7a2f] hover:bg-[#ff7a2f]/20' : 'bg-muted/40 border border-border/80 hover:bg-muted'} ${future ? 'opacity-40 cursor-not-allowed' : ''}`} title={`${day.label}: ${future ? 'Belum tersedia' : done ? 'Selesai' : 'Belum selesai'}`}>{done && <Check className="w-3.5 h-3.5 stroke-[3]" />}</button>; })}</div><div className="col-span-2 text-right pr-2"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#ff7a2f] font-black text-xs"><Flame className="w-3.5 h-3.5 fill-[#ff7a2f]" />{streak} Hari</span></div></div>; })}</div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs"><div className="flex items-center justify-between pb-4 border-b border-border"><div><h2 className="text-lg font-black text-foreground">Task selesai terbaru</h2><p className="text-xs text-muted-foreground mt-0.5">Task tetap menjadi sumber aktivitas produktif yang sama.</p></div><Link href="/dashboard/productivity" className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline">Productivity Map <ArrowRight className="w-3.5 h-3.5" /></Link></div><div className="mt-5 space-y-2">{recentTasks.length === 0 ? <p className="p-5 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">Belum ada task selesai.</p> : recentTasks.map((task) => <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl border-2 border-border"><span className="text-sm font-extrabold text-foreground truncate">{task.title}</span><span className="text-[10px] font-black text-emerald-700 shrink-0 ml-3">{task.updatedAt.slice(0, 10)}</span></div>)}</div></div>
    </div>
  );
}

function calculateHabitStreak(completedDates: Set<string>, todayStr: string) {
  let streak = 0;
  const cursor = new Date(`${todayStr}T12:00:00`);
  while (completedDates.has(formatDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function Summary({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'amber' | 'emerald' | 'sky' }) {
  const styles = { amber: 'bg-amber-50/50 border-amber-200 text-[#1a2e1f]', emerald: 'bg-emerald-50/50 border-emerald-200 text-emerald-900', sky: 'bg-sky-50/50 border-sky-200 text-sky-950' }[tone];
  return <div className={`p-4 rounded-2xl border ${styles}`}><span className="text-[11px] font-black uppercase">{label}</span><div className="text-2xl font-black mt-1">{value}</div><span className="text-xs text-muted-foreground font-semibold">{detail}</span></div>;
}
