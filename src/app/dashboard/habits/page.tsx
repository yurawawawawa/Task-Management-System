import { getAuthUser } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from '@/prisma/db';
import { getUserProductivityStats } from '@/app/lib/activity';
import HabitsClient from "./HabitsClient";

export default async function HabitsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const [habits, tasks, stats] = await Promise.all([
    db.orm.public.Habit.where({ userId: user.id }).include('completions').orderBy((habit) => habit.createdAt.desc()).all(),
    db.orm.public.Task.where({ userId: user.id }).orderBy((task) => task.updatedAt.desc()).all(),
    getUserProductivityStats(user.id),
  ]);

  return (
    <HabitsClient
      todayStr={stats.todayStr}
      currentStreak={stats.currentStreak}
      habits={habits.map((habit) => ({
        id: habit.id,
        title: habit.title,
        category: habit.category,
        frequency: habit.frequency,
        completions: habit.completions.map((completion) => ({ id: completion.id, date: completion.date })),
      }))}
      tasks={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, updatedAt: task.updatedAt }))}
    />
  );
}
