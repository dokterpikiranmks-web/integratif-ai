'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RadarChart7Nodes } from '@/components/practitioner/radar-chart-7nodes';
import { AtmTimeline } from '@/components/practitioner/atm-timeline';
import { DrugSafetyTrafficLight } from '@/components/practitioner/drug-safety-traffic-light';
import { ProtocolBuilder } from '@/components/practitioner/protocol-builder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Pill,
  Sliders,
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';

export default function PractitionerPatientReview360Page() {
  const params = useParams();
  const router = useRouter();
  const patientId = (params?.id as string) || 'p-1';

  // 3 Tab Linear: 1 (Akar Masalah), 2 (Keamanan Obat Dokter), 3 (Penyusunan Protokol)
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  // Mock Pasien Aktif (Bpk. Budi Santoso)
  const patientInfo = {
    id: patientId,
    name: 'Bpk. Budi Santoso',
    age: 52,
    gender: 'Laki-laki',
    chiefComplaint: 'Kembung & begah kronis pasca makan, tengkuk kaku, insomnia, riwayat konsumsi Amlodipine 5mg',
    slotTime: '08:30 WIB (Slot #1)',
    status: 'in_session' as const,
    scores: {
      assimilation: 78,
      defense_repair: 45,
      energy: 65,
      biotransformation: 58,
      communication: 62,
      transport_structural: 80,
      mental_emotional: 50,
    },
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Top Navigation & Patient Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/70 border border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/practitioner"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            title="Kembali ke Antrean Harian"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {patientInfo.name} ({patientInfo.age} thn)
              </h1>
              <Badge variant="success">Sesi Aktif</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {patientInfo.slotTime} • ID: {patientInfo.id}
            </p>
          </div>
        </div>

        {/* Tombol Terapi Totok Saraf */}
        <Link
          href={`/practitioner/therapy-session/${patientId}`}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-950/60 self-start sm:self-auto transition-transform hover:scale-105"
        >
          <Activity className="w-4 h-4" />
          <span>Buka Mode Sesi Totok Saraf</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 TAB LINEAR NAVIGATOR */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
            activeTab === 1
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-md ring-1 ring-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Tab 1: Akar Masalah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
            activeTab === 2
              ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-md ring-1 ring-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Tab 2: Keamanan Obat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab(3)}
          className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
            activeTab === 3
              ? 'bg-teal-950 text-teal-300 border border-teal-800 shadow-md ring-1 ring-teal-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Tab 3: Susun Protokol</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: AKAR MASALAH (RADAR CHART 7 NODE & GARIS WAKTU ATM) */}
      {/* ============================================================ */}
      {activeTab === 1 && (
        <div className="space-y-5 animate-fadeIn">
          {/* Radar Chart 7 Node Fungsional */}
          <RadarChart7Nodes
            scores={patientInfo.scores}
            patientName={patientInfo.name}
          />

          {/* Garis Waktu ATM (Antecedents • Triggers • Mediators) */}
          <AtmTimeline />

          {/* Navigasi Tab Berikutnya */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="emerald"
              size="md"
              onClick={() => setActiveTab(2)}
              className="text-xs font-bold gap-2"
            >
              <span>Lanjut ke Tab 2: Keamanan Obat</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: KEAMANAN OBAT DOKTER (LAMPU LALU LINTAS TRAFFIC LIGHT) */}
      {/* ============================================================ */}
      {activeTab === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <DrugSafetyTrafficLight />

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(1)}
              className="text-xs gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Akar Masalah
            </Button>
            <Button
              type="button"
              variant="emerald"
              size="md"
              onClick={() => setActiveTab(3)}
              className="text-xs font-bold gap-2"
            >
              <span>Lanjut ke Tab 3: Penyusunan Protokol</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PENYUSUNAN PROTOKOL (MODULAR CARDS DENGAN SAKELAR TOGGLE) */}
      {/* ============================================================ */}
      {activeTab === 3 && (
        <div className="space-y-5 animate-fadeIn">
          <ProtocolBuilder
            patientId={patientId}
            patientName={patientInfo.name}
            onPublish={(items) => {
              console.log('Protokol diterbitkan:', items);
            }}
          />

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(2)}
              className="text-xs gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Keamanan Obat
            </Button>
            <Link
              href={`/practitioner/therapy-session/${patientId}`}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <Activity className="w-4 h-4" />
              <span>Lanjut Tindakan: Mode Terapi Fisik</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
