import Link from 'next/link';
import { requireAdminPage } from '@/app/lib/admin/auth';
import { getUsers } from '@/app/lib/admin/data';
import { parseUserFilters } from '@/app/lib/admin/policy';
import { Heading, Pagination, date, toSearchParams } from '../components';
import UserFilters from './UserFilters';
import s from '../admin.module.css';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const params = toSearchParams(await searchParams);
  const result = await getUsers(params);
  return <><Heading title="Users" description="Akun Trekly, aktivitas produk, dan penggunaan. Data billing belum terhubung."/>
    <UserFilters key={params.toString()} filters={parseUserFilters(params)}/>
    <section className={s.panel}><p className={s.muted}>Tidak teramati aktif berarti tidak memiliki event bermakna dalam 30 hari sejak tracking tersedia; bukan bukti bahwa akun tidak pernah digunakan.</p>
      <div className={s.tableWrap}><table className={s.table}><thead><tr><th>User</th><th>Role</th><th>Plan / Subscription</th><th>Signup · UTC</th><th>Last active · UTC</th><th>Projects</th><th>Tasks</th><th>Completed</th></tr></thead>
        <tbody>{result.users.map(user => <tr key={user.id}>
          <td><span className={s.avatar} aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span><Link href={`/admin/users/${user.id}`} prefetch={false}>{user.name}</Link><small>{user.email}</small></td>
          <td><span className={s.badge}>{user.role}</span></td><td><span className={`${s.badge} ${s.warning}`}>Unavailable</span></td>
          <td>{date(user.created_at)}</td><td>{date(user.last_active)}</td><td>{user.projects}</td><td>{user.tasks}</td><td>{user.completed_tasks}</td>
        </tr>)}</tbody></table></div>
      {!result.users.length && <p className={s.empty}>Tidak ada user yang cocok dengan filter ini.</p>}
      <Pagination {...result} path="/admin/users" params={params}/>
    </section></>;
}
