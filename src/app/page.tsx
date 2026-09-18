import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getAuthUser();
  
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
