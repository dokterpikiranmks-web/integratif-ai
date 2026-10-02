import 'server-only';
import { GoogleGenAI } from '@google/genai';

/**
 * Informasi model yang terdeteksi secara otomatis
 */
export interface DetectedModelInfo {
  selectedModel: string;
  source: 'autodetect_api' | 'env_override' | 'fallback_ranked';
  availableFlashModels: string[];
  allSupportedModels: string[];
  detectedAt: number;
}

// Urutan prioritas model Flash (dari versi terbaru / performa terbaik ke fallback)
export const RANKED_FLASH_MODELS_PREFERENCE: string[] = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Cache model di memori server (TTL: 1 jam)
let cachedModelInfo: DetectedModelInfo | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Jam

/**
 * Menghapus cache model yang tersimpan (misal saat terdeteksi error 404/deprecated)
 */
export function invalidateModelCache(): void {
  cachedModelInfo = null;
}

/**
 * Memeriksa apakah error yang terjadi disebabkan oleh model yang sudah tidak tersedia / deprecated / 404
 */
export function isModelUnavailableError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  return (
    message.includes('not found') ||
    message.includes('not_found') ||
    message.includes('is not supported') ||
    message.includes('deprecated') ||
    message.includes('no longer available') ||
    message.includes('unknown model') ||
    message.includes('404')
  );
}

/**
 * Mengambil daftar nama model dari Google AI Studio REST API sebagai secondary fallback
 */
async function fetchModelsViaRest(apiKey: string): Promise<string[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`REST models.list failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.models || !Array.isArray(data.models)) {
    return [];
  }

  return data.models
    .filter((m: { supportedGenerationMethods?: string[] }) => 
      !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')
    )
    .map((m: { name: string }) => m.name.replace(/^models\//, ''));
}

/**
 * Mengambil daftar seluruh model yang didukung oleh API Key saat ini
 */
export async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    // 1. Coba gunakan SDK @google/genai
    const ai = new GoogleGenAI({ apiKey });
    const modelsPager = await ai.models.list({ config: { pageSize: 50 } });
    const models: string[] = [];

    for await (const model of modelsPager) {
      if (model.name) {
        const cleanName = model.name.replace(/^models\//, '');
        // Cek jika model mendukung generateContent jika ada propertinya
        const supportsGen = (model as unknown as { supportedGenerationMethods?: string[] }).supportedGenerationMethods;
        if (!supportsGen || supportsGen.includes('generateContent')) {
          models.push(cleanName);
        }
      }
    }

    if (models.length > 0) {
      return models;
    }
  } catch (sdkError) {
    console.warn('ai.models.list SDK query warning, attempting REST fallback:', sdkError);
  }

  // 2. Fallback ke pemanggilan REST langsung
  try {
    return await fetchModelsViaRest(apiKey);
  } catch (restError) {
    console.warn('REST models query failed, using ranked candidate fallback list:', restError);
    return [];
  }
}

/**
 * Mendeteksi secara cerdas model Gemini Flash terbaik yang sedang aktif & dapat digunakan
 * 
 * Alur Deteksi:
 * 1. Jika ENV GEMINI_MODEL diatur eksplisit dan BUKAN 'auto'/'autodetect', gunakan model tersebut.
 * 2. Jika ada di cache memori dan belum kedaluwarsa, gunakan dari cache.
 * 3. Lakukan query API langsung (autodetect) terhadap daftar model yang tersedia untuk API Key.
 * 4. Cocokkan dengan urutan prioritas RANKED_FLASH_MODELS_PREFERENCE.
 * 5. Jika API query gagal, gunakan fallback model teratas yang paling stabil.
 */
export async function detectBestAvailableModel(
  apiKey: string,
  forceRefresh: boolean = false
): Promise<DetectedModelInfo> {
  const envModel = process.env.GEMINI_MODEL?.trim();

  // 1. Cek jika pengguna mengatur model manual secara spesifik (bukan 'auto' atau 'autodetect')
  if (envModel && envModel !== '' && envModel.toLowerCase() !== 'auto' && envModel.toLowerCase() !== 'autodetect') {
    return {
      selectedModel: envModel,
      source: 'env_override',
      availableFlashModels: [envModel],
      allSupportedModels: [envModel],
      detectedAt: Date.now(),
    };
  }

  // 2. Cek cache memori
  if (!forceRefresh && cachedModelInfo && (Date.now() - cachedModelInfo.detectedAt < CACHE_TTL_MS)) {
    return cachedModelInfo;
  }

  // 3. Query daftar model yang tersedia untuk API key
  const availableModels = await getAvailableGeminiModels(apiKey);

  if (availableModels.length > 0) {
    // Filter model yang mengandung kata 'flash'
    const flashModels = availableModels.filter(m => m.toLowerCase().includes('flash'));

    // Cari model Flash terbaik berdasarkan urutan ranking preferensi
    let chosenModel: string | null = null;

    for (const preferred of RANKED_FLASH_MODELS_PREFERENCE) {
      if (availableModels.includes(preferred)) {
        chosenModel = preferred;
        break;
      }
    }

    // Jika tidak ada di daftar preferensi eksak, ambil model flash apa saja yang ada
    if (!chosenModel && flashModels.length > 0) {
      chosenModel = flashModels[0];
    }

    // Jika tidak ada model flash sama sekali, ambil model gemini apa pun yang mendukung generateContent
    if (!chosenModel && availableModels.length > 0) {
      chosenModel = availableModels[0];
    }

    if (chosenModel) {
      cachedModelInfo = {
        selectedModel: chosenModel,
        source: 'autodetect_api',
        availableFlashModels: flashModels,
        allSupportedModels: availableModels,
        detectedAt: Date.now(),
      };
      console.log(`[Gemini Auto-Detect] Model aktif terpilih: "${chosenModel}" dari ${availableModels.length} model tersedia.`);
      return cachedModelInfo;
    }
  }

  // 4. Fallback jika kuota / izin list_models terbatas: pilih model kandidat pertama dari preferensi
  const fallbackModel = RANKED_FLASH_MODELS_PREFERENCE[0] || 'gemini-1.5-flash';
  cachedModelInfo = {
    selectedModel: fallbackModel,
    source: 'fallback_ranked',
    availableFlashModels: RANKED_FLASH_MODELS_PREFERENCE,
    allSupportedModels: RANKED_FLASH_MODELS_PREFERENCE,
    detectedAt: Date.now(),
  };

  console.log(`[Gemini Auto-Detect] Menggunakan ranked fallback model: "${fallbackModel}".`);
  return cachedModelInfo;
}

/**
 * Menjalankan operasi AI dengan mekanisme Self-Healing Auto-Detect & Retry
 * Jika model yang digunakan mengembalikan error 404 / deprecated, modul ini akan:
 * 1. Menginvaliasi cache model.
 * 2. Melakukan re-deteksi model baru yang available.
 * 3. Mengulang eksekusi secara transparan tanpa membuat aplikasi crash!
 */
export async function executeWithAutoModel<T>(
  apiKey: string,
  operation: (modelName: string) => Promise<T>
): Promise<T> {
  // Dapatkan model terbaik saat ini
  let modelInfo = await detectBestAvailableModel(apiKey, false);

  try {
    return await operation(modelInfo.selectedModel);
  } catch (error: unknown) {
    // Jika error disebabkan model deprecated / not found, lakukan pemulihan otomatis
    if (isModelUnavailableError(error)) {
      console.warn(
        `[Gemini Auto-Detect] Model "${modelInfo.selectedModel}" tidak lagi tersedia atau deprecated. Memulai auto-discovery model pengganti...`
      );

      // Invaliasi cache & paksa scan ulang API
      invalidateModelCache();
      modelInfo = await detectBestAvailableModel(apiKey, true);

      console.log(`[Gemini Auto-Detect] Mencoba ulang dengan model baru: "${modelInfo.selectedModel}"`);
      // Jalankan kembali operasi dengan model baru
      return await operation(modelInfo.selectedModel);
    }

    // Jika bukan error model (misal format prompt, jaringan, dll), lempar error aslinya
    throw error;
  }
}
