'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QueueTable, DEFAULT_5_PATIENTS } from '@/components/practitioner/queue-table';
import { DailyQuotaCalendar } from '@/components/practitioner/daily-quota-calendar';
import { RadarChart7Nodes } from '@/components/practitioner/radar-chart-7nodes';
import { PulseHrvTracker } from '@/components/practitioner/pulse-hrv-tracker';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CLINIC_CONFIG, FUNCTIONAL_NODES } from '@/lib/constants';
import {
  Stethoscope,
  Activity,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Pill,
  Mic,
  Brain,
  Layers,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function PractitionerDashboardMainPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p-1');
  const todayStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

  const selectedPatient =
    DEFAULT_5_PATIENTS.find((p) => p.id === selectedPatientId) || DEFAULT_5_PATIENTS[0];

  // Mock 7 Nodes Score untuk pasien terpilih
  const patientScores = {
    assimilation: 78,
    defense_repair: 45,
    energy: 65,
    biotransformation: 58,
    communication: 62,
    transport_structural: 80,
    mental_emotional: 50,
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* 1. Practitioner Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {CLINIC_CONFIG.practitionerName}
              </h1>
              <Badge variant="success">Dokter Praktisi Aktif</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {CLINIC_CONFIG.name} • Kuota Harian: 5 Pasien Maksimal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-mono text-slate-300 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{todayStr}</span>
          </div>
        </div>
      </div>

      {/* 2. Kalender Kuota: Indikator Visual Slot 5/5 Harian */}
      <DailyQuotaCalendar currentDate={todayStr} />

      {/* 3. Panel Ringkas 5 Pasien Hari Ini */}
      <QueueTable
        date={todayStr}
        appointments={DEFAULT_5_PATIENTS}
        onStartSession={(id) => setSelectedPatientId(id)}
        onView360={(id) => setSelectedPatientId(id)}
      />

      {/* 4. Panel Tinjauan Cepat Pasien Aktif */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" />
              Tinjauan Fungsional Pasien: {selectedPatient.patient_name}
            </h2>
            <p className="text-xs text-slate-400">
              Slot #{selectedPatient.slot_number} ({selectedPatient.time} WIB) • Status: {selectedPatient.attendanceStatus === 'checked_in' ? 'Hadir di Ruang Tunggu' : 'Menunggu'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/practitioner/patient/${selectedPatient.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              <span>Buka Layar 360° Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>

            <Link
              href={`/practitioner/therapy-session/${selectedPatient.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-md shadow-teal-950/60"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Buka Meja Terapi</span>
            </Link>
          </div>
        </div>

        {/* Radar Chart 7 Node Pasien Aktif */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <RadarChart7Nodes
              scores={patientScores}
              patientName={selectedPatient.patient_name}
            />
          </div>

          {/* Quick Info & Biofeedback Preview */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-amber-900/40 bg-slate-950/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-400" />
                  Peringatan Keamanan Obat
                </span>
                <Badge variant="warning" className="text-[10px]">Jeda 120 Mnt</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-white block">Amlodipine 5mg (Anti-Hipertensi)</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Deplesi intraseluler CoQ10 & Kalium. Beri jeda 120 menit sebelum minum rebusan herbal dapur.
                </p>
              </div>
            </Card>

            <Card className="border-teal-900/40 bg-slate-950/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Titik Saraf AI Rekomendasi
                </span>
                <Badge variant="info" className="text-[10px]">Totok Saraf</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {['ST36 (Zusanli)', 'T5-T9 Paravertebral', 'PC6 (Neiguan)', 'LI4 (Hegu)'].map((pt) => (
                    <span
                      key={pt}
                      className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/80 text-[11px] font-semibold"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-[11px]">
                  Target: Stimulasi cabang vagus auricularis & dekompresi rantai simpatis splanchnic.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Realtime Pulse & HRV Biofeedback Tracker */}
        <PulseHrvTracker
          onSave={(data) => {
            alert(
              `Hasil Evaluasi ${selectedPatient.patient_name} Tersimpan! Pre: ${data.prePulse} BPM / ${data.preHrv} ms -> Post: ${data.postPulse} BPM / ${data.postHrv} ms`
            );
          }}
        />
      </div>
    </div>
  );
}
