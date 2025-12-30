import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider } from '../ui/display';
import { getPetAscii } from '../ui/ascii-art';
import { GitCommitType, GitProcessResult } from '../types/git';
import { GitMonitor } from '../monitor/git-monitor';

export const gitCommand = new Command('git');

gitCommand
  .alias('commits')
  .description('Check for new Git commits and earn rewards')
  .action(async () => {
    const db = new Database();

    if (!db.hasPet()) {
      console.log(chalk.yellow("You don't have a pet yet!"));
      console.log(chalk.gray('Use "pet init" to create one.'));
      return;
    }

    // Check if Git is available first
    const gitCheck = await GitMonitor.isGitAvailable();
    if (!gitCheck.available) {
      console.log('');
      console.log(chalk.red('Git is not installed or not available!'));
      console.log('');
      console.log(chalk.gray('Install Git to earn rewards for your commits:'));
      console.log(chalk.gray('  https://git-scm.com/downloads'));
      console.log('');
      return;
    }

    // Check if we're in a Git repo
    const monitor = new GitMonitor();
    if (!monitor.isInGitRepo()) {
      console.log('');
      console.log(chalk.red('Not a Git repository!'));
      console.log('');
      console.log(chalk.gray('Initialize a Git repository to start earning rewards:'));
      console.log(chalk.cyan('  git init'));
      console.log(chalk.gray('  git add .'));
      console.log(chalk.gray('  git commit -m "Initial commit"'));
      console.log('');
      return;
    }

    const pet = await Pet.loadOrCreate(db);
    const data = pet.getData();

    console.log('');
    console.log(drawHeader('GIT COMMITS', 46));
    console.log('');
    console.log(chalk.green(getPetAscii(data.species, data.mood, data.isSleeping)));
    console.log('');

    // Check for new commits
    const result: GitProcessResult = await pet.checkGitCommits();

    if (!result.success) {
      console.log(chalk.red(`Error: ${result.error}`));
      console.log('');
      return;
    }

    // Show current streak
    const streak = pet.getGitStreak();
    const totalCommits = pet.getGitCommitCount();

    console.log(drawDivider(46));
    console.log(chalk.gray(`Current Streak: ${chalk.bold.yellow(streak + ' days')} 🔥`));
    console.log(chalk.gray(`Total Rewarded: ${chalk.bold(totalCommits + ' commits')} 📝`));
    console.log(drawDivider(46));
    console.log('');

    if (result.newCommits === 0) {
      console.log(chalk.gray('No new commits to reward.'));
      console.log('');
      console.log(chalk.cyan('Make some commits and come back!'));
      console.log(chalk.gray('  git add .'));
      console.log(chalk.gray('  git commit -m "feat: add new feature"'));
      console.log('');
      return;
    }

    // Show rewards
    console.log(chalk.green.bold(`Found ${result.newCommits} new commit(s)!`));
    console.log('');

    for (const reward of result.rewards) {
      const typeColor = getCommitTypeColor(reward.type);
      const typeName = GitMonitor.getCommitTypeName(reward.type);

      console.log(chalk.gray(`${reward.shortHash} - ${reward.message.substring(0, 50)}${reward.message.length > 50 ? '...' : ''}`));
      console.log(`${typeColor(`  [${typeName}]`)} ${chalk.yellow(`+${reward.coins} 🪙`)} ${chalk.cyan(`+${reward.xp} XP`)}`);

      // Show bonuses
      for (const bonus of reward.bonuses) {
        console.log(chalk.gray(`  ${bonus}`));
      }
      console.log('');
    }

    // Show total rewards
    console.log(drawDivider(46));
    console.log(chalk.yellow.bold(`Total: +${result.totalCoins} 🪙  +${result.totalXP} XP`));

    // Show streak bonus
    if (streak > 1) {
      if (streak >= 30) {
        console.log(chalk.magenta(`  🔥 30+ Day Streak Bonus! +50 🪙`));
      } else if (streak >= 7) {
        console.log(chalk.magenta(`  🔥 7+ Day Streak Bonus! +10 🪙`));
      } else {
        console.log(chalk.magenta(`  🔥 Streak Bonus! +${streak} 🪙`));
      }
    }

    console.log(drawDivider(46));
    console.log('');

    // Show new coins
    console.log(chalk.yellow(`Your Coins: ${chalk.bold(pet.getCoins() + ' 🪙')}`));
    console.log('');

    // Commit type tips
    console.log(chalk.gray('Tip: Use commit message prefixes for better rewards:'));
    console.log(chalk.gray('  fix/bug/修复  → Bug Fix    (+10 🪙, +20 XP)'));
    console.log(chalk.gray('  feat/add/新   → Feature    (+8 🪙, +15 XP)'));
    console.log(chalk.gray('  refactor/重构 → Refactor   (+6 🪙, +12 XP)'));
    console.log('');
  });

/**
 * Get chalk color function for commit type
 */
function getCommitTypeColor(type: GitCommitType): (text: string) => string {
  switch (type) {
    case GitCommitType.BUG_FIX:
      return chalk.red;
    case GitCommitType.FEATURE:
      return chalk.green;
    case GitCommitType.REFACTOR:
      return chalk.blue;
    default:
      return chalk.gray;
  }
}
