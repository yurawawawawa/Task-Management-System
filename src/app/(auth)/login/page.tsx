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
        <h1 className="text-xl font-bold text-black tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Log in to your Taskora account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 font-medium flex items-start">
          <span className="shrink-0 mr-2">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-black">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white text-black transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-black">Password</label>
            <Link href="#" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white text-black transition-all placeholder:text-gray-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-black text-white py-2.5 px-4 rounded-xl font-medium hover:bg-black transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2 flex items-center justify-center"
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

      <div className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-black font-semibold hover:underline decoration-gray-300 underline-offset-4 transition-all">
          Sign up for free
        </Link>
      </div>
    </div>
  );
}
