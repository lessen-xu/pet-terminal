import { PetSpecies, MoodState } from './species';
import { PetStats } from './stats';
import { InventoryItem } from './items';

export interface PetData {
  id: string;
  name: string;
  species: PetSpecies;
  level: number;
  experience: number;
  stats: PetStats;
  mood: MoodState;
  isSleeping: boolean;
  birthDate: string;
  lastInteraction: string;
  lastSaveTime: string;
  lastUpdated: string;
  totalInteractions: number;
  inventory: InventoryItem[];
  coins: number;
  coinHistory?: CoinEntry[];
  // Git tracking fields
  lastGitCommit?: string;
  gitCommitCount?: number;
  gitStreak?: number;
  lastGitDate?: string;
}

export interface CoinEntry {
  amount: number;
  reason: string;
  timestamp: string;
}

export interface DatabaseSchema {
  pet: PetData | null;
  settings: {
    created: string;
    version: string;
    onboarded?: boolean;
  };
}

export const DEFAULT_STATS: PetStats = {
  hunger: 100,
  happiness: 100,
  health: 100,
  cleanliness: 100,
  energy: 100,
};

export const STARTING_COINS = 50;

export const generatePetId = (): string => {
  return `pet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
