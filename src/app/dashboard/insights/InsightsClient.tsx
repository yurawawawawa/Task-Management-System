'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  BarChart3,
  Target,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function InsightsClient() {
  const [period, setPeriod] = useState<'30D' | '90D' | '1Y'>('30D');

  const hourlyData = [
    { hour: '06:00', label: 'Pagi Awal', count: 12, height: '35%' },
    { hour: '08:00', label: 'Pagi', count: 28, height: '75%' },
    { hour: '10:00', label: 'Puncak Pagi', count: 42, height: '100%', peak: true },
    { hour: '12:00', label: 'Siang', count: 14, height: '40%' },
    { hour: '14:00', label: 'Siang Kedua', count: 32, height: '80%' },
    { hour: '16:00', label: 'Sore', count: 24, height: '65%' },
    { hour: '18:00', label: 'Senja', count: 10, height: '30%' },
    { hour: '20:00', label: 'Malam', count: 18, height: '50%' },
  ];

  const categoryDistribution = [
    { name: 'Deep Work & Coding', percentage: 42, count: 36, color: 'bg-[#ff7a2f]' },
    { name: 'Belajar & Pengembangan Diri', percentage: 28, count: 24, color: 'bg-emerald-600' },
    { name: 'Rapat & Kolaborasi Proyek', percentage: 18, count: 15, color: 'bg-blue-600' },
    { name: 'Personal & Habit Harian', percentage: 12, count: 10, color: 'bg-purple-600' },
  ];

  const weeklyTrend = [
    { week: 'Pekan 1', rate: 78, tasks: 18 },
    { week: 'Pekan 2', rate: 84, tasks: 22 },
    { week: 'Pekan 3', rate: 89, tasks: 26 },
    { week: 'Pekan 4 (Ini)', rate: 94, tasks: 29, active: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#ff7a2f]/10 text-[#ff7a2f] border border-[#ff7a2f]/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Fitur Inti Bawaan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Insights & Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Analitik produktivitas personal untuk mengenali pola fokus, jam terbaik, dan ritme konsistensimu tanpa biaya tambahan.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl text-xs font-black self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPeriod('30D')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === '30D'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              30 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriod('90D')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === '90D'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              90 Hari
            </button>
            <button
              type="button"
              onClick={() => setPeriod('1Y')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === '1Y'
                  ? 'bg-white text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              1 Tahun
            </button>
          </div>
        </div>

        {/* 4 Core KPIs */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[#ff7a2f]">
                Completion Rate Mingguan
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                +8%
              </span>
            </div>
            <div className="text-3xl font-black text-[#1a2e1f] mt-1">86%</div>
            <span className="text-xs text-muted-foreground font-semibold">
              Dari 28 target tugas pekan ini
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-emerald-800">
                Completion Rate Bulanan
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                Stabil
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-900 mt-1">81%</div>
            <span className="text-xs text-muted-foreground font-semibold">
              Konsisten di atas target 80%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-blue-800">
                Jam Paling Produktif
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950 mt-1">
              09:00 - 11:30
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Zona fokus tertinggi kamu
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-purple-800">
                Skor Konsistensi
              </span>
              <Flame className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-purple-950 mt-1">92 / 100</div>
            <span className="text-xs text-muted-foreground font-semibold">
              Tingkat retensi streak tinggi
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Jam Paling Produktif & Tren Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card: Jam Paling Produktif */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Jam Paling Produktif
                </h2>
                <p className="text-xs text-muted-foreground">
                  Distribusi waktu saat tugas dan habit diselesaikan
                </p>
              </div>
              <span className="text-xs font-black text-[#ff7a2f] bg-[#ff7a2f]/10 px-2 py-1 rounded-full border border-[#ff7a2f]/20">
                Puncak: 10:00 Pagi
              </span>
            </div>

            {/* Hourly Bar Visualizer */}
            <div className="mt-8 flex items-end justify-between gap-2 h-44 px-2 pb-2 border-b border-border">
              {hourlyData.map((item) => (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-black text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                      item.peak
                        ? 'bg-[#ff7a2f] shadow-2xs ring-2 ring-[#ff7a2f]/40'
                        : 'bg-muted-hover hover:bg-primary/40'
                    }`}
                    style={{ height: item.height }}
                  />
                  <span className={`text-[10px] font-black ${item.peak ? 'text-[#ff7a2f]' : 'text-muted-foreground'}`}>
                    {item.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Takeaway */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
            <span className="font-extrabold text-foreground block mb-0.5">
              Rekomendasi Ritme:
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Kamu menuntaskan lebih dari 40% tugas penting sebelum pukul 12 siang. Alokasikan tugas sulit (Deep Work) di blok pagi untuk hasil optimal.
            </p>
          </div>
        </div>

        {/* Card: Tren Streak & Progres Pekanan */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#ff7a2f] fill-[#ff7a2f]" />
                  Tren Konsistensi Pekanan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tingkat keberhasilan pemenuhan target dalam 4 pekan terakhir
                </p>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                Tren Positif
              </span>
            </div>

            {/* Weekly Progress Bars */}
            <div className="mt-6 space-y-4">
              {weeklyTrend.map((w) => (
                <div key={w.week} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-black ${w.active ? 'text-[#ff7a2f]' : 'text-foreground'}`}>
                      {w.week}
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      {w.tasks} task selesai &middot; <strong className="text-foreground">{w.rate}%</strong>
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        w.active ? 'bg-[#ff7a2f]' : 'bg-primary'
                      }`}
                      style={{ width: `${w.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              Ingin memeriksa detail setiap hari?
            </span>
            <Link
              href="/dashboard/productivity"
              className="inline-flex items-center gap-1 font-black text-primary hover:underline underline-offset-4"
            >
              <span>Productivity Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Card: Distribusi Task per Kategori */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-border shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Distribusi Task per Kategori
            </h2>
            <p className="text-xs text-muted-foreground">
              Komposisi alokasi energi dan fokus kerjamu
            </p>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-6">
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-muted">
            {categoryDistribution.map((cat) => (
              <div
                key={cat.name}
                className={`${cat.color} transition-all duration-500`}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.name}: ${cat.percentage}%`}
              />
            ))}
          </div>

          {/* Category Chips Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="p-4 rounded-2xl bg-muted/20 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-xs font-black text-foreground truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {cat.percentage}%
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {cat.count} aktivitas tercatat
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
