import { getAuthUser } from '@/app/lib/supabase/server';
import LandingPage from '@/app/components/landing/LandingPage';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const params = await searchParams;

  // Supabase PKCE links can fall back to the site URL with a query code.
  // Send those links through the callback so the recovery session is established.
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}&next=/reset-password`);
  }

  const user = await getAuthUser();
  return <LandingPage user={user} />;
}
