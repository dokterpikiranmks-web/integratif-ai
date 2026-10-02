import { Type } from '@google/genai';
import { FunctionalNodes7 } from '@/types/ai';

/**
 * System Instruction untuk AI Pembuat Protokol Integratif & Totok Saraf Nusantara
 */
export const GENERATE_PROTOCOL_SYSTEM_INSTRUCTION = `Anda adalah Dokter Spesialis Kedokteran Integratif & Akupunktur/Totok Saraf Nusantara berlisensi klinis.
Tugas Anda merancang Protokol Terapi Integratif Berbasis Bukti (Evidence-Based Integrative Protocol) yang dipersonalisasi untuk pasien berdasarkan:
1. Skor 7 Node Fungsional Root-Cause (0-100: assimilation, defense_repair, bioenergetics, biotransformation, communication, transport_structural, mental_emotional).
2. Daftar obat kimia resep dokter yang aktif dikonsumsi pasien.
3. Preferensi budget pasien ('kitchen_herbs' = Herbal Dapur Nusantara Murah, 'local_extract' = Ekstrak Kapsul Fitofarmaka Lokal, 'modern_supplements' = Suplemen Impor Modern).

PROTOKOL ANDA HARUS MEMILIKI 3 PILAR WAJIB:

PILAR 1: DRUG-HERB SAFETY & DEPLESI NUTRISI (Keselamatan Farmakologis Kritis)
- Identifikasi setiap obat dokter yang diminum pasien.
- KASUS EKSTREM ANTIKOAGULAN / ANTIPLATELET (Warfarin, Aspirin, Clopidogrel, dll):
  * DILARANG KERAS & KUNCI herbal pengencer darah (Ginkgo Biloba, Bawang Putih konsentrat/dosis tinggi, Kurkumin/Kunyit dosis tinggi >1000mg, Jahe Merah dosis tinggi) karena risiko perdarahan internal fatal dan instabilitas INR.
- KASUS EKSTREM ANTIHIPERTENSI (Amlodipine, Captopril, Lisinopril, Losartan, dll):
  * Terapkan ZONA JEDA KEAMANAN WAJIB 120 MENIT (2 jam) dari jadwal obat dokter guna mencegah kompetisi enzim Sitokrom P450 (CYP3A4/CYP2C9) dan hipotensi ortostatik mendadak.
  * Wajib tandai deplesi mineral intraseluler (Amlodipine menguras CoQ10, Kalium, Magnesium; Captopril menguras Zinc & Zat Besi).
- Jelaskan mekanisme "Drug-Induced Nutrient Depletion" untuk obat lain (Metformin menguras Vitamin B12; Omeprazole/PPI menguras Magnesium, B12, Zinc; Statin menguras CoQ10 & Vitamin D).
- Berikan aturan "Zona Jeda Keamanan (Safety Buffer Rule)": Pasien WAJIB memberi jeda waktu minimal 120 menit (2 jam) antara konsumsi obat dokter dan ramuan herbal guna mencegah kompetisi metabolisme enzim hati.

PILAR 2: SMART SWAP NUSANTARA (Substitusi Suplemen Mahal ke Herbal Dapur TOGA Lokal)
- Wajib prioritaskan herbal lokal Nusantara yang mudah didapat di pasar tradisional / warung sayur:
  * Temulawak (Curcuma xanthorrhiza): Mengandung xanthorrhizol & kurkuminoid untuk perlindungan empedu & detoksifikasi fase II hati.
  * Pati Garut (Maranta arundinacea): Mengandung pati resisten alami pelapis mukosa lambung & leaky gut, menggantikan bubuk L-Glutamine impor yang mahal.
  * Brotowali (Tinospora crispa): Mengandung alkaloid isoquinoline & tinokrisposid untuk stimulasi AMPK & sensitivitas insulin, alternatif cerdas untuk suplemen Berberine impor.
  * Daun Salam (Syzygium polyanthum): Kaya flavonoid untuk ekskresi asam urat & proteksi endotel pembuluh darah, alternatif pengganti ekstrak Tart Cherry / Celery seed impor.
  * Kelor (Moringa oleifera): Superfood densitas mikronutrien tinggi (asam amino, mineral, antioksidan), alternatif pengganti multivitamin sintetis tablet.
  * Kunyit (Curcuma longa), Jahe Merah (Zingiber officinale var. rubrum), Kayu Manis (Cinnamomum burmannii), Pegagan (Centella asiatica), Kumis Kucing (Orthosiphon aristatus).
- Gunakan takaran dapur rumah tangga yang mudah dipahami pasien awam: sendok makan (sdm), sendok teh (sdt), ruas jari, jempol tangan, lembar daun, gelas belimbing (200-250 ml).
- Cantumkan resep cara pengolahan yang aman (cth: rebusan api lilin, seduhan air panas, bubur pati garut).
- Berikan estimasi biaya mingguan yang sangat terjangkau (Rp 15.000 - Rp 35.000 / minggu) dibandingkan suplemen impor (Rp 300.000 - Rp 700.000 / botol).

PILAR 3: TITIK TOTOK SARAF & AKUPRESUR TERPILIH
- Pilih 3 hingga 5 titik stimulasi saraf akupresur spesifik yang berkorelasi langsung dengan node disfungsi dominan (node dengan skor tertinggi pada pasien).
- Contoh titik meridian teruji:
  * ST36 (Zusanli) - Node Asimilasi & Bioenergetika: Modulasi nervus vagus, penguatan motilitas lambung.
  * PC6 (Neiguan) - Node Asimilasi & Komunikasi: Meredakan dispepsia, mual, regulasi detak jantung simpatis.
  * LI4 (Hegu) - Node Transport/Struktural: Melancarkan mikrovaskular kepala, redakan tensi servikal & nyeri.
  * GV20 (Baihui) - Node Mental-Emosional & Komunikasi: Menenangkan pikiran, mengatasi insomnia, modulasi kortisol.
  * LR3 (Taichong) - Node Biotransformasi: Melancarkan sirkulasi energi hati, redakan stres dan tensi tinggi.
  * SP6 (Sanyinjiao) - Node Komunikasi & Asimilasi: Keseimbangan cairan, endokrin, dan ketenangan tidur.
  * BL23 (Shenshu) - Node Bioenergetika: Penguatan vitalitas ginjal, pegal pinggang, kelelahan kronis.
- Tuliskan nama internasional (kode) dan nama Indonesia, lokasi anatomi yang jelas, teknik penekanan (memutar searah jarum jam untuk tonifikasi atau tekanan ritmis 2-3 menit), serta target fisiologisnya.

JADWAL HARIAN TERPADU:
- Rangkai jadwal harian pasien (pagi, siang, sore, malam) yang mengilustrasikan urutan minum obat dokter, jeda timer 120 menit, minum ramuan herbal, dan waktu penotokan saraf mandiri.

PENTING:
- Keluarkan HANYA JSON valid yang mematuhi schema response.`;

/**
 * Prompt User untuk Pembuatan Protokol Integratif
 */
export function buildGenerateProtocolUserPrompt(data: {
  functional_nodes: FunctionalNodes7 | Record<string, number>;
  active_medications: Array<{ drug_name: string; dosage?: string; frequency?: string }>;
  budget_preference: string;
  patient_context?: {
    age?: number;
    gender?: string;
    chief_complaints?: string[];
    timeline_triggers?: string[];
    practitioner_notes?: string;
  };
}): string {
  // Format konteks pasien secara eksplisit (strictly non-PII: hanya umur, gender biologis, keluhan, dan token anonim)
  let formattedContext = '';
  if (data.patient_context) {
    const ctx = data.patient_context;
    const parts: string[] = [];
    if (ctx.age) parts.push(`- Umur Pasien: ${ctx.age} tahun`);
    if (ctx.gender) parts.push(`- Gender Biologis: ${ctx.gender}`);
    if (ctx.chief_complaints && ctx.chief_complaints.length > 0) {
      parts.push(`- Riwayat Keluhan Teranonimkan: ${ctx.chief_complaints.join(', ')}`);
    }
    if (ctx.timeline_triggers && ctx.timeline_triggers.length > 0) {
      parts.push(`- Faktor Pemicu/Triggers: ${ctx.timeline_triggers.join(', ')}`);
    }
    if (ctx.practitioner_notes) {
      parts.push(`- Catatan Klinis: ${ctx.practitioner_notes}`);
    }
    if (parts.length > 0) {
      formattedContext = `KONTEKS PASIEN (DATA MEDIS TERANONIMKAN):\n${parts.join('\n')}\n`;
    }
  }

  return `Buatkan usulan protokol integratif personal untuk pasien berikut:

DATA 7 NODE FUNGSIONAL ROOT-CAUSE:
${JSON.stringify(data.functional_nodes, null, 2)}

DAFTAR OBAT DOKTER AKTIF:
${data.active_medications.length > 0 
  ? data.active_medications.map(m => `- ${m.drug_name} (${m.dosage || 'dosis standar'}, ${m.frequency || 'rutin'})`).join('\n')
  : '- Tidak ada obat kimia aktif'}

PREFERENSI BUDGET:
${data.budget_preference === 'kitchen_herbs' 
  ? 'Herbal Dapur Nusantara (Prioritaskan bumbu dapur TOGA lokal murah meriah: temulawak, pati garut, brotowali, daun salam, kelor)' 
  : data.budget_preference === 'local_extract' 
  ? 'Ekstrak Fitofarmaka Lokal (kapsul ekstrak terstandarisasi industri jamu Indonesia)' 
  : 'Suplemen Modern / Nutrasetika'}

${formattedContext}
Hasilkan usulan protokol integratif lengkap dengan 3 pilar wajib (Drug-Herb Safety, Smart Swap Nusantara, Titik Totok Saraf) dan jadwal harian sinkronisasi dalam format JSON murni.`;
}

/**
 * Schema JSON Terstruktur untuk Response Gemini Generate Protocol
 */
export const GENERATE_PROTOCOL_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    protocol_summary: {
      type: Type.STRING,
      description: 'Ringkasan narasi protokol integratif yang dirancang untuk pasien.',
    },
    dominant_dysfunctional_nodes: {
      type: Type.ARRAY,
      description: 'Daftar node fungsional dengan skor tertinggi yang menjadi fokus terapi.',
      items: {
        type: Type.OBJECT,
        properties: {
          node: { type: Type.STRING, description: 'Nama key node (cth: assimilation, transport_structural).' },
          score: { type: Type.INTEGER, description: 'Skor disfungsi (0-100).' },
          explanation: { type: Type.STRING, description: 'Penjelasan mengapa node ini terganggu dan dampaknya.' },
        },
        required: ['node', 'score', 'explanation'],
        propertyOrdering: ['node', 'score', 'explanation'],
      },
    },
    drug_herb_safety: {
      type: Type.ARRAY,
      description: 'Pilar 1: Analisis keamanan obat dokter vs herbal & deplesi nutrisi.',
      items: {
        type: Type.OBJECT,
        properties: {
          drug_name: { type: Type.STRING, description: 'Nama obat dokter.' },
          depleted_nutrients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Nutrien yang terkuras akibat obat ini.',
          },
          dangerous_interactions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Interaksi obat-herbal berbahaya yang harus dihindari.',
          },
          safety_buffer_rule: {
            type: Type.STRING,
            description: 'Aturan jeda waktu aman konsumsi (wajib 120 menit).',
          },
          clinical_mechanism: {
            type: Type.STRING,
            description: 'Mekanisme biologis interaksi (cth: enzim CYP450).',
          },
        },
        required: ['drug_name', 'depleted_nutrients', 'dangerous_interactions', 'safety_buffer_rule', 'clinical_mechanism'],
        propertyOrdering: ['drug_name', 'depleted_nutrients', 'dangerous_interactions', 'safety_buffer_rule', 'clinical_mechanism'],
      },
    },
    smart_swap_nusantara: {
      type: Type.ARRAY,
      description: 'Pilar 2: Smart Swap suplemen mahal ke herbal dapur lokal Nusantara.',
      items: {
        type: Type.OBJECT,
        properties: {
          expensive_supplement_reference: {
            type: Type.STRING,
            description: 'Suplemen modern/impor yang mahal (cth: L-Glutamine 5000mg, Berberine HCL).',
          },
          active_compound: {
            type: Type.STRING,
            description: 'Senyawa aktif biologis (cth: Mucilaginous polysacharides, Curcuminoids).',
          },
          local_herb_name: {
            type: Type.STRING,
            description: 'Nama lokal herbal dapur (cth: Pati Garut, Temulawak, Brotowali, Daun Salam, Kelor).',
          },
          local_latin_name: {
            type: Type.STRING,
            description: 'Nama ilmiah/Latin tanaman herbal.',
          },
          kitchen_dosage: {
            type: Type.STRING,
            description: 'Takaran sendok dapur rumah tangga (cth: 1 sdm diseduh 200ml air hangat).',
          },
          preparation_method: {
            type: Type.STRING,
            description: 'Cara pembuatan/racikan di rumah.',
          },
          therapeutic_rationale: {
            type: Type.STRING,
            description: 'Alasan ilmiah fungsional pemilihan herbal ini.',
          },
          estimated_cost_per_week_idr: {
            type: Type.INTEGER,
            description: 'Estimasi pengeluaran per minggu dalam rupiah (IDR).',
          },
        },
        required: [
          'expensive_supplement_reference',
          'active_compound',
          'local_herb_name',
          'local_latin_name',
          'kitchen_dosage',
          'preparation_method',
          'therapeutic_rationale',
          'estimated_cost_per_week_idr',
        ],
        propertyOrdering: [
          'expensive_supplement_reference',
          'active_compound',
          'local_herb_name',
          'local_latin_name',
          'kitchen_dosage',
          'preparation_method',
          'therapeutic_rationale',
          'estimated_cost_per_week_idr',
        ],
      },
    },
    acupressure_points: {
      type: Type.ARRAY,
      description: 'Pilar 3: Titik totok saraf dan akupresur untuk node disfungsi dominan.',
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: 'Kode standar internasional titik (cth: ST36, PC6, LI4, GV20).' },
          indonesian_name: { type: Type.STRING, description: 'Nama Indonesia / nama umum titik akupresur.' },
          anatomical_location: { type: Type.STRING, description: 'Petunjuk lokasi anatomi tubuh yang jelas.' },
          target_functional_node: { type: Type.STRING, description: 'Node fungsional utama yang ditargetkan.' },
          target_organ_or_system: { type: Type.STRING, description: 'Organ atau jalur saraf target (cth: Nervus Vagus).' },
          pressure_technique: { type: Type.STRING, description: 'Cara penekanan / pemijatan titik.' },
          recommended_duration_seconds: { type: Type.INTEGER, description: 'Durasi penekanan dalam detik (misal 120-180 detik).' },
        },
        required: [
          'code',
          'indonesian_name',
          'anatomical_location',
          'target_functional_node',
          'target_organ_or_system',
          'pressure_technique',
          'recommended_duration_seconds',
        ],
        propertyOrdering: [
          'code',
          'indonesian_name',
          'anatomical_location',
          'target_functional_node',
          'target_organ_or_system',
          'pressure_technique',
          'recommended_duration_seconds',
        ],
      },
    },
    daily_schedule: {
      type: Type.ARRAY,
      description: 'Jadwal rutinitas terpadu harian pasien.',
      items: {
        type: Type.OBJECT,
        properties: {
          time_slot: { type: Type.STRING, description: 'Waktu pelaksanaan (cth: 07:00 WIB, 09:00 WIB).' },
          activity: { type: Type.STRING, description: 'Nama kegiatan/aksi terapeutik.' },
          type: {
            type: Type.STRING,
            enum: ['medication', 'safety_buffer', 'kitchen_herb', 'acupressure', 'nutrition'],
            description: 'Jenis aksi.',
          },
          instruction: { type: Type.STRING, description: 'Instruksi jelas untuk pasien di rumah.' },
        },
        required: ['time_slot', 'activity', 'type', 'instruction'],
        propertyOrdering: ['time_slot', 'activity', 'type', 'instruction'],
      },
    },
  },
  required: [
    'protocol_summary',
    'dominant_dysfunctional_nodes',
    'drug_herb_safety',
    'smart_swap_nusantara',
    'acupressure_points',
    'daily_schedule',
  ],
  propertyOrdering: [
    'protocol_summary',
    'dominant_dysfunctional_nodes',
    'drug_herb_safety',
    'smart_swap_nusantara',
    'acupressure_points',
    'daily_schedule',
  ],
};
