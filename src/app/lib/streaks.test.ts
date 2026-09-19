import { describe, it, expect } from 'vitest';
import { computeStreaks, getLevel, DailyActivity } from './streaks';

describe('getLevel', () => {
  it('returns correct levels based on completed count', () => {
    expect(getLevel(0)).toBe(0);
    expect(getLevel(1)).toBe(1);
    expect(getLevel(2)).toBe(1);
    expect(getLevel(3)).toBe(2);
    expect(getLevel(4)).toBe(2);
    expect(getLevel(5)).toBe(3);
    expect(getLevel(10)).toBe(3);
  });
});

describe('computeStreaks', () => {
  const todayStr = '2023-10-15';

  it('handles empty data', () => {
    const result = computeStreaks([], todayStr);
    expect(result).toEqual({ current: 0, longest: 0, activeDays: 0 });
  });

  it('calculates unbroken streak running up to today', () => {
    const days: DailyActivity[] = [
      { date: '2023-10-13', completed: 2 },
      { date: '2023-10-14', completed: 1 },
      { date: '2023-10-15', completed: 5 },
    ];
    const result = computeStreaks(days, todayStr);
    expect(result).toEqual({ current: 3, longest: 3, activeDays: 3 });
  });

  it('calculates streak running up to yesterday (still active today)', () => {
    const days: DailyActivity[] = [
      { date: '2023-10-12', completed: 1 },
      { date: '2023-10-13', completed: 3 },
      { date: '2023-10-14', completed: 2 },
      // Today (15th) is empty
    ];
    const result = computeStreaks(days, todayStr);
    expect(result).toEqual({ current: 3, longest: 3, activeDays: 3 });
  });

  it('breaks streak if yesterday and today are empty', () => {
    const days: DailyActivity[] = [
      { date: '2023-10-11', completed: 1 },
      { date: '2023-10-12', completed: 3 },
      { date: '2023-10-13', completed: 2 },
      // 14th and 15th are empty
    ];
    const result = computeStreaks(days, todayStr);
    expect(result).toEqual({ current: 0, longest: 3, activeDays: 3 });
  });

  it('finds longest streak among multiple broken streaks', () => {
    const days: DailyActivity[] = [
      // Streak 1 (length 2)
      { date: '2023-10-01', completed: 1 },
      { date: '2023-10-02', completed: 1 },
      
      // Streak 2 (length 4) - Longest
      { date: '2023-10-05', completed: 1 },
      { date: '2023-10-06', completed: 2 },
      { date: '2023-10-07', completed: 1 },
      { date: '2023-10-08', completed: 3 },
      
      // Streak 3 (length 2) - Current
      { date: '2023-10-14', completed: 1 },
      { date: '2023-10-15', completed: 2 },
    ];
    const result = computeStreaks(days, todayStr);
    expect(result).toEqual({ current: 2, longest: 4, activeDays: 8 });
  });

  it('ignores days with 0 completed in streak calculations', () => {
    const days: DailyActivity[] = [
      { date: '2023-10-13', completed: 2 },
      { date: '2023-10-14', completed: 0 },
      { date: '2023-10-15', completed: 5 },
    ];
    const result = computeStreaks(days, todayStr);
    // Active days are 13th and 15th. They are not consecutive.
    // Streak lengths: 1 and 1. 
    // Since 15th is today and it's active, current is 1. Longest is 1.
    expect(result).toEqual({ current: 1, longest: 1, activeDays: 2 });
  });
});
