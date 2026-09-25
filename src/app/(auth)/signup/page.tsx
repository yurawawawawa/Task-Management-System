'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, AlertCircle, Clock, CheckCircle2, Sparkles } from 'lucide-react';
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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Pop-up Akun Sudah Terdaftar
  const [accountExistsPopup, setAccountExistsPopup] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Countdown timer saat pop-up akun sudah ada aktif
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (accountExistsPopup && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (accountExistsPopup && countdown === 0) {
      router.push(`/login?email=${encodeURIComponent(email)}&existing=true`);
    }
    return () => clearTimeout(timer);
  }, [accountExistsPopup, countdown, email, router]);

  // Email & Password Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      // Cek apakah akun sudah pernah dibuat
      if (res.status === 409 || data.code === 'USER_ALREADY_EXISTS') {
        setLoading(false);
        setCountdown(3);
        setAccountExistsPopup(true);
        return;
      }

      if (!res.ok) {
        if (data.details && data.details[0]) {
          throw new Error(data.details[0].message);
        }
        // Fallback cek jika pesan error mengindikasikan akun sudah ada
        const errLower = (data.error || '').toLowerCase();
        if (errLower.includes('already registered') || errLower.includes('sudah terdaftar') || errLower.includes('already exists')) {
          setLoading(false);
          setCountdown(3);
          setAccountExistsPopup(true);
          return;
        }
        throw new Error(data.error || 'Gagal mendaftarkan akun');
      }

      // Login otomatis setelah registrasi berhasil
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Google OAuth Signup
  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memulai pendaftaran dengan Google');
      setGoogleLoading(false);
    }
  };

  const handleImmediateLogin = () => {
    router.push(`/login?email=${encodeURIComponent(email)}&existing=true`);
  };

  return (
    <div className="relative">
      {/* ========================================================
          POP-UP MODAL: AKUN SUDAH PERNAH DIBUAT
          (Jeda 3 detik langsung masuk ke halaman login)
          ======================================================== */}
      {accountExistsPopup && (
        <div className="fixed inset-0 z-50 bg-[#1a2e1f]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-pop bg-[#fbf3e0] border-[4px] border-[#1a2e1f] rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-[10px_10px_0_#1a2e1f] text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Spinning decorative star on modal corner */}
            <div className="absolute -top-6 -right-6 w-16 h-16 spin select-none pointer-events-none opacity-50" aria-hidden="true">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38Z" fill="#ffc93c" stroke="#1a2e1f" strokeWidth="4" />
              </svg>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#ffc93c] border-[3px] border-[#1a2e1f] mx-auto flex items-center justify-center shadow-[3px_3px_0_#1a2e1f] mb-3.5">
              <CheckCircle2 className="w-7 h-7 text-[#1a2e1f] stroke-[2.5]" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full border-2 border-[#1a2e1f] bg-[#ff7eb6] text-xs font-black uppercase tracking-wider text-[#1a2e1f]">
              ✦ AKUN SUDAH ADA ✦
            </span>

            <h2 className="groovy text-2xl sm:text-3xl text-[#1a2e1f] mt-3">
              Akun Sudah Terdaftar!
            </h2>

            <p className="text-sm font-bold text-[#1a2e1f]/80 mt-2 leading-relaxed">
              Email <strong className="text-[#1a2e1f] underline">{email}</strong> sudah memiliki akun di Trekly.
            </p>

            {/* Countdown Box */}
            <div className="mt-5 p-3.5 rounded-xl border-2 border-[#1a2e1f] bg-white flex items-center justify-center gap-2.5 shadow-sm">
              <Clock className="w-4 h-4 text-[#ff7a2f] animate-spin" />
              <span className="text-xs font-extrabold text-[#1a2e1f]">
                Mengalihkan ke halaman login dalam{' '}
                <span className="inline-block px-2 py-0.5 rounded-md bg-[#ffc93c] border border-[#1a2e1f] text-sm font-black">
                  {countdown}
                </span>{' '}
                detik...
              </span>
            </div>

            {/* Tombol Langsung Masuk */}
            <button
              type="button"
              onClick={handleImmediateLogin}
              className="pill w-full mt-5 py-3.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm md:text-base border-[2.5px] border-[#1a2e1f] hover:bg-[#ffd666] flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0_#1a2e1f]"
            >
              <span>Masuk Sekarang Tanpa Menunggu</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-0.5 rounded-full border-2 border-[#1a2e1f] font-black text-[11px] uppercase tracking-wider bg-[#8fd19e] mb-2">
          ✦ DAFTAR AKUN BARU ✦
        </span>
        <h1 className="groovy text-3xl text-[#1a2e1f]">Mulai dengan Trekly</h1>
        <p className="text-xs font-bold text-[#1a2e1f]/70 mt-1">
          Gratis selamanya, tanpa perlu kartu kredit
        </p>
      </div>

      {error && (
        <div className="bg-[#ff7eb6]/20 text-[#8b1c43] p-3 rounded-xl text-xs mb-5 border-2 border-[#ff7eb6] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#ff7a2f]" />
          <span>{error}</span>
        </div>
      )}

      {/* Tombol Signup dengan Google */}
      <button
        type="button"
        onClick={handleGoogleSignup}
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
            <span>Daftar dengan Google</span>
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

      {/* Form Nama, Email, Password */}
      <form onSubmit={handleSignup} className="space-y-3.5">
        <div>
          <label htmlFor="name" className="block text-xs font-extrabold text-[#1a2e1f] mb-1">
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#1a2e1f] rounded-xl text-sm font-medium text-[#1a2e1f] placeholder:text-[#1a2e1f]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc93c] transition-all"
            placeholder="Misal: Budi Santoso"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-extrabold text-[#1a2e1f] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#1a2e1f] rounded-xl text-sm font-medium text-[#1a2e1f] placeholder:text-[#1a2e1f]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc93c] transition-all"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-extrabold text-[#1a2e1f] mb-1">
            Password (min. 6 karakter)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#1a2e1f] rounded-xl text-sm font-medium text-[#1a2e1f] placeholder:text-[#1a2e1f]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc93c] transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading || !name || !email || !password}
          className="pill w-full mt-2 py-3 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm md:text-base border-[2.5px] border-[#1a2e1f] hover:bg-[#ffd666] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_#1a2e1f]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#1a2e1f]" />
              <span>Mendaftarkan...</span>
            </>
          ) : (
            <>
              <span>Buat Akun Gratis</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs font-bold text-[#1a2e1f]/80">
        Sudah punya akun?{' '}
        <Link
          href="/login"
          className="text-[#1a2e1f] font-black underline underline-offset-4 hover:text-[#2d6a3e] transition-colors"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
