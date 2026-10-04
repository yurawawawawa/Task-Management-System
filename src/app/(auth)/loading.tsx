export default function AuthLoading() {
  return (
    <div className="w-full max-w-[460px] rounded-[28px] border-[3.5px] border-[#1a2e1f] bg-white p-8 text-center shadow-[8px_8px_0_#1a2e1f]">
      <div className="mx-auto h-5 w-36 animate-pulse rounded-full bg-[#8fd19e]/60" />
      <div className="mx-auto mt-4 h-8 w-52 animate-pulse rounded-lg bg-[#ffc93c]/60" />
      <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded bg-[#1a2e1f]/10" />
      <div className="mt-8 space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-[#1a2e1f]/10" />
        <div className="h-12 animate-pulse rounded-xl bg-[#1a2e1f]/10" />
        <div className="h-12 animate-pulse rounded-xl bg-[#ffc93c]/60" />
      </div>
    </div>
  );
}
