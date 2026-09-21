import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { computeStreaks, DailyActivity } from '@/app/lib/streaks';
import { ContributionGrid } from './ContributionGrid';
import { StreakFooter } from './StreakFooter';
import { db } from '@/prisma/db';

export async function ProductivityMap({ userId }: { userId: string }) {
  // Fetch completed tasks
  const completedTasks = await db.orm.public.Task.where({ 
    userId, 
    status: 'DONE' 
  }).all();

  // Generate the 91-day window ending on the current week's Sunday
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const lastDay = new Date(now);
  lastDay.setDate(now.getDate() + daysUntilSunday);
  
  const firstDay = new Date(lastDay);
  firstDay.setDate(lastDay.getDate() - 90); // 91 days total (0 to 90)

  // Count completed tasks by date string (using local time to match todayStr)
  const countsByDate = new Map<string, number>();
  for (const task of completedTasks) {
    if (!task.updatedAt) continue;
    const d = new Date(task.updatedAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
  }

  // Create the 91-element array
  const activities: DailyActivity[] = [];
  for (let i = 0; i < 91; i++) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activities.push({
      date: dateStr,
      completed: countsByDate.get(dateStr) || 0
    });
  }

  const stats = computeStreaks(activities, todayStr);

  return (
    <div className="group relative bg-white p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-3 opacity-0 animate-fade-in-up animate-delay-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">
            Productivity Map
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your daily task completion
          </p>
        </div>
        <button 
          className="text-muted-foreground/80 hover:text-foreground transition-colors p-2.5 -mr-2 -mt-2 rounded-lg hover:bg-muted flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" 
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 w-full overflow-hidden">
        <ContributionGrid data={activities} todayStr={todayStr} />
      </div>

      {/* Footer */}
      <StreakFooter stats={stats} />
    </div>
  );
}
