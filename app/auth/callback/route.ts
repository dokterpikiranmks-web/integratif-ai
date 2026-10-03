import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect');

  if (code) {
    const supabase = createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Periksa role di tabel profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const userRole = profile?.role || data.user.user_metadata?.role;

      if (userRole === 'practitioner') {
        return NextResponse.redirect(new URL('/practitioner/dashboard', request.url));
      }

      if (redirect && redirect.startsWith('/') && !redirect.startsWith('/practitioner')) {
        return NextResponse.redirect(new URL(redirect, request.url));
      }

      return NextResponse.redirect(new URL('/patient/dashboard', request.url));
    }
  }

  // Jika kode gagal atau tidak valid, kembali ke halaman login dengan pesan error
  return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
}
