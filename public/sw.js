/**
 * SERVICE WORKER PWA KLINIK INTEGRATIF
 * Kebijakan Caching: Offline-First untuk Halaman Jadwal Harian & Protokol Pasien
 * Mendukung iOS PWA (Add to Home Screen) & Android WebAPK
 */

const CACHE_NAME = 'integratif-care-v2';

// Aset statis & halaman krusial yang wajib tersedia saat koneksi internet terputus
const STATIC_PRECACHE_URLS = [
  '/',
  '/patient',
  '/patient/dashboard',
  '/patient/booking',
  '/booking',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 1. INSTALL EVENT: Pre-cache aset statis & halaman jadwal pasien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching halaman jadwal pasien & aset offline...');
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Sebagian aset gagal di-pre-cache (mungkin route dinamis dev):', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE EVENT: Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Membersihkan cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH EVENT: Strategi Offline-First & Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Hanya tangani metode GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Abaikan API calls dinamis atau Supabase real-time
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    return;
  }

  // A. STRATEGI NAVIGASI HTML (Halaman Jadwal Harian / Patient Dashboard):
  // Network-First with Cache Fallback: Utamakan data terbaru saat online,
  // namun jika internet drop/offline, langsung sajikan halaman dari cache!
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Mode Offline aktif: Mengambil halaman jadwal dari cache untuk', url.pathname);
          // 1. Coba cari URL persis di cache
          const matchedResponse = await caches.match(event.request);
          if (matchedResponse) return matchedResponse;

          // 2. Jika pasien membuka rute /patient/* tapi rute spesifik belum di-cache, sajikan /patient/dashboard
          if (url.pathname.startsWith('/patient')) {
            const dashboardCache = await caches.match('/patient/dashboard');
            if (dashboardCache) return dashboardCache;
            const patientCache = await caches.match('/patient');
            if (patientCache) return patientCache;
          }

          // 3. Fallback utama ke root app shell
          const rootCache = await caches.match('/');
          if (rootCache) return rootCache;

          return new Response('Halaman jadwal sedang offline. Data Anda tersimpan aman di perangkat.', {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // B. STRATEGI ASET STATIS & MEDIA (CSS, JS, Fonts, Icons): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // Kembalikan versi cache seketika jika ada, lalu perbarui di latar belakang
      return cachedResponse || fetchPromise;
    })
  );
});
