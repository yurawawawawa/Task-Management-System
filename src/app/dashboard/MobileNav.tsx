'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Snowflake, Flame } from 'lucide-react';
import { DASHBOARD_NAV_ITEMS } from './SidebarNav';
import TreklyLogo from '@/app/components/TreklyLogo';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger — 44×44 touch target */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-muted-foreground hover:text-foreground hover:bg-muted-hover rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
      >
        <span className="sr-only">{isOpen ? 'Close' : 'Menu'}</span>
        {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
      </button>

      {/* Backdrop + Drawer */}
      {/* Render both in DOM for transition; control visibility via classes */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"
          onClick={close}
          aria-label="Close menu"
        />

        {/* Drawer panel */}
        <nav
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute top-0 left-0 h-full w-[280px] max-w-[85vw] bg-[#1f4d2b] text-[#fbf3e0] border-r-[3.5px] border-[#1a2e1f] shadow-2xl flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 h-16 border-b-[3px] border-[#163820] bg-[#173e21] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ffc93c] border-2 border-[#1a2e1f] flex items-center justify-center">
                <TreklyLogo className="w-5 h-5 text-[#1a2e1f]" />
              </div>
              <span className="font-['Fraunces',serif] font-black text-xl tracking-tight text-[#fbf3e0]">
                Trekly
              </span>
            </div>
            <button
              onClick={close}
              className="text-[#fbf3e0]/80 hover:text-white p-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Nav links — each ≥44px tall for touch */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="px-3 pb-1 text-[11px] font-black uppercase tracking-wider text-[#ffc93c]">
                Menu Utama
              </div>
              {DASHBOARD_NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-2xl font-black text-sm transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'
                          : 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'
                        : item.highlight
                        ? 'text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]'
                        : 'text-[#fbf3e0]/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] bg-[#ffc93c] text-[#1a2e1f]"
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Streak Freeze Gamification banner in drawer */}
            <div className="p-3.5 my-4 rounded-2xl border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f] bg-[#ffeed0] text-[#1a2e1f]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-black text-[#1a2e1f]">
                  <Flame className="w-4 h-4 fill-[#ff7a2f] text-[#ff7a2f] animate-pulse" />
                  Streak 7 Hari
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-[#1a2e1f] bg-[#bfe3f0] px-2 py-0.5 rounded-full border-[1.5px] border-[#1a2e1f] shadow-[1px_1px_0px_#1a2e1f]">
                  <Snowflake className="w-3 h-3 text-[#0a93c7]" />
                  2 Freeze
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#1a2e1f]/80 leading-snug">
                Pertahankan ritme harianmu agar streak tidak terputus.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
