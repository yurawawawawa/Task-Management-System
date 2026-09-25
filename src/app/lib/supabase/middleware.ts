import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh token & retrieve auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      return createRedirect('/login');
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
