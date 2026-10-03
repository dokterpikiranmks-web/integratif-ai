'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { InteractiveNowCard } from '@/components/patient/interactive-now-card';
import { SmartSwapCard } from '@/components/patient/smart-swap-card';
import { AcupressureGuideModal } from '@/components/patient/acupressure-guide-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CLINIC_CONFIG } from '@/lib/constants';
import {
  Heart,
  Calendar,
  Mic,
  Clock,
  Coffee,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

function UnauthorizedAlert() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('error') === 'unauthorized';

  if (!isUnauthorized) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-3 shadow-lg shadow-amber-950/50">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <div className="font-bold text-amber-300">Akses Terproteksi RBAC (Triple-Lock Shield)</div>
        <div className="mt-0.5 text-slate-300 leading-relaxed">
          Anda dialihkan kembali ke Portal Pasien karena rute Ruang Praktisi hanya dapat diakses oleh akun praktisi/dokter terverifikasi. Rekam medis pasien lain terlindungi secara kriptografis.
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboardPage() {
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
  }).format(new Date());

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* RBAC Security Shield Notice jika di-redirect dari rute praktisi */}
      <Suspense fallback={null}>
        <UnauthorizedAlert />
      </Suspense>

      {/* Patient Greeting & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-base shrink-0">
            BS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Selamat Datang, Bapak Budi
              </h1>
              <Badge variant="success">Fase 1: Asimilasi</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Protokol Terpadu {CLINIC_CONFIG.practitionerName}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          {todayStr}
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/patient/booking"
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center gap-2.5 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Reservasi Slot</span>
            <span className="text-[10px] text-slate-400">Pilih 1 dari 5 slot harian</span>
          </div>
        </Link>

        <Link
          href="/patient/intake"
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center gap-2.5 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Asupan Suara</span>
            <span className="text-[10px] text-slate-400">Curhat keluhan tanpa ketik</span>
          </div>
        </Link>
      </div>

      {/* 1. NOW CARD: 1 AKSI PRIORITAS UTAMA BERDASARKAN WAKTU LOKAL */}
      <div className="space-y-2">
        <InteractiveNowCard
          lastMedicationTime="12:00"
          prescribedDrugName="Amlodipine 5mg"
          targetHerbalName="Rebusan Temulawak + Kunyit + Daun Salam"
          targetAcupoint="Titik ST36 (Zusanli)"
        />
      </div>

      {/* 2. FITUR SMART SWAP NUSANTARA (ONE-TOUCH CONVERSION) */}
      <div className="space-y-2">
        <SmartSwapCard />
      </div>

      {/* 3. PANDUAN TITIK AKUPRESUR MANDIRI (VISUAL BODY MAP + 90s COUNTDOWN TIMER) */}
      <div className="space-y-2">
        <AcupressureGuideModal />
      </div>

      {/* Footer Info Medis & Safety Reassurance */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Semua protokol diselaraskan dengan kaidah farmakologi integratif. Ramuan dapur lokal diformulasikan untuk menopang metabolisme obat kimia dokter Anda tanpa risiko benturan enzim hati.
        </p>
      </div>
    </div>
  );
}
