import { FunctionalNodesScore, BudgetTier } from './database';

export interface FunctionalNodeDefinition {
  key: keyof FunctionalNodesScore;
  title: string;
  subTitle: string;
  indonesianName: string;
  description: string;
  associatedOrgans: string[];
}

export interface AntecedentTriggerMediator {
  antecedents: string[]; // Faktor predisposisi genetik/masa lalu
  triggers: string[];    // Pemicu onset gejala (cth: infeksi, stres akut)
  mediators: string[];   // Hal yang memperpanjang gejala (cth: peradangan persisten, pola tidur buruk)
}

export interface SmartSwapNusantara {
  expensiveSupplement: string;
  activeCompound: string;
  localHerbalAlternative: string;
  localLatinName: string;
  preparationRecipe: string;
  estimatedCostPerWeek: number; // Dalam IDR
  scientificRationale: string;
}

export interface ZeroTypingIntakePayload {
  audioBlob?: Blob;
  audioBase64?: string;
  audioDurationSeconds?: number;
  labPhotoBase64?: string[];
  medicationStripPhotoBase64?: string[];
}
