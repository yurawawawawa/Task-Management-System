export type DailyActivity = {
  date: string; // YYYY-MM-DD
  completed: number;
};

export type StreakStats = {
  current: number;
  longest: number;
  activeDays: number;
  freezeCount?: number;
  usedFreezeDates?: string[];
};

export function getLevel(completed: number): 0 | 1 | 2 | 3 | 4 {
  if (completed >= 6) return 4;
  if (completed >= 4) return 3;
  if (completed >= 2) return 2;
  if (completed >= 1) return 1;
  return 0;
}

export function parseDateOnly(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(dateA: string, dateB: string): number {
  return Math.round((parseDateOnly(dateB) - parseDateOnly(dateA)) / MS_PER_DAY);
}

export function getTodayDateStr(timeZone = 'Asia/Jakarta'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

export function formatIndonesianDate(ymd: string): string {
  try {
    const [y, m, d] = ymd.split('-').map(Number);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d} ${months[m - 1]} ${y}`;
  } catch {
    return ymd;
  }
}

/**
 * Calculates streak metrics with freeze protection logic.
 *
 * Rules:
 * 1. An active day has >= 1 completed tasks/habits.
 * 2. If 1 or more consecutive days without activity occur:
 *    - If available freezeCount >= missed days, freeze shields are automatically consumed to keep streak intact!
 *    - If available freezeCount < missed days, streak resets to 0.
 * 3. Returns { current, longest, activeDays, remainingFreeze, usedFreezeDates }.
 */
export function calculateStreakWithFreeze(
  days: DailyActivity[],
  todayStr: string,
  initialFreezeCount = 2
): StreakStats & { remainingFreeze: number; usedFreezeDates: string[] } {
  const sorted = [...days]
    .filter((d) => d.completed >= 1)
    .sort((a, b) => a.date.localeCompare(b.date));

  let freezeCount = Math.max(0, initialFreezeCount);
  const usedFreezeDates: string[] = [];

  if (sorted.length === 0) {
    return {
      current: 0,
      longest: 0,
      activeDays: 0,
      remainingFreeze: freezeCount,
      usedFreezeDates: [],
    };
  }

  const activeDays = sorted.length;
  let tempStreak = 1;
  let longest = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1].date;
    const currDate = sorted[i].date;
    const gap = daysBetween(prevDate, currDate);

    if (gap === 1) {
      tempStreak++;
    } else if (gap > 1) {
      const missedDays = gap - 1;
      if (freezeCount >= missedDays) {
        freezeCount -= missedDays;
        for (let m = 1; m <= missedDays; m++) {
          const missedTime = parseDateOnly(prevDate) + m * MS_PER_DAY;
          const missedD = new Date(missedTime);
          const missedStr = `${missedD.getUTCFullYear()}-${String(missedD.getUTCMonth() + 1).padStart(2, '0')}-${String(missedD.getUTCDate()).padStart(2, '0')}`;
          usedFreezeDates.push(missedStr);
        }
        tempStreak += missedDays + 1;
      } else {
        if (tempStreak > longest) longest = tempStreak;
        tempStreak = 1;
      }
    }
    if (tempStreak > longest) longest = tempStreak;
  }

  // Calculate current streak relative to today
  const lastActiveDate = sorted[sorted.length - 1].date;
  const gapFromToday = daysBetween(lastActiveDate, todayStr);

  let current = 0;
  if (gapFromToday === 0 || gapFromToday === 1) {
    current = tempStreak;
  } else if (gapFromToday > 1) {
    const missedBeforeToday = gapFromToday - 1;
    if (freezeCount >= missedBeforeToday) {
      freezeCount -= missedBeforeToday;
      for (let m = 1; m <= missedBeforeToday; m++) {
        const missedTime = parseDateOnly(lastActiveDate) + m * MS_PER_DAY;
        const missedD = new Date(missedTime);
        const missedStr = `${missedD.getUTCFullYear()}-${String(missedD.getUTCMonth() + 1).padStart(2, '0')}-${String(missedD.getUTCDate()).padStart(2, '0')}`;
        usedFreezeDates.push(missedStr);
      }
      current = tempStreak + missedBeforeToday;
    } else {
      current = 0;
    }
  }

  return {
    current,
    longest: Math.max(longest, current),
    activeDays,
    remainingFreeze: freezeCount,
    usedFreezeDates,
  };
}

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
