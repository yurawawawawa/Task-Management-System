'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FolderKanban, CheckSquare, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Projects', icon: FolderKanban },
  { href: '#', label: 'My Tasks', icon: CheckSquare },
  { href: '#', label: 'Settings', icon: Settings },
] as const;

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
        className="relative text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 mr-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-drawer"
      >
        <span className="sr-only">{isOpen ? 'Close' : 'Menu'}</span>
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop + Drawer */}
      {/* Render both in DOM for transition; control visibility via classes */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={close}
          aria-label="Close menu"
        />

        {/* Drawer panel */}
        <nav
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute top-0 left-0 h-full w-[280px] max-w-[85vw] bg-[#FAFAFA] border-r border-gray-200/80 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black text-white rounded-[6px] flex items-center justify-center font-bold text-sm shadow-sm">
                T
              </div>
              <span className="font-bold tracking-tight text-black">
                Taskora
              </span>
            </div>
            <button
              onClick={close}
              className="text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links — each ≥44px tall for touch */}
          <div className="flex-1 overflow-y-auto py-3 px-3">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname?.startsWith(item.href) && item.href !== '#';

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center gap-3 min-h-[44px] px-3 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black active:bg-gray-200'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
