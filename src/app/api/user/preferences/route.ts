import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeStyle, accentColor } = body;

    const validThemes = ['retro', 'minimal'];
    const validAccents = ['orange', 'green'];

    const theme = validThemes.includes(themeStyle) ? themeStyle : 'retro';
    const accent = validAccents.includes(accentColor) ? accentColor : 'orange';

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If user is authenticated, sync to Supabase auth user_metadata (database source of truth)
    if (user && !error) {
      await supabase.auth.updateUser({
        data: {
          themeStyle: theme,
          accentColor: accent,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      themeStyle: theme,
      accentColor: accent,
    });

    const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

    response.cookies.set('trekly_theme_style', theme, {
      maxAge: ONE_YEAR_IN_SECONDS,
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('trekly_accent_color', accent, {
      maxAge: ONE_YEAR_IN_SECONDS,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Failed to update theme preferences', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
