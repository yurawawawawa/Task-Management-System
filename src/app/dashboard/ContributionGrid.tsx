import React from 'react';
import { DailyActivity, getLevel } from '@/app/lib/streaks';

type Props = {
  data: DailyActivity[];
  todayStr: string;
};

const LEVEL_COLORS = {
  0: 'bg-[var(--color-primary-tint-3)]', // assuming CSS variables are available from theme or globals
  1: 'bg-[var(--color-primary-tint-2)]',
  2: 'bg-[var(--color-primary-tint-1)]',
  3: 'bg-primary',
  4: 'bg-primary',
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function formatDateLabel(dateStr: string) {
  const { year, month, day } = parseDate(dateStr);
  const dateObj = new Date(year, month, day);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
  return `${weekday}, ${day} ${MONTH_NAMES[month]}`;
}

export function ContributionGrid({ data, todayStr }: Props) {
  // Organize data into 13 columns of 7 days (Monday to Sunday)
  const weeks: DailyActivity[][] = [];
  let currentWeek: DailyActivity[] = [];
  
  data.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate month labels (only show when a new month starts in a week)
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = parseDate(week[0].date);
    if (firstDay.month !== lastMonth) {
      monthLabels.push({ label: MONTH_NAMES[firstDay.month], weekIndex: i });
      lastMonth = firstDay.month;
    }
  });

  return (
    <div className="flex flex-col gap-2 overflow-x-auto pb-4">
      <div className="flex text-xs text-muted-foreground ml-8 relative h-4">
        {monthLabels.map((m, i) => (
          <span 
            key={i} 
            className="absolute top-0" 
            style={{ left: `${(m.weekIndex / 13) * 100}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2 min-w-max" role="grid" aria-label="Activity contribution graph">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between text-[10px] text-muted-foreground w-6 py-1">
          <span className="h-3 leading-3 mt-[1px]">Mon</span>
          <span className="h-3 leading-3 mt-4">Wed</span>
          <span className="h-3 leading-3 mt-4">Fri</span>
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const isFuture = day.date.localeCompare(todayStr) > 0;
                const isToday = day.date === todayStr;
                const level = isFuture ? 0 : getLevel(day.completed);
                const bgColor = isFuture 
                  ? 'bg-transparent border border-border-light' // future cells are empty
                  : LEVEL_COLORS[level];
                
                const outline = isToday ? 'ring-1 ring-primary ring-offset-1' : '';
                
                const tooltipText = isFuture
                  ? `No activity yet · ${formatDateLabel(day.date)}`
                  : day.completed === 0
                    ? `Rest day · ${formatDateLabel(day.date)}`
                    : `${day.completed} tasks completed · ${formatDateLabel(day.date)}`;

                return (
                  <div
                    key={day.date}
                    role="gridcell"
                    tabIndex={0}
                    aria-label={tooltipText}
                    title={tooltipText}
                    className={`w-3 h-3 rounded-sm transition-colors duration-200 ease-in-out motion-reduce:transition-none hover:ring-1 hover:ring-muted-foreground hover:ring-offset-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${bgColor} ${outline}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[0]}`} />
        <div className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[1]}`} />
        <div className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[2]}`} />
        <div className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[3]}`} />
        <span>More</span>
      </div>
    </div>
  );
}
