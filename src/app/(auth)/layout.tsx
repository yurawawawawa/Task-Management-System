import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TreklyLogo from '@/app/components/TreklyLogo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-page-root min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 text-[#1a2e1f] relative overflow-hidden">
      {/* Decorative Floating Star Stickers */}
      <div className="absolute top-8 left-8 w-12 h-12 spin pointer-events-none select-none opacity-40 hidden sm:block" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38Z" fill="#ffc93c" stroke="#1a2e1f" strokeWidth="4" />
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 w-14 h-14 spin pointer-events-none select-none opacity-40 hidden sm:block" style={{ animationDirection: 'reverse' }} aria-hidden="true">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38Z" fill="#ff7eb6" stroke="#1a2e1f" strokeWidth="4" />
        </svg>
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Logo and Home Link */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="groovy text-4xl text-[#1a2e1f] flex items-center gap-2.5 hover:scale-105 transition-transform">
            <TreklyLogo className="w-10 h-10 text-[#1a2e1f]" />
            <span>Trekly</span>
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a2e1f]/70 mt-1">
            Kerja Asik • Hidup Santai
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="card-pop bg-white p-6 sm:p-8 border-[3.5px] border-[#1a2e1f] rounded-[28px] shadow-[8px_8px_0_#1a2e1f]">
          {children}
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2e1f]/80 hover:text-[#1a2e1f] hover:underline underline-offset-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-xs font-bold text-[#1a2e1f]/60">
        &copy; {new Date().getFullYear()} Trekly. Hak Cipta Dilindungi.
      </div>
    </div>
  );
}
