'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Clock, Stethoscope, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/patient/dashboard', label: 'Now Card', icon: Clock },
    { href: '/patient/booking', label: 'Slot Kuota 5', icon: Calendar },
    { href: '/patient/intake', label: 'Asupan Suara', icon: Sparkles },
    { href: '/practitioner', label: 'Praktisi', icon: Stethoscope },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-2">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-[10px] font-medium",
                isActive
                  ? "text-emerald-400 bg-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
