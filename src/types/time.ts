import type { PetStats } from './stats';

export interface TimeDecayConfig {
  hungerPerHour: number;
  happinessPerHour: number;
  cleanlinessPerHour: number;
  energyPerHour: number;
  healthDecayThreshold: {
    hunger: number;
    happiness: number;
    cleanliness: number;
  };
  healthPerHourWhenCritical: number;
}

export interface TimeSyncResult {
  hoursPassed: number;
  statChanges: Array<{ stat: string; delta: number }>;
  healthDecayTriggered: boolean;
  warnings: string[];
  newStats?: PetStats;
}

/**
 * Default decay configuration
 * Note: TimeDecay class uses lenient defaults that override these values.
 * See time-decay.ts for actual runtime values used.
 */
export const DEFAULT_DECAY_CONFIG: TimeDecayConfig = {
  hungerPerHour: 3, // Hunger decreases by 3 per hour (lenient)
  happinessPerHour: 0.67, // Happiness decreases by ~0.67 per hour (lenient)
  cleanlinessPerHour: 0.125, // Cleanliness decreases by 0.125 per hour (lenient)
  energyPerHour: 2, // Energy decreases by 2 per hour when awake (lenient)
  healthDecayThreshold: {
    hunger: 10, // If hunger < 10, health decays
    happiness: 10, // If happiness < 10, health decays
    cleanliness: 10, // If cleanliness < 10, health decays
  },
  healthPerHourWhenCritical: 2, // Health decay per hour when conditions are critical
};

export interface TimeAgoResult {
  value: number;
  unit: 'second' | 'minute' | 'hour' | 'day' | 'month';
  raw: string;
}

export const getTimeAgo = (date: Date | string): TimeAgoResult => {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return {
      value: diffSeconds,
      unit: 'second',
      raw: diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`,
    };
  }
  if (diffMinutes < 60) {
    return {
      value: diffMinutes,
      unit: 'minute',
      raw: diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`,
    };
  }
  if (diffHours < 24) {
    return {
      value: diffHours,
      unit: 'hour',
      raw: diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`,
    };
  }
  if (diffDays < 30) {
    return {
      value: diffDays,
      unit: 'day',
      raw: diffDays === 1 ? '1 day ago' : `${diffDays} days ago`,
    };
  }
  return {
    value: diffMonths,
    unit: 'month',
    raw: diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`,
  };
};

export const formatDuration = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
    return `${h}h ${m}m`;
  }
  const days = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  if (h === 0) return days === 1 ? '1 day' : `${days} days`;
  return `${days}d ${h}h`;
};
