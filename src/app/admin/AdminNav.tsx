'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, Banknote, ChartNoAxesCombined, Activity, TriangleAlert, ShieldCheck, ScrollText } from 'lucide-react';
import s from './admin.module.css';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard, pending: true },
  { href: '/admin/revenue', label: 'Revenue', icon: Banknote, pending: true },
  { href: '/admin/analytics', label: 'Product Analytics', icon: ChartNoAxesCombined },
  { href: '/admin/operations', label: 'Operations', icon: Activity },
  { href: '/admin/errors', label: 'Errors', icon: TriangleAlert },
  { href: '/admin/security', label: 'Security', icon: ShieldCheck },
  { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
];
export default function AdminNav() {
  const pathname = usePathname();
  return <nav className={s.nav} aria-label="Admin navigation">{links.map(({href, label, icon: Icon, pending}) =>
    <Link key={href} href={href} prefetch={false} aria-current={pathname === href || (href === '/admin/users' && pathname.startsWith('/admin/users/')) ? 'page' : undefined}>
      <Icon size={17} aria-hidden="true" /><span>{label}</span>{pending && <small>N/A</small>}
    </Link>)}</nav>;
}
