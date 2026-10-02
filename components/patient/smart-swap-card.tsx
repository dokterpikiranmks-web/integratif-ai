'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import {
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  DollarSign,
  Coffee,
  Pill,
  Leaf,
  Scale,
  Flame,
} from 'lucide-react';

interface SmartSwapItem {
  id: string;
  supplementName: string;
  supplementPrice: number; // IDR per botol
  activeCompound: string;
  localHerbName: string;
  localLatinName: string;
  localPricePerWeek: number; // IDR
  kitchenDosage: string;
  preparationRecipe: string;
  therapeuticRationale: string;
}

const DEFAULT_SWAP_ITEMS: SmartSwapItem[] = [
  {
    id: 'swap-1',
    supplementName: 'L-Glutamine Powder 5000mg',
    supplementPrice: 650000,
    activeCompound: 'Resistant Starch & Mucilages',
    localHerbName: 'Pati Garut Murni Alami',
    localLatinName: 'Maranta arundinacea',
    localPricePerWeek: 15000,
    kitchenDosage: '1 sendok makan (sdm) munjung',
    preparationRecipe: 'Larutkan 1 sdm pati garut dalam 50ml air dingin, lalu tuang 150ml air mendidih. Aduk hingga menjadi bubur bening hangat. Minum saat perut kosong.',
    therapeuticRationale: 'Pati resisten garut melapisi mukosa lambung dan memberi makan bakteri Akkermansia di usus, menutup permeabilitas leaky gut tanpa bahan kimia sintetis.',
  },
  {
    id: 'swap-2',
    supplementName: 'Berberine HCL 500mg Kapsul Impor',
    supplementPrice: 480000,
    activeCompound: 'Alkaloid Tinokrisposid & Isoquinoline',
    localHerbName: 'Batang Brotowali & Temulawak',
    localLatinName: 'Tinospora crispa & Curcuma xanthorrhiza',
    localPricePerWeek: 12000,
    kitchenDosage: '1 ruas jari batang brotowali + 2 ruas temulawak',
    preparationRecipe: 'Potong tipis 1 ruas jari brotowali dan 2 ruas temulawak. Rebus dalam 3 gelas air hingga tersisa 1.5 gelas dengan api lilin.',
    therapeuticRationale: 'Rasa pahit brotowali mengaktivasi reseptor TAS2R dan jalur AMPK untuk sensitivitas insulin dan regulasi glukosa darah.',
  },
  {
    id: 'swap-3',
    supplementName: 'Tart Cherry Extract & Celery Seed',
    supplementPrice: 520000,
    activeCompound: 'Flavonoid & Tanin Syzygium',
    localHerbName: 'Daun Salam Segar Dapur',
    localLatinName: 'Syzygium polyanthum',
    localPricePerWeek: 5000,
    kitchenDosage: '7 lembar daun salam segar tua',
    preparationRecipe: 'Cuci bersih 7 lembar daun salam. Rebus bersama 2 gelas air sampai tersisa 1 gelas. Minum hangat di sore hari.',
    therapeuticRationale: 'Kandungan flavonoid menstimulasi ekskresi asam urat ginjal dan melindungi endotel mikrovaskular dari radang kronis.',
  },
  {
    id: 'swap-4',
    supplementName: 'Multivitamin & Mineral Sintetis Impor',
    supplementPrice: 380000,
    activeCompound: 'Polifenol & Bioavailable Micronutrients',
    localHerbName: 'Daun Kelor Nusantara',
    localLatinName: 'Moringa oleifera',
    localPricePerWeek: 8000,
    kitchenDosage: '1 genggam tangan daun segar atau 1 sendok teh bubuk',
    preparationRecipe: 'Seduh 1 sendok teh bubuk kelor atau jadikan sayur bening segar tanpa dipanaskan terlalu lama agar mikronutrien tidak rusak.',
    therapeuticRationale: 'Kaya kalsium, zat besi organik, kalium, dan 46 antioksidan alami yang langsung diserap tubuh tanpa membebani filtrasi ginjal.',
  },
];

export function SmartSwapCard() {
  // State tombol switch: true = mode herbal lokal murah (Smart Swap), false = suplemen modern impor
  const [isLocalHerbs, setIsLocalHerbs] = useState<boolean>(true);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  const activeItem = DEFAULT_SWAP_ITEMS[activeItemIndex];

  // Hitung total penghematan bulanan
  const totalModernMonthly = DEFAULT_SWAP_ITEMS.reduce((sum, item) => sum + item.supplementPrice, 0);
  const totalLocalMonthly = DEFAULT_SWAP_ITEMS.reduce((sum, item) => sum + (item.localPricePerWeek * 4), 0);
  const monthlySavings = totalModernMonthly - totalLocalMonthly;

  return (
    <Card className="border-amber-700/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 rounded-2xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coffee className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Smart Swap Nusantara
              <Badge variant="warning">Hemat 95%</Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Konversi instan suplemen mahal ke herbal dapur TOGA lokal yang mudah ditemukan
            </p>
          </div>
        </div>

        {/* ONE-TOUCH TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setIsLocalHerbs(!isLocalHerbs)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-md ${
            isLocalHerbs
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Sentuh untuk berganti antara Herbal Dapur Murah atau Suplemen Modern"
        >
          <ArrowRightLeft className="w-4 h-4 text-amber-200" />
          <span>{isLocalHerbs ? 'Mode: Herbal Dapur (Aktif)' : 'Mode: Suplemen Impor'}</span>
        </button>
      </div>

      {/* Navigasi Pilihan Swap Item */}
      <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
        {DEFAULT_SWAP_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveItemIndex(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              activeItemIndex === idx
                ? 'bg-amber-950 text-amber-200 border-amber-600 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {item.localHerbName.split(' ')[0]} vs {item.supplementName.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Comparison Panel */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        {isLocalHerbs ? (
          // TAMPILAN SMART SWAP HERBAL NUSANTARA (MURAH & ALAMI)
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  Alternatif Ramuan Dapur TOGA Lokal:
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  🌿 {activeItem.localHerbName}
                </h4>
                <span className="text-xs text-slate-400 italic">
                  ({activeItem.localLatinName})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Biaya Pasar:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {formatRupiah(activeItem.localPricePerWeek)} / minggu
                </span>
              </div>
            </div>

            {/* Takaran Dapur Sendok & Ruas Jari */}
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Takaran Rumah Tangga: <strong>{activeItem.kitchenDosage}</strong></span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-emerald-900/40">
                <strong>Cara Racik:</strong> {activeItem.preparationRecipe}
              </p>
            </div>

            {/* Alasan Saintifik Terapi */}
            <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40 leading-relaxed">
              💡 <strong>Menggantikan:</strong> {activeItem.supplementName} seharga {formatRupiah(activeItem.supplementPrice)}.<br />
              <strong>Khasiat Klinis:</strong> {activeItem.therapeuticRationale}
            </div>
          </div>
        ) : (
          // TAMPILAN SUPLEMEN MODERN IMPOR
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Opsi Suplemen Impor Modern:
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  💊 {activeItem.supplementName}
                </h4>
                <span className="text-xs text-slate-400">
                  Senyawa: {activeItem.activeCompound}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Harga Pasaran:</span>
                <span className="font-mono text-sm font-bold text-rose-400">
                  {formatRupiah(activeItem.supplementPrice)} / botol
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Suplemen tablet/kapsul murni impor. Efektif namun membutuhkan anggaran tinggi dan ketersediaan toko khusus.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLocalHerbs(true)}
              className="text-xs text-amber-300 border-amber-800 hover:bg-amber-950/50"
            >
              Ubah ke Herbal Dapur (Hemat {formatRupiah(activeItem.supplementPrice - activeItem.localPricePerWeek * 4)})
            </Button>
          </div>
        )}
      </div>

      {/* Total Monthly Savings Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Total Estimasi Hemat Pasien:
          </span>
        </div>
        <span className="font-mono text-sm font-bold text-emerald-400">
          + {formatRupiah(monthlySavings)} / bulan
        </span>
      </div>
    </Card>
  );
}
