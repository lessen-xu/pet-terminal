export interface PetStats {
  hunger: number;
  happiness: number;
  health: number;
  cleanliness: number;
  energy: number;
}

export interface StatChange {
  stat: keyof PetStats;
  delta: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  statChanges: StatChange[];
  xpGained: number;
  levelUp?: boolean;
  newLevel?: number;
}

export const clampStat = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

export const getStatColor = (value: number): string => {
  if (value >= 80) return 'green';
  if (value >= 50) return 'yellow';
  if (value >= 30) return 'orange';
  return 'red';
};
