'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types/database';
import {
  Sparkles,
  Calendar,
  Stethoscope,
  LogIn,
  LogOut,
  Clock,
  Users,
  Shield,
  User as UserIcon,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function loadUserSession() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!isMounted) return;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (isMounted && data) {
            setProfile(data as Profile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user auth status:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserSession();

    // Listener reaktif Supabase Auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (isMounted && data) {
          setProfile(data as Profile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Gagal keluar sesi:', err);
      window.location.href = '/';
    }
  };

  // Tentukan user role (dengan fallback metadata jika profile DB belum terbaca)
  const role: UserRole =
    profile?.role || (user?.user_metadata?.role as UserRole) || 'patient';

  // Format inisial avatar pengguna
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pasien';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0].toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16a34a] to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950 group-hover:scale-105 transition-all">
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

        {/* Dynamic Navigation Menu */}
        <nav className="flex items-center gap-2 sm:gap-2.5">
          {loading ? (
            // Skeleton loader halus saat inisialisasi sesi
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-20 h-8 bg-slate-900 rounded-lg border border-slate-800" />
              <div className="w-24 h-8 bg-slate-900 rounded-lg border border-slate-800" />
            </div>
          ) : !user ? (
            /* ========================================================================= */
            /* A. MODE TAMU / PUBLIK (Belum Login)                                       */
            /* HILANGKAN tombol 'Praktisi (360°)' dari pandangan publik                  */
            /* ========================================================================= */
            <>
              <Link
                href="/booking"
                className="text-xs font-semibold text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pesan Slot</span>
              </Link>

              <Link
                href="/auth/login"
                className="text-xs font-semibold text-white bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-emerald-600 hover:to-[#16a34a] px-3.5 py-1.5 rounded-lg shadow-sm shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk / Portal</span>
              </Link>
            </>
          ) : role === 'practitioner' ? (
            /* ========================================================================= */
            /* C. MODE PRAKTISI (Role = 'practitioner')                                   */
            /* ========================================================================= */
            <>
              {/* Badge Hijau 'Ruang Praktek (360°)' */}
              <Link
                href="/practitioner/dashboard"
                className="text-xs font-semibold text-emerald-300 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-950"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ruang Praktek (360°)</span>
                <span className="sm:hidden">Praktek</span>
              </Link>

              {/* Tombol 'Antrean Hari Ini' */}
              <Link
                href="/practitioner/dashboard"
                className="text-xs font-medium text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Antrean Hari Ini</span>
                <span className="sm:hidden">Antrean</span>
              </Link>

              {/* Tombol 'Keluar' (Sign Out) */}
              <button
                type="button"
                onClick={handleSignOut}
                title="Keluar dari akun praktisi"
                className="text-xs font-medium text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-red-900/50 hover:bg-red-950/20 transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            /* ========================================================================= */
            /* B. MODE PASIEN (Role = 'patient')                                         */
            /* ========================================================================= */
            <>
              {/* Tombol 'Jadwal Saya' (/patient/dashboard) */}
              <Link
                href="/patient/dashboard"
                className="text-xs font-semibold text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Jadwal Saya</span>
                <span className="sm:hidden">Jadwal</span>
              </Link>

              {/* Tombol 'Pesan Slot' (/booking) */}
              <Link
                href="/booking"
                className="text-xs font-semibold text-slate-200 hover:text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Pesan Slot</span>
                <span className="sm:hidden">Slot</span>
              </Link>

              {/* Avatar & Nama Pasien */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
                  {initials || <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium text-slate-300 hidden md:inline max-w-[120px] truncate">
                  {displayName}
                </span>

                {/* Tombol 'Keluar' (Sign Out) */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Keluar dari akun pasien"
                  className="text-xs font-medium text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-red-900/50 hover:bg-red-950/20 transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
