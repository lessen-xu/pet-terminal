import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider } from '../ui/display';
import { formatDuration, getTimeAgo } from '../types/time';

export const syncCommand = new Command('sync');

syncCommand.description('Sync time and show stat changes from offline decay').action(async () => {
  const db = new Database();

  if (!db.hasPet()) {
    console.log(chalk.yellow("You don't have a pet yet!"));
    console.log(chalk.gray('Use "pet init" to create one.'));
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();
  const hoursPassed = pet.getHoursSinceUpdate();

  console.log('');
  console.log(drawHeader('TIME SYNC'));
  console.log('');

  const timeAgo = getTimeAgo(data.lastUpdated);
  console.log(chalk.gray(`Last updated: ${timeAgo.raw}`));
  console.log(chalk.gray(`Time passed: ${formatDuration(hoursPassed)}`));
  console.log('');

  if (hoursPassed < 0.017) {
    console.log(chalk.green('Your pet is up to date! No time has passed.'));
    console.log('');
    return;
  }

  // Force a new sync to show changes
  const result = pet.syncTime();

  if (result && result.statChanges.length > 0) {
    console.log(drawDivider(42));
    console.log(chalk.yellow('Stat changes from time decay:'));
    console.log(drawDivider(42));
    console.log('');

    for (const change of result.statChanges) {
      const sign = change.delta >= 0 ? '+' : '';
      const color = change.delta >= 0 ? 'green' : 'red';
      console.log(`  ${change.stat.padEnd(12)} ${chalk.gray('→')} ${chalk[color](`${sign}${change.delta}`)}`);
    }

    console.log('');
    console.log(drawDivider(42));

    if (result.warnings.length > 0) {
      console.log('');
      console.log(chalk.red.bold('Warnings:'));
      for (const warning of result.warnings) {
        console.log(`  ${chalk.red('⚠')} ${warning}`);
      }
    }

    console.log('');
    console.log(chalk.gray('Type "pet status" to see current stats.'));
  } else {
    console.log(chalk.green('No significant stat changes occurred.'));
  }

  console.log('');
});
