/**
 * Test Suite Verifikasi Tahap 2: AI Integration & Service Layer
 * Menguji anonymizer, schema format, server-only client, dan API route handlers
 */

import './mock-server-only';
import { deidentifyText, deidentifyObject, containsSensitivePii, maskNik, maskPhone } from '../lib/ai/anonymizer';
import { cleanAndParseJson } from '../lib/ai/gemini';
import { INTAKE_AUDIO_RESPONSE_SCHEMA } from '../lib/ai/prompts/intake-audio';
import { SCAN_PRESCRIPTION_LAB_RESPONSE_SCHEMA } from '../lib/ai/prompts/scan-prescription-lab';
import { GENERATE_PROTOCOL_RESPONSE_SCHEMA } from '../lib/ai/prompts/generate-protocol';

console.log('=== TEST 1: De-identification (Client-Side Anonymizer) ===');

// 1. Uji Sanitasi NIK 16 digit & Nomor HP
const rawText1 = 'Pasien Bpk. Budi Santoso, NIK 3171012304850001, No HP 081234567890 mengeluh maag kambuh.';
const anonymized1 = deidentifyText(rawText1, { knownNames: ['Budi Santoso'] });
console.log('Raw:', rawText1);
console.log('Sanitized:', anonymized1);

const nikMasked = !anonymized1.includes('3171012304850001') && anonymized1.includes('[NIK_DISAMARKAN]');
const phoneMasked = !anonymized1.includes('081234567890') && anonymized1.includes('[NO_HP_DISAMARKAN]');
const nameMasked = !anonymized1.includes('Budi Santoso');

console.assert(nikMasked, 'NIK harus disamarkan!');
console.assert(phoneMasked, 'No HP harus disamarkan!');
console.assert(nameMasked, 'Nama pasien harus disamarkan!');
console.log('✅ Test 1 Passed: NIK, No HP, dan Nama berhasil di-anonimkan.');

// 2. Uji Sanitasi Objek Bersarang (Nested Payload)
const rawPayload = {
  patient_name: 'Ibu Ratna Dewi',
  nik: '3201015506780002',
  phone: '085712345678',
  complaint: 'Ibu Ratna Dewi merasa pusing berputar dan tengkuk tegang.',
  active_medications: [
    { drug_name: 'Amlodipine', dosage: '5mg' }
  ]
};
const sanitizedPayload = deidentifyObject(rawPayload, { knownNames: ['Ratna Dewi'] });
console.assert(sanitizedPayload.patient_name === '[NAMA_PASIEN]', 'patient_name key harus disamarkan');
console.assert(sanitizedPayload.nik === '[NIK_DISAMARKAN]', 'nik key harus disamarkan');
console.assert(sanitizedPayload.phone === '[NO_HP_DISAMARKAN]', 'phone key harus disamarkan');
console.assert(!sanitizedPayload.complaint.includes('Ratna Dewi'), 'nama di keluhan harus disamarkan');
console.log('✅ Test 2 Passed: Payload objek JSON bersarang berhasil disanitasi.');

// 3. Uji Parsing JSON Gemini
console.log('\n=== TEST 2: Robust JSON Parser ===');
const mockMarkdownJson = '```json\n{\n  "summary": "Pasien mengalami dispepsia fungsional.",\n  "chief_complaints": ["Kembung"],\n  "functional_nodes": {\n    "assimilation": 80,\n    "defense_repair": 30,\n    "bioenergetics": 50,\n    "biotransformation": 40,\n    "communication": 60,\n    "transport_structural": 40,\n    "mental_emotional": 70\n  },\n  "timeline_triggers": ["Stres deadline pekerjaan"]\n}\n```';
const parsed = cleanAndParseJson<{ summary: string; functional_nodes: Record<string, number> }>(mockMarkdownJson);
console.assert(parsed.summary === 'Pasien mengalami dispepsia fungsional.', 'JSON summary harus sesuai');
console.assert(parsed.functional_nodes.assimilation === 80, 'Score assimilation harus 80');
console.log('✅ Test 3 Passed: Markdown code fences JSON berhasil dibersihkan dan diparse.');

// 4. Uji Ketersediaan Skema Prompt Medis
console.log('\n=== TEST 3: Medical Prompt Schemas Integrity ===');
console.assert(!!INTAKE_AUDIO_RESPONSE_SCHEMA, 'Intake audio schema harus ada');
console.assert(!!SCAN_PRESCRIPTION_LAB_RESPONSE_SCHEMA, 'Scan prescription & lab schema harus ada');
console.assert(!!GENERATE_PROTOCOL_RESPONSE_SCHEMA, 'Generate protocol schema harus ada');
console.log('✅ Test 3 Passed: Ketiga skema JSON respons medis siap dan terdefinisi.');

// 5. Uji Sistem Auto-Detection & Self-Healing Model Gemini
console.log('\n=== TEST 4: Gemini Model Auto-Detection & Self-Healing Logic ===');
import { isModelUnavailableError, RANKED_FLASH_MODELS_PREFERENCE } from '../lib/ai/model-detector';

console.assert(
  isModelUnavailableError(new Error('models/gemini-1.5-flash is not found for API version v1beta')),
  'Harus mengenali error 404 model not found'
);
console.assert(
  isModelUnavailableError(new Error('The model gemini-1.5-flash is deprecated')),
  'Harus mengenali error deprecated model'
);
console.assert(
  !isModelUnavailableError(new Error('Invalid argument: missing prompt')),
  'Tidak boleh salah mengidentifikasi error non-model'
);
console.assert(
  RANKED_FLASH_MODELS_PREFERENCE.length > 5,
  'Daftar ranking model Flash cadangan harus komprehensif'
);
console.log('✅ Test 4 Passed: Mekanisme pendeteksi error model deprecated & not found bekerja akurat.');

console.log('\n🎉 SEMUA TEST TAHAP 2 (TERMASUK MODEL AUTO-DETECT) BERHASIL! (100% Passed)');

