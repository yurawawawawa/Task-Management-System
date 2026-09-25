import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { cookies } from 'next/headers';
import { ThemeProvider, type ThemeStyle, type AccentColor } from '@/app/context/ThemeContext';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/login');
  }

  const profile = await db.orm.public.Profile.where({ id: authUser.id }).first();

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('trekly_theme_style')?.value as ThemeStyle | undefined;
  const accentCookie = cookieStore.get('trekly_accent_color')?.value as AccentColor | undefined;

  const userTheme = authUser.user_metadata?.themeStyle as ThemeStyle | undefined;
  const userAccent = authUser.user_metadata?.accentColor as AccentColor | undefined;

  const validThemes: ThemeStyle[] = ['retro', 'minimal'];
  const validAccents: AccentColor[] = ['orange', 'green'];

  const initialTheme: ThemeStyle =
    themeCookie && validThemes.includes(themeCookie)
      ? themeCookie
      : userTheme && validThemes.includes(userTheme)
      ? userTheme
      : 'retro';

  const initialAccent: AccentColor =
    accentCookie && validAccents.includes(accentCookie)
      ? accentCookie
      : userAccent && validAccents.includes(userAccent)
      ? userAccent
      : 'orange';

  return (
    <ThemeProvider initialTheme={initialTheme} initialAccent={initialAccent}>
      <DashboardLayoutClient profile={profile} authUser={authUser}>
        {children}
      </DashboardLayoutClient>
    </ThemeProvider>
  );
}
