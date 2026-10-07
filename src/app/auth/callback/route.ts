import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/app/lib/supabase/server';
import { getSafeNextPath } from '@/app/lib/runtime-env';
import { db } from '@/prisma/db';
import { recordActivity, recordOperation } from '@/app/lib/admin/telemetry';
import { readJson, sql } from '@/app/lib/admin/sql';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const emailType = searchParams.get('type') as EmailOtpType | null;
  const next = getSafeNextPath(searchParams.get('next'));

  if (code || (tokenHash && emailType)) {
    const supabase = await createClient();
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: emailType! });

    if (!error && data.user) {
      // Sinkronisasi data user dari auth.users ke tabel Profile di Prisma
      let profileRole: string | undefined;
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

        const roleProfile = await readJson<{ role: string } | null>(sql`
          SELECT coalesce((SELECT json_build_object('role', role)
            FROM public.profiles WHERE id = ${data.user.id}::uuid), 'null'::json)::text AS payload`);
        profileRole = roleProfile?.role;
      } catch (dbError) {
        console.error('Error synchronizing OAuth user profile to Prisma:', dbError);
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const destination = profileRole === 'ADMIN' && next === '/dashboard'
        ? '/admin'
        : next;
      await recordActivity(data.user.id, 'USER_LOGIN', 'user', data.user.id);
      await recordOperation({ category: 'AUTH', operation: 'auth.oauth.callback', outcome: 'SUCCESS', userId: data.user.id });
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  // Jika gagal, kembalikan ke login dengan pesan error
  await recordOperation({ category: 'AUTH', operation: 'auth.oauth.callback', outcome: 'FAILURE', code: 'CALLBACK_FAILED' });
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
