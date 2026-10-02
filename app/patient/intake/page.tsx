'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceRecorder } from '@/components/patient/voice-recorder';
import { CameraUploader } from '@/components/patient/camera-uploader';
import { IntakeSummaryCard } from '@/components/patient/intake-summary-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IntakeAudioResponse, ScanPrescriptionLabResponse } from '@/types/ai';
import {
  Mic,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

export default function PatientIntakePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'voice' | 'camera'>('voice');
  const [audioResult, setAudioResult] = useState<IntakeAudioResponse | null>(null);
  const [scanResult, setScanResult] = useState<ScanPrescriptionLabResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAudioComplete = (data: IntakeAudioResponse) => {
    setAudioResult(data);
  };

  const handleScanComplete = (data: ScanPrescriptionLabResponse) => {
    setScanResult(data);
  };

  const handleConfirmAndProceed = () => {
    setIsSubmitting(true);
    // Simpan ke state / redirect ke dashboard pasien
    setTimeout(() => {
      router.push('/patient/dashboard');
    }, 600);
  };

  return (
    <div className="container mx-auto max-w-xl px-4 py-6 space-y-6">
      {/* Header Halaman (Earthy / Healing Palette, Sangat Jelas untuk Lansia) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Langkah 2: Asupan Data Medis
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Asupan Mandiri Tanpa Mengetik
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cukup rekam suara keluhan atau foto strip obat/lab Anda
          </p>
        </div>
        <Badge variant="success">Zero Friction</Badge>
      </div>

      {/* Navigasi Tab Aksi: 1. Suara Keluhan | 2. Foto Obat/Lab */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'voice'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>1. Rekam Suara Keluhan</span>
          {audioResult && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'camera'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-teal-400" />
          <span>2. Foto Obat & Lab</span>
          {scanResult && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 ml-1" />}
        </button>
      </div>

      {/* TAB 1: VOICE RECORDER INTERAKTIF DENGAN TOMBOL BERDENYUT */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          <VoiceRecorder
            onExtractionComplete={handleAudioComplete}
            patientName="Pasien"
          />

          {/* Tips Anamnesis untuk Pasien */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              💡 Panduan Singkat Curhat Suara:
            </span>
            <p className="text-[11px] leading-relaxed">
              Ceritakan keluhan fisik utama (cth: mual, pegal tengkuk, lelah kronis), kapan keluhan mulai muncul, dan apakah ada obat dokter yang sedang rutin diminum.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: CAMERA UPLOADER DOKUMEN & OBAT */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          <CameraUploader onScanComplete={handleScanComplete} />
        </div>
      )}

      {/* KARTU KONFIRMASI RINGKAS (3 POIN UTAMA) */}
      {audioResult && (
        <div className="pt-2">
          <IntakeSummaryCard
            data={audioResult}
            onConfirm={handleConfirmAndProceed}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Tautan Cepat ke Dashboard jika Pasien ingin melewati atau sudah selesai */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={() => router.push('/patient/booking')}
          className="hover:text-slate-200 underline"
        >
          ← Kembali ke Jadwal Slot
        </button>
        <button
          type="button"
          onClick={() => router.push('/patient/dashboard')}
          className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Ke Beranda Harian Pasien</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
