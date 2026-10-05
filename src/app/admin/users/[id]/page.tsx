import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/app/lib/admin/auth';
import { getUserDetail } from '@/app/lib/admin/data';
import { Heading, Metric, ActivityTable, date } from '../../components';
import s from '../../admin.module.css';

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { user, activity } = await getUserDetail(id);
  if (!user) notFound();
  return <><Link className={s.button} href="/admin/users" prefetch={false}>← Users</Link>
    <Heading title={user.name} description="Profil operasional dan 50 aktivitas terbaru."/>
    <section className={s.panel}><dl className={s.details}>
      {Object.entries({Email:user.email, Role:user.role, 'User ID':user.id, 'Signup (UTC)':date(user.created_at), 'Last active (UTC)':date(user.last_active), Plan:'Unavailable', Subscription:'Unavailable'}).map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl></section><div className={s.grid}><Metric label="Projects" value={user.projects}/><Metric label="Tasks" value={user.tasks}/><Metric label="Completed tasks" value={user.completed_tasks}/></div>
    <section className={s.panel}><h2>Recent activity</h2><ActivityTable rows={activity}/></section>
  </>;
}
