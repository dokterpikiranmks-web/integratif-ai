/**
 * Web Audio API Gentle Chime Synthesizer & AudioContext Lifecycle Manager
 * Kompatibel dengan iOS Safari (WebKit Audio Gate Policy) & Android Chrome.
 * 
 * Karakteristik Teknis:
 * 1. iOS Safari Policy: AudioContext dimulai dalam status 'suspended' jika tanpa gesture pengguna.
 * 2. unlockOrResumeAudioContext(): Dipanggil saat praktisi menekan tombol "Mulai Sesi / Mulai Durasi"
 *    untuk mengaktifkan context hardware audio dan membuka blokade Safari.
 * 3. Sintesis Nada Lembut Meditatif (Harmonik 880Hz A5 -> 440Hz A4 & 1320Hz singing bowl overtone)
 *    tanpa memerlukan file MP3 eksternal (offline-ready & zero-latency).
 */

// Singleton AudioContext untuk browser runtime
let sharedAudioContext: AudioContext | null = null;

/**
 * Mengambil atau menginisialisasi singleton AudioContext
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      console.warn('Web Audio API tidak didukung pada browser ini.');
      return null;
    }

    try {
      sharedAudioContext = new AudioContextClass();
    } catch (e) {
      console.warn('Gagal menginisialisasi AudioContext:', e);
      return null;
    }
  }

  return sharedAudioContext;
}

/**
 * Mengambil status terkini dari AudioContext ('suspended' | 'running' | 'closed' | 'unsupported')
 */
export function getAudioContextState(): string {
  if (typeof window === 'undefined') return 'server';
  const ctx = getAudioContext();
  return ctx ? ctx.state : 'unsupported';
}

/**
 * Membuka kunci (unlock) atau melanjutkan (resume) AudioContext.
 * WAJIB dipanggil di dalam event handler interaksi pengguna (cth: klik "Mulai Sesi" / "Mulai Durasi")
 * untuk memenuhi kebijakan autoplay iOS Safari WebKit.
 */
export async function unlockOrResumeAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
      console.log('[Web Audio] AudioContext berhasil di-resume dari status suspended.');
    }

    // Mainkan silent buffer 1 frame mikro untuk memastikan WebKit audio engine benar-benar aktif
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    return ctx.state === 'running';
  } catch (err) {
    console.warn('[Web Audio] Gagal me-resume AudioContext:', err);
    return false;
  }
}

/**
 * Membunyikan nada lonceng lembut penanda ganti titik akupresur / totok saraf
 */
export function playGentleAcupointChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Pastikan context aktif jika sebelumnya suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Oscillator utama (Harmonik nada 880Hz -> Meluruh ke 440Hz / Bell Decay)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 1.2);

    // Envelope suara: Serangan instan lembut (50ms attack), peluruhan bertahap (bell decay)
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // 2. Oscillator sekunder untuk nuansa mangkuk bernyanyi (singing bowl overtone 1320Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 1.2);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Mulai dan hentikan osilator
    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  } catch (err) {
    console.warn('[Web Audio] Gagal membunyikan chime audio sintetis:', err);
  }
}
