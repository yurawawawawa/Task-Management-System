'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Palette,
  CreditCard,
  ShieldCheck,
  Check,
  Flame,
  Sparkles,
  Clock,
  Save,
  Laptop
} from 'lucide-react';

interface SettingsClientProps {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'appearance' | 'subscription'>('account');
  const [name, setName] = useState(user.name || '');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB GMT+7)');
  const [morningReminder, setMorningReminder] = useState(true);
  const [streakAlert, setStreakAlert] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [themeStyle, setThemeStyle] = useState<'retro' | 'minimal'>('retro');
  const [accentColor, setAccentColor] = useState<'orange' | 'green'>('orange');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20 mb-3">
              <Settings className="w-3.5 h-3.5" />
              <span>Konfigurasi Preferensi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Settings
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Pengaturan akun personal, pengingat streak harian, tampilan, dan langganan Trekly.
            </p>
          </div>

          {isSaved && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs animate-in fade-in">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Preferensi berhasil disimpan!</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-border flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'account'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Akun & Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi & Streak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tampilan & Tema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'subscription'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Langganan</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        {/* Tab 1: Akun & Profil */}
        {activeTab === 'account' && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Informasi Profil</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Data identitas yang terhubung dengan sesi Supabase Auth milikmu
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/40 border-2 border-border rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-muted/80 border-2 border-border/60 rounded-xl text-sm font-medium text-muted-foreground cursor-not-allowed"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Email dikelola langsung melalui Supabase Auth
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Zona Waktu
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/40 border-2 border-border rounded-xl text-xs font-black focus:outline-none focus:border-primary"
                >
                  <option value="Asia/Jakarta (WIB GMT+7)">Asia/Jakarta (WIB GMT+7)</option>
                  <option value="Asia/Makassar (WITA GMT+8)">Asia/Makassar (WITA GMT+8)</option>
                  <option value="Asia/Jayapura (WIT GMT+9)">Asia/Jayapura (WIT GMT+9)</option>
                </select>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Digunakan untuk batas perhitungan pergantian hari streak (pukul 00:00 lokal)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-black text-xs rounded-2xl hover:bg-primary-hover transition-all shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Notifikasi & Reminder */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Pengingat & Alarm Streak
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atur jadwal notifikasi otomatis agar ritme dan rantai streak tidak padam
              </p>
            </div>

            <div className="space-y-4">
              {/* Reminder 1: Pagi */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-muted/10">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-extrabold text-foreground block">
                      Ringkasan Pagi (08:00 WIB)
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-snug">
                      Menerima daftar task prioritas dan checklist habit harian saat memulai hari.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={morningReminder}
                  onChange={(e) => setMorningReminder(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                />
              </div>

              {/* Reminder 2: Streak Fire Warning */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50">
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-[#ff7a2f] fill-[#ff7a2f] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-extrabold text-[#1a2e1f] block">
                      Peringatan Api Streak (20:00 WIB)
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-snug">
                      Pemberitahuan darurat jika belum ada aktivitas produktif atau freeze yang diaktifkan hari ini.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={streakAlert}
                  onChange={(e) => setStreakAlert(e.target.checked)}
                  className="w-5 h-5 accent-[#ff7a2f] cursor-pointer shrink-0"
                />
              </div>

              {/* Reminder 3: Browser Push */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-muted/10">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-extrabold text-foreground block">
                      Web Push Notification
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-snug">
                      Tampilkan pop-up interaktif pada peramban web desktop.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => setBrowserNotifications(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tampilan & Tema */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Gaya Tampilan & Aksen
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sesuaikan visual dashboard Trekly dengan selera personalmu
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Tema Desain
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setThemeStyle('retro')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      themeStyle === 'retro'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-white hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-sm font-black text-foreground block">
                      Retro Playful
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      Khas Trekly dengan border tegas dan sudut membulat nyaman.
                    </span>
                  </div>

                  <div
                    onClick={() => setThemeStyle('minimal')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      themeStyle === 'minimal'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-white hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-sm font-black text-foreground block">
                      Minimalist Clean
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      Garis halus bernuansa tenang dan monokrom.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Warna Aksen Dominan
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAccentColor('orange')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition-all ${
                      accentColor === 'orange'
                        ? 'border-[#ff7a2f] bg-[#ff7a2f]/10 text-[#ff7a2f]'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff7a2f]" />
                    <span>Trekly Orange</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccentColor('green')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition-all ${
                      accentColor === 'green'
                        ? 'border-[#1f4d2b] bg-[#1f4d2b]/10 text-[#1f4d2b]'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1f4d2b]" />
                    <span>Forest Green</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Langganan & Gamifikasi */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Status Langganan & Tier
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Informasi kuota gamifikasi dan paket fitur aktif
              </p>
            </div>

            <div className="p-6 rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Paket Aktif
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  Masa Berlaku: Selamanya
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-emerald-950">
                  Trekly Personal Pro
                </h3>
                <p className="text-xs text-emerald-900/80 mt-1">
                  Akses penuh ke semua modul produktivitas, visualisasi streak tak terbatas, dan habit tracker.
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-300/80 space-y-2 text-xs font-extrabold text-emerald-950">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Productivity Map Tahunan Penuh (GitHub-style)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>3 Slot Penyimpanan Streak Freeze</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Analytics & Jam Produktif Personal tanpa batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Kanban Board & Unlimited Proyek</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
