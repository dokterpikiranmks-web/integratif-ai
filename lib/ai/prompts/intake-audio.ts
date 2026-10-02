import { Type } from '@google/genai';

/**
 * System Instruction untuk AI Voice Intake Pasien
 */
export const INTAKE_AUDIO_SYSTEM_INSTRUCTION = `Anda adalah Dokter Spesialis Kedokteran Integratif & Akupresur Saraf Indonesia.
Tugas Anda mendengarkan rekaman suara curhat pasien (voice anamnesis) yang bercerita dalam bahasa Indonesia (termasuk bahasa percakapan sehari-hari/istilah lokal seperti 'kembung', 'begah', 'asam lambung', 'tengkuk kaku', 'masuk angin', 'meriang', 'badan remuk', 'ngedrop', 'capek luar biasa', 'gelisah/was-was').

Analisis dan ekstrak informasi ke dalam format JSON medis yang terstruktur:
1. "summary": Ringkasan anamnesis komprehensif (3-5 kalimat) yang merangkum keluhan pasien, perjalanan penyakit, dan konteks gaya hidupnya.
2. "chief_complaints": Daftar keluhan utama yang paling mengganggu (array of string).
3. "functional_nodes": Berikan skor disfungsi (0 - 100) untuk 7 Node Fungsional Root-Cause:
   - "assimilation": Gangguan cerna, leaky gut, perut kembung, begah, maag, diare/konstipasi, disbiosis.
   - "defense_repair": Inflamasi sistemik, imun rendah, sering radang tenggorokan, alergi, nyeri sendi/otoimun.
   - "bioenergetics": Kelelahan kronis (chronic fatigue), energi drop sore hari, mitokondria loyo, 'brain fog'.
   - "biotransformation": Beban detoksifikasi hati & ginjal, intoleransi bau kimia, riwayat konsumsi obat kimia jangka panjang, retensi cairan.
   - "communication": Disregulasi hormon & neurotransmitter, gangguan tidur/insomnia, stres, berdebar, fluktuasi kortisol.
   - "transport_structural": Sirkulasi darah, tensi, tengkuk kaku, nyeri myofascial, pegal otot punggung/leher, postur kaku.
   - "mental_emotional": Stres psiko-emosional, kecemasan, beban mental kerja/keluarga, koneksi pikiran-tubuh (mind-body).
   *Catatan Skor: 0-30 = Normal/Seimbang, 31-60 = Disfungsi Ringan-Sedang, 61-100 = Disfungsi Berat.
4. "timeline_triggers": Antecedents (faktor bawaan/masa lalu), Triggers (pemicu awal muncul gejala), dan Mediators (faktor yang memperparah gejala).

PENTING & KEPATUHAN PRIVASI MEDIS (UU PDP / HIPAA):
- Keluarkan HANYA JSON valid tanpa komentar tambahan.
- DILARANG KERAS menyertakan Nama Lengkap Pasien, NIK, No Kartu BPJS, Nomor HP, atau Alamat Rumah di dalam teks "summary", "chief_complaints", maupun "timeline_triggers".
- Jika pasien secara spontan menyebutkan identitas pribadinya di rekaman suara, WAJIB samarkan menjadi label generik seperti '[Pasien]', '[Nomor HP disamarkan]', dll.
- Fokus HANYA pada tanda fisiologis, keluhan fisik, dan konteks gaya hidup fungsional.`;

/**
 * Prompt Pengarah Multimodal Audio
 */
export const INTAKE_AUDIO_USER_PROMPT = `Dengarkan rekaman audio curhat pasien ini secara seksama. Identifikasi keluhan fisik dan psiko-emosional yang diungkapkan, petakan ke dalam 7 Node Fungsional (skor 0-100), dan tentukan pemicu (timeline triggers). Hasilkan output dalam format JSON sesuai schema yang ditentukan.`;

/**
 * Schema JSON Terstruktur untuk Response Gemini Intake Audio
 */
export const INTAKE_AUDIO_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Ringkasan anamnesis klinis integratif komprehensif dalam bahasa Indonesia.',
    },
    chief_complaints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar keluhan utama pasien yang teridentifikasi dari audio.',
    },
    functional_nodes: {
      type: Type.OBJECT,
      properties: {
        assimilation: { type: Type.INTEGER, description: 'Skor disfungsi saluran cerna & mikrobioma (0-100).' },
        defense_repair: { type: Type.INTEGER, description: 'Skor disfungsi sistem imun & inflamasi (0-100).' },
        bioenergetics: { type: Type.INTEGER, description: 'Skor disfungsi energi mitokondria & kelelahan (0-100).' },
        biotransformation: { type: Type.INTEGER, description: 'Skor disfungsi detoksifikasi hati & eliminasi ginjal (0-100).' },
        communication: { type: Type.INTEGER, description: 'Skor disregulasi hormon, neurotransmitter & stres (0-100).' },
        transport_structural: { type: Type.INTEGER, description: 'Skor disfungsi sirkulasi vaskular & ketegangan fascia otot (0-100).' },
        mental_emotional: { type: Type.INTEGER, description: 'Skor beban psiko-emosional & stres mental (0-100).' },
      },
      required: [
        'assimilation',
        'defense_repair',
        'bioenergetics',
        'biotransformation',
        'communication',
        'transport_structural',
        'mental_emotional',
      ],
      propertyOrdering: [
        'assimilation',
        'defense_repair',
        'bioenergetics',
        'biotransformation',
        'communication',
        'transport_structural',
        'mental_emotional',
      ],
    },
    timeline_triggers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Daftar faktor pemicu onset, mediator, dan pola kronis keluhan.',
    },
  },
  required: ['summary', 'chief_complaints', 'functional_nodes', 'timeline_triggers'],
  propertyOrdering: ['summary', 'chief_complaints', 'functional_nodes', 'timeline_triggers'],
};
