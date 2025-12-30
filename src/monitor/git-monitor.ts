import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

const execAsync = promisify(exec);

import {
  GitCommitInfo,
  GitCommitType,
  GitRewardResult,
} from '../types/git';

/**
 * Git Monitor class for detecting and analyzing Git commits
 */
export class GitMonitor {
  private repoPath: string | null = null;

  constructor(startPath: string = process.cwd()) {
    this.repoPath = this.findGitRepo(startPath);
  }

  /**
   * Get helpful error message for git-related errors
   */
  private getGitErrorMessage(error: unknown, context: string): string {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common git errors
    if (errorMessage.includes('not a git repository')) {
      return `${chalk.yellow('Not a git repository')}\n${chalk.gray(
        'Initialize a git repository with: git init'
      )}`;
    }

    if (errorMessage.includes('fatal:')) {
      return `${chalk.red('Git error:')}\n${chalk.gray(errorMessage)}`;
    }

    if (errorMessage.includes('ENOENT') || errorMessage.includes('git: not found')) {
      return `${chalk.yellow('Git not found')}\n${chalk.gray(
        'Install git from: https://git-scm.com/downloads'
      )}`;
    }

    return `${chalk.red(`${context} failed:`)}\n${chalk.gray(errorMessage)}`;
  }

  /**
   * Check if Git is installed and provide helpful message if not
   */
  static async isGitAvailable(): Promise<{ available: boolean; message?: string }> {
    try {
      await execAsync('git --version');
      return { available: true };
    } catch {
      return {
        available: false,
        message: `${chalk.yellow('Git not found')}\n${chalk.gray(
          'Install git from: https://git-scm.com/downloads'
        )}`,
      };
    }
  }

  /**
   * Search for .git folder in current or parent directories
   */
  private findGitRepo(startPath: string): string | null {
    let currentPath = path.resolve(startPath);

    while (currentPath !== path.dirname(currentPath)) {
      const gitPath = path.join(currentPath, '.git');
      if (fs.existsSync(gitPath)) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  /**
   * Check if we're inside a Git repository
   */
  isInGitRepo(): boolean {
    return this.repoPath !== null;
  }

  /**
   * Get the repository path
   */
  getRepoPath(): string | null {
    return this.repoPath;
  }

  /**
   * Get recent commits from the repository
   */
  async getLatestCommits(limit: number = 20): Promise<GitCommitInfo[]> {
    if (!this.repoPath) {
      return [];
    }

    try {
      // Get commit log with formatted output
      const { stdout } = await execAsync(
        `git log -n ${limit} --pretty=format:"%H|%s|%an|%ad" --date=iso`,
        { cwd: this.repoPath }
      );

      return this.parseGitLog(stdout);
    } catch (error) {
      const message = this.getGitErrorMessage(error, 'Getting git log');
      console.error(message);
      return [];
    }
  }

  /**
   * Parse git log output into GitCommitInfo array
   */
  private parseGitLog(output: string): GitCommitInfo[] {
    if (!output.trim()) {
      return [];
    }

    const lines = output.trim().split('\n');
    const commits: GitCommitInfo[] = [];

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 4) {
        const [fullHash, message, author, dateStr] = parts;
        const shortHash = fullHash.substring(0, 7);

        commits.push({
          hash: fullHash,
          shortHash,
          message,
          author,
          date: new Date(dateStr),
        });
      }
    }

    return commits;
  }

  /**
   * Get file changes for a specific commit
   */
  async getCommitChanges(commitHash: string): Promise<{
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  } | null> {
    if (!this.repoPath) {
      return null;
    }

    try {
      const { stdout } = await execAsync(
        `git show ${commitHash} --shortstat --format=""`,
        { cwd: this.repoPath }
      );

      return this.parseShortStat(stdout);
    } catch {
      return null;
    }
  }

  /**
   * Parse git shortstat output
   * Example: " 3 files changed, 45 insertions(+), 12 deletions(-)"
   */
  private parseShortStat(output: string): {
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
  } {
    const result = {
      filesChanged: 0,
      linesAdded: 0,
      linesDeleted: 0,
    };

    if (!output.trim()) {
      return result;
    }

    // Extract files changed
    const filesMatch = output.match(/(\d+)\s+files?\s+changed/);
    if (filesMatch) {
      result.filesChanged = parseInt(filesMatch[1], 10);
    }

    // Extract insertions
    const insertionsMatch = output.match(/(\d+)\s+insertions?\([+]\)/);
    if (insertionsMatch) {
      result.linesAdded = parseInt(insertionsMatch[1], 10);
    }

    // Extract deletions
    const deletionsMatch = output.match(/(\d+)\s+deletions?\([-]\)/);
    if (deletionsMatch) {
      result.linesDeleted = parseInt(deletionsMatch[1], 10);
    }

    return result;
  }

  /**
   * Analyze commit message to determine type
   */
  analyzeCommitType(message: string): GitCommitType {
    const lowerMessage = message.toLowerCase();

    // Bug fix patterns
    if (
      lowerMessage.includes('fix') ||
      lowerMessage.includes('bug') ||
      lowerMessage.includes('修复') ||
      lowerMessage.includes('bugfix')
    ) {
      return GitCommitType.BUG_FIX;
    }

    // Feature patterns
    if (
      lowerMessage.includes('feat') ||
      lowerMessage.includes('add') ||
      lowerMessage.includes('新') ||
      lowerMessage.includes('新增') ||
      lowerMessage.includes('feature')
    ) {
      return GitCommitType.FEATURE;
    }

    // Refactor patterns
    if (
      lowerMessage.includes('refactor') ||
      lowerMessage.includes('重构') ||
      lowerMessage.includes('clean') ||
      lowerMessage.includes('优化')
    ) {
      return GitCommitType.REFACTOR;
    }

    return GitCommitType.NORMAL;
  }

  /**
   * Check if commit was made during "night owl" hours (22:00-06:00)
   */
  isNightCommit(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 22 || hour < 6;
  }

  /**
   * Check if commit is "large" (100+ total lines changed)
   */
  isLargeCommit(linesAdded: number, linesDeleted: number): boolean {
    return linesAdded + linesDeleted >= 100;
  }

  /**
   * Calculate reward for a commit
   */
  calculateReward(commit: GitCommitInfo): GitRewardResult {
    const type = this.analyzeCommitType(commit.message);

    // Base rewards
    let baseCoins = 5;
    let baseXP = 10;

    switch (type) {
      case GitCommitType.BUG_FIX:
        baseCoins = 10;
        baseXP = 20;
        break;
      case GitCommitType.FEATURE:
        baseCoins = 8;
        baseXP = 15;
        break;
      case GitCommitType.REFACTOR:
        baseCoins = 6;
        baseXP = 12;
        break;
      case GitCommitType.NORMAL:
      default:
        baseCoins = 5;
        baseXP = 10;
        break;
    }

    const bonusReasons: string[] = [];
    let totalCoins = baseCoins;
    let totalXP = baseXP;

    // Night owl bonus (2x coins)
    const nightBonus = this.isNightCommit(commit.date);
    if (nightBonus) {
      totalCoins *= 2;
      bonusReasons.push('🦉 Night Owl Bonus! 2x coins!');
    }

    // Large commit bonus
    const linesChanged = (commit.linesAdded || 0) + (commit.linesDeleted || 0);
    const largeBonus = this.isLargeCommit(commit.linesAdded || 0, commit.linesDeleted || 0);
    if (largeBonus) {
      totalCoins += 5;
      totalXP += 10;
      bonusReasons.push(`📦 Large Commit Bonus! (${linesChanged} lines)`);
    }

    return {
      commitType: type,
      baseCoins,
      baseXP,
      nightBonus,
      largeBonus,
      totalCoins,
      totalXP,
      bonusReasons,
    };
  }

  /**
   * Get commits since a specific commit (exclusive)
   */
  async getCommitsSince(lastCommitHash: string): Promise<GitCommitInfo[]> {
    if (!this.repoPath) {
      return [];
    }

    try {
      const { stdout } = await execAsync(
        `git log ${lastCommitHash}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=iso`,
        { cwd: this.repoPath }
      );

      const commits = this.parseGitLog(stdout);

      // Fetch stats for each commit
      for (const commit of commits) {
        const changes = await this.getCommitChanges(commit.hash);
        if (changes) {
          commit.filesChanged = changes.filesChanged;
          commit.linesAdded = changes.linesAdded;
          commit.linesDeleted = changes.linesDeleted;
        }
      }

      return commits;
    } catch (error) {
      const message = this.getGitErrorMessage(error, 'Getting commits since');
      console.error(message);
      return [];
    }
  }

  /**
   * Get all commits (for initial setup when lastCommitHash is undefined)
   */
  async getAllCommits(limit: number = 50): Promise<GitCommitInfo[]> {
    const commits = await this.getLatestCommits(limit);

    // Fetch stats for each commit
    for (const commit of commits) {
      const changes = await this.getCommitChanges(commit.hash);
      if (changes) {
        commit.filesChanged = changes.filesChanged;
        commit.linesAdded = changes.linesAdded;
        commit.linesDeleted = changes.linesDeleted;
      }
    }

    return commits;
  }

  /**
   * Get commit type display name
   */
  static getCommitTypeName(type: GitCommitType): string {
    switch (type) {
      case GitCommitType.BUG_FIX:
        return 'Bug Fix';
      case GitCommitType.FEATURE:
        return 'Feature';
      case GitCommitType.REFACTOR:
        return 'Refactor';
      case GitCommitType.NORMAL:
      default:
        return 'Normal';
    }
  }

  /**
   * Get commit type color for terminal display
   */
  static getCommitTypeColor(type: GitCommitType): string {
    switch (type) {
      case GitCommitType.BUG_FIX:
        return 'red';
      case GitCommitType.FEATURE:
        return 'green';
      case GitCommitType.REFACTOR:
        return 'blue';
      case GitCommitType.NORMAL:
      default:
        return 'gray';
    }
  }

  /**
   * Calculate day difference between two dates (for streak calculation)
   */
  static getDayDiff(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date as YYYY-MM-DD
   */
  static formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}

/**
 * Create a GitMonitor instance
 */
export const createGitMonitor = (startPath?: string): GitMonitor => {
  return new GitMonitor(startPath);
};
