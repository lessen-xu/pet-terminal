/**
 * User configuration file
 * Located at ~/.pet-terminal/config.json
 */

/**
 * Auto-care thresholds configuration
 */
export interface AutoCareThresholds {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
}

/**
 * Auto-care configuration
 */
export interface AutoCareConfig {
  enabled: boolean;
  thresholds: AutoCareThresholds;
}

/**
 * User configuration
 */
export interface UserConfig {
  /** Global decay rate multiplier (0.5 = half speed, 2.0 = double speed) */
  decayRate: number;
  /** Auto-purchase and auto-care settings */
  autoCare: AutoCareConfig;
}

/**
 * Default user configuration
 */
export const DEFAULT_USER_CONFIG: UserConfig = {
  decayRate: 1.0,
  autoCare: {
    enabled: false,
    thresholds: {
      hunger: 70,
      happiness: 60,
      cleanliness: 60,
      energy: 50,
      health: 70,
    },
  },
};

/**
 * Configuration file validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}
