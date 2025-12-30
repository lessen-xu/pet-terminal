import { InventoryItem, getItem, getStartingInventory, ItemType } from '../types/items';

export class Inventory {
  private items: Map<string, number>;

  constructor(items?: InventoryItem[]) {
    this.items = new Map();
    if (items) {
      for (const item of items) {
        if (item.quantity > 0) {
          this.items.set(item.itemId, item.quantity);
        }
      }
    }
  }

  /**
   * Create a new inventory with starting items
   */
  static createStarting(): Inventory {
    return new Inventory(getStartingInventory());
  }

  /**
   * Get the quantity of an item
   */
  getItemQuantity(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  /**
   * Get all items in inventory
   */
  getAllItems(): InventoryItem[] {
    const result: InventoryItem[] = [];
    for (const [itemId, quantity] of this.items.entries()) {
      result.push({ itemId, quantity });
    }
    return result.sort((a, b) => b.quantity - a.quantity);
  }

  /**
   * Get items of a specific type
   */
  getItemsByType(type: ItemType): InventoryItem[] {
    const result: InventoryItem[] = [];
    for (const [itemId, quantity] of this.items.entries()) {
      const itemDef = getItem(itemId);
      if (itemDef && itemDef.type === type) {
        result.push({ itemId, quantity });
      }
    }
    return result.sort((a, b) => b.quantity - a.quantity);
  }

  /**
   * Check if player has at least one of an item
   */
  hasItem(itemId: string): boolean {
    return (this.items.get(itemId) || 0) > 0;
  }

  /**
   * Check if player has at least a certain quantity of an item
   */
  hasItemQuantity(itemId: string, quantity: number): boolean {
    return (this.items.get(itemId) || 0) >= quantity;
  }

  /**
   * Check if inventory has any items of a specific type
   */
  hasItemType(type: ItemType): boolean {
    for (const itemId of this.items.keys()) {
      const itemDef = getItem(itemId);
      if (itemDef && itemDef.type === type && this.items.get(itemId)! > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add items to inventory
   */
  addItem(itemId: string, quantity: number = 1): void {
    if (quantity <= 0) return;
    const current = this.items.get(itemId) || 0;
    this.items.set(itemId, current + quantity);
  }

  /**
   * Remove items from inventory
   * Returns true if successful, false if not enough items
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    if (quantity <= 0) return true;

    const current = this.items.get(itemId) || 0;
    if (current < quantity) {
      return false;
    }

    const newQuantity = current - quantity;
    if (newQuantity === 0) {
      this.items.delete(itemId);
    } else {
      this.items.set(itemId, newQuantity);
    }
    return true;
  }

  /**
   * Get total number of unique items
   */
  getUniqueItemCount(): number {
    return this.items.size;
  }

  /**
   * Get total count of all items
   */
  getTotalItemCount(): number {
    let total = 0;
    for (const quantity of this.items.values()) {
      total += quantity;
    }
    return total;
  }

  /**
   * Check if inventory is empty
   */
  isEmpty(): boolean {
    return this.items.size === 0;
  }

  /**
   * Serialize inventory to array for storage
   */
  serialize(): InventoryItem[] {
    return this.getAllItems();
  }

  /**
   * Clear all items from inventory
   */
  clear(): void {
    this.items.clear();
  }
}
