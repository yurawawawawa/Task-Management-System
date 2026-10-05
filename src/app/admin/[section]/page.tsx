import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/app/lib/admin/auth';
import { getOverview, getBilling, getLogs, getHealth } from '@/app/lib/admin/data';
import { Heading, Metric, Growth, ActivityTable, TrackingNote, LogTable, Pagination, date } from '../components';
import s from '../admin.module.css';

export default async function AdminSection({ params, searchParams }: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const { section } = await params;
  if (section === 'subscriptions' || section === 'revenue') {
    const billing = await getBilling();
    const metrics = section === 'subscriptions' ? billing.metrics.slice(0,6) : billing.metrics.slice(6);
    return <><Heading title={section === 'revenue' ? 'Revenue' : 'Subscriptions'} description="Kesiapan data billing Trekly."/>
      <p className={s.notice}>{billing.reason}</p><div className={s.grid}>{metrics.map(label => <Metric key={label} label={label} value={null}/>)}</div>
      <section className={s.panel}><h2>Sumber data yang diperlukan</h2><ul className="list-disc space-y-2 pl-5 text-sm">{billing.requirements.map(item => <li key={item}>{item}</li>)}</ul><p className={s.muted}>MRR membutuhkan recurring amount dan billing interval, dengan currency yang sama. Status paid harus berasal dari subscription dan pembayaran yang tervalidasi.</p></section></>;
  }
  if (section === 'analytics') {
    const data = await getOverview();
    return <><Heading title="Product Analytics" description="Penggunaan produk dari record dan aktivitas yang tersimpan."/><TrackingNote since={data.trackingStartedAt}/>
      {!data.trackingEnabled && <p className={s.notice}>Telemetry sedang nonaktif; aktivitas baru tidak dicatat.</p>}
      <div className={s.grid}><Metric label="Projects" value={data.product.projects}/><Metric label="Tasks" value={data.product.tasks}/><Metric label="Tasks Completed" value={data.product.completed}/><Metric label="Habits" value={data.product.habits}/><Metric label="Active Projects" value={data.product.activeProjects} note="Project dengan task TODO / IN_PROGRESS"/></div>
      <p className={s.muted}>Total entity hanya mencakup record yang masih tersimpan; bukan total historis yang sudah dihapus.</p><Growth rows={data.growth} since={data.trackingStartedAt}/><section className={s.panel}><h2>Activity feed</h2><ActivityTable rows={data.activity}/></section></>;
  }
  if (!['operations','errors','security','audit'].includes(section)) notFound();
  const kind = section as 'operations' | 'errors' | 'security' | 'audit';
  const logs = await getLogs(kind, Number((await searchParams).page || 1));
  const health = section === 'operations' ? await getHealth() : null;
  const titles = {operations:'Operations',errors:'Errors',security:'Security',audit:'Audit Logs'};
  return <><Heading title={titles[kind]} description={kind === 'audit' ? 'Akses admin dan perubahan role melalui database. Read-only; tanpa aksi hapus user.' : 'Log terstruktur dari aplikasi Trekly sejak tracking diaktifkan.'}/>
    {health && <><div className={s.grid}><Metric label="Database health" value="Reachable" note={`${health.databaseLatencyMs} ms · probe saat ini`}/><Metric label="Authentication" value="Verified" note="Sesi admin saat ini berhasil diverifikasi Supabase"/><Metric label="API 5xx · 15 menit" value={health.failures}/><Metric label="Webhook failures" value={null} note="Integrasi webhook belum tersedia"/></div>
      <section className={s.panel}><h2>Health observations</h2><p className={s.muted}>API success terakhir: {date(health.api)} UTC. Auth success terakhir: {date(health.auth)} UTC. {health.coverage} Tidak ada observasi baru tidak berarti layanan sehat.</p></section></>}
    {kind === 'security' && <p className={s.notice}>Mencakup hasil request autentikasi dan akses yang ditolak. Data ini tidak mencakup semua log Supabase Auth, OAuth provider, atau aktivitas di luar aplikasi.</p>}
    {kind === 'errors' && <p className={s.notice}>Mencakup respons API 5xx dan unhandled server errors/actions. Failed requests 4xx dapat dilihat di Operations. Password, token, body request, dan error mentah tidak disimpan.</p>}
    <section className={s.panel}><LogTable rows={logs.rows}/><Pagination {...logs} path={`/admin/${section}`}/></section>
  </>;
}
