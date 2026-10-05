import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicConfig } from './config';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabasePublicConfig();

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Pengunjung tanpa session tidak perlu melakukan request jaringan ke
  // Supabase. Ini menjaga landing page dan halaman auth tetap responsif saat
  // Supabase sedang lambat atau tidak tersedia.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith('sb-'));

  if (!hasAuthCookie) {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const secureCookies = process.env.NODE_ENV === 'production';
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: secureCookies,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: secureCookies,
            })
          );
        },
      },
    }
  );

  // Refresh token & retrieve auth user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Supabase middleware session lookup failed:', {
      name: authError.name,
      message: authError.message,
      status: authError.status,
      code: authError.code,
    });
  }

  const pathname = request.nextUrl.pathname;

  // Helper to clone cookies into redirect response
  const createRedirect = (targetPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  };

  // 1. Route / : Kalau session valid → redirect ke /dashboard, kalau tidak ada session → landing page
  if (pathname === '/') {
    if (user) {
      return createRedirect('/dashboard');
    }
    return supabaseResponse;
  }

  // 2. Proteksi route /dashboard : kalau belum login, redirect balik ke /login
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const nextPath = pathname + request.nextUrl.search;
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(nextPath)}`;
      const redirectRes = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectRes.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectRes;
    }
    return supabaseResponse;
  }

  // 3. Kalau user sudah login tapi membuka /login atau /signup atau /register → redirect ke /dashboard
  if (pathname === '/login' || pathname === '/signup' || pathname === '/register') {
    if (user) {
      return createRedirect('/dashboard');
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}
