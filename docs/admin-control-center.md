# Trekly Admin Control Center

## Status dan sumber data

Implementasi mengikuti Next.js App Router 16.3.5, TypeScript, Supabase Auth, PostgreSQL, dan Prisma 8 raw-query/ORM existing. Tidak ada dependency aplikasi baru. UI memakai palette forest/cream Trekly dan `TreklySelect` existing untuk filter.

**Migrasi belum diterapkan ke database live, sesuai permintaan pemilik. Tidak ada akun yang dipromosikan.** Telemetry default nonaktif. Halaman admin baru dapat dipakai setelah migrasi dan promosi manual; kegagalan membaca role tidak pernah memberi akses.

Audit source dan metadata database menemukan `profiles`, `projects`, `tasks`, `habits`, `habit_completions`, `daily_activities`, `project_members`, dan `project_invites`. Tidak ditemukan ledger pembayaran, subscription lifecycle, Midtrans, atau webhook pembayaran. UI subscription pada Settings bukan bukti billing.

| Metric | Sumber / definisi |
| --- | --- |
| Total/new users | `profiles`, berdasarkan `created_at`; hari/bulan kalender UTC, minggu mulai Senin. Bukan jumlah akun provider yang belum memiliki profile aplikasi. |
| Active Now / DAU / WAU / MAU | Distinct `user_id` dari allowlist meaningful activity dalam 5 menit / rolling 24 jam / 7 hari / 30 hari. Login tidak dihitung. |
| Growth chart | Signup per tanggal UTC dan distinct meaningful users per hari, 30 hari terakhir. Aktivitas sebelum tracking ditandai unavailable, bukan historis nol. |
| Project/task/habit totals | Record yang masih tersimpan; bukan total historis termasuk entity yang dihapus. Completed = status `DONE`. |
| Active projects | Project yang memiliki task `TODO` atau `IN_PROGRESS`. Tidak ada enum project-status baru. |
| Failed API requests | Respons 4xx dan 5xx yang teramati oleh wrapper, 24 jam. Server failures hanya 5xx. |
| Database health | Query probe pada request sekarang dan waktu pulang-perginya. Bukan external uptime/SLA monitor. |
| Authentication health | Verifikasi sesi admin sekarang; observasi hasil auth API/OAuth callback. Bukan seluruh log Supabase Auth. |
| API health | Waktu respons API sukses terakhir dan API 5xx dalam 15 menit. Tidak ada traffic tidak dianggap healthy. |
| Free/paid/trial/subscriptions/revenue/MRR/payments/webhooks | **Unavailable**. Tidak mengasumsikan semua user free. Memerlukan subscription, payment ledger, currency, paid/refund timestamps, billing interval, dan webhook terverifikasi/idempotent. |

`daily_activities` adalah agregat produktivitas, bukan daftar event/last-active yang presisi. Tidak digunakan untuk membuat histori engagement palsu. Telemetry dimulai setelah aktivasi; tidak ada backfill login menjadi meaningful activity.

## Aktivasi oleh operator

1. Review dan terapkan `migrations/admin-control-center.sql` **satu kali**, secara atomik melalui migration runner/SQL editor berotoritas, ke environment yang telah disetujui. Untuk `psql`: `psql <connection> -v ON_ERROR_STOP=1 --single-transaction -f migrations/admin-control-center.sql`. Jangan menaruh connection string/credential dalam commit atau output publik.
2. Migrasi menambahkan `profiles.role` (`USER`/`ADMIN`, default `USER`) dan schema privat `trekly_admin`: `tracking_config`, `activity_events`, `operation_events`, `audit_logs`. Existing profiles menjadi USER. INSERT selalu dipaksa USER, termasuk profile sync dari Auth metadata.
3. Pastikan server `DATABASE_URL` memakai trusted backend DB role yang bisa mengakses schema privat. Browser `anon`/`authenticated` tidak diberikan akses. Tidak perlu menambahkan `trekly_admin` ke exposed schemas Supabase.
4. Promosikan **akun existing yang identitasnya sudah diverifikasi**, memakai koneksi database tepercaya. Tidak ada public admin signup atau endpoint role-edit.

   ```sql
   -- Ganti UUID setelah memverifikasi akun yang dimaksud. Jangan promote seluruh user.
   UPDATE public.profiles
   SET role = 'ADMIN', updated_at = now()
   WHERE id = '<verified-user-uuid>'::uuid
   RETURNING id, email, role;
   ```

   Trigger mencatat target dan role baru dalam audit log. Actor ditampilkan System karena SQL manual tidak mempunyai sesi aplikasi admin. Demotion menggunakan UPDATE serupa ke `USER` dan berlaku pada request berikutnya.

5. Set server-only `TREKLY_ADMIN_TELEMETRY_ENABLED=true`, lalu restart/redeploy aplikasi. Jangan menggunakan prefix `NEXT_PUBLIC_`. Saat false, tidak ada penulisan telemetry aktivitas/operasi; audit akses admin tetap wajib dan fail-closed.
6. Login melalui login Trekly biasa, lalu buka `/admin`. User biasa tetap menggunakan `/dashboard` dan ditolak dari admin. Tidak ada akun demo/password admin/bypass lokal.

Migrasi ini merupakan SQL extension terpisah menggunakan raw lane Prisma; file contract/generated Prisma existing tidak di-regenerate atau ditimpa. Review migrasi Prisma berikutnya agar **mempertahankan** kolom role, trigger, index, dan schema privat ini; jangan gunakan schema reset/sync destruktif untuk deploy. Jalankan sidecar SQL ini selain workflow migrasi existing.

Untuk menonaktifkan rollout, set telemetry false dan demote admin melalui database. Jangan drop tabel/audit untuk rollback aplikasi; data historis dapat dipertahankan.

## Otorisasi dan data aman

- Semua page admin serta layout memverifikasi `getAuthUser()` server-side dan role terbaru dari DB. Semua accessor data memverifikasi ulang; tidak bergantung pada layout yang dapat dipertahankan client router.
- Seluruh admin GET API mengecek sesi/role sebelum routing/data. Anonymous = 401; authenticated non-admin = 403. Pages redirect aman ke login/dashboard. Database gagal = fail-closed, tanpa error/credential mentah.
- Auth user metadata, localStorage, query params, dan request signup tidak dipercaya untuk role. Signup validation existing hanya mengambil name/email/password.
- Response admin dynamic dan `private, no-store`; admin link prefetch dinonaktifkan. Tidak ada server action admin, endpoint suspend/delete/promote, atau destructive button.
- Query memakai bound parameters; role/sort/filter allowlist; search length maksimum 160; page size tetap 20 user / 30 log.
- DTO user hanya id, name, email, role, waktu signup/activity, dan aggregate counts. Tidak mengambil password hash, session, OAuth secret, API key, JWT, atau refresh token. Avatar memakai initial karena profile existing tidak mempunyai kolom avatar yang tersedia untuk semua user.
- RLS aktif pada semua tabel privat; grants `PUBLIC`, `anon`, `authenticated` dicabut. Kolom role tidak mendapat client INSERT/UPDATE grants. Trigger menolak client promotion bahkan jika policy UPDATE yang terlalu luas ditambahkan kemudian.
- Audit menyimpan akses admin yang diotorisasi serta perubahan role manual. Audit write wajib sebelum privileged read; bila gagal, data tidak diberikan. Penolakan akses ada di security events saat telemetry aktif. Ini bukan immutable external audit archive; trusted DBA tetap mempunyai kendali database.

## Coverage telemetry

Event berhasil dicatat setelah mutasi task create/update/complete (personal dan project), project create/update/delete, habit create/complete/uncomplete, invite collaborator/share link, dan join project. Task delete via REST juga tercatat. Personal task/habit delete tidak diinstrumentasi sebagai meaningful event; daftar event tersedia disiapkan untuk extensibility. No-op status/completion tidak menambah event. Login boleh masuk activity feed tetapi tidak masuk active counts.

Semua route API aplikasi yang ada dibungkus status/duration telemetry, termasuk auth, tasks, projects, productivity, preferences, dan admin. OAuth callback merekam hasil auth secara eksplisit. Next `onRequestError` merekam uncaught server render/action/route errors pada Node runtime. Error yang sama dapat mempunyai record API 5xx dan record uncaught ERROR; keduanya ditampilkan sebagai jenis observasi berbeda, bukan unique incident count.

Tidak menyimpan request body, query string, header, cookie, email dalam metadata, IP, raw error/stack, password atau token. Log memakai route template/operation code dari kode dan numeric HTTP/duration. Authentication yang seluruhnya terjadi di client/provider (mis. implicit email confirm) dan kegagalan sebelum handler berjalan tidak seluruhnya tercakup. Tambahkan provider log ingestion/external health monitor bila diperlukan.

Telemetry best-effort: kegagalan pencatatan tidak membatalkan business mutation. Artinya metrik activity/operations adalah **observed events**, bukan ledger transaksi yang dijamin exactly-once. Tracking start adalah waktu provisioning tabel; periode sebelum aktivasi atau ketika flag off tidak lengkap. Tidak ada retention job/purge otomatis; tetapkan kebijakan retention sesuai kebutuhan sebelum volume produksi besar.

Saat menginstrumentasi project status action, pemeriksaan owner/member yang sudah digunakan halaman project juga diterapkan pada action server yang sebelumnya tidak memeriksa ownership. Assignment values, payload task, API response contracts, dan enum status/priority tidak berubah.

## Route dan file utama

- `src/app/admin/`: layout/navigation, overview, users + detail, sections analytics/operations/errors/security/audit, unavailable billing, refresh button dan responsive styles.
- `src/app/api/admin/[...path]/route.ts`: read-only API overview/users/users/:id/health/subscriptions/revenue/operations/errors/security/audit.
- `src/app/lib/admin/`: policy, role DAL, parameterized aggregates, SQL adapter, telemetry, tests.
- `src/instrumentation.ts`: sanitized unhandled server-error ingestion.
- `migrations/admin-control-center.sql`: additive schema, indexes, RLS/grants, forced USER signup dan role audit trigger.
- Existing API handlers, dashboard actions, project actions/join dan auth callback: telemetry hooks; response/business flow tetap dipertahankan.
- `.env.example`, `vitest.config.ts`, `tests/server-only.ts`: opt-in server configuration dan Node test setup.

## Verifikasi

- `npm.cmd test`: unit + PostgreSQL integration tests. Database test **in-memory PGlite dari toolchain Prisma existing**, fixture hanya di test, tidak menyentuh database live. Menguji migrasi nyata, unique activity windows, query aggregate/filter/pagination, null parameter, SQL injection input, RLS/grants, trigger default USER/escalation rejection, audit, telemetry failure, disabled telemetry, session/role guard dan API 401/403/no-store.
- `npx.cmd tsc --noEmit` dan `npm.cmd run build` untuk seluruh project.
- Lint scoped admin: `npx.cmd eslint src/app/admin src/app/lib/admin src/app/api/admin src/instrumentation.ts vitest.config.ts tests`.
- Full lint tetap menemukan existing `any`, unused declarations, hook warnings, dan generated contract rules di luar modul baru; bukan disembunyikan melalui perubahan rule global.
- HTTP smoke test produksi lokal: anonymous admin pages → 307 login; API → 401 dengan `no-store`.
- Authenticated admin browser/E2E pada Supabase **belum dijalankan** karena pemilik meminta database live tidak diubah. Setelah rollout, verifikasi dengan akun USER dan ADMIN terpisah, create/complete task dan habit, refresh active counts, search/filter user, mobile viewport, dan pencabutan role saat sesi masih aktif.

Tidak ada migration live, akun yang diubah, dummy analytics produksi, payment integration palsu, atau dependency baru yang diinstal.
