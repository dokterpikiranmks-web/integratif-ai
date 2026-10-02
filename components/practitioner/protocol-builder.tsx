'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Utensils,
  Coffee,
  Activity,
  ShieldAlert,
  Sliders,
  Check,
} from 'lucide-react';

interface ProtocolItem {
  id: string;
  category: 'nutrition' | 'herbal' | 'acupoint';
  title: string;
  subtitle: string;
  dosageOrInstruction: string;
  enabled: boolean;
}

interface ProtocolBuilderProps {
  patientId?: string;
  patientName?: string;
  onPublish?: (protocol: ProtocolItem[]) => void;
}

export function ProtocolBuilder({
  patientId = 'p-1',
  patientName = 'Bpk. Budi Santoso',
  onPublish,
}: ProtocolBuilderProps) {
  const [protocols, setProtocols] = useState<ProtocolItem[]>([
    // Kategori 1: Diet & Nutrisi Terapeutik
    {
      id: 'diet-1',
      category: 'nutrition',
      title: 'Bubur Pati Garut Alami (Gastroprotektif)',
      subtitle: 'Melapisi mukosa lambung & menutup leaky gut',
      dosageOrInstruction: '1 sdm pati garut diseduh 150ml air hangat, diminum pagi sebelum sarapan saat perut kosong.',
      enabled: true,
    },
    {
      id: 'diet-2',
      category: 'nutrition',
      title: 'Protokol Eliminasi Makanan Peradangan (Gluten & Susu Sapi)',
      subtitle: 'Menenangkan peradangan sistemik usus (Node Defense & Repair)',
      dosageOrInstruction: 'Ganti sarapan berbasis tepung terigu dengan ubi kukus / bubur beras merah lokal selama 14 hari.',
      enabled: true,
    },
    {
      id: 'diet-3',
      category: 'nutrition',
      title: 'Air Kelapa Muda Segar (Substitusi Kalium Organik)',
      subtitle: 'Mengimbangi deplesi elektrolit akibat Amlodipine 5mg',
      dosageOrInstruction: '1 gelas (200ml) air kelapa hijau murni diminum pukul 14.00 WIB (jeda dari obat dokter).',
      enabled: false,
    },

    // Kategori 2: Ramuan Dapur Herbal Nusantara (Smart Swap)
    {
      id: 'herb-1',
      category: 'herbal',
      title: 'Rebusan Temulawak + Kunyit + Daun Salam (TOGA)',
      subtitle: 'Detoksifikasi fase II hati & stimulasi pengeluaran empedu',
      dosageOrInstruction: '2 ruas temulawak iris + 1 ruas kunyit + 3 lembar daun salam. Rebus 3 gelas air menjadi 1.5 gelas. Minum pukul 09.00 WIB (jeda 120 mnt dari Amlodipine).',
      enabled: true,
    },
    {
      id: 'herb-2',
      category: 'herbal',
      title: 'Seduhan Jahe Merah & Kayu Manis Sore',
      subtitle: 'Melancarkan mikrovaskular perifer & relaksasi otot servikal',
      dosageOrInstruction: '1 jempol jahe merah digeprek + 1 ruas kayu manis diseduh 200ml air panas mendidih pukul 16.30 WIB.',
      enabled: true,
    },
    {
      id: 'herb-3',
      category: 'herbal',
      title: 'Rebusan Brotowali & Kumis Kucing (Modulator Glikemik)',
      subtitle: 'Sensitisasi reseptor AMPK & diuretik alami',
      dosageOrInstruction: '1/2 ruas jari brotowali direbus singkat dengan 5 lembar kumis kucing.',
      enabled: false,
    },

    // Kategori 3: Titik Terapi Fisik & Akupresur Mandiri
    {
      id: 'acu-1',
      category: 'acupoint',
      title: 'Titik ST36 (Zusanli) - 90 Detik Tonifikasi',
      subtitle: 'Stimulasi nervus vagus & penguatan motilitas lambung',
      dosageOrInstruction: 'Pijat melingkar searah jarum jam pada 4 jari di bawah lutut luar selama 90 detik setiap pagi.',
      enabled: true,
    },
    {
      id: 'acu-2',
      category: 'acupoint',
      title: 'Titik PC6 (Neiguan) - 90 Detik Regulasi Vagus',
      subtitle: 'Meredakan mual, kembung ulu hati & debar jantung',
      dosageOrInstruction: 'Tekan lembut mantap 3 jari di atas pergelangan tangan bagian dalam selama 90 detik sebelum tidur.',
      enabled: true,
    },
    {
      id: 'acu-3',
      category: 'acupoint',
      title: 'Titik LI4 (Hegu) - Sirkulasi Serebral & Leher',
      subtitle: 'Meredakan ketegangan servikal & nyeri tengkuk kaku',
      dosageOrInstruction: 'Tekan pada sela jempol dan telunjuk tangan selama 60-90 detik saat tengkuk terasa kaku.',
      enabled: true,
    },
  ]);

  const [bufferTime, setBufferTime] = useState<number>(120); // 120 menit
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const toggleItem = (id: string) => {
    setProtocols((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
    setIsPublished(false);
  };

  const handlePublish = () => {
    setIsPublished(true);
    if (onPublish) {
      onPublish(protocols.filter((p) => p.enabled));
    }
  };

  const activeCount = protocols.filter((p) => p.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Penyusunan Protokol Klinis Modular (One-Click Deploy)
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sesuaikan resep nutrisi, herbal nusantara, dan titik saraf sebelum dikirim ke ponsel pasien
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{activeCount} Aksi Terpilih</Badge>
          <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Jeda Obat: {bufferTime} Menit
          </span>
        </div>
      </div>

      {/* KATEGORI 1: NUTRISI & DIET TERAPEUTIK */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-white flex items-center gap-2">
          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          1. Modul Diet & Nutrisi Terapeutik
        </h5>

        <div className="grid grid-cols-1 gap-2.5">
          {protocols
            .filter((p) => p.category === 'nutrition')
            .map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  item.enabled
                    ? 'bg-slate-900 border-emerald-600/70 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <Badge variant={item.enabled ? 'success' : 'default'} className="text-[10px]">
                      {item.enabled ? 'AKTIF' : 'NON-AKTIF'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-emerald-300 block">{item.subtitle}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                    {item.dosageOrInstruction}
                  </p>
                </div>

                {/* SAKELAR TOGGLE ON/OFF */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1 p-0.5 ${
                    item.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* KATEGORI 2: RAMUAN HERBAL DAPUR NUSANTARA */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-bold text-white flex items-center gap-2">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          2. Modul Ramuan Dapur Herbal Nusantara (Smart Swap)
        </h5>

        <div className="grid grid-cols-1 gap-2.5">
          {protocols
            .filter((p) => p.category === 'herbal')
            .map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  item.enabled
                    ? 'bg-slate-900 border-amber-600/70 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <Badge variant={item.enabled ? 'warning' : 'default'} className="text-[10px]">
                      {item.enabled ? 'AKTIF' : 'NON-AKTIF'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-amber-300 block">{item.subtitle}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                    {item.dosageOrInstruction}
                  </p>
                </div>

                {/* SAKELAR TOGGLE ON/OFF */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1 p-0.5 ${
                    item.enabled ? 'bg-amber-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* KATEGORI 3: TITIK TERAPI FISIK & AKUPRESUR */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-bold text-white flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          3. Modul Titik Terapi Fisik & Akupresur Mandiri Pasien
        </h5>

        <div className="grid grid-cols-1 gap-2.5">
          {protocols
            .filter((p) => p.category === 'acupoint')
            .map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  item.enabled
                    ? 'bg-slate-900 border-teal-600/70 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <Badge variant={item.enabled ? 'info' : 'default'} className="text-[10px]">
                      {item.enabled ? 'AKTIF' : 'NON-AKTIF'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-teal-300 block">{item.subtitle}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                    {item.dosageOrInstruction}
                  </p>
                </div>

                {/* SAKELAR TOGGLE ON/OFF */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1 p-0.5 ${
                    item.enabled ? 'bg-teal-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      item.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* NOTIFIKASI TERBIT & TOMBOL BESAR */}
      {isPublished && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Protokol Resmi Diterbitkan!</span>
              <span className="text-[11px]">
                Sinkronisasi otomatis ke &quot;Now Card&quot; dan jadwal harian {patientName}.
              </span>
            </div>
          </div>
          <Badge variant="success">Online Sync</Badge>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="button"
          variant="emerald"
          size="lg"
          onClick={handlePublish}
          className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60"
        >
          <Send className="w-4 h-4" />
          <span>Terbitkan Protokol ke Aplikasi Pasien</span>
        </Button>
      </div>
    </div>
  );
}
