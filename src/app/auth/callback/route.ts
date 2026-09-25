import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { db } from '@/prisma/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sinkronisasi data user dari auth.users ke tabel Profile di Prisma
      try {
        const existingProfile = await db.orm.public.Profile
          .where({ id: data.user.id })
          .first();

        if (!existingProfile) {
          const userName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'User';

          await db.orm.public.Profile.create({
            id: data.user.id,
            email: data.user.email!,
            name: userName,
          });
        }
      } catch (dbError) {
        console.error('Error synchronizing OAuth user profile to Prisma:', dbError);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Jika gagal, kembalikan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
