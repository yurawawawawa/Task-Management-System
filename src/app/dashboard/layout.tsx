import { getAuthUser } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { cookies } from "next/headers";
import {
  ThemeProvider,
  type ThemeStyle,
  type AccentColor,
  type ColorMode,
} from "@/app/context/ThemeContext";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { getUserProductivityStats } from "@/app/lib/activity";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  const [profile, productivityStats] = await Promise.all([
    db.orm.public.Profile.where({ id: authUser.id }).first(),
    getUserProductivityStats(authUser.id),
  ]);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("trekly_theme_style")?.value as
    ThemeStyle | undefined;
  const accentCookie = cookieStore.get("trekly_accent_color")?.value as
    AccentColor | undefined;
  const colorModeCookie = cookieStore.get("trekly_color_mode")?.value as
    ColorMode | undefined;

  const userTheme = authUser.user_metadata?.themeStyle as
    ThemeStyle | undefined;
  const userAccent = authUser.user_metadata?.accentColor as
    AccentColor | undefined;
  const userColorMode = authUser.user_metadata?.colorMode as
    ColorMode | undefined;

  const validThemes: ThemeStyle[] = ["retro", "minimal"];
  const validAccents: AccentColor[] = ["orange", "green"];
  const validColorModes: ColorMode[] = ["light", "dark"];
  const initialTheme: ThemeStyle =
    themeCookie && validThemes.includes(themeCookie)
      ? themeCookie
      : userTheme && validThemes.includes(userTheme)
        ? userTheme
        : "retro";

  const initialAccent: AccentColor =
    accentCookie && validAccents.includes(accentCookie)
      ? accentCookie
      : userAccent && validAccents.includes(userAccent)
        ? userAccent
        : "orange";

  const initialColorMode: ColorMode =
    colorModeCookie && validColorModes.includes(colorModeCookie)
      ? colorModeCookie
      : userColorMode && validColorModes.includes(userColorMode)
        ? userColorMode
        : "light";

  return (
    <ThemeProvider
      initialTheme={initialTheme}
      initialAccent={initialAccent}
      initialColorMode={initialColorMode}
    >
      <DashboardLayoutClient
        profile={profile}
        authUser={authUser}
        currentStreak={productivityStats.currentStreak}
        freezeCount={productivityStats.freezeCount}
      >
        {children}
      </DashboardLayoutClient>
    </ThemeProvider>
  );
}
