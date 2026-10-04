'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck } from 'lucide-react';

interface CalendarTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string | null;
}

interface DeadlineCalendarProps {
  tasks: CalendarTask[];
}

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const monthFormatter = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
});

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTaskDateKey(task: CalendarTask) {
  // The database value is an ISO datetime. Keeping its date part avoids
  // moving a deadline to the previous day when the user's timezone differs.
  return task.dueDate?.slice(0, 10) ?? null;
}

export default function DeadlineCalendar({ tasks }: DeadlineCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const todayKey = toDateKey(new Date());
  const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, CalendarTask[]>();

    for (const task of tasks) {
      const dateKey = getTaskDateKey(task);
      if (!dateKey) continue;
      const current = grouped.get(dateKey) ?? [];
      current.push(task);
      grouped.set(dateKey, current);
    }

    return grouped;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const firstGridDay = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      1 - firstDay.getDay(),
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstGridDay);
      date.setDate(firstGridDay.getDate() + index);
      return date;
    });
  }, [viewDate]);

  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const upcomingTasks = tasks
    .filter((task) => {
      const dateKey = getTaskDateKey(task);
      return dateKey && dateKey >= todayKey && task.status !== 'DONE';
    })
    .sort((a, b) => (getTaskDateKey(a) ?? '').localeCompare(getTaskDateKey(b) ?? ''))
    .slice(0, 4);

  const moveMonth = (amount: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1));
  };

  const selectToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(toDateKey(today));
  };

  return (
    <section className="bg-white p-6 rounded-3xl border-2 border-border shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-foreground tracking-tight">Kalender Deadline</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pantau deadline task langsung dari Dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectToday}
            className="px-3 py-1.5 rounded-xl border-2 border-border text-xs font-black text-foreground hover:border-primary transition-colors"
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="p-1.5 rounded-xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="p-1.5 rounded-xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black capitalize text-foreground">{monthFormatter.format(viewDate)}</h3>
            <span className="text-[11px] font-bold text-muted-foreground">
              {tasks.filter((task) => getTaskDateKey(task)?.startsWith(monthKey)).length} deadline bulan ini
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {dayNames.map((day) => (
              <span key={day} className="text-center text-[10px] font-black text-muted-foreground py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((date) => {
              const dateKey = toDateKey(date);
              const dayTasks = tasksByDate.get(dateKey) ?? [];
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-14 sm:min-h-16 p-1.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  aria-label={`${date.getDate()} ${monthFormatter.format(date)}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.status === 'DONE'
                            ? 'bg-emerald-500'
                            : task.priority === 'URGENT'
                              ? 'bg-red-500'
                              : task.priority === 'HIGH'
                                ? 'bg-amber-500'
                                : 'bg-primary'
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Task deadline</span>
            <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Urgent</span>
            <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Selesai</span>
          </div>
        </div>

        <div className="lg:border-l lg:border-border lg:pl-6">
          <h3 className="text-sm font-black text-foreground">
            Deadline {selectedDate === todayKey ? 'hari ini' : dateFormatter.format(new Date(`${selectedDate}T12:00:00`))}
          </h3>
          <div className="mt-3 space-y-2">
            {selectedTasks.length > 0 ? selectedTasks.map((task) => (
              <div key={task.id} className="p-3 rounded-2xl border-2 border-border bg-muted/20">
                <div className="flex items-start gap-2">
                  {task.status === 'DONE' ? (
                    <CircleCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <span className="w-2 h-2 shrink-0 rounded-full bg-primary mt-1.5" />
                  )}
                  <p className={`text-xs font-extrabold leading-snug ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                </div>
              </div>
            )) : (
              <p className="p-3 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                Tidak ada deadline pada tanggal ini.
              </p>
            )}
          </div>

          {upcomingTasks.length > 0 && selectedTasks.length === 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[11px] font-black uppercase tracking-wide text-muted-foreground">Berikutnya</p>
              <div className="mt-2 space-y-2">
                {upcomingTasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => setSelectedDate(getTaskDateKey(task) ?? todayKey)}
                    className="w-full text-left p-2 rounded-xl hover:bg-muted transition-colors"
                  >
                    <p className="text-xs font-extrabold text-foreground truncate">{task.title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                      {dateFormatter.format(new Date(`${getTaskDateKey(task)}T12:00:00`))}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
