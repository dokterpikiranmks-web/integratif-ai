'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Activity, Check, ArrowRight, Sparkles } from 'lucide-react';

interface PulseHrvTrackerProps {
  onSave?: (data: { prePulse: number; postPulse: number; preHrv: number; postHrv: number }) => void;
}

export function PulseHrvTracker({ onSave }: PulseHrvTrackerProps) {
  const [prePulse, setPrePulse] = useState<number>(86);
  const [postPulse, setPostPulse] = useState<number>(72);
  const [preHrv, setPreHrv] = useState<number>(34); // ms (SDNN or rMSSD)
  const [postHrv, setPostHrv] = useState<number>(58); // ms (Parasympathetic activation)

  const pulseDelta = postPulse - prePulse;
  const hrvDelta = postHrv - preHrv;

  return (
    <Card className="border-emerald-800/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
              Monitoring Otonom: Denyut Nadi & HRV
            </CardTitle>
            <CardDescription>
              Pencatatan respons sistem saraf otonom (Parasimpis) Sebelum vs Sesudah Totok Saraf
            </CardDescription>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            Realtime Sesi Klinik
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pulse Rate Container */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Denyut Nadi (BPM)
            </span>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Pre-Terapi</label>
                <input
                  type="number"
                  value={prePulse}
                  onChange={(e) => setPrePulse(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Post-Terapi</label>
                <input
                  type="number"
                  value={postPulse}
                  onChange={(e) => setPostPulse(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="text-[11px] pt-1 text-slate-400">
              Perubahan: <span className={pulseDelta <= 0 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>{pulseDelta > 0 ? `+${pulseDelta}` : pulseDelta} BPM</span> (Relaksasi)
            </div>
          </div>

          {/* HRV Container */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Heart Rate Variability (rMSSD ms)
            </span>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Pre-Terapi</label>
                <input
                  type="number"
                  value={preHrv}
                  onChange={(e) => setPreHrv(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Post-Terapi</label>
                <input
                  type="number"
                  value={postHrv}
                  onChange={(e) => setPostHrv(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="text-[11px] pt-1 text-slate-400">
              Perubahan: <span className={hrvDelta >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>+{hrvDelta} ms</span> (Aktivasi Parasimpatis)
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="emerald"
            onClick={() => onSave?.({ prePulse, postPulse, preHrv, postHrv })}
            className="text-xs"
          >
            <Check className="w-3.5 h-3.5" /> Simpan Hasil Evaluasi Nadi/HRV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
