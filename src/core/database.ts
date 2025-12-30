import lowdb, { LowdbSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { DatabaseSchema, PetData } from '../types/pet';

export class Database {
  private db: LowdbSync<DatabaseSchema>;

  constructor(dbPath: string = path.join(os.homedir(), '.pet-terminal', 'pet.json')) {
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const adapter = new FileSync<DatabaseSchema>(dbPath);
    this.db = lowdb(adapter);

    // Initialize with default schema if file doesn't exist or is empty
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
      this.writeDefaultSchema();
    }
  }

  private writeDefaultSchema(): void {
    const defaultSchema: DatabaseSchema = {
      pet: null,
      settings: {
        created: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    this.db.setState(defaultSchema).write();
  }

  hasPet(): boolean {
    const pet = this.db.get('pet').value();
    return pet !== null && pet !== undefined;
  }

  getPet(): PetData | null {
    return this.db.get('pet').value();
  }

  savePet(pet: PetData): void {
    pet.lastSaveTime = new Date().toISOString();
    this.db.set('pet', pet).write();
  }

  deletePet(): void {
    this.db.set('pet', null).write();
  }

  getLastSaveTime(): Date {
    const pet = this.getPet();
    return pet ? new Date(pet.lastSaveTime) : new Date(0);
  }

  getSettings() {
    return this.db.get('settings').value();
  }

  /**
   * Check if this is the first run (user hasn't been onboarded yet)
   */
  isFirstRun(): boolean {
    const settings = this.db.get('settings').value();
    return !settings.onboarded;
  }

  /**
   * Mark the onboarding as complete
   */
  markOnboardedComplete(): void {
    const settings = this.db.get('settings').value();
    settings.onboarded = true;
    this.db.set('settings', settings).write();
  }

  /**
   * Reset onboarding (for testing or re-running tutorial)
   */
  resetOnboarding(): void {
    const settings = this.db.get('settings').value();
    settings.onboarded = false;
    this.db.set('settings', settings).write();
  }
}
