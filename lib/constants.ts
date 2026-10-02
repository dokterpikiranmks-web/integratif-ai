import { FunctionalNodeDefinition } from '@/types/clinical';

export const CLINIC_CONFIG = {
  name: "Klinik Mandiri Kedokteran Integratif & Totok Saraf",
  tagline: "Harmoni Sains Fungsional & Kebijaksanaan Nusantara",
  practitionerName: "dr. Hendra Wicaksono, Sp.Akup (Integratif)",
  maxDailyCapacity: 5,
  defaultServiceFee: 350000, // IDR 350.000 (Konsultasi Integratif + Totok Saraf 60-75 mnt)
  dailySlots: [
    { id: "slot-1", time: "09:00", label: "Slot 1 (09:00 - 10:15 WIB)" },
    { id: "slot-2", time: "10:30", label: "Slot 2 (10:30 - 11:45 WIB)" },
    { id: "slot-3", time: "13:00", label: "Slot 3 (13:00 - 14:15 WIB)" },
    { id: "slot-4", time: "14:30", label: "Slot 4 (14:30 - 15:45 WIB)" },
    { id: "slot-5", time: "16:00", label: "Slot 5 (16:00 - 17:15 WIB)" },
  ],
  operationalDays: [1, 2, 3, 4, 5, 6], // Senin - Sabtu (0 = Minggu libur)
};

export const FUNCTIONAL_NODES: FunctionalNodeDefinition[] = [
  {
    key: "assimilation",
    title: "Assimilation",
    subTitle: "Pencernaan & Mikrobioma",
    indonesianName: "Asimilasi & Penyerapan",
    description: "Integritas saluran cerna, penyerapan mikronutrien, disbiosis usus, dan permeabilitas dinding usus (leaky gut).",
    associatedOrgans: ["Lambung", "Usus Halus", "Usus Besar", "Mikrobioma"],
  },
  {
    key: "defense_repair",
    title: "Defense & Repair",
    subTitle: "Imun & Inflamasi",
    indonesianName: "Pertahanan & Perbaikan",
    description: "Keseimbangan peradangan sistemik, respon imunologis, autoimunitas, alergi, dan infeksi laten.",
    associatedOrgans: ["Sistem Limfatik", "Sel Darah Putih", "Dinding Mukosa"],
  },
  {
    key: "energy",
    title: "Energy",
    subTitle: "Mitokondria & Oksidatif",
    indonesianName: "Energi Seluler",
    description: "Produksi ATP mitokondria, tingkat kelelahan kronis (chronic fatigue), stres oksidatif, dan metabolisme glukosa.",
    associatedOrgans: ["Mitokondria", "Kelenjar Tiroid", "Sel Otot"],
  },
  {
    key: "biotransformation",
    title: "Biotransformation & Elimination",
    subTitle: "Detoksifikasi Hati & Ginjal",
    indonesianName: "Detoksifikasi & Eliminasi",
    description: "Kemampuan fase I & II hati dalam memetabolisme toksin metabolit, residu obat kimia dokter, dan ekskresi empedu/ginjal.",
    associatedOrgans: ["Hati (Liver)", "Kantung Empedu", "Ginjal", "Kulit"],
  },
  {
    key: "transport",
    title: "Transport",
    subTitle: "Kardiovaskular & Limfe",
    indonesianName: "Sirkulasi & Transportasi",
    description: "Sirkulasi mikrovaskular perifer, tekanan darah, sistem sirkulasi limfe, dan oksigenasi jaringan tubuh.",
    associatedOrgans: ["Jantung", "Arteri/Vena", "Kapiler Saraf", "Pembuluh Limfe"],
  },
  {
    key: "communication",
    title: "Communication",
    subTitle: "Hormon & Neurotransmitter",
    indonesianName: "Komunikasi Neuro-Endokrin",
    description: "Aksis HPA (stres kortisol vs melatonin), ritme sirkadian, disregulasi insulin, dan keseimbangan neurotransmitter otonom.",
    associatedOrgans: ["Kelenjar Adrenal", "Hipofisis", "Sistem Saraf Otonom"],
  },
  {
    key: "structural",
    title: "Structural Integrity",
    subTitle: "Muskuloskeletal & Membran",
    indonesianName: "Integritas Struktural",
    description: "Ketegangan myofascial, kompresi jalur saraf, integritas membran sel, dan keselarasan postur penunjang totok saraf.",
    associatedOrgans: ["Titik Akupresur", "Fascia Otot", "Kolom Vertebra", "Saraf Tepi"],
  },
];
