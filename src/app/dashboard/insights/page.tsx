import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import InsightsClient from './InsightsClient';

export default async function InsightsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return <InsightsClient />;
}
