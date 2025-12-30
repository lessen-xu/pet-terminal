import { Pet } from './pet';
import { PetStats } from '../types/stats';
import { getItem, ItemType } from '../types/items';
import {
  CareAction,
  CareNeed,
  CareActionResult,
  CareResult,
  AutoPurchaseRule,
  AutoPurchaseResult,
  AutoCareConfig,
} from '../types/auto-care';

/**
 * Default auto-care configuration
 */
export const DEFAULT_AUTO_CARE_CONFIG: AutoCareConfig = {
  enabled: false,
  autoFeed: false,
  thresholds: {
    hunger: 70,
    happiness: 60,
    cleanliness: 60,
    energy: 50,
    health: 70,
  },
};

/**
 * Auto-purchase rules
 */
export const AUTO_PURCHASE_RULES: AutoPurchaseRule[] = [
  { itemId: 'fish', itemName: 'Fresh Fish', minQuantity: 2, maxCost: 20, itemPrice: 10 },
  { itemId: 'ball', itemName: 'Tennis Ball', minQuantity: 1, maxCost: 25, itemPrice: 15 },
  { itemId: 'soap', itemName: 'Pet Soap', minQuantity: 1, maxCost: 15, itemPrice: 10 },
  { itemId: 'medicine', itemName: 'Medicine', minQuantity: 1, maxCost: 35, itemPrice: 30 },
];

/**
 * Auto-Care system for managing pet care automatically
 */
export class AutoCare {
  private config: AutoCareConfig;

  constructor(config: Partial<AutoCareConfig> = {}) {
    this.config = { ...DEFAULT_AUTO_CARE_CONFIG, ...config };
  }

  /**
   * Assess pet's current needs based on stats
   */
  assessNeeds(pet: Pet, stats: PetStats): CareNeed[] {
    const needs: CareNeed[] = [];
    const data = pet.getData();

    // Don't care if sleeping (unless waking up)
    if (data.isSleeping) {
      return [];
    }

    // Hunger - highest priority
    if (stats.hunger < this.config.thresholds.hunger) {
      const fishItem = getItem('fish');
      needs.push({
        stat: 'hunger',
        threshold: this.config.thresholds.hunger,
        action: CareAction.FEED,
        itemId: 'fish',
        itemName: fishItem?.name || 'Fresh Fish',
        priority: 100,
      });
    }

    // Health - critical priority
    if (stats.health < this.config.thresholds.health) {
      const medicineItem = getItem('medicine');
      needs.push({
        stat: 'health',
        threshold: this.config.thresholds.health,
        action: CareAction.HEAL,
        itemId: 'medicine',
        itemName: medicineItem?.name || 'Medicine',
        priority: 90,
      });
    }

    // Happiness - medium priority
    if (stats.happiness < this.config.thresholds.happiness) {
      const ballItem = getItem('ball');
      needs.push({
        stat: 'happiness',
        threshold: this.config.thresholds.happiness,
        action: CareAction.PLAY,
        itemId: 'ball',
        itemName: ballItem?.name || 'Tennis Ball',
        priority: 70,
      });
    }

    // Cleanliness - medium priority
    if (stats.cleanliness < this.config.thresholds.cleanliness) {
      const soapItem = getItem('soap');
      needs.push({
        stat: 'cleanliness',
        threshold: this.config.thresholds.cleanliness,
        action: CareAction.CLEAN,
        itemId: 'soap',
        itemName: soapItem?.name || 'Pet Soap',
        priority: 60,
      });
    }

    // Sort by priority (highest first)
    return needs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute one-click care - perform all needed actions
   */
  async oneClickCare(pet: Pet): Promise<CareResult> {
    const statsBefore = { ...pet.getData().stats };
    const actionsTaken: CareActionResult[] = [];
    let itemsUsed = 0;

    const needs = this.assessNeeds(pet, statsBefore);

    for (const need of needs) {
      const result = await this.performCareAction(pet, need);
      actionsTaken.push(result);
      if (result.success) {
        itemsUsed++;
      }
    }

    const statsAfter = { ...pet.getData().stats };

    return {
      success: actionsTaken.some((a) => a.success),
      actionsTaken,
      statsBefore,
      statsAfter,
      coinsSpent: 0,
      itemsUsed,
    };
  }

  /**
   * Perform a single care action
   */
  private async performCareAction(pet: Pet, need: CareNeed): Promise<CareActionResult> {
    const inventory = pet.getInventory();
    const statBefore = pet.getData().stats[need.stat];

    // Check if we have the required item
    const hasItem = inventory.hasItem(need.itemId);

    if (!hasItem) {
      // Try alternative items
      const alternative = this.findAlternativeItem(need.action, inventory);
      if (alternative) {
        const result = pet.useItem(alternative);
        const statAfter = pet.getData().stats[need.stat];
        return {
          action: need.action,
          itemId: alternative,
          itemName: getItem(alternative)?.name || alternative,
          success: result.success,
          statChanges: [{ stat: need.stat, from: statBefore, to: statAfter }],
          reason: result.success ? undefined : result.message,
        };
      }

      return {
        action: need.action,
        itemId: need.itemId,
        itemName: need.itemName,
        success: false,
        statChanges: [],
        reason: `No ${need.itemName} available. Visit the shop!`,
      };
    }

    // Use the item
    const result = pet.useItem(need.itemId);
    const statAfter = pet.getData().stats[need.stat];

    return {
      action: need.action,
      itemId: need.itemId,
      itemName: need.itemName,
      success: result.success,
      statChanges: [{ stat: need.stat, from: statBefore, to: statAfter }],
      reason: result.success ? undefined : result.message,
    };
  }

  /**
   * Find alternative item for a care action
   */
  private findAlternativeItem(action: CareAction, inventory: any): string | null {
    const alternatives: Record<CareAction, { type: ItemType; fallbacks: string[] }> = {
      [CareAction.FEED]: { type: ItemType.FOOD, fallbacks: ['premium_food', 'treat'] },
      [CareAction.PLAY]: { type: ItemType.TOY, fallbacks: ['toy'] },
      [CareAction.CLEAN]: { type: ItemType.CLEANING, fallbacks: ['shampoo'] },
      [CareAction.HEAL]: { type: ItemType.MEDICINE, fallbacks: ['bandage'] },
      [CareAction.NONE]: { type: ItemType.FOOD, fallbacks: [] },
    };

    const config = alternatives[action];
    if (!config) return null;

    // Try fallbacks in order
    for (const itemId of config.fallbacks) {
      if (inventory.hasItem(itemId)) {
        return itemId;
      }
    }

    return null;
  }

  /**
   * Auto-purchase items when low on stock
   */
  async autoPurchase(pet: Pet): Promise<AutoPurchaseResult> {
    if (!this.config.enabled) {
      return { purchased: false, items: [], totalCost: 0 };
    }

    const coins = pet.getCoins();
    const inventory = pet.getInventory();
    const purchases: { itemId: string; itemName: string; quantity: number; cost: number }[] = [];
    let totalCost = 0;

    for (const rule of AUTO_PURCHASE_RULES) {
      const currentQuantity = inventory.getItemQuantity(rule.itemId);

      if (currentQuantity < rule.minQuantity && coins >= rule.maxCost) {
        const quantityToBuy = Math.min(
          Math.floor((coins - totalCost) / rule.itemPrice),
          rule.minQuantity * 2, // Don't buy too many at once
        );

        if (quantityToBuy > 0) {
          const cost = quantityToBuy * rule.itemPrice;
          if (pet.spendCoins(cost)) {
            pet.addItem(rule.itemId, quantityToBuy);
            purchases.push({
              itemId: rule.itemId,
              itemName: rule.itemName,
              quantity: quantityToBuy,
              cost,
            });
            totalCost += cost;
          }
        }
      }
    }

    return {
      purchased: purchases.length > 0,
      items: purchases,
      totalCost,
    };
  }

  /**
   * Check if auto-purchase can be afforded
   */
  canAffordAutoCare(pet: Pet): boolean {
    const coins = pet.getCoins();
    const inventory = pet.getInventory();

    for (const rule of AUTO_PURCHASE_RULES) {
      const currentQuantity = inventory.getItemQuantity(rule.itemId);
      if (currentQuantity < rule.minQuantity && coins < rule.maxCost) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get current auto-care configuration
   */
  getConfig(): AutoCareConfig {
    return { ...this.config };
  }

  /**
   * Update auto-care configuration
   */
  updateConfig(updates: Partial<AutoCareConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Enable or disable auto-purchase
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Get suggestions based on pet state
   */
  getSuggestions(pet: Pet): string[] {
    const suggestions: string[] = [];
    const data = pet.getData();
    const stats = data.stats;
    const coins = pet.getCoins();
    const inventory = pet.getInventory();

    // Check if pet needs care
    if (pet.needsCare()) {
      suggestions.push("💡 Use 'pet care' for one-click care");
    }

    // Check if coins are plentiful but inventory is low
    const fishQty = inventory.getItemQuantity('fish');
    const ballQty = inventory.getItemQuantity('ball');
    const soapQty = inventory.getItemQuantity('soap');

    if (coins > 100 && (fishQty < 2 || ballQty < 1 || soapQty < 1)) {
      suggestions.push("💡 Coins plentiful, visit shop: 'pet shop'");
    }

    // Check git streak
    if (pet.getGitStreak() === 0 && pet.getGitCommitCount() === 0) {
      suggestions.push("💡 Make git commits to improve pet stats!");
    }

    // Check if pet is sleeping
    if (data.isSleeping && stats.energy < 80) {
      suggestions.push("💡 Let your pet sleep to restore energy");
    }

    return suggestions;
  }
}

/**
 * Create a default AutoCare instance
 */
export const createAutoCare = (config?: Partial<AutoCareConfig>): AutoCare => {
  return new AutoCare(config);
};
