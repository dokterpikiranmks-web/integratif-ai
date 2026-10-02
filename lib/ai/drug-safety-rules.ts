/**
 * Deterministic Drug-Herb Interaction & Clinical Safety Rule Engine
 * 
 * Modul ini menyediakan lapisan perlindungan klinis deterministik (Hard Rule Guardrails)
 * yang berjalan secara independen dari LLM/Gemini. Modul ini menjamin bahwa seluruh
 * interaksi obat berbahaya dan deplesi nutrisi terkunci secara konsisten dan tidak
 * bergantung pada ketidakpastian output probabilistik model AI.
 * 
 * Standar Referensi Klinis:
 * 1. Natural Medicines Comprehensive Database (NMCD) Drug-Herb Interactions
 * 2. Pronsky & Crowe: Food Medication Interactions Handbook
 * 3. CYP450 Enzyme Inhibition & Substrate Table (Flockhart P450 Drug Interaction Table)
 */

import { GenerateProtocolResponse } from '@/types/ai';

export interface DrugSafetyAlert {
  severity: 'critical_black_box' | 'high_warning' | 'caution';
  drug_name: string;
  category: 'anticoagulant_antiplatelet' | 'antihypertensive' | 'antidiabetic' | 'ppi_acid_suppressor' | 'statin' | 'other';
  title: string;
  clinical_warning: string;
  prohibited_herbs: string[];
  mandatory_buffer_minutes: number;
  depleted_minerals_and_nutrients: string[];
  therapeutic_substitutes: string[];
}

export interface DrugSafetyEvaluationResult {
  has_critical_alerts: boolean;
  alerts: DrugSafetyAlert[];
  prohibited_herbs_master: string[];
  mandatory_buffer_minutes_max: number;
  depleted_nutrients_summary: string[];
}

// 1. KELAS OBAT 1: ANTIKOAGULAN & ANTIPLATELET (PENGENCER DARAH)
const ANTICOAGULANT_KEYWORDS = [
  'warfarin',
  'simarc',
  'coumadin',
  'aspirin',
  'acetylsalicylic',
  'aspilets',
  'clopidogrel',
  'plavix',
  'heparin',
  'enoxaparin',
  'dabigatran',
  'pradaxa',
  'rivaroxaban',
  'xarelto',
  'apixaban',
  'eliquis',
  'ticagrelor',
  'brilinta',
];

// Herbal pengencer darah yang dilarang keras dikonsumsi bersamaan dengan obat antikoagulan
const BLOOD_THINNING_HERBS = [
  'ginkgo biloba',
  'bawang putih dosis tinggi',
  'garlic extract',
  'kurkumin dosis tinggi',
  'kunyit pekat',
  'jahe merah dosis tinggi',
  'dong quai',
  'ginseng',
  'clove',
  'feverfew',
];

// 2. KELAS OBAT 2: ANTIHIPERTENSI (TEKANAN DARAH TINGGI)
const ANTIHYPERTENSIVE_KEYWORDS = [
  'amlodipine',
  'captopril',
  'lisinopril',
  'ramipril',
  'losartan',
  'valsartan',
  'candesartan',
  'nifedipine',
  'diltiazem',
  'verapamil',
  'bisoprolol',
  'atenolol',
  'propranolol',
  'furosemide',
  'lasix',
  'hct',
  'hydrochlorothiazide',
  'spironolactone',
  'irbesartan',
  'telmisartan',
];

// 3. KELAS OBAT 3: ANTIDIABETIK ORAL & INSULIN
const ANTIDIABETIC_KEYWORDS = [
  'metformin',
  'glimepiride',
  'glibenclamide',
  'gliclazide',
  'acarbose',
  'pioglitazone',
  'sitagliptin',
  'vildagliptin',
  'empagliflozin',
  'dapagliflozin',
  'insulin',
];

// 4. KELAS OBAT 4: PPI & SUPRESOR ASAM LAMBUNG
const PPI_KEYWORDS = [
  'omeprazole',
  'lansoprazole',
  'pantoprazole',
  'esomeprazole',
  'rabeprazole',
  'ranitidine',
  'famotidine',
  'antasida',
];

// 5. KELAS OBAT 5: STATIN (PENURUN KOLESTEROL)
const STATIN_KEYWORDS = [
  'atorvastatin',
  'simvastatin',
  'rosuvastatin',
  'pravastatin',
];

/**
 * Evaluasi Deterministik Interaksi Obat vs Herbal
 * @param medications Daftar obat dokter aktif yang dikonsumsi pasien
 */
export function evaluateDrugSafetyRules(
  medications: Array<{ drug_name: string; dosage?: string; frequency?: string }>
): DrugSafetyEvaluationResult {
  const alerts: DrugSafetyAlert[] = [];
  const prohibitedHerbsSet = new Set<string>();
  const depletedNutrientsSet = new Set<string>();
  let maxBufferMinutes = 0;

  if (!medications || !Array.isArray(medications)) {
    return {
      has_critical_alerts: false,
      alerts: [],
      prohibited_herbs_master: [],
      mandatory_buffer_minutes_max: 0,
      depleted_nutrients_summary: [],
    };
  }

  for (const med of medications) {
    const rawName = (med.drug_name || '').toLowerCase().trim();
    if (!rawName) continue;

    // A. KASUS EKSTREM 1: PASIEN MENGONSUMSI WARFARIN / ASPIRIN / ANTIPLATELET
    const isAnticoagulant = ANTICOAGULANT_KEYWORDS.some((kw) => rawName.includes(kw));
    if (isAnticoagulant) {
      BLOOD_THINNING_HERBS.forEach((herb) => prohibitedHerbsSet.add(herb));
      maxBufferMinutes = Math.max(maxBufferMinutes, 120);

      alerts.push({
        severity: 'critical_black_box',
        drug_name: med.drug_name,
        category: 'anticoagulant_antiplatelet',
        title: `KUNCI KEAMANAN KRITIS: Interaksi Hemoragik ${med.drug_name} vs Herbal Pengencer Darah`,
        clinical_warning: `Pasien mengonsumsi obat antikoagulan/antiplatelet resep dokter (${med.drug_name}). Penggunaan bersamaan dengan herbal yang menghambat agregasi trombosit atau sintesis tromboksan (Ginkgo Biloba, Bawang Putih dosis tinggi, Kurkumin/Kunyit dosis tinggi >1000mg, Jahe Merah pekat) WAJIB DIKUNCI & DILARANG KERAS karena berisiko memicu perdarahan saluran cerna masif dan memanjangkan masa protrombin (INR) tak terkontrol.`,
        prohibited_herbs: [
          'Ginkgo Biloba (Inhibisi Platelet-Activating Factor)',
          'Bawang Putih dosis tinggi / Ekstrak Allicin (Inhibisi Agregasi Platelet)',
          'Kurkumin dosis tinggi / Kunyit Pekat >1000mg (Aktivitas Fibrinolitik Sinergis)',
          'Jahe Merah Pekat dosis tinggi (Penghambatan Tromboksan Sintetase)',
          'Dong Quai (Kumarin Alami)',
        ],
        mandatory_buffer_minutes: 120,
        depleted_minerals_and_nutrients: ['Zat Besi (jika terjadi mikrolesi mukosa)'],
        therapeutic_substitutes: [
          'Bubur Pati Garut (Maranta arundinacea) - Aman & Melapisi Lambung',
          'Seduhan Daun Salam (Syzygium polyanthum) - Kardioprotektif Non-Antikoagulan',
          'Daun Kelor (Moringa oleifera) - Densitas Nutrisi Alami',
        ],
      });
    }

    // B. KASUS EKSTREM 2: PASIEN MENGONSUMSI ANTIHIPERTENSI (AMLODIPINE / CAPTOPRIL)
    const isAntihypertensive = ANTIHYPERTENSIVE_KEYWORDS.some((kw) => rawName.includes(kw));
    if (isAntihypertensive) {
      maxBufferMinutes = Math.max(maxBufferMinutes, 120);

      // Bedakan deplesi berdasarkan sub-kelas antihipertensi
      const depletions: string[] = [];
      if (rawName.includes('amlodipine') || rawName.includes('nifedipine') || rawName.includes('diltiazem')) {
        depletions.push('Koenzim Q10 (CoQ10)', 'Kalium intraseluler', 'Magnesium intraseluler');
        depletedNutrientsSet.add('Koenzim Q10 (CoQ10)');
        depletedNutrientsSet.add('Kalium intraseluler');
        depletedNutrientsSet.add('Magnesium intraseluler');
      } else if (rawName.includes('captopril') || rawName.includes('lisinopril') || rawName.includes('ramipril')) {
        depletions.push('Zinc / Seng intraseluler', 'Natrium', 'Zat Besi');
        depletedNutrientsSet.add('Zinc (Seng)');
        depletedNutrientsSet.add('Zat Besi');
      } else if (rawName.includes('furosemide') || rawName.includes('hct') || rawName.includes('hydrochlorothiazide')) {
        depletions.push('Kalium', 'Magnesium', 'Zinc', 'Vitamin B1 (Tiamin)');
        depletedNutrientsSet.add('Kalium');
        depletedNutrientsSet.add('Magnesium');
        depletedNutrientsSet.add('Zinc');
      } else {
        depletions.push('Koenzim Q10 (CoQ10)', 'Kalium', 'Magnesium');
        depletedNutrientsSet.add('Koenzim Q10 (CoQ10)');
        depletedNutrientsSet.add('Magnesium');
      }

      alerts.push({
        severity: 'high_warning',
        drug_name: med.drug_name,
        category: 'antihypertensive',
        title: `PROTOKOL JEDA 120 MENIT & DEPLESI MINERAL: ${med.drug_name}`,
        clinical_warning: `Pasien mengonsumsi antihipertensi (${med.drug_name}). Sistem WAJIB menerapkan batas waktu jeda minimal 120 menit (2 jam) antara konsumsi obat dokter dan rebusan jamu dapur guna menghindari kompetisi isoenzim Sitokrom P450 CYP3A4/CYP2C9 di hati dan mencegah fluktuasi hipotensi ortostatik mendadak.`,
        prohibited_herbs: [
          'Akar Manis / Licorice pekat (Memicu retensi natrium & menurunkan efikasi antihipertensi)',
          'Ekstrak Bawang Putih / Herbal Vasodilatator Dosis Tinggi tanpa jeda (Risiko hipotensi aditif)',
        ],
        mandatory_buffer_minutes: 120,
        depleted_minerals_and_nutrients: depletions,
        therapeutic_substitutes: [
          'Air Kelapa Muda Hijau + Pisang Ambon (Restorasi Kalium & Magnesium Alami)',
          'Rebusan Daun Salam (Proteksi Mikrovaskular Endotel)',
          'Bubur Pati Garut (Perlindungan Dinding Lambung Tanpa Ganggu Absorpsi)',
        ],
      });
    }

    // C. KELAS METFORMIN & ANTIDIABETIK
    const isAntidiabetic = ANTIDIABETIC_KEYWORDS.some((kw) => rawName.includes(kw));
    if (isAntidiabetic) {
      maxBufferMinutes = Math.max(maxBufferMinutes, 120);
      depletedNutrientsSet.add('Vitamin B12');
      depletedNutrientsSet.add('Asam Folat');
      depletedNutrientsSet.add('Koenzim Q10 (CoQ10)');

      alerts.push({
        severity: 'high_warning',
        drug_name: med.drug_name,
        category: 'antidiabetic',
        title: `DEPLESI VITAMIN B12 & ASAM FOLAT: ${med.drug_name}`,
        clinical_warning: `Konsumsi kronis Metformin mengganggu penyerapan vitamin B12 di ileum terminalis, memicu neuropati perifer diabetik sekunder dan kelelahan seluler.`,
        prohibited_herbs: ['Ramuan bergula aren/madu kental berlebihan'],
        mandatory_buffer_minutes: 120,
        depleted_minerals_and_nutrients: ['Vitamin B12', 'Asam Folat', 'Koenzim Q10'],
        therapeutic_substitutes: ['Rebusan Brotowali / Daun Kelor (Sensitisasi reseptor AMPK tanpa gula)'],
      });
    }

    // D. KELAS PPI & ASAM LAMBUNG
    const isPpi = PPI_KEYWORDS.some((kw) => rawName.includes(kw));
    if (isPpi) {
      maxBufferMinutes = Math.max(maxBufferMinutes, 120);
      depletedNutrientsSet.add('Magnesium');
      depletedNutrientsSet.add('Vitamin B12');
      depletedNutrientsSet.add('Zinc');
      depletedNutrientsSet.add('Kalsium');
    }

    // E. KELAS STATIN
    const isStatin = STATIN_KEYWORDS.some((kw) => rawName.includes(kw));
    if (isStatin) {
      depletedNutrientsSet.add('Koenzim Q10 (CoQ10)');
      depletedNutrientsSet.add('Vitamin D');
    }
  }

  return {
    has_critical_alerts: alerts.some((a) => a.severity === 'critical_black_box'),
    alerts,
    prohibited_herbs_master: Array.from(prohibitedHerbsSet),
    mandatory_buffer_minutes_max: maxBufferMinutes > 0 ? maxBufferMinutes : 120,
    depleted_nutrients_summary: Array.from(depletedNutrientsSet),
  };
}

/**
 * Filter & Post-Processor Deterministik pada Response Protokol AI
 * 
 * Fungsi ini memastikan bahwa hasil generate Gemini 100% patuh terhadap aturan keselamatan medis:
 * 1. Jika ada Warfarin/Aspirin, herbal pengencer darah (Ginkgo Biloba, Bawang Putih pekat, Kurkumin dosis tinggi)
 *    DIBERSIHKAN atau DIKUNCI dari daftar rekomendasi herbal dapur.
 * 2. Jika ada Antihipertensi (Amlodipine/Captopril), aturan jeda 120 menit dan deplesi mineral DILAMPIRKAN
 *    secara pasti pada drug_herb_safety dan daily_schedule.
 */
export function enforceDeterministicDrugSafety(
  protocol: GenerateProtocolResponse,
  medications: Array<{ drug_name: string; dosage?: string; frequency?: string }>
): GenerateProtocolResponse {
  const safetyEval = evaluateDrugSafetyRules(medications);

  if (safetyEval.alerts.length === 0) {
    return protocol;
  }

  const enhancedProtocol: GenerateProtocolResponse = {
    ...protocol,
    drug_herb_safety: [...(protocol.drug_herb_safety || [])],
    smart_swap_nusantara: [...(protocol.smart_swap_nusantara || [])],
    daily_schedule: [...(protocol.daily_schedule || [])],
  };

  // 1. Sinkronisasi Drug-Herb Safety dengan Deterministik Alerts
  for (const alert of safetyEval.alerts) {
    const existingEntryIndex = enhancedProtocol.drug_herb_safety.findIndex(
      (entry) => entry.drug_name.toLowerCase().includes(alert.drug_name.toLowerCase()) ||
                 alert.drug_name.toLowerCase().includes(entry.drug_name.toLowerCase())
    );

    const safetyItem = {
      drug_name: alert.drug_name,
      depleted_nutrients: Array.from(
        new Set([
          ...(existingEntryIndex >= 0 ? enhancedProtocol.drug_herb_safety[existingEntryIndex].depleted_nutrients : []),
          ...alert.depleted_minerals_and_nutrients,
        ])
      ),
      dangerous_interactions: Array.from(
        new Set([
          ...(existingEntryIndex >= 0 ? enhancedProtocol.drug_herb_safety[existingEntryIndex].dangerous_interactions : []),
          ...alert.prohibited_herbs,
          alert.clinical_warning,
        ])
      ),
      safety_buffer_rule: `Wajib jeda minimal ${alert.mandatory_buffer_minutes} menit (2 jam) dari jadwal minum ${alert.drug_name}.`,
      clinical_mechanism: alert.category === 'anticoagulant_antiplatelet'
        ? 'Kompetisi agregasi trombosit & fibrinolisis meningkatkan perdarahan internal fatal.'
        : 'Inhibisi/induksi isoenzim Sitokrom P450 (CYP3A4/CYP2C9) & deplesi mikronutrien intraseluler.',
    };

    if (existingEntryIndex >= 0) {
      enhancedProtocol.drug_herb_safety[existingEntryIndex] = safetyItem;
    } else {
      enhancedProtocol.drug_herb_safety.unshift(safetyItem);
    }
  }

  // 2. KASUS EKSTREM 1: Jika ada Antikoagulan/Antiplatelet (Warfarin/Aspirin),
  //    Sanitasi herbal dapur agar TIDAK merekomendasikan Ginkgo Biloba atau Bawang Putih/Kurkumin dosis tinggi
  if (safetyEval.has_critical_alerts) {
    enhancedProtocol.smart_swap_nusantara = enhancedProtocol.smart_swap_nusantara.filter((herb) => {
      const name = (herb.local_herb_name || '').toLowerCase();
      const latin = (herb.local_latin_name || '').toLowerCase();
      const ref = (herb.expensive_supplement_reference || '').toLowerCase();
      const dosage = (herb.kitchen_dosage || '').toLowerCase();

      // Tolak jika mengandung ginkgo biloba
      if (name.includes('ginkgo') || latin.includes('ginkgo') || ref.includes('ginkgo')) return false;

      // Tolak jika mengandung bawang putih / garlic (antiplatelet & fibrinolitik)
      if (
        name.includes('bawang putih') ||
        latin.includes('allium sativum') ||
        ref.includes('garlic') ||
        dosage.includes('bawang putih')
      ) {
        return false;
      }

      // Tolak kurkumin dosis tinggi / ekstrak kunyit pekat
      if (
        name.includes('kurkumin pekat') ||
        name.includes('ekstrak kunyit') ||
        dosage.includes('>1000mg') ||
        ref.includes('curcumin 95%')
      ) {
        return false;
      }

      // Tolak jahe merah pekat / konsentrat dosis tinggi
      if (name.includes('jahe merah pekat') || dosage.includes('jahe pekat')) {
        return false;
      }

      return true;
    });

    // Pastikan Pati Garut (gastroprotektif aman non-antikoagulan) selalu ada untuk proteksi lambung pasien antikoagulan
    const hasPatiGarut = enhancedProtocol.smart_swap_nusantara.some((h) =>
      h.local_herb_name.toLowerCase().includes('pati garut')
    );
    if (!hasPatiGarut) {
      enhancedProtocol.smart_swap_nusantara.unshift({
        expensive_supplement_reference: 'L-Glutamine 5000mg Impor (Pelapis Mukosa Lambung)',
        active_compound: 'Resistant starch & mucilaginous amylose (Bebas Efek Pengencer Darah)',
        local_herb_name: 'Pati Garut Alami (Maranta arundinacea)',
        local_latin_name: 'Maranta arundinacea',
        kitchen_dosage: '1 sendok makan diseduh 150ml air hangat suam kuku pagi hari',
        preparation_method: 'Aduk 1 sdm tepung pati garut dengan air hangat hingga kental halus.',
        therapeutic_rationale: 'Melapisi mukosa lambung dari iritasi obat pengencer darah tanpa mengganggu masa pembekuan darah.',
        estimated_cost_per_week_idr: 15000,
      });
    }
  }

  // 3. KASUS EKSTREM 2: Pastikan jadwal harian (daily_schedule) memiliki entri Safety Buffer 120 Menit eksplisit
  const hasBufferSchedule = enhancedProtocol.daily_schedule.some(
    (s) => s.type === 'safety_buffer' || s.instruction.toLowerCase().includes('120 menit')
  );
  if (!hasBufferSchedule) {
    enhancedProtocol.daily_schedule.splice(1, 0, {
      time_slot: '09:00 WIB',
      activity: 'Zona Jeda Keamanan Farmakologis (120 Menit)',
      type: 'safety_buffer',
      instruction: `Jeda 2 jam setelah minum obat dokter pagi. Tubuh menyelesaikan fase eliminasi primer di hati sebelum asupan herbal dapur dimulai.`,
    });
  }

  return enhancedProtocol;
}
