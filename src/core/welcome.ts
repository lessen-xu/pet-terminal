import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { drawHeader, drawDivider } from '../ui/display';
import { Database } from './database';

// Import version from package.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../../package.json');
const VERSION = packageJson.version;

/**
 * Pet quotes for startup
 */
const PET_QUOTES: string[] = [
  '"Every commit makes my tail wag! 🐕"',
  '"I love watching you code! 💻"',
  '"You\'re my favorite human! 💜"',
  '"Code more, pet me later! ⌨️"',
  '"My human is a developer! 🎉"',
  '"Bugs fixed = treats earned! 🐛"',
  '"Let\'s build something amazing! 🚀"',
  '"I\'ll wait while you code... 👀"',
  '"Push to prod, then play! 🚢"',
  '"Your commit messages are funny! 😄"',
  '"Coding together is the best! 💕"',
  '"Zero bugs, infinite treats! ✨"',
  '"My furriend is a developer! 🐾"',
  '"Commit often, pet always! 🎮"',
  '"You make my tail wag! 🐕💕"',
];

/**
 * Special date-based messages
 */
const getSpecialMessage = (): string | null => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = now.getDay();

  // New Year's Day
  if (month === 1 && date === 1) {
    return '🎄 Happy New Year! Let\'s make this year bug-free!';
  }

  // Valentine's Day
  if (month === 2 && date === 14) {
    return '💕 Valentine\'s Day! I love coding with you!';
  }

  // April Fools' Day
  if (month === 4 && date === 1) {
    return '🤡 April Fools! No bugs today... hopefully!';
  }

  // Halloween
  if (month === 10 && date === 31) {
    return '🎃 Happy Halloween! Watch out for ghost bugs!';
  }

  // Christmas
  if (month === 12 && date === 25) {
    return '🎄 Merry Christmas! Santa says you\'ve been a good coder!';
  }

  // Friday
  if (day === 5) {
    return '🎉 It\'s Friday! Time to wrap up those PRs!';
  }

  // Monday
  if (day === 1) {
    return '☕ Monday coffee in hand, let\'s squash some bugs!';
  }

  return null;
};

/**
 * Welcome system for Pet Terminal
 */
export class WelcomeSystem {
  /**
   * Show the startup logo
   */
  static showStartupLogo(): void {
    console.log('');
    console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.yellow.bold('  🐾 PET TERMINAL 🐾  Your Coding Companion  ') + chalk.cyan('  ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
    console.log('');

    console.log(chalk.green('     / \\__'));
    console.log(chalk.green('    (    @\\___'));
    console.log(chalk.green('    /         O'));
    console.log(chalk.green('   /   (_____ /'));
    console.log(chalk.green('  /_____/   U'));
    console.log('');

    // Show special message if applicable
    const specialMessage = getSpecialMessage();
    if (specialMessage) {
      console.log(chalk.magenta(`  ${specialMessage}`));
      console.log('');
    } else {
      // Show random pet quote
      const quote = this.getPetQuote();
      console.log(chalk.gray(`  ${quote}`));
      console.log('');
    }

    console.log(chalk.gray(`  Version ${VERSION}  |  Type "pet tutorial" for help`));
    console.log('');
  }

  /**
   * Get a random pet quote
   */
  static getPetQuote(): string {
    const index = Math.floor(Math.random() * PET_QUOTES.length);
    return PET_QUOTES[index];
  }

  /**
   * Show first-time welcome message
   */
  static showFirstTimeWelcome(): void {
    console.log('');
    console.log(drawHeader('WELCOME TO PET TERMINAL!', 50));
    console.log('');
    console.log(chalk.green('     / \\__'));
    console.log(chalk.green('    (    @\\___'));
    console.log(chalk.green('    /         O'));
    console.log(chalk.green('   /   (_____ /'));
    console.log(chalk.green('  /_____/   U'));
    console.log('');
    console.log(chalk.magenta.bold('  "Writing code = being with your pet"'));
    console.log('');
    console.log(drawDivider(50));
    console.log('');

    console.log(chalk.white('Pet Terminal is a coding companion that lives'));
    console.log(chalk.white('in your terminal. Your pet grows happier when'));
    console.log(chalk.white('you make Git commits!'));
    console.log('');

    console.log(chalk.cyan.bold('Quick Start:'));
    console.log(chalk.cyan('  1. Create your pet:') + chalk.gray('        pet init'));
    console.log(chalk.cyan('  2. Check your pet:') + chalk.gray('        pet status'));
    console.log(chalk.cyan('  3. Make commits & earn:') + chalk.gray('   pet git'));
    console.log('');

    console.log(chalk.gray('Type "pet tutorial" for the full guide.'));
    console.log('');
  }

  /**
   * Check if this is the first run (no pet exists)
   */
  static isFirstRun(db?: Database): boolean {
    if (db) {
      return !db.hasPet();
    }

    // Check without database instance - use correct path
    try {
      const dbPath = path.join(os.homedir(), '.pet-terminal', 'pet.json');
      return !fs.existsSync(dbPath);
    } catch {
      return true;
    }
  }

  /**
   * Show a helpful message when no pet is found
   */
  static showNoPetMessage(): void {
    console.log('');
    console.log(chalk.red('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.red('║') + chalk.white.bold('  ❌ No pet found in this directory                          ') + chalk.red(' ║'));
    console.log(chalk.red('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.gray("Let's create your first pet!"));
    console.log('');
    console.log(chalk.cyan('  pet init'));
    console.log('');
  }

  /**
   * Show welcome back message when returning user runs without args
   */
  static showWelcomeBack(petName: string, petSpecies: string): void {
    console.log('');
    console.log(chalk.cyan(`  Hello! ${petName} the ${petSpecies} misses you!`));
    console.log(chalk.gray(`  ${this.getPetQuote()}`));
    console.log('');
  }
}
