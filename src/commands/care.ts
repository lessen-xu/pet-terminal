import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider } from '../ui/display';
import { getPetAscii } from '../ui/ascii-art';
import { createAutoCare } from '../core/auto-care';
import { CareActionResult } from '../types/auto-care';

export const careCommand = new Command('care');

careCommand
  .alias('auto')
  .alias('all')
  .description('One-click care for your pet - handle all needs at once')
  .action(async () => {
    const db = new Database();

    if (!db.hasPet()) {
      console.log(chalk.yellow("You don't have a pet yet!"));
      console.log(chalk.gray('Use "pet init" to create one.'));
      return;
    }

    const pet = await Pet.loadOrCreate(db);
    const data = pet.getData();

    console.log('');
    console.log(drawHeader('ONE-CLICK CARE', 46));
    console.log('');
    console.log(chalk.green(getPetAscii(data.species, data.mood, data.isSleeping)));
    console.log('');

    if (data.isSleeping) {
      console.log(chalk.yellow(`${data.name} is sleeping!`));
      console.log(chalk.gray('Let them rest to recover energy.'));
      console.log(chalk.gray('Use "pet sleep" to wake them up when needed.'));
      console.log('');
      return;
    }

    // Perform one-click care
    const autoCare = createAutoCare();
    const result = await autoCare.oneClickCare(pet);

    console.log(drawDivider(46));

    if (result.actionsTaken.length === 0) {
      console.log(chalk.green(`${data.name} is doing great!`));
      console.log(chalk.gray('No care needed at the moment.'));
      console.log('');
      console.log(chalk.gray('Current status:'));
      console.log(chalk.gray(`  Hunger: ${data.stats.hunger}%`));
      console.log(chalk.gray(`  Happiness: ${data.stats.happiness}%`));
      console.log(chalk.gray(`  Cleanliness: ${data.stats.cleanliness}%`));
      console.log(chalk.gray(`  Health: ${data.stats.health}%`));
      console.log(chalk.gray(`  Energy: ${data.stats.energy}%`));
      console.log('');
      return;
    }

    // Show actions taken
    console.log(chalk.cyan('Actions taken:'));
    for (const action of result.actionsTaken) {
      if (action.success) {
        const statChange = action.statChanges[0];
        if (statChange) {
          console.log(
            chalk.green(`  ✓ ${getActionMessage(action)} (${statChange.from} → ${statChange.to})`)
          );
        } else {
          console.log(chalk.green(`  ✓ ${getActionMessage(action)}`));
        }
      } else {
        console.log(chalk.red(`  ✗ ${getActionMessage(action)}`));
        if (action.reason) {
          console.log(chalk.gray(`    ${action.reason}`));
        }
      }
    }

    console.log(drawDivider(46));

    // Show summary
    const successfulActions = result.actionsTaken.filter((a) => a.success);
    if (successfulActions.length > 0) {
      console.log(chalk.green(`${data.name} feels much better! 🎉`));
    }

    // Show coins
    console.log('');
    console.log(chalk.yellow(`Coins: ${pet.getCoins()} 🪙`));
    console.log('');
  });

function getActionMessage(action: CareActionResult): string {
  const petName = 'Sparky'; // Generic name, will be replaced with actual pet name in display

  switch (action.action) {
    case 'feed':
      return `Fed ${petName} (${action.itemName})`;
    case 'play':
      return `Played with ${petName} (${action.itemName})`;
    case 'clean':
      return `Cleaned ${petName} (${action.itemName})`;
    case 'heal':
      return `Healed ${petName} (${action.itemName})`;
    default:
      return action.itemName;
  }
}
