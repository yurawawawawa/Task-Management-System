'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">Create a new project</h1>
        <p className="text-gray-500 text-sm mb-8">Projects let you organize tasks, track progress, and manage your team's work in one place.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100 font-medium flex items-start">
            <span className="shrink-0 mr-2">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black">
              Project Name <span className="text-gray-400 font-normal">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white text-black transition-all placeholder:text-gray-400"
              placeholder="e.g., Q4 Marketing Campaign"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-black">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black focus:bg-white text-black transition-all placeholder:text-gray-400 resize-none"
              placeholder="Briefly describe the goals of this project..."
            />
          </div>

          <div className="pt-6 flex items-center justify-end border-t border-gray-100 gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center justify-center bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
