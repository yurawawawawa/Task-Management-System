import React from 'react';
import { Flame } from 'lucide-react';
import { StreakStats } from '@/app/lib/streaks';

type Props = {
  stats: StreakStats;
};

export function StreakFooter({ stats }: Props) {
  const { current, longest, activeDays } = stats;

  let flameColor = 'text-muted-foreground';
  let flameFill = 'transparent';
  let flameSize = 16;
  
  if (current >= 7) {
    flameColor = 'text-orange-500';
    flameFill = 'currentColor';
    flameSize = 20;
  } else if (current >= 1) {
    flameColor = 'text-orange-400';
    flameFill = 'transparent';
    flameSize = 18;
  }

  let milestone = null;
  if (current >= 100) milestone = '100-day streak!';
  else if (current >= 30) milestone = '30-day streak!';
  else if (current >= 7) milestone = '7-day streak!';

  return (
    <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border-light">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Flame 
              size={flameSize} 
              className={`${flameColor} transition-all duration-300 ease-in-out`} 
              style={{ fill: flameFill }} 
              aria-hidden="true"
            />
          </div>
          <span className="font-semibold text-foreground">
            {current}-day streak
          </span>
        </div>
        
        {milestone && (
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-tint-3 rounded-md animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
            {milestone}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-1 ml-10">
        Longest {longest} days &middot; {activeDays} active days in the last 13 weeks
      </p>
    </div>
  );
}
