import 'server-only';

/**
 * Modul Ketahanan & Reliabilitas Gemini API (Rate Limit 15 RPM / 429 Handling)
 * Mengimplementasikan:
 * 1. Deteksi cerdas status 429 (Too Many Requests), Quota Exhausted, dan Transient Timeouts.
 * 2. Algoritma Exponential Backoff dengan Random Jitter untuk menghindari thundering herd.
 * 3. Mekanisme Graceful Degradation: Pesan ramah antrean terjamin tanpa crash 500 / layar blank.
 */

export const FRIENDLY_QUEUE_NOTICE = 'Analisis sedang dalam antrean singkat, data Anda aman...';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 600,
  maxDelayMs: 4000,
  backoffFactor: 2,
  jitter: true,
  onRetry: () => {},
};

/**
 * Memeriksa apakah error tergolong Rate Limit (HTTP 429 / Quota Exceeded / Resource Exhausted)
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  const status = (error as { status?: number; statusCode?: number; code?: number | string })?.status ||
                 (error as { status?: number; statusCode?: number; code?: number | string })?.statusCode;
  if (status === 429) return true;

  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    msg.includes('429') ||
    msg.includes('too many requests') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('ratelimitexceeded') ||
    msg.includes('tokens per minute') ||
    msg.includes('requests per minute')
  );
}

/**
 * Memeriksa apakah error tergolong transient (dapat dicoba ulang: 429, 503, timeout, socket hangup)
 */
export function isTransientError(error: unknown): boolean {
  if (isRateLimitError(error)) return true;

  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    msg.includes('503') ||
    msg.includes('service unavailable') ||
    msg.includes('deadline_exceeded') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('network error')
  );
}

/**
 * Eksekusi fungsi dengan algoritma Exponential Backoff + Jitter
 */
export async function executeWithRetryAndBackoff<T>(
  operation: (attempt: number) => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let currentDelay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation(attempt);
    } catch (error: unknown) {
      const isRetryable = isTransientError(error);

      // Jika bukan error transient atau ini adalah percobaan terakhir, rethrow error
      if (!isRetryable || attempt >= config.maxRetries) {
        throw error;
      }

      // Hitung durasi backoff dengan jitter: delay * (backoffFactor ^ (attempt - 1)) ± jitter
      let delay = Math.min(
        config.maxDelayMs,
        currentDelay * Math.pow(config.backoffFactor, attempt - 1)
      );

      if (config.jitter) {
        // Random jitter antara 85% s.d. 115% untuk mendistribusikan beban
        const jitterMultiplier = 0.85 + Math.random() * 0.3;
        delay = Math.round(delay * jitterMultiplier);
      }

      console.warn(
        `[Gemini Resilience] Terdeteksi status rate limit / transient error (percobaan ${attempt}/${config.maxRetries}). Mengulang dalam ${delay}ms...`
      );

      config.onRetry(attempt, delay, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Fallback pengaman runtime
  throw new Error(FRIENDLY_QUEUE_NOTICE);
}

/**
 * Membentuk payload respon terstruktur untuk Graceful Degradation
 */
export function createGracefulDegradationPayload(customDetails?: Record<string, unknown>) {
  return {
    status: 'rate_limited',
    code: 'RATE_LIMIT_EXCEEDED',
    is_rate_limited: true,
    is_queued: true,
    friendly_notice: FRIENDLY_QUEUE_NOTICE,
    error: FRIENDLY_QUEUE_NOTICE,
    retry_after_seconds: 3,
    timestamp: Date.now(),
    ...customDetails,
  };
}
