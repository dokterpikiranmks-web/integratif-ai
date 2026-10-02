'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';

interface Acupoint {
  id: string;
  code: string;
  indonesianName: string;
  bodyRegion: 'head' | 'wrist' | 'hand' | 'leg';
  x: number; // Persentase koordinat X pada SVG tubuh (0-100)
  y: number; // Persentase koordinat Y pada SVG tubuh (0-100)
  targetOrgan: string;
  anatomicalGuide: string;
  massageTechnique: string;
  clinicalEffect: string;
}

const ACUPOINTS_DATA: Acupoint[] = [
  {
    id: 'st36',
    code: 'ST36',
    indonesianName: 'Zusanli (Kaki Tiga Mil)',
    bodyRegion: 'leg',
    x: 42,
    y: 72,
    targetOrgan: 'Lambung, Usus & Nervus Vagus',
    anatomicalGuide: '4 jari (selebar telapak tangan) tepat di bawah tempurung lutut, 1 jari ke arah luar tulang kering.',
    massageTechnique: 'Tekan dengan ibu jari secara mantap, buat gerakan memutar searah jarum jam dengan ritme stabil.',
    clinicalEffect: 'Meningkatkan motilitas lambung, meredakan kembung & begah, serta meregenerasi energi mitokondria.',
  },
  {
    id: 'pc6',
    code: 'PC6',
    indonesianName: 'Neiguan (Gerbang Dalam)',
    bodyRegion: 'wrist',
    x: 24,
    y: 52,
    targetOrgan: 'Regulasi Saraf Vagus & Ulu Hati',
    anatomicalGuide: '3 jari di atas lipatan pergelangan tangan bagian dalam, tepat di antara 2 urat/tendon yang menonjol.',
    massageTechnique: 'Tekan lembut namun dalam menggunakan ujung jempol. Tahan 3 detik lalu lepas perlahan.',
    clinicalEffect: 'Meredakan mual, asam lambung naik (GERD), detak jantung berdebar, serta kecemasan dada.',
  },
  {
    id: 'li4',
    code: 'LI4',
    indonesianName: 'Hegu (Lembah Pertemuan)',
    bodyRegion: 'hand',
    x: 21,
    y: 58,
    targetOrgan: 'Sirkulasi Kepala & Tengkuk Leher',
    anatomicalGuide: 'Di punggung tangan, pada cekungan antara pangkal tulang ibu jari dan jari telunjuk.',
    massageTechnique: 'Jepit dari atas dan bawah menggunakan jempol dan telunjuk tangan lainnya. Beri tekanan mantap.',
    clinicalEffect: 'Melancarkan peredaran darah ke kepala, meredakan tensi tengkuk kaku, dan meredakan migrain.',
  },
  {
    id: 'gv20',
    code: 'GV20',
    indonesianName: 'Baihui (Ratusan Pertemuan)',
    bodyRegion: 'head',
    x: 50,
    y: 11,
    targetOrgan: 'Sistem Saraf Pusat & Aksis Kortisol',
    anatomicalGuide: 'Tepat di puncak ubun-ubun kepala, pada garis lurus pertemuan antara kedua ujung atas daun telinga.',
    massageTechnique: 'Tekan lembut menggunakan bantalan jari tengah dengan napas tenang teratur.',
    clinicalEffect: 'Menyeimbangkan sistem saraf simpatis, meredakan stres mental, dan mengatasi insomnia.',
  },
];

export function AcupressureGuideModal() {
  const [selectedPointId, setSelectedPointId] = useState<string>('st36');
  const [secondsLeft, setSecondsLeft] = useState<number>(90); // 90 Detik sesuai spesifikasi
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const selectedPoint = ACUPOINTS_DATA.find((p) => p.id === selectedPointId) || ACUPOINTS_DATA[0];

  // Efek Timer 90 Detik
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsCompleted(true);
            // Getaran HP jika didukung (haptic feedback)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft]);

  // Ganti Titik
  const handleSelectPoint = (id: string) => {
    setSelectedPointId(id);
    setIsTimerRunning(false);
    setSecondsLeft(90);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsLeft(90);
    setIsCompleted(false);
  };

  const progressPercent = Math.round(((90 - secondsLeft) / 90) * 100);

  return (
    <Card className="border-teal-800/40 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/20 p-5 rounded-2xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Panduan Totok Saraf Mandiri
              <Badge variant="info">Timer 90 Detik</Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Peta tubuh visual dengan titik berkedip untuk stimulasi saraf otonom di rumah
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Peta Tubuh Visual (Kiri) & Timer Instruksi (Kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* PETA TUBUH VISUAL DENGAN TITIK BERKEDIP */}
        <div className="md:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest absolute top-3 left-3 font-semibold">
            Peta Anatomi Titik Meridian
          </span>

          {/* SVG Siluet Tubuh Manusia Minimalis */}
          <div className="relative w-48 h-64 mt-4">
            <svg
              viewBox="0 0 100 150"
              className="w-full h-full text-slate-700 stroke-current fill-slate-900/80"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Kepala */}
              <circle cx="50" cy="18" r="9" />
              {/* Leher */}
              <path d="M47 27 L47 32 M53 27 L53 32" />
              {/* Bahu & Dada */}
              <path d="M30 36 C35 32, 65 32, 70 36 L72 65 C68 70, 32 70, 28 65 Z" />
              {/* Lengan Kiri */}
              <path d="M30 36 L24 65 L22 85" />
              {/* Lengan Kanan */}
              <path d="M70 36 L76 65 L78 85" />
              {/* Pinggul & Kaki */}
              <path d="M35 70 L35 110 L38 140 M65 70 L65 110 L62 140" />
            </svg>

            {/* Titik-Titik Akupresur Interaktif */}
            {ACUPOINTS_DATA.map((pt) => {
              const isSelected = selectedPointId === pt.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => handleSelectPoint(pt.id)}
                  style={{ top: `${pt.y}%`, left: `${pt.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  title={`${pt.code} - ${pt.indonesianName}`}
                >
                  {/* Pulsing Beacon Ring (Titik Berkedip) */}
                  {isSelected && (
                    <>
                      <span className="absolute -inset-2.5 rounded-full bg-emerald-400/40 animate-ping" />
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/60 animate-pulse" />
                    </>
                  )}

                  <span
                    className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/80 scale-125'
                        : 'bg-slate-700 text-slate-300 hover:bg-emerald-600'
                    }`}
                  >
                    •
                  </span>

                  {/* Label Nama Kode */}
                  <span
                    className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow ${
                      isSelected
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {pt.code}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 text-center mt-2">
            Sentuh titik pada tubuh untuk berpindah panduan
          </div>
        </div>

        {/* PANEL INSTRUKSI & TIMER HITUNG MUNDUR 90 DETIK */}
        <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  Titik Terpilih Sesi Ini:
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  📍 {selectedPoint.code} — {selectedPoint.indonesianName}
                </h4>
              </div>
              <Badge variant="success">{selectedPoint.targetOrgan.split(',')[0]}</Badge>
            </div>

            <div className="space-y-1 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
              <p>
                <strong>Lokasi Anatomi:</strong> {selectedPoint.anatomicalGuide}
              </p>
              <p>
                <strong>Teknik Penekanan:</strong> {selectedPoint.massageTechnique}
              </p>
              <p className="text-teal-300 text-[11px] pt-0.5">
                💡 <strong>Manfaat:</strong> {selectedPoint.clinicalEffect}
              </p>
            </div>
          </div>

          {/* TIMER HITUNG MUNDUR 90 DETIK INTERAKTIF */}
          <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Timer Hitung Mundur Pijatan:
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-teal-300 tracking-wider">
                00:{secondsLeft.toString().padStart(2, '0')}
              </div>
            </div>

            {/* Progress Bar 90 Detik */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {isCompleted ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pijatan 90 detik tuntas! Tubuh Anda semakin seimbang.</span>
              </div>
            ) : isTimerRunning ? (
              <p className="text-[11px] text-teal-200/90 text-center animate-pulse">
                🧘 Tarik napas perlahan dari hidung... tekan titik memutar teratur...
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 text-center">
                Tekan tombol Mulai dan pertahankan pijatan lembut selama 90 detik.
              </p>
            )}

            {/* Kontrol Timer */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                variant={isTimerRunning ? 'outline' : 'emerald'}
                size="sm"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-xs gap-1.5 font-bold px-4"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Jeda Timer
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> {secondsLeft < 90 ? 'Lanjutkan' : 'Mulai Pijat 90 Detik'}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetTimer}
                className="text-xs text-slate-400 hover:text-slate-200 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
