export class LevelSystem {
  /**
   * Calculate total XP required for a given level
   * Formula: 100 * level * 1.5^(level-1)
   */
  static getXPForLevel(level: number): number {
    if (level <= 0) return 0;
    if (level === 1) return 0;
    return Math.floor(100 * level * Math.pow(1.5, level - 1));
  }

  /**
   * Calculate XP needed to reach the next level
   */
  static getXPToNextLevel(currentLevel: number, currentXP: number): number {
    const nextLevel = currentLevel + 1;
    const requiredXP = this.getXPForLevel(nextLevel);
    return Math.max(0, requiredXP - currentXP);
  }

  /**
   * Get the progress percentage towards the next level
   */
  static getLevelProgress(currentLevel: number, currentXP: number): number {
    const currentLevelBaseXP = this.getXPForLevel(currentLevel);
    const nextLevelBaseXP = this.getXPForLevel(currentLevel + 1);
    const xpInRange = nextLevelBaseXP - currentLevelBaseXP;
    const xpProgress = currentXP - currentLevelBaseXP;

    if (xpInRange <= 0) return 100;
    return Math.min(100, Math.round((xpProgress / xpInRange) * 100));
  }

  /**
   * Check if the given XP is enough for a level up
   */
  static checkLevelUp(currentLevel: number, newXP: number): boolean {
    return newXP >= this.getXPForLevel(currentLevel + 1);
  }

  /**
   * Calculate the new level after gaining XP
   */
  static calculateNewLevel(currentLevel: number, newXP: number): number {
    let newLevel = currentLevel;
    while (this.checkLevelUp(newLevel, newXP)) {
      newLevel++;
    }
    return newLevel;
  }

  /**
   * Get the level title/rank
   */
  static getLevelTitle(level: number): string {
    if (level <= 5) return 'Baby';
    if (level <= 10) return 'Young';
    if (level <= 20) return 'Adult';
    if (level <= 30) return 'Expert';
    if (level <= 50) return 'Master';
    return 'Legend';
  }

  /**
   * Get max stats bonus based on level
   */
  static getStatBonus(level: number): number {
    return Math.floor(level / 5) * 5;
  }
}
