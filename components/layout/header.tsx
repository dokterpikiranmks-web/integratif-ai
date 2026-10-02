import React from 'react';
import Link from 'next/link';
import { CLINIC_CONFIG } from '@/lib/constants';
import { Sparkles, Calendar, Stethoscope, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base text-white tracking-tight block">
              Integratif<span className="text-emerald-400">Care</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Praktek Mandiri • Kuota 5 Pasien/Hari
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/booking"
            className="text-xs font-medium text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Pesan Slot</span>
            <span className="sm:hidden">Slot</span>
          </Link>

          <Link
            href="/patient"
            className="text-xs font-medium text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Portal Pasien</span>
            <span className="sm:hidden">Pasien</span>
          </Link>

          <Link
            href="/practitioner"
            className="text-xs font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/80 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Praktisi (360°)</span>
            <span className="sm:hidden">Praktisi</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
