import { withApiTelemetry } from '@/app/lib/admin/telemetry';
import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { loginSchema } from '@/app/lib/validations/auth';
import { db } from '@/prisma/db';
import { recordActivity } from '@/app/lib/admin/telemetry';
import { readJson, sql } from '@/app/lib/admin/sql';

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  if (typeof error === 'object' && error !== null) {
    const value = error as Record<string, unknown>;
    return {
      name: typeof value.name === 'string' ? value.name : 'UnknownError',
      message: typeof value.message === 'string' ? value.message : 'Unknown error',
      code: typeof value.code === 'string' ? value.code : undefined,
    };
  }

  return { name: 'UnknownError', message: 'Unknown error' };
}

function isDatabaseError(error: unknown) {
  const details = getErrorDetails(error);
  const message = details.message.toLowerCase();
  return (
    message.includes('database') ||
    message.includes('postgres') ||
    message.includes('connection') ||
    message.includes('contract') ||
    message.includes('prisma') ||
    details.name.toLowerCase().includes('database')
  );
}

async function handlePOST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validation
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 });
    }
    const email = result.data.email.trim().toLowerCase();
    const { password } = result.data;

    // 2. Authenticate with Supabase
    // This will automatically set the session cookie using our server client
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase login error:', {
        name: authError.name,
        message: authError.message,
        status: authError.status,
        code: authError.code,
      });

      // Supabase uses AuthRetryableFetchError/status 0 when its Auth service
      // cannot be reached. This must not be shown as a credential error.
      const isAuthServiceUnavailable =
        authError.name === 'AuthRetryableFetchError' ||
        authError.status === 0 ||
        (authError.status !== undefined && authError.status >= 500);

      if (isAuthServiceUnavailable) {
        return NextResponse.json(
          { error: 'Layanan login sedang tidak dapat dihubungi. Periksa koneksi internet lalu coba lagi.' },
          { status: 503 }
        );
      }

      const authErrorCode = typeof authError.code === 'string' ? authError.code.toLowerCase() : '';
      const authErrorMessage = authError.message.toLowerCase();
      const isEmailNotConfirmed =
        authErrorCode === 'email_not_confirmed' || authErrorMessage.includes('email not confirmed');

      if (isEmailNotConfirmed) {
        return NextResponse.json(
          { error: 'Email belum dikonfirmasi. Cek inbox atau folder spam, lalu klik link verifikasi dari Supabase.' },
          { status: 403 },
        );
      }

      const isCredentialError = [400, 401, 422].includes(authError.status ?? 0);

      if (isCredentialError) {
        return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
      }

      return NextResponse.json(
        { error: 'Layanan autentikasi sedang bermasalah. Coba lagi beberapa saat lagi.' },
        { status: 502 }
      );
    }

    if (!authData.user) {
      console.error('Supabase login returned no user without an error.');
      return NextResponse.json(
        { error: 'Layanan autentikasi sedang bermasalah. Coba lagi beberapa saat lagi.' },
        { status: 502 }
      );
    }

    // 3. Fetch user profile from database, or auto-create if missing
    try {
      let profile = await db.orm.public.Profile
        .where({ id: authData.user.id })
        .first();

      if (!profile) {
        profile = await db.orm.public.Profile.create({
          id: authData.user.id,
          email: authData.user.email ?? email,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
        });
      }

      // The generated Prisma contract predates the additive admin migration,
      // so read the authorization role through the server-only raw SQL lane.
      const roleProfile = await readJson<{ role: string } | null>(sql`
        SELECT coalesce((SELECT json_build_object('role', role)
          FROM public.profiles WHERE id = ${authData.user.id}::uuid), 'null'::json)::text AS payload`);

      await recordActivity(authData.user.id, 'USER_LOGIN', 'user', authData.user.id);
      return NextResponse.json({
        message: 'Logged in successfully',
        user: { ...profile, role: roleProfile?.role ?? 'USER' },
      });
    } catch (error) {
      console.error('Login profile sync failed:', getErrorDetails(error));
      return NextResponse.json(
        { error: 'Database login service sedang tidak tersedia.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }

  } catch (error: unknown) {
    const details = getErrorDetails(error);
    console.error('Login request failed:', details);

    if (isDatabaseError(error)) {
      return NextResponse.json(
        { error: 'Database login service sedang tidak tersedia.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Konfigurasi atau layanan login sedang bermasalah.', code: 'AUTH_INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export const POST = withApiTelemetry('auth.login.POST', handlePOST);
