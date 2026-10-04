export default function DashboardLoading() {
  return (
    <div
      className="space-y-6 animate-pulse"
      role="status"
      aria-label="Memuat halaman dashboard"
    >
      <span className="sr-only">Memuat halaman...</span>
      <div className="h-36 rounded-3xl border-2 border-border bg-white" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="h-32 rounded-3xl border-2 border-border bg-white" />
        <div className="h-32 rounded-3xl border-2 border-border bg-white" />
        <div className="h-32 rounded-3xl border-2 border-border bg-white" />
      </div>
      <div className="h-72 rounded-3xl border-2 border-border bg-white" />
    </div>
  );
}
