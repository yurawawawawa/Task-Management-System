import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { requireAdminPage } from '@/app/lib/admin/auth';
import AdminNav from './AdminNav';
import s from './admin.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Trekly · Control Center', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return <div className={s.shell}>
    <header className={s.header}>
      <div className={s.brand}><ShieldCheck size={30} aria-hidden="true" /><div>Trekly<small>Control Center</small></div></div>
      <div><span className={s.badge}>ADMIN · {admin.name}</span> <Link href="/dashboard">Kembali ke aplikasi ↗</Link></div>
    </header>
    <div className={s.layout}><AdminNav /><main className={s.main}>{children}</main></div>
  </div>;
}
