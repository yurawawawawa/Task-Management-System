'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Snowflake, Flame } from 'lucide-react';
import { DASHBOARD_NAV_ITEMS } from './SidebarNav';
import TreklyLogo from '@/app/components/TreklyLogo';
import { useTheme } from '@/app/context/ThemeContext';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { themeStyle, accentColor } = useTheme();

  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

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
        className="relative text-inherit hover:opacity-80 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
      >
        <span className="sr-only">{isOpen ? 'Close' : 'Menu'}</span>
        {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
      </button>

      {/* Backdrop + Drawer */}
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
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={close}
          aria-label="Close menu"
        />

        {/* Drawer panel */}
        <nav
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute top-0 left-0 h-full w-[280px] max-w-[85vw] flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            isRetro
              ? 'bg-[#1f4d2b] text-[#fbf3e0] border-r-[3.5px] border-[#1a2e1f] shadow-2xl'
              : 'bg-white text-slate-800 border-r border-slate-200 shadow-2xl'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer header */}
          <div
            className={`flex items-center justify-between px-5 h-16 shrink-0 ${
              isRetro
                ? 'border-b-[3px] border-[#163820] bg-[#173e21]'
                : 'border-b border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isRetro
                    ? 'bg-[#ffc93c] border-2 border-[#1a2e1f]'
                    : 'bg-primary/10 border border-primary/20'
                }`}
              >
                <TreklyLogo
                  className={`w-5 h-5 ${
                    isRetro ? 'text-[#1a2e1f]' : 'text-primary'
                  }`}
                />
              </div>
              <span
                className={`text-xl tracking-tight ${
                  isRetro
                    ? "font-['Fraunces',serif] font-black text-[#fbf3e0]"
                    : 'font-black text-slate-900 font-sans'
                }`}
              >
                Trekly
              </span>
            </div>
            <button
              onClick={close}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 ${
                isRetro
                  ? 'text-[#fbf3e0]/80 hover:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div
                className={`px-3 pb-1 text-[11px] font-black uppercase tracking-wider ${
                  isRetro ? 'text-[#ffc93c]' : 'text-slate-400 font-semibold'
                }`}
              >
                Menu Utama
              </div>
              {DASHBOARD_NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

                let itemClasses = '';
                if (isRetro) {
                  if (isActive) {
                    itemClasses = item.highlight
                      ? isOrange
                        ? 'bg-[#ff7a2f] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'
                        : 'bg-[#2d6a3e] text-white border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]'
                      : 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f]';
                  } else {
                    itemClasses = item.highlight
                      ? 'text-[#fbf3e0] hover:bg-white/10 hover:text-[#ffc93c]'
                      : 'text-[#fbf3e0]/80 hover:bg-white/10 hover:text-white';
                  }
                } else {
                  if (isActive) {
                    itemClasses = isOrange
                      ? 'bg-orange-50 text-[#ff7a2f] border border-orange-200 shadow-xs font-bold rounded-xl'
                      : 'bg-emerald-50 text-[#1f4d2b] border border-emerald-200 shadow-xs font-bold rounded-xl';
                  } else {
                    itemClasses =
                      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors';
                  }
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-2xl font-black text-sm transition-all ${itemClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 shrink-0 ${
                          isRetro
                            ? isActive && !item.highlight
                              ? 'text-[#1a2e1f]'
                              : 'text-inherit'
                            : isActive
                            ? isOrange
                              ? 'text-[#ff7a2f]'
                              : 'text-[#1f4d2b]'
                            : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isRetro
                            ? 'border-2 border-[#1a2e1f] shadow-[1.5px_1.5px_0px_#1a2e1f] bg-[#ffc93c] text-[#1a2e1f]'
                            : isOrange
                            ? 'bg-orange-100 text-[#ff7a2f] border border-orange-200 font-bold'
                            : 'bg-emerald-100 text-[#1f4d2b] border border-emerald-200 font-bold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Streak Freeze Gamification banner in drawer */}
            <div
              className={`p-3.5 my-4 space-y-1.5 ${
                isRetro
                  ? 'rounded-2xl border-[3px] border-[#1a2e1f] shadow-[4px_4px_0px_#1a2e1f] bg-[#ffeed0] text-[#1a2e1f]'
                  : 'rounded-xl border border-slate-200 bg-slate-50 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`flex items-center gap-1.5 text-xs font-black ${
                    isRetro ? 'text-[#1a2e1f]' : 'text-slate-800'
                  }`}
                >
                  <Flame
                    className={`w-4 h-4 animate-pulse ${
                      isOrange
                        ? 'fill-[#ff7a2f] text-[#ff7a2f]'
                        : 'fill-emerald-600 text-emerald-600'
                    }`}
                  />
                  Streak 7 Hari
                </span>
                <span
                  className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isRetro
                      ? 'text-[#1a2e1f] bg-[#bfe3f0] border-[1.5px] border-[#1a2e1f] shadow-[1px_1px_0px_#1a2e1f]'
                      : 'text-slate-600 bg-slate-200/70 border border-slate-300'
                  }`}
                >
                  <Snowflake className="w-3 h-3 text-[#0a93c7]" />
                  2 Freeze
                </span>
              </div>
              <p
                className={`text-[11px] leading-snug ${
                  isRetro ? 'font-medium text-[#1a2e1f]/80' : 'text-slate-500'
                }`}
              >
                Pertahankan ritme harianmu agar streak tidak terputus.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
