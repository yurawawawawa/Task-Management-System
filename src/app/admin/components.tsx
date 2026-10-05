import Link from 'next/link';
import type { ActivityRow, LogRow, Overview } from '@/app/lib/admin/data';
import s from './admin.module.css';
import RefreshButton from './RefreshButton';

export function date(value: string | null) {
  return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)) : 'Belum teramati';
}
export function Heading({ title, description }: { title: string; description: string }) {
  return <div className={s.heading}><div><p className={s.eyebrow}>Trekly / Admin workspace</p><h1>{title}</h1><p>{description}</p></div>
    <RefreshButton/></div>;
}
export function Metric({ label, value, note }: { label: string; value: number | string | null; note?: string }) {
  return <div className={s.card}><h3>{label}</h3><div className={s.value}>{value === null ? '—' : typeof value === 'number' ? value.toLocaleString('id-ID') : value}</div><small>{value === null ? `Unavailable${note ? ` · ${note}` : ''}` : note || 'Data Trekly'}</small></div>;
}
export function TrackingNote({ since }: { since: string }) {
  return <p className={s.notice}>Tracking aktif sejak <strong>{date(since)} UTC</strong>. Active Now = 5 menit; DAU = 24 jam; WAU = 7 hari; MAU = 30 hari. Hanya aktivitas produk bermakna, dihitung per user unik. Login dikecualikan. Window sebelum tanggal tracking belum memiliki histori lengkap.</p>;
}
export function Growth({ rows, since }: { rows: Overview['growth']; since: string }) {
  const max = Math.max(1, ...rows.flatMap(row => [row.signups, row.active]));
  return <section className={s.panel}><h2>User growth & engagement</h2><p className={s.muted}>30 hari · hijau: signup · kuning: daily active users · UTC</p>
    <div className={s.chart} role="img" aria-label="Signup dan pengguna aktif selama 30 hari; nilai lengkap tersedia di tabel di bawah.">
      {rows.map(row => <div key={row.day} className={s.barSlot} title={`${row.day}: ${row.signups} signup; ${row.day < since.slice(0,10) ? 'activity unavailable' : `${row.active} active`}`}>
        <div className={s.bar} style={{height: `${row.signups / max * 100}%`}} />
        <div className={`${s.bar} ${s.barAlt}`} style={{height: `${row.active / max * 100}%`}} />
      </div>)}
    </div><div className={s.chartLabels}><span>{rows[0]?.day}</span><span>{rows.at(-1)?.day}</span></div>
    <details className={s.muted}><summary>Lihat angka harian</summary><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Tanggal UTC</th><th>Signup</th><th>Active users</th></tr></thead><tbody>{rows.map(row => <tr key={row.day}><td>{row.day}</td><td>{row.signups}</td><td>{row.day < since.slice(0,10) ? 'Unavailable' : row.active}</td></tr>)}</tbody></table></div></details>
  </section>;
}
export function ActivityTable({ rows }: { rows: ActivityRow[] }) {
  return rows.length ? <div className={s.tableWrap}><table className={s.table}><thead><tr><th>User</th><th>Aktivitas</th><th>Waktu UTC</th></tr></thead><tbody>{rows.map(row =>
    <tr key={row.id}><td><Link href={`/admin/users/${row.user_id}`} prefetch={false}>{row.name}</Link></td><td>{row.event_type.replaceAll('_',' ')}<small>{row.entity_type}</small></td><td>{date(row.created_at)}</td></tr>)}</tbody></table></div> : <p className={s.empty}>Belum ada event yang tercatat sejak tracking diaktifkan.</p>;
}
export function LogTable({ rows }: { rows: LogRow[] }) {
  return rows.length ? <div className={s.tableWrap}><table className={s.table}><thead><tr><th>Waktu UTC</th><th>Operasi</th><th>Hasil</th><th>Actor</th></tr></thead><tbody>{rows.map(row =>
    <tr key={row.id}><td>{date(row.created_at)}</td><td>{row.operation}<small>{row.category}{row.code ? ` · ${row.code}` : ''}{row.duration_ms !== null ? ` · ${row.duration_ms} ms` : ''}</small>{row.target_id && <small>Target: <Link href={`/admin/users/${row.target_id}`} prefetch={false}>{row.target_id.slice(0,8)}…</Link></small>}</td><td><span className={`${s.badge} ${row.outcome === 'SUCCESS' ? '' : s.danger}`}>{row.outcome}{row.status_code ? ` · ${row.status_code}` : ''}</span></td><td>{row.user_id ? <Link href={`/admin/users/${row.user_id}`} prefetch={false}>{row.user_id.slice(0,8)}…</Link> : 'System / anonymous'}</td></tr>)}</tbody></table></div> : <p className={s.empty}>Belum ada log untuk kategori ini.</p>;
}
export function Pagination({ total, page, limit, path, params = new URLSearchParams() }: { total: number; page: number; limit: number; path: string; params?: URLSearchParams }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  function href(next: number) { const query = new URLSearchParams(params); query.set('page', String(next)); return `${path}?${query}`; }
  return <div className={s.pagination}><span>{total.toLocaleString('id-ID')} hasil · Halaman {page} / {pages}</span><div>{page > 1 && <Link className={s.button} prefetch={false} href={href(page-1)}>← Sebelumnya</Link>} {page < pages && <Link className={s.button} prefetch={false} href={href(page+1)}>Berikutnya →</Link>}</div></div>;
}
export function toSearchParams(input: Record<string, string | string[] | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (typeof value === 'string') result.set(key, value);
  return result;
}
