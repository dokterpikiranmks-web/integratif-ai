'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, CheckCircle2, Flame, HeartPulse, Coffee, Sparkles } from 'lucide-react';

export function NowCard() {
  // Timer state jeda obat dokter vs herbal (contoh: 120 menit)
  const [secondsLeft, setSecondsLeft] = useState(4820); // ~1 jam 20 menit tersisa
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Minum Amlodipine 5mg (Obat Dokter)',
      time: '07:00 WIB',
      type: 'medication',
      done: true,
    },
    {
      id: 'task-2',
      title: 'Jeda Pembersih Reseptor (Jeda 120 Menit)',
      time: '07:00 - 09:00 WIB',
      type: 'buffer',
      done: false,
    },
    {
      id: 'task-3',
      title: 'Dapur Terapeutik: Rebusan Temulawak + Kunyit + Daun Salam',
      time: '09:00 WIB',
      type: 'herbal',
      done: false,
    },
    {
      id: 'task-4',
      title: 'Mandiri Totok Saraf: Titik ST36 (Zusanli) 3 Menit',
      time: '19:30 WIB',
      type: 'acupressure',
      done: false,
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHoursMinutes = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <Card className="border-emerald-800/50 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Kartu Pendamping Hari Ini (Now Card)
            </span>
          </div>
          <CardTitle className="text-xl mt-1 text-white">Protokol Pemulihan Aktif</CardTitle>
          <CardDescription>
            Jadwal sinkronisasi obat dokter & herbal Nusantara untuk perlindungan organ
          </CardDescription>
        </div>
        <Badge variant="success">Fase 1: Asimilasi</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Safe-Distance Timer Card */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/60 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-medium text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Zona Jeda Keamanan (Safety Buffer Timer)</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-800/80">
              120 Menit Jeda
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2">
            Pemisahan konsumsi obat dokter dan ramuan herbal untuk mencegah interaksi sitokrom P450 hati.
          </p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-900/40">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300">Sisa Jeda Aman:</span>
            </div>
            <div className="font-mono text-lg font-bold text-amber-300 tracking-wider">
              {formatHoursMinutes(secondsLeft)}
            </div>
          </div>
        </div>

        {/* Task Checklist */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daftar Aksi Terapeutik Harian:
          </h4>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  task.done
                    ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 line-through'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    task.done ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-500'
                  }`}>
                    {task.done && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <span className="font-medium text-slate-100">{task.title}</span>
                    <span className="block text-[10px] text-slate-400">{task.time}</span>
                  </div>
                </div>

                <Badge variant={task.type === 'herbal' ? 'success' : task.type === 'acupressure' ? 'info' : 'default'}>
                  {task.type === 'herbal' ? 'Herbal' : task.type === 'acupressure' ? 'Totok' : 'Resep'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
