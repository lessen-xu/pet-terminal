import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider, drawStatChanges } from '../ui/display';
import { getPetAscii } from '../ui/ascii-art';

export const sleepCommand = new Command('sleep');

sleepCommand.description('Put your pet to sleep or wake them up').action(async () => {
  const db = new Database();

  if (!db.hasPet()) {
    console.log(chalk.yellow("You don't have a pet yet!"));
    console.log(chalk.gray('Use "pet init" to create one.'));
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();

  const wasSleeping = data.isSleeping;
  const result = pet.sleep();

  console.log('');
  console.log(drawHeader(wasSleeping ? 'GOOD MORNING!' : 'TIME FOR BED'));
  console.log('');

  const newData = pet.getData();
  console.log(chalk.green(getPetAscii(newData.species, newData.mood, wasSleeping)));
  console.log('');

  console.log(drawDivider(42));
  console.log(chalk.cyan(result.message));
  console.log(drawDivider(42));

  if (result.success && result.statChanges.length > 0) {
    console.log('');
    const lines = drawStatChanges(result.statChanges);
    console.log(lines.join('\n'));

    if (result.levelUp) {
      console.log('');
      console.log(chalk.yellow.bold(`Level ${result.newLevel} reached! 🎉`));
    }

    console.log('');
    console.log(chalk.gray(`XP: +${result.xpGained}`));
  }

  console.log('');
});
