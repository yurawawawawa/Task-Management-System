<div align="center">

<img src="public/icon.svg" alt="Trekly Logo" width="72" />

# Trekly

**Aplikasi manajemen tugas harian yang playful, powerful, dan personal.**

Trekly adalah web app produktivitas bergaya retro-playful yang membantu kamu mengelola task, melacak kebiasaan, dan memvisualisasikan ritme kerja harian — lengkap dengan Kanban board drag-and-drop, Productivity Map berkontribusi seperti GitHub, dan sistem streak berbasis gamifikasi.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-8-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

<img width="1080" height="1350" alt="Orange Gradient Modern Laptop Mockup Instagram Post" src="https://github.com/user-attachments/assets/66b01687-10af-4bdc-a4cd-b9aa98627a9e" />


---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database](#skema-database)
- [API Endpoints](#api-endpoints)
- [Memulai Proyek](#memulai-proyek)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Skrip yang Tersedia](#skrip-yang-tersedia)
- [Branching Strategy](#branching-strategy)

---

## Fitur Utama

### Kanban Board dengan Drag & Drop
- Tiga kolom status: **TO DO**, **IN PROGRESS**, dan **DONE**
- Task card bisa dipindah antar kolom maupun diurutkan ulang dalam satu kolom via drag-and-drop menggunakan **@dnd-kit/core** dan **@dnd-kit/sortable**
- Accessible via keyboard (sensor keyboard dnd-kit aktif)
- Visual feedback saat drag: card menjadi semi-transparan, border kolom tujuan di-highlight
- Status task ter-update otomatis ke database (Prisma 8 + Supabase) saat card dilepas
- Counter jumlah task di header kolom ter-update secara real-time

### Filter & Prioritas Task
- Filter berdasarkan prioritas: **ALL**, **URGENT**, **HIGH**, **MEDIUM**, **LOW**
- Tombol filter bergaya pill button dengan active state solid + shadow offset

### Productivity Map (Contribution Graph)
- Visualisasi aktivitas harian bergaya GitHub contribution graph
- Rentang tampilan: **3 Bulan**, **6 Bulan**, **1 Tahun**
- Intensitas warna kotak berdasarkan jumlah task selesai (5 level dari hijau pastel ke forest green)
- Floating tooltip saat hover: menampilkan tanggal dan jumlah task terselesaikan dengan transisi fade halus

### Sistem Streak Harian + Freeze Shield
- Streak dihitung **per hari kalender** (timezone `Asia/Jakarta`), bukan per aksi individual
- Task dipindah ke DONE **atau** habit dicentang → sistem mencatat aktivitas hari ini dan menaikkan streak +1
- Aktivitas berikutnya di hari yang sama hanya menaikkan `taskCount`, tidak menambah streak
- **Streak Freeze**: jika user melewati 1 hari tanpa aktivitas, sistem otomatis mengonsumsi 1 freeze untuk menjaga rantai streak tetap utuh
- Jika kuota freeze habis (0 dari maks. 3), streak direset ke 0
- Data disimpan ke tabel `DailyActivity` di Supabase

### Manajemen Habits
- Daftar habit harian dengan toggle centang per hari
- Setiap habit yang dicentang ikut mengisi streak harian dan `taskCount`

### Manajemen Proyek
- Buat dan kelola proyek dengan daftar anggota (`ProjectMember`)
- Setiap task dapat dikaitkan ke proyek tertentu

### Pengaturan Tema (Dynamic Theme)
- Pilihan tema visual: **Retro Playful** dan **Minimalist Clean**
- Preferensi disimpan di cookie (akses SSR tanpa FOUC) dan disinkronkan ke database
- CSS variable `--border-style`, `--shadow-style`, `--radius`, `--accent-color` di-switch global

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| UI Library | [React 19](https://react.dev/) |
| Bahasa | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animasi | [Framer Motion 13](https://www.framer.com/motion/) |
| Ikon | [Lucide React](https://lucide.dev/) |
| Drag & Drop | [@dnd-kit/core](https://dndkit.com/) + [@dnd-kit/sortable](https://dndkit.com/) |
| ORM | [Prisma 8](https://www.prisma.io/) (`@prisma/orm-postgres`) |
| Database | [Supabase PostgreSQL](https://supabase.com/) |
| Auth | [Supabase Auth](https://supabase.com/auth) + `@supabase/ssr` |
| Validasi | [Zod 4](https://zod.dev/) |
| Testing | [Vitest 4](https://vitest.dev/) |
| Cookie | [js-cookie](https://www.npmjs.com/package/js-cookie) |

---

## Struktur Proyek

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # login, logout, register, session
│   │   ├── productivity/
│   │   │   ├── activity/   # GET & POST daily activity
│   │   │   └── freeze/     # POST streak freeze toggle
│   │   ├── projects/       # CRUD proyek
│   │   ├── tasks/          # CRUD task
│   │   └── user/
│   │       └── preferences/ # Simpan preferensi tema
│   ├── dashboard/
│   │   ├── habits/         # Halaman Habits
│   │   ├── insights/       # Halaman Insights
│   │   ├── productivity/   # Halaman Productivity Map
│   │   ├── projects/       # Halaman Proyek
│   │   ├── settings/       # Halaman Pengaturan
│   │   ├── tasks/          # Halaman Tasks & Board (Kanban)
│   │   ├── actions.ts      # Server Actions (updateTaskStatus, dll)
│   │   ├── DashboardHomeClient.tsx
│   │   ├── ProductivityMap.tsx
│   │   └── SidebarNav.tsx
│   ├── lib/
│   │   ├── activity.ts         # recordDailyActivity, getUserProductivityStats
│   │   ├── streaks.ts          # calculateStreakWithFreeze, getLevel, formatIndonesianDate
│   │   ├── streaks.test.ts     # Unit tests Vitest
│   │   └── supabase/           # Supabase client helpers (client & server)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   └── page.tsx            # Landing page
├── prisma/
│   └── db.ts               # Prisma 8 ORM instance
└── src/prisma/
    ├── contract.prisma     # Prisma 8 schema (source of truth)
    ├── contract.json       # Emitted contract artifact
    └── contract.d.ts       # TypeScript types dari contract
```

---

## Skema Database

Database menggunakan **Supabase PostgreSQL** dengan **Prisma 8** (contract-based schema). Row Level Security (RLS) aktif pada seluruh tabel.

### Tabel Utama

```prisma
model Profile {
  id    Uuid   @id
  name  String
  email String @unique
  // Relasi ke auth.users Supabase
  projects        Project[]
  tasks           Task[]         @relation("UserTasks")
  dailyActivities DailyActivity[]
}

model Task {
  id         Uuid         @id @default(uuid())
  userId     Uuid
  projectId  Uuid?
  title      String
  status     TaskStatus   @default(TODO)   // TODO | IN_PROGRESS | DONE | CANCELLED
  priority   TaskPriority @default(MEDIUM) // LOW | MEDIUM | HIGH | URGENT
  dueDate    TimestamptzString?
}

model DailyActivity {
  id            Uuid    @id @default(uuid())
  userId        Uuid
  date          String  // Format: "YYYY-MM-DD" (timezone Asia/Jakarta)
  taskCount     Int     @default(0)
  streakCounted Boolean @default(false)

  @@unique([userId, date])
}

model Project { ... }
model ProjectMember { ... }
```

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/register` | Daftar akun baru |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/session` | Cek sesi aktif |
| `GET` | `/api/tasks` | Ambil semua task user |
| `POST` | `/api/tasks` | Buat task baru |
| `PATCH` | `/api/tasks/[id]` | Update task (status, prioritas, dll) |
| `DELETE` | `/api/tasks/[id]` | Hapus task |
| `GET` | `/api/projects` | Ambil semua proyek user |
| `POST` | `/api/projects` | Buat proyek baru |
| `PATCH` | `/api/projects/[id]` | Update proyek |
| `DELETE` | `/api/projects/[id]` | Hapus proyek |
| `GET` | `/api/productivity/activity` | Ambil stats streak & aktivitas harian |
| `POST` | `/api/productivity/activity` | Rekam aktivitas harian (task/habit selesai) |
| `POST` | `/api/productivity/freeze` | Aktifkan / batalkan Streak Freeze hari ini |
| `PATCH` | `/api/user/preferences` | Simpan preferensi tema ke database |

---

## Memulai Proyek

### Prasyarat

- **Node.js** >= 18
- **npm** >= 9
- Akun [Supabase](https://supabase.com/) (untuk database dan auth)

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/yurawawawawa/Task-Management-System.git
cd Task-Management-System

# 2. Install dependensi
npm install

# 3. Salin file environment
cp .env.example .env.local
# Isi variabel yang diperlukan (lihat bagian Variabel Lingkungan)

# 4. Emit Prisma 8 contract (generate TypeScript types)
npm run contract:emit

# 5. Jalankan migrasi database ke Supabase
npx prisma db update

# 6. Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Variabel Lingkungan

Buat file `.env.local` di root proyek dan isi variabel berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Prisma 8 (Supabase PostgreSQL direct connection)
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

> **Catatan:** `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server-side dan tidak pernah diekspor ke client.

---

## Skrip yang Tersedia

```bash
# Development server dengan Turbopack
npm run dev

# Production build
npm run build

# Jalankan production server
npm run start

# Lint dengan ESLint
npm run lint

# Jalankan unit tests (Vitest)
npm test

# Emit Prisma 8 contract artifacts (contract.json + contract.d.ts)
npm run contract:emit
```

---

## Branching Strategy

| Branch | Deskripsi |
|---|---|
| `main` | Branch produksi utama |
| `feature/drag-and-drop-task&board` | Implementasi dnd-kit Kanban drag & drop |
| `fix/redesign-dashboard-ui` | Restyle dashboard ke visual identity playful-retro Trekly |
| `feature/dynamic-theme` | Sistem ThemeContext + cookie + CSS variable untuk tema dinamis |
| `feature/Productivity-Map` | Logic streak harian, DailyActivity schema, tooltip, & intensitas warna |

---

## Kontribusi

Pull request sangat disambut. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan perubahan yang ingin kamu buat.

1. Fork repositori
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur X'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buka Pull Request

---

<div align="center">

Dibuat dengan dedikasi oleh tim Trekly · 2026

</div>
