'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

      if (sessionError || !data.session) {
        setError('Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.');
        return;
      }

      setReady(true);
    };

    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session) {
        setReady(true);
        setError('');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    window.setTimeout(() => router.push('/login?password_reset=true'), 1200);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="groovy text-3xl text-[#1a2e1f]">Buat Password Baru</h1>
        <p className="mt-2 text-sm font-medium text-[#1a2e1f]/70">
          Masukkan password baru untuk akun Trekly-mu.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border-2 border-[#1a2e1f] bg-[#ffe1e1] p-3 text-sm font-bold text-[#8a1c1c]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-3 rounded-xl border-2 border-[#1a2e1f] bg-[#d9f7df] p-4 text-sm font-bold text-[#1a2e1f]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Password berhasil diperbarui.</span>
          </div>
          <p className="font-medium">Mengalihkan ke halaman login...</p>
        </div>
      ) : !ready ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm font-bold text-[#1a2e1f]/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memvalidasi link...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-xs font-extrabold text-[#1a2e1f]">
              Password baru
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border-2 border-[#1a2e1f] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1a2e1f] focus:outline-none focus:ring-2 focus:ring-[#ffc93c]"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-xs font-extrabold text-[#1a2e1f]">
              Ulangi password baru
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border-2 border-[#1a2e1f] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1a2e1f] focus:outline-none focus:ring-2 focus:ring-[#ffc93c]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pill mt-2 flex w-full items-center justify-center gap-2 border-[2.5px] border-[#1a2e1f] bg-[#ffc93c] py-3 text-sm font-black text-[#1a2e1f] shadow-[3px_3px_0_#1a2e1f] hover:bg-[#ffd666] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 stroke-[3]" />}
            <span>{loading ? 'Menyimpan...' : 'Simpan Password'}</span>
          </button>
        </form>
      )}

      <div className="text-center text-xs font-bold text-[#1a2e1f]/80">
        <Link href="/login" className="font-black underline underline-offset-4 hover:text-[#2d6a3e]">
          Kembali ke login
        </Link>
      </div>
    </div>
  );
}
