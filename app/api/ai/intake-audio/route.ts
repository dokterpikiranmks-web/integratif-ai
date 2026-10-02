import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeAudioIntake,
  isRateLimitError,
  isTransientError,
  FRIENDLY_QUEUE_NOTICE,
  createGracefulDegradationPayload,
} from '@/lib/ai/gemini';
import { deidentifyObject } from '@/lib/ai/anonymizer';
import { IntakeAudioResponse } from '@/types/ai';

// Maksimum ukuran file: 25 MB
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// Format audio yang didukung sesuai spesifikasi: .mp3, .wav, .webm
const SUPPORTED_AUDIO_MIMES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
];

/**
 * Normalisasi MIME type audio jika browser mengirimkan varian non-standar
 */
function normalizeAudioMimeType(mime: string, filename?: string): string {
  const lower = mime.toLowerCase();
  if (lower.includes('mp3') || lower.includes('mpeg')) return 'audio/mp3';
  if (lower.includes('wav')) return 'audio/wav';
  if (lower.includes('webm')) return 'audio/webm';
  if (lower.includes('ogg')) return 'audio/ogg';
  if (lower.includes('m4a') || lower.includes('mp4')) return 'audio/m4a';

  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'mp3') return 'audio/mp3';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'webm') return 'audio/webm';
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'm4a') return 'audio/m4a';
  }

  return mime;
}

/**
 * POST /api/ai/intake-audio
 * Endpoint untuk memproses rekaman audio anamnesis curhat pasien dengan Gemini 1.5 Flash Multimodal
 */
export async function POST(req: NextRequest) {
  try {
    let audioBase64: string = '';
    let mimeType: string = 'audio/webm';

    const contentType = req.headers.get('content-type') || '';

    // 1. Dukungan format multipart/form-data (Upload file audio langsung)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') || formData.get('file');

      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          {
            error: 'File audio tidak ditemukan dalam payload form-data (key: "audio" atau "file").',
            code: 'MISSING_AUDIO_FILE',
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Ukuran file audio melebihi batas maksimum 25 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
            code: 'FILE_TOO_LARGE',
          },
          { status: 413 }
        );
      }

      const rawMime = file.type || 'audio/webm';
      const filename = (file as File).name;
      mimeType = normalizeAudioMimeType(rawMime, filename);

      const isSupported = SUPPORTED_AUDIO_MIMES.some(m => mimeType.includes(m.split('/')[1]));
      if (!isSupported && !SUPPORTED_AUDIO_MIMES.includes(mimeType)) {
        return NextResponse.json(
          {
            error: `Format audio "${rawMime}" tidak didukung. Format yang diizinkan: .mp3, .wav, .webm.`,
            code: 'UNSUPPORTED_AUDIO_FORMAT',
          },
          { status: 415 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    }
    // 2. Dukungan format application/json (Pengiriman base64 langsung dari client/PWA audio recorder)
    else if (contentType.includes('application/json')) {
      const body = await req.json();

      if (!body.audioBase64 || typeof body.audioBase64 !== 'string') {
        return NextResponse.json(
          {
            error: 'Field "audioBase64" wajib disertakan dalam format string base64.',
            code: 'MISSING_AUDIO_BASE64',
          },
          { status: 400 }
        );
      }

      // Bersihkan data URL prefix jika ada (cth: "data:audio/webm;base64,...")
      const matches = body.audioBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
      if (matches) {
        mimeType = normalizeAudioMimeType(matches[1]);
        audioBase64 = matches[2];
      } else {
        mimeType = normalizeAudioMimeType(body.mimeType || 'audio/webm');
        audioBase64 = body.audioBase64;
      }
    } else {
      return NextResponse.json(
        {
          error: 'Content-Type harus berupa multipart/form-data atau application/json.',
          code: 'INVALID_CONTENT_TYPE',
        },
        { status: 400 }
      );
    }

    if (!audioBase64 || audioBase64.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Data audio base64 kosong.',
          code: 'EMPTY_AUDIO_DATA',
        },
        { status: 400 }
      );
    }

    // 3. Panggil Gemini 1.5 Flash multimodal via Service Layer
    const result: IntakeAudioResponse = await analyzeAudioIntake(audioBase64, mimeType);

    // 4. Sanitasi Otomatis (De-identification) pada hasil transkripsi & anamnesis AI
    const sanitizedResult = deidentifyObject(result);

    // 5. Return respon JSON sesuai struktur spesifikasi tugas
    return NextResponse.json(sanitizedResult, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/intake-audio:', error);

    // KETAHANAN RATE LIMIT GEMINI 15 RPM / 429 & TIMEOUT:
    // Pasien tetap melihat pesan ramah di layar: "Analisis sedang dalam antrean singkat, data Anda aman..."
    // alih-alih layar blank/error 500.
    if (isRateLimitError(error) || isTransientError(error)) {
      return NextResponse.json(
        createGracefulDegradationPayload({
          friendly_notice: FRIENDLY_QUEUE_NOTICE,
          error: FRIENDLY_QUEUE_NOTICE,
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after_seconds: 3,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': '3',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const message = error instanceof Error ? error.message : 'Terjadi kegagalan saat menganalisis audio';

    const isApiKeyError = message.includes('GEMINI_API_KEY');
    return NextResponse.json(
      {
        error: message,
        code: isApiKeyError ? 'ENV_CONFIG_ERROR' : 'AI_PROCESSING_ERROR',
      },
      { status: isApiKeyError ? 500 : 502 }
    );
  }
}
