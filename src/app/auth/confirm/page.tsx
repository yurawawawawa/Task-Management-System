'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function establishSession() {
      const params = new URLSearchParams(window.location.search);
      const requestedNext = params.get('next') || '/dashboard';
      const nextPath = requestedNext.startsWith('/') ? requestedNext : '/dashboard';
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        // Callback yang dibuka langsung/di-refresh tidak memiliki token email.
        // Kembalikan user ke login agar tidak terlihat seperti error aplikasi.
        const loginUrl = nextPath === '/dashboard'
          ? '/login'
          : `/login?next=${encodeURIComponent(nextPath)}`;
        router.replace(loginUrl);
        return;
      }

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        if (active) setError(sessionError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    }

    void establishSession();
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-danger-border bg-danger-muted p-6 text-center text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Menyiapkan akses project...
    </div>
  );
}
