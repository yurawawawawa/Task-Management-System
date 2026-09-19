'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to your Taskora account</p>
      </div>

      {error && (
        <div className="bg-danger-muted text-danger p-3 rounded-xl text-sm mb-6 border border-danger-border font-medium flex items-start">
          <span className="shrink-0 mr-2">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 h-11 md:h-9 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-primary focus:bg-white text-foreground transition-all placeholder:text-muted-foreground/80"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-foreground">Password</label>
            <Link href="#" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px] md:min-h-0">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 h-11 md:h-9 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-primary focus:bg-white text-foreground transition-all placeholder:text-muted-foreground/80"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-primary text-primary-foreground h-11 md:h-9 px-4 rounded-xl font-medium hover:bg-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground py-2 md:py-0">
        Don't have an account?{' '}
        <Link href="/register" className="text-foreground font-semibold hover:underline decoration-gray-300 underline-offset-4 transition-all">
          Sign up for free
        </Link>
      </div>
    </div>
  );
}
