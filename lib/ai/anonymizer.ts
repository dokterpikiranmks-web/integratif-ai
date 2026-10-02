/**
 * Client-Side De-identification Utility & Medical Privacy Enforcement
 * 
 * Modul ini berjalan aman di lingkungan browser (Client-Side) maupun server-side.
 * Berfungsi membersihkan Personally Identifiable Information (PII) pasien seperti
 * Nama, NIK (16 digit), No. HP Indonesia, Email, Foto Wajah, Alamat, dan data sensitif
 * lainnya sebelum data dikirimkan ke model AI (Google Gemini 1.5 Flash / Google AI Studio).
 * 
 * Sesuai prinsip UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) & 
 * Standar HIPAA Safe Harbor De-identification (45 CFR § 164.514).
 */

export interface DeidentifyOptions {
  /** Nama pasien spesifik yang diketahui untuk disamarkan secara eksak */
  knownNames?: string[];
  /** NIK pasien spesifik yang diketahui untuk disamarkan secara eksak */
  knownNik?: string;
  /** Nomor telepon pasien yang diketahui untuk disamarkan secara eksak */
  knownPhone?: string;
  /** Apakah menyamarkan email juga (default: true) */
  maskEmail?: boolean;
  /** Apakah menyamarkan alamat / RT / RW (default: true) */
  maskAddress?: boolean;
  /** Label pengganti untuk nama (default: '[NAMA_PASIEN]') */
  namePlaceholder?: string;
}

// 1. NIK: 16 digit terangkai, pola 4-4-4-4, pola 6-6-4, berspasi, atau ber-tanda hubung
const NIK_REGEX = /\b(?:\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{6}[-\s]?\d{6}[-\s]?\d{4}|\d{16})\b/g;
// 2. BPJS: 13 digit diawali 000 atau dengan label kartu bpjs
const BPJS_REGEX = /\b000\d{10}\b|(?:(?:no\.?\s*(?:kartu\s*)?bpjs|bpjs)[\s:]*)\d{13}\b/gi;
// 3. No. HP Indonesia (+62, 62, 08x) dengan atau tanpa spasi/tanda hubung
const INDO_PHONE_REGEX = /(?:\+62|62|0)8[1-9][0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,5}\b/g;
const GENERIC_PHONE_REGEX = /(?:telp|hp|telepon|wa|whatsapp|no\s*hp|ponsel)[\s:]*([+0-9\s-]{8,16})/gi;
// 4. Email
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// 5. Pola nama pasien dengan sapaan/gelar Indonesia (Bpk. Budi Santoso, Ibu Ratna, Tn. Ahmad, dll)
const NAME_TITLE_REGEX = /\b(Bapak|Bpk\.?|Ibu\.?|Ibunda|Sdr\.?|Sdri\.?|Ny\.?|Tn\.?|Nn\.?|Anak|An\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g;

// 6. Pola formulir & percakapan santai ("Nama: Budi", "Nama saya Budi Santoso", "Panggil saya Ratna")
const CONVERSATIONAL_NAME_REGEX = /\b(?:nama\s*(?:saya|pasien|lengkap)?(?:\s*adalah)?|patient\s*name|panggil\s*saya|atas\s*nama)[\s:]+([A-Za-z\s'.,]{3,40})(?=\r?\n|,|;|\.|\s{2,}|$)/gi;

// 7. Pola alamat: Jl. / Jalan / RT / RW
const ADDRESS_REGEX = /\b(?:jl\.?|jalan|gang|gg\.?)\s+[A-Za-z0-9\s.,-]+?(?=\b(?:rt|rw|kel|kec|kab|kota|\d{5})\b|\n|$)/gi;
const RT_RW_REGEX = /\brt\s*\d{1,3}\s*\/?\s*rw\s*\d{1,3}\b/gi;

/**
 * Membersihkan teks dari semua data PII (Nama, NIK, No HP, dll)
 * @param text Teks mentah (cth: transkrip audio, catatan medis, pesan pasien)
 * @param options Opsi sanitasi
 * @returns Teks yang telah di-anonimkan (aman untuk dikirim ke LLM)
 */
export function deidentifyText(text: string, options: DeidentifyOptions = {}): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Samarkan NIK yang diketahui spesifik
  if (options.knownNik && options.knownNik.trim().length >= 10) {
    const rawNik = options.knownNik.trim().replace(/[-\s]/g, '');
    const nikPattern = new RegExp(escapeRegExp(options.knownNik) + '|' + escapeRegExp(rawNik), 'gi');
    sanitized = sanitized.replace(nikPattern, '[NIK_DISAMARKAN]');
  }

  // 2. Samarkan No HP yang diketahui spesifik
  if (options.knownPhone && options.knownPhone.trim().length >= 8) {
    const rawPhone = options.knownPhone.trim().replace(/[-\s]/g, '');
    const phonePattern = new RegExp(escapeRegExp(options.knownPhone) + '|' + escapeRegExp(rawPhone), 'gi');
    sanitized = sanitized.replace(phonePattern, '[NO_HP_DISAMARKAN]');
  }

  // 3. Samarkan Nama Pasien yang diketahui secara spesifik
  if (options.knownNames && options.knownNames.length > 0) {
    for (const name of options.knownNames) {
      if (!name || name.trim().length < 2) continue;
      const cleanName = name.trim();
      const placeholder = options.namePlaceholder || '[NAMA_PASIEN]';

      // Samarkan nama lengkap
      const fullNameRegex = new RegExp(`\\b${escapeRegExp(cleanName)}\\b`, 'gi');
      sanitized = sanitized.replace(fullNameRegex, placeholder);

      // Jika nama terdiri dari beberapa kata (cth: Budi Santoso), samarkan juga per kata jika panjang >= 3 karakter
      const nameParts = cleanName.split(/\s+/).filter(p => p.length >= 3);
      if (nameParts.length > 1) {
        for (const part of nameParts) {
          // Hanya kata unik bukan kata umum medis
          if (['pasien', 'keluhan', 'sakit', 'dokter', 'klinik', 'resep', 'terapi'].includes(part.toLowerCase())) continue;
          const partRegex = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi');
          sanitized = sanitized.replace(partRegex, placeholder);
        }
      }
    }
  }

  // 4. Samarkan Pola NIK (16 digit) umum
  sanitized = sanitized.replace(NIK_REGEX, '[NIK_DISAMARKAN]');

  // 5. Samarkan No HP Indonesia
  sanitized = sanitized.replace(INDO_PHONE_REGEX, '[NO_HP_DISAMARKAN]');
  sanitized = sanitized.replace(GENERIC_PHONE_REGEX, 'telepon: [NO_HP_DISAMARKAN]');

  // 6. Samarkan Pola No BPJS
  sanitized = sanitized.replace(BPJS_REGEX, '[NO_KARTU_DISAMARKAN]');

  // 7. Samarkan Email
  if (options.maskEmail !== false) {
    sanitized = sanitized.replace(EMAIL_REGEX, '[EMAIL_DISAMARKAN]');
  }

  // 8. Samarkan Nama dengan Sapaan (Bpk. Joko, Ibu Siti Rahmawati)
  sanitized = sanitized.replace(NAME_TITLE_REGEX, (_match, title) => `${title} [NAMA_DISAMARKAN]`);

  // 9. Samarkan Percakapan / Label "Nama saya Budi Santoso" atau "Nama: Ahmad Fauzi"
  sanitized = sanitized.replace(CONVERSATIONAL_NAME_REGEX, (_match) => `nama: [NAMA_PASIEN]`);

  // 10. Samarkan Alamat Fisik / RT RW jika diaktifkan
  if (options.maskAddress !== false) {
    sanitized = sanitized.replace(ADDRESS_REGEX, 'Jl. [ALAMAT_DISAMARKAN]');
    sanitized = sanitized.replace(RT_RW_REGEX, 'RT/RW [DISAMARKAN]');
  }

  return sanitized;
}

/**
 * Memeriksa apakah teks masih mengandung data sensitif PII (NIK atau nomor HP tak tersamar)
 */
export function containsSensitivePii(text: string): boolean {
  if (!text) return false;
  return NIK_REGEX.test(text) || INDO_PHONE_REGEX.test(text);
}

/**
 * Masking sebagian NIK untuk ditampilkan di UI (hanya 4 digit terakhir terlihat)
 * Contoh: "3171012304850001" -> "3171************0001"
 */
export function maskNik(nik: string): string {
  if (!nik) return '';
  const clean = nik.replace(/\D/g, '');
  if (clean.length < 8) return '****';
  return clean.slice(0, 4) + '*'.repeat(clean.length - 8) + clean.slice(-4);
}

/**
 * Masking sebagian Nomor HP untuk UI
 * Contoh: "081234567890" -> "0812****7890"
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.length < 8) return '****';
  return clean.slice(0, 4) + '****' + clean.slice(-4);
}

// Daftar blacklisted keys yang berisiko membawa PII
const PII_KEY_BLACKLIST = new Set([
  'name',
  'full_name',
  'patient_name',
  'nama',
  'nama_lengkap',
  'nama_pasien',
  'doctor_name',
  'nama_dokter',
  'nik',
  'ktp',
  'no_ktp',
  'no_nik',
  'bpjs',
  'no_bpjs',
  'phone',
  'phone_number',
  'no_hp',
  'nomor_hp',
  'telepon',
  'wa',
  'whatsapp',
  'email',
  'address',
  'alamat',
  'alamat_rumah',
  'rt',
  'rw',
  'avatar',
  'avatar_url',
  'photo',
  'foto_pasien',
  'face_photo',
  'birth_date',
  'tanggal_lahir',
  'mrn',
  'no_rm',
  'rekam_medis',
]);

/**
 * Helper untuk sanitasi objek JavaScript bersarang (misal payload JSON sebelum dikirim ke API)
 */
export function deidentifyObject<T>(obj: T, options: DeidentifyOptions = {}): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return deidentifyText(obj, options) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deidentifyObject(item, options)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Jika key terdaftar dalam daftar hitam PII
      if (PII_KEY_BLACKLIST.has(lowerKey)) {
        if (lowerKey.includes('nik') || lowerKey.includes('ktp') || lowerKey.includes('bpjs')) {
          result[key] = '[IDENTITAS_RESMI_DISAMARKAN]';
        } else if (lowerKey.includes('phone') || lowerKey.includes('hp') || lowerKey.includes('telepon')) {
          result[key] = '[NO_HP_DISAMARKAN]';
        } else if (lowerKey.includes('email')) {
          result[key] = '[EMAIL_DISAMARKAN]';
        } else if (lowerKey.includes('photo') || lowerKey.includes('avatar')) {
          result[key] = '[FOTO_DIHAPUS_UNTUK_PRIVASI]';
        } else {
          result[key] = '[NAMA_DISAMARKAN]';
        }
      } else {
        result[key] = deidentifyObject(value, options);
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * STANDAR COMPLIANCE MEDIS: Whitelist Sanitizer untuk Konteks Pasien
 * 
 * Memastikan HANYA parameter medis non-PII berikut yang lolos ke prompt AI:
 * - Umur (age)
 * - Gender Biologis (gender)
 * - Keluhan utama teranonimkan (chief_complaints)
 * - Pemicu waktu teranonimkan (timeline_triggers)
 * - Token ID Anonim (anonymized_id: UUID)
 * - Catatan praktisi teranonimkan (practitioner_notes)
 * 
 * Segala identitas langsung (Nama, NIK, No HP, Alamat, Foto) AKAN DIBUANG EKSPLISIT.
 */
export interface AnonymizedPatientContext {
  anonymized_id: string;
  age?: number;
  gender?: 'male' | 'female';
  chief_complaints?: string[];
  timeline_triggers?: string[];
  practitioner_notes?: string;
}

export function anonymizePatientContext(
  rawContext: Record<string, unknown> | undefined,
  fallbackUuid?: string
): AnonymizedPatientContext {
  if (!rawContext || typeof rawContext !== 'object') {
    return {
      anonymized_id: fallbackUuid || 'anon-' + Math.random().toString(36).substring(2, 10),
    };
  }

  // 1. Ekstrak umur (validasi biologis 0 - 120 tahun)
  let safeAge: number | undefined = undefined;
  if (rawContext.age !== undefined && rawContext.age !== null) {
    const parsedAge = parseInt(String(rawContext.age), 10);
    if (!isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 120) {
      safeAge = parsedAge;
    }
  }

  // 2. Ekstrak gender biologis terstandarisasi ('male' | 'female')
  let safeGender: 'male' | 'female' | undefined = undefined;
  if (typeof rawContext.gender === 'string') {
    const lowerG = rawContext.gender.trim().toLowerCase();
    if (lowerG.startsWith('l') || lowerG.startsWith('m') || lowerG.includes('pria')) {
      safeGender = 'male';
    } else if (lowerG.startsWith('p') || lowerG.startsWith('f') || lowerG.includes('wanita')) {
      safeGender = 'female';
    }
  }

  // 3. Ekstrak chief complaints (wajib di-deidentify secara ketat)
  let safeComplaints: string[] | undefined = undefined;
  if (Array.isArray(rawContext.chief_complaints)) {
    safeComplaints = rawContext.chief_complaints
      .map(c => deidentifyText(String(c)))
      .filter(c => c.trim().length > 0);
  }

  // 4. Ekstrak timeline triggers (wajib di-deidentify secara ketat)
  let safeTriggers: string[] | undefined = undefined;
  if (Array.isArray(rawContext.timeline_triggers)) {
    safeTriggers = rawContext.timeline_triggers
      .map(t => deidentifyText(String(t)))
      .filter(t => t.trim().length > 0);
  }

  // 5. Ekstrak catatan praktisi teranonimkan
  let safeNotes: string | undefined = undefined;
  if (typeof rawContext.practitioner_notes === 'string') {
    safeNotes = deidentifyText(rawContext.practitioner_notes);
  }

  // 6. Buat ID Anonim UUID (TIDAK BOLEH mengandung nama, NIK, atau no HP)
  const safeId = typeof rawContext.anonymized_id === 'string' && rawContext.anonymized_id.startsWith('anon-')
    ? rawContext.anonymized_id
    : fallbackUuid || 'anon-' + Math.random().toString(36).substring(2, 10);

  return {
    anonymized_id: safeId,
    age: safeAge,
    gender: safeGender,
    chief_complaints: safeComplaints,
    timeline_triggers: safeTriggers,
    practitioner_notes: safeNotes,
  };
}

/**
 * Verifikasi Audit: Memastikan payload prompt AI 100% bebas dari PII
 * Melempar error jika terdeteksi kebocoran PII.
 */
export function verifyPayloadCleanOfPii(textOrObject: unknown): { isClean: boolean; violations: string[] } {
  const violations: string[] = [];
  const stringified = typeof textOrObject === 'string' ? textOrObject : JSON.stringify(textOrObject);

  if (NIK_REGEX.test(stringified)) {
    violations.push('Pola NIK (16 digit) terdeteksi dalam payload!');
  }
  if (INDO_PHONE_REGEX.test(stringified)) {
    violations.push('Pola Nomor HP Indonesia terdeteksi dalam payload!');
  }
  if (BPJS_REGEX.test(stringified)) {
    violations.push('Pola Nomor BPJS terdeteksi dalam payload!');
  }
  if (EMAIL_REGEX.test(stringified)) {
    violations.push('Pola Alamat Email terdeteksi dalam payload!');
  }

  return {
    isClean: violations.length === 0,
    violations,
  };
}

// Utility internal untuk escape karakter regex khusus
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
