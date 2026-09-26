'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.09 3.66-5.17 3.66-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const oauthError = searchParams.get('error');
  const emailParam = searchParams.get('email') || '';
  const existingParam = searchParams.get('existing') === 'true';

  const passwordParam = searchParams.get('password') || '';
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState(passwordParam);
  const [error, setError] = useState(
    oauthError === 'auth_callback_failed'
      ? 'Gagal masuk dengan Google. Silakan coba kembali.'
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sinkronkan email jika emailParam berubah di URL
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Jika password sempat terbawa di query parameter karena submit native, masukkan ke state dan bersihkan URL
  useEffect(() => {
    if (passwordParam) {
      setPassword(passwordParam);
      const cleanUrl = window.location.pathname + (emailParam ? `?email=${encodeURIComponent(emailParam)}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [passwordParam, emailParam]);

  // Fungsi proses submit login
  const submitCredentials = async () => {
    if (loading || googleLoading) return;
    setError('');

    const formEmail = email.trim();
    const formPassword = password;

    if (!formEmail) {
      setError('Silakan masukkan email Anda.');
      return;
    }

    if (!formPassword) {
      setError('Silakan masukkan password Anda.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formEmail, password: formPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Email atau password salah');
      }

      // Gunakan window.location.href untuk hard redirect ke /dashboard dengan cookie sesi baru
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    submitCredentials();
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memulai login Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-0.5 rounded-full border-2 border-[#1a2e1f] font-black text-[11px] uppercase tracking-wider bg-[#ffc93c] mb-2">
          ✦ MASUK KE AKUN ✦
        </span>
        <h1 className="groovy text-3xl text-[#1a2e1f]">Selamat Datang</h1>
        <p className="text-xs font-bold text-[#1a2e1f]/70 mt-1">
          Lanjutkan kelola proyek & tugasmu di Trekly
        </p>
      </div>

      {existingParam && (
        <div className="bg-[#ffc93c]/30 text-[#1a2e1f] p-3 rounded-xl text-xs mb-5 border-2 border-[#1a2e1f] font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2d6a3e]" />
          <span>Akun dengan email ini sudah terdaftar. Silakan masukkan password-mu untuk masuk.</span>
        </div>
      )}

      {registered && (
        <div className="bg-[#8fd19e]/20 text-[#1f4d2b] p-3 rounded-xl text-xs mb-5 border-2 border-[#8fd19e] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2d6a3e]" />
          <span>Akun berhasil dibuat! Silakan masuk dengan email dan password-mu.</span>
        </div>
      )}

      {error && (
        <div className="bg-[#ff7eb6]/20 text-[#8b1c43] p-3 rounded-xl text-xs mb-5 border-2 border-[#ff7eb6] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#ff7a2f]" />
          <span>{error}</span>
        </div>
      )}

      {/* Tombol Login dengan Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="pill w-full py-3 bg-white text-[#1a2e1f] font-extrabold text-sm border-[2.5px] border-[#1a2e1f] flex items-center justify-center gap-2.5 hover:bg-[#fbf3e0] disabled:opacity-50 transition-all cursor-pointer shadow-[3px_3px_0_#1a2e1f]"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#1a2e1f]" />
            <span>Menghubungkan ke Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-4 h-4" />
            <span>Login dengan Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-5 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-[#1a2e1f]/20" />
        </div>
        <span className="relative px-3 bg-white text-xs font-bold uppercase tracking-wider text-[#1a2e1f]/60">
          atau dengan email
        </span>
      </div>

      {/* Form Email & Password */}
      <form action="#" method="POST" onSubmit={handleLogin} className="space-y-3.5">
        <div>
          <label htmlFor="email" className="block text-xs font-extrabold text-[#1a2e1f] mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCredentials();
              }
            }}
            required
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#1a2e1f] rounded-xl text-sm font-medium text-[#1a2e1f] placeholder:text-[#1a2e1f]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc93c] transition-all"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-xs font-extrabold text-[#1a2e1f]">
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitCredentials();
              }
            }}
            required
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#1a2e1f] rounded-xl text-sm font-medium text-[#1a2e1f] placeholder:text-[#1a2e1f]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc93c] transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="button"
          onClick={submitCredentials}
          disabled={loading || googleLoading}
          className="pill w-full mt-2 py-3 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm md:text-base border-[2.5px] border-[#1a2e1f] hover:bg-[#ffd666] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_#1a2e1f]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#1a2e1f]" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs font-bold text-[#1a2e1f]/80">
        Belum punya akun?{' '}
        <Link
          href="/signup"
          className="text-[#1a2e1f] font-black underline underline-offset-4 hover:text-[#2d6a3e] transition-colors"
        >
          Daftar akun gratis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm font-bold text-[#1a2e1f]/60 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#1a2e1f]" />
          <span>Memuat formulir...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
