'use client';
import { useState } from 'react';
import Link from 'next/link';
import TreklySelect from '@/app/components/TreklySelect';
import type { parseUserFilters } from '@/app/lib/admin/policy';
import s from '../admin.module.css';

export default function UserFilters({ filters }: { filters: ReturnType<typeof parseUserFilters> }) {
  const [role, setRole] = useState(filters.role);
  const [activity, setActivity] = useState(filters.activity);
  const [sort, setSort] = useState(filters.sort);
  const [subscription, setSubscription] = useState(filters.subscription);
  return <form action="/admin/users" method="get" className={s.filters}>
    <label><span>Cari user</span><input name="q" defaultValue={filters.search} placeholder="Nama atau email" maxLength={160}/></label>
    <label><span>Role</span><TreklySelect ariaLabel="Filter role" value={role} onChange={setRole} options={[{value:'',label:'Semua role'},{value:'USER',label:'User'},{value:'ADMIN',label:'Admin'}]}/><input type="hidden" name="role" value={role}/></label>
    <label><span>Aktivitas · 30 hari</span><TreklySelect ariaLabel="Filter aktivitas" value={activity} onChange={setActivity} options={[{value:'',label:'Semua aktivitas'},{value:'active',label:'Aktif'},{value:'inactive',label:'Tidak teramati aktif'}]}/><input type="hidden" name="activity" value={activity}/></label>
    <label><span>Urutkan</span><TreklySelect ariaLabel="Urutkan user" value={sort} onChange={setSort} options={[{value:'newest',label:'Signup terbaru'},{value:'oldest',label:'Signup terlama'},{value:'activity',label:'Aktivitas terbaru'}]}/><input type="hidden" name="sort" value={sort}/></label>
    <label><span>Subscription</span><TreklySelect ariaLabel="Filter subscription" value={subscription} onChange={setSubscription} options={[{value:'',label:'Semua status'},{value:'unavailable',label:'Unavailable'}]}/><input type="hidden" name="subscription" value={subscription}/></label>
    <div className="flex items-end gap-2"><button className={`${s.button} ${s.primary}`} type="submit">Terapkan filter</button><Link className={s.button} href="/admin/users" prefetch={false}>Reset</Link></div>
  </form>;
}
