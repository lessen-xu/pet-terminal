import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider } from '../ui/display';
import { getItem, getRarityIcon, getRarityColor, ItemType } from '../types/items';

const getChalkColor = (color: string): ((text: string) => string) => {
  switch (color) {
    case 'white':
      return chalk.white;
    case 'blue':
      return chalk.blue;
    case 'magenta':
      return chalk.magenta;
    case 'yellow':
      return chalk.yellow;
    default:
      return chalk.white;
  }
};

export const inventoryCommand = new Command('inventory');

inventoryCommand
  .alias('bag')
  .alias('inv')
  .description('Display your pet inventory')
  .action(async () => {
    const db = new Database();

    if (!db.hasPet()) {
      console.log(chalk.yellow("You don't have a pet yet!"));
      console.log(chalk.gray('Use "pet init" to create one.'));
      return;
    }

    const pet = await Pet.loadOrCreate(db);
    const data = pet.getData();
    const inventory = pet.getInventory();

    console.log('');
    console.log(drawHeader(`${data.name}'s Inventory`, 44));
    console.log('');

    const items = inventory.getAllItems();

    if (items.length === 0) {
      console.log(chalk.gray('Your inventory is empty.'));
      console.log(chalk.gray('Use items to take care of your pet!'));
      console.log('');
      return;
    }

    // Group items by type
    const foodItems = items.filter((i) => getItem(i.itemId)?.type === ItemType.FOOD);
    const toyItems = items.filter((i) => getItem(i.itemId)?.type === ItemType.TOY);
    const cleaningItems = items.filter((i) => getItem(i.itemId)?.type === ItemType.CLEANING);
    const medicineItems = items.filter((i) => getItem(i.itemId)?.type === ItemType.MEDICINE);

    const totalItems = inventory.getTotalItemCount();
    console.log(chalk.gray(`Total items: ${totalItems}`));
    console.log('');

    // Display items by category
    if (foodItems.length > 0) {
      console.log(chalk.cyan.bold('🍽️  Food:'));
      displayItems(foodItems);
    }

    if (toyItems.length > 0) {
      console.log(chalk.cyan.bold('🎾 Toys:'));
      displayItems(toyItems);
    }

    if (cleaningItems.length > 0) {
      console.log(chalk.cyan.bold('🧹 Cleaning:'));
      displayItems(cleaningItems);
    }

    if (medicineItems.length > 0) {
      console.log(chalk.cyan.bold('💊 Medicine:'));
      displayItems(medicineItems);
    }

    console.log(drawDivider(44));
    console.log('');
    console.log(chalk.gray('Use "pet feed", "pet play", "pet clean", or "pet heal" to use items.'));
    console.log('');
  });

function displayItems(items: Array<{ itemId: string; quantity: number }>): void {
  for (const item of items) {
    const itemDef = getItem(item.itemId);
    if (!itemDef) continue;

    const rarityColor = getRarityColor(itemDef.rarity);
    const rarityIcon = getRarityIcon(itemDef.rarity);
    const colorFn = getChalkColor(rarityColor);
    const quantityStr = item.quantity > 1 ? chalk.gray(` x${item.quantity}`) : '';

    console.log(`  ${colorFn(itemDef.emoji)} ${chalk.bold(itemDef.name)}${quantityStr}`);

    // Show effect hints
    const effects: string[] = [];
    if (itemDef.effect.hunger) effects.push(`${itemDef.effect.hunger > 0 ? '+' : ''}${itemDef.effect.hunger} hunger`);
    if (itemDef.effect.happiness) effects.push(`${itemDef.effect.happiness > 0 ? '+' : ''}${itemDef.effect.happiness} happy`);
    if (itemDef.effect.health) effects.push(`${itemDef.effect.health > 0 ? '+' : ''}${itemDef.effect.health} health`);
    if (itemDef.effect.cleanliness) effects.push(`${itemDef.effect.cleanliness > 0 ? '+' : ''}${itemDef.effect.cleanliness} clean`);
    if (itemDef.effect.energy) effects.push(`${itemDef.effect.energy > 0 ? '+' : ''}${itemDef.effect.energy} energy`);

    console.log(`    ${chalk.gray(itemDef.description)}`);
    if (effects.length > 0) {
      console.log(`    ${chalk.gray(`Effects: ${effects.join(', ')}`)}`);
    }
    console.log(`    ${chalk.gray(`${rarityIcon} ${itemDef.rarity}`)}`);
    console.log('');
  }
}
