import { BudgetTier } from './database';

/**
 * 7 Node Fungsional Kedokteran Integratif (Skor 0 - 100)
 */
export interface FunctionalNodes7 {
  assimilation: number;         // Pencernaan, penyerapan mikronutrien, disbiosis, leaky gut
  defense_repair: number;       // Respon imunologis, inflamasi sistemik, autoimunitas
  bioenergetics: number;        // Produksi ATP mitokondria, chronic fatigue, stres oksidatif
  biotransformation: number;    // Detoksifikasi fase I & II hati, ekskresi ginjal/empedu
  communication: number;        // Aksis HPA, kortisol/melatonin, tiroid, neurotransmitter
  transport_structural: number; // Sirkulasi kardiovaskular, mikrovaskular, integritas fascia & postural
  mental_emotional: number;     // Psiko-emosional, stres, trauma, koneksi mind-body
  [key: string]: number;
}

/**
 * Output JSON Terstruktur dari API Route 1: /api/ai/intake-audio
 */
export interface IntakeAudioResponse {
  summary: string;
  chief_complaints: string[];
  functional_nodes: FunctionalNodes7;
  timeline_triggers: string[];
}

/**
 * Data Ekstraksi Obat Dokter dari Strip Obat / Resep
 */
export interface ExtractedPrescriptionItem {
  drug_name: string;
  dosage: string;
  frequency: string;
  route?: string; // cth: Oral, Topikal
  indication?: string; // cth: Anti-hipertensi, PPI pengurang asam lambung
  potential_depletions?: string[]; // Nutrien yang terkuras (cth: CoQ10, Kalium, Vit B12)
  herbal_contraindications?: string[]; // Herbal yang pantang dikonsumsi bersamaan
}

/**
 * Data Hasil Laboratorium dengan Rentang Optimal Fungsional
 */
export interface ExtractedLabItem {
  test_name?: string;
  biomarker: string; // cth: Ferritin, HbA1c, Fasting Glucose, TSH, eGFR
  value: string | number;
  unit: string;
  conventional_reference_range: string; // Rentang patologis standar lab luar
  functional_optimal_range: string;     // Rentang fungsional optimal (integratif)
  is_out_of_optimal_range: boolean;     // Apakah keluar dari rentang fungsional optimal
  flag: 'optimal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'critical';
  clinical_significance: string;        // Dampak pada sistem fungsional tubuh
}

/**
 * Output JSON Terstruktur dari API Route 2: /api/ai/scan-prescription-lab
 */
export interface ScanPrescriptionLabResponse {
  scan_type: 'prescription' | 'lab_report' | 'combined' | 'unknown';
  summary: string;
  medications: ExtractedPrescriptionItem[];
  lab_results: ExtractedLabItem[];
  high_priority_findings: string[];
}

/**
 * Item Keselamatan Obat vs Herbal (Drug-Herb Safety)
 */
export interface DrugHerbSafetyItem {
  drug_name: string;
  depleted_nutrients: string[];
  dangerous_interactions: string[];
  safety_buffer_rule: string; // e.g. "Wajib jeda minimal 120 menit setelah minum obat ini"
  clinical_mechanism: string;
}

/**
 * Item Smart Swap Nusantara (Konversi Suplemen Mahal ke Herbal Dapur TOGA Lokal)
 */
export interface SmartSwapNusantaraItem {
  expensive_supplement_reference: string; // e.g. "L-Glutamine Powder 5000mg" atau "Berberine HCL"
  active_compound: string;                // e.g. "Mucilaginous polysaccharide", "Alkaloid isoquinoline"
  local_herb_name: string;                // e.g. "Pati Garut (Maranta arundinacea)" atau "Brotowali"
  local_latin_name: string;
  kitchen_dosage: string;                 // Takaran sendok/dapur: "1 sdm dilarutkan dalam 150ml air hangat"
  preparation_method: string;             // Cara racik: "Rebus perlahan dengan api lilin..."
  therapeutic_rationale: string;          // Alasan medis integratif
  estimated_cost_per_week_idr: number;    // Estimasi biaya per minggu (IDR)
}

/**
 * Item Titik Totok Saraf & Akupresur Berdasarkan Node Disfungsi Dominan
 */
export interface AcupressurePointRecommendation {
  code: string;                           // e.g. "ST36", "PC6", "LI4", "GV20", "LR3", "SP6"
  indonesian_name: string;                // e.g. "Zusanli (Kaki Tiga Mil)"
  anatomical_location: string;            // Lokasi anatomi mudah dipahami pasien
  target_functional_node: keyof FunctionalNodes7;
  target_organ_or_system: string;         // e.g. "Lambung & Saraf Vagus", "Modulasi Aksis HPA"
  pressure_technique: string;             // e.g. "Tekan memutar searah jarum jam 30 putaran..."
  recommended_duration_seconds: number;   // Durasi rekomendasi dalam detik
}

/**
 * Payload Request untuk API Route 3: /api/ai/generate-protocol
 */
export interface GenerateProtocolRequest {
  functional_nodes: FunctionalNodes7;
  active_medications: Array<{
    drug_name: string;
    dosage?: string;
    frequency?: string;
  }>;
  budget_preference: BudgetTier | 'kitchen_herbs' | 'supplements' | 'modern_supplements' | 'local_extract';
  patient_context?: {
    age?: number;
    gender?: 'male' | 'female';
    chief_complaints?: string[];
    timeline_triggers?: string[];
    practitioner_notes?: string;
  };
}

/**
 * Output JSON Terstruktur dari API Route 3: /api/ai/generate-protocol
 */
export interface GenerateProtocolResponse {
  protocol_summary: string;
  dominant_dysfunctional_nodes: Array<{
    node: keyof FunctionalNodes7;
    score: number;
    explanation: string;
  }>;
  drug_herb_safety: DrugHerbSafetyItem[];
  smart_swap_nusantara: SmartSwapNusantaraItem[];
  acupressure_points: AcupressurePointRecommendation[];
  daily_schedule: Array<{
    time_slot: string; // e.g. "07:00 WIB", "09:00 WIB"
    activity: string;
    type: 'medication' | 'safety_buffer' | 'kitchen_herb' | 'acupressure' | 'nutrition';
    instruction: string;
  }>;
}
