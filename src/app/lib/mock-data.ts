import { DailyActivity } from './streaks';

export const MOCK_TODAY = '2024-05-16'; // Thursday

export function generateMockData(): DailyActivity[] {
  const data: DailyActivity[] = [];
  const startDate = new Date(Date.UTC(2024, 1, 19)); // Feb 19, 2024 is Monday
  
  let seed = 42;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < 91; i++) { // 13 weeks = 91 days
    const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    
    let completed = 0;
    if (i >= 15 && i <= 35) {
      // longest old streak (21 days)
      completed = Math.floor(random() * 5) + 1;
    } else if (i >= 76 && i <= 87) {
      // current streak (12 days leading to Thursday, May 16 - which is i=87)
      completed = Math.floor(random() * 6) + 1;
    } else {
      // noise
      if (random() > 0.7) {
        completed = Math.floor(random() * 3) + 1;
      }
    }
    
    data.push({ date: dateStr, completed });
  }
  
  return data;
}

export const mockActivities = generateMockData();
