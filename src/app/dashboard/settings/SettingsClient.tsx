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
  Laptop,
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface SettingsClientProps {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const { themeStyle, accentColor, setThemeStyle, setAccentColor } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'appearance' | 'subscription'>('appearance');
  const [name, setName] = useState(user.name || '');
  const [timezone, setTimezone] = useState('Asia/Jakarta (WIB GMT+7)');
  const [morningReminder, setMorningReminder] = useState(true);
  const [streakAlert, setStreakAlert] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isRetro = themeStyle === 'retro';
  const isOrange = accentColor === 'orange';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const containerClasses = isRetro
    ? 'bg-[#fff9ed] p-6 sm:p-8 rounded-[28px] border-[3.5px] border-[#1a2e1f] shadow-[6px_6px_0px_#1a2e1f]'
    : 'bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <div className={containerClasses}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black mb-3 ${
                isRetro
                  ? 'bg-[#ffc93c] text-[#1a2e1f] border-[2px] border-[#1a2e1f] shadow-[2px_2px_0px_#1a2e1f]'
                  : isOrange
                  ? 'bg-orange-100 text-[#ff7a2f] border border-orange-200'
                  : 'bg-emerald-100 text-[#1f4d2b] border border-emerald-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Konfigurasi Preferensi</span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isRetro
                  ? "font-['Fraunces',serif] text-[#1a2e1f]"
                  : 'text-slate-900 font-sans'
              }`}
            >
              Settings
            </h1>
            <p
              className={`text-sm mt-1 max-w-xl ${
                isRetro ? 'text-[#1a2e1f]/75 font-medium' : 'text-slate-500'
              }`}
            >
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
        <div className={`mt-8 pt-4 flex flex-wrap gap-2 ${isRetro ? 'border-t-2 border-[#1a2e1f]/15' : 'border-t border-border'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === 'appearance'
                ? isRetro
                  ? 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] rounded-2xl'
                  : isOrange
                  ? 'bg-[#ff7a2f] text-white shadow-xs rounded-xl'
                  : 'bg-[#1f4d2b] text-white shadow-xs rounded-xl'
                : isRetro
                ? 'text-[#1a2e1f]/70 hover:bg-black/5 hover:text-[#1a2e1f] rounded-2xl'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tampilan & Tema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === 'account'
                ? isRetro
                  ? 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] rounded-2xl'
                  : isOrange
                  ? 'bg-[#ff7a2f] text-white shadow-xs rounded-xl'
                  : 'bg-[#1f4d2b] text-white shadow-xs rounded-xl'
                : isRetro
                ? 'text-[#1a2e1f]/70 hover:bg-black/5 hover:text-[#1a2e1f] rounded-2xl'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Akun & Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === 'notifications'
                ? isRetro
                  ? 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] rounded-2xl'
                  : isOrange
                  ? 'bg-[#ff7a2f] text-white shadow-xs rounded-xl'
                  : 'bg-[#1f4d2b] text-white shadow-xs rounded-xl'
                : isRetro
                ? 'text-[#1a2e1f]/70 hover:bg-black/5 hover:text-[#1a2e1f] rounded-2xl'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi & Streak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === 'subscription'
                ? isRetro
                  ? 'bg-[#bfe3f0] text-[#1a2e1f] border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] rounded-2xl'
                  : isOrange
                  ? 'bg-[#ff7a2f] text-white shadow-xs rounded-xl'
                  : 'bg-[#1f4d2b] text-white shadow-xs rounded-xl'
                : isRetro
                ? 'text-[#1a2e1f]/70 hover:bg-black/5 hover:text-[#1a2e1f] rounded-2xl'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Langganan</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className={containerClasses}>
        {/* Tab: Tampilan & Tema */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2
                className={`text-xl font-black tracking-tight ${
                  isRetro
                    ? "font-['Fraunces',serif] text-[#1a2e1f]"
                    : 'text-slate-900 font-sans'
                }`}
              >
                Gaya Tampilan & Aksen
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isRetro ? 'text-[#1a2e1f]/75' : 'text-slate-500'
                }`}
              >
                Sesuaikan visual dashboard Trekly dengan preferensi Anda. Perubahan langsung aktif seketika tanpa perlu menyimpan ulang.
              </p>
            </div>

            <div className="space-y-6">
              {/* Theme Style Choice */}
              <div>
                <label
                  className={`text-xs font-black block mb-2 ${
                    isRetro ? 'text-[#1a2e1f]' : 'text-slate-700'
                  }`}
                >
                  Tema Desain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: Retro Playful */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setThemeStyle('retro')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setThemeStyle('retro');
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all select-none relative ${
                      themeStyle === 'retro'
                        ? 'border-2 border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 text-blue-950 shadow-sm'
                        : isRetro
                        ? 'border-2 border-[#1a2e1f]/20 bg-white hover:border-[#1a2e1f]/60'
                        : 'border-2 border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black block">
                        Retro Playful
                      </span>
                      {themeStyle === 'retro' && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs opacity-80 block mt-1.5 leading-snug">
                      Khas Trekly dengan border tebal, bayangan stiker offset, dan sudut membulat nyaman.
                    </span>
                  </div>

                  {/* Option 2: Minimalist Clean */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setThemeStyle('minimal')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setThemeStyle('minimal');
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all select-none relative ${
                      themeStyle === 'minimal'
                        ? 'border-2 border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 text-blue-950 shadow-sm'
                        : isRetro
                        ? 'border-2 border-[#1a2e1f]/20 bg-white hover:border-[#1a2e1f]/60'
                        : 'border-2 border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black block">
                        Minimalist Clean
                      </span>
                      {themeStyle === 'minimal' && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs opacity-80 block mt-1.5 leading-snug">
                      Garis halus bernuansa tenang, bayangan lembut, dan tata letak elegan monokrom.
                    </span>
                  </div>
                </div>
              </div>

              {/* Accent Color Choice: only appears and selectable when Minimalist Clean is chosen */}
              {themeStyle === 'minimal' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-black block mb-1 text-slate-700">
                      Warna Aksen Dominan
                    </label>
                    <p className="text-xs text-slate-500">
                      Pilih warna aksen utama yang akan diaplikasikan pada tombol, badge, dan highlight antarmuka.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setAccentColor('orange')}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer ${
                        accentColor === 'orange'
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 text-blue-950 shadow-sm'
                          : 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#ff7a2f] shadow-xs flex items-center justify-center shrink-0">
                        {accentColor === 'orange' && (
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        )}
                      </div>
                      <span>Trekly Orange</span>
                      <span className="text-[10px] opacity-60">(#ff7a2f)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccentColor('green')}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer ${
                        accentColor === 'green'
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 text-blue-950 shadow-sm'
                          : 'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#1f4d2b] shadow-xs flex items-center justify-center shrink-0">
                        {accentColor === 'green' && (
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        )}
                      </div>
                      <span>Forest Green</span>
                      <span className="text-[10px] opacity-60">(#1f4d2b)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl flex items-center justify-between text-xs ${
                  isRetro
                    ? 'bg-[#ffeed0] border-2 border-[#1a2e1f] text-[#1a2e1f]'
                    : 'bg-slate-50 border border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold opacity-80">Preferensi Tersimpan:</span>
                <span className="font-black inline-flex items-center gap-2">
                  <span>{themeStyle === 'retro' ? 'Retro Playful' : 'Minimalist Clean'}</span>
                  {themeStyle === 'minimal' && (
                    <>
                      <span>&bull;</span>
                      <span>{accentColor === 'orange' ? 'Trekly Orange' : 'Forest Green'}</span>
                    </>
                  )}
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Akun & Profil */}
        {activeTab === 'account' && (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div>
              <h2
                className={`text-xl font-black tracking-tight ${
                  isRetro
                    ? "font-['Fraunces',serif] text-[#1a2e1f]"
                    : 'text-slate-900 font-sans'
                }`}
              >
                Informasi Profil
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isRetro ? 'text-[#1a2e1f]/75' : 'text-slate-500'
                }`}
              >
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
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none ${
                    isRetro
                      ? 'bg-white border-[2.5px] border-[#1a2e1f] text-[#1a2e1f]'
                      : 'bg-muted/40 border-2 border-border focus:border-primary'
                  }`}
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
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed ${
                    isRetro
                      ? 'bg-black/5 border-[2px] border-[#1a2e1f]/30 text-[#1a2e1f]/60'
                      : 'bg-muted/80 border-2 border-border/60 text-muted-foreground'
                  }`}
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
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-black focus:outline-none ${
                    isRetro
                      ? 'bg-white border-[2.5px] border-[#1a2e1f] text-[#1a2e1f]'
                      : 'bg-muted/40 border-2 border-border focus:border-primary'
                  }`}
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

            <div className={`pt-4 ${isRetro ? 'border-t-2 border-[#1a2e1f]/15' : 'border-t border-border'}`}>
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-5 py-2.5 font-black text-xs transition-all ${
                  isRetro
                    ? isOrange
                      ? 'bg-[#ff7a2f] text-white rounded-full border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a2e1f]'
                      : 'bg-[#1f4d2b] text-white rounded-full border-[2.5px] border-[#1a2e1f] shadow-[3px_3px_0px_#1a2e1f] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1a2e1f]'
                    : isOrange
                    ? 'bg-[#ff7a2f] hover:bg-[#e5651f] text-white rounded-xl shadow-xs'
                    : 'bg-[#1f4d2b] hover:bg-[#173e21] text-white rounded-xl shadow-xs'
                }`}
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
              <h2
                className={`text-xl font-black tracking-tight ${
                  isRetro
                    ? "font-['Fraunces',serif] text-[#1a2e1f]"
                    : 'text-slate-900 font-sans'
                }`}
              >
                Pengingat & Alarm Streak
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isRetro ? 'text-[#1a2e1f]/75' : 'text-slate-500'
                }`}
              >
                Atur jadwal notifikasi otomatis agar ritme dan rantai streak tidak padam
              </p>
            </div>

            <div className="space-y-4">
              {/* Reminder 1: Pagi */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isRetro
                    ? 'bg-white border-2 border-[#1a2e1f]'
                    : 'border-2 border-border bg-muted/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Clock
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isOrange ? 'text-[#ff7a2f]' : 'text-[#1f4d2b]'
                    }`}
                  />
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
                  className={`w-5 h-5 cursor-pointer shrink-0 ${
                    isOrange ? 'accent-[#ff7a2f]' : 'accent-[#1f4d2b]'
                  }`}
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
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  isRetro
                    ? 'bg-white border-2 border-[#1a2e1f]'
                    : 'border-2 border-border bg-muted/10'
                }`}
              >
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
                  className={`w-5 h-5 cursor-pointer shrink-0 ${
                    isOrange ? 'accent-[#ff7a2f]' : 'accent-[#1f4d2b]'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Langganan & Gamifikasi */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2
                className={`text-xl font-black tracking-tight ${
                  isRetro
                    ? "font-['Fraunces',serif] text-[#1a2e1f]"
                    : 'text-slate-900 font-sans'
                }`}
              >
                Status Langganan & Tier
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isRetro ? 'text-[#1a2e1f]/75' : 'text-slate-500'
                }`}
              >
                Informasi kuota gamifikasi dan paket fitur aktif
              </p>
            </div>

            <div
              className={`p-6 space-y-4 ${
                isRetro
                  ? 'rounded-[22px] border-[3px] border-[#1a2e1f] bg-[#e8f7ec] shadow-[4px_4px_0px_#1a2e1f]'
                  : 'rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-teal-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isRetro
                      ? 'bg-[#ffc93c] text-[#1a2e1f] border-2 border-[#1a2e1f]'
                      : 'text-emerald-800 bg-emerald-200/60 border border-emerald-300'
                  }`}
                >
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
