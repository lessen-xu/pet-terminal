import { describe, it, expect, beforeEach } from 'vitest';
import { TimeDecay } from '../time-decay';
import type { PetStats } from '../../types/stats';

describe('TimeDecay', () => {
  let timeDecay: TimeDecay;
  let mockStats: PetStats;

  beforeEach(() => {
    timeDecay = new TimeDecay();
    mockStats = {
      hunger: 100,
      happiness: 100,
      health: 100,
      cleanliness: 100,
      energy: 100,
    };
  });

  describe('calculateDecay', () => {
    it('should return empty result for 0 hours', () => {
      const result = timeDecay.calculateDecay(0, mockStats, false);
      expect(result.hoursPassed).toBe(0);
      expect(result.statChanges).toHaveLength(0);
    });

    it('should decay hunger over time', () => {
      const result = timeDecay.calculateDecay(1, mockStats, false);
      expect(result.newStats?.hunger).toBeLessThan(100);
      expect(result.newStats?.hunger).toBe(97); // 100 - 3*1
    });

    it('should decay happiness over time', () => {
      const result = timeDecay.calculateDecay(3, mockStats, false);
      expect(result.newStats?.happiness).toBeLessThan(100);
      // 3 hours * 0.67 = ~2 decay
      expect(result.newStats?.happiness).toBeLessThanOrEqual(98);
    });

    it('should decay energy when awake', () => {
      const result = timeDecay.calculateDecay(1, mockStats, false);
      expect(result.newStats?.energy).toBe(98); // 100 - 2*1
    });

    it('should recover energy when sleeping (capped at 100)', () => {
      // Energy recovers but is clamped at 100
      const result = timeDecay.calculateDecay(1, mockStats, true);
      expect(result.newStats?.energy).toBe(100); // Capped at max
    });

    it('should trigger health decay when stats are critical', () => {
      const criticalStats = { ...mockStats, hunger: 10, happiness: 10, cleanliness: 10 };
      const result = timeDecay.calculateDecay(1, criticalStats, false);
      expect(result.healthDecayTriggered).toBe(true);
    });

    it('should not trigger health decay when stats are good', () => {
      const result = timeDecay.calculateDecay(1, mockStats, false);
      expect(result.healthDecayTriggered).toBe(false);
    });

    it('should clamp stats between 0 and 100', () => {
      const result = timeDecay.calculateDecay(100, mockStats, false);
      if (result.newStats) {
        Object.values(result.newStats).forEach((stat) => {
          expect(stat).toBeGreaterThanOrEqual(0);
          expect(stat).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  describe('isAbandoned', () => {
    it('should return false for fresh pet', () => {
      expect(timeDecay.isAbandoned(mockStats, 1)).toBe(false);
    });

    it('should return false for healthy pet after 24 hours', () => {
      expect(timeDecay.isAbandoned(mockStats, 24)).toBe(false);
    });

    it('should return true for neglected pet after 49 hours', () => {
      // Average stat needs to be below 20 for >48 hours
      const neglectedStats = { ...mockStats, hunger: 5, happiness: 5, health: 5, cleanliness: 5, energy: 5 };
      expect(timeDecay.isAbandoned(neglectedStats, 49)).toBe(true);
    });

    it('should return false at exactly 48 hours', () => {
      // Need MORE than 48 hours
      const neglectedStats = { ...mockStats, hunger: 5, happiness: 5, health: 5, cleanliness: 5, energy: 5 };
      expect(timeDecay.isAbandoned(neglectedStats, 48)).toBe(false);
    });
  });

  describe('getTimeMessage', () => {
    it('should return "Just now" for very recent time', () => {
      expect(timeDecay.getTimeMessage(0)).toBe('Just now');
    });

    it('should return minutes for less than an hour', () => {
      expect(timeDecay.getTimeMessage(0.5)).toBe('30 minutes ago');
    });

    it('should return hours for less than a day', () => {
      expect(timeDecay.getTimeMessage(2)).toBe('2 hours ago');
    });

    it('should return days for longer periods', () => {
      expect(timeDecay.getTimeMessage(48)).toBe('2 days ago');
    });
  });

  describe('getSeverity', () => {
    it('should return "none" for less than 1 hour', () => {
      expect(timeDecay.getSeverity(0.5)).toBe('none');
    });

    it('should return "low" for 1-5 hours', () => {
      expect(timeDecay.getSeverity(3)).toBe('low');
    });

    it('should return "medium" for 6-23 hours', () => {
      expect(timeDecay.getSeverity(12)).toBe('medium');
    });

    it('should return "high" for 24-71 hours', () => {
      expect(timeDecay.getSeverity(48)).toBe('high');
    });

    it('should return "critical" for 72+ hours', () => {
      expect(timeDecay.getSeverity(100)).toBe('critical');
    });
  });
});
