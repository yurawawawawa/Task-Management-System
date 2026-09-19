import { getAuthUser } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import MobileNav from './MobileNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/login');
  }

  const profile = await db.orm.public.Profile.where({ id: authUser.id }).first();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden">
      {/* Subtle Background Pattern matching Auth Layout */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[400px] bg-gray-200/40 rounded-[100%] blur-[80px] opacity-60 mix-blend-multiply"></div>
      </div>

      {/* Top Navigation (Vercel/Linear style) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center lg:gap-8">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80 min-h-[44px] md:min-h-0">
              <div className="w-7 h-7 bg-primary text-primary-foreground rounded-[6px] flex items-center justify-center font-bold text-sm shadow-sm">
                T
              </div>
              <span className="font-bold tracking-tight text-foreground hidden sm:block">Taskora</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-8" aria-label="Main Navigation">
              <Link href="/dashboard" className="text-foreground relative after:absolute after:bottom-[-21px] after:left-0 after:w-full after:h-[2px] after:bg-primary"
                aria-current="page"
              >
                Projects
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                My Tasks
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-foreground leading-none">{profile?.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{authUser.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-black text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white shrink-0">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        {children}
      </main>
    </div>
  );
}
