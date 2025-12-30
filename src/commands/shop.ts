import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { getShop, Shop } from '../core/shop';
import { drawHeader, drawDivider } from '../ui/display';
import { getRarityColor, getRarityIcon } from '../types/items';

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

export const shopCommand = new Command('shop');

shopCommand
  .alias('store')
  .description('Visit the pet shop to buy items')
  .action(async () => {
    const db = new Database();

    if (!db.hasPet()) {
      console.log(chalk.yellow("You don't have a pet yet!"));
      console.log(chalk.gray('Use "pet init" to create one.'));
      return;
    }

    const pet = await Pet.loadOrCreate(db);
    const shop = getShop();

    // Show shop header with player's coins
    const coins = pet.getCoins();
    console.log('');
    console.log(drawHeader('🏪 PET SHOP', 44));
    console.log('');
    console.log(chalk.yellow.bold(`Your Coins: ${Shop.formatCoins(coins)}`));
    console.log(chalk.gray(Shop.getShopDescription()));
    console.log('');
    console.log(drawDivider(44));

    // Get items grouped by category
    const itemsByCategory = shop.getShopItemsByCategory();

    // Display items by category
    for (const [category, items] of itemsByCategory.entries()) {
      console.log('');
      console.log(chalk.cyan.bold(`  ${category}`));
      console.log(chalk.gray('  ' + '-'.repeat(40)));

      for (const shopItem of items) {
        const { item, price } = shopItem;
        const rarityColor = getRarityColor(item.rarity);
        const rarityIcon = getRarityIcon(item.rarity);
        const colorFn = getChalkColor(rarityColor);

        const canAfford = shop.canAfford(item.id, coins);
        const maxAffordable = shop.maxAffordable(item.id, coins);
        const statusText = canAfford
          ? chalk.green(`✓ Can buy x${maxAffordable}`)
          : chalk.red(`✗ Too expensive`);

        console.log(`  ${colorFn(item.emoji)} ${chalk.bold(item.name)} ${rarityIcon}`);
        console.log(
          chalk.gray(
            `    Price: ${chalk.yellow(price + ' 🪙')}    ${statusText}`,
          ),
        );
        console.log(chalk.gray(`    ${item.description}`));

        // Show effects
        const effects: string[] = [];
        if (item.effect.hunger) effects.push(`${item.effect.hunger > 0 ? '+' : ''}${item.effect.hunger} hunger`);
        if (item.effect.happiness) effects.push(`${item.effect.happiness > 0 ? '+' : ''}${item.effect.happiness} happy`);
        if (item.effect.health) effects.push(`${item.effect.health > 0 ? '+' : ''}${item.effect.health} health`);
        if (item.effect.cleanliness) effects.push(`${item.effect.cleanliness > 0 ? '+' : ''}${item.effect.cleanliness} clean`);
        if (item.effect.energy) effects.push(`${item.effect.energy > 0 ? '+' : ''}${item.effect.energy} energy`);
        if (effects.length > 0) {
          console.log(chalk.gray(`    Effects: ${effects.join(', ')}`));
        }
        console.log('');
      }
    }

    console.log(drawDivider(44));

    // Ask if user wants to buy something
    const { wantsToBuy } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantsToBuy',
        message: 'Would you like to buy something?',
        default: false,
      },
    ]);

    if (!wantsToBuy) {
      console.log('');
      console.log(chalk.gray('Thanks for visiting! Come back soon!'));
      console.log('');
      return;
    }

    // Let user choose category first
    const { category } = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: 'Which category?',
        choices: Array.from(itemsByCategory.keys()),
      },
    ]);

    // Filter items by chosen category
    const categoryItems = itemsByCategory.get(category) || [];

    // Create choices for items in this category
    const itemChoices = categoryItems
      .filter((shopItem) => shop.canAfford(shopItem.item.id, coins))
      .map((shopItem) => ({
        name: `${shopItem.item.emoji} ${shopItem.item.name} - ${shopItem.price} 🪙`,
        value: shopItem.item.id,
      }));

    if (itemChoices.length === 0) {
      console.log('');
      console.log(chalk.yellow("You can't afford any items in this category!"));
      console.log('');
      return;
    }

    // Let user choose item
    const { itemId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'itemId',
        message: 'What would you like to buy?',
        choices: itemChoices,
      },
    ]);

    // Ask quantity
    const maxQty = shop.maxAffordable(itemId, coins);
    const { quantity } = await inquirer.prompt([
      {
        type: 'number',
        name: 'quantity',
        message: `How many? (max ${maxQty})`,
        default: 1,
        validate: (input: number) => {
          const num = parseInt(input.toString());
          if (isNaN(num) || num < 1) {
            return 'Please enter a valid number';
          }
          if (num > maxQty) {
            return `You can only afford ${maxQty}`;
          }
          return true;
        },
      },
    ]);

    const qty = parseInt(quantity.toString());
    const totalPrice = shop.getItemPrice(itemId)! * qty;

    // Confirm purchase
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Buy ${qty}x for ${totalPrice} 🪙?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log('');
      console.log(chalk.gray('Purchase cancelled.'));
      console.log('');
      return;
    }

    // Process purchase
    if (pet.spendCoins(totalPrice)) {
      pet.addItem(itemId, qty);

      const boughtItem = shop.getShopItem(itemId);
      console.log('');
      console.log(drawHeader('RECEIPT', 36));
      console.log('');
      console.log(chalk.cyan(`  ${boughtItem?.item.emoji} ${boughtItem?.item.name} x${qty}`));
      console.log(chalk.gray(`  Price: ${totalPrice} 🪙`));
      console.log(drawDivider(36));
      console.log(chalk.yellow(`  Remaining: ${Shop.formatCoins(pet.getCoins())}`));
      console.log('');
      console.log(chalk.gray('  Thank you for your purchase!'));
      console.log('');
    } else {
      console.log('');
      console.log(chalk.red('Something went wrong!'));
      console.log('');
    }
  });
