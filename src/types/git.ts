/**
 * Git commit types based on message analysis
 */
export enum GitCommitType {
  BUG_FIX = 'bug_fix',
  FEATURE = 'feature',
  REFACTOR = 'refactor',
  NORMAL = 'normal',
}

/**
 * Git commit information extracted from git log
 */
export interface GitCommitInfo {
  hash: string; // Full commit hash
  shortHash: string; // 7-character short hash
  message: string; // Commit message
  author: string; // Author name
  date: Date; // Commit date
  filesChanged?: number; // Number of files changed
  linesAdded?: number; // Lines added
  linesDeleted?: number; // Lines deleted
}

/**
 * Reward calculation result for a single commit
 */
export interface GitRewardResult {
  commitType: GitCommitType;
  baseCoins: number;
  baseXP: number;
  nightBonus: boolean; // 2x multiplier for 22:00-06:00 commits
  largeBonus: boolean; // Bonus for 100+ line commits
  totalCoins: number;
  totalXP: number;
  bonusReasons: string[]; // Array of bonus descriptions
}

/**
 * Result of processing git commits
 */
export interface GitProcessResult {
  success: boolean;
  newCommits: number; // Number of newly rewarded commits
  totalCoins: number;
  totalXP: number;
  streak: number; // Current streak
  rewards: GitCommitReward[]; // Details of each rewarded commit
  error?: string;
}

/**
 * Single commit reward details
 */
export interface GitCommitReward {
  shortHash: string;
  message: string;
  type: GitCommitType;
  coins: number;
  xp: number;
  bonuses: string[];
}

/**
 * Git statistics for display
 */
export interface GitStats {
  totalCommits: number; // Total rewarded commits
  currentStreak: number; // Current consecutive day streak
  lastCommitHash?: string; // Last rewarded commit hash
  lastCommitDate?: string; // Last rewarded commit date (YYYY-MM-DD)
}
