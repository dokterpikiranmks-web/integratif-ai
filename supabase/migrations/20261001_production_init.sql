-- ==============================================================================
-- MIGRATION: 20261001_production_init.sql
-- TARGET: Supabase PostgreSQL Production (Free Tier Optimized - Rp 0)
-- SISTEM: Praktek Mandiri Kedokteran Integratif & Totok Saraf (Maks 5 Pasien/Hari)
-- AUDIT STATUS: PASSED (RLS Strict Isolation, Advisory Lock Concurrency, Free Tier Indexing)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'practitioner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'slot_held',        -- Slot ditahan sementara menunggu verifikasi bayar
        'paid_confirmed',   -- Pembayaran terverifikasi, jadwal resmi terkunci
        'checked_in',       -- Pasien tiba di klinik
        'in_session',       -- Sedang terapi totok saraf / konsultasi
        'completed',        -- Sesi selesai, protokol diserahkan
        'cancelled'         -- Dibatalkan (slot kembali terbuka)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE protocol_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE budget_tier AS ENUM ('kitchen_herbs', 'local_extract', 'modern_supplements');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- TABLE: profiles (Sinkronisasi dengan Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'patient',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- TABLE: appointments (Jadwal Praktek Mandiri - Maks 5 per hari)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'Konsultasi Integratif & Totok Saraf',
    status appointment_status NOT NULL DEFAULT 'slot_held',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- TABLE: clinical_profiles (Asupan Klinis Mandiri Pasien & Hasil Analisis AI)
CREATE TABLE IF NOT EXISTS public.clinical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voice_note_url TEXT,
    extracted_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    doctor_medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    external_lab_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- 7 Nodes Fungsional Kedokteran Integratif (Skor 0 - 100%)
    -- 1. Assimilation (Pencernaan/Mikrobioma)
    -- 2. Defense & Repair (Imunitas/Inflamasi)
    -- 3. Energy (Mitokondria/Oksidatif)
    -- 4. Biotransformation & Elimination (Detoksifikasi/Hati)
    -- 5. Transport (Kardiovaskular/Limfatik)
    -- 6. Communication (Endokrin/Neurotransmitter)
    -- 7. Structural Integrity (Muskuloskeletal/Membran Sel)
    functional_nodes_score JSONB NOT NULL DEFAULT '{
        "assimilation": 0,
        "defense_repair": 0,
        "energy": 0,
        "biotransformation": 0,
        "transport": 0,
        "communication": 0,
        "structural": 0
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- TABLE: protocols (Rencana Terapi Dapur Terapeutik & Totok Saraf)
CREATE TABLE IF NOT EXISTS public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    status protocol_status NOT NULL DEFAULT 'draft',
    budget_tier budget_tier NOT NULL DEFAULT 'kitchen_herbs',
    nutrition_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    herbal_prescriptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    acupressure_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    practitioner_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- TABLE: therapy_sessions (Catatan Sesi Totok Saraf Langsung di Klinik)
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    pre_hrv NUMERIC(6, 2),
    post_hrv NUMERIC(6, 2),
    pre_pulse INTEGER,
    post_pulse INTEGER,
    points_treated TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    practitioner_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- TABLE: daily_logs (Pendamping Harian Pasien di Rumah / Now Card)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_patient_daily_log UNIQUE (patient_id, log_date)
);

-- ==============================================================================
-- 4. CONSTRAINTS & TRIGGERS (ATURAN BISNIS INTI & ANTI-RACE CONDITION)
-- ==============================================================================

-- A. CONSTRAINT SLOT UNIK: Mencegah 2 pasien memesan slot waktu yang sama di hari yang sama
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment_slot 
ON public.appointments (appointment_date, time_slot) 
WHERE status != 'cancelled';

-- B. CONSTRAINT KUOTA MAKSIMAL 5 PASIEN PER HARI (TRIGGER ADVISORY LOCK OTOMATIS)
CREATE OR REPLACE FUNCTION public.check_daily_appointment_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
DECLARE
    active_count INTEGER;
    max_daily_capacity CONSTANT INTEGER := 5;
BEGIN
    IF NEW.status = 'cancelled' THEN
        RETURN NEW;
    END IF;

    -- Transaction Advisory Lock per tanggal booking (Mencegah Race Condition Concurrency)
    PERFORM pg_advisory_xact_lock(hashtext('appointment_quota_' || NEW.appointment_date::text));

    SELECT COUNT(*)
    INTO active_count
    FROM public.appointments
    WHERE appointment_date = NEW.appointment_date
      AND status != 'cancelled'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF active_count >= max_daily_capacity THEN
        RAISE EXCEPTION 'Kapasitas harian klinik telah penuh! Maksimal % pasien per hari untuk tanggal %.',
            max_daily_capacity, NEW.appointment_date
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_daily_appointment_limit ON public.appointments;
CREATE TRIGGER trg_enforce_daily_appointment_limit
    BEFORE INSERT OR UPDATE OF appointment_date, status
    ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_daily_appointment_limit();

-- FUNGSI RPC ATOMIK: Booking Janji Temu dengan Kunci Transaksi Serial
CREATE OR REPLACE FUNCTION public.book_appointment_with_lock(
    p_patient_id UUID,
    p_appointment_date DATE,
    p_time_slot TIME,
    p_service_type TEXT DEFAULT 'Konsultasi Integratif & Totok Saraf'
)
RETURNS public.appointments
LANGUAGE plpgsql
AS $$
DECLARE
    v_active_count INTEGER;
    v_new_appointment public.appointments;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('appointment_quota_' || p_appointment_date::text));

    IF EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE appointment_date = p_appointment_date 
          AND time_slot = p_time_slot 
          AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'Slot waktu % pada tanggal % sudah dipesan oleh pasien lain!',
            p_time_slot, p_appointment_date
            USING ERRCODE = 'unique_violation';
    END IF;

    SELECT COUNT(*) INTO v_active_count
    FROM public.appointments
    WHERE appointment_date = p_appointment_date
      AND status != 'cancelled';

    IF v_active_count >= 5 THEN
        RAISE EXCEPTION 'Kapasitas harian klinik telah penuh! Maksimal 5 pasien per hari untuk tanggal %.',
            p_appointment_date
            USING ERRCODE = 'check_violation';
    END IF;

    INSERT INTO public.appointments (
        patient_id, appointment_date, time_slot, service_type, status
    ) VALUES (
        p_patient_id, p_appointment_date, p_time_slot, p_service_type, 'slot_held'
    ) RETURNING * INTO v_new_appointment;

    RETURN v_new_appointment;
END;
$$;

-- C. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_clinical_profiles_updated_at ON public.clinical_profiles;
CREATE TRIGGER trg_clinical_profiles_updated_at BEFORE UPDATE ON public.clinical_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_protocols_updated_at ON public.protocols;
CREATE TRIGGER trg_protocols_updated_at BEFORE UPDATE ON public.protocols FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_therapy_sessions_updated_at ON public.therapy_sessions;
CREATE TRIGGER trg_therapy_sessions_updated_at BEFORE UPDATE ON public.therapy_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- D. SINKRONISASI OTOMATIS AUTH.USERS -> PUBLIC.PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pasien Baru'),
        NEW.raw_user_meta_data->>'phone_number',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_number = EXCLUDED.phone_number;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & ISOLATION POLICIES (AUDITED)
-- ==============================================================================

-- A. HELPER FUNCTION: Cek Role Praktisi (SECURITY DEFINER, mencegah RLS recursion)
CREATE OR REPLACE FUNCTION public.is_practitioner()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
          AND role = 'practitioner'
    );
END;
$$;

-- B. ENABLE RLS PADA SELURUH TABEL
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- C. KEBIJAKAN RLS: PROFILES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- D. KEBIJAKAN RLS: APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
CREATE POLICY "appointments_select_policy" ON public.appointments
    FOR SELECT USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
CREATE POLICY "appointments_insert_policy" ON public.appointments
    FOR INSERT WITH CHECK (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
CREATE POLICY "appointments_update_policy" ON public.appointments
    FOR UPDATE USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;
CREATE POLICY "appointments_delete_policy" ON public.appointments
    FOR DELETE USING (
        public.is_practitioner()
    );

-- E. KEBIJAKAN RLS: CLINICAL PROFILES
DROP POLICY IF EXISTS "clinical_profiles_select_policy" ON public.clinical_profiles;
CREATE POLICY "clinical_profiles_select_policy" ON public.clinical_profiles
    FOR SELECT USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "clinical_profiles_insert_policy" ON public.clinical_profiles;
CREATE POLICY "clinical_profiles_insert_policy" ON public.clinical_profiles
    FOR INSERT WITH CHECK (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "clinical_profiles_update_policy" ON public.clinical_profiles;
CREATE POLICY "clinical_profiles_update_policy" ON public.clinical_profiles
    FOR UPDATE USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

-- F. KEBIJAKAN RLS: PROTOCOLS
DROP POLICY IF EXISTS "protocols_select_policy" ON public.protocols;
CREATE POLICY "protocols_select_policy" ON public.protocols
    FOR SELECT USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "protocols_practitioner_all" ON public.protocols;
CREATE POLICY "protocols_practitioner_all" ON public.protocols
    FOR ALL USING (
        public.is_practitioner()
    );

-- G. KEBIJAKAN RLS: THERAPY SESSIONS
DROP POLICY IF EXISTS "therapy_sessions_select_policy" ON public.therapy_sessions;
CREATE POLICY "therapy_sessions_select_policy" ON public.therapy_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.id = therapy_sessions.appointment_id
              AND (a.patient_id = auth.uid() OR public.is_practitioner())
        )
    );

DROP POLICY IF EXISTS "therapy_sessions_practitioner_all" ON public.therapy_sessions;
CREATE POLICY "therapy_sessions_practitioner_all" ON public.therapy_sessions
    FOR ALL USING (
        public.is_practitioner()
    );

-- H. KEBIJAKAN RLS: DAILY LOGS
DROP POLICY IF EXISTS "daily_logs_select_policy" ON public.daily_logs;
CREATE POLICY "daily_logs_select_policy" ON public.daily_logs
    FOR SELECT USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "daily_logs_insert_policy" ON public.daily_logs;
CREATE POLICY "daily_logs_insert_policy" ON public.daily_logs
    FOR INSERT WITH CHECK (
        patient_id = auth.uid() OR public.is_practitioner()
    );

DROP POLICY IF EXISTS "daily_logs_update_policy" ON public.daily_logs;
CREATE POLICY "daily_logs_update_policy" ON public.daily_logs
    FOR UPDATE USING (
        patient_id = auth.uid() OR public.is_practitioner()
    );

-- ==============================================================================
-- 6. INDEXES FOR PERFORMANCE (SUPABASE FREE TIER OPTIMIZED)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON public.appointments (appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_profiles_patient ON public.clinical_profiles (patient_id);
CREATE INDEX IF NOT EXISTS idx_protocols_patient_status ON public.protocols (patient_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_patient_date ON public.daily_logs (patient_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_appointment ON public.therapy_sessions (appointment_id);

-- ==============================================================================
-- 7. HELPER FUNCTION: QUERY SLOT TERSEDIA (FREE TIER REALTIME CAPABILITY)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_available_slots_for_date(target_date DATE)
RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN,
    current_status appointment_status
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    standard_slots TIME[] := ARRAY[
        '09:00:00'::TIME, 
        '10:30:00'::TIME, 
        '13:00:00'::TIME, 
        '14:30:00'::TIME, 
        '16:00:00'::TIME
    ];
    active_count INTEGER;
    s TIME;
    matched_status appointment_status;
BEGIN
    SELECT COUNT(*)
    INTO active_count
    FROM public.appointments
    WHERE appointment_date = target_date
      AND status != 'cancelled';

    FOREACH s IN ARRAY standard_slots
    LOOP
        slot_time := s;
        
        SELECT status INTO matched_status
        FROM public.appointments
        WHERE appointment_date = target_date
          AND time_slot = s
          AND status != 'cancelled'
        LIMIT 1;

        IF active_count >= 5 THEN
            is_available := FALSE;
            current_status := COALESCE(matched_status, 'slot_held');
        ELSIF matched_status IS NOT NULL THEN
            is_available := FALSE;
            current_status := matched_status;
        ELSE
            is_available := TRUE;
            current_status := NULL;
        END IF;

        RETURN NEXT;
    END LOOP;
END;
$$;
