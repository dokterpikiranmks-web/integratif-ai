'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dna, Zap, RefreshCw, AlertCircle, ArrowDown } from 'lucide-react';

export interface AtmTimelineData {
  antecedents: string[];
  triggers: string[];
  mediators: string[];
}

interface AtmTimelineProps {
  data?: AtmTimelineData;
}

export function AtmTimeline({
  data = {
    antecedents: [
      'Riwayat keluarga hipertensi & sindrom metabolik (ayah)',
      'Penggunaan antibiotik spektrum luas berulang pada usia 30-an',
      'Pola makan tinggi karbohidrat olahan & rendah serat selama 10 tahun',
    ],
    triggers: [
      'Stres akut promosi jabatan & jam kerja lembur 3 bulan lalu',
      'Infeksi gastroenteritis ringan setelah konsumsi makanan luar',
      'Mulai konsumsi obat anti-hipertensi Amlodipine 5mg secara rutin',
    ],
    mediators: [
      'Disbiosis mikrobioma & permeabilitas dinding usus (leaky gut) persisten',
      'Deplesi koenzim Q10 & magnesium intraseluler akibat obat kimia',
      'Gangguan ritme sirkadian (tidur terfragmentasi & terbangun pukul 03.00)',
      'Ketegangan myofascial kronis pada segmen servikotorakal T1-T4',
    ],
  },
}: AtmTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          Garis Waktu ATM (Antecedents • Triggers • Mediators)
        </h4>
        <span className="text-[11px] text-slate-400">Model Matriks Fungsional IFM</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {/* 1. ANTECEDENTS (Faktor Bawaan / Predisposisi Masa Lalu) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 relative">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                <Dna className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Antecedents</span>
                <span className="text-[10px] text-slate-400">Predisposisi Masa Lalu</span>
              </div>
            </div>
            <Badge variant="default" className="text-[10px]">Genetik/Pola</Badge>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {data.antecedents.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. TRIGGERS (Pemicu Onset Keluhan Saat Ini) */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/50 space-y-2.5 relative">
          <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Triggers</span>
                <span className="text-[10px] text-amber-300">Pemicu Onset Akut</span>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px]">Titik Awal</Badge>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {data.triggers.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. MEDIATORS (Faktor yang Memperpanjang Sakit) */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-2.5 relative">
          <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Mediators</span>
                <span className="text-[10px] text-rose-300">Faktor Kronisitas</span>
              </div>
            </div>
            <Badge variant="danger" className="text-[10px]">Target Terapi</Badge>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {data.mediators.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
