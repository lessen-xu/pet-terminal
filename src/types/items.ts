export enum ItemType {
  FOOD = 'food',
  TOY = 'toy',
  CLEANING = 'cleaning',
  MEDICINE = 'medicine',
}

export enum ItemRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export interface ItemEffect {
  hunger?: number;
  happiness?: number;
  health?: number;
  cleanliness?: number;
  energy?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  emoji: string;
  effect: ItemEffect;
  xpReward: number;
  price?: number; // For future shop implementation
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

// Item definitions database
export const ITEMS: Record<string, ItemDefinition> = {
  // ===== FOOD =====
  fish: {
    id: 'fish',
    name: 'Fresh Fish',
    type: ItemType.FOOD,
    rarity: ItemRarity.COMMON,
    description: 'A delicious fish. Restores hunger well.',
    emoji: '🐟',
    effect: { hunger: 30, happiness: 5, health: 2 },
    xpReward: 10,
    price: 10,
  },
  premium_food: {
    id: 'premium_food',
    name: 'Premium Pet Food',
    type: ItemType.FOOD,
    rarity: ItemRarity.COMMON,
    description: 'Nutritious pet food. Good for daily feeding.',
    emoji: '🥫',
    effect: { hunger: 20, happiness: 3, health: 1 },
    xpReward: 8,
    price: 5,
  },
  steak: {
    id: 'steak',
    name: 'Juicy Steak',
    type: ItemType.FOOD,
    rarity: ItemRarity.RARE,
    description: 'A high-quality steak. Very filling!',
    emoji: '🥩',
    effect: { hunger: 40, happiness: 10, health: 3 },
    xpReward: 15,
    price: 25,
  },
  treat: {
    id: 'treat',
    name: 'Yummy Treat',
    type: ItemType.FOOD,
    rarity: ItemRarity.COMMON,
    description: 'A small snack. Not very filling but makes pets happy!',
    emoji: '🦴',
    effect: { hunger: 10, happiness: 15, health: -2 },
    xpReward: 8,
    price: 8,
  },
  cake: {
    id: 'cake',
    name: 'Birthday Cake',
    type: ItemType.FOOD,
    rarity: ItemRarity.EPIC,
    description: 'A special cake for celebrations!',
    emoji: '🎂',
    effect: { hunger: 25, happiness: 30, health: -5, energy: 5 },
    xpReward: 25,
    price: 50,
  },

  // ===== TOYS =====
  ball: {
    id: 'ball',
    name: 'Tennis Ball',
    type: ItemType.TOY,
    rarity: ItemRarity.COMMON,
    description: 'A simple ball for playing fetch.',
    emoji: '🎾',
    effect: { happiness: 20, energy: -15 },
    xpReward: 12,
    price: 15,
  },
  frisbee: {
    id: 'frisbee',
    name: 'Frisbee',
    type: ItemType.TOY,
    rarity: ItemRarity.COMMON,
    description: 'Great for outdoor play!',
    emoji: '🥏',
    effect: { happiness: 25, energy: -20, health: 2 },
    xpReward: 15,
    price: 20,
  },
  laser_pointer: {
    id: 'laser_pointer',
    name: 'Laser Pointer',
    type: ItemType.TOY,
    rarity: ItemRarity.RARE,
    description: 'Endless entertainment for curious pets!',
    emoji: '🔴',
    effect: { happiness: 35, energy: -10 },
    xpReward: 20,
    price: 30,
  },
  squeaky_toy: {
    id: 'squeaky_toy',
    name: 'Squeaky Toy',
    type: ItemType.TOY,
    rarity: ItemRarity.COMMON,
    description: 'Makes funny noises when chewed.',
    emoji: '🦖',
    effect: { happiness: 18, energy: -12 },
    xpReward: 10,
    price: 12,
  },
  stuffed_animal: {
    id: 'stuffed_animal',
    name: 'Stuffed Animal',
    type: ItemType.TOY,
    rarity: ItemRarity.RARE,
    description: 'A soft toy for snuggling.',
    emoji: '🧸',
    effect: { happiness: 15, energy: 5 },
    xpReward: 12,
    price: 25,
  },

  // ===== CLEANING SUPPLIES =====
  soap: {
    id: 'soap',
    name: 'Pet Soap',
    type: ItemType.CLEANING,
    rarity: ItemRarity.COMMON,
    description: 'Basic soap for cleaning your pet.',
    emoji: '🧼',
    effect: { cleanliness: 35, happiness: -3 },
    xpReward: 8,
    price: 10,
  },
  shampoo: {
    id: 'shampoo',
    name: 'Fancy Shampoo',
    type: ItemType.CLEANING,
    rarity: ItemRarity.RARE,
    description: 'Smells great and cleans thoroughly!',
    emoji: '🧴',
    effect: { cleanliness: 50, happiness: 5 },
    xpReward: 12,
    price: 20,
  },
  brush: {
    id: 'brush',
    name: 'Grooming Brush',
    type: ItemType.CLEANING,
    rarity: ItemRarity.COMMON,
    description: 'Keep your pet looking neat and tidy.',
    emoji: '🪮',
    effect: { cleanliness: 20, happiness: 8 },
    xpReward: 6,
    price: 8,
  },
  perfume: {
    id: 'perfume',
    name: 'Pet Perfume',
    type: ItemType.CLEANING,
    rarity: ItemRarity.EPIC,
    description: 'Makes your pet smell wonderful!',
    emoji: '🌸',
    effect: { cleanliness: 40, happiness: 15 },
    xpReward: 15,
    price: 40,
  },

  // ===== MEDICINE =====
  bandage: {
    id: 'bandage',
    name: 'Bandage',
    type: ItemType.MEDICINE,
    rarity: ItemRarity.COMMON,
    description: 'A simple bandage for minor injuries.',
    emoji: '🩹',
    effect: { health: 20 },
    xpReward: 15,
    price: 15,
  },
  medicine: {
    id: 'medicine',
    name: 'Medicine',
    type: ItemType.MEDICINE,
    rarity: ItemRarity.RARE,
    description: 'Tastes bad but works well!',
    emoji: '💊',
    effect: { health: 40, happiness: -5 },
    xpReward: 20,
    price: 30,
  },
  elixir: {
    id: 'elixir',
    name: 'Health Elixir',
    type: ItemType.MEDICINE,
    rarity: ItemRarity.EPIC,
    description: 'A magical potion that restores health completely!',
    emoji: '🧪',
    effect: { health: 60, happiness: 5 },
    xpReward: 30,
    price: 50,
  },
  golden_apple: {
    id: 'golden_apple',
    name: 'Golden Apple',
    type: ItemType.MEDICINE,
    rarity: ItemRarity.LEGENDARY,
    description: 'A legendary fruit that restores all stats!',
    emoji: '🍎',
    effect: { health: 100, hunger: 30, happiness: 20, cleanliness: 20, energy: 20 },
    xpReward: 100,
    price: 200,
  },
};

// Get item by ID
export const getItem = (itemId: string): ItemDefinition | undefined => {
  return ITEMS[itemId];
};

// Get items by type
export const getItemsByType = (type: ItemType): ItemDefinition[] => {
  return Object.values(ITEMS).filter((item) => item.type === type);
};

// Get starting inventory for new pets
export const getStartingInventory = (): InventoryItem[] => {
  return [
    { itemId: 'fish', quantity: 3 },
    { itemId: 'ball', quantity: 2 },
    { itemId: 'soap', quantity: 2 },
    { itemId: 'medicine', quantity: 1 },
  ];
};

// Get rarity color for display
export const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.COMMON:
      return 'white';
    case ItemRarity.RARE:
      return 'blue';
    case ItemRarity.EPIC:
      return 'magenta';
    case ItemRarity.LEGENDARY:
      return 'yellow';
    default:
      return 'white';
  }
};

// Get rarity icon
export const getRarityIcon = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.COMMON:
      return '⚪';
    case ItemRarity.RARE:
      return '🔵';
    case ItemRarity.EPIC:
      return '🟣';
    case ItemRarity.LEGENDARY:
      return '🟡';
    default:
      return '⚪';
  }
};
