import { ITEMS, ItemDefinition, ItemType } from '../types/items';

export interface ShopItem {
  item: ItemDefinition;
  price: number;
  category: string;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  coinsSpent: number;
  itemPurchased?: ItemDefinition;
  remainingCoins?: number;
}

/**
 * Coin earning reasons - for tracking where coins come from
 * This helps with future statistics and programming reward integration
 */
export enum CoinReason {
  // Temporary interaction rewards (will be replaced by programming rewards)
  FEED = 'feed',
  PLAY = 'play',
  CLEAN = 'clean',
  HEAL = 'heal',
  SLEEP = 'sleep',

  // Level-up rewards (permanent)
  LEVEL_UP = 'level_up',

  // Git commit rewards by type
  GIT_COMMIT_NORMAL = 'git_commit_normal',
  GIT_COMMIT_FEATURE = 'git_commit_feature',
  GIT_COMMIT_BUG_FIX = 'git_commit_bug_fix',
  GIT_COMMIT_REFACTOR = 'git_commit_refactor',

  // Git bonus rewards
  GIT_NIGHT_BONUS = 'git_night_bonus',
  GIT_LARGE_BONUS = 'git_large_bonus',
  GIT_STREAK_DAILY = 'git_streak_daily',
  GIT_STREAK_7 = 'git_streak_7',
  GIT_STREAK_30 = 'git_streak_30',

  // Legacy (for backward compatibility)
  GIT_COMMIT = 'git_commit',
  CODE_SESSION = 'code_session',
  CHALLENGE_COMPLETE = 'challenge_complete',
  STREAK_BONUS = 'streak_bonus',

  // Other
  GIFT = 'gift',
  REFUND = 'refund',
}

/**
 * Shop class for managing item purchases
 */
export class Shop {
  private shopItems: Map<string, ShopItem>;

  constructor() {
    this.shopItems = new Map();
    this.initializeShop();
  }

  /**
   * Initialize shop with all purchasable items
   * Uses the price defined in item definitions
   */
  private initializeShop(): void {
    for (const [itemId, item] of Object.entries(ITEMS)) {
      // All items with a price are available in the shop
      if (item.price !== undefined && item.price > 0) {
        this.shopItems.set(itemId, {
          item,
          price: item.price,
          category: this.getCategoryName(item.type),
        });
      }
    }
  }

  private getCategoryName(type: ItemType): string {
    switch (type) {
      case ItemType.FOOD:
        return 'Food';
      case ItemType.TOY:
        return 'Toys';
      case ItemType.CLEANING:
        return 'Cleaning';
      case ItemType.MEDICINE:
        return 'Medicine';
      default:
        return 'Other';
    }
  }

  /**
   * Get all shop items, optionally filtered by category
   */
  getShopItems(category?: ItemType): ShopItem[] {
    const items = Array.from(this.shopItems.values());

    if (category) {
      return items.filter((si) => si.item.type === category);
    }

    return items;
  }

  /**
   * Get shop items grouped by category
   */
  getShopItemsByCategory(): Map<string, ShopItem[]> {
    const grouped = new Map<string, ShopItem[]>();

    for (const shopItem of this.shopItems.values()) {
      const category = shopItem.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(shopItem);
    }

    return grouped;
  }

  /**
   * Get a specific shop item by ID
   */
  getShopItem(itemId: string): ShopItem | undefined {
    return this.shopItems.get(itemId);
  }

  /**
   * Get the price of an item
   */
  getItemPrice(itemId: string): number | undefined {
    const shopItem = this.shopItems.get(itemId);
    return shopItem?.price;
  }

  /**
   * Check if a player can afford an item
   */
  canAfford(itemId: string, playerCoins: number): boolean {
    const price = this.getItemPrice(itemId);
    return price !== undefined && playerCoins >= price;
  }

  /**
   * Calculate how many of an item a player can afford
   */
  maxAffordable(itemId: string, playerCoins: number): number {
    const price = this.getItemPrice(itemId);
    if (!price || price <= 0) return 0;
    return Math.floor(playerCoins / price);
  }

  /**
   * Get coin reward for an action
   * These are temporary small rewards for basic interactions
   * In the future, most coins will come from programming activities
   */
  static getCoinReward(reason: CoinReason): number {
    switch (reason) {
      // Temporary interaction rewards (small amounts)
      case CoinReason.FEED:
      case CoinReason.PLAY:
      case CoinReason.CLEAN:
      case CoinReason.HEAL:
      case CoinReason.SLEEP:
        return 1;

      // Level-up reward (more substantial)
      case CoinReason.LEVEL_UP:
        return 20;

      // Git commit rewards by type
      case CoinReason.GIT_COMMIT_NORMAL:
        return 5;
      case CoinReason.GIT_COMMIT_FEATURE:
        return 8;
      case CoinReason.GIT_COMMIT_BUG_FIX:
        return 10;
      case CoinReason.GIT_COMMIT_REFACTOR:
        return 6;

      // Git bonus rewards
      case CoinReason.GIT_NIGHT_BONUS:
        return 0; // This is a multiplier, not a direct reward
      case CoinReason.GIT_LARGE_BONUS:
        return 5;
      case CoinReason.GIT_STREAK_DAILY:
        return 1;
      case CoinReason.GIT_STREAK_7:
        return 10;
      case CoinReason.GIT_STREAK_30:
        return 50;

      // Legacy (for backward compatibility)
      case CoinReason.GIT_COMMIT:
        return 5;
      case CoinReason.CODE_SESSION:
        return 10;
      case CoinReason.CHALLENGE_COMPLETE:
        return 25;
      case CoinReason.STREAK_BONUS:
        return 50;

      default:
        return 0;
    }
  }

  /**
   * Format coins for display
   */
  static formatCoins(amount: number): string {
    return `${amount} 🪙`;
  }

  /**
   * Get a description of what coins can be spent on
   */
  static getShopDescription(): string {
    return 'Purchase items to care for your pet!';
  }
}

/**
 * Singleton instance for the shop
 */
let shopInstance: Shop | null = null;

export const getShop = (): Shop => {
  if (!shopInstance) {
    shopInstance = new Shop();
  }
  return shopInstance;
};
