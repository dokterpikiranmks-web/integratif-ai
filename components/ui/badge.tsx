import React from 'react';
import { cn } from '@/lib/utils';
import { AppointmentStatus, BudgetTier } from '@/types/database';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80",
    warning: "bg-amber-950/60 text-amber-300 border-amber-800/80",
    danger: "bg-rose-950/60 text-rose-300 border-rose-800/80",
    info: "bg-cyan-950/60 text-cyan-300 border-cyan-800/80",
    purple: "bg-purple-950/60 text-purple-300 border-purple-800/80",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case 'paid_confirmed':
      return <Badge variant="success">Terkonfirmasi (Slot Terkunci)</Badge>;
    case 'slot_held':
      return <Badge variant="warning">Menunggu Pembayaran</Badge>;
    case 'checked_in':
      return <Badge variant="info">Pasien Tiba di Klinik</Badge>;
    case 'in_session':
      return <Badge variant="purple">Sedang Terapi Fisik</Badge>;
    case 'completed':
      return <Badge variant="default">Selesai</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Dibatalkan</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function BudgetTierBadge({ tier }: { tier: BudgetTier }) {
  switch (tier) {
    case 'kitchen_herbs':
      return <Badge variant="success">🌿 Dapur Terapeutik (TOGA Murah)</Badge>;
    case 'local_extract':
      return <Badge variant="info">🧪 Ekstrak Herbal Nusantara</Badge>;
    case 'modern_supplements':
      return <Badge variant="purple">💊 Suplemen Modern Saintifik</Badge>;
    default:
      return <Badge>{tier}</Badge>;
  }
}
