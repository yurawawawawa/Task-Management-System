'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Flame,
  ArrowRight,
  Clock,
  Bell,
  Pin,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Plus,
  X,
  Star,
  Trophy,
  Laptop,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import TreklyLogo from '@/app/components/TreklyLogo';

interface LandingPageProps {
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
      full_name?: string;
    };
  } | null;
}

type KanbanCard = {
  id: string;
  title: string;
  color: string;
  column: 'todo' | 'in_progress' | 'done';
};

const initialCards: KanbanCard[] = [
  { id: '1', title: 'Desain UI', color: '#ffc93c', column: 'todo' },
  { id: '2', title: 'Riset Pengguna', color: '#ff7eb6', column: 'todo' },
  { id: '3', title: 'Koding API', color: '#ff7a2f', column: 'in_progress' },
  { id: '4', title: 'Testing E2E', color: '#bfe3f0', column: 'in_progress' },
  { id: '5', title: 'Deploy v1.0', color: '#8fd19e', column: 'done' },
];

const streakLevels = ['#e8efe0', '#b9e0bf', '#8fd19e', '#5fb572', '#2d6a3e'];

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function LandingPage({ user }: LandingPageProps) {
  // Kanban State
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<'todo' | 'in_progress' | 'done' | null>(null);
  const [newCardInput, setNewCardInput] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Streak Grid State (70 cells = 14 x 5)
  const [streakData, setStreakData] = useState<Array<{ day: number; count: number; level: number }>>([]);
  const [selectedStreak, setSelectedStreak] = useState<{ day: number; count: number } | null>(null);
  const [streakCounter, setStreakCounter] = useState(14);

  // Workspace mockup active tab
  const [activeTab, setActiveTab] = useState<'mvp' | 'mobile' | 'landing'>('mvp');

  useEffect(() => {
    const initialGrid = Array.from({ length: 70 }, (_, i) => {
      const rand = Math.random();
      const level = rand > 0.82 ? 4 : rand > 0.62 ? 3 : rand > 0.4 ? 2 : rand > 0.2 ? 1 : 0;
      const count = level === 4 ? Math.floor(Math.random() * 3) + 7 :
                    level === 3 ? Math.floor(Math.random() * 2) + 5 :
                    level === 2 ? Math.floor(Math.random() * 2) + 3 :
                    level === 1 ? Math.floor(Math.random() * 2) + 1 : 0;
      return { day: i + 1, count, level };
    });
    setStreakData(initialGrid);
    setSelectedStreak(initialGrid[68]);
  }, []);

  // Kanban Handlers
  const handleDragStart = (id: string) => {
    setDraggedCardId(id);
  };

  const handleDragOver = (e: React.DragEvent, col: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    setDragOverCol(col);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (col: 'todo' | 'in_progress' | 'done') => {
    if (!draggedCardId) return;
    setCards((prev) =>
      prev.map((c) => (c.id === draggedCardId ? { ...c, column: col } : c))
    );
    setDraggedCardId(null);
    setDragOverCol(null);
  };

  const advanceCard = (id: string) => {
    const flow: Record<KanbanCard['column'], KanbanCard['column']> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, column: flow[c.column] } : c))
    );
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardInput.trim()) return;
    const colors = ['#ffc93c', '#ff7eb6', '#ff7a2f', '#8fd19e', '#bfe3f0'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCard: KanbanCard = {
      id: Date.now().toString(),
      title: newCardInput.trim(),
      color: randomColor,
      column: 'todo',
    };
    setCards((prev) => [newCard, ...prev]);
    setNewCardInput('');
    setShowAddInput(false);
  };

  const handleAddTodayTask = () => {
    setStreakData((prev) => {
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      const current = copy[lastIdx];
      const newCount = current.count + 1;
      const newLevel = Math.min(4, Math.floor(newCount / 2) + 1);
      copy[lastIdx] = { ...current, count: newCount, level: newLevel };
      setSelectedStreak(copy[lastIdx]);
      return copy;
    });
    setStreakCounter((c) => c + 1);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const userDisplayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Teman';

  return (
    <div className="landing-page-root w-full min-h-screen p-3 sm:p-6 md:p-10 text-[#1a2e1f]">
      {/* OUTER STICKER FRAME — Hero 1 */}
      <div
        id="top"
        className="sticker-frame w-full max-w-7xl mx-auto rounded-[36px] overflow-hidden"
        style={{
          backgroundImage: 'url(/background-landing-page.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        {/* Dark overlay agar teks tetap terbaca di atas gambar */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(20, 54, 28, 0.72)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        {/* ========================================================
            NAVIGATION BAR
            ======================================================== */}
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-5 border-b-2 border-[#1a2e1f]/20">
          <Link
            href="/"
            className="groovy text-3xl md:text-4xl text-[#ffc93c] flex items-center gap-2.5 hover:scale-105 transition-transform"
          >
            <TreklyLogo className="w-10 h-10 text-[#ffc93c]" />
            <span>Trekly</span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 lg:gap-8 font-extrabold text-[#fbf3e0] text-base"
          >
            <button
              onClick={() => scrollToSection('fitur')}
              className="hover:underline underline-offset-4 hover:text-[#ffc93c] transition-colors"
            >
              Fitur
            </button>
            <button
              onClick={() => scrollToSection('kanban-section')}
              className="hover:underline underline-offset-4 hover:text-[#ffc93c] transition-colors"
            >
              Kanban
            </button>
            <button
              onClick={() => scrollToSection('komunitas')}
              className="hover:underline underline-offset-4 hover:text-[#ffc93c] transition-colors"
            >
              Komunitas
            </button>
            <button
              onClick={() => scrollToSection('kontak')}
              className="hover:underline underline-offset-4 hover:text-[#ffc93c] transition-colors"
            >
              Kontak
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-bold text-[#fbf3e0]/80">
                  Hai, <strong className="text-[#ffc93c]">{userDisplayName}</strong>!
                </span>
                <Link
                  href="/dashboard"
                  className="pill px-5 py-2.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm md:text-base inline-flex items-center gap-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-[#fbf3e0] hover:text-[#ffc93c] font-black text-sm md:text-base transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="pill px-5 py-2.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm md:text-base inline-flex items-center gap-1.5"
                >
                  <span>Mulai Gratis</span>
                  <Sparkles className="w-4 h-4 text-[#1a2e1f]" />
                </Link>
              </>
            )}
          </div>
        </header>

        {/* ========================================================
            HERO SECTION (MINIMALIST & PUNCHY)
            ======================================================== */}
        <section className="relative z-10 px-6 md:px-12 pt-8 md:pt-14 pb-0 overflow-hidden">
          {/* Curved Corner Spinning Starburst Badge */}
          <div
            className="absolute top-4 right-4 md:right-12 w-28 h-28 md:w-36 md:h-36 spin select-none pointer-events-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
              <path
                d="M60 4 l9 12 15-5 3 15 15 3-5 15 12 9-12 9 5 15-15 3-3 15-15-5-9 12-9-12-15 5-3-15-15-3 5-15-12-9 12-9-5-15 15-3 3-15 15 5z"
                fill="#ffc93c"
                stroke="#1a2e1f"
                strokeWidth="3.5"
              />
            </svg>
          </div>

          {/* Retro Leaf Illustration */}
          <svg
            className="absolute -left-6 top-16 w-28 md:w-36 select-none pointer-events-none opacity-80"
            viewBox="0 0 100 160"
            aria-hidden="true"
          >
            <path d="M50 160 C50 100 50 60 50 10" stroke="#8fd19e" strokeWidth="4" fill="none" />
            <path d="M50 40 C20 30 5 50 10 70 C30 70 45 60 50 40Z" fill="#8fd19e" />
            <path d="M50 80 C80 70 95 90 90 110 C70 110 55 100 50 80Z" fill="#5fb572" />
          </svg>

          {/* Hero Copy */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <span
              className="rise inline-flex items-center gap-1.5 px-4 py-1 rounded-full border-2 text-xs font-black uppercase tracking-wider text-[#ffc93c] bg-[#1a2e1f]/50 backdrop-blur-sm"
              style={{ animationDelay: '0.05s', borderColor: '#ffc93c' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffc93c]" />
              MANAJEMEN TUGAS SIMPLE
            </span>

            <h1
              className="groovy rise mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#fbf3e0] tracking-tight leading-[0.92]"
              style={{ animationDelay: '0.15s' }}
            >
              Kerja Asik,
              <br />
              <span className="text-[#ffc93c]">Hidup Santai.</span>
            </h1>

            <p
              className="rise mt-4 text-lg sm:text-xl md:text-2xl text-[#fbf3e0]/90 font-bold"
              style={{ animationDelay: '0.25s' }}
            >
              Papan Kanban visual, streak produktivitas, dan kolaborasi tim tanpa ribet.
            </p>

            {/* CTA Buttons */}
            <div
              className="rise mt-7 flex flex-wrap justify-center items-center gap-3.5"
              style={{ animationDelay: '0.35s' }}
            >
              {user ? (
                <Link
                  href="/dashboard"
                  className="pill px-8 py-3.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-base md:text-lg tracking-wide inline-flex items-center gap-2 hover:bg-[#ffd666]"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="pill px-8 py-3.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-base md:text-lg tracking-wide inline-flex items-center gap-2 hover:bg-[#ffd666]"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('fitur')}
                className="pill px-6 py-3.5 bg-[#fbf3e0] text-[#1a2e1f] font-black text-sm md:text-base inline-flex items-center gap-2 hover:bg-white"
              >
                <span>Lihat Demo</span>
                <ArrowRight className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>

          {/* Playful Vector Landscape */}
          <div
            className="relative z-10 mt-8 -mx-6 md:-mx-12 rise select-none pointer-events-none"
            style={{ animationDelay: '0.45s' }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 1200 320" className="w-full h-auto block">
              <circle cx="980" cy="80" r="55" fill="#ffc93c" stroke="#1a2e1f" strokeWidth="4" />
              <path d="M0 220 C200 160 350 200 520 185 C720 165 880 205 1200 170 L1200 320 L0 320Z" fill="#2d6a3e" />
              <path d="M0 260 C250 230 450 260 700 245 C900 235 1050 260 1200 250 L1200 320 L0 320Z" fill="#5fb572" />

              {/* Tree */}
              <rect x="300" y="110" width="20" height="150" fill="#8b5a2b" stroke="#1a2e1f" strokeWidth="4" />
              <circle cx="310" cy="100" r="65" fill="#8fd19e" stroke="#1a2e1f" strokeWidth="4" />
              <circle cx="270" cy="120" r="9" fill="#ff7eb6" />
              <circle cx="340" cy="80" r="9" fill="#ff7eb6" />
              <circle cx="320" cy="140" r="7" fill="#ffc93c" />

              {/* Character */}
              <circle cx="440" cy="185" r="20" fill="#f4b183" stroke="#1a2e1f" strokeWidth="4" />
              <path d="M420 175 C422 155 460 155 460 175 C450 165 430 165 420 175Z" fill="#1a2e1f" />
              <path d="M410 260 C410 215 470 210 475 260Z" fill="#ff7a2f" stroke="#1a2e1f" strokeWidth="4" />
              <path d="M470 255 L550 255 L565 270 L455 270Z" fill="#1a2e1f" />
              <rect x="480" y="210" width="70" height="44" rx="6" fill="#fbf3e0" stroke="#1a2e1f" strokeWidth="4" transform="rotate(-6 515 230)" />
              <path d="M500 228 l7 7 14-15" stroke="#2d6a3e" strokeWidth="5" fill="none" strokeLinecap="round" />

              {/* Floating pills */}
              <g className="bob">
                <rect x="640" y="90" width="135" height="42" rx="21" fill="#fbf3e0" stroke="#1a2e1f" strokeWidth="3.5" />
                <circle cx="665" cy="111" r="11" fill="#ff7eb6" />
                <path d="M660 111 l4 4 8-9" stroke="#1a2e1f" strokeWidth="2.5" fill="none" />
                <text x="686" y="115" fontFamily="'Alegreya Sans', sans-serif" fontWeight="800" fontSize="12" fill="#1a2e1f">
                  Sprint Beres
                </text>
              </g>

              <g className="bob" style={{ animationDelay: '1.2s' }}>
                <rect x="720" y="150" width="140" height="42" rx="21" fill="#ffc93c" stroke="#1a2e1f" strokeWidth="3.5" />
                <circle cx="743" cy="171" r="11" fill="#fbf3e0" />
                <path d="M738 171 l4 4 8-9" stroke="#1a2e1f" strokeWidth="2.5" fill="none" />
                <text x="764" y="175" fontFamily="'Alegreya Sans', sans-serif" fontWeight="800" fontSize="12" fill="#1a2e1f">
                  7 Hari Streak
                </text>
              </g>

              {/* Flowers */}
              <g transform="translate(1040 235)">
                <line x1="0" y1="0" x2="0" y2="35" stroke="#1a2e1f" strokeWidth="4" />
                <circle r="14" fill="#ff7eb6" stroke="#1a2e1f" strokeWidth="3" />
                <circle r="5" fill="#ffc93c" />
              </g>
              <g transform="translate(900 255)">
                <line x1="0" y1="0" x2="0" y2="28" stroke="#1a2e1f" strokeWidth="4" />
                <circle r="10" fill="#ff7a2f" stroke="#1a2e1f" strokeWidth="3" />
              </g>
            </svg>
          </div>
        </section>

        {/* Wave Divider */}
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="relative z-10 block w-full h-10 md:h-16 -mt-px"
          aria-hidden="true"
          style={{ background: '#5fb572' }}
        >
          <path d="M0 40 C200 0 400 80 600 40 C800 0 1000 80 1200 40 L1200 80 L0 80Z" fill="#fbf3e0" />
        </svg>

        {/* ========================================================
            SHOWCASE SECTION: CENTERED TREKLY WORKSPACE MOCKUP
            ======================================================== */}
        <section
          id="fitur"
          className="relative px-6 md:px-12 py-14 md:py-20 overflow-hidden"
          style={{ background: 'var(--cream)' }}
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 border-[#1a2e1f] font-black text-xs uppercase tracking-wider bg-[#ffc93c] mb-2.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#1a2e1f]" />
              TAMPILAN UTAMA
            </span>
            <h2 className="groovy text-4xl sm:text-5xl text-[#1a2e1f]">
              Semua Proyekmu, Satu Layar.
            </h2>
            <p className="mt-2 text-base md:text-lg text-[#1a2e1f]/80 font-bold">
              Pantau progres tugas dan ritme kerja secara real-time.
            </p>
          </div>

          {/* Centered Workspace Mockup Card */}
          <div className="max-w-4xl mx-auto">
            <div className="card-pop relative p-4 sm:p-6 md:p-8 bg-white">
              {/* Spinning Starbursts on Opposite Corners */}
              <svg
                className="absolute -top-6 -left-6 w-16 md:w-20 spin select-none pointer-events-none"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path
                  d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38Z"
                  fill="#ff7eb6"
                  stroke="#1a2e1f"
                  strokeWidth="3.5"
                />
              </svg>
              <svg
                className="absolute -bottom-6 -right-6 w-18 md:w-22 spin select-none pointer-events-none"
                style={{ animationDirection: 'reverse' }}
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path
                  d="M50 0 L58 38 L100 50 L58 62 L50 100 L42 62 L0 50 L42 38Z"
                  fill="#ffc93c"
                  stroke="#1a2e1f"
                  strokeWidth="3.5"
                />
              </svg>

              {/* Dashboard Container */}
              <div
                className="rounded-2xl border-[3px] overflow-hidden shadow-sm"
                style={{ borderColor: 'var(--ink)', background: '#fff' }}
              >
                {/* Header Bar */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'var(--green)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-[#1a2e1f]" style={{ background: '#ff7eb6' }} />
                    <span className="w-3 h-3 rounded-full border border-[#1a2e1f]" style={{ background: '#ffc93c' }} />
                    <span className="w-3 h-3 rounded-full border border-[#1a2e1f]" style={{ background: '#8fd19e' }} />
                    <div className="flex items-center gap-1.5 ml-3">
                      <TreklyLogo className="w-4 h-4 text-[#fbf3e0]" />
                      <span className="text-xs font-bold text-[#fbf3e0]/90">
                        Trekly Workspace
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#fbf3e0] text-[11px] font-extrabold">
                    Live Demo
                  </span>
                </div>

                {/* Dashboard Body */}
                <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[130px_1fr] min-h-[290px]">
                  {/* Left Sidebar */}
                  <div
                    className="p-3 space-y-1.5 border-r-[3px]"
                    style={{ borderColor: 'var(--ink)', background: '#fbf3e0' }}
                  >
                    <div className="text-[10px] font-black uppercase text-[#1a2e1f]/60 tracking-wider">
                      Proyek
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('mvp')}
                      className={`w-full text-left text-xs font-black px-2 py-1.5 rounded-lg border-2 transition-all ${
                        activeTab === 'mvp'
                          ? 'bg-[#ffc93c] border-[#1a2e1f] shadow-[2px_2px_0_#1a2e1f]'
                          : 'border-transparent text-[#1a2e1f]/80 hover:bg-white/60'
                      }`}
                    >
                      MVP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('mobile')}
                      className={`w-full text-left text-xs font-black px-2 py-1.5 rounded-lg border-2 transition-all ${
                        activeTab === 'mobile'
                          ? 'bg-[#ff7eb6] border-[#1a2e1f] shadow-[2px_2px_0_#1a2e1f]'
                          : 'border-transparent text-[#1a2e1f]/80 hover:bg-white/60'
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('landing')}
                      className={`w-full text-left text-xs font-black px-2 py-1.5 rounded-lg border-2 transition-all ${
                        activeTab === 'landing'
                          ? 'bg-[#8fd19e] border-[#1a2e1f] shadow-[2px_2px_0_#1a2e1f]'
                          : 'border-transparent text-[#1a2e1f]/80 hover:bg-white/60'
                      }`}
                    >
                      Redesign
                    </button>
                  </div>

                  {/* Main Panel */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                      <div
                        className="rounded-xl p-2.5 sm:p-3 border-2"
                        style={{ borderColor: 'var(--ink)', background: '#ffc93c' }}
                      >
                        <div className="groovy text-2xl sm:text-3xl">
                          {activeTab === 'mvp' ? '128' : activeTab === 'mobile' ? '84' : '49'}
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-[#1a2e1f] uppercase mt-0.5">
                          Tugas Selesai
                        </div>
                      </div>

                      <div
                        className="rounded-xl p-2.5 sm:p-3 border-2"
                        style={{ borderColor: 'var(--ink)', background: '#ff7eb6' }}
                      >
                        <div className="groovy text-2xl sm:text-3xl">
                          {activeTab === 'mvp' ? '94%' : activeTab === 'mobile' ? '88%' : '98%'}
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-[#1a2e1f] uppercase mt-0.5">
                          Tepat Waktu
                        </div>
                      </div>

                      <div
                        className="rounded-xl p-2.5 sm:p-3 border-2"
                        style={{ borderColor: 'var(--ink)', background: '#8fd19e' }}
                      >
                        <div className="groovy text-2xl sm:text-3xl flex items-center gap-1">
                          <span>{activeTab === 'mvp' ? '7' : activeTab === 'mobile' ? '12' : '21'}</span>
                          <Flame className="w-5 h-5 text-[#2d6a3e] fill-current" />
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-[#1a2e1f] uppercase mt-0.5">
                          Streak Hari
                        </div>
                      </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-[#fbf3e0] p-3 rounded-xl border-2 border-[#1a2e1f]">
                      <div className="flex justify-between items-center text-xs font-black mb-2">
                        <span>Aktivitas Sepekan</span>
                        <span className="text-[#2d6a3e] font-extrabold">+32% Produktif</span>
                      </div>
                      <div
                        className="flex items-end gap-2 h-20 px-2 pt-2 border-b-2"
                        style={{ borderColor: 'var(--ink)' }}
                      >
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '45%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Sen</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '70%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Sel</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '55%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Rab</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '90%', background: '#ff7a2f' }} />
                          <span className="text-[10px] font-extrabold text-[#ff7a2f]">Kam</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '75%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Jum</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '95%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Sab</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full rounded-t-md" style={{ height: '60%', background: 'var(--green2)' }} />
                          <span className="text-[10px] font-bold">Min</span>
                        </div>
                      </div>
                    </div>

                    {/* Task Progress Preview */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1a2e1f]">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#2d6a3e] stroke-[3]" />
                          Autentikasi Supabase & Prisma ORM
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#8fd19e] text-[10px] font-extrabold">
                          SELESAI
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-[#1a2e1f]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#ff7a2f] stroke-[3]" />
                          Integrasi Papan Kanban Drag & Drop
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#ffc93c] text-[10px] font-extrabold">
                          JALAN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            FEATURE GRID: 3 FITUR UTAMA
            (Icons only, No movement on No 03)
            ======================================================== */}
        <section
          id="kanban-section"
          className="px-6 md:px-12 py-14 md:py-20 border-t-2 border-[#1a2e1f]/20"
          style={{ background: 'var(--cream)' }}
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 border-[#1a2e1f] font-black text-xs uppercase tracking-wider bg-[#8fd19e] mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1a2e1f]" />
              FITUR UTAMA
            </span>
            <h2 className="groovy text-4xl sm:text-5xl text-[#1a2e1f]">
              Fokus ke Hal Penting
            </h2>
            <p className="mt-2 text-base md:text-lg text-[#1a2e1f]/80 font-bold">
              Tiga pilar utama untuk menjaga ritme kerjamu tetap teratur.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* FEATURE 01: Streak Heatmap Grid */}
            <article className="card-pop p-5 sm:p-6 flex flex-col bg-white">
              <div className="flex items-center justify-between">
                <span className="self-start px-3 py-1 rounded-full border-2 border-[#1a2e1f] font-extrabold text-xs uppercase bg-[#ffc93c]">
                  01 / KONSISTENSI
                </span>
                <span className="flex items-center gap-1 text-xs font-black text-[#ff7a2f] bg-[#ff7a2f]/10 px-2 py-0.5 rounded-md border border-[#ff7a2f]">
                  <Flame className="w-3.5 h-3.5 fill-[#ff7a2f]" />
                  {streakCounter} Hari
                </span>
              </div>

              {/* Streak Grid */}
              <div className="mt-4 rounded-xl p-3 border-2 border-[#1a2e1f] bg-white">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}
                >
                  {streakData.map((cell) => (
                    <button
                      key={cell.day}
                      type="button"
                      onClick={() => setSelectedStreak(cell)}
                      aria-label={`Hari ke-${cell.day}: ${cell.count} tugas selesai`}
                      className="streak-cell cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff7a2f]"
                      style={{ background: streakLevels[cell.level] }}
                      title={`Hari ke-${cell.day}: ${cell.count} tugas selesai`}
                    />
                  ))}
                </div>

                <div className="mt-2.5 pt-2 border-t border-dashed border-[#1a2e1f]/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1a2e1f]">
                    {selectedStreak
                      ? `Hari #${selectedStreak.day}: ${selectedStreak.count} tugas selesai`
                      : 'Klik sel'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddTodayTask}
                    className="text-[11px] font-black text-[#2d6a3e] underline hover:text-[#1f4d2b]"
                  >
                    + Centang Hari Ini
                  </button>
                </div>
              </div>

              <h3 className="groovy mt-4 text-2xl text-[#1a2e1f]">
                Streak & Heatmap
              </h3>
              <p className="mt-1 text-sm text-[#1a2e1f]/80 font-medium leading-relaxed">
                Catat konsistensi harian seperti GitHub commit agar motivasimu tetap menyala.
              </p>
            </article>

            {/* FEATURE 02: Papan Kanban Interaktif */}
            <article className="card-pop p-5 sm:p-6 flex flex-col bg-white">
              <div className="flex items-center justify-between">
                <span className="self-start px-3 py-1 rounded-full border-2 border-[#1a2e1f] font-extrabold text-xs uppercase bg-[#ff7eb6]">
                  02 / ALUR KERJA
                </span>
                <span className="text-[11px] font-bold text-[#1a2e1f]/60">
                  Tarik / Klik Kartu
                </span>
              </div>

              {/* Kanban Columns */}
              <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Contoh papan kanban">
                {/* TODO */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'todo')}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop('todo')}
                  className={`kb-col rounded-xl p-1.5 border-2 border-[#1a2e1f] bg-white space-y-1.5 ${
                    dragOverCol === 'todo' ? 'drag-over' : ''
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-[#1a2e1f] flex justify-between items-center">
                    <span>RENCANA</span>
                    <span className="text-[9px] px-1 rounded bg-[#1a2e1f]/10">
                      {cards.filter((c) => c.column === 'todo').length}
                    </span>
                  </div>
                  {cards
                    .filter((c) => c.column === 'todo')
                    .map((chip) => (
                      <div
                        key={chip.id}
                        draggable
                        onDragStart={() => handleDragStart(chip.id)}
                        onClick={() => advanceCard(chip.id)}
                        onKeyDown={(e) => e.key === 'Enter' && advanceCard(chip.id)}
                        tabIndex={0}
                        className="kb-chip rounded-lg px-2 py-1 text-xs font-bold border-2 border-[#1a2e1f]"
                        style={{ background: chip.color }}
                      >
                        {chip.title}
                      </div>
                    ))}
                </div>

                {/* IN PROGRESS */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'in_progress')}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop('in_progress')}
                  className={`kb-col rounded-xl p-1.5 border-2 border-[#1a2e1f] bg-white space-y-1.5 ${
                    dragOverCol === 'in_progress' ? 'drag-over' : ''
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-[#1a2e1f] flex justify-between items-center">
                    <span>JALAN</span>
                    <span className="text-[9px] px-1 rounded bg-[#1a2e1f]/10">
                      {cards.filter((c) => c.column === 'in_progress').length}
                    </span>
                  </div>
                  {cards
                    .filter((c) => c.column === 'in_progress')
                    .map((chip) => (
                      <div
                        key={chip.id}
                        draggable
                        onDragStart={() => handleDragStart(chip.id)}
                        onClick={() => advanceCard(chip.id)}
                        onKeyDown={(e) => e.key === 'Enter' && advanceCard(chip.id)}
                        tabIndex={0}
                        className="kb-chip rounded-lg px-2 py-1 text-xs font-bold border-2 border-[#1a2e1f]"
                        style={{ background: chip.color }}
                      >
                        {chip.title}
                      </div>
                    ))}
                </div>

                {/* DONE */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'done')}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop('done')}
                  className={`kb-col rounded-xl p-1.5 border-2 border-[#1a2e1f] bg-white space-y-1.5 ${
                    dragOverCol === 'done' ? 'drag-over' : ''
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-[#1a2e1f] flex justify-between items-center">
                    <span>BERES</span>
                    <span className="text-[9px] px-1 rounded bg-[#1a2e1f]/10">
                      {cards.filter((c) => c.column === 'done').length}
                    </span>
                  </div>
                  {cards
                    .filter((c) => c.column === 'done')
                    .map((chip) => (
                      <div
                        key={chip.id}
                        draggable
                        onDragStart={() => handleDragStart(chip.id)}
                        onClick={() => advanceCard(chip.id)}
                        onKeyDown={(e) => e.key === 'Enter' && advanceCard(chip.id)}
                        tabIndex={0}
                        className="kb-chip rounded-lg px-2 py-1 text-xs font-bold border-2 border-[#1a2e1f]"
                        style={{ background: chip.color }}
                      >
                        {chip.title}
                      </div>
                    ))}
                </div>
              </div>

              {/* Add Demo Card */}
              {showAddInput ? (
                <form onSubmit={handleAddNewCard} className="mt-2 flex gap-1">
                  <input
                    type="text"
                    value={newCardInput}
                    onChange={(e) => setNewCardInput(e.target.value)}
                    placeholder="Judul kartu..."
                    className="flex-1 px-2 py-1 text-xs rounded border border-[#1a2e1f] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs font-bold bg-[#8fd19e] rounded border border-[#1a2e1f]"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddInput(false)}
                    className="p-1 text-xs font-bold bg-gray-200 rounded border border-[#1a2e1f] flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddInput(true)}
                  className="mt-2 text-left text-[11px] font-bold text-[#1a2e1f]/70 hover:text-[#1a2e1f] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" /> Tambah kartu
                </button>
              )}

              <h3 className="groovy mt-4 text-2xl text-[#1a2e1f]">
                Papan Kanban
              </h3>
              <p className="mt-1 text-sm text-[#1a2e1f]/80 font-medium leading-relaxed">
                Tarik dan geser kartu dari rencana sampai selesai semudah menjentikkan jari.
              </p>
            </article>

            {/* FEATURE 03: Skala Prioritas — ICONS ONLY & NO MOVEMENT */}
            <article className="card-pop p-5 sm:p-6 flex flex-col bg-white">
              <div className="flex items-center justify-between">
                <span className="self-start px-3 py-1 rounded-full border-2 border-[#1a2e1f] font-extrabold text-xs uppercase bg-[#8fd19e]">
                  03 / PRIORITAS
                </span>
                <span className="text-[11px] font-bold text-[#1a2e1f]/60">
                  Tenggat Jelas
                </span>
              </div>

              {/* Static Task Items (Clean Lucide Icons, No Movement) */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl px-3 py-2 border-2 border-[#1a2e1f] bg-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-md grid place-items-center border border-[#1a2e1f]"
                      style={{ background: '#ff7a2f' }}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#1a2e1f]" />
                    </span>
                    <span className="text-xs font-extrabold">Demo Klien MVP</span>
                  </div>
                  <span className="text-[10px] font-black text-[#ff7a2f] bg-[#ff7a2f]/10 px-2 py-0.5 rounded-full border border-[#ff7a2f]/30">
                    2 jam lagi
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 border-2 border-[#1a2e1f] bg-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-md grid place-items-center border border-[#1a2e1f]"
                      style={{ background: '#ffc93c' }}
                    >
                      <Bell className="w-3.5 h-3.5 text-[#1a2e1f]" />
                    </span>
                    <span className="text-xs font-extrabold">Review Pull Request</span>
                  </div>
                  <span className="text-[10px] font-black text-[#1a2e1f] bg-[#ffc93c]/30 px-2 py-0.5 rounded-full border border-[#1a2e1f]/20">
                    Besok
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 border-2 border-[#1a2e1f] bg-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-md grid place-items-center border border-[#1a2e1f]"
                      style={{ background: '#ff7eb6' }}
                    >
                      <Pin className="w-3.5 h-3.5 text-[#1a2e1f]" />
                    </span>
                    <span className="text-xs font-extrabold">Dokumentasi API</span>
                  </div>
                  <span className="text-[10px] font-black text-[#ff7eb6] bg-[#ff7eb6]/10 px-2 py-0.5 rounded-full border border-[#ff7eb6]/30">
                    3 hari
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 border-2 border-[#1a2e1f] bg-white">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-md grid place-items-center border border-[#1a2e1f]"
                      style={{ background: '#bfe3f0' }}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#1a2e1f]" />
                    </span>
                    <span className="text-xs font-extrabold">Riset Fitur Baru</span>
                  </div>
                  <span className="text-[10px] font-black text-[#1a2e1f]/70 bg-[#bfe3f0]/30 px-2 py-0.5 rounded-full border border-[#1a2e1f]/20">
                    Pekan depan
                  </span>
                </div>
              </div>

              <h3 className="groovy mt-4 text-2xl text-[#1a2e1f]">
                Skala Prioritas
              </h3>
              <p className="mt-1 text-sm text-[#1a2e1f]/80 font-medium leading-relaxed">
                Kategorikan tugas (Low, Medium, High, Urgent) agar fokus ke hal yang paling krusial.
              </p>
            </article>
          </div>

          {/* Value Strip */}
          <div className="mt-10 p-5 rounded-2xl border-[3px] border-[#1a2e1f] bg-white shadow-[4px_4px_0_#1a2e1f] grid sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl border-2 border-[#1a2e1f] bg-[#ffc93c] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#1a2e1f]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1a2e1f]">Kolaborasi Tim</h4>
                <p className="text-xs text-[#1a2e1f]/70 font-medium">Undang rekan via email & delegasi tugas.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl border-2 border-[#1a2e1f] bg-[#ff7eb6] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#1a2e1f]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1a2e1f]">Ringan & Cepat</h4>
                <p className="text-xs text-[#1a2e1f]/70 font-medium">Next.js 16 + Supabase, instan tanpa jeda.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl border-2 border-[#1a2e1f] bg-[#8fd19e] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#1a2e1f]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1a2e1f]">Data Aman</h4>
                <p className="text-xs text-[#1a2e1f]/70 font-medium">Row-Level Security melindungi tugasmu.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            COMMUNITY SECTION (ICONS ONLY)
            ======================================================== */}
        <section
          id="komunitas"
          className="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden"
          style={{ background: 'var(--green)' }}
        >
          {/* Giant Tilted Background Text */}
          <p
            className="groovy rotated-bg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-white/5 text-7xl md:text-9xl font-black"
            aria-hidden="true"
          >
            TREKLY • KERJA ASYIK • TETAP BERES •
          </p>

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Tilted Card */}
            <div className="relative">
              <div
                className="rotate-[-3deg] rounded-[24px] border-[4px] overflow-hidden bg-[#fbf3e0]"
                style={{ borderColor: 'var(--ink)', boxShadow: '8px 8px 0 var(--ink)' }}
              >
                <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-[#ffc93c] via-[#ff7eb6] to-[#8fd19e] p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border-2 border-[#1a2e1f] font-extrabold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#1a2e1f]" />
                      Ruang Kerja Teratur
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#1a2e1f] grid place-items-center shadow-sm">
                      <Laptop className="w-4 h-4 text-[#1a2e1f]" />
                    </div>
                  </div>

                  <div className="bg-white/95 rounded-2xl p-4 border-2 border-[#1a2e1f] shadow-md">
                    <p className="text-sm font-bold text-[#1a2e1f] leading-snug">
                      &ldquo;Trekly bikin tim kami tidak pernah lagi panik deadline sprint.
                      Simpel, visualnya seru, dan bikin fokus.&rdquo;
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-xs font-black text-[#1a2e1f]/70">
                      <span>— Rian, Studio Lead</span>
                      <div className="flex gap-0.5 text-[#ff7a2f]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-[#ff7a2f]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <span className="absolute -top-3 -right-2 rotate-6 px-3.5 py-1.5 rounded-full border-[3px] border-[#1a2e1f] bg-[#ffc93c] font-black text-xs md:text-sm text-[#1a2e1f] inline-flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-4 h-4 text-[#1a2e1f]" />
                10.000+ Tugas Selesai
              </span>
            </div>

            {/* Right: Short Copy & Social */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 border-[#ffc93c] font-black text-xs uppercase tracking-wider text-[#ffc93c] bg-[#1a2e1f]/60 mb-2.5">
                <Users className="w-3.5 h-3.5 text-[#ffc93c]" />
                KOMUNITAS
              </span>
              <h2 className="groovy text-3xl sm:text-4xl md:text-5xl text-[#fbf3e0]">
                Bekerja Lebih Tenang
              </h2>
              <p className="mt-3 text-base md:text-lg text-[#fbf3e0]/90 font-medium">
                Untuk solo maker, mahasiswa, hingga tim pengembang yang ingin target tuntas tanpa mengorbankan waktu santai.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill inline-flex items-center gap-2 px-5 py-2.5 bg-[#fbf3e0] text-[#1a2e1f] font-bold text-sm hover:bg-white"
                >
                  <InstagramIcon className="w-4 h-4 text-[#ff7eb6]" />
                  <span>Instagram @trekly.id</span>
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffc93c] text-[#1a2e1f] font-bold text-sm hover:bg-[#ffd666]"
                >
                  <TwitterIcon className="w-4 h-4 text-[#1a2e1f]" />
                  <span>Twitter / X @trekly</span>
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill inline-flex items-center gap-2 px-5 py-2.5 bg-[#8fd19e] text-[#1a2e1f] font-bold text-sm hover:bg-[#a4deb0]"
                >
                  <GithubIcon className="w-4 h-4 text-[#1a2e1f]" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <svg
          viewBox="0 0 1200 90"
          preserveAspectRatio="none"
          className="block w-full h-12 md:h-20 -mb-px"
          aria-hidden="true"
          style={{ background: 'var(--green)' }}
        >
          <path
            d="M0 50 C150 90 300 10 500 45 C700 80 850 15 1000 40 C1100 55 1150 45 1200 35 L1200 90 L0 90Z"
            fill="#bfe3f0"
          />
        </svg>

        {/* ========================================================
            FOOTER SECTION
            ======================================================== */}
        <footer
          id="kontak"
          className="px-6 md:px-12 pt-8 pb-10"
          style={{ background: 'var(--sky)' }}
        >
          <div className="text-center flex flex-col items-center">
            <TreklyLogo className="w-12 h-12 text-[#1a2e1f] mb-2" />
            <span className="groovy text-4xl sm:text-5xl md:text-6xl text-[#1a2e1f] tracking-tight block">
              TREKLY
            </span>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1a2e1f]/70 mt-0.5">
              Kerja Asik • Hidup Santai
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6 items-center">
            <div>
              <h3 className="groovy text-xl text-[#1a2e1f]">Hubungi Kami</h3>
              <a
                href="mailto:halo@trekly.id"
                className="block mt-1 text-base font-black text-[#1a2e1f] hover:underline"
              >
                halo@trekly.id
              </a>
              <p className="text-xs font-bold text-[#1a2e1f]/70 mt-0.5">
                Jakarta, Indonesia
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-[#1a2e1f]">
                Mulai atur pekerjaanmu sekarang.
              </p>
              {user ? (
                <Link
                  href="/dashboard"
                  className="pill mt-2.5 px-6 py-2.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm inline-flex items-center gap-2 hover:bg-[#ffd666]"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="pill mt-2.5 px-6 py-2.5 bg-[#ffc93c] text-[#1a2e1f] font-black text-sm inline-flex items-center gap-2 hover:bg-[#ffd666]"
                >
                  <span>Daftar Gratis</span>
                  <Sparkles className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="md:text-right">
              <p className="text-xs font-bold text-[#1a2e1f]">Ikuti Kami</p>
              <div className="mt-2 flex md:justify-end gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="pill w-10 h-10 grid place-items-center bg-[#fbf3e0] hover:bg-white"
                >
                  <InstagramIcon className="w-4 h-4 text-[#1a2e1f]" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="pill w-10 h-10 grid place-items-center bg-[#ffc93c] hover:bg-[#ffd666]"
                >
                  <TwitterIcon className="w-4 h-4 text-[#1a2e1f]" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="pill w-10 h-10 grid place-items-center bg-[#ff7eb6] hover:bg-[#ff94c4]"
                >
                  <LinkedinIcon className="w-4 h-4 text-[#1a2e1f]" />
                </a>
                <button
                  type="button"
                  onClick={() => scrollToSection('top')}
                  aria-label="Kembali ke atas"
                  title="Kembali ke atas"
                  className="pill w-10 h-10 grid place-items-center bg-white font-extrabold text-[#1a2e1f] hover:bg-[#fbf3e0]"
                >
                  <ArrowRight className="w-4 h-4 -rotate-90 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-[#1a2e1f]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#1a2e1f]/70">
            <p>© {new Date().getFullYear()} Trekly. Hak Cipta Dilindungi.</p>
            <div className="flex gap-4">
              <button onClick={() => scrollToSection('fitur')} className="hover:underline">
                Fitur
              </button>
              <button onClick={() => scrollToSection('kanban-section')} className="hover:underline">
                Kanban
              </button>
              <button onClick={() => scrollToSection('komunitas')} className="hover:underline">
                Komunitas
              </button>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
