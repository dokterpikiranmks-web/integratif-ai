import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PwaRegister } from '@/components/layout/pwa-register';

export const metadata: Metadata = {
  title: 'Klinik Kedokteran Integratif & Totok Saraf (Maks 5 Pasien/Hari)',
  description: 'Praktek Mandiri Solo-Praktisi Kedokteran Integratif, Dapur Terapeutik Nusantara, dan Terapi Fisik Totok Saraf Berbasis AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IntegratifCare',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen selection:bg-emerald-500 selection:text-white">
        <PwaRegister />
        <Header />
        <main className="flex-1 pb-20 sm:pb-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
