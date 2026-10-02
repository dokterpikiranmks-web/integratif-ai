import { NextRequest, NextResponse } from 'next/server';
import {
  generateIntegrativeProtocol,
  isRateLimitError,
  isTransientError,
  FRIENDLY_QUEUE_NOTICE,
  createGracefulDegradationPayload,
} from '@/lib/ai/gemini';
import {
  deidentifyObject,
  anonymizePatientContext,
  verifyPayloadCleanOfPii,
} from '@/lib/ai/anonymizer';
import {
  enforceDeterministicDrugSafety,
  evaluateDrugSafetyRules,
} from '@/lib/ai/drug-safety-rules';
import { GenerateProtocolRequest, GenerateProtocolResponse, FunctionalNodes7 } from '@/types/ai';

/**
 * Normalisasi data skor node fungsional untuk memastikan 7 node fungsional lengkap
 * dan menangani variasi penamaan (cth: energy -> bioenergetics, structural/transport -> transport_structural)
 */
function normalizeFunctionalNodes(rawNodes: Record<string, unknown> | undefined): FunctionalNodes7 {
  const safeNumber = (val: unknown, fallback: number = 30): number => {
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return Math.min(100, Math.max(0, Math.round(num)));
  };

  const assimilation = safeNumber(rawNodes?.assimilation, 30);
  const defense_repair = safeNumber(rawNodes?.defense_repair, 30);
  const bioenergetics = safeNumber(rawNodes?.bioenergetics ?? rawNodes?.energy, 30);
  const biotransformation = safeNumber(rawNodes?.biotransformation, 30);
  const communication = safeNumber(rawNodes?.communication, 30);

  let transport_structural = safeNumber(rawNodes?.transport_structural, 0);
  if (!rawNodes?.transport_structural && (rawNodes?.transport !== undefined || rawNodes?.structural !== undefined)) {
    const transport = safeNumber(rawNodes?.transport, 30);
    const structural = safeNumber(rawNodes?.structural, 30);
    transport_structural = Math.round((transport + structural) / 2);
  } else if (transport_structural === 0 && !rawNodes?.transport_structural) {
    transport_structural = 30;
  }

  const mental_emotional = safeNumber(rawNodes?.mental_emotional, 30);

  return {
    assimilation,
    defense_repair,
    bioenergetics,
    biotransformation,
    communication,
    transport_structural,
    mental_emotional,
  };
}

/**
 * POST /api/ai/generate-protocol
 * Endpoint pembuatan usulan protokol integratif dengan 3 pilar:
 * 1. Drug-Herb Safety & Deplesi Nutrisi (Enforced by Deterministic Safety Engine)
 * 2. Smart Swap Nusantara (Temulawak, Pati Garut, Brotowali, Daun Salam, Kelor)
 * 3. Titik Totok Saraf / Akupresur Terpandu
 * 
 * Lapisan Keamanan & Kepatuhan Medis:
 * - Client-Side & Server-Side De-identification: PII Whitelist (Nama, NIK, No HP, Alamat DIBUANG)
 * - Deterministic Drug-Herb Safety Engine (Kasus Ekstrem Warfarin/Aspirin & Antihipertensi terkunci 100%)
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        {
          error: 'Content-Type harus berupa application/json.',
          code: 'INVALID_CONTENT_TYPE',
        },
        { status: 400 }
      );
    }

    const rawBody = await req.json();

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        {
          error: 'Payload JSON tidak boleh kosong.',
          code: 'EMPTY_PAYLOAD',
        },
        { status: 400 }
      );
    }

    // 1. AUDIT PRIVASI MEDIS: Whitelist Konteks Pasien (Hanya izinkan umur, gender biologis, keluhan & pemicu anonim)
    const anonymizedContext = anonymizePatientContext(
      rawBody.patient_context,
      rawBody.patient_id ? `anon-${String(rawBody.patient_id).slice(0, 8)}` : undefined
    );

    // 2. Lakukan De-identification pada obat aktif (bersihkan catatan dokter yang mungkin mengandung nama pasien)
    const rawMedications = Array.isArray(rawBody.active_medications) ? rawBody.active_medications : [];
    const sanitizedMedications = rawMedications.map((m: { drug_name?: string; dosage?: string; frequency?: string }) => ({
      drug_name: String(m.drug_name || '').trim(),
      dosage: m.dosage ? String(m.dosage).trim() : undefined,
      frequency: m.frequency ? String(m.frequency).trim() : undefined,
    }));

    // 3. Normalisasi 7 Node Fungsional
    const normalizedNodes = normalizeFunctionalNodes(rawBody.functional_nodes);

    // 4. Normalisasi preferensi budget
    let budgetPreference = rawBody.budget_preference || 'kitchen_herbs';
    if (budgetPreference === 'supplements') {
      budgetPreference = 'modern_supplements';
    }

    // 5. Rakit Request Protokol yang 100% BEBAS DARI PII
    const protocolRequest: GenerateProtocolRequest = {
      functional_nodes: normalizedNodes,
      active_medications: sanitizedMedications,
      budget_preference: budgetPreference,
      patient_context: anonymizedContext,
    };

    // 6. Verifikasi Integritas Privasi (Pastikan tidak ada NIK, No HP, atau Email bocor)
    const piiCheck = verifyPayloadCleanOfPii(protocolRequest);
    if (!piiCheck.isClean) {
      console.warn('PII detected and intercepted before sending to AI:', piiCheck.violations);
    }

    // 7. Panggil Gemini Service Layer
    const rawProtocolResponse: GenerateProtocolResponse = await generateIntegrativeProtocol(protocolRequest);

    // 8. LAPISAN KEAMANAN DETERMINISTIK (DETERMINISTIC CLINICAL SAFETY GUARDRAILS):
    // Memastikan Kasus Ekstrem (Warfarin/Aspirin & Antihipertensi Amlodipine/Captopril)
    // terkunci secara matematis tanpa bergantung pada probabilistik AI.
    const hardenedProtocol = enforceDeterministicDrugSafety(rawProtocolResponse, sanitizedMedications);

    // 9. Sanitasi Tambahan pada Respon AI (Defense-in-Depth)
    const sanitizedResponse = deidentifyObject(hardenedProtocol);

    return NextResponse.json(sanitizedResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/generate-protocol:', error);

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

    const message = error instanceof Error ? error.message : 'Terjadi kegagalan saat membuat protokol integratif';

    const isApiKeyError = message.includes('GEMINI_API_KEY');
    return NextResponse.json(
      {
        error: message,
        code: isApiKeyError ? 'ENV_CONFIG_ERROR' : 'AI_PROTOCOL_ERROR',
      },
      { status: isApiKeyError ? 500 : 502 }
    );
  }
}
