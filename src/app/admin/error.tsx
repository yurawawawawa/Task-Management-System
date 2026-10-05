'use client';
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 text-[#1a2e1f]" role="alert">
    <h2 className="text-xl font-bold">Data control center belum tersedia</h2><p className="my-3">Periksa koneksi database dan pastikan migrasi admin telah diterapkan. Akses tetap ditolak jika role tidak dapat diverifikasi.</p>
    <button type="button" onClick={reset} className="rounded-xl bg-[#ffc93c] px-4 py-2 font-bold">Coba lagi</button>
  </div>;
}
