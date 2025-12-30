import { PetStats } from './stats';

/**
 * Care action types
 */
export enum CareAction {
  FEED = 'feed',
  PLAY = 'play',
  CLEAN = 'clean',
  HEAL = 'heal',
  NONE = 'none',
}

/**
 * Single care need assessment
 */
export interface CareNeed {
  stat: keyof PetStats;
  threshold: number;
  action: CareAction;
  itemId: string;
  itemName: string;
  priority: number; // Higher = more urgent
}

/**
 * Result of a single care action
 */
export interface CareActionResult {
  action: CareAction;
  itemId: string;
  itemName: string;
  success: boolean;
  statChanges: { stat: string; from: number; to: number }[];
  reason?: string; // Why it failed
}

/**
 * Result of one-click care operation
 */
export interface CareResult {
  success: boolean;
  actionsTaken: CareActionResult[];
  statsBefore: PetStats;
  statsAfter: PetStats;
  coinsSpent: number;
  itemsUsed: number;
}

/**
 * Auto-purchase rule
 */
export interface AutoPurchaseRule {
  itemId: string;
  itemName: string;
  minQuantity: number;
  maxCost: number;
  itemPrice: number;
}

/**
 * Auto-purchase result
 */
export interface AutoPurchaseResult {
  purchased: boolean;
  items: { itemId: string; itemName: string; quantity: number; cost: number }[];
  totalCost: number;
}

/**
 * Auto-care configuration
 */
export interface AutoCareConfig {
  enabled: boolean; // Auto-purchase enabled
  autoFeed: boolean; // Auto-feed when hungry
  thresholds: {
    hunger: number;
    happiness: number;
    cleanliness: number;
    energy: number;
    health: number;
  };
}
