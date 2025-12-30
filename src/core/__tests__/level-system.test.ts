import { describe, it, expect } from 'vitest';
import { LevelSystem } from '../level-system';

describe('LevelSystem', () => {
  describe('getXPForLevel', () => {
    it('should return 0 for level 0', () => {
      expect(LevelSystem.getXPForLevel(0)).toBe(0);
    });

    it('should return 0 for level 1', () => {
      expect(LevelSystem.getXPForLevel(1)).toBe(0);
    });

    it('should return 300 for level 2', () => {
      // 100 * 2 * 1.5^1 = 200 * 1.5 = 300
      expect(LevelSystem.getXPForLevel(2)).toBe(300);
    });

    it('should return 675 for level 3', () => {
      // 100 * 3 * 1.5^2 = 300 * 2.25 = 675
      expect(LevelSystem.getXPForLevel(3)).toBe(675);
    });

    it('should calculate XP correctly for higher levels', () => {
      // Formula: 100 * level * 1.5^(level-1)
      expect(LevelSystem.getXPForLevel(5)).toBe(2531); // 100 * 5 * 1.5^4 = 500 * 5.0625
      expect(LevelSystem.getXPForLevel(10)).toBe(38443); // 100 * 10 * 1.5^9 = 1000 * 38.443
    });
  });

  describe('getXPToNextLevel', () => {
    it('should return XP needed to reach level 2 from level 1 with 0 XP', () => {
      expect(LevelSystem.getXPToNextLevel(1, 0)).toBe(300);
    });

    it('should return 0 when already at required XP', () => {
      expect(LevelSystem.getXPToNextLevel(1, 300)).toBe(0);
    });

    it('should return remaining XP needed', () => {
      expect(LevelSystem.getXPToNextLevel(1, 150)).toBe(150);
    });
  });

  describe('getLevelProgress', () => {
    it('should return 0 when at start of level', () => {
      expect(LevelSystem.getLevelProgress(1, 0)).toBe(0);
    });

    it('should return 100 when at next level threshold', () => {
      expect(LevelSystem.getLevelProgress(1, 300)).toBe(100);
    });

    it('should calculate correct percentage', () => {
      // Level 1 starts at 0 XP, Level 2 starts at 300 XP
      // 150 XP is 50% of the way
      expect(LevelSystem.getLevelProgress(1, 150)).toBe(50);
    });
  });

  describe('checkLevelUp', () => {
    it('should return false when not enough XP', () => {
      expect(LevelSystem.checkLevelUp(1, 200)).toBe(false);
    });

    it('should return true when enough XP for next level', () => {
      expect(LevelSystem.checkLevelUp(1, 300)).toBe(true);
    });

    it('should return true when enough XP for multiple levels', () => {
      expect(LevelSystem.checkLevelUp(1, 700)).toBe(true);
    });
  });

  describe('calculateNewLevel', () => {
    it('should stay at same level when not enough XP', () => {
      expect(LevelSystem.calculateNewLevel(1, 200)).toBe(1);
    });

    it('should level up once when reaching threshold', () => {
      expect(LevelSystem.calculateNewLevel(1, 300)).toBe(2);
    });

    it('should level up multiple times when way past threshold', () => {
      expect(LevelSystem.calculateNewLevel(1, 700)).toBe(3);
    });
  });

  describe('getLevelTitle', () => {
    it('should return Baby for levels 1-5', () => {
      expect(LevelSystem.getLevelTitle(1)).toBe('Baby');
      expect(LevelSystem.getLevelTitle(5)).toBe('Baby');
    });

    it('should return Young for levels 6-10', () => {
      expect(LevelSystem.getLevelTitle(6)).toBe('Young');
      expect(LevelSystem.getLevelTitle(10)).toBe('Young');
    });

    it('should return Adult for levels 11-20', () => {
      expect(LevelSystem.getLevelTitle(11)).toBe('Adult');
      expect(LevelSystem.getLevelTitle(20)).toBe('Adult');
    });

    it('should return Expert for levels 21-30', () => {
      expect(LevelSystem.getLevelTitle(21)).toBe('Expert');
      expect(LevelSystem.getLevelTitle(30)).toBe('Expert');
    });

    it('should return Master for levels 31-50', () => {
      expect(LevelSystem.getLevelTitle(31)).toBe('Master');
      expect(LevelSystem.getLevelTitle(50)).toBe('Master');
    });

    it('should return Legend for levels 51+', () => {
      expect(LevelSystem.getLevelTitle(51)).toBe('Legend');
      expect(LevelSystem.getLevelTitle(100)).toBe('Legend');
    });
  });

  describe('getStatBonus', () => {
    it('should return 0 for levels below 5', () => {
      expect(LevelSystem.getStatBonus(1)).toBe(0);
      expect(LevelSystem.getStatBonus(4)).toBe(0);
    });

    it('should return 5 for level 5', () => {
      expect(LevelSystem.getStatBonus(5)).toBe(5);
    });

    it('should return 10 for level 10', () => {
      expect(LevelSystem.getStatBonus(10)).toBe(10);
    });

    it('should calculate bonus correctly', () => {
      expect(LevelSystem.getStatBonus(25)).toBe(25);
      expect(LevelSystem.getStatBonus(50)).toBe(50);
    });
  });
});
