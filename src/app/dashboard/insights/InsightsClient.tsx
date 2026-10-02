'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Clock, Flame, Layers, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

type Period = '30D' | '90D' | '1Y';
interface InsightTask { status: string; priority: string; createdAt: string; updatedAt: string; }
interface InsightActivity { date: string; count: number; }
interface InsightsClientProps { tasks: InsightTask[]; activities: InsightActivity[]; todayStr: string; }

const PRIORITY_COLORS: Record<string, string> = { URGENT: 'bg-red-600', HIGH: 'bg-[#ff7a2f]', MEDIUM: 'bg-blue-600', LOW: 'bg-slate-400' };
const PRIORITY_LABELS: Record<string, string> = { URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

export default function InsightsClient({ tasks, activities, todayStr }: InsightsClientProps) {
  const [period, setPeriod] = useState<Period>('30D');
  const data = useMemo(() => {
    const periodDays = period === '30D' ? 30 : period === '90D' ? 90 : 365;
    const end = new Date(`${todayStr}T23:59:59`);
    const start = new Date(end); start.setDate(start.getDate() - periodDays + 1);
    const previousStart = new Date(start); previousStart.setDate(previousStart.getDate() - periodDays);
    const inRange = (value: string, from: Date, to: Date) => { const date = new Date(value); return date >= from && date <= to; };
    const scopedTasks = tasks.filter((task) => inRange(task.createdAt, start, end));
    const completedTasks = scopedTasks.filter((task) => task.status === 'DONE' && inRange(task.updatedAt, start, end));
    const previousTasks = tasks.filter((task) => inRange(task.createdAt, previousStart, start));
    const previousCompleted = previousTasks.filter((task) => task.status === 'DONE' && inRange(task.updatedAt, previousStart, start));
    const completionRate = scopedTasks.length ? Math.round((completedTasks.length / scopedTasks.length) * 100) : 0;
    const previousRate = previousTasks.length ? Math.round((previousCompleted.length / previousTasks.length) * 100) : 0;
    const rateDelta = completionRate - previousRate;
    const hours = [6, 8, 10, 12, 14, 16, 18, 20];
    const hourlyData = hours.map((hour) => ({ hour: `${String(hour).padStart(2, '0')}:00`, count: completedTasks.filter((task) => { const taskHour = new Date(task.updatedAt).getHours(); return taskHour >= hour && taskHour < hour + 2; }).length }));
    const maxHourly = Math.max(1, ...hourlyData.map((item) => item.count));
    const peakHour = hourlyData.reduce((peak, item) => item.count > peak.count ? item : peak, hourlyData[0]);
    const priorityCounts = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => ({ name: PRIORITY_LABELS[priority], count: completedTasks.filter((task) => task.priority === priority).length, color: PRIORITY_COLORS[priority] }));
    const totalPriorityCount = priorityCounts.reduce((sum, item) => sum + item.count, 0);
    const priorityDistribution = priorityCounts.map((item) => ({ ...item, percentage: totalPriorityCount ? Math.round((item.count / totalPriorityCount) * 100) : 0 }));
    const weeklyTrend = Array.from({ length: 4 }, (_, index) => {
      const weekEnd = new Date(end); weekEnd.setDate(end.getDate() - (3 - index) * 7);
      const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6);
      const weekTasks = tasks.filter((task) => inRange(task.createdAt, weekStart, weekEnd));
      const weekCompleted = weekTasks.filter((task) => task.status === 'DONE' && inRange(task.updatedAt, weekStart, weekEnd)).length;
      return { week: index === 3 ? 'Pekan ini' : `Pekan ${index + 1}`, tasks: weekCompleted, rate: weekTasks.length ? Math.round((weekCompleted / weekTasks.length) * 100) : 0, active: index === 3 };
    });
    const activeDays = activities.filter((activity) => { const date = new Date(`${activity.date}T12:00:00`); return activity.count > 0 && date >= start && date <= end; }).length;
    return { periodDays, scopedTasks, completedTasks, completionRate, rateDelta, hourlyData, maxHourly, peakHour, priorityDistribution, weeklyTrend, activeDays, consistencyScore: Math.round((activeDays / periodDays) * 100) };
  }, [activities, period, tasks, todayStr]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3"><TrendingUp className="w-3.5 h-3.5" /><span>Data aktivitas tersimpan</span></div><h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Insights & Analytics</h1><p className="text-muted-foreground text-sm mt-1 max-w-xl">Semua angka dihitung dari task dan aktivitas milik akunmu.</p></div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl text-xs font-black self-start md:self-auto">{(['30D', '90D', '1Y'] as Period[]).map((value) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`px-3 py-1.5 rounded-xl transition-all ${period === value ? 'bg-white text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}>{value === '30D' ? '30 Hari' : value === '90D' ? '90 Hari' : '1 Tahun'}</button>)}</div>
        </div>
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi title="Completion Rate" value={`${data.completionRate}%`} detail={`${data.completedTasks.length} dari ${data.scopedTasks.length} task selesai`} badge={`${data.rateDelta >= 0 ? '+' : ''}${data.rateDelta}%`} tone="amber" />
          <Kpi title="Hari Aktif" value={`${data.activeDays}`} detail={`Dalam ${data.periodDays} hari terakhir`} badge="Database" tone="emerald" />
          <Kpi title="Jam Produktif" value={data.completedTasks.length ? data.peakHour.hour : '—'} detail={`${data.peakHour.count} task pada slot ini`} badge="Puncak" tone="blue" />
          <Kpi title="Skor Konsistensi" value={`${Math.min(100, data.consistencyScore)} / 100`} detail="Hari dengan aktivitas tercatat" badge="Aktual" tone="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs flex flex-col justify-between"><div><div className="flex items-center justify-between pb-4 border-b border-border"><div><h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Jam Paling Produktif</h2><p className="text-xs text-muted-foreground">Task selesai berdasarkan waktu update</p></div><span className="text-xs font-black text-[#ff7a2f] bg-[#ff7a2f]/10 px-2 py-1 rounded-full border border-[#ff7a2f]/20">Puncak: {data.completedTasks.length ? data.peakHour.hour : '—'}</span></div><div className="mt-8 flex items-end justify-between gap-2 h-44 px-2 pb-2 border-b border-border">{data.hourlyData.map((item) => <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"><div className="text-[10px] font-black text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{item.count}</div><div className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${item.count === data.peakHour.count && item.count > 0 ? 'bg-[#ff7a2f] shadow-2xs ring-2 ring-[#ff7a2f]/40' : 'bg-muted-hover hover:bg-primary/40'}`} style={{ height: `${Math.max(3, (item.count / data.maxHourly) * 100)}%` }} /><span className="text-[10px] font-black text-muted-foreground">{item.hour}</span></div>)}</div></div><div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs"><span className="font-extrabold text-foreground block mb-0.5">Ringkasan:</span><p className="text-muted-foreground leading-relaxed">{data.completedTasks.length ? `Sebagian besar task selesai pada slot ${data.peakHour.hour}.` : 'Belum ada task selesai pada periode ini.'}</p></div></div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs flex flex-col justify-between"><div><div className="flex items-center justify-between pb-4 border-b border-border"><div><h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2"><Flame className="w-5 h-5 text-[#ff7a2f] fill-[#ff7a2f]" />Tren Penyelesaian</h2><p className="text-xs text-muted-foreground">Empat pekan terakhir dari data task</p></div><span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">Aktual</span></div><div className="mt-6 space-y-4">{data.weeklyTrend.map((week) => <div key={week.week} className="space-y-1.5"><div className="flex justify-between items-center text-xs"><span className={`font-black ${week.active ? 'text-[#ff7a2f]' : 'text-foreground'}`}>{week.week}</span><span className="text-muted-foreground font-semibold">{week.tasks} task selesai · <strong className="text-foreground">{week.rate}%</strong></span></div><div className="w-full bg-muted rounded-full h-3 overflow-hidden"><div className={`h-3 rounded-full transition-all duration-500 ${week.active ? 'bg-[#ff7a2f]' : 'bg-primary'}`} style={{ width: `${week.rate}%` }} /></div></div>)}</div></div><div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs"><span className="text-muted-foreground font-medium">Lihat detail aktivitas harian?</span><Link href="/dashboard/productivity" className="inline-flex items-center gap-1 font-black text-primary hover:underline underline-offset-4"><span>Productivity Map</span><ArrowUpRight className="w-3.5 h-3.5" /></Link></div></div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs"><div className="flex items-center justify-between pb-4 border-b border-border"><div><h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2"><Layers className="w-5 h-5 text-primary" />Distribusi Task berdasarkan Prioritas</h2><p className="text-xs text-muted-foreground">Hanya task selesai pada periode terpilih</p></div></div><div className="mt-6"><div className="w-full h-4 rounded-full overflow-hidden flex bg-muted">{data.priorityDistribution.map((item) => <div key={item.name} className={`${item.color} transition-all duration-500`} style={{ width: `${item.percentage}%` }} title={`${item.name}: ${item.percentage}%`} />)}</div><div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{data.priorityDistribution.map((item) => <div key={item.name} className="p-4 rounded-2xl bg-muted/20 border border-border"><div className="flex items-center gap-2 mb-2"><div className={`w-3 h-3 rounded-full ${item.color}`} /><span className="text-xs font-black text-foreground truncate">{item.name}</span></div><div className="text-2xl font-black text-foreground">{item.percentage}%</div><span className="text-[11px] text-muted-foreground font-semibold">{item.count} task</span></div>)}</div></div></div>
    </div>
  );
}

function Kpi({ title, value, detail, badge, tone }: { title: string; value: string; detail: string; badge: string; tone: 'amber' | 'emerald' | 'blue' | 'purple' }) {
  const styles = { amber: 'bg-amber-50/60 border-amber-200 text-[#1a2e1f]', emerald: 'bg-emerald-50/60 border-emerald-200 text-emerald-900', blue: 'bg-blue-50/60 border-blue-200 text-blue-950', purple: 'bg-purple-50/60 border-purple-200 text-purple-950' }[tone];
  return <div className={`p-4 rounded-2xl border ${styles}`}><div className="flex items-center justify-between"><span className="text-[11px] font-black uppercase">{title}</span><span className="text-[10px] font-black bg-white/70 px-1.5 py-0.5 rounded-md">{badge}</span></div><div className="text-3xl font-black mt-1">{value}</div><span className="text-xs text-muted-foreground font-semibold">{detail}</span></div>;
}
