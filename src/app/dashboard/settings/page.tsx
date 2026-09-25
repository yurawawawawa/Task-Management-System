import { getAuthUser } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await db.orm.public.Profile.where({ id: user.id }).first();

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email,
        name: profile?.name,
      }}
    />
  );
}
