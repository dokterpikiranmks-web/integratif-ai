'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { deidentifyText } from '@/lib/ai/anonymizer';
import { IntakeAudioResponse } from '@/types/ai';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Loader2,
  Clock,
} from 'lucide-react';

interface VoiceRecorderProps {
  onExtractionComplete?: (data: IntakeAudioResponse) => void;
  patientName?: string;
}

export function VoiceRecorder({ onExtractionComplete, patientName }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visualizerLevels, setVisualizerLevels] = useState<number[]>([15, 30, 45, 60, 40, 25, 50, 70, 35, 20]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const animFrame = animFrameRef.current;
    const audioCtx = audioContextRef.current;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrame) cancelAnimationFrame(animFrame);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  // Mulai Merekam via Web Audio API & MediaRecorder
  const startRecording = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung perekaman mikrofon langsung.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Tentukan mime type yang didukung browser
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // biarkan browser memilih default
          }
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Hentikan semua track mikrofon
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // potong chunk tiap 250ms
      setIsRecording(true);
      setRecordSeconds(0);

      // Timer durasi
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 120) {
            // Batas maksimal 2 menit
            stopRecording();
            return 120;
          }
          return prev + 1;
        });

        // Simulasi level visualizer gelombang suara
        setVisualizerLevels(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 65) + 15)
        );
      }, 1000);
    } catch (err: unknown) {
      console.error('Gagal mengakses mikrofon:', err);
      const msg = err instanceof Error ? err.message : 'Izin mikrofon ditolak atau perangkat tidak ditemukan.';
      setErrorMsg(msg);
      setIsRecording(false);
    }
  };

  // Berhenti Merekam
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  // Reset Rekaman
  const resetRecording = () => {
    if (isRecording) stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordSeconds(0);
    setIsPlaying(false);
    setErrorMsg(null);
  };

  // Toggle Playback Audio
  const togglePlayAudio = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Kirim Audio ke Gemini 1.5 Flash API Route
  const handleAnalyzeAudio = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // 1. Konversi Blob ke Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          // Ambil bagian data base64 setelah koma
          const base64Data = res.split(',')[1] || res;
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      // 2. Kirim ke API Route /api/ai/intake-audio
      const response = await fetch('/api/ai/intake-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob.type || 'audio/webm',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429 || errorData.code === 'RATE_LIMIT_EXCEEDED') {
          setErrorMsg(errorData.friendly_notice || errorData.error || 'Analisis sedang dalam antrean singkat, data Anda aman...');
          return;
        }
        throw new Error(errorData.error || `Analisis audio gagal (${response.status})`);
      }

      const result: IntakeAudioResponse = await response.json();

      // Sanitasi PII pada ringkasan jika mengandung nama pasien
      if (patientName && result.summary) {
        result.summary = deidentifyText(result.summary, { knownNames: [patientName] });
      }

      if (onExtractionComplete) {
        onExtractionComplete(result);
      }
    } catch (err: unknown) {
      console.error('Error menganalisis audio:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menganalisis audio dengan AI.';
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-emerald-800/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-5 sm:p-6 rounded-2xl relative overflow-hidden">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Mic className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Asupan Suara Mandiri (Zero-Typing)
            </h3>
            <p className="text-[11px] text-slate-400">
              Ceritakan keluhan Anda secara alami dalam bahasa sehari-hari
            </p>
          </div>
        </div>
        <Badge variant="success">Bebas Ketik</Badge>
      </div>

      {errorMsg && (
        <div
          className={`mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border text-xs ${
            errorMsg.includes('antrean') || errorMsg.includes('aman')
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
          }`}
        >
          {errorMsg.includes('antrean') || errorMsg.includes('aman') ? (
            <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-semibold block">
              {errorMsg.includes('antrean') || errorMsg.includes('aman') ? 'Status Antrean AI:' : 'Perhatian:'}
            </span>
            <p className="text-[11px] leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Interactive Mic Button & Waves */}
      <div className="py-6 flex flex-col items-center justify-center text-center">
        {/* Pulsing Concentric Rings */}
        <div className="relative flex items-center justify-center mb-4">
          {isRecording && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-emerald-400/25 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50 scale-105'
                : audioBlob
                ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
            }`}
            title={isRecording ? 'Klik untuk berhenti merekam' : 'Klik untuk mulai bicara'}
          >
            {isRecording ? (
              <>
                <Square className="w-7 h-7 fill-white" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Bicara</span>
              </>
            )}
          </button>
        </div>

        {/* Live Timer & Wave Visualizer */}
        {isRecording ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Merekam: {formatTime(recordSeconds)}</span>
            </div>

            {/* Audio Wave Bars */}
            <div className="flex items-center justify-center gap-1 h-8 pt-1">
              {visualizerLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                  style={{ height: `${lvl}%` }}
                />
              ))}
            </div>

            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Contoh: &quot;Dokter, lambung saya sering perih dan kembung sesudah makan siang, pundak juga tegang dan sulit tidur...&quot;
            </p>
          </div>
        ) : audioBlob ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800 text-teal-300 font-mono text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Rekaman Siap ({formatTime(recordSeconds || 45)})</span>
            </div>

            <p className="text-xs text-slate-300">
              Audio berhasil direkam. Putar ulang atau langsung kirim untuk diekstrak oleh AI.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={togglePlayAudio}
                className="text-xs gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Jeda Audio' : 'Dengarkan Rekaman'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetRecording}
                className="text-xs gap-1 text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rekam Ulang
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-200">
              Sentuh Tombol Mikrofon untuk Memulai
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Tidak perlu mengetik panjang. Cukup curhatkan apa yang dirasakan tubuh Anda selama 30–60 detik.
            </p>
          </div>
        )}
      </div>

      {/* Action Button: Analisis dengan AI Gemini */}
      {audioBlob && !isRecording && (
        <div className="pt-3 border-t border-slate-800/80 flex justify-end">
          <Button
            type="button"
            variant="emerald"
            size="md"
            disabled={isAnalyzing}
            onClick={handleAnalyzeAudio}
            className="w-full sm:w-auto text-xs font-bold gap-2 py-3 px-5 shadow-lg shadow-emerald-950/60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengekstrak 7 Node Fungsional...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                Ekstrak Keluhan dengan Gemini AI
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
