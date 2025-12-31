import * as vscode from 'vscode';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { GitMonitor } from './git-monitor';
import { GitCommitInfo, GitCommitType } from '../types/git';
import { LevelSystem } from '../core/level-system';
import { CoinReason } from '../core/shop';
import { clampStat } from '../types/stats';

/**
 * Minimal interface for VS Code's Git API
 * The actual API is from the 'vscode.git' extension
 */
interface VSCodeGitAPI {
  repositories: VSCodeGitRepository[];
}

interface VSCodeGitRepository {
  rootUri: vscode.Uri;
  state: {
    HEAD?: {
      commit?: {
        hash: string;
        message: string;
        author?: string;
        date?: number; // timestamp in seconds
      };
    };
  };
  onDidChange: vscode.Event<void>;
}

/**
 * VSCodeGitWatcher - Native VS Code Git integration
 *
 * Uses VS Code's Git extension API to detect commits in real-time
 * without polling or running child_process commands.
 */
export class VSCodeGitWatcher {
  private lastCommitHashes: Map<string, string> = new Map();
  private disposables: vscode.Disposable[] = [];
  private gitMonitor: GitMonitor;

  constructor(private onPetUpdate: () => void) {
    // Create GitMonitor instance (only for its calculation methods, not exec)
    this.gitMonitor = new GitMonitor();
  }

  /**
   * Start watching Git repositories
   */
  start(): void {
    // Wait for Git extension to activate
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      console.log('Git extension not found');
      return;
    }

    // If extension is not active, wait for it
    if (!gitExtension.isActive) {
      gitExtension.activate().then(() => {
        this.initializeWatching();
      });
    } else {
      this.initializeWatching();
    }
  }

  /**
   * Initialize repository watching after Git extension is ready
   */
  private initializeWatching(): void {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) return;

    const gitAPI = gitExtension.exports.getAPI(1) as VSCodeGitAPI;

    if (!gitAPI || !gitAPI.repositories) {
      console.log('Git API not available');
      return;
    }

    // Track each existing repository
    for (const repo of gitAPI.repositories) {
      this.trackRepository(repo);
    }

    // Periodically check for new repositories (every 30 seconds)
    const newRepoCheck = setInterval(() => {
      const refreshedAPI = gitExtension.exports.getAPI(1) as VSCodeGitAPI;
      if (refreshedAPI && refreshedAPI.repositories) {
        for (const repo of refreshedAPI.repositories) {
          const repoPath = repo.rootUri.fsPath;
          if (!this.lastCommitHashes.has(repoPath)) {
            this.trackRepository(repo);
          }
        }
      }
    }, 30000);

    this.disposables.push(
      new vscode.Disposable(() => clearInterval(newRepoCheck))
    );
  }

  /**
   * Track a single repository for changes
   */
  private trackRepository(repo: VSCodeGitRepository): void {
    const repoPath = repo.rootUri.fsPath;

    // Store current commit hash
    const currentHash = repo.state.HEAD?.commit?.hash;
    if (currentHash) {
      this.lastCommitHashes.set(repoPath, currentHash);
    }

    // Listen for repository state changes
    const disposable = repo.onDidChange(() => {
      this.handleRepoChange(repo);
    });

    this.disposables.push(disposable);
  }

  /**
   * Handle repository state change
   */
  private async handleRepoChange(repo: VSCodeGitRepository): Promise<void> {
    const repoPath = repo.rootUri.fsPath;
    const commit = repo.state.HEAD?.commit;

    // Check if commit exists
    if (!commit) {
      return;
    }

    const newHash = commit.hash;
    const lastHash = this.lastCommitHashes.get(repoPath);

    // Check if HEAD commit changed (new commit detected)
    if (newHash !== lastHash) {
      const commitInfo = this.convertToGitCommitInfo(commit);
      await this.processCommit(commitInfo);
      this.lastCommitHashes.set(repoPath, newHash);
    }
  }

  /**
   * Convert VS Code commit data to GitCommitInfo
   */
  private convertToGitCommitInfo(commit: any): GitCommitInfo {
    // Guard against undefined (TypeScript safety)
    if (!commit) {
      throw new Error('Commit object is undefined');
    }

    return {
      hash: commit.hash,
      shortHash: commit.hash ? commit.hash.substring(0, 7) : 'unknown',
      message: commit.message || 'No message',
      author: commit.author || 'Unknown',
      date: commit.date ? new Date(commit.date * 1000) : new Date(),
      // Note: VS Code Git API doesn't provide file/line change counts
      // Large commit bonus won't apply, but other bonuses work
    };
  }

  /**
   * Process a new commit - calculate rewards and update pet
   */
  private async processCommit(commit: GitCommitInfo): Promise<void> {
    const db = new Database();

    if (!db.hasPet()) {
      return; // No pet to reward
    }

    // Load pet
    const pet = await Pet.loadOrCreate(db);
    const data = pet.getData();

    // Calculate reward using GitMonitor (reuses logic!)
    const reward = this.gitMonitor.calculateReward(commit);

    // Determine coin reason based on commit type
    let coinReason: CoinReason;
    switch (reward.commitType) {
      case GitCommitType.BUG_FIX:
        coinReason = CoinReason.GIT_COMMIT_BUG_FIX;
        break;
      case GitCommitType.FEATURE:
        coinReason = CoinReason.GIT_COMMIT_FEATURE;
        break;
      case GitCommitType.REFACTOR:
        coinReason = CoinReason.GIT_COMMIT_REFACTOR;
        break;
      default:
        coinReason = CoinReason.GIT_COMMIT_NORMAL;
        break;
    }

    // Get the current pet data to modify
    const petData = db.getPet()!;
    const oldLevel = petData.level;

    // Apply XP
    petData.experience += reward.totalXP;

    // Check for level up
    const newLevel = LevelSystem.calculateNewLevel(
      petData.level,
      petData.experience
    );

    if (newLevel > petData.level) {
      petData.level = newLevel;
      // Bonus stats on level up
      petData.stats = {
        hunger: clampStat(petData.stats.hunger + 5),
        happiness: clampStat(petData.stats.happiness + 5),
        health: clampStat(petData.stats.health + 5),
        cleanliness: clampStat(petData.stats.cleanliness + 5),
        energy: clampStat(petData.stats.energy + 5),
      };
    }

    // Apply coins
    if (typeof petData.coins !== 'number') {
      petData.coins = 0;
    }
    petData.coins += reward.totalCoins;

    // Track coin history
    if (!Array.isArray(petData.coinHistory)) {
      petData.coinHistory = [];
    }
    petData.coinHistory.push({
      amount: reward.totalCoins,
      reason: coinReason,
      timestamp: new Date().toISOString(),
    });

    // Apply stat bonuses (陪伴效果 - pet enjoys watching you code)
    const streak = petData.gitStreak || 0;
    let hungerBonus = 15;
    let happinessBonus = 10;

    if (streak >= 7) {
      hungerBonus += 5;
      happinessBonus += 5;
    } else if (streak >= 3) {
      hungerBonus += 2;
      happinessBonus += 2;
    }

    petData.stats.hunger = clampStat(petData.stats.hunger + hungerBonus);
    petData.stats.happiness = clampStat(petData.stats.happiness + happinessBonus);

    // Update Git tracking
    petData.lastGitCommit = commit.shortHash;
    petData.gitCommitCount = (petData.gitCommitCount || 0) + 1;

    // Update streak
    this.updateStreak(petData, commit);

    // Update timestamp
    petData.lastUpdated = new Date().toISOString();
    petData.lastInteraction = new Date().toISOString();

    // Save changes
    db.savePet(petData);

    // Show notification
    const bonuses = reward.bonusReasons.length > 0
      ? ' | ' + reward.bonusReasons.join(', ')
      : '';

    vscode.window.showInformationMessage(
      `🎉 Commit detected! +${reward.totalXP} XP, 🪙 +${reward.totalCoins}${bonuses}`
    );

    // Show level up notification
    if (newLevel > oldLevel) {
      vscode.window.showInformationMessage(
        `🌟 Level ${newLevel} reached! ${data.name} is getting stronger!`
      );
    }

    // Refresh status bar
    this.onPetUpdate();
  }

  /**
   * Update Git streak based on commit date
   */
  private updateStreak(petData: any, commit: GitCommitInfo): void {
    const commitDate = this.formatDate(commit.date);
    const lastDate = petData.lastGitDate;

    if (!lastDate) {
      // First commit - start streak
      petData.lastGitDate = commitDate;
      petData.gitStreak = 1;
      return;
    }

    const lastDateObj = new Date(lastDate);
    const commitDateObj = new Date(commitDate);
    const dayDiff = Math.round(
      (commitDateObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 0) {
      // Same day - streak continues, don't increment
      return;
    } else if (dayDiff === 1) {
      // Next day - increment streak
      petData.gitStreak = (petData.gitStreak || 0) + 1;
    } else {
      // Streak broken - start new streak
      petData.gitStreak = 1;
    }

    petData.lastGitDate = commitDate;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  /**
   * Stop watching and dispose resources
   */
  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
    this.lastCommitHashes.clear();
  }
}
