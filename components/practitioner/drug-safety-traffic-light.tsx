'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Pill,
  Coffee,
  Info,
} from 'lucide-react';

export interface TrafficLightDrugItem {
  drugName: string;
  dosage: string;
  frequency: string;
  indication: string;
  // Merah: Interaksi berbahaya & deplesi nutrisi
  redFindings: Array<{
    title: string;
    description: string;
    clinicalMechanism: string;
  }>;
  // Kuning: Aturan Jeda Jam (120 Menit)
  yellowRules: Array<{
    title: string;
    bufferMinutes: number;
    substancesToAvoid: string[];
    explanation: string;
  }>;
  // Hijau: Sinergis & Terapi Pendukung Aman
  greenSynergies: Array<{
    title: string;
    remedy: string;
    benefit: string;
  }>;
}

interface DrugSafetyTrafficLightProps {
  drugs?: TrafficLightDrugItem[];
}

export function DrugSafetyTrafficLight({
  drugs = [
    {
      drugName: 'Amlodipine Besylate',
      dosage: '5 mg',
      frequency: '1x sehari pagi (07:00 WIB)',
      indication: 'Anti-Hipertensi (Calcium Channel Blocker - CCB)',
      redFindings: [
        {
          title: 'Deplesi Koenzim Q10 (CoQ10) & Kalium Intraseluler',
          description: 'Obat golongan CCB secara kronis menurunkan kadar CoQ10 dalam mitokondria jantung dan memicu defisiensi mikronutrien pembuluh darah.',
          clinicalMechanism: 'Inhibisi influks ion kalsium memengaruhi fosforilasi oksidatif ATP di sarkomer miokardium.',
        },
        {
          title: 'Kontraindikasi Herbal Vasodilatator Dosis Tinggi',
          description: 'Hindari konsumsi bersamaan dengan ekstrak bawang putih dosis tinggi atau ginkgo biloba pekat karena risiko hipotensi ortostatik mendadak.',
          clinicalMechanism: 'Efek sinergis relaksasi otot polos vaskular yang berlebihan.',
        },
      ],
      yellowRules: [
        {
          title: 'Zona Jeda Keamanan (Wajib 120 Menit Jeda)',
          bufferMinutes: 120,
          substancesToAvoid: ['Rebusan Temulawak', 'Kunyit Asam', 'Brotowali', 'Daun Salam'],
          explanation: 'Wajib jeda minimal 2 jam setelah minum Amlodipine sebelum meminum jamu/rebusan herbal untuk mencegah kompetisi isoenzim Sitokrom P450 CYP3A4 di hepatosit hati.',
        },
      ],
      greenSynergies: [
        {
          title: 'Perlindungan Lambung Alami (Gastroprotektif)',
          remedy: 'Bubur Pati Garut (Maranta arundinacea)',
          benefit: 'Melapisi mukosa lambung tanpa mengganggu penyerapan obat anti-hipertensi di usus halus.',
        },
        {
          title: 'Pengganti Kalium Alami Organik',
          remedy: 'Air Kelapa Muda Hijau + Pisang Ambon',
          benefit: 'Menyediakan elektrolit kalium intraseluler organik guna mengimbangi deplesi tanpa membebani filtrasi glomerulus ginjal.',
        },
      ],
    },
  ],
}: DrugSafetyTrafficLightProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-amber-400" />
            Sistem Lampu Lalu Lintas Keamanan Obat vs Herbal (Traffic Light)
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Panduan klinis farmakologi integratif untuk memisahkan bahaya, jeda jam, dan sinergi
          </p>
        </div>
        <Badge variant="warning">Protokol CYP450</Badge>
      </div>

      {drugs.map((drug, index) => (
        <div key={index} className="space-y-3">
          {/* Drug Header Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400">
                💊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{drug.drugName} {drug.dosage}</h3>
                  <Badge variant="default" className="text-[10px]">{drug.frequency}</Badge>
                </div>
                <span className="text-[11px] text-slate-400">{drug.indication}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-900/50" title="Bahaya/Deplesi" />
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-900/50" title="Beri Jeda Jam" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-900/50" title="Sinergis/Aman" />
            </div>
          </div>

          {/* 3 TIER TRAFFIC LIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 🔴 TIER MERAH: INTERAKSI BERBAHAYA & DEPLESI NUTRISI */}
            <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 animate-pulse" />
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                    Merah: Bahaya / Deplesi
                  </span>
                </div>
                <Badge variant="danger" className="text-[10px]">Intervensi Kritis</Badge>
              </div>

              <div className="space-y-2.5">
                {drug.redFindings.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/40 space-y-1 text-xs">
                    <span className="font-bold text-white block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {item.title}
                    </span>
                    <p className="text-rose-200/90 text-[11px] leading-relaxed">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-rose-400/80 block pt-1 italic">
                      Mekanisme: {item.clinicalMechanism}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 🟡 TIER KUNING: BERI JEDA JAM (SAFETY BUFFER) */}
            <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Kuning: Beri Jeda Jam
                  </span>
                </div>
                <Badge variant="warning" className="text-[10px]">Jeda 120 Menit</Badge>
              </div>

              <div className="space-y-2.5">
                {drug.yellowRules.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {rule.title}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                        {rule.bufferMinutes} Menit Jeda
                      </span>
                    </div>

                    <p className="text-amber-200/90 text-[11px] leading-relaxed">
                      {rule.explanation}
                    </p>

                    <div className="pt-1 border-t border-amber-900/40">
                      <span className="text-[10px] font-semibold text-slate-300 block mb-1">
                        Zat yang Wajib Diberi Jeda:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rule.substancesToAvoid.map((sub, sIdx) => (
                          <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🟢 TIER HIJAU: SINERGIS & TERAPI PENDUKUNG AMAN */}
            <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Hijau: Sinergis & Aman
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">Restorasi Alami</Badge>
              </div>

              <div className="space-y-2.5">
                {drug.greenSynergies.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/40 space-y-1 text-xs">
                    <span className="font-bold text-white block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {item.title}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-300 block">
                      🌱 {item.remedy}
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {item.benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
