import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Helper to preserve refreshed cookies across redirects
  const createRedirectResponse = (targetUrl: URL) => {
    const redirectResponse = NextResponse.redirect(targetUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  const pathname = request.nextUrl.pathname;

  // 1. Ambil sesi autentikasi pengguna secara aman via getUser()
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    user = null;
  }

  // 2. Proteksi Rute /practitioner/:path*
  if (pathname.startsWith('/practitioner')) {
    // Jika belum login -> Redirect ke /auth/login?redirect=/practitioner/...
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return createRedirectResponse(redirectUrl);
    }

    // Jika sudah login, verifikasi role di tabel public.profiles
    let userRole: string | null = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = profile?.role ?? null;
    } catch (err) {
      userRole = null;
    }

    // Role fallback ke user metadata jika profile query belum selesai ter-sync
    if (!userRole && user.user_metadata?.role) {
      userRole = user.user_metadata.role;
    }

    // Jika login tapi profile.role !== 'practitioner' -> Redirect ke /patient/dashboard?error=unauthorized
    if (userRole !== 'practitioner') {
      const unauthorizedUrl = new URL('/patient/dashboard', request.url);
      unauthorizedUrl.searchParams.set('error', 'unauthorized');
      return createRedirectResponse(unauthorizedUrl);
    }

    return response;
  }

  // 3. Proteksi Rute /patient/dashboard dan /patient/intake
  if (pathname.startsWith('/patient/dashboard') || pathname.startsWith('/patient/intake')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return createRedirectResponse(loginUrl);
    }
  }

  return response;
}

// Konfigurasi matcher sesuai instruksi
export const config = {
  matcher: ['/practitioner/:path*', '/patient/dashboard/:path*', '/patient/intake/:path*'],
};
