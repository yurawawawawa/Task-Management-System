'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import s from './admin.module.css';

export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" className={s.button} disabled={pending} aria-busy={pending}
    onClick={() => startTransition(() => router.refresh())}>
    <RefreshCw size={14} aria-hidden="true" className={pending ? 'animate-spin motion-reduce:animate-none' : ''}/>
    {pending ? 'Memperbarui…' : 'Refresh data'}
  </button>;
}
