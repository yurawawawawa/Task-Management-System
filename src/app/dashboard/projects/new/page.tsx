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
      <Link href="/dashboard" className="inline-flex items-center min-h-[44px] md:min-h-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      <div className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Create a new project</h1>
        <p className="text-muted-foreground text-sm mb-8">Projects let you organize tasks, track progress, and manage your team's work in one place.</p>

        {error && (
          <div className="bg-danger-muted text-danger p-4 rounded-xl text-sm mb-8 border border-danger-border font-medium flex items-start">
            <span className="shrink-0 mr-2">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Project Name <span className="text-muted-foreground/80 font-normal">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoFocus
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-primary focus:bg-white text-foreground transition-all placeholder:text-muted-foreground/80"
              placeholder="e.g., Q4 Marketing Campaign"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Description <span className="text-muted-foreground/80 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-primary focus:bg-white text-foreground transition-all placeholder:text-muted-foreground/80 resize-none"
              placeholder="Briefly describe the goals of this project..."
            />
          </div>

          <div className="pt-6 flex items-center justify-end border-t border-border-light gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 min-h-[44px] md:min-h-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 h-11 md:h-9 rounded-xl font-medium text-sm hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
