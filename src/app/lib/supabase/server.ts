import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getSupabasePublicConfig } from './config';
import { fetchWithSingleNetworkRetry, isRetryableAuthNetworkError } from './network';

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicConfig();
  const secureCookies = process.env.NODE_ENV === 'production';

  return createServerClient(
    url,
    anonKey,
    {
      global: { fetch: fetchWithSingleNetworkRetry },
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

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      const isMissingSession =
        error.name === 'AuthSessionMissingError' ||
        error.message.toLowerCase() === 'auth session missing!';

      if (!isMissingSession) {
        const log = isRetryableAuthNetworkError(error) ? console.warn : console.error;
        log('Supabase session lookup failed:', {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code,
        });
      }
      return null;
    }

    return user ?? null;
  } catch (error) {
    const details = {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    const log = isRetryableAuthNetworkError(details) ? console.warn : console.error;
    log('Supabase session lookup request failed:', details);
    return null;
  }
});
