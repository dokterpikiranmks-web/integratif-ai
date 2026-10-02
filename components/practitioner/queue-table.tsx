'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  User,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Mic,
  Pill,
} from 'lucide-react';

export interface DailyQueuePatient {
  id: string;
  slot_number: number;
  time: string;
  patient_name: string;
  age: number;
  complaint: string;
  // Status Kedatangan: Checked-in / Waiting (atau In-session)
  attendanceStatus: 'checked_in' | 'waiting' | 'in_session';
  // Status Data Intake: Ready / Pending
  intakeStatus: 'ready' | 'pending';
  has_lab: boolean;
  has_meds: boolean;
  has_audio: boolean;
}

interface QueueTableProps {
  date: string;
  appointments?: DailyQueuePatient[];
  onStartSession?: (appointmentId: string) => void;
  onView360?: (appointmentId: string) => void;
}

export const DEFAULT_5_PATIENTS: DailyQueuePatient[] = [
  {
    id: 'p-1',
    slot_number: 1,
    time: '08:30',
    patient_name: 'Bpk. Budi Santoso',
    age: 52,
    complaint: 'Kembung & begah kronis pasca makan, tengkuk kaku, insomnia, konsumsi Amlodipine 5mg',
    attendanceStatus: 'checked_in',
    intakeStatus: 'ready',
    has_lab: true,
    has_meds: true,
    has_audio: true,
  },
  {
    id: 'p-2',
    slot_number: 2,
    time: '10:00',
    patient_name: 'Ibu Ratna Dewi',
    age: 46,
    complaint: 'Nyeri sendi lutut, fatigue mitokondria pasca infeksi viral, riwayat dispepsia',
    attendanceStatus: 'checked_in',
    intakeStatus: 'ready',
    has_lab: true,
    has_meds: false,
    has_audio: true,
  },
  {
    id: 'p-3',
    slot_number: 3,
    time: '11:30',
    patient_name: 'Bpk. Ahmad Fauzi',
    age: 39,
    complaint: 'Migrain sebelah, dispepsia fungsional, stres kerja tinggi & ketegangan servikal',
    attendanceStatus: 'waiting',
    intakeStatus: 'ready',
    has_lab: false,
    has_meds: true,
    has_audio: true,
  },
  {
    id: 'p-4',
    slot_number: 4,
    time: '14:00',
    patient_name: 'Ibu Siti Aminah',
    age: 60,
    complaint: 'Neuropati diabetik rasa kebas telapak kaki, fluktuasi tekanan darah sore hari',
    attendanceStatus: 'waiting',
    intakeStatus: 'ready',
    has_lab: true,
    has_meds: true,
    has_audio: true,
  },
  {
    id: 'p-5',
    slot_number: 5,
    time: '15:30',
    patient_name: 'Bpk. Hendra Gunawan',
    age: 45,
    complaint: 'GERD berulang, spasme otot punggung bawah, riwayat dislipidemia',
    attendanceStatus: 'waiting',
    intakeStatus: 'pending',
    has_lab: false,
    has_meds: false,
    has_audio: false,
  },
];

export function QueueTable({
  date,
  appointments = DEFAULT_5_PATIENTS,
  onStartSession,
  onView360,
}: QueueTableProps) {
  const checkedInCount = appointments.filter(
    (a) => a.attendanceStatus === 'checked_in' || a.attendanceStatus === 'in_session'
  ).length;

  return (
    <Card className="border-slate-800 bg-slate-950/80">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
        <div>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-emerald-400" />
            Panel 5 Pasien Hari Ini ({date})
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Daftar antrean ringkas dengan status kehadiran dan kesiapan data asupan AI
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono font-medium">
            {checkedInCount} / 5 Pasien Telah Hadir
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointments.map((patient) => {
          const isCheckedIn = patient.attendanceStatus === 'checked_in';
          const isInSession = patient.attendanceStatus === 'in_session';
          const isWaiting = patient.attendanceStatus === 'waiting';
          const isIntakeReady = patient.intakeStatus === 'ready';

          return (
            <div
              key={patient.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                isInSession
                  ? 'bg-emerald-950/20 border-emerald-600/70 shadow-md ring-1 ring-emerald-500/20'
                  : isCheckedIn
                  ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Info Pasien & Waktu */}
              <div className="flex items-start gap-3.5">
                {/* Badge Nomor Slot */}
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-mono shrink-0 shadow-inner">
                  <span className="text-[9px] text-slate-400 uppercase">Slot</span>
                  <span className="text-sm font-black text-emerald-400">#{patient.slot_number}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {patient.patient_name} ({patient.age} thn)
                    </span>

                    {/* 1. BADGE STATUS KEDATANGAN: CHECKED-IN / WAITING */}
                    {isInSession ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700 shadow-sm animate-pulse">
                        <Activity className="w-3 h-3 text-teal-400" />
                        In-session (Sedang Berjalan)
                      </span>
                    ) : isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Checked-in (Hadir)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/70">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Waiting (Menunggu Kedatangan)
                      </span>
                    )}

                    {/* 2. BADGE STATUS DATA INTAKE: READY / PENDING */}
                    {isIntakeReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Intake: Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-900/60">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        Intake: Pending
                      </span>
                    )}
                  </div>

                  {/* Jam Kedatangan & Ringkasan Keluhan */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-emerald-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {patient.time} WIB
                    </span>
                    <span>•</span>
                    <span className="italic text-slate-300 line-clamp-1">
                      &quot;{patient.complaint}&quot;
                    </span>
                  </div>

                  {/* Tag Media Intake Terlampir */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {patient.has_audio && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <Mic className="w-2.5 h-2.5 text-emerald-400" /> Audio Pasien
                      </span>
                    )}
                    {patient.has_meds && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-900/50">
                        <Pill className="w-2.5 h-2.5 text-blue-400" /> Resep Obat
                      </span>
                    )}
                    {patient.has_lab && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-900/50">
                        <FileText className="w-2.5 h-2.5 text-amber-400" /> Lab Luar
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Praktisi: Review 360 & Mode Sesi Totok */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href={`/practitioner/patient/${patient.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:scale-105"
                  onClick={() => onView360?.(patient.id)}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Review 360° AI</span>
                </Link>

                <Link
                  href={`/practitioner/therapy-session/${patient.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-950/50 hover:scale-105"
                  onClick={() => onStartSession?.(patient.id)}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Mulai Sesi Totok</span>
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
