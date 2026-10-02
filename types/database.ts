export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'patient' | 'practitioner';

export type AppointmentStatus =
  | 'slot_held'
  | 'paid_confirmed'
  | 'checked_in'
  | 'in_session'
  | 'completed'
  | 'cancelled';

export type ProtocolStatus = 'draft' | 'active' | 'archived';

export type BudgetTier = 'kitchen_herbs' | 'local_extract' | 'modern_supplements';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  time_slot: string; // HH:MM:SS
  service_type: string;
  status: AppointmentStatus;
  total_amount: number;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: Profile;
}

export interface FunctionalNodesScore {
  assimilation: number; // 0-100%
  defense_repair: number;
  energy: number;
  biotransformation: number;
  transport: number;
  communication: number;
  structural: number;
}

export interface ExtractedSymptom {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  functional_node: keyof FunctionalNodesScore;
}

export interface DoctorMedication {
  drug_name: string;
  dosage: string;
  frequency: string;
  purpose?: string;
  depleted_nutrients?: string[];
  herbal_contraindications?: string[];
}

export interface ExternalLabData {
  test_name?: string;
  test_date?: string;
  lab_name?: string;
  biomarkers?: Array<{
    marker: string;
    value: number | string;
    unit: string;
    reference_range: string;
    flag?: 'normal' | 'low' | 'high' | 'critical';
  }>;
  summary?: string;
}

export interface ClinicalProfile {
  id: string;
  patient_id: string;
  voice_note_url: string | null;
  extracted_symptoms: ExtractedSymptom[];
  doctor_medications: DoctorMedication[];
  external_lab_data: ExternalLabData;
  functional_nodes_score: FunctionalNodesScore;
  created_at: string;
  updated_at: string;
}

export interface KitchenHerbItem {
  name: string;
  latin_name?: string;
  local_name?: string; // e.g., Temulawak, Kunyit, Jahe Merah, Daun Salam
  preparation_method: string; // e.g., Rebusan 3 gelas jadi 1 gelas
  timing: string; // e.g., Pagi sebelum makan
  buffer_from_medication_minutes: number; // e.g. 120 menit jeda dari obat dokter
  target_symptom: string;
}

export interface AcupressurePointItem {
  code: string; // e.g., ST36, SP6, LI4, PC6, GV20
  indonesian_name: string;
  anatomical_location: string;
  target_organ: string;
  pressure_technique: string;
  recommended_duration_seconds: number;
}

export interface Protocol {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  status: ProtocolStatus;
  budget_tier: BudgetTier;
  nutrition_plan: Array<{
    meal_time: 'pagi' | 'siang' | 'malam' | 'camilan';
    food_recommendation: string;
    avoid_list: string[];
    therapeutic_rationale: string;
  }>;
  herbal_prescriptions: KitchenHerbItem[];
  acupressure_points: AcupressurePointItem[];
  practitioner_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id: string;
  appointment_id: string;
  pre_hrv: number | null;
  post_hrv: number | null;
  pre_pulse: number | null;
  post_pulse: number | null;
  points_treated: string[];
  practitioner_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  patient_id: string;
  log_date: string;
  tasks_completed: Array<{
    task_id: string;
    title: string;
    type: 'herbal' | 'acupressure' | 'nutrition' | 'medication_buffer';
    completed: boolean;
    completed_at?: string;
  }>;
  sleep_quality: number | null; // 1-5
  energy_score: number | null; // 1-10
  notes: string | null;
  created_at: string;
}
