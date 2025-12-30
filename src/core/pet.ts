import { PetData, DEFAULT_STATS, generatePetId, STARTING_COINS, CoinEntry } from '../types/pet';
import { PetSpecies, MoodState } from '../types/species';
import { PetStats, StatChange, ActionResult, clampStat } from '../types/stats';
import { TimeSyncResult } from '../types/time';
import { Database } from './database';
import { LevelSystem } from './level-system';
import { TimeDecay } from './time-decay';
import { Inventory } from './inventory';
import { getStartingInventory, getItem, ItemType } from '../types/items';
import { CoinReason, Shop } from './shop';
import { GitMonitor } from '../monitor/git-monitor';
import { GitCommitInfo, GitCommitType, GitProcessResult, GitCommitReward } from '../types/git';
import { createAutoCare } from './auto-care';

export class Pet {
  private data: PetData;
  private db: Database;
  private timeDecay: TimeDecay;
  private synced: boolean = false;
  private inventory: Inventory;

  private constructor(data: PetData, db: Database) {
    this.data = data;
    this.db = db;
    this.timeDecay = new TimeDecay();
    this.inventory = new Inventory(data.inventory || []);
  }

  static async loadOrCreate(db: Database): Promise<Pet> {
    if (db.hasPet()) {
      const petData = db.getPet()!;
      const pet = new Pet(petData, db);
      // Auto-sync time on load
      pet.syncTime();
      return pet;
    }

    // Create a default pet
    const now = new Date().toISOString();
    const startingInventory = getStartingInventory();
    const defaultData: PetData = {
      id: generatePetId(),
      name: 'Buddy',
      species: PetSpecies.CAT,
      level: 1,
      experience: 0,
      stats: { ...DEFAULT_STATS },
      mood: MoodState.HAPPY,
      isSleeping: false,
      birthDate: now,
      lastInteraction: now,
      lastSaveTime: now,
      lastUpdated: now,
      totalInteractions: 0,
      inventory: startingInventory,
      coins: STARTING_COINS,
      coinHistory: [],
      // Git tracking fields
      lastGitCommit: undefined,
      gitCommitCount: 0,
      gitStreak: 0,
      lastGitDate: undefined,
    };
    db.savePet(defaultData);
    return new Pet(defaultData, db);
  }

  static createNew(
    db: Database,
    name: string,
    species: PetSpecies,
  ): PetData {
    const now = new Date().toISOString();
    const startingInventory = getStartingInventory();
    const newPet: PetData = {
      id: generatePetId(),
      name,
      species,
      level: 1,
      experience: 0,
      stats: { ...DEFAULT_STATS },
      mood: MoodState.HAPPY,
      isSleeping: false,
      birthDate: now,
      lastInteraction: now,
      lastSaveTime: now,
      lastUpdated: now,
      totalInteractions: 0,
      inventory: startingInventory,
      coins: STARTING_COINS,
      coinHistory: [],
      // Git tracking fields
      lastGitCommit: undefined,
      gitCommitCount: 0,
      gitStreak: 0,
      lastGitDate: undefined,
    };
    db.savePet(newPet);
    return newPet;
  }

  // ===== ACTIONS =====

  feed(): ActionResult {
    if (this.data.isSleeping) {
      return {
        success: false,
        message: `${this.data.name} is sleeping! Wake them up first.`,
        statChanges: [],
        xpGained: 0,
      };
    }

    if (this.data.stats.hunger >= 95) {
      return {
        success: false,
        message: `${this.data.name} is too full to eat more!`,
        statChanges: [],
        xpGained: 0,
      };
    }

    const changes: StatChange[] = [
      { stat: 'hunger', delta: 25 },
      { stat: 'happiness', delta: 4 },
      { stat: 'health', delta: 2 },
      { stat: 'cleanliness', delta: -4 },
      { stat: 'energy', delta: -2 },
    ];

    return this.performAction(changes, 10, 'fed');
  }

  play(): ActionResult {
    if (this.data.isSleeping) {
      return {
        success: false,
        message: `${this.data.name} is sleeping! Wake them up first.`,
        statChanges: [],
        xpGained: 0,
      };
    }

    if (this.data.stats.energy < 15) {
      return {
        success: false,
        message: `${this.data.name} is too tired to play! Let them rest.`,
        statChanges: [],
        xpGained: 0,
      };
    }

    const changes: StatChange[] = [
      { stat: 'hunger', delta: -5 },
      { stat: 'happiness', delta: 23 },
      { stat: 'health', delta: 1 },
      { stat: 'cleanliness', delta: -4 },
      { stat: 'energy', delta: -20 },
    ];

    return this.performAction(changes, 15, 'played with');
  }

  clean(): ActionResult {
    if (this.data.isSleeping) {
      return {
        success: false,
        message: `${this.data.name} is sleeping! Wake them up first.`,
        statChanges: [],
        xpGained: 0,
      };
    }

    if (this.data.stats.cleanliness >= 95) {
      return {
        success: false,
        message: `${this.data.name} is already very clean!`,
        statChanges: [],
        xpGained: 0,
      };
    }

    const changes: StatChange[] = [
      { stat: 'hunger', delta: -2 },
      { stat: 'happiness', delta: 5 },
      { stat: 'health', delta: 3 },
      { stat: 'cleanliness', delta: 35 },
      { stat: 'energy', delta: -3 },
    ];

    return this.performAction(changes, 8, 'cleaned');
  }

  sleep(): ActionResult {
    if (!this.data.isSleeping) {
      // Going to sleep
      this.data.isSleeping = true;
      this.updateInteraction();
      this.save();

      return {
        success: true,
        message: `${this.data.name} is now sleeping. Shh! 💤`,
        statChanges: [],
        xpGained: 5,
      };
    } else {
      // Waking up
      const changes: StatChange[] = [
        { stat: 'hunger', delta: -5 },
        { stat: 'happiness', delta: 8 },
        { stat: 'health', delta: 5 },
        { stat: 'cleanliness', delta: -2 },
        { stat: 'energy', delta: 80 },
      ];

      this.data.isSleeping = false;
      const result = this.performAction(changes, 5, 'woke up');
      result.message = `${this.data.name} woke up refreshed! ☀️`;
      return result;
    }
  }

  heal(): ActionResult {
    if (this.data.isSleeping) {
      return {
        success: false,
        message: `${this.data.name} is sleeping! Wake them up first.`,
        statChanges: [],
        xpGained: 0,
      };
    }

    if (this.data.stats.health >= 90) {
      return {
        success: false,
        message: `${this.data.name} is already very healthy!`,
        statChanges: [],
        xpGained: 0,
      };
    }

    const changes: StatChange[] = [
      { stat: 'hunger', delta: -3 },
      { stat: 'happiness', delta: 2 },
      { stat: 'health', delta: 30 },
      { stat: 'cleanliness', delta: 5 },
      { stat: 'energy', delta: -5 },
    ];

    return this.performAction(changes, 20, 'healed');
  }

  // ===== STATE QUERIES =====

  getData(): Readonly<PetData> {
    return { ...this.data };
  }

  getCurrentMood(): MoodState {
    return this.calculateMood();
  }

  getLevelProgress(): number {
    return LevelSystem.getLevelProgress(this.data.level, this.data.experience);
  }

  getXPToNextLevel(): number {
    return LevelSystem.getXPToNextLevel(this.data.level, this.data.experience);
  }

  getLevelTitle(): string {
    return LevelSystem.getLevelTitle(this.data.level);
  }

  // ===== TIME SYNC =====

  /**
   * Sync time and apply stat decay based on elapsed time
   * Returns the sync result if changes were applied, null if no significant time passed
   */
  syncTime(): TimeSyncResult | null {
    const now = new Date();
    const lastUpdated = new Date(this.data.lastUpdated || this.data.lastSaveTime);
    const hoursPassed = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    // Skip if less than 1 minute passed
    if (hoursPassed < 0.017) {
      return null;
    }

    const result = this.timeDecay.calculateDecay(
      hoursPassed,
      this.data.stats,
      this.data.isSleeping,
    );

    // Apply the decayed stats
    this.data.stats = result.newStats || this.data.stats;
    this.updateMood();

    // Update lastUpdated timestamp
    this.data.lastUpdated = now.toISOString();

    // Only save if significant changes occurred
    if (result.statChanges.length > 0) {
      this.save();
    }

    this.synced = true;
    return result;
  }

  /**
   * Get hours passed since last update
   */
  getHoursSinceUpdate(): number {
    const now = new Date();
    const lastUpdated = new Date(this.data.lastUpdated || this.data.lastSaveTime);
    return (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Check if pet needs care (has critical stats)
   */
  needsCare(): boolean {
    const { stats } = this.data;
    return (
      stats.hunger < 30 ||
      stats.happiness < 30 ||
      stats.health < 40 ||
      stats.cleanliness < 30 ||
      stats.energy < 20
    );
  }

  // ===== PERSISTENCE =====

  save(): void {
    this.data.lastUpdated = new Date().toISOString();
    this.data.inventory = this.inventory.serialize();
    this.db.savePet(this.data);
  }

  // ===== INVENTORY =====

  getInventory(): Inventory {
    return this.inventory;
  }

  useItem(itemId: string): ActionResult {
    const item = this.inventory.getItemQuantity(itemId);
    if (item <= 0) {
      return {
        success: false,
        message: `You don't have this item!`,
        statChanges: [],
        xpGained: 0,
      };
    }

    // Remove the item
    this.inventory.removeItem(itemId, 1);

    // Get item definition and apply effects
    const itemDef = getItem(itemId);

    if (!itemDef) {
      return {
        success: false,
        message: `Unknown item!`,
        statChanges: [],
        xpGained: 0,
      };
    }

    // Convert item effects to stat changes
    const changes: StatChange[] = [];
    if (itemDef.effect.hunger) changes.push({ stat: 'hunger', delta: itemDef.effect.hunger });
    if (itemDef.effect.happiness) changes.push({ stat: 'happiness', delta: itemDef.effect.happiness });
    if (itemDef.effect.health) changes.push({ stat: 'health', delta: itemDef.effect.health });
    if (itemDef.effect.cleanliness) changes.push({ stat: 'cleanliness', delta: itemDef.effect.cleanliness });
    if (itemDef.effect.energy) changes.push({ stat: 'energy', delta: itemDef.effect.energy });

    // Award coins based on item type
    let coinReason: CoinReason;
    switch (itemDef.type) {
      case ItemType.FOOD:
        coinReason = CoinReason.FEED;
        break;
      case ItemType.TOY:
        coinReason = CoinReason.PLAY;
        break;
      case ItemType.CLEANING:
        coinReason = CoinReason.CLEAN;
        break;
      case ItemType.MEDICINE:
        coinReason = CoinReason.HEAL;
        break;
      default:
        coinReason = CoinReason.FEED;
    }
    const coinsEarned = Shop.getCoinReward(coinReason);
    if (coinsEarned > 0) {
      this.earnCoins(coinsEarned, coinReason);
    }

    return this.performAction(changes, itemDef.xpReward, `used ${itemDef.name}`);
  }

  addItem(itemId: string, quantity: number = 1): void {
    this.inventory.addItem(itemId, quantity);
    this.save();
  }

  hasItem(itemId: string): boolean {
    return this.inventory.hasItem(itemId);
  }

  // ===== COINS =====

  /**
   * Get current coin balance
   */
  getCoins(): number {
    return this.data.coins || 0;
  }

  /**
   * Earn coins from an activity
   * @param amount - Number of coins earned
   * @param reason - Source of coins (feed, play, git_commit, etc.)
   */
  earnCoins(amount: number, reason: CoinReason): void {
    // Initialize coins if not present (for backward compatibility)
    if (typeof this.data.coins !== 'number') {
      this.data.coins = 0;
    }
    if (!Array.isArray(this.data.coinHistory)) {
      this.data.coinHistory = [];
    }

    this.data.coins += amount;

    // Record the coin entry
    const entry: CoinEntry = {
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };
    this.data.coinHistory.push(entry);

    // Keep only last 100 entries to save space
    if (this.data.coinHistory.length > 100) {
      this.data.coinHistory = this.data.coinHistory.slice(-100);
    }

    this.save();
  }

  /**
   * Spend coins (returns true if successful)
   * @param amount - Number of coins to spend
   */
  spendCoins(amount: number): boolean {
    if (this.getCoins() < amount) {
      return false;
    }

    this.data.coins -= amount;

    // Initialize coinHistory if needed
    if (!Array.isArray(this.data.coinHistory)) {
      this.data.coinHistory = [];
    }

    // Record the spending as a negative entry
    const entry: CoinEntry = {
      amount: -amount,
      reason: CoinReason.GIFT, // Using GIFT as a generic marker for purchases
      timestamp: new Date().toISOString(),
    };
    this.data.coinHistory.push(entry);

    this.save();
    return true;
  }

  /**
   * Get coins earned today
   */
  getTodayCoins(): number {
    if (!Array.isArray(this.data.coinHistory)) {
      return 0;
    }

    const today = new Date().toDateString();
    return this.data.coinHistory
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp).toDateString();
        return entryDate === today && entry.amount > 0;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get total lifetime coins earned
   */
  getTotalCoinsEarned(): number {
    if (!Array.isArray(this.data.coinHistory)) {
      return 0;
    }

    return this.data.coinHistory
      .filter((entry) => entry.amount > 0)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  // ===== GIT METHODS =====

  /**
   * Get current Git streak
   */
  getGitStreak(): number {
    return this.data.gitStreak || 0;
  }

  /**
   * Get total Git commits rewarded
   */
  getGitCommitCount(): number {
    return this.data.gitCommitCount || 0;
  }

  /**
   * Get last rewarded commit hash
   */
  getLastGitCommit(): string | undefined {
    return this.data.lastGitCommit;
  }

  /**
   * Check and reward new Git commits
   * Returns a GitProcessResult with details of what was rewarded
   */
  async checkGitCommits(): Promise<GitProcessResult> {
    const monitor = new GitMonitor();

    // Check if Git is available
    const gitCheck = await GitMonitor.isGitAvailable();
    if (!gitCheck.available) {
      return {
        success: false,
        newCommits: 0,
        totalCoins: 0,
        totalXP: 0,
        streak: this.getGitStreak(),
        rewards: [],
        error: gitCheck.message || 'Git is not installed or not available in PATH',
      };
    }

    // Check if we're in a Git repo
    if (!monitor.isInGitRepo()) {
      return {
        success: false,
        newCommits: 0,
        totalCoins: 0,
        totalXP: 0,
        streak: this.getGitStreak(),
        rewards: [],
        error: 'Not a Git repository. Initialize a repo with: git init',
      };
    }

    let newCommits: GitCommitInfo[] = [];

    // Get commits since last rewarded commit
    if (this.data.lastGitCommit) {
      newCommits = await monitor.getCommitsSince(this.data.lastGitCommit);
    } else {
      // First time checking - get all commits
      newCommits = await monitor.getAllCommits(50);
    }

    // Filter out already rewarded commits (by hash)
    const lastHash = this.data.lastGitCommit;
    const trulyNewCommits = lastHash
      ? newCommits.filter(c => c.hash !== lastHash && c.hash.startsWith(lastHash) === false)
      : newCommits;

    if (trulyNewCommits.length === 0) {
      return {
        success: true,
        newCommits: 0,
        totalCoins: 0,
        totalXP: 0,
        streak: this.getGitStreak(),
        rewards: [],
      };
    }

    // Process each commit and calculate rewards
    const rewards: GitCommitReward[] = [];
    let totalCoins = 0;
    let totalXP = 0;

    // Sort commits by date (oldest first)
    trulyNewCommits.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const commit of trulyNewCommits) {
      const reward = this.processGitCommit(commit, monitor);
      rewards.push(reward);
      totalCoins += reward.coins;
      totalXP += reward.xp;
    }

    // Update streak based on commit dates
    this.updateGitStreak(trulyNewCommits);

    // Update last rewarded commit (most recent)
    const mostRecent = trulyNewCommits[trulyNewCommits.length - 1];
    this.data.lastGitCommit = mostRecent.shortHash;
    this.data.gitCommitCount = (this.data.gitCommitCount || 0) + trulyNewCommits.length;

    // Add streak bonus coins
    const streakBonus = this.calculateStreakBonus();
    if (streakBonus > 0) {
      totalCoins += streakBonus;
      // Add streak bonus to coin history
      if (streakBonus >= 50) {
        this.earnCoins(streakBonus, CoinReason.GIT_STREAK_30);
      } else if (streakBonus >= 10) {
        this.earnCoins(streakBonus, CoinReason.GIT_STREAK_7);
      } else if (streakBonus > 0) {
        this.earnCoins(streakBonus, CoinReason.GIT_STREAK_DAILY);
      }
    }

    this.save();

    return {
      success: true,
      newCommits: trulyNewCommits.length,
      totalCoins,
      totalXP,
      streak: this.getGitStreak(),
      rewards,
    };
  }

  /**
   * Process a single Git commit and return the reward details
   */
  private processGitCommit(commit: GitCommitInfo, monitor: GitMonitor): GitCommitReward {
    const reward = monitor.calculateReward(commit);
    const bonuses: string[] = [];

    // Determine coin reason based on commit type
    let coinReason: CoinReason;
    const baseCoins = reward.baseCoins;
    const baseXP = reward.baseXP;

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

    let totalCoins = baseCoins;
    let totalXP = baseXP;

    // Apply night owl bonus (2x coins)
    if (reward.nightBonus) {
      totalCoins = baseCoins * 2;
      bonuses.push('🦉 Night Owl Bonus! 2x coins!');
    }

    // Apply large commit bonus
    if (reward.largeBonus) {
      totalCoins += 5;
      totalXP += 10;
      bonuses.push(`📦 Large Commit Bonus!`);
      this.earnCoins(5, CoinReason.GIT_LARGE_BONUS);
    }

    // Award base coins
    this.earnCoins(totalCoins, coinReason);

    // Award XP
    this.addExperience(totalXP);

    // NEW: Apply stat bonuses from Git commit (陪伴效果 - writing code = being with pet)
    const statBonus = this.calculateGitStatBonus();
    this.applyStatDirectly('hunger', statBonus.hunger);
    this.applyStatDirectly('happiness', statBonus.happiness);

    // Add friendly message about pet enjoying the company
    bonuses.push(`💚 ${this.data.name} enjoyed watching you code! (+${statBonus.hunger} hunger, +${statBonus.happiness} happiness)`);

    return {
      shortHash: commit.shortHash,
      message: commit.message,
      type: reward.commitType,
      coins: totalCoins,
      xp: totalXP,
      bonuses,
    };
  }

  /**
   * Calculate stat bonuses from Git commits
   * Philosophy: Writing code = being with your pet
   */
  private calculateGitStatBonus(): { hunger: number; happiness: number } {
    const streak = this.getGitStreak();
    let hunger = 15; // Base: pet feels fed seeing you work
    let happiness = 10; // Base: pet is happy you're here

    // Streak bonus - consistent coding means better care
    if (streak >= 7) {
      hunger += 5;
      happiness += 5;
    } else if (streak >= 3) {
      hunger += 2;
      happiness += 2;
    }

    return { hunger, happiness };
  }

  /**
   * Update Git streak based on commit dates
   */
  private updateGitStreak(commits: GitCommitInfo[]): void {
    if (!this.data.lastGitDate) {
      // First commit - start streak
      const oldestCommit = commits[0];
      this.data.lastGitDate = this.formatDate(oldestCommit.date);
      this.data.gitStreak = 1;
      return;
    }

    const lastDate = new Date(this.data.lastGitDate);
    const oldestCommit = commits[0];
    const commitDate = new Date(this.formatDate(oldestCommit.date));

    // Calculate day difference
    const dayDiff = Math.round((commitDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      // Same day - streak continues, don't increment
      return;
    } else if (dayDiff === 1) {
      // Next day - increment streak
      this.data.gitStreak = (this.data.gitStreak || 0) + 1;
    } else {
      // Streak broken - start new streak
      this.data.gitStreak = 1;
    }

    this.data.lastGitDate = this.formatDate(oldestCommit.date);
  }

  /**
   * Calculate streak bonus coins
   */
  private calculateStreakBonus(): number {
    const streak = this.getGitStreak();

    if (streak >= 30) {
      return 50; // Major milestone bonus
    } else if (streak >= 7) {
      return 10; // Week streak bonus
    } else if (streak > 1) {
      return streak; // 1 coin per streak day
    }

    return 0;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // ===== AUTO-CARE METHODS =====

  /**
   * Get auto-care suggestions based on pet state
   */
  getSuggestions(): string[] {
    const autoCare = createAutoCare();
    return autoCare.getSuggestions(this);
  }

  /**
   * Apply stat change directly (for Git commit bonuses, etc.)
   * This bypasses the normal action flow for internal stat adjustments
   */
  applyStatDirectly(stat: keyof PetStats, value: number): void {
    this.data.stats[stat] = clampStat(this.data.stats[stat] + value);
    this.updateMood();
    this.save();
  }

  // ===== PRIVATE METHODS =====

  private performAction(
    changes: StatChange[],
    xpGained: number,
    actionName: string,
  ): ActionResult {
    const oldLevel = this.data.level;

    this.applyStatChanges(changes);
    this.addExperience(xpGained);
    this.updateMood();
    this.updateInteraction();
    this.save();

    const newLevel = this.data.level;
    const levelUp = newLevel > oldLevel;

    let message = `${this.data.name} enjoyed being ${actionName}!`;
    if (levelUp) {
      message = `Level up! ${this.data.name} is now level ${newLevel}! 🎉`;
    }

    return {
      success: true,
      message,
      statChanges: changes,
      xpGained,
      levelUp,
      newLevel,
    };
  }

  private applyStatChanges(changes: StatChange[]): void {
    for (const change of changes) {
      const currentValue = this.data.stats[change.stat];
      this.data.stats[change.stat] = clampStat(currentValue + change.delta);
    }
  }

  private addExperience(amount: number): void {
    this.data.experience += amount;

    // Check for level up
    const newLevel = LevelSystem.calculateNewLevel(
      this.data.level,
      this.data.experience,
    );

    if (newLevel > this.data.level) {
      this.data.level = newLevel;
      // Bonus stats on level up
      this.data.stats = {
        hunger: clampStat(this.data.stats.hunger + 5),
        happiness: clampStat(this.data.stats.happiness + 5),
        health: clampStat(this.data.stats.health + 5),
        cleanliness: clampStat(this.data.stats.cleanliness + 5),
        energy: clampStat(this.data.stats.energy + 5),
      };
      // Award coins on level up
      const levelUpBonus = Shop.getCoinReward(CoinReason.LEVEL_UP);
      this.earnCoins(levelUpBonus, CoinReason.LEVEL_UP);
    }
  }

  private calculateMood(): MoodState {
    if (this.data.isSleeping) {
      return MoodState.SLEEPY;
    }

    const { stats } = this.data;

    if (stats.health < 30) return MoodState.SICK;
    if (stats.energy < 20) return MoodState.SLEEPY;
    if (stats.hunger < 20) return MoodState.ANGRY;

    const avgStat = (stats.happiness + stats.hunger + stats.cleanliness) / 3;

    if (avgStat >= 80 && stats.energy > 60) return MoodState.EXCITED;
    if (avgStat >= 60) return MoodState.HAPPY;
    if (avgStat >= 40) return MoodState.SAD;
    return MoodState.ANGRY;
  }

  private updateMood(): void {
    this.data.mood = this.calculateMood();
  }

  private updateInteraction(): void {
    this.data.lastInteraction = new Date().toISOString();
    this.data.totalInteractions++;
  }
}
