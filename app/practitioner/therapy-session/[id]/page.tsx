'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { playGentleAcupointChime, unlockOrResumeAudioContext } from '@/lib/audio/chime';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Heart,
  Volume2,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface TherapyPoint {
  id: string;
  code: string;
  name: string;
  location: string;
  targetSegment: string;
  technique: 'tonification' | 'sedation';
  techniqueDescription: string;
  recommendedDurationSeconds: number; // 60-120 detik
  neurologicalObjective: string;
}

const AI_RECOMMENDED_THERAPY_POINTS: TherapyPoint[] = [
  {
    id: 'pt-1',
    code: 'ST36',
    name: 'Zusanli (Kaki Tiga Mil)',
    location: '4 jari di bawah tempurung lutut, 1 jari lateral krista tibia',
    targetSegment: 'Persarafan Perifer N. Peroneus Profundus -> Modulasi Vagal',
    technique: 'tonification',
    techniqueDescription: 'Tonifikasi: Tekanan lembut sirkular searah jarum jam dengan ritme stabil.',
    recommendedDurationSeconds: 90,
    neurologicalObjective: 'Meningkatkan motilitas lambung & regenerasi energi fungsional asimilasi.',
  },
  {
    id: 'pt-2',
    code: 'T5-T9',
    name: 'Segmen Torakal T5–T9 Paravertebral',
    location: '2 jari bilateral kolumna vertebra setinggi torakal 5 sampai torakal 9',
    targetSegment: 'Rantai Ganglion Simpatis Splanchnic & Pleksus Celiac',
    technique: 'sedation',
    techniqueDescription: 'Sedasi: Kompresi ritmis dalam secara gradual berlawanan jarum jam / tekan tahan.',
    recommendedDurationSeconds: 120,
    neurologicalObjective: 'Mendekompresi hiperaktivitas saraf simpatis lambung, empedu & pankreas.',
  },
  {
    id: 'pt-3',
    code: 'PC6',
    name: 'Neiguan (Gerbang Dalam)',
    location: '3 jari di atas lipatan volar pergelangan tangan, antara tendon M. Flexor carpi radialis & M. Palmaris longus',
    targetSegment: 'Nervus Medianus (C6-T1) -> Batang Otak & Pusat Emetik',
    technique: 'tonification',
    techniqueDescription: 'Tonifikasi: Tekanan mantap sirkular dengan frekuensi 30 putaran per menit.',
    recommendedDurationSeconds: 90,
    neurologicalObjective: 'Meredakan mual ulu hati, rasa begah, serta menstabilkan detak jantung.',
  },
  {
    id: 'pt-4',
    code: 'LI4',
    name: 'Hegu (Lembah Pertemuan)',
    location: 'Dorsum manus, pertengahan tulang metakarpal ke-2 pada sisi radialis',
    targetSegment: 'Nervus Radialis Superfisial -> Modulasi Endorfin Pusat',
    technique: 'sedation',
    techniqueDescription: 'Sedasi: Jepit mantap dari atas dan bawah, beri tekanan ritmis berulang.',
    recommendedDurationSeconds: 60,
    neurologicalObjective: 'Meredakan spasme otot servikal, tensi tengkuk kaku, dan melancarkan mikrovaskular kepala.',
  },
];

export default function PractitionerTherapySessionPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = (params?.id as string) || 'p-1';

  // State Titik Aktif
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);
  const activePoint = AI_RECOMMENDED_THERAPY_POINTS[currentPointIndex];

  // State Timer
  const [timerDuration, setTimerDuration] = useState<number>(activePoint.recommendedDurationSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(activePoint.recommendedDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedPoints, setCompletedPoints] = useState<string[]>([]);

  // State Biofeedback Kilat (Denyut Nadi BPM & HRV ms)
  const [prePulse, setPrePulse] = useState<string>('84');
  const [postPulse, setPostPulse] = useState<string>('72');
  const [preHrv, setPreHrv] = useState<string>('38');
  const [postHrv, setPostHrv] = useState<string>('56');
  const [isBiofeedbackSaved, setIsBiofeedbackSaved] = useState<boolean>(false);

  // Update timer saat berpindah titik
  useEffect(() => {
    setTimerDuration(activePoint.recommendedDurationSeconds);
    setSecondsRemaining(activePoint.recommendedDurationSeconds);
    setIsTimerRunning(false);
  }, [currentPointIndex, activePoint]);

  // Hitung Mundur Timer + Trigger Audio Beep Lembut
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Bunyikan Web Audio Chime lembut penanda ganti titik
            playGentleAcupointChime();

            // Tandai titik ini telah selesai
            setCompletedPoints((cp) => (cp.includes(activePoint.id) ? cp : [...cp, activePoint.id]));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining, activePoint]);

  // Ganti ke Titik Berikutnya
  const handleNextPoint = () => {
    if (currentPointIndex < AI_RECOMMENDED_THERAPY_POINTS.length - 1) {
      setCurrentPointIndex((idx) => idx + 1);
    }
  };

  const handlePrevPoint = () => {
    if (currentPointIndex > 0) {
      setCurrentPointIndex((idx) => idx - 1);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(timerDuration);
  };

  const setManualDuration = (secs: number) => {
    setTimerDuration(secs);
    setSecondsRemaining(secs);
    setIsTimerRunning(false);
  };

  // Kalkulasi Aktivasi Nervus Vagus (%)
  const preHrvNum = parseFloat(preHrv) || 0;
  const postHrvNum = parseFloat(postHrv) || 0;
  const hrvDeltaPercent = preHrvNum > 0 ? Math.round(((postHrvNum - preHrvNum) / preHrvNum) * 100) : 0;

  const prePulseNum = parseInt(prePulse, 10) || 0;
  const postPulseNum = parseInt(postPulse, 10) || 0;
  const pulseDrop = prePulseNum - postPulseNum;

  const progressPercent = Math.round(((timerDuration - secondsRemaining) / timerDuration) * 100);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-5 space-y-5">
      {/* Top Header Khusus Meja Terapi (Ergonomis Tablet) */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/70 border border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/practitioner/patient/${patientId}`}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition-colors shrink-0"
            title="Kembali ke Tinjauan 360"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Mode Terapi Fisik & Totok Saraf
              </h1>
              <Badge variant="info">Meja Tindakan</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Pasien: Bpk. Budi Santoso (52 thn) • Slot 08:30 WIB
            </p>
          </div>
        </div>

        {/* Audio Beep Test Button */}
        <button
          type="button"
          onClick={async () => {
            await unlockOrResumeAudioContext();
            playGentleAcupointChime();
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-teal-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Uji Suara Chime Penanda"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tes Chime Audio</span>
        </button>
      </div>

      {/* Progress Titik Tindakan Terapi */}
      <div className="grid grid-cols-4 gap-2">
        {AI_RECOMMENDED_THERAPY_POINTS.map((pt, idx) => {
          const isCurrent = currentPointIndex === idx;
          const isDone = completedPoints.includes(pt.id);
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => setCurrentPointIndex(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-teal-950 border-teal-500 shadow-md ring-2 ring-teal-500/30'
                  : isDone
                  ? 'bg-slate-900/90 border-emerald-700/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">#{idx + 1} {pt.code}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-500">{pt.recommendedDurationSeconds}s</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                {pt.name.split('(')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* PANEL UTAMA TINDAKAN FISIK (TITIK SARAF + TEKNIK + TIMER) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* KOLOM KIRI: PANDUAN ANATOMI & INDIKATOR TEKNIK */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-teal-700/50 bg-slate-950 p-5 rounded-2xl space-y-4 shadow-xl">
            {/* Header Titik Saraf */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block">
                  Titik Stimulasi Aktif (#{currentPointIndex + 1} dari {AI_RECOMMENDED_THERAPY_POINTS.length})
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  📍 {activePoint.code} — {activePoint.name}
                </h2>
                <span className="text-xs text-slate-400 block mt-1">
                  🎯 Jalur: {activePoint.targetSegment}
                </span>
              </div>

              {/* INDIKATOR TEKNIK: TONIFIKASI VS SEDASI */}
              <div>
                {activePoint.technique === 'tonification' ? (
                  <div className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-600 text-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                    <span>Tonifikasi (Sirkular Searah Jarum Jam)</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Sedasi (Tekanan Ritmis Dalam)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Petunjuk Lokasi Anatomi untuk Praktisi */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <span className="font-bold text-slate-200 block uppercase tracking-wide text-[10px]">
                Panduan Palpasi Lokasi Anatomi:
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {activePoint.location}
              </p>
            </div>

            {/* Instruksi Teknik & Tujuan Neurologis */}
            <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-900/50 space-y-1.5 text-xs">
              <span className="font-bold text-teal-300 block uppercase tracking-wide text-[10px]">
                Teknik Tindakan Terapeutik:
              </span>
              <p className="text-white text-xs leading-relaxed">
                {activePoint.techniqueDescription}
              </p>
              <span className="text-[11px] text-teal-400/90 block pt-1 border-t border-teal-900/40">
                💡 <strong>Target:</strong> {activePoint.neurologicalObjective}
              </span>
            </div>

            {/* Navigasi Titik Sebelum / Sesudah */}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPointIndex === 0}
                onClick={handlePrevPoint}
                className="text-xs"
              >
                ← Titik Sebelumnya
              </Button>
              <Button
                type="button"
                variant="emerald"
                size="sm"
                disabled={currentPointIndex === AI_RECOMMENDED_THERAPY_POINTS.length - 1}
                onClick={handleNextPoint}
                className="text-xs font-bold gap-1"
              >
                <span>Titik Selanjutnya</span>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* KOLOM KANAN: TIMER DURASI + AUDIO BEEP (60 - 120 DETIK) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-teal-700/50 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                Timer Durasi Tindakan
              </span>

              {/* Selector Cepat Durasi (60, 90, 120 Detik) */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[60, 90, 120].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setManualDuration(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      timerDuration === s
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Progress & Huge Digital Display */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-teal-400 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wider">
                  00:{secondsRemaining.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 mt-1">
                  {isTimerRunning ? 'Stimulasi Berjalan' : secondsRemaining === 0 ? 'Titik Tuntas' : 'Siap'}
                </span>
              </div>
            </div>

            {/* Pesan Ritme & Audio Cue */}
            <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
              {isTimerRunning
                ? '🔔 Nada chime lembut otomatis berbunyi saat durasi tuntas.'
                : secondsRemaining === 0
                ? '✅ Durasi tuntas! Silakan pindah ke titik berikutnya.'
                : 'Sentuh tombol Mulai untuk menghitung mundur ritme totok saraf.'}
            </p>

            {/* Kontrol Timer Besar (Mudah Ditekan di Ranjang Terapi) */}
            <div className="w-full flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant={isTimerRunning ? 'outline' : 'emerald'}
                size="lg"
                onClick={async () => {
                  if (!isTimerRunning) {
                    // Buka kunci AudioContext saat dokter/praktisi memulai sesi/durasi tindakan
                    // Memastikan audio chime dapat berbunyi di iOS Safari / Android tanpa terblokir
                    await unlockOrResumeAudioContext();
                  }
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="flex-1 py-3 text-sm font-bold gap-2 shadow-lg"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Jeda Tindakan
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Mulai Durasi ({secondsRemaining}s)
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleResetTimer}
                className="px-3 text-slate-400 hover:text-slate-200"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INPUT BIOFEEDBACK KILAT: DENYUT NADI & HRV AWAL VS AKHIR */}
      {/* ============================================================ */}
      <Card className="border-emerald-700/40 bg-slate-950 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Input Biofeedback Kilat (Bukti Aktivasi Nervus Vagus)
              </h3>
              <p className="text-[11px] text-slate-400">
                Pencatatan denyut nadi & HRV sebelum vs sesudah terapi untuk pembuktian relaksasi objektif
              </p>
            </div>
          </div>

          {/* Metric Tag */}
          {hrvDeltaPercent > 0 && (
            <Badge variant="success" className="text-xs font-mono">
              ⚡ +{hrvDeltaPercent}% Aktivasi Vagus
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Nadi Awal (Pre-Pulse) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              1. Nadi Awal (Pre-Pulse)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={prePulse}
                onChange={(e) => setPrePulse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0 font-medium">BPM</span>
            </div>
          </div>

          {/* 2. Nadi Akhir (Post-Pulse) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 block">
              2. Nadi Akhir (Post-Pulse)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={postPulse}
                onChange={(e) => setPostPulse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-emerald-600 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0 font-medium">BPM</span>
            </div>
          </div>

          {/* 3. HRV Awal (Pre-HRV) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">
              3. HRV Awal (Pre-HRV)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={preHrv}
                onChange={(e) => setPreHrv(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0 font-medium">ms (RMSSD)</span>
            </div>
          </div>

          {/* 4. HRV Akhir (Post-HRV) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 block">
              4. HRV Akhir (Post-HRV)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={postHrv}
                onChange={(e) => setPostHrv(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-emerald-600 rounded-lg text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0 font-medium">ms (RMSSD)</span>
            </div>
          </div>
        </div>

        {/* Kalkulasi Klinis Otomatis */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-white block">
              📊 Evaluasi Fisiologis Seketika:
            </span>
            <span className="text-slate-300 text-[11px]">
              {pulseDrop > 0 ? `Penurunan nadi -${pulseDrop} BPM (Peredaan Simpatis) • ` : ''}
              Peningkatan HRV: <strong>{preHrv} ms → {postHrv} ms</strong> ({hrvDeltaPercent > 0 ? `+${hrvDeltaPercent}%` : `${hrvDeltaPercent}%`})
            </span>
          </div>

          <Button
            type="button"
            variant="emerald"
            size="sm"
            onClick={() => setIsBiofeedbackSaved(true)}
            className="text-xs font-bold gap-1.5 self-start sm:self-auto shrink-0 shadow-md"
          >
            {isBiofeedbackSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Data Tersimpan di Rekam Medis
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Simpan Evaluasi Sesi
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
