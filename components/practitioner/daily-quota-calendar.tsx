'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface DailyQuotaCalendarProps {
  currentDate?: string;
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export function DailyQuotaCalendar({
  currentDate = 'Kamis, 1 Oktober 2026',
  selectedDate,
  onSelectDate,
}: DailyQuotaCalendarProps) {
  // 5 Slot Waktu Resmi Klinik Integratif Mandiri
  const standardSlots = [
    { slotNumber: 1, time: '08:30', patient: 'Bpk. Budi Santoso', status: 'checked_in', intakeStatus: 'ready' },
    { slotNumber: 2, time: '10:00', patient: 'Ibu Ratna Dewi', status: 'checked_in', intakeStatus: 'ready' },
    { slotNumber: 3, time: '11:30', patient: 'Bpk. Ahmad Fauzi', status: 'waiting', intakeStatus: 'ready' },
    { slotNumber: 4, time: '14:00', patient: 'Ibu Siti Aminah', status: 'waiting', intakeStatus: 'ready' },
    { slotNumber: 5, time: '15:30', patient: 'Bpk. Hendra Gunawan', status: 'waiting', intakeStatus: 'pending' },
  ];

  // Mock Kalender Mingguan (Senin - Jumat)
  const weekDays = [
    { day: 'Sen', date: '28 Sep', filled: 5, total: 5, isPast: true },
    { day: 'Sel', date: '29 Sep', filled: 5, total: 5, isPast: true },
    { day: 'Rab', date: '30 Sep', filled: 5, total: 5, isPast: true },
    { day: 'Kam', date: '1 Okt', filled: 5, total: 5, isToday: true },
    { day: 'Jum', date: '2 Okt', filled: 4, total: 5, isFuture: true },
    { day: 'Sab', date: '3 Okt', filled: 5, total: 5, isFuture: true },
  ];

  const totalFilledToday = standardSlots.length;
  const maxQuota = 5;

  return (
    <Card className="border-slate-800 bg-slate-950/80">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              Kalender Kuota & Manajemen Slot Harian
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Kapasitas ketat 5 sesi intensif per hari untuk menjaga kualitas atensi solo-praktisi
            </CardDescription>
          </div>

          {/* Indikator Visual 5/5 Slot Terisi */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {totalFilledToday}/{maxQuota} Slot
              </span>
              <Badge variant="success" className="text-[10px] ml-1">
                Kapasitas Penuh (100%)
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1. Baris Indikator Visual 5 Slot Hari Ini (Bulatan 5/5) */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Status 5 Slot Operasional Hari Ini:
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">
              {standardSlots.filter((s) => s.status === 'checked_in').length} Checked-in • {standardSlots.filter((s) => s.status === 'waiting').length} Waiting
            </span>
          </div>

          {/* 5 Nodes Indicator Bar */}
          <div className="grid grid-cols-5 gap-2">
            {standardSlots.map((slot) => {
              const isCheckedIn = slot.status === 'checked_in';
              return (
                <div
                  key={slot.slotNumber}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isCheckedIn
                      ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-mono font-bold text-[11px]">#{slot.slotNumber}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">{slot.time}</span>
                  <span className={`text-[9px] font-semibold uppercase mt-0.5 block truncate ${
                    isCheckedIn ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {isCheckedIn ? 'Hadir' : 'Menunggu'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Visual Mini-Calendar Grid Mingguan dengan Indikator Kuota 5/5 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Keterisian Kuota Minggu Ini:</span>
            <span className="text-[11px]">Batas Max: 5 Pasien / Hari</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {weekDays.map((item, idx) => {
              const isFull = item.filled >= item.total;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    item.isToday
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{item.day}</span>
                    {item.isToday && (
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">Hari Ini</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white mb-1.5">{item.date}</div>

                  {/* Visual 5 Dots Kuota */}
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dotIdx < item.filled
                            ? isFull
                              ? 'bg-emerald-400'
                              : 'bg-teal-400'
                            : 'bg-slate-700'
                        }`}
                        title={`Slot #${dotIdx + 1}: ${dotIdx < item.filled ? 'Terisi' : 'Tersedia'}`}
                      />
                    ))}
                  </div>

                  <span className={`text-[10px] font-mono font-bold mt-1.5 block ${
                    isFull ? 'text-emerald-400' : 'text-teal-400'
                  }`}>
                    {item.filled}/{item.total} {isFull ? 'Penuh' : 'Tersedia'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
