import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider, drawStatChanges, getMoodEmoji, getMoodDescription } from '../ui/display';
import { getActionAscii, getPetAscii } from '../ui/ascii-art';
import { ItemType, getItem } from '../types/items';

export const playCommand = new Command('play');

playCommand.description('Play with your pet').action(async () => {
  const db = new Database();

  if (!db.hasPet()) {
    console.log(chalk.yellow("You don't have a pet yet!"));
    console.log(chalk.gray('Use "pet init" to create one.'));
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();
  const inventory = pet.getInventory();

  if (data.isSleeping) {
    console.log(chalk.yellow(`${data.name} is sleeping! Wake them up first.`));
    console.log(chalk.gray('Use "pet sleep" to wake them up.'));
    console.log('');
    return;
  }

  // Get toy items from inventory
  const toyItems = inventory.getItemsByType(ItemType.TOY);

  if (toyItems.length === 0) {
    console.log('');
    console.log(drawHeader('NO TOYS'));
    console.log('');
    console.log(chalk.green(getPetAscii(data.species, data.mood, data.isSleeping)));
    console.log('');
    console.log(chalk.yellow("You don't have any toys!"));
    console.log(chalk.gray('Use "pet inventory" to see your items.'));
    console.log(chalk.gray('Find items through gameplay or future shop features!'));
    console.log('');
    return;
  }

  // If only one toy item, use it directly
  if (toyItems.length === 1) {
    const itemId = toyItems[0].itemId;
    const itemDef = getItem(itemId);
    if (itemDef) {
      useToyItem(pet, data, itemId, itemDef);
      return;
    }
  }

  // Let user choose which toy to use
  const choices = toyItems.map((item) => {
    const itemDef = getItem(item.itemId);
    return {
      name: `${itemDef?.emoji || '🎾'} ${itemDef?.name} (x${item.quantity})`,
      value: item.itemId,
    };
  });

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'itemId',
      message: 'What would you like to play with?',
      choices,
    },
  ]);

  const itemId = answers.itemId;
  const itemDef = getItem(itemId);
  if (itemDef) {
    useToyItem(pet, data, itemId, itemDef);
  }
});

function useToyItem(pet: Pet, data: any, itemId: string, itemDef: any): void {
  const result = pet.useItem(itemId);

  console.log('');
  console.log(drawHeader('PLAY TIME!'));
  console.log('');

  console.log(chalk.green(getActionAscii('play', data.species)));
  console.log('');

  console.log(drawDivider(42));
  console.log(chalk.cyan(`${data.name} had fun with the ${itemDef.name}! ${itemDef.emoji}`));
  console.log(chalk.gray(itemDef.description));
  console.log(drawDivider(42));

  if (result.success) {
    console.log('');
    const lines = drawStatChanges(result.statChanges);
    console.log(lines.join('\n'));

    const newData = pet.getData();
    const moodEmoji = getMoodEmoji(newData.mood);
    const moodDesc = getMoodDescription(newData.mood);
    console.log('');
    console.log(
      chalk.magenta(`Mood: ${moodEmoji} ${newData.mood.toUpperCase()} - ${moodDesc}`),
    );

    if (result.levelUp) {
      console.log('');
      console.log(chalk.yellow.bold(`Level ${result.newLevel} reached! 🎉`));
    }

    console.log('');
    console.log(chalk.gray(`XP: +${result.xpGained}`));
  } else {
    console.log(chalk.yellow(result.message));
  }

  console.log('');
}
