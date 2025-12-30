import { PetStats } from '../types/stats';
import { TimeDecayConfig, TimeSyncResult, formatDuration } from '../types/time';
import { clampStat } from '../types/stats';

export class TimeDecay {
  private config: TimeDecayConfig;

  constructor(config?: Partial<TimeDecayConfig>) {
    this.config = {
      // Lenient decay rates - reduced by 50-92%
      hungerPerHour: 3, // Was 6 - 50% slower
      happinessPerHour: 0.67, // Was 2.5 - 73% slower (2 per 3 hours)
      cleanlinessPerHour: 0.125, // Was 1.5 - 92% slower (1 per 8 hours)
      energyPerHour: 2, // Was 4 - 50% slower
      // Health only decays in extreme conditions
      healthDecayThreshold: {
        hunger: 10, // Was 20 - only when starving
        happiness: 10, // Was 15 - only when very depressed
        cleanliness: 10, // Was 15 - only when very filthy
      },
      healthPerHourWhenCritical: 2, // Was 5 - 60% slower
      ...config,
    };
  }

  /**
   * Calculate stat decay based on time passed
   * @param hours Hours that have passed
   * @param currentStats Current pet stats
   * @param isSleeping Whether the pet is sleeping
   */
  calculateDecay(
    hours: number,
    currentStats: PetStats,
    isSleeping: boolean,
  ): TimeSyncResult {
    const result: TimeSyncResult = {
      hoursPassed: hours,
      statChanges: [],
      healthDecayTriggered: false,
      warnings: [],
    };

    if (hours <= 0) {
      return result;
    }

    const newStats: PetStats = { ...currentStats };
    const warnings: string[] = [];

    // Calculate hunger decay (hunger = full, so it decreases over time)
    // Actually, hunger should work inversely - high hunger = full, low hunger = starving
    // So we SUBTRACT from hunger over time
    const hungerDecay = Math.round(hours * this.config.hungerPerHour);
    newStats.hunger = clampStat(newStats.hunger - hungerDecay);
    if (hungerDecay > 0) {
      result.statChanges.push({ stat: 'Hunger', delta: -hungerDecay });
    }

    // Calculate happiness decay
    const happinessDecay = Math.round(hours * this.config.happinessPerHour);
    newStats.happiness = clampStat(newStats.happiness - happinessDecay);
    if (happinessDecay > 0) {
      result.statChanges.push({ stat: 'Happiness', delta: -happinessDecay });
    }

    // Calculate cleanliness decay
    const cleanlinessDecay = Math.round(hours * this.config.cleanlinessPerHour);
    newStats.cleanliness = clampStat(newStats.cleanliness - cleanlinessDecay);
    if (cleanlinessDecay > 0) {
      result.statChanges.push({ stat: 'Cleanliness', delta: -cleanlinessDecay });
    }

    // Calculate energy decay
    // If sleeping, energy recovers instead of decaying
    if (isSleeping) {
      const energyRecovery = Math.round(hours * 10); // Recover 10 energy per hour while sleeping
      newStats.energy = clampStat(newStats.energy + energyRecovery);
      if (energyRecovery > 0) {
        result.statChanges.push({ stat: 'Energy', delta: energyRecovery });
      }
    } else {
      const energyDecay = Math.round(hours * this.config.energyPerHour);
      newStats.energy = clampStat(newStats.energy - energyDecay);
      if (energyDecay > 0) {
        result.statChanges.push({ stat: 'Energy', delta: -energyDecay });
      }
    }

    // Check if health should decay due to poor conditions
    const shouldDecayHealth =
      newStats.hunger < this.config.healthDecayThreshold.hunger ||
      newStats.happiness < this.config.healthDecayThreshold.happiness ||
      newStats.cleanliness < this.config.healthDecayThreshold.cleanliness;

    if (shouldDecayHealth) {
      const healthDecay = Math.round(hours * this.config.healthPerHourWhenCritical);
      newStats.health = clampStat(newStats.health - healthDecay);
      result.statChanges.push({ stat: 'Health', delta: -healthDecay });
      result.healthDecayTriggered = true;
      warnings.push(`${newStats.health}% health - your pet needs care!`);
    }

    // Generate warnings based on critical stats
    if (newStats.hunger < 20) {
      warnings.push(`${newStats.hunger}% hunger - your pet is starving!`);
    }
    if (newStats.happiness < 20) {
      warnings.push(`${newStats.happiness}% happiness - your pet is depressed!`);
    }
    if (newStats.cleanliness < 20) {
      warnings.push(`${newStats.cleanliness}% cleanliness - your pet is filthy!`);
    }
    if (newStats.energy < 15 && !isSleeping) {
      warnings.push(`${newStats.energy}% energy - your pet is exhausted!`);
    }

    // Add the new stats to the result for applying
    result.newStats = newStats;
    result.warnings = warnings;

    return result;
  }

  /**
   * Check if pet has been abandoned (stats too low for too long)
   */
  isAbandoned(stats: PetStats, hours: number): boolean {
    const avgStat =
      (stats.hunger + stats.happiness + stats.health + stats.cleanliness + stats.energy) / 5;

    // If average stat is below 20 and more than 48 hours have passed
    return avgStat < 20 && hours > 48;
  }

  /**
   * Get a message about time passed
   */
  getTimeMessage(hours: number): string {
    if (hours < 0.01) return 'Just now';

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    return formatDuration(hours) + ' ago';
  }

  /**
   * Get severity level based on hours passed
   */
  getSeverity(hours: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (hours < 1) return 'none';
    if (hours < 6) return 'low';
    if (hours < 24) return 'medium';
    if (hours < 72) return 'high';
    return 'critical';
  }

  /**
   * Apply the decay result to stats
   */
  applyDecay(stats: PetStats, result: TimeSyncResult): PetStats {
    return result.newStats || stats;
  }
}
