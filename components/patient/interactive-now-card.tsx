'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, CheckCircle2, Coffee, Activity, Pill, Sparkles, Bell } from 'lucide-react';

interface NowCardProps {
  lastMedicationTime?: string; // Format "HH:mm", default "12:00"
  prescribedDrugName?: string;  // Default "Amlodipine 5mg"
  targetHerbalName?: string;    // Default "Seduhan Temulawak & Daun Salam"
  targetAcupoint?: string;      // Default "Titik ST36 (Zusanli)"
}

export function InteractiveNowCard({
  lastMedicationTime = '12:00',
  prescribedDrugName = 'Amlodipine 5mg (Obat Dokter)',
  targetHerbalName = 'Rebusan Temulawak + Kunyit + Daun Salam',
  targetAcupoint = 'Titik ST36 (Zusanli) - 90 Detik',
}: NowCardProps) {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800); // 30 menit (1800 detik)
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentHour, setCurrentHour] = useState<number>(12);

  // Hitung jam lokal realtime
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer jeda herbal
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHoursMinutes = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Logika 1 Aksi Terpenting Berdasarkan Waktu Lokal
  // Jam 06:00 - 08:30 -> Minum Obat Dokter
  // Jam 08:30 - 11:30 -> Jeda Perlindungan Enzim Hati
  // Jam 11:30 - 14:00 -> Minum Dapur Herbal Temulawak
  // Jam 14:00 - 18:30 -> Asimilasi Nutrisi Siang
  // Jam 18:30 - 21:00 -> Totok Saraf Mandiri
  // Jam 21:00+ -> Relaksasi Tidur
  const getActionContext = () => {
    if (secondsRemaining > 0 && !isCompleted) {
      return {
        badge: 'Jeda Keamanan Aktif',
        badgeVariant: 'warning' as const,
        title: 'Jeda Perlindungan Enzim Hati (Safety Distance Timer)',
        subtitle: `Tersisa ${Math.ceil(secondsRemaining / 60)} menit lagi sebelum aman minum ${targetHerbalName}`,
        description: `Pemisahan waktu 120 menit setelah minum ${prescribedDrugName} wajib dijaga agar enzim Sitokrom P450 hati tidak over-metabolisme.`,
        actionType: 'buffer',
        icon: ShieldAlert,
        buttonText: 'Tandai Jeda Terpenuhi',
      };
    }

    if (currentHour >= 18 && currentHour <= 21) {
      return {
        badge: 'Waktu Malam: Totok Saraf',
        badgeVariant: 'info' as const,
        title: 'Aksi Saat Ini: Totok Saraf Mandiri Malam',
        subtitle: `Lakukan stimulasi pada ${targetAcupoint} selama 90 detik`,
        description: 'Meredakan ketegangan nervus vagus, merilekskan otot leher servikal dan menyiapkan tubuh untuk tidur nyenyak.',
        actionType: 'acupressure',
        icon: Activity,
        buttonText: 'Mulai Pijat 90 Detik',
      };
    }

    return {
      badge: 'Waktu Minum Herbal',
      badgeVariant: 'success' as const,
      title: 'Aksi Saat Ini: Dapur Terapeutik Nusantara',
      subtitle: `Waktunya meminum: ${targetHerbalName}`,
      description: 'Jeda 120 menit dari obat kimia telah selesai. Tubuh siap menyerap kurkuminoid dan antioksidan ramuan.',
      actionType: 'herbal',
      icon: Coffee,
      buttonText: 'Tandai Sudah Diminum',
    };
  };

  const action = getActionContext();
  const IconComponent = action.icon;

  return (
    <Card className="border-emerald-600/50 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 rounded-2xl shadow-xl relative overflow-hidden">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Now Card • 1 Aksi Prioritas Anda
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {currentTimeStr || '12:30 WIB'}
          </span>
          <Badge variant={action.badgeVariant}>{action.badge}</Badge>
        </div>
      </div>

      <CardContent className="p-0 pt-4 space-y-4">
        {/* Main Priority Block */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-900/40 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <IconComponent className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {action.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                {action.subtitle}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {action.description}
              </p>
            </div>
          </div>

          {/* Sisa Timer Countdown (Hanya ditampilkan jika dalam status buffer) */}
          {action.actionType === 'buffer' && secondsRemaining > 0 && !isCompleted && (
            <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Hitung Mundur Jeda Aman:</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-300 tracking-wider">
                {formatHoursMinutes(secondsRemaining)}
              </div>
            </div>
          )}
        </div>

        {/* Action Button: One Screen One Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-400">
            {isCompleted ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Aksi ini telah selesai dicatat
              </span>
            ) : (
              <span>Fokus pada 1 instruksi ini sebelum aksi berikutnya muncul</span>
            )}
          </div>

          <Button
            type="button"
            variant={isCompleted ? 'outline' : 'emerald'}
            size="md"
            onClick={() => setIsCompleted(!isCompleted)}
            className="text-xs font-bold gap-2 py-2.5 px-4 shadow-md"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selesai
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> {action.buttonText}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
