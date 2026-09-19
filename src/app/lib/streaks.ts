export type DailyActivity = {
  date: string; // YYYY-MM-DD
  completed: number;
};

export type StreakStats = {
  current: number;
  longest: number;
  activeDays: number;
};

export function getLevel(completed: number): 0 | 1 | 2 | 3 {
  if (completed >= 5) return 3;
  if (completed >= 3) return 2;
  if (completed >= 1) return 1;
  return 0;
}

function parseDateOnly(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeStreaks(days: DailyActivity[], todayStr: string): StreakStats {
  const activeRecords = days
    .filter((d) => d.completed >= 1)
    .sort((a, b) => a.date.localeCompare(b.date));

  const activeDays = activeRecords.length;

  if (activeDays === 0) {
    return { current: 0, longest: 0, activeDays: 0 };
  }

  let longest = 0;
  let tempStreak = 1;

  for (let i = 1; i < activeRecords.length; i++) {
    const prevTime = parseDateOnly(activeRecords[i - 1].date);
    const currTime = parseDateOnly(activeRecords[i].date);
    const diffDays = Math.round((currTime - prevTime) / MS_PER_DAY);

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      if (tempStreak > longest) longest = tempStreak;
      tempStreak = 1;
    }
  }

  if (tempStreak > longest) longest = tempStreak;

  let current = 0;
  const lastActiveDate = activeRecords[activeRecords.length - 1].date;
  const todayTime = parseDateOnly(todayStr);
  const lastActiveTime = parseDateOnly(lastActiveDate);
  const diffFromToday = Math.round((todayTime - lastActiveTime) / MS_PER_DAY);

  if (diffFromToday === 0 || diffFromToday === 1) {
    current = tempStreak;
  } else {
    current = 0;
  }

  return { current, longest, activeDays };
}
