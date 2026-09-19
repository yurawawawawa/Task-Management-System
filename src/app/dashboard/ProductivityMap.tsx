import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { mockActivities, MOCK_TODAY } from '@/app/lib/mock-data';
import { computeStreaks } from '@/app/lib/streaks';
import { ContributionGrid } from './ContributionGrid';
import { StreakFooter } from './StreakFooter';

export function ProductivityMap() {
  const stats = computeStreaks(mockActivities, MOCK_TODAY);

  return (
    <div className="group relative bg-white p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-3">
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
          className="text-muted-foreground/80 hover:text-foreground transition-colors p-2.5 -mr-2 -mt-2 rounded-lg hover:bg-muted flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] md:p-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" 
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 w-full overflow-hidden">
        <ContributionGrid data={mockActivities} todayStr={MOCK_TODAY} />
      </div>

      {/* Footer */}
      <StreakFooter stats={stats} />
    </div>
  );
}
