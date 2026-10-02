import { NextRequest, NextResponse } from 'next/server';
import {
  scanPrescriptionOrLab,
  isRateLimitError,
  isTransientError,
  FRIENDLY_QUEUE_NOTICE,
  createGracefulDegradationPayload,
} from '@/lib/ai/gemini';
import { deidentifyObject } from '@/lib/ai/anonymizer';
import { ScanPrescriptionLabResponse } from '@/types/ai';

// Maksimum ukuran file: 20 MB
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

// Format gambar/dokumen yang didukung
const SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

/**
 * Normalisasi MIME type gambar
 */
function normalizeImageMimeType(mime: string, filename?: string): string {
  const lower = mime.toLowerCase();
  if (lower.includes('jpeg') || lower.includes('jpg')) return 'image/jpeg';
  if (lower.includes('png')) return 'image/png';
  if (lower.includes('webp')) return 'image/webp';
  if (lower.includes('pdf')) return 'application/pdf';
  if (lower.includes('heic')) return 'image/heic';

  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'heic') return 'image/heic';
  }

  return mime;
}

/**
 * POST /api/ai/scan-prescription-lab
 * Endpoint OCR & Clinical Vision untuk membaca strip obat resep dokter dan/atau hasil lab luar
 */
export async function POST(req: NextRequest) {
  try {
    let imageBase64: string = '';
    let mimeType: string = 'image/jpeg';

    const contentType = req.headers.get('content-type') || '';

    // 1. Dukungan multipart/form-data (Upload foto langsung dari kamera/galeri smartphone)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') || formData.get('file') || formData.get('photo');

      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          {
            error: 'File gambar tidak ditemukan dalam payload form-data (key: "image", "file", atau "photo").',
            code: 'MISSING_IMAGE_FILE',
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Ukuran file gambar melebihi batas 20 MB (Ukuran: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
            code: 'FILE_TOO_LARGE',
          },
          { status: 413 }
        );
      }

      const rawMime = file.type || 'image/jpeg';
      const filename = (file as File).name;
      mimeType = normalizeImageMimeType(rawMime, filename);

      const isSupported = SUPPORTED_IMAGE_MIMES.some(m => mimeType.includes(m.split('/')[1]));
      if (!isSupported && !SUPPORTED_IMAGE_MIMES.includes(mimeType)) {
        return NextResponse.json(
          {
            error: `Format berkas "${rawMime}" tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, PDF.`,
            code: 'UNSUPPORTED_IMAGE_FORMAT',
          },
          { status: 415 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    }
    // 2. Dukungan format application/json (Base64 dari PWA Camera capture)
    else if (contentType.includes('application/json')) {
      const body = await req.json();

      if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
        return NextResponse.json(
          {
            error: 'Field "imageBase64" wajib disertakan dalam format string base64.',
            code: 'MISSING_IMAGE_BASE64',
          },
          { status: 400 }
        );
      }

      // Bersihkan data URL prefix jika ada (cth: "data:image/jpeg;base64,...")
      const matches = body.imageBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
      if (matches) {
        mimeType = normalizeImageMimeType(matches[1]);
        imageBase64 = matches[2];
      } else {
        mimeType = normalizeImageMimeType(body.mimeType || 'image/jpeg');
        imageBase64 = body.imageBase64;
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

    if (!imageBase64 || imageBase64.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Data gambar base64 kosong.',
          code: 'EMPTY_IMAGE_DATA',
        },
        { status: 400 }
      );
    }

    // 3. Panggil Gemini Vision via Service Layer
    const result: ScanPrescriptionLabResponse = await scanPrescriptionOrLab(imageBase64, mimeType);

    // 4. Sanitasi Otomatis (De-identification) pada hasil ekstraksi teks OCR
    const sanitizedResult = deidentifyObject(result);

    // 5. Return respon terstruktur
    return NextResponse.json(sanitizedResult, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/scan-prescription-lab:', error);

    // KETAHANAN RATE LIMIT GEMINI 15 RPM / 429 & TIMEOUT:
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

    const message = error instanceof Error ? error.message : 'Terjadi kegagalan saat membaca foto strip obat / lab';

    const isApiKeyError = message.includes('GEMINI_API_KEY');
    return NextResponse.json(
      {
        error: message,
        code: isApiKeyError ? 'ENV_CONFIG_ERROR' : 'AI_VISION_ERROR',
      },
      { status: isApiKeyError ? 500 : 502 }
    );
  }
}
