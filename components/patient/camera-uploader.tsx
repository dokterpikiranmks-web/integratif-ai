'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScanPrescriptionLabResponse } from '@/types/ai';
import {
  Camera,
  UploadCloud,
  FileText,
  Pill,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Eye,
  Clock,
} from 'lucide-react';

interface CameraUploaderProps {
  onScanComplete?: (data: ScanPrescriptionLabResponse) => void;
}

export function CameraUploader({ onScanComplete }: CameraUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'prescription' | 'lab'>('prescription');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanPrescriptionLabResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Handle seleksi berkas foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal 20 MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setScanResult(null);
  };

  // Reset file
  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Pindai Foto dengan AI Gemini Vision
  const handleScanPhoto = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setErrorMsg(null);

    try {
      // 1. Konversi ke Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64Data = res.split(',')[1] || res;
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      const imageBase64 = await base64Promise;

      // 2. Kirim ke API Route /api/ai/scan-prescription-lab
      const response = await fetch('/api/ai/scan-prescription-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: selectedFile.type || 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (response.status === 429 || errJson.code === 'RATE_LIMIT_EXCEEDED') {
          setErrorMsg(errJson.friendly_notice || errJson.error || 'Analisis sedang dalam antrean singkat, data Anda aman...');
          return;
        }
        throw new Error(errJson.error || `Pemindaian gagal (${response.status})`);
      }

      const result: ScanPrescriptionLabResponse = await response.json();
      setScanResult(result);

      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err: unknown) {
      console.error('Error scanning prescription/lab:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat membaca foto.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
            <Camera className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Pemindai Strip Obat & Kertas Lab
            </h3>
            <p className="text-[11px] text-slate-400">
              AI akan membaca resep untuk deteksi deplesi nutrisi dan nilai biomarker fungsional
            </p>
          </div>
        </div>
        <Badge variant="info">Vision AI</Badge>
      </div>

      {errorMsg && (
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs ${
            errorMsg.includes('antrean') || errorMsg.includes('aman')
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
          }`}
        >
          {errorMsg.includes('antrean') || errorMsg.includes('aman') ? (
            <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-semibold block">
              {errorMsg.includes('antrean') || errorMsg.includes('aman') ? 'Status Antrean AI:' : 'Perhatian:'}
            </span>
            <p className="text-[11px] leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Tipe Dokumen Selector */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setUploadType('prescription')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            uploadType === 'prescription'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pill className="w-3.5 h-3.5" /> Strip / Resep Obat Dokter
        </button>
        <button
          type="button"
          onClick={() => setUploadType('lab')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            uploadType === 'lab'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Kertas Hasil Lab Luar
        </button>
      </div>

      {/* Hidden File Inputs */}
      {/* 1. Kamera HP langsung */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* 2. Galeri / Dokumen */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Area Upload & Preview */}
      {!previewUrl ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Tombol Kamera Langsung (Sangat ramah pengguna lansia / mobile) */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="p-5 rounded-2xl border border-dashed border-emerald-700/60 bg-emerald-950/20 hover:bg-emerald-950/40 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Foto dengan Kamera HP</span>
              <span className="text-[11px] text-slate-400">Arahkan langsung ke strip obat / kertas lab</span>
            </div>
          </button>

          {/* Tombol Pilih dari Galeri / File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 hover:bg-slate-900 flex flex-col items-center justify-center text-center gap-2 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Pilih dari Galeri / PDF</span>
              <span className="text-[11px] text-slate-400">Unggah foto yang sudah tersimpan</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview Container */}
          <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 flex flex-col items-center p-3">
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 z-10"
              title="Hapus Foto"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedFile?.type === 'application/pdf' ? (
              <div className="py-8 flex flex-col items-center text-slate-300">
                <FileText className="w-12 h-12 text-teal-400 mb-2" />
                <span className="text-xs font-semibold">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-400">Dokumen PDF Terpilih</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Pratinjau Medis"
                className="max-h-56 rounded-lg object-contain"
              />
            )}

            <div className="mt-2 text-center">
              <span className="text-xs font-medium text-slate-300 block truncate max-w-xs">
                {selectedFile?.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Tombol Eksekusi Scan Vision */}
          {!scanResult && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClear} className="text-xs">
                Ganti Foto
              </Button>
              <Button
                type="button"
                variant="emerald"
                size="sm"
                disabled={isScanning}
                onClick={handleScanPhoto}
                className="text-xs gap-1.5 font-bold"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Membaca Resep / Lab...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Pindai dengan Gemini Vision
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Hasil Ringkas Vision OCR */}
      {scanResult && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hasil Pemindaian AI Berhasil
            </span>
            <Badge variant="success">
              {scanResult.medications.length} Obat • {scanResult.lab_results.length} Biomarker
            </Badge>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {scanResult.summary}
          </p>

          {/* Obat Terbaca */}
          {scanResult.medications.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-bold text-amber-300 uppercase">Obat Resep Terdeteksi:</span>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.medications.map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700 text-[11px]">
                    💊 {m.drug_name} {m.dosage} ({m.frequency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Biomarker di luar rentang optimal */}
          {scanResult.lab_results.some(l => l.is_out_of_optimal_range) && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-bold text-rose-300 uppercase">Biomarker Keluar Rentang Optimal Fungsional:</span>
              <div className="space-y-1">
                {scanResult.lab_results
                  .filter(l => l.is_out_of_optimal_range)
                  .map((l, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-rose-950/20 p-1.5 rounded border border-rose-900/30">
                      <span className="font-medium text-slate-200">{l.biomarker}: <strong>{l.value} {l.unit}</strong></span>
                      <span className="text-[10px] text-rose-400">Optimal: {l.functional_optimal_range}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
