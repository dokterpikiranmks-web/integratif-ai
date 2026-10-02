import { Type } from '@google/genai';

/**
 * System Instruction untuk Vision OCR & Analisis Klinis Resep Obat / Strip Obat & Kertas Lab
 */
export const SCAN_PRESCRIPTION_LAB_SYSTEM_INSTRUCTION = `Anda adalah Dokter Spesialis Kedokteran Integratif & Ahli Farmakologi Herbal dengan keahlian OCR Medis & Analisis Laboratorium Fungsional.
Tugas Anda memeriksa gambar yang diunggah berupa:
1. Strip obat / blister kemasan / botol resep dokter, DAN/ATAU
2. Kertas hasil laboratorium luar (seperti Prodia, Pramita, RS, Kimia Farma, dll.).

Lakukan analisis mendalam:
1. EKSTRAKSI OBAT (Jika ada strip obat / resep):
   - "drug_name": Nama generik dan/atau merk dagang obat (cth: Amlodipine, Metformin, Omeprazole, Candesartan).
   - "dosage": Dosis persis (cth: 5 mg, 500 mg, 20 mg).
   - "frequency": Aturan pakai (cth: 1x sehari pagi, 2x1 sesudah makan).
   - "route": Rute pemberian (Oral, Injeksi, Topikal).
   - "indication": Indikasi klinis umum.
   - "potential_depletions": Mikronutrien tubuh yang terkuras akibat obat ini (Drug-Induced Nutrient Depletion). Contoh medis:
     * Amlodipine / CCB: Menguras CoQ10, Kalium, dan Magnesium intraseluler.
     * Metformin: Menguras Vitamin B12, Asam Folat, dan CoQ10.
     * Omeprazole / PPI: Menguras Magnesium, Kalsium, Seng (Zinc), Vitamin B12, dan Besi.
     * Statin (Atorvastatin/Simvastatin): Menguras CoQ10, Vitamin D, dan Selenium.
     * Diuretik (Furosemide/HCT): Menguras Kalium, Magnesium, Seng, Vitamin B1.
   - "herbal_contraindications": Bahan herbal yang dilarang/berisiko jika dikonsumsi berdekatan (interaksi sitokrom P450 atau efek aditif).

2. EKSTRAKSI LABORATORIUM FUNGSIONAL (Jika ada hasil lab):
   - Ekstrak setiap biomarker yang terbaca (cth: Fasting Glucose, HbA1c, SGOT/AST, SGPT/ALT, Ureum, Kreatinin, eGFR, Asam Urat, Profil Lipid, Leukosit, TSH, Ferritin, Vitamin D).
   - Nilai konvensional vs RENTANG OPTIMAL FUNGSIONAL (Functional Optimal Ranges):
     Rentang fungsional kedokteran integratif lebih ketat daripada rentang referensi patologis lab standar untuk deteksi dini disfungsi sebelum menjadi penyakit manifes:
     * Glukosa Puasa: Lab standar 70-100 mg/dL -> Optimal Fungsional: 75-86 mg/dL.
     * HbA1c: Lab standar < 5.7% -> Optimal Fungsional: 4.8 - 5.4%.
     * Ferritin: Lab standar 15-200 ng/mL -> Optimal Fungsional: 50 - 100 ng/mL (wanita) / 70 - 150 ng/mL (pria).
     * Vitamin D (25-OH): Lab standar > 30 ng/mL -> Optimal Fungsional: 50 - 80 ng/mL.
     * TSH: Lab standar 0.4 - 4.5 uIU/mL -> Optimal Fungsional: 1.0 - 2.0 uIU/mL.
     * hs-CRP: Lab standar < 1.0 mg/L -> Optimal Fungsional: < 0.5 mg/L.
     * Asam Urat: Lab standar 3.0 - 7.0 mg/dL -> Optimal Fungsional: 3.5 - 5.5 mg/dL.
     * SGPT/ALT: Lab standar 0 - 50 U/L -> Optimal Fungsional: 10 - 25 U/L.
   - "is_out_of_optimal_range": True jika biomarker keluar dari rentang fungsional optimal (meskipun masih berada di rentang normal lab standar!).
   - "flag": 'optimal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'critical'.
   - "clinical_significance": Implikasi fisiologis biomarker tersebut pada organ target pasien.

3. "summary": Ringkasan terpadu hasil pembacaan foto medis (tanpa menyebutkan identitas personal).
4. "high_priority_findings": Peringatan klinis prioritas tinggi yang memerlukan tindakan atau penyesuaian nutrisi segera.

ATURAN PRIVASI & DE-IDENTIFIKASI (MANDATORY):
- DILARANG KERAS mengekstrak atau menyertakan PII pasien maupun nakes (Nama Lengkap Pasien, NIK, No RM, No HP, Alamat, Tanggal Lahir, Nama Dokter) yang mungkin tercetak pada kop laboratorium atau label etiket obat.
- Jika terdapat foto wajah atau data non-medis pada berkas, abaikan dan jangan masukkan ke dalam JSON output.
- Hasilkan HANYA format JSON murni sesuai schema.`;

/**
 * Prompt User Pengarah Vision Scan
 */
export const SCAN_PRESCRIPTION_LAB_USER_PROMPT = `Periksa foto medis ini secara teliti. Jika terdapat kemasan atau strip obat dokter, ekstrak detail nama obat, dosis, frekuensi, serta deplesi nutrisi dan pantangan herbalnya. Jika terdapat lembar hasil lab luar, baca setiap nilai biomarker dan bandingkan dengan rentang fungsional optimal. Hasilkan JSON sesuai schema.`;

/**
 * Schema JSON Terstruktur untuk Response Gemini Scan Prescription / Lab
 */
export const SCAN_PRESCRIPTION_LAB_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scan_type: {
      type: Type.STRING,
      enum: ['prescription', 'lab_report', 'combined', 'unknown'],
      description: 'Jenis dokumen atau objek medis yang terdeteksi pada gambar.',
    },
    summary: {
      type: Type.STRING,
      description: 'Ringkasan klinis integratif dari temuan gambar.',
    },
    medications: {
      type: Type.ARRAY,
      description: 'Daftar obat dokter yang terbaca dari strip atau resep.',
      items: {
        type: Type.OBJECT,
        properties: {
          drug_name: { type: Type.STRING, description: 'Nama generik / paten obat.' },
          dosage: { type: Type.STRING, description: 'Dosis obat (misal 5mg, 500mg).' },
          frequency: { type: Type.STRING, description: 'Frekuensi aturan minum.' },
          route: { type: Type.STRING, description: 'Jalur pemberian (cth: Oral).' },
          indication: { type: Type.STRING, description: 'Indikasi / tujuan terapeutik obat.' },
          potential_depletions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Mikronutrien yang terkuras akibat konsumsi obat ini.',
          },
          herbal_contraindications: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Bahan herbal yang berinteraksi negatif atau dilarang.',
          },
        },
        required: ['drug_name', 'dosage', 'frequency'],
        propertyOrdering: ['drug_name', 'dosage', 'frequency', 'route', 'indication', 'potential_depletions', 'herbal_contraindications'],
      },
    },
    lab_results: {
      type: Type.ARRAY,
      description: 'Daftar biomarker hasil tes laboratorium luar.',
      items: {
        type: Type.OBJECT,
        properties: {
          test_name: { type: Type.STRING, description: 'Nama panel pemeriksaan (cth: Profil Lipid, Faal Ginjal).' },
          biomarker: { type: Type.STRING, description: 'Nama parameter biomarker (cth: Fasting Glucose, HbA1c).' },
          value: { type: Type.STRING, description: 'Nilai angka hasil pemeriksaan pasien.' },
          unit: { type: Type.STRING, description: 'Satuan pengukuran (cth: mg/dL, %, U/L).' },
          conventional_reference_range: { type: Type.STRING, description: 'Rentang nilai normal standar laboratorium.' },
          functional_optimal_range: { type: Type.STRING, description: 'Rentang kesehatan optimal fungsional (integratif).' },
          is_out_of_optimal_range: { type: Type.BOOLEAN, description: 'True jika hasil di luar rentang fungsional optimal.' },
          flag: {
            type: Type.STRING,
            enum: ['optimal', 'borderline_low', 'borderline_high', 'low', 'high', 'critical'],
            description: 'Status deviasi biomarker.',
          },
          clinical_significance: { type: Type.STRING, description: 'Makna fungsional terhadap kesehatan seluler/organ pasien.' },
        },
        required: ['biomarker', 'value', 'unit', 'conventional_reference_range', 'functional_optimal_range', 'is_out_of_optimal_range', 'flag', 'clinical_significance'],
        propertyOrdering: ['test_name', 'biomarker', 'value', 'unit', 'conventional_reference_range', 'functional_optimal_range', 'is_out_of_optimal_range', 'flag', 'clinical_significance'],
      },
    },
    high_priority_findings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Temuan paling penting yang memerlukan perhatian dokter praktisi.',
    },
  },
  required: ['scan_type', 'summary', 'medications', 'lab_results', 'high_priority_findings'],
  propertyOrdering: ['scan_type', 'summary', 'medications', 'lab_results', 'high_priority_findings'],
};
