import fs from 'fs';
import path from 'path';
import os from 'os';
import { UserConfig, DEFAULT_USER_CONFIG, ConfigValidationResult } from '../types/config';

/**
 * Configuration management for Pet Terminal
 * Handles loading/saving user config from ~/.pet-terminal/config.json
 */
export class Config {
  private configPath: string;
  private config: UserConfig;

  constructor(configPath?: string) {
    this.configPath = configPath || this.getDefaultConfigPath();
    this.config = this.load();
  }

  /**
   * Get the default config directory path
   * ~/.pet-terminal/ on Unix/Mac
   * %USERPROFILE%\.pet-terminal\ on Windows
   */
  private getDefaultConfigPath(): string {
    const configDir = path.join(os.homedir(), '.pet-terminal');
    return path.join(configDir, 'config.json');
  }

  /**
   * Load configuration from file
   * Returns default config if file doesn't exist
   */
  load(): UserConfig {
    // If config file doesn't exist, return defaults
    if (!fs.existsSync(this.configPath)) {
      return { ...DEFAULT_USER_CONFIG };
    }

    try {
      const fileContent = fs.readFileSync(this.configPath, 'utf-8');
      const loadedConfig = JSON.parse(fileContent) as Partial<UserConfig>;

      // Merge with defaults to ensure all fields exist
      return this.mergeWithDefaults(loadedConfig);
    } catch (error) {
      // If parsing fails, return defaults
      return { ...DEFAULT_USER_CONFIG };
    }
  }

  /**
   * Merge loaded config with defaults
   */
  private mergeWithDefaults(partial: Partial<UserConfig>): UserConfig {
    return {
      decayRate: partial.decayRate ?? DEFAULT_USER_CONFIG.decayRate,
      autoCare: {
        enabled: partial.autoCare?.enabled ?? DEFAULT_USER_CONFIG.autoCare.enabled,
        thresholds: {
          hunger: partial.autoCare?.thresholds?.hunger ?? DEFAULT_USER_CONFIG.autoCare.thresholds.hunger,
          happiness: partial.autoCare?.thresholds?.happiness ?? DEFAULT_USER_CONFIG.autoCare.thresholds.happiness,
          cleanliness: partial.autoCare?.thresholds?.cleanliness ?? DEFAULT_USER_CONFIG.autoCare.thresholds.cleanliness,
          energy: partial.autoCare?.thresholds?.energy ?? DEFAULT_USER_CONFIG.autoCare.thresholds.energy,
          health: partial.autoCare?.thresholds?.health ?? DEFAULT_USER_CONFIG.autoCare.thresholds.health,
        },
      },
    };
  }

  /**
   * Save configuration to file
   */
  save(config?: UserConfig): void {
    const configToSave = config || this.config;

    // Ensure config directory exists
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2), 'utf-8');
    this.config = configToSave;
  }

  /**
   * Get current configuration
   */
  getConfig(): UserConfig {
    return { ...this.config };
  }

  /**
   * Get decay rate multiplier
   */
  getDecayRate(): number {
    return this.config.decayRate;
  }

  /**
   * Set decay rate multiplier
   */
  setDecayRate(rate: number): void {
    // Clamp between 0.1 and 5.0
    this.config.decayRate = Math.max(0.1, Math.min(5.0, rate));
    this.save();
  }

  /**
   * Check if auto-care is enabled
   */
  isAutoCareEnabled(): boolean {
    return this.config.autoCare.enabled;
  }

  /**
   * Set auto-care enabled state
   */
  setAutoCareEnabled(enabled: boolean): void {
    this.config.autoCare.enabled = enabled;
    this.save();
  }

  /**
   * Get auto-care thresholds
   */
  getAutoCareThresholds() {
    return { ...this.config.autoCare.thresholds };
  }

  /**
   * Set auto-care threshold
   */
  setAutoCareThreshold(stat: keyof UserConfig['autoCare']['thresholds'], value: number): void {
    // Clamp between 0 and 100
    this.config.autoCare.thresholds[stat] = Math.max(0, Math.min(100, value));
    this.save();
  }

  /**
   * Get the config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Reset config to defaults
   */
  resetToDefaults(): void {
    this.config = { ...DEFAULT_USER_CONFIG };
    this.save();
  }

  /**
   * Validate configuration values
   */
  validate(config: UserConfig): ConfigValidationResult {
    const errors: string[] = [];

    if (config.decayRate < 0.1 || config.decayRate > 5.0) {
      errors.push('decayRate must be between 0.1 and 5.0');
    }

    const thresholds = config.autoCare.thresholds;
    for (const [key, value] of Object.entries(thresholds)) {
      if (value < 0 || value > 100) {
        errors.push(`${key} threshold must be between 0 and 100`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create default config file
   * Returns true if file was created, false if it already exists
   */
  static createDefaultConfig(): boolean {
    const config = new Config();
    const configPath = config.getConfigPath();

    if (fs.existsSync(configPath)) {
      return false;
    }

    config.save();
    return true;
  }
}

/**
 * Global config instance
 */
let globalConfig: Config | null = null;

/**
 * Get or create global config instance
 */
export const getConfig = (): Config => {
  if (!globalConfig) {
    globalConfig = new Config();
  }
  return globalConfig;
};

/**
 * Reset global config instance (useful for testing)
 */
export const resetGlobalConfig = (): void => {
  globalConfig = null;
};
