'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  Stethoscope,
} from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'Akses ditolak: Anda mencoba membuka area khusus praktisi. Silakan masuk menggunakan akun praktisi berwenang.'
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const supabase = createClient();

  // Helper redirect berdasarkan role
  const handlePostAuthRedirect = async (userId: string) => {
    try {
      // 1. Cek role di public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      const role = profile?.role;

      if (role === 'practitioner') {
        router.push('/practitioner/dashboard');
      } else {
        // Role 'patient' atau default
        if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/practitioner')) {
          router.push(redirectParam);
        } else {
          router.push('/patient/dashboard');
        }
      }
      router.refresh();
    } catch {
      // Fallback default ke portal pasien
      router.push('/patient/dashboard');
      router.refresh();
    }
  };

  // Handler: Masuk dengan Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah. Silakan periksa kembali akun Anda.');
        }
        throw error;
      }

      if (data.user) {
        setSuccessMessage('Berhasil masuk! Mengarahkan ke portal Anda...');
        await handlePostAuthRedirect(data.user.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat proses masuk.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Masuk Cepat via Magic Link (Email OTP)
  const handleMagicLink = async () => {
    if (!email.trim()) {
      setErrorMessage('Masukkan alamat email terlebih dahulu untuk menerima tautan masuk cepat.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsMagicLinkLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        redirectParam || '/patient/dashboard'
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setSuccessMessage(
        `Tautan masuk cepat telah dikirim ke ${email}. Silakan buka kotak masuk atau spam email Anda.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirimkan magic link.';
      setErrorMessage(msg);
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  // Handler: Pendaftaran Akun Pasien Baru
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter untuk keamanan data klinis.');
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
        redirectParam || '/patient/dashboard'
      )}`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim() || 'Pasien Integratif',
            phone_number: phoneNumber.trim() || null,
            role: 'patient',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Alamat email ini sudah terdaftar. Silakan beralih ke tab "Masuk".');
        }
        throw error;
      }

      if (data.session && data.user) {
        setSuccessMessage('Pendaftaran berhasil! Mengarahkan ke Dashboard Pasien...');
        await handlePostAuthRedirect(data.user.id);
      } else {
        setSuccessMessage(
          'Akun berhasil dibuat! Silakan periksa email Anda untuk verifikasi atau gunakan form Masuk.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan akun baru.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Container Utama Mobile-First */}
      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Tombol Kembali ke Beranda */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors p-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Enkripsi Medis RLS
          </div>
        </div>

        {/* Card Autentikasi */}
        <div className="rounded-3xl border border-emerald-900/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 p-6 sm:p-7 space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#16a34a] to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Integratif<span className="text-emerald-400">Care</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Portal Akses Pasien & Ruang Kendali Praktisi 360°
              </p>
            </div>
          </div>

          {/* Mode Tab Ringkas */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Alert Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Form Masuk */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Alamat Email</span>
                  <span className="text-[10px] text-slate-500">Pasien / Praktisi</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Kata Sandi</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              {/* Submit Masuk */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-emerald-600 hover:to-[#16a34a] text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi Kredensial...
                  </>
                ) : (
                  <>
                    Masuk ke Akun
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Pemisah Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider absolute font-mono">
                  Atau Opsi Instan
                </span>
              </div>

              {/* Tombol Login Cepat / Magic Link */}
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={isMagicLinkLoading}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-emerald-800/40 hover:border-emerald-600 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isMagicLinkLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim Tautan...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    Kirim Magic Link ke Email (Tanpa Password)
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Daftar Akun Baru */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nama Lengkap Pasien <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nomor WhatsApp / HP <span className="text-[10px] text-slate-500">(Notifikasi Kuota)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Alamat Email <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Kata Sandi Baru <span className="text-emerald-400">*</span></span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                Pendaftaran baru secara default berstatus <strong className="text-emerald-400">Pasien</strong>. 
                Data Anda dilindungi oleh trigger enkripsi Supabase RLS.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16a34a] to-emerald-600 hover:from-emerald-600 hover:to-[#16a34a] text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendaftarkan Akun Pasien...
                  </>
                ) : (
                  <>
                    Buat Akun Pasien
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Card: Info Keamanan Praktisi */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              Login Praktisi?
            </span>
            <span className="text-slate-500">
              Gunakan email & password kredensial dokter
            </span>
          </div>
        </div>

        {/* Caption Bawah */}
        <p className="text-center text-[11px] text-slate-500">
          Klinik Kedokteran Integratif & Totok Saraf • Praktek Mandiri Kuota 5 Pasien/Hari
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mr-2" />
          Memuat portal login...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
