import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/booking
 * Endpoint pembuatan janji temu pasien (booking appointment)
 * Dilindungi oleh PostgreSQL Transaction Advisory Lock & Trigger Kuota Maksimal 5 Pasien/Hari
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type harus berupa application/json.', code: 'INVALID_CONTENT_TYPE' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { patient_id, appointment_date, time_slot, service_type } = body;

    if (!appointment_date || !time_slot) {
      return NextResponse.json(
        { error: 'Field "appointment_date" dan "time_slot" wajib diisi.', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Normalisasi format time_slot (cth: "08:30" -> "08:30:00")
    const normalizedSlot = time_slot.length === 5 ? `${time_slot}:00` : time_slot;

    const supabase = createClient();
    
    // 1. Dapatkan user session jika terautentikasi, atau gunakan patient_id yang sah
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const effectivePatientId = user?.id || patient_id;

    if (!effectivePatientId) {
      return NextResponse.json(
        { error: 'Sesi pengguna tidak valid atau patient_id tidak ditemukan.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Eksekusi Booking via RPC Atomik dengan Transaction Advisory Lock
    const { data: appointment, error: rpcError } = await supabase.rpc('book_appointment_with_lock', {
      p_patient_id: effectivePatientId,
      p_appointment_date: appointment_date,
      p_time_slot: normalizedSlot,
      p_service_type: service_type || 'Konsultasi Integratif & Totok Saraf',
    });

    if (rpcError) {
      console.warn('[Booking Service] RPC error encountered:', rpcError.message);

      // Tangani Quota Limit Exceeded (check_violation)
      if (rpcError.message.includes('Kapasitas harian klinik telah penuh') || rpcError.code === '23514') {
        return NextResponse.json(
          {
            error: `Kapasitas harian klinik telah penuh! Maksimal 5 pasien per hari untuk tanggal ${appointment_date}.`,
            code: 'DAILY_QUOTA_EXCEEDED',
            appointment_date,
          },
          { status: 409 }
        );
      }

      // Tangani Double-Booking Slot Waktu yang Sama (unique_violation)
      if (
        rpcError.message.includes('sudah dipesan oleh pasien lain') ||
        rpcError.code === '23505' ||
        rpcError.message.includes('idx_unique_active_appointment_slot')
      ) {
        return NextResponse.json(
          {
            error: `Slot waktu ${time_slot} WIB pada tanggal ${appointment_date} sudah terisi. Silakan pilih slot lain.`,
            code: 'SLOT_ALREADY_BOOKED',
            time_slot,
            appointment_date,
          },
          { status: 409 }
        );
      }

      throw rpcError;
    }

    return NextResponse.json(
      {
        message: 'Slot berhasil dipesan dan dikunci.',
        code: 'BOOKING_SUCCESS',
        appointment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in /api/booking:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kegagalan saat memesan jadwal.';
    return NextResponse.json(
      { error: message, code: 'INTERNAL_BOOKING_ERROR' },
      { status: 500 }
    );
  }
}
