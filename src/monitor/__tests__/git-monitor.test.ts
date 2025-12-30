import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitMonitor } from '../git-monitor';
import { GitCommitType } from '../../types/git';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('GitMonitor', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('analyzeCommitType', () => {
    let monitor: GitMonitor;

    beforeEach(() => {
      // Create a minimal mock for testing just the analyzeCommitType method
      monitor = new GitMonitor();
    });

    it('should detect bug fix commits', () => {
      expect(monitor.analyzeCommitType('fix: resolve crash')).toBe(GitCommitType.BUG_FIX);
      expect(monitor.analyzeCommitType('bug: memory leak')).toBe(GitCommitType.BUG_FIX);
      expect(monitor.analyzeCommitType('fix(api): handle null')).toBe(GitCommitType.BUG_FIX);
      expect(monitor.analyzeCommitType('修复登录问题')).toBe(GitCommitType.BUG_FIX);
    });

    it('should detect feature commits', () => {
      expect(monitor.analyzeCommitType('feat: add new API')).toBe(GitCommitType.FEATURE);
      expect(monitor.analyzeCommitType('add user profile')).toBe(GitCommitType.FEATURE);
      expect(monitor.analyzeCommitType('feat(auth): OAuth')).toBe(GitCommitType.FEATURE);
      expect(monitor.analyzeCommitType('新增功能')).toBe(GitCommitType.FEATURE);
    });

    it('should detect refactor commits', () => {
      expect(monitor.analyzeCommitType('refactor: simplify code')).toBe(GitCommitType.REFACTOR);
      expect(monitor.analyzeCommitType('重构代码')).toBe(GitCommitType.REFACTOR);
      expect(monitor.analyzeCommitType('clean up imports')).toBe(GitCommitType.REFACTOR);
      expect(monitor.analyzeCommitType('优化性能')).toBe(GitCommitType.REFACTOR);
    });

    it('should default to normal for unrecognized patterns', () => {
      expect(monitor.analyzeCommitType('update readme')).toBe(GitCommitType.NORMAL);
      expect(monitor.analyzeCommitType('chore: deps')).toBe(GitCommitType.NORMAL);
    });

    it('should be case insensitive', () => {
      expect(monitor.analyzeCommitType('FIX: bug')).toBe(GitCommitType.BUG_FIX);
      expect(monitor.analyzeCommitType('FEAT: feature')).toBe(GitCommitType.FEATURE);
      expect(monitor.analyzeCommitType('REFACTOR: code')).toBe(GitCommitType.REFACTOR);
    });
  });

  describe('isNightCommit', () => {
    let monitor: GitMonitor;

    beforeEach(() => {
      monitor = new GitMonitor();
    });

    it('should return true for commits between 22:00 and 23:59', () => {
      const date = new Date('2025-01-15T22:30:00');
      expect(monitor.isNightCommit(date)).toBe(true);
    });

    it('should return true for commits between 00:00 and 05:59', () => {
      const date = new Date('2025-01-15T03:00:00');
      expect(monitor.isNightCommit(date)).toBe(true);
    });

    it('should return false for commits during normal hours', () => {
      const date = new Date('2025-01-15T14:00:00');
      expect(monitor.isNightCommit(date)).toBe(false);
    });

    it('should return false for commits at 06:00', () => {
      const date = new Date('2025-01-15T06:00:00');
      expect(monitor.isNightCommit(date)).toBe(false);
    });

    it('should return true for commits at 22:00', () => {
      const date = new Date('2025-01-15T22:00:00');
      expect(monitor.isNightCommit(date)).toBe(true);
    });
  });

  describe('isLargeCommit', () => {
    let monitor: GitMonitor;

    beforeEach(() => {
      monitor = new GitMonitor();
    });

    it('should return true when total changes >= 100', () => {
      expect(monitor.isLargeCommit(80, 20)).toBe(true);
      expect(monitor.isLargeCommit(100, 0)).toBe(true);
      expect(monitor.isLargeCommit(0, 100)).toBe(true);
      expect(monitor.isLargeCommit(50, 50)).toBe(true);
    });

    it('should return false when total changes < 100', () => {
      expect(monitor.isLargeCommit(50, 20)).toBe(false);
      expect(monitor.isLargeCommit(0, 0)).toBe(false);
      expect(monitor.isLargeCommit(99, 0)).toBe(false);
    });
  });

  describe('calculateReward', () => {
    let monitor: GitMonitor;

    beforeEach(() => {
      monitor = new GitMonitor();
    });

    it('should calculate correct base rewards for bug fix', () => {
      const commit = {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'fix: resolve crash',
        author: 'Test',
        date: new Date('2025-01-15T10:00:00'),
      };
      const reward = monitor.calculateReward(commit);

      expect(reward.commitType).toBe(GitCommitType.BUG_FIX);
      expect(reward.baseCoins).toBe(10);
      expect(reward.baseXP).toBe(20);
    });

    it('should calculate correct base rewards for feature', () => {
      const commit = {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'feat: new API',
        author: 'Test',
        date: new Date('2025-01-15T10:00:00'),
      };
      const reward = monitor.calculateReward(commit);

      expect(reward.commitType).toBe(GitCommitType.FEATURE);
      expect(reward.baseCoins).toBe(8);
      expect(reward.baseXP).toBe(15);
    });

    it('should calculate correct base rewards for refactor', () => {
      const commit = {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'refactor: simplify',
        author: 'Test',
        date: new Date('2025-01-15T10:00:00'),
      };
      const reward = monitor.calculateReward(commit);

      expect(reward.commitType).toBe(GitCommitType.REFACTOR);
      expect(reward.baseCoins).toBe(6);
      expect(reward.baseXP).toBe(12);
    });

    it('should apply night owl bonus (2x coins)', () => {
      const commit = {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'fix: bug',
        author: 'Test',
        date: new Date('2025-01-15T23:00:00'), // Night time
      };
      const reward = monitor.calculateReward(commit);

      expect(reward.nightBonus).toBe(true);
      expect(reward.totalCoins).toBe(20); // 10 * 2
    });

    it('should apply large commit bonus', () => {
      const commit = {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'feat: big change',
        author: 'Test',
        date: new Date('2025-01-15T10:00:00'),
        linesAdded: 80,
        linesDeleted: 30,
      };
      const reward = monitor.calculateReward(commit);

      expect(reward.largeBonus).toBe(true);
      expect(reward.totalCoins).toBe(13); // 8 + 5
      expect(reward.totalXP).toBe(25); // 15 + 10
    });
  });

  describe('getCommitTypeName', () => {
    it('should return correct display names', () => {
      expect(GitMonitor.getCommitTypeName(GitCommitType.BUG_FIX)).toBe('Bug Fix');
      expect(GitMonitor.getCommitTypeName(GitCommitType.FEATURE)).toBe('Feature');
      expect(GitMonitor.getCommitTypeName(GitCommitType.REFACTOR)).toBe('Refactor');
      expect(GitMonitor.getCommitTypeName(GitCommitType.NORMAL)).toBe('Normal');
    });
  });

  describe('getCommitTypeColor', () => {
    it('should return correct colors', () => {
      expect(GitMonitor.getCommitTypeColor(GitCommitType.BUG_FIX)).toBe('red');
      expect(GitMonitor.getCommitTypeColor(GitCommitType.FEATURE)).toBe('green');
      expect(GitMonitor.getCommitTypeColor(GitCommitType.REFACTOR)).toBe('blue');
      expect(GitMonitor.getCommitTypeColor(GitCommitType.NORMAL)).toBe('gray');
    });
  });

  describe('getDayDiff', () => {
    it('should return 0 for same day', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-15T18:00:00');
      expect(GitMonitor.getDayDiff(date1, date2)).toBe(0);
    });

    it('should return 1 for consecutive days', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-16T18:00:00');
      expect(GitMonitor.getDayDiff(date1, date2)).toBe(1);
    });

    it('should handle time zone differences correctly', () => {
      // These times are only 2 minutes apart, on the same calendar day
      const date1 = new Date('2025-01-15T23:59:00');
      const date2 = new Date('2025-01-16T00:01:00');
      // After normalizing to midnight, they are 1 day apart
      expect(GitMonitor.getDayDiff(date1, date2)).toBe(1);
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2025-01-15T10:30:00');
      expect(GitMonitor.formatDate(date)).toBe('2025-01-15');
    });

    it('should handle dates at noon (timezone-safe)', () => {
      // Using noon to avoid timezone issues with toISOString()
      const date = new Date('2025-01-15T12:00:00');
      expect(GitMonitor.formatDate(date)).toBe('2025-01-15');
    });
  });
});
