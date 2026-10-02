'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CLINIC_CONFIG } from '@/lib/constants';
import { formatRupiah } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';

// 5 Slot Waktu Resmi Per Hari Sesuai Spesifikasi (08:30, 10:00, 11:30, 14:00, 15:30)
const DAILY_5_SLOTS = [
  { id: 's1', time: '08:30', label: 'Slot 1 (08:30 - 09:45 WIB)', isBooked: true },
  { id: 's2', time: '10:00', label: 'Slot 2 (10:00 - 11:15 WIB)', isBooked: false },
  { id: 's3', time: '11:30', label: 'Slot 3 (11:30 - 12:45 WIB)', isBooked: false },
  { id: 's4', time: '14:00', label: 'Slot 4 (14:00 - 15:15 WIB)', isBooked: true },
  { id: 's5', time: '15:30', label: 'Slot 5 (15:30 - 16:45 WIB)', isBooked: false },
];

export default function PatientBookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>('10:00');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [step, setStep] = useState<number>(1); // 1: Pilih Slot, 2: Identitas, 3: Pembayaran & 10-Min Timer
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'manual'>('qris');
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // 10-Minute Hold Timer (600 detik) untuk mengunci slot secara eksklusif
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number>(600);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 3 && isTimerActive && holdSecondsLeft > 0) {
      interval = setInterval(() => {
        setHoldSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, isTimerActive, holdSecondsLeft]);

  const startHoldTimer = () => {
    setHoldSecondsLeft(600); // 10 menit
    setIsTimerActive(true);
    setStep(3);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const bookedCount = DAILY_5_SLOTS.filter((s) => s.isBooked).length;
  const remainingCount = 5 - bookedCount;

  return (
    <div className="container mx-auto max-w-xl px-4 py-6 space-y-6">
      {/* Header Halaman (Anti-Clutter, Ramah Mata Lelah/Lansia) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Reservasi Mandiri Pasien
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pilih Jadwal Konsultasi & Totok Saraf
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Maksimal 5 pasien per hari untuk fokus terapi yang mendalam
          </p>
        </div>
        <Badge variant="success">Langkah {step} dari 3</Badge>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
        <div
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-semibold ${
            step === 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'
          }`}
        >
          1. Pilih Slot
        </div>
        <div
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-semibold ${
            step === 2 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'
          }`}
        >
          2. Data Pasien
        </div>
        <div
          className={`py-1.5 px-2 rounded-lg text-center text-xs font-semibold ${
            step === 3 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'
          }`}
        >
          3. Kunci & Bayar
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCREEN 1: PEMILIHAN TANGGAL & 5 SLOT WAKTU KETAT */}
      {/* ============================================================ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Pilih Tanggal */}
          <Card className="border-slate-800 bg-slate-900/90 p-4 rounded-2xl space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Pilih Tanggal Sesi Terapi:
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </Card>

          {/* Banner Kuota 5 Slot */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white">Status Kuota Tanggal Ini:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Tersedia <strong>{remainingCount}</strong> dari <strong>5</strong> slot eksklusif
              </p>
            </div>
            {/* Visual Dots */}
            <div className="flex gap-1.5">
              {DAILY_5_SLOTS.map((s, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    s.isBooked ? 'bg-rose-500' : 'bg-emerald-400 ring-2 ring-emerald-500/20'
                  }`}
                  title={s.isBooked ? `Slot ${s.time} Terisi` : `Slot ${s.time} Tersedia`}
                />
              ))}
            </div>
          </div>

          {/* 5 Slot Waktu (Slot yang sudah terisi otomatis disabled) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih 1 dari 5 Slot Waktu (75 Menit per Sesi):
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {DAILY_5_SLOTS.map((slot, index) => {
                const isSelected = selectedSlot === slot.time;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.isBooked}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-lg'
                        : slot.isBooked
                        ? 'bg-slate-900/30 border-slate-800/40 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : slot.isBooked
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-slate-800 text-emerald-400'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{slot.time} WIB</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{slot.label}</span>
                      </div>
                    </div>

                    <div>
                      {slot.isBooked ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-900/40">
                          <Lock className="w-3.5 h-3.5" /> Terisi
                        </span>
                      ) : isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/40">
                          Tersedia
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="emerald"
              size="md"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              className="w-full sm:w-auto text-xs font-bold gap-2 py-3 px-6 shadow-md"
            >
              <span>Lanjut: Data Pasien</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 2: IDENTITAS RINGKAS PASIEN (ZERO FRICTION) */}
      {/* ============================================================ */}
      {step === 2 && (
        <Card className="border-slate-800 bg-slate-900/90 p-5 rounded-2xl space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-slate-800">
            <CardTitle className="text-base">Informasi Singkat Pasien</CardTitle>
            <CardDescription>
              Cukup isi nama dan nomor WhatsApp untuk pengiriman tautan asupan suara & konfirmasi slot
            </CardDescription>
          </CardHeader>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nama Lengkap Anda
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nomor WhatsApp Aktif
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Rangkuman Pilihan */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 mt-3">
              <div className="flex justify-between text-slate-300">
                <span>Tanggal Sesi:</span>
                <span className="font-bold text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Jam Terpilih:</span>
                <span className="font-bold text-emerald-400">{selectedSlot} WIB (75 Mnt)</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span className="font-semibold text-emerald-300">Total Biaya:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatRupiah(CLINIC_CONFIG.defaultServiceFee)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Ubah Slot
            </Button>
            <Button
              type="button"
              variant="emerald"
              size="md"
              disabled={!fullName.trim() || !phoneNumber.trim()}
              onClick={startHoldTimer}
              className="text-xs font-bold gap-2 py-3 px-5"
            >
              <span>Kunci Slot & Lanjut Bayar</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* SCREEN 3: PEMBAYARAN + COUNTDOWN TIMER 10 MENIT TAHAN SLOT */}
      {/* ============================================================ */}
      {step === 3 && !isSuccess && (
        <div className="space-y-4">
          {/* COUNTDOWN TIMER 10 MENIT PENAHAN SLOT */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Timer className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Slot Ditahan Eksklusif Untuk Anda</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-800">
                Batas Waktu: 10 Menit
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-300 max-w-xs">
                Selesaikan pembayaran sebelum timer habis agar slot <strong>{selectedSlot} WIB</strong> tidak dialihkan ke pasien lain.
              </p>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 tracking-wider">
                {formatTimer(holdSecondsLeft)}
              </div>
            </div>

            {holdSecondsLeft === 0 && (
              <div className="p-2.5 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Waktu 10 menit telah habis. Slot telah dilepaskan kembali ke antrean publik.</span>
              </div>
            )}
          </div>

          {/* OPSI PEMBAYARAN: QRIS DINAMIS / TRANSFER BANK */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 rounded-2xl space-y-4">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'qris'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4" /> QRIS Instan
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('manual')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'manual'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Transfer Bank & Bukti
              </button>
            </div>

            {paymentMethod === 'qris' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="w-44 h-44 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-inner">
                  <QrCode className="w-40 h-40 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">
                    NMID: ID1020268892341
                  </span>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Scan via BCA Mobile, Livin, GoPay, OVO, ShopeePay, atau m-Banking apa saja.
                  </p>
                  <span className="font-mono text-base font-bold text-emerald-400 block pt-1">
                    {formatRupiah(CLINIC_CONFIG.defaultServiceFee)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank Tujuan:</span>
                    <span className="font-semibold text-white">BCA (Bank Central Asia)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nomor Rekening:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">827-091-2341</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Atas Nama:</span>
                    <span className="text-white">Klinik Integratif Mandiri</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Nominal Transfer:</span>
                    <span className="font-mono font-bold text-white">
                      {formatRupiah(CLINIC_CONFIG.defaultServiceFee)}
                    </span>
                  </div>
                </div>

                {/* Tombol Unggah Bukti Transfer */}
                <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer hover:border-emerald-500 transition-all">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <label htmlFor="transfer-proof" className="text-xs font-bold text-emerald-400 cursor-pointer">
                    {transferProofFile ? `Bukti: ${transferProofFile.name}` : 'Klik untuk Unggah Struk / Bukti Transfer'}
                  </label>
                  <input
                    id="transfer-proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTransferProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-[10px] text-slate-500">Mendukung format JPG, PNG, atau screenshot</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="text-xs"
              >
                Kembali
              </Button>
              <Button
                type="button"
                variant="emerald"
                size="md"
                disabled={holdSecondsLeft === 0}
                onClick={() => setIsSuccess(true)}
                className="text-xs font-bold gap-2 py-3 px-6 shadow-lg shadow-emerald-950/60"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Konfirmasi Pembayaran</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* NOTIFIKASI SUKSES (SLOT RESMI TERKUNCI) */}
      {isSuccess && (
        <Card className="border-emerald-600 bg-gradient-to-br from-slate-900 to-emerald-950/60 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Slot Berhasil Terkunci Resmi!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Terima kasih, <strong>{fullName}</strong>. Sesi konsultasi Anda telah dijadwalkan pada:
            </p>
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-emerald-800/80 inline-block text-left text-xs space-y-1">
              <div>📅 Tanggal: <strong className="text-white">{selectedDate}</strong></div>
              <div>⏰ Waktu: <strong className="text-emerald-400">{selectedSlot} WIB</strong></div>
              <div>👨‍⚕️ Dokter: <strong className="text-white">{CLINIC_CONFIG.practitionerName}</strong></div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href="/patient/intake"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Lanjut ke Asupan Suara (Zero-Typing)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/patient/dashboard"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs inline-flex items-center justify-center"
            >
              Ke Beranda Harian Pasien
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
