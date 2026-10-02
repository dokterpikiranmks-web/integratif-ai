'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IntakeAudioResponse } from '@/types/ai';
import { CheckCircle2, HeartPulse, Flame, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface IntakeSummaryCardProps {
  data: IntakeAudioResponse;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function IntakeSummaryCard({ data, onConfirm, isLoading = false }: IntakeSummaryCardProps) {
  // Ambil 2-3 node dengan skor tertinggi sebagai area fokus
  const topNodes = Object.entries(data.functional_nodes || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([key, score]) => {
      const labels: Record<string, string> = {
        assimilation: 'Pencernaan & Lambung (Asimilasi)',
        defense_repair: 'Imunitas & Inflamasi',
        bioenergetics: 'Energi Mitokondria & Vitalitas',
        biotransformation: 'Detoksifikasi Hati & Ginjal',
        communication: 'Hormon, Saraf & Kualitas Tidur',
        transport_structural: 'Sirkulasi & Otot Leher/Punggung',
        mental_emotional: 'Ketenangan Pikiran & Relaksasi',
      };
      return {
        key,
        label: labels[key] || key,
        score: score as number,
      };
    });

  return (
    <Card className="border-emerald-600/40 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Rangkuman Pemahaman Suara AI
            </h3>
            <p className="text-xs text-slate-400">
              Berikut 3 intisari keluhan Anda yang telah dipetakan oleh sistem:
            </p>
          </div>
        </div>
        <Badge variant="success">Terkonfirmasi</Badge>
      </div>

      {/* 3 POIN UTAMA (Anti-Clutter, One Screen One Action, Sangat mudah dibaca) */}
      <div className="space-y-3">
        {/* Poin 1: Keluhan Utama */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-emerald-300">
            1
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Keluhan Utama Tubuh Anda
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {data.chief_complaints && data.chief_complaints.length > 0 ? (
                data.chief_complaints.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Keluhan terdistribusi seimbang</span>
              )}
            </div>
          </div>
        </div>

        {/* Poin 2: Organ & Sistem Fungsional yang Menjadi Fokus */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-amber-900/60 border border-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-amber-300">
            2
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Fokus Akar Masalah (Root-Cause Nodes)
            </h4>
            <div className="space-y-1">
              {topNodes.map((n) => (
                <div key={n.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{n.label}</span>
                  <span className="font-mono font-bold text-amber-400">{n.score}% Beban</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Poin 3: Pola Pemicu & Perjalanan Penyakit */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-teal-900/60 border border-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-teal-300">
            3
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Pemicu & Mediator Onset Gejala
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {data.timeline_triggers && data.timeline_triggers.length > 0
                ? data.timeline_triggers.join(' • ')
                : 'Pola keluhan dipicu oleh kelelahan dan ketidakteraturan ritme harian.'}
            </p>
          </div>
        </div>
      </div>

      {/* Narasi Ringkas */}
      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-xs text-slate-300 leading-relaxed">
        <strong>Ringkasan Medis:</strong> {data.summary}
      </div>

      {/* Konfirmasi Aksi */}
      <div className="pt-2 flex justify-end">
        <Button
          type="button"
          variant="emerald"
          size="md"
          disabled={isLoading}
          onClick={onConfirm}
          className="w-full sm:w-auto text-xs font-bold gap-2 py-3 px-6 shadow-lg shadow-emerald-950/50"
        >
          <span>Konfirmasi & Lanjut ke Dasbor Pemulihan</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
