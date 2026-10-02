'use client';

import React, { useState } from 'react';
import { CLINIC_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Lock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SlotStatus {
  time: string;
  isBooked: boolean;
  bookedByCurrentPatient?: boolean;
}

interface SlotPickerProps {
  selectedDate: string;
  selectedSlot: string | null;
  onSelectSlot: (slotTime: string) => void;
  // Contoh status slot untuk tanggal terpilih
  slotsStatus?: SlotStatus[];
}

export function SlotPicker({
  selectedDate,
  selectedSlot,
  onSelectSlot,
  slotsStatus = [
    { time: '09:00', isBooked: true },
    { time: '10:30', isBooked: false },
    { time: '13:00', isBooked: true },
    { time: '14:30', isBooked: false },
    { time: '16:00', isBooked: false },
  ],
}: SlotPickerProps) {
  const bookedCount = slotsStatus.filter((s) => s.isBooked).length;
  const isFull = bookedCount >= CLINIC_CONFIG.maxDailyCapacity;
  const remainingSlots = Math.max(0, CLINIC_CONFIG.maxDailyCapacity - bookedCount);

  return (
    <div className="space-y-4">
      {/* Quota Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">Kuota Harian Praktek</h4>
            {isFull ? (
              <Badge variant="danger">Slot Penuh (Terkunci)</Badge>
            ) : (
              <Badge variant="success">Tersedia {remainingSlots} dari {CLINIC_CONFIG.maxDailyCapacity} Pasien</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Solo-praktisi fokus mendalam: Maksimum 5 konsultasi & totok saraf per hari.
          </p>
        </div>

        {/* Visual Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: CLINIC_CONFIG.maxDailyCapacity }).map((_, index) => {
            const isSlotTaken = index < bookedCount;
            return (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  isSlotTaken ? "bg-rose-500 shadow-sm shadow-rose-900/50" : "bg-emerald-500 ring-2 ring-emerald-500/20"
                )}
                title={isSlotTaken ? `Slot ${index + 1} Terisi` : `Slot ${index + 1} Kosong`}
              />
            );
          })}
        </div>
      </div>

      {isFull && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Kuota tanggal ini sudah mencapai batas 5 pasien. Silakan pilih tanggal operasional berikutnya.</span>
        </div>
      )}

      {/* 5 Time Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CLINIC_CONFIG.dailySlots.map((slot, index) => {
          const status = slotsStatus.find((s) => s.time === slot.time);
          const isBooked = isFull || (status ? status.isBooked : false);
          const isSelected = selectedSlot === slot.time;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSlot(slot.time)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200",
                isSelected
                  ? "bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500"
                  : isBooked
                  ? "bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold",
                    isSelected
                      ? "bg-emerald-500 text-emerald-950"
                      : isBooked
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-800 text-emerald-400"
                  )}
                >
                  #{index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.time} WIB</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{slot.label.split('(')[1]?.replace(')', '') || '75 Menit'}</span>
                </div>
              </div>

              <div>
                {isBooked ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                    <Lock className="w-3 h-3" /> Terkunci
                  </span>
                ) : isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50">
                    Tersedia
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
