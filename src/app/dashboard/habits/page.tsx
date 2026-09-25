import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import HabitsClient from './HabitsClient';

export default async function HabitsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return <HabitsClient />;
}
