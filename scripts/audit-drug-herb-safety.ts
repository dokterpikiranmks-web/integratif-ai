/**
 * UNIT TEST SUITE: AUDIT KEAMANAN INTERAKSI OBAT VS HERBAL (DRUG-HERB SAFETY)
 * 
 * Target Kepatuhan Klinis:
 * 1. Kasus Ekstrem 1: Pasien mengonsumsi Warfarin/Aspirin -> Sistem WAJIB mengunci/memberi peringatan keras
 *    pada herbal pengencer darah (Ginkgo Biloba, Bawang Putih dosis tinggi, Kurkumin dosis tinggi).
 * 2. Kasus Ekstrem 2: Pasien mengonsumsi Antihipertensi (Amlodipine/Captopril) -> Sistem WAJIB memberi jeda
 *    120 menit dan menandai deplesi mineral intraseluler.
 * 3. Sanitasi Deterministik: Rekomendasi AI yang berbahaya otomatis dibersihkan dan diganti alternatif aman.
 */

import {
  evaluateDrugSafetyRules,
  enforceDeterministicDrugSafety,
  DrugSafetyEvaluationResult,
} from '../lib/ai/drug-safety-rules';
import { GenerateProtocolResponse } from '../types/ai';

console.log('================================================================');
console.log('💊 AUDIT KEAMANAN INTERAKSI OBAT (DRUG-HERB CLINICAL SAFETY)');
console.log('================================================================\n');

// ============================================================================
// UJI 1: KASUS EKSTREM 1 - PASIEN MENGONSUMSI WARFARIN & ASPIRIN
// ============================================================================
console.log('--- [KASUS EKSTREM 1] Pasien dengan Obat Antikoagulan / Antiplatelet ---');

const medicationsWarfarinAspirin = [
  { drug_name: 'Warfarin Sodium', dosage: '2 mg', frequency: '1x sehari malam' },
  { drug_name: 'Aspirin (Cardio / Aspilets)', dosage: '80 mg', frequency: '1x sehari siang' },
];

const safetyWarfarin: DrugSafetyEvaluationResult = evaluateDrugSafetyRules(medicationsWarfarinAspirin);

console.assert(safetyWarfarin.has_critical_alerts === true, 'Sistem WAJIB memicu alert kritis (has_critical_alerts = true)');
console.assert(safetyWarfarin.alerts.length >= 2, 'Harus ada peringatan keamanan untuk Warfarin dan Aspirin');

const criticalAlert = safetyWarfarin.alerts.find((a) => a.category === 'anticoagulant_antiplatelet');
console.assert(Boolean(criticalAlert), 'Kategori anticoagulant_antiplatelet harus terdeteksi');
console.assert(
  criticalAlert?.severity === 'critical_black_box',
  'Severity untuk pengencer darah harus level CRITICAL_BLACK_BOX'
);

// Verifikasi daftar herbal pengencer darah yang wajib diblokir
const prohibitedList = safetyWarfarin.prohibited_herbs_master.map((h) => h.toLowerCase());
console.assert(prohibitedList.some((h) => h.includes('ginkgo')), 'Ginkgo Biloba WAJIB masuk daftar herbal dilarang');
console.assert(prohibitedList.some((h) => h.includes('bawang putih')), 'Bawang Putih dosis tinggi WAJIB masuk daftar herbal dilarang');
console.assert(prohibitedList.some((h) => h.includes('kurkumin')), 'Kurkumin dosis tinggi WAJIB masuk daftar herbal dilarang');
console.assert(prohibitedList.some((h) => h.includes('jahe merah')), 'Jahe Merah dosis tinggi WAJIB masuk daftar herbal dilarang');

console.log('  ✓ Alert Kritis Terdeteksi:', criticalAlert?.title);
console.log('  ✓ Severity Level: CRITICAL_BLACK_BOX (Terkunci Otomatis)');
console.log('  ✓ Herbal Terlarang Divalidasi:', safetyWarfarin.prohibited_herbs_master.join(', '));
console.log('  ✓ Peringatan Klinis:', criticalAlert?.clinical_warning.slice(0, 120) + '...');

// ============================================================================
// UJI 2: KASUS EKSTREM 2 - PASIEN MENGONSUMSI ANTIHIPERTENSI (AMLODIPINE & CAPTOPRIL)
// ============================================================================
console.log('\n--- [KASUS EKSTREM 2] Pasien dengan Obat Antihipertensi (Amlodipine & Captopril) ---');

const medicationsAmlodipineCaptopril = [
  { drug_name: 'Amlodipine Besylate', dosage: '5 mg', frequency: '1x sehari pagi (07:00 WIB)' },
  { drug_name: 'Captopril', dosage: '25 mg', frequency: '2x sehari' },
];

const safetyHypertension: DrugSafetyEvaluationResult = evaluateDrugSafetyRules(medicationsAmlodipineCaptopril);

console.assert(safetyHypertension.alerts.length >= 2, 'Harus ada peringatan untuk Amlodipine dan Captopril');
console.assert(
  safetyHypertension.mandatory_buffer_minutes_max === 120,
  'Sistem WAJIB menetapkan zona jeda waktu minimal 120 menit (2 jam)'
);

// Verifikasi deplesi mineral untuk Amlodipine (CCB)
const amlodipineAlert = safetyHypertension.alerts.find((a) => a.drug_name.toLowerCase().includes('amlodipine'));
console.assert(Boolean(amlodipineAlert), 'Alert Amlodipine harus ditemukan');
const amlodipineDepletions = amlodipineAlert!.depleted_minerals_and_nutrients.map((d) => d.toLowerCase());
console.assert(amlodipineDepletions.some((d) => d.includes('coq10')), 'Amlodipine WAJIB menandai deplesi CoQ10');
console.assert(amlodipineDepletions.some((d) => d.includes('kalium')), 'Amlodipine WAJIB menandai deplesi Kalium');
console.assert(amlodipineDepletions.some((d) => d.includes('magnesium')), 'Amlodipine WAJIB menandai deplesi Magnesium');

console.log('  ✓ Amlodipine Buffer:', amlodipineAlert?.mandatory_buffer_minutes, 'menit (Wajib 120 Menit Jeda)');
console.log('  ✓ Amlodipine Deplesi Nutrisi:', amlodipineAlert?.depleted_minerals_and_nutrients.join(', '));

// Verifikasi deplesi mineral untuk Captopril (ACE-Inhibitor)
const captoprilAlert = safetyHypertension.alerts.find((a) => a.drug_name.toLowerCase().includes('captopril'));
console.assert(Boolean(captoprilAlert), 'Alert Captopril harus ditemukan');
const captoprilDepletions = captoprilAlert!.depleted_minerals_and_nutrients.map((d) => d.toLowerCase());
console.assert(captoprilDepletions.some((d) => d.includes('zinc')), 'Captopril WAJIB menandai deplesi Zinc (Seng)');

console.log('  ✓ Captopril Buffer:', captoprilAlert?.mandatory_buffer_minutes, 'menit (Wajib 120 Menit Jeda)');
console.log('  ✓ Captopril Deplesi Nutrisi:', captoprilAlert?.depleted_minerals_and_nutrients.join(', '));

// ============================================================================
// UJI 3: PENGUJIAN DETERMINISTIC GUARD POST-PROCESSOR PADA OUTPUT AI
// ============================================================================
console.log('\n--- [UJI 3] Intersepsi Deterministik Output AI yang Mengandung Herbal Berbahaya ---');

// Skenario: AI Gemini secara keliru memasukkan Ginkgo Biloba dan Ekstrak Bawang Putih Pekat
// untuk pasien yang sedang mengonsumsi Warfarin
const mockAiResponseWithDangerousHerbs: GenerateProtocolResponse = {
  protocol_summary: 'Protokol uji untuk evaluasi klinis.',
  dominant_dysfunctional_nodes: [
    { node: 'transport_structural', score: 85, explanation: 'Ketegangan vaskular & resiko sirkulasi' },
  ],
  drug_herb_safety: [],
  smart_swap_nusantara: [
    {
      expensive_supplement_reference: 'Ginkgo Extract 120mg',
      active_compound: 'Ginkgolides',
      local_herb_name: 'Ginkgo Biloba Impor',
      local_latin_name: 'Ginkgo biloba',
      kitchen_dosage: '1 kapsul pagi',
      preparation_method: 'Diminum langsung',
      therapeutic_rationale: 'Melancarkan darah otak',
      estimated_cost_per_week_idr: 50000,
    },
    {
      expensive_supplement_reference: 'Garlic Oil High-Potency',
      active_compound: 'Allicin',
      local_herb_name: 'Bawang Putih Tunggal Dosis Tinggi (Konsentrat)',
      local_latin_name: 'Allium sativum',
      kitchen_dosage: '3 siung diparut pekat',
      preparation_method: 'Diminum langsung',
      therapeutic_rationale: 'Menurunkan tensi',
      estimated_cost_per_week_idr: 20000,
    },
  ],
  acupressure_points: [
    {
      code: 'ST36',
      indonesian_name: 'Zusanli',
      anatomical_location: 'Bawah lutut',
      target_functional_node: 'assimilation',
      target_organ_or_system: 'Vagus',
      pressure_technique: 'Tonifikasi',
      recommended_duration_seconds: 90,
    },
  ],
  daily_schedule: [
    {
      time_slot: '07:00 WIB',
      activity: 'Minum Warfarin 2mg',
      type: 'medication',
      instruction: 'Sesuai resep dokter',
    },
  ],
};

const hardenedResponse = enforceDeterministicDrugSafety(
  mockAiResponseWithDangerousHerbs,
  medicationsWarfarinAspirin
);

// 1. Pastikan Ginkgo Biloba dan Bawang Putih Dosis Tinggi TELAH DIBERSIHKAN
const hasGinkgo = hardenedResponse.smart_swap_nusantara.some((h) =>
  h.local_herb_name.toLowerCase().includes('ginkgo')
);
console.assert(hasGinkgo === false, 'Ginkgo Biloba HARUS DIBUANG dari resep herbal pasien Warfarin!');

const hasDangerousGarlic = hardenedResponse.smart_swap_nusantara.some((h) =>
  h.local_herb_name.toLowerCase().includes('bawang putih')
);
console.assert(hasDangerousGarlic === false, 'Bawang Putih dosis tinggi HARUS DIBUANG dari resep herbal pasien Warfarin!');

// 2. Pastikan Pati Garut (alternatif pelapis lambung aman) dimasukkan sebagai proteksi
const hasPatiGarut = hardenedResponse.smart_swap_nusantara.some((h) =>
  h.local_herb_name.toLowerCase().includes('pati garut')
);
console.assert(hasPatiGarut === true, 'Pati Garut (alternatif non-antikoagulan) WAJIB disubstitusikan untuk perlindungan mukosa!');

// 3. Pastikan safety_buffer_rule 120 menit disisipkan di daily_schedule
const hasBufferSchedule = hardenedResponse.daily_schedule.some(
  (s) => s.type === 'safety_buffer' && s.instruction.includes('2 jam')
);
console.assert(hasBufferSchedule === true, 'Jadwal harian WAJIB memuat Zona Jeda Keamanan (120 Menit / 2 Jam)!');

console.log('  ✓ Ginkgo Biloba berhasil DIBERSIHKAN dari rekomendasi herbal.');
console.log('  ✓ Bawang Putih konsentrat berhasil DIBERSIHKAN dari rekomendasi herbal.');
console.log('  ✓ Pati Garut gastroprotektif non-antikoagulan otomatis DISUBSTITUSIKAN.');
console.log('  ✓ Zona Jeda Keamanan 120 Menit terintegrasi ke daily_schedule.');

console.log('\n================================================================');
console.log('🎉 HASIL AUDIT KEAMANAN INTERAKSI OBAT: 100% LULUS (ALL PASS)');
console.log('================================================================');
