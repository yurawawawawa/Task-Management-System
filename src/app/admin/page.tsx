import { requireAdminPage } from '@/app/lib/admin/auth';
import { getOverview, getBilling, getHealth } from '@/app/lib/admin/data';
import { Heading, Metric, Growth, TrackingNote, ActivityTable, date } from './components';
import s from './admin.module.css';

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const [data, billing, health] = await Promise.all([getOverview(), getBilling(), getHealth()]);
  const observed = (value: number) => data.trackingEnabled ? value : null;
  return <>
    <Heading title="A clear view of Trekly." description={`Pertumbuhan, penggunaan, dan kondisi operasional. Diperbarui ${date(data.generatedAt)} UTC.`} />
    {!data.trackingEnabled && <p className={s.notice}>Telemetry nonaktif. Aktifkan TREKLY_ADMIN_TELEMETRY_ENABLED setelah migrasi; metrik activity/operations ditandai unavailable. Rekaman lama tetap dapat dilihat pada activity feed dan log.</p>}
    <h2 className={s.sectionTitle}>Users</h2><div className={s.grid}>
      <Metric label="Total Users" value={data.users.total} note="Profile Trekly yang tersimpan"/><Metric label="New Users Today" value={data.users.today} note="Calendar day · UTC"/>
      <Metric label="New Users This Week" value={data.users.week} note="Senin–sekarang · UTC"/><Metric label="New Users This Month" value={data.users.month} note="Calendar month · UTC"/>
    </div>
    <h2 className={s.sectionTitle}>Active users</h2><div className={s.grid}>
      <Metric label="Active Now" value={observed(data.active.now)} note="Aktivitas dalam 5 menit"/><Metric label="DAU" value={observed(data.active.dau)} note="Unique users · 24 jam"/>
      <Metric label="WAU" value={observed(data.active.wau)} note="Unique users · 7 hari"/><Metric label="MAU" value={observed(data.active.mau)} note="Unique users · 30 hari"/>
    </div><TrackingNote since={data.trackingStartedAt}/>
    <Growth rows={data.growth} since={data.trackingStartedAt}/>
    <h2 className={s.sectionTitle}>Product footprint</h2><div className={s.grid}>
      <Metric label="Projects Created" value={data.product.projects} note="Project yang masih tersimpan"/><Metric label="Tasks Created" value={data.product.tasks} note="Task yang masih tersimpan"/>
      <Metric label="Tasks Completed" value={data.product.completed} note="Task dengan status DONE saat ini"/><Metric label="Habits Created" value={data.product.habits} note="Habit yang masih tersimpan"/>
      <Metric label="Active Projects" value={data.product.activeProjects} note="Memiliki task TODO / IN_PROGRESS"/>
    </div>
    <h2 className={s.sectionTitle}>Operations · 24 jam</h2><div className={s.grid}>
      <Metric label="Observed API Requests" value={observed(data.operations.requests)}/><Metric label="Failed Requests" value={observed(data.operations.failedRequests)} note="HTTP 4xx dan 5xx"/>
      <Metric label="Server Failures" value={observed(data.operations.serverFailures)} note="HTTP 5xx"/><Metric label="Unhandled Errors" value={observed(data.operations.errors)}/>
      <Metric label="Database" value="Reachable" note={`Query probe: ${health.databaseLatencyMs} ms`}/>
      <Metric label="API · last success" value={health.api ? 'Observed' : null} note={health.api ? `${date(health.api)} UTC; bukan uptime` : 'Belum ada request sukses teramati'}/>
      <Metric label="Auth Failures" value={observed(data.operations.authFailures)} note="Observasi aplikasi, bukan seluruh log provider"/>
      <Metric label="Security Events" value={observed(data.operations.securityEvents)} note="Penolakan akses yang tercatat"/>
    </div>
    <h2 className={s.sectionTitle}>Subscriptions & revenue</h2><p className={s.notice}>{billing.reason} Semua nilai billing belum dapat dihitung; user tanpa data billing tidak otomatis dikategorikan free.</p>
    <div className={s.grid}>{billing.metrics.map(label => <Metric key={label} label={label} value={null}/>)}</div>
    <section className={s.panel}><h2>Recent activity</h2><ActivityTable rows={data.activity}/></section>
  </>;
}
