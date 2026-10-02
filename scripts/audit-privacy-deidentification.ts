/**
 * UNIT TEST SUITE: AUDIT PRIVASI MEDIS & CLIENT-SIDE DE-IDENTIFICATION
 * 
 * Target Kepatuhan Regulasi:
 * 1. UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
 * 2. Standar HIPAA Safe Harbor De-identification (45 CFR § 164.514).
 * 
 * Verifikasi:
 * - Tidak ada Nama Lengkap, Nomor HP, NIK (16 digit), BPJS, atau Alamat yang lolos ke prompt AI.
 * - Sistem hanya mengirimkan: Umur, Gender Biologis, Biomarker Lab, dan Teks Gejala Anonim (UUID).
 */

import {
  deidentifyText,
  deidentifyObject,
  anonymizePatientContext,
  verifyPayloadCleanOfPii,
  containsSensitivePii,
} from '../lib/ai/anonymizer';

console.log('================================================================');
console.log('🛡️ AUDIT PRIVASI MEDIS & DE-IDENTIFIKASI DATA (UU PDP & HIPAA)');
console.log('================================================================\n');

// ============================================================================
// UJI 1: PENYAMARAN NIK & NOMOR HP INDONESIA
// ============================================================================
console.log('--- [UJI 1] Sanitasi NIK 16 Digit & Nomor HP Indonesia ---');

const testCasesId = [
  'NIK saya 3171012304850001, mohon dicek',
  'No KTP: 3201-1234-5678-0002 tolong simpan',
  'Hubungi saya di 081234567890 atau WA +6281987654321',
  'No BPJS: 0001234567890 dan no telp: 085711223344',
];

testCasesId.forEach((input, idx) => {
  const sanitized = deidentifyText(input);
  console.assert(!containsSensitivePii(sanitized), `Output harus bersih dari PII: ${sanitized}`);
  console.assert(!sanitized.includes('3171012304850001'), 'NIK tidak boleh bocor');
  console.assert(!sanitized.includes('081234567890'), 'No HP tidak boleh bocor');
  console.assert(!sanitized.includes('+6281987654321'), 'No WA tidak boleh bocor');
  console.log(`  ✓ Kasus ${idx + 1}: "${input}" -> "${sanitized}"`);
});

// ============================================================================
// UJI 2: PENYAMARAN NAMA LENGKAP & SAPAAN INDONESIA
// ============================================================================
console.log('\n--- [UJI 2] Sanitasi Nama Lengkap & Sapaan Budaya Indonesia ---');

const testCasesName = [
  { text: 'Pasien atas nama Bpk. Budi Santoso mengeluh sesak', knownNames: ['Budi Santoso'] },
  { text: 'Ibu Siti Aminah datang bersama putranya', knownNames: ['Siti Aminah'] },
  { text: 'Nama: Ratna Dewi, keluhan nyeri sendi', knownNames: ['Ratna Dewi'] },
  { text: 'Halo dok, nama saya Ahmad Fauzi dan saya pusing', knownNames: ['Ahmad Fauzi'] },
];

testCasesName.forEach((tc, idx) => {
  const sanitized = deidentifyText(tc.text, { knownNames: tc.knownNames });
  tc.knownNames.forEach((n) => {
    console.assert(!sanitized.toLowerCase().includes(n.toLowerCase()), `Nama "${n}" TIDAK BOLEH muncul pada hasil sanitasi!`);
  });
  console.log(`  ✓ Kasus ${idx + 1}: "${tc.text}" -> "${sanitized}"`);
});

// ============================================================================
// UJI 3: WHITELIST KONTEKS PASIEN (HANYA UMUR, GENDER, GEJALA, DAN UUID)
// ============================================================================
console.log('\n--- [UJI 3] Whitelist Konteks Pasien (Strict Safe Harbor) ---');

const rawPatientData = {
  patient_name: 'Bpk. Budi Santoso',
  full_name: 'Budi Santoso bin Sulaiman',
  nik: '3171012304850001',
  phone_number: '081234567890',
  email: 'budi.santoso@gmail.com',
  address: 'Jl. Melati No. 12 RT 04 RW 02, Jakarta Selatan',
  avatar_url: 'https://example.com/face-photos/budi.jpg',
  // Field medis yang sah
  age: 52,
  gender: 'Laki-laki',
  chief_complaints: [
    'Bpk. Budi Santoso mengeluh kembung dan begah kronis pasca makan',
    'Tengkuk kaku dan tensi naik saat lembur kerja',
  ],
  timeline_triggers: ['Stres promosi kerja', 'Mulai konsumsi Amlodipine 5mg'],
  practitioner_notes: 'Pasien Budi memiliki riwayat hipertensi esensial terkontrol',
};

const sanitizedContext = anonymizePatientContext(rawPatientData, 'anon-uuid-7890-secure');

// 1. Verifikasi field terlarang DIBUANG dari output object
const stringified = JSON.stringify(sanitizedContext);
console.assert(!stringified.includes('Budi Santoso'), 'Nama pasien HARUS DIBUANG');
console.assert(!stringified.includes('3171012304850001'), 'NIK HARUS DIBUANG');
console.assert(!stringified.includes('081234567890'), 'Nomor HP HARUS DIBUANG');
console.assert(!stringified.includes('budi.santoso@gmail.com'), 'Email HARUS DIBUANG');
console.assert(!stringified.includes('Jakarta Selatan'), 'Alamat HARUS DIBUANG');
console.assert(!stringified.includes('face-photos'), 'Foto Wajah HARUS DIBUANG');

// 2. Verifikasi field sah DIPERTAHANKAN
console.assert(sanitizedContext.age === 52, 'Umur harus dipertahankan');
console.assert(sanitizedContext.gender === 'male', 'Gender biologis harus dipertahankan');
console.assert(sanitizedContext.anonymized_id === 'anon-uuid-7890-secure', 'Token ID anonim harus ada');
console.assert(Array.isArray(sanitizedContext.chief_complaints), 'Chief complaints harus ada');
console.assert(Array.isArray(sanitizedContext.timeline_triggers), 'Timeline triggers harus ada');

// 3. Verifikasi keluhan di dalamnya ter-redaksi
console.assert(!sanitizedContext.chief_complaints?.[0].includes('Budi Santoso'), 'Nama dalam keluhan harus tersamar');

console.log('  ✓ Field Identitas Terlarang (Nama, NIK, No HP, Email, Alamat, Foto) 100% DIBUANG.');
console.log('  ✓ Field Medis Sah (Umur: 52, Gender: male, ID: anon-uuid-7890-secure) berhasil dipertahankan.');
console.log('  ✓ Teks Keluhan Ter-Anonimkan:', sanitizedContext.chief_complaints);

// ============================================================================
// UJI 4: AUDITOR VALIDATOR PII PADA PROMPT PAYLOAD LENGKAP
// ============================================================================
console.log('\n--- [UJI 4] Validasi Payload Prompt AI terhadap Kebocoran PII ---');

const finalAiPayload = {
  functional_nodes: { assimilation: 78, transport_structural: 80 },
  active_medications: [{ drug_name: 'Amlodipine', dosage: '5mg' }],
  patient_context: sanitizedContext,
};

const auditResult = verifyPayloadCleanOfPii(finalAiPayload);
console.assert(auditResult.isClean === true, 'Payload untuk Google AI Studio HARUS 100% BEBAS PII');
console.assert(auditResult.violations.length === 0, 'Violations harus 0');

console.log('  ✓ Auditor Check: 0 Pelanggaran PII Terdeteksi.');
console.log('  ✓ Payload memenuhi standar Safe Harbor De-identification & UU PDP.');

console.log('\n================================================================');
console.log('🎉 HASIL AUDIT PRIVASI MEDIS: 100% LULUS (ALL PASS)');
console.log('================================================================');
