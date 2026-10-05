import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getSupabasePublicConfig } from './config';

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicConfig();
  const secureCookies = process.env.NODE_ENV === 'production';

  return createServerClient(
    url,
    anonKey,
    {
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: secureCookies,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: secureCookies,
              });
            });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Utility untuk mengambil user yang sedang login dari sisi server
// React cache deduplicates auth lookups made by the dashboard layout and the
// active page during the same server render. The session is still validated by
// Supabase; this only avoids repeating the same network request in one render.
export const getAuthUser = cache(async function getAuthUser() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith('sb-'));

  // Avoid a network request for anonymous visitors. Without this guard every
  // landing-page render waits for Supabase Auth even though no user can exist.
  if (!hasAuthCookie) {
    return null;
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Supabase session lookup failed:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });
    return null;
  }

  if (!user) {
    return null;
  }
  
  return user;
});
