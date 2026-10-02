import { NextRequest, NextResponse } from 'next/server';
import { getActiveModelInfo, invalidateModelCache } from '@/lib/ai/gemini';

/**
 * GET /api/ai/model-status
 * Mengecek model Gemini yang aktif digunakan oleh aplikasi melalui sistem Auto-Detect
 */
export async function GET() {
  try {
    const modelInfo = await getActiveModelInfo(false);

    return NextResponse.json({
      status: 'ok',
      active_model: modelInfo.selectedModel,
      detection_source: modelInfo.source,
      available_flash_models: modelInfo.availableFlashModels,
      total_models_detected: modelInfo.allSupportedModels.length,
      detected_at: new Date(modelInfo.detectedAt).toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memeriksa status model Gemini';
    const isApiKeyError = message.includes('GEMINI_API_KEY');

    return NextResponse.json(
      {
        status: 'error',
        error: message,
        code: isApiKeyError ? 'ENV_CONFIG_ERROR' : 'MODEL_DETECTION_ERROR',
      },
      { status: isApiKeyError ? 500 : 502 }
    );
  }
}

/**
 * POST /api/ai/model-status
 * Memaksa scan ulang / refresh cache deteksi model terbaru dari Google AI API
 */
export async function POST(req: NextRequest) {
  try {
    invalidateModelCache();
    const modelInfo = await getActiveModelInfo(true);

    return NextResponse.json({
      status: 'refreshed',
      active_model: modelInfo.selectedModel,
      detection_source: modelInfo.source,
      available_flash_models: modelInfo.availableFlashModels,
      all_supported_models: modelInfo.allSupportedModels,
      refreshed_at: new Date(modelInfo.detectedAt).toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal me-refresh model Gemini';
    return NextResponse.json(
      {
        status: 'error',
        error: message,
      },
      { status: 500 }
    );
  }
}
