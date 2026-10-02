import React from 'react';
import Link from 'next/link';
import { CLINIC_CONFIG, FUNCTIONAL_NODES } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Calendar,
  Mic,
  ShieldCheck,
  Activity,
  HeartPulse,
  Leaf,
  Clock,
  ArrowRight,
  CheckCircle,
  FileCheck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const mockFilledSlots = 3;
  const remainingSlots = CLINIC_CONFIG.maxDailyCapacity - mockFilledSlots;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-900/40 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" className="px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
              Model Solo-Praktisi Intensif
            </Badge>
            <span className="text-xs text-emerald-400/90 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
              Kapasitas: Maks 5 Pasien / Hari
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Kedokteran Integratif & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Terapi Totok Saraf Nusantara
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Praktek mandiri fokus mendalam dengan integrasi sains functional medicine, 
            Dapur Terapeutik (TOGA/Jamu Saintifik), stimulasi saraf otonom, dan asupan tanpa mengetik berbasis AI.
          </p>

          {/* Real-time Daily Slot Status Banner */}
          <div className="mt-2 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">Status Kuota Hari Ini:</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">{remainingSlots} Slot Tersedia</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{mockFilledSlots} Terkunci</span>
                </div>
              </div>
            </div>

            <Link href="/booking">
              <Button variant="emerald" size="sm" className="w-full sm:w-auto text-xs">
                Pilih Slot & Reservasi <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pilar Inti Sistem */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Keunggulan Protokol Integratif
          </h2>
          <p className="text-xs text-slate-400">
            Kombinasi teknologi mutakhir dan kebijaksanaan klinis holistik
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pilar 1 */}
          <Card className="hover:border-slate-700 transition-all">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center mb-2">
                <Mic className="w-5 h-5 text-teal-400" />
              </div>
              <CardTitle className="text-base">Zero-Typing Intake (Asupan Suara)</CardTitle>
              <CardDescription>
                Pasien cukup merekam suara keluhan 30–60 detik serta foto obat/lab lama. Gemini 1.5 Flash mengekstrak entitas klinis otomatis ke JSON.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pilar 2 */}
          <Card className="hover:border-slate-700 transition-all">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <CardTitle className="text-base">Mesin 7 Node Fungsional & ATM</CardTitle>
              <CardDescription>
                Pemetaan akar masalah organ (Asimilasi, Pertahanan, Energi, Detoks, Sirkulasi, Hormon, Struktur) dan mitigasi deplesi nutrisi akibat obat dokter.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pilar 3 */}
          <Card className="hover:border-slate-700 transition-all">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center mb-2">
                <Leaf className="w-5 h-5 text-amber-400" />
              </div>
              <CardTitle className="text-base">Dapur Terapeutik & Smart Swap</CardTitle>
              <CardDescription>
                Konversi cerdas dari suplemen mahal ke herbal dapur lokal (TOGA & Jamu Saintifik: temulawak, jahe, kunyit, daun salam) ramah kantong.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pilar 4 */}
          <Card className="hover:border-slate-700 transition-all">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center mb-2">
                <HeartPulse className="w-5 h-5 text-purple-400" />
              </div>
              <CardTitle className="text-base">Totok Saraf & Evaluasi Nadi/HRV</CardTitle>
              <CardDescription>
                Sesi terapi fisik langsung untuk menstimulasi saraf otonom perifer, disertai pencatatan perubahan denyut nadi dan HRV sebelum vs sesudah intervensi.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 7 Functional Nodes Matrix Summary */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            7 Node Fungsional Analisis Akar Masalah
          </h2>
          <p className="text-xs text-slate-400">
            Fondasi diagnostik integratif memetakan interkoneksi seluruh sistem tubuh
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FUNCTIONAL_NODES.map((node) => (
            <div
              key={node.key}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">{node.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">0-100%</span>
              </div>
              <div className="text-xs font-medium text-slate-200 mt-0.5">{node.subTitle}</div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {node.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Action Footer Callouts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link href="/booking" className="group">
          <div className="h-full p-5 rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/60 to-slate-900 group-hover:border-emerald-600 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-400">Untuk Pasien Baru & Lama</span>
              <h3 className="text-base font-bold text-white mt-1">Reservasi Slot Praktek & Asupan Suara</h3>
              <p className="text-xs text-slate-300 mt-1">
                Kunci 1 dari 5 slot harian yang tersedia dan rekam keluhan Anda tanpa perlu mengetik.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Mulai Pendaftaran <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/practitioner" className="group">
          <div className="h-full p-5 rounded-2xl border border-slate-800 bg-slate-900 group-hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Khusus Praktisi (Dokter/Terapis)</span>
              <h3 className="text-base font-bold text-white mt-1">Ruang Kendali Klinis 360°</h3>
              <p className="text-xs text-slate-400 mt-1">
                Akses antrean 5 pasien, persetujuan protokol Dapur Terapeutik, dan input Nadi/HRV sesi totok saraf.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-slate-300 group-hover:translate-x-1 transition-transform">
              Masuk Ruang Praktisi <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
