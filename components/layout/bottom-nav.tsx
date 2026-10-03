'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Clock, Stethoscope, Sparkles, LogIn, Users, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function checkRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (user) {
          setIsLoggedIn(true);
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (isMounted) {
            setRole(profile?.role || (user.user_metadata?.role as UserRole) || 'patient');
          }
        } else {
          setIsLoggedIn(false);
          setRole(null);
        }
      } catch {
        if (isMounted) {
          setIsLoggedIn(false);
          setRole(null);
        }
      }
    }

    checkRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        setIsLoggedIn(true);
        setRole((user.user_metadata?.role as UserRole) || 'patient');
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Menu items disesuaikan dengan status autentikasi dan role
  const links = !isLoggedIn
    ? [
        { href: '/', label: 'Beranda', icon: Home },
        { href: '/booking', label: 'Slot Kuota 5', icon: Calendar },
        { href: '/auth/login', label: 'Masuk / Portal', icon: LogIn },
      ]
    : role === 'practitioner'
    ? [
        { href: '/practitioner/dashboard', label: 'Ruang Praktek', icon: Stethoscope },
        { href: '/practitioner/patient', label: 'Antrean Pasien', icon: Users },
        { href: '/practitioner/therapy-session', label: 'Sesi Terapi', icon: FileText },
      ]
    : [
        { href: '/patient/dashboard', label: 'Now Card', icon: Clock },
        { href: '/booking', label: 'Slot Kuota 5', icon: Calendar },
        { href: '/patient/intake', label: 'Asupan Suara', icon: Sparkles },
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
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-[10px] font-medium',
                isActive
                  ? 'text-emerald-400 bg-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200'
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
