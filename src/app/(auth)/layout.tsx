import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Subtle Background Pattern or Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex items-center justify-center pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gray-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-gray-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-[400px] px-6">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">Taskora</span>
          </Link>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border">
          {children}
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground/80">
        &copy; {new Date().getFullYear()} Taskora. All rights reserved.
      </div>
    </div>
  );
}
