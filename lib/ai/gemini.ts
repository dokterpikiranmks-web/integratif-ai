import 'server-only';
import { GoogleGenAI, GenerateContentConfig } from '@google/genai';
import {
  INTAKE_AUDIO_SYSTEM_INSTRUCTION,
  INTAKE_AUDIO_USER_PROMPT,
  INTAKE_AUDIO_RESPONSE_SCHEMA,
} from './prompts/intake-audio';
import {
  SCAN_PRESCRIPTION_LAB_SYSTEM_INSTRUCTION,
  SCAN_PRESCRIPTION_LAB_USER_PROMPT,
  SCAN_PRESCRIPTION_LAB_RESPONSE_SCHEMA,
} from './prompts/scan-prescription-lab';
import {
  GENERATE_PROTOCOL_SYSTEM_INSTRUCTION,
  buildGenerateProtocolUserPrompt,
  GENERATE_PROTOCOL_RESPONSE_SCHEMA,
} from './prompts/generate-protocol';
import {
  detectBestAvailableModel,
  executeWithAutoModel,
  invalidateModelCache,
  getAvailableGeminiModels,
  DetectedModelInfo,
} from './model-detector';
import {
  executeWithRetryAndBackoff,
  isRateLimitError,
  isTransientError,
  FRIENDLY_QUEUE_NOTICE,
  createGracefulDegradationPayload,
} from './resilience';
import {
  IntakeAudioResponse,
  ScanPrescriptionLabResponse,
  GenerateProtocolRequest,
  GenerateProtocolResponse,
} from '@/types/ai';

// Guard runtime: Pastikan tidak pernah dijalankan di sisi client (browser)
if (typeof window !== 'undefined') {
  throw new Error('Gemini Service Layer is server-side only and cannot be accessed from the browser.');
}

/**
 * Mengambil API Key dari environment variable server
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key') {
    throw new Error(
      'GEMINI_API_KEY belum dikonfigurasi pada server. Harap atur GEMINI_API_KEY di file .env.local atau environment variables.'
    );
  }
  return apiKey.trim();
}

/**
 * Singleton client GoogleGenAI
 */
let cachedGenAi: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!cachedGenAi) {
    const apiKey = getGeminiApiKey();
    cachedGenAi = new GoogleGenAI({ apiKey });
  }
  return cachedGenAi;
}

/**
 * Mengambil informasi model yang aktif digunakan (Auto-detected atau Override)
 */
export async function getActiveModelInfo(forceRefresh: boolean = false): Promise<DetectedModelInfo> {
  const apiKey = getGeminiApiKey();
  return detectBestAvailableModel(apiKey, forceRefresh);
}

/**
 * Helper untuk membersihkan dan mem-parsing teks JSON dari Gemini
 */
export function cleanAndParseJson<T>(rawText: string | null | undefined): T {
  if (!rawText || rawText.trim() === '') {
    throw new Error('Respons AI kosong atau tidak menghasilkan output teks.');
  }

  let cleaned = rawText.trim();
  // Hilangkan markdown code fences jika model menyertakannya
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse JSON from Gemini response. Raw text:', rawText);
    throw new Error(`Format JSON dari AI tidak valid: ${(error as Error).message}`);
  }
}

/**
 * SERVICE 1: Zero-Typing Voice Intake Audio Analysis
 * Dilengkapi AUTO-DETECT MODEL & SELF-HEALING RETRY:
 * Jika model lama (misal 1.5-flash) sudah deprecated, sistem otomatis beralih ke Flash model
 * yang sedang aktif tanpa menghentikan aplikasi.
 */
export async function analyzeAudioIntake(
  audioBase64: string,
  mimeType: string,
  customModel?: string
): Promise<IntakeAudioResponse> {
  const apiKey = getGeminiApiKey();
  const ai = getGeminiClient();

  const config: GenerateContentConfig = {
    systemInstruction: INTAKE_AUDIO_SYSTEM_INSTRUCTION,
    temperature: 0.1, // Rendah untuk akurasi klasifikasi medis yang konsisten
    responseMimeType: 'application/json',
    responseJsonSchema: INTAKE_AUDIO_RESPONSE_SCHEMA,
  };

  const runWithModel = async (activeModel: string): Promise<IntakeAudioResponse> => {
    const response = await executeWithRetryAndBackoff(() =>
      ai.models.generateContent({
        model: activeModel,
        contents: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          INTAKE_AUDIO_USER_PROMPT,
        ],
        config,
      })
    );

    const parsed = cleanAndParseJson<IntakeAudioResponse>(response.text);

    // Validasi batas skor 0-100 untuk tiap functional node
    if (parsed.functional_nodes) {
      for (const key of Object.keys(parsed.functional_nodes) as Array<keyof typeof parsed.functional_nodes>) {
        const val = Number(parsed.functional_nodes[key]) || 0;
        parsed.functional_nodes[key] = Math.min(100, Math.max(0, Math.round(val)));
      }
    }

    return parsed;
  };

  // Jika model ditentukan eksplisit di luar auto-mode
  if (customModel && customModel !== 'auto' && customModel !== 'autodetect') {
    return runWithModel(customModel);
  }

  // Gunakan Auto-Detection & Self-Healing Execution
  return executeWithAutoModel(apiKey, runWithModel);
}

/**
 * SERVICE 2: Scan Prescription Strip & External Lab Report
 * Dilengkapi AUTO-DETECT MODEL & SELF-HEALING RETRY untuk Gemini Vision
 */
export async function scanPrescriptionOrLab(
  imageBase64: string,
  mimeType: string,
  customModel?: string
): Promise<ScanPrescriptionLabResponse> {
  const apiKey = getGeminiApiKey();
  const ai = getGeminiClient();

  const config: GenerateContentConfig = {
    systemInstruction: SCAN_PRESCRIPTION_LAB_SYSTEM_INSTRUCTION,
    temperature: 0.1,
    responseMimeType: 'application/json',
    responseJsonSchema: SCAN_PRESCRIPTION_LAB_RESPONSE_SCHEMA,
  };

  const runWithModel = async (activeModel: string): Promise<ScanPrescriptionLabResponse> => {
    const response = await executeWithRetryAndBackoff(() =>
      ai.models.generateContent({
        model: activeModel,
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          SCAN_PRESCRIPTION_LAB_USER_PROMPT,
        ],
        config,
      })
    );

    return cleanAndParseJson<ScanPrescriptionLabResponse>(response.text);
  };

  if (customModel && customModel !== 'auto' && customModel !== 'autodetect') {
    return runWithModel(customModel);
  }

  return executeWithAutoModel(apiKey, runWithModel);
}

/**
 * SERVICE 3: Generate Evidence-Based Integrative Protocol
 * Dilengkapi AUTO-DETECT MODEL & SELF-HEALING RETRY
 */
export async function generateIntegrativeProtocol(
  request: GenerateProtocolRequest,
  customModel?: string
): Promise<GenerateProtocolResponse> {
  const apiKey = getGeminiApiKey();
  const ai = getGeminiClient();

  const config: GenerateContentConfig = {
    systemInstruction: GENERATE_PROTOCOL_SYSTEM_INSTRUCTION,
    temperature: 0.2, // Sedikit variasi untuk racikan dapur namun tetap patuh evidence
    responseMimeType: 'application/json',
    responseJsonSchema: GENERATE_PROTOCOL_RESPONSE_SCHEMA,
  };

  const userPrompt = buildGenerateProtocolUserPrompt({
    functional_nodes: request.functional_nodes,
    active_medications: request.active_medications || [],
    budget_preference: request.budget_preference || 'kitchen_herbs',
    patient_context: request.patient_context,
  });

  const runWithModel = async (activeModel: string): Promise<GenerateProtocolResponse> => {
    const response = await executeWithRetryAndBackoff(() =>
      ai.models.generateContent({
        model: activeModel,
        contents: userPrompt,
        config,
      })
    );

    return cleanAndParseJson<GenerateProtocolResponse>(response.text);
  };

  if (customModel && customModel !== 'auto' && customModel !== 'autodetect') {
    return runWithModel(customModel);
  }

  return executeWithAutoModel(apiKey, runWithModel);
}

// Re-export fungsi auto-detect & resilience untuk akses modul lain
export {
  detectBestAvailableModel,
  invalidateModelCache,
  getAvailableGeminiModels,
  executeWithRetryAndBackoff,
  isRateLimitError,
  isTransientError,
  FRIENDLY_QUEUE_NOTICE,
  createGracefulDegradationPayload,
};

// ---------------------------------------------------------------------
// BACKWARD COMPATIBILITY & LEGACY EXPORTS
// ---------------------------------------------------------------------
export const DEFAULT_GEMINI_MODEL = 'auto'; // Mode default kini adalah AUTO-DETECT

export interface GeminiClinicalExtractionResult {
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
    functional_node: 'assimilation' | 'defense_repair' | 'energy' | 'biotransformation' | 'transport' | 'communication' | 'structural';
  }>;
  doctor_medications: Array<{
    drug_name: string;
    dosage: string;
    frequency: string;
    depleted_nutrients: string[];
    herbal_contraindications: string[];
  }>;
  functional_nodes_score: {
    assimilation: number;
    defense_repair: number;
    energy: number;
    biotransformation: number;
    transport: number;
    communication: number;
    structural: number;
  };
  recommended_kitchen_herbs: Array<{
    local_name: string;
    latin_name: string;
    preparation_method: string;
    buffer_minutes: number;
    therapeutic_rationale: string;
  }>;
  acupressure_points: Array<{
    code: string;
    indonesian_name: string;
    location: string;
    target_function: string;
  }>;
}

export const GEMINI_CONFIG = {
  model: 'auto',
  temperature: 0.2,
  systemInstruction: INTAKE_AUDIO_SYSTEM_INSTRUCTION,
};
