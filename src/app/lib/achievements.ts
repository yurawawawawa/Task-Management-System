export type AchievementIcon = 'flame' | 'sparkles' | 'zap' | 'trophy' | 'star';

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'a1',
    title: 'Penyulut Api',
    target: '3 Hari berturut-turut',
    threshold: 3,
    desc: 'Langkah awal memulai rutinitas produktif harian',
    icon: 'flame',
  },
  {
    id: 'a2',
    title: 'Konsistensi Mingguan',
    target: '7 Hari berturut-turut',
    threshold: 7,
    desc: 'Menuntaskan satu pekan penuh tanpa jeda',
    icon: 'sparkles',
  },
  {
    id: 'a3',
    title: 'Momentum Kuat',
    target: '14 Hari berturut-turut',
    threshold: 14,
    desc: 'Membangun kebiasaan produktif yang kokoh',
    icon: 'zap',
  },
  {
    id: 'a4',
    title: 'Master Rutinitas',
    target: '30 Hari berturut-turut',
    threshold: 30,
    desc: 'Bulan emas produktivitas tak terhentikan',
    icon: 'trophy',
  },
  {
    id: 'a5',
    title: 'Klub Seratus Hari',
    target: '100 Hari berturut-turut',
    threshold: 100,
    desc: 'Legenda konsistensi dan fokus tanpa kompromi',
    icon: 'star',
  },
] as const;

export type Achievement = (typeof ACHIEVEMENT_DEFINITIONS)[number] & {
  unlocked: boolean;
  progress: number;
};

export function getAchievementProgress(currentStreak: number, longestStreak: number): Achievement[] {
  const bestStreak = Math.max(currentStreak, longestStreak);

  return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
    ...achievement,
    unlocked: bestStreak >= achievement.threshold,
    progress: Math.min(100, Math.round((bestStreak / achievement.threshold) * 100)),
  }));
}

export function getUnlockedAchievements(currentStreak: number, longestStreak: number) {
  return getAchievementProgress(currentStreak, longestStreak).filter((achievement) => achievement.unlocked);
}
