'use client';

import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface FunctionalNodeScoreData {
  assimilation: number;
  defense_repair: number;
  energy: number;
  biotransformation: number;
  communication: number;
  transport_structural: number;
  mental_emotional: number;
}

interface RadarChart7NodesProps {
  scores?: FunctionalNodeScoreData;
  patientName?: string;
}

export function RadarChart7Nodes({
  scores = {
    assimilation: 78,
    defense_repair: 45,
    energy: 65,
    biotransformation: 58,
    communication: 62,
    transport_structural: 80,
    mental_emotional: 50,
  },
  patientName = 'Bpk. Budi Santoso',
}: RadarChart7NodesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = [
    {
      subject: 'Asimilasi & Cerna',
      fullKey: 'assimilation',
      score: scores.assimilation,
      fullMark: 100,
      description: 'Saluran cerna, mikrobioma & leaky gut',
    },
    {
      subject: 'Imun & Inflamasi',
      fullKey: 'defense_repair',
      score: scores.defense_repair,
      fullMark: 100,
      description: 'Peradangan sistemik & alergi',
    },
    {
      subject: 'Mitokondria / Energi',
      fullKey: 'energy',
      score: scores.energy,
      fullMark: 100,
      description: 'Produksi ATP & kelelahan seluler',
    },
    {
      subject: 'Detoksifikasi Hati',
      fullKey: 'biotransformation',
      score: scores.biotransformation,
      fullMark: 100,
      description: 'Metabolisme fase I/II & eliminasi obat',
    },
    {
      subject: 'Hormon & Neuro',
      fullKey: 'communication',
      score: scores.communication,
      fullMark: 100,
      description: 'Aksis HPA, kortisol & tidur',
    },
    {
      subject: 'Sirkulasi & Struktur',
      fullKey: 'transport_structural',
      score: scores.transport_structural,
      fullMark: 100,
      description: 'Mikrovaskular & tegangan fascia otot',
    },
    {
      subject: 'Psiko-Emosional',
      fullKey: 'mental_emotional',
      score: scores.mental_emotional,
      fullMark: 100,
      description: 'Koneksi pikiran-tubuh & stres',
    },
  ];

  // Tooltip Kustom Medis
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHigh = data.score >= 70;
      return (
        <div className="p-3 bg-slate-950/95 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1 z-50">
          <span className="font-bold text-white block">{data.subject}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Beban Disfungsi:</span>
            <span className={`font-mono font-bold ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
              {data.score}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block max-w-[180px]">
            {data.description}
          </span>
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-950 flex items-center justify-center text-xs text-slate-500">
        Memuat Radar 7 Node...
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-white block">Visualisasi Radar 7 Node Fungsional</span>
          <span className="text-slate-400 text-[11px]">{patientName} • Model Heptagon Fungsional</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;50% Seimbang
          </span>
          <span className="flex items-center gap-1 text-[10px] text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;70% Disfungsi
          </span>
        </div>
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Beban Disfungsi"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={2}
              fill="#059669"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
