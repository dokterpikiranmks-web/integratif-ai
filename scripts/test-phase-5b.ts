/**
 * MASTER VERIFICATION TEST SUITE: TAHAP 5B
 * Senior QA Automation & Reliability Engineer (Anti Gravity)
 * 
 * Ruang Lingkup Verifikasi:
 * 1. Uji Transaksi Bersamaan (Concurrency & Race Condition Slot Kuota 5):
 *    - 10 permintaan booking masuk serentak pada tanggal dengan sisa 1 slot (kuota 4/5).
 *    - PostgreSQL Transaction Advisory Lock strictly menolak booking ke-6.
 *    - Double-booking prevention pada jam yang sama (idx_unique_active_appointment_slot).
 * 2. Ketahanan Limit API Gemini 1.5 Flash (Rate Limit 15 RPM / 429 Handling):
 *    - Simulasi HTTP 429 & transient timeouts.
 *    - Exponential Backoff & Jitter retry logic pada server.
 *    - Graceful degradation: Pesan ramah antrean tanpa error 500 / blank screen.
 * 3. Kompatibilitas Mobile PWA & Web Audio Chime:
 *    - iOS Safari AudioContext suspended -> resume saat praktisi tekan "Mulai Sesi".
 *    - PWA Offline-first caching: Halaman jadwal harian tetap tampil saat koneksi terputus.
 */

import { execSync } from 'child_process';
import * as path from 'path';

console.log('================================================================');
console.log('🛡️  KLINIK INTEGRATIF: MASTER TEST SUITE TAHAP 5B (RELIABILITY)');
console.log('    Senior QA Automation & Reliability Engineer Audit');
console.log('================================================================\n');

const tests = [
  {
    name: '1. Uji Transaksi Bersamaan & Race Condition Kuota 5 Slot',
    file: 'scripts/stress-test-booking.ts',
  },
  {
    name: '2. Ketahanan Limit API Gemini (Rate Limit 15 RPM / 429 Backoff)',
    file: 'scripts/test-rate-limit-resilience.ts',
  },
  {
    name: '3. Kompatibilitas Mobile PWA Offline & AudioContext Safari',
    file: 'scripts/test-mobile-pwa-audio.ts',
  },
];

let allPassed = true;

for (const test of tests) {
  console.log(`\n▶ MENJALANKAN: ${test.name}`);
  console.log(`  File: ${test.file}`);
  try {
    const output = execSync(`node scripts/run.js ${test.file}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
    });
    console.log(output);
    console.log(`✅ ${test.name}: 100% PASS`);
  } catch (error: unknown) {
    allPassed = false;
    console.error(`❌ ${test.name}: FAILED`);
    const execErr = error as { stdout?: string; stderr?: string };
    if (execErr.stdout) console.log(execErr.stdout);
    if (execErr.stderr) console.error(execErr.stderr);
    break;
  }
}

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 AUDIT TAHAP 5B SELESAI: SEMUA PENGUJIAN 100% LULUS (ALL PASS)');
  console.log('   ✓ Concurrency Kuota 5: Bebas Race Condition & Double-Booking');
  console.log('   ✓ Gemini 429 Handling: Exponential Backoff & Graceful Antrean Aktif');
  console.log('   ✓ Mobile PWA & Audio : iOS Safari Audio Resume & Offline Caching Teruji');
} else {
  console.log('⚠️ AUDIT TAHAP 5B GAGAL: Terdeteksi Anomali pada Sistem.');
  process.exit(1);
}
console.log('================================================================\n');
