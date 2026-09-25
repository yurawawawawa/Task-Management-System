import { getAuthUser } from '@/app/lib/supabase/server';
import LandingPage from '@/app/components/landing/LandingPage';

export default async function Home() {
  const user = await getAuthUser();
  return <LandingPage user={user} />;
}
