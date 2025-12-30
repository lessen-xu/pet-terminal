import { Command } from 'commander';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { drawHeader, drawDivider, drawProgressBar, drawXPBar, getMoodEmoji, getMoodDescription } from '../ui/display';
import { getPetAscii } from '../ui/ascii-art';
import { getTimeAgo } from '../types/time';
import { Shop } from '../core/shop';

export const statusCommand = new Command('status');

statusCommand.description('Display your pet status').action(async () => {
  const db = new Database();

  if (!db.hasPet()) {
    console.log(chalk.yellow("You don't have a pet yet!"));
    console.log(chalk.gray('Use "pet init" to create one.'));
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();

  console.log('');
  console.log(drawHeader(`${data.name} the ${data.species}`, 42));
  console.log('');

  console.log(chalk.green(getPetAscii(data.species, data.mood, data.isSleeping)));
  console.log('');

  const statusText = data.isSleeping ? 'Sleeping' : 'Awake';
  const statusEmoji = data.isSleeping ? '💤' : '⚡';

  console.log(chalk.gray(`Status: ${statusEmoji} ${statusText}`));
  console.log('');

  // Show last interaction time
  const lastInteractionTime = getTimeAgo(data.lastInteraction);
  console.log(chalk.gray(`Last seen: ${lastInteractionTime.raw}`));
  console.log('');

  console.log(drawDivider(42));
  console.log(drawProgressBar('Hunger', data.stats.hunger));
  console.log(drawProgressBar('Happiness', data.stats.happiness));
  console.log(drawProgressBar('Health', data.stats.health));
  console.log(drawProgressBar('Cleanliness', data.stats.cleanliness));
  console.log(drawProgressBar('Energy', data.stats.energy));
  console.log(drawDivider(42));

  // Show warnings if pet needs care
  if (pet.needsCare()) {
    console.log('');
    const warnings: string[] = [];
    if (data.stats.hunger < 30) warnings.push(chalk.red('🍖 Starving!'));
    if (data.stats.happiness < 30) warnings.push(chalk.yellow('😢 Depressed!'));
    if (data.stats.health < 40) warnings.push(chalk.red('💊 Unwell!'));
    if (data.stats.cleanliness < 30) warnings.push(chalk.yellow('🛁 Filthy!'));
    if (data.stats.energy < 20) warnings.push(chalk.yellow('😴 Exhausted!'));

    console.log(chalk.bold.red('Needs attention:'));
    console.log(warnings.join('   '));
  }

  console.log('');
  console.log(drawXPBar(data.experience, pet.getXPToNextLevel() + data.experience));
  console.log('');

  const levelTitle = pet.getLevelTitle();
  console.log(
    chalk.gray(
      `Level: ${chalk.bold(data.level)} (${levelTitle})   Interactions: ${data.totalInteractions}`,
    ),
  );
  console.log('');

  const moodEmoji = getMoodEmoji(data.mood);
  const moodDesc = getMoodDescription(data.mood);
  console.log(
    chalk.magenta(`Mood: ${moodEmoji} ${data.mood.toUpperCase()} - ${data.name} ${moodDesc}`),
  );
  console.log('');

  // Display coins
  const coins = pet.getCoins();
  const todayCoins = pet.getTodayCoins();
  console.log(
    chalk.yellow(`Coins: ${chalk.bold(Shop.formatCoins(coins))}`),
  );
  if (todayCoins > 0) {
    console.log(chalk.gray(`Today's earnings: +${todayCoins} 🪙`));
  }
  console.log('');

  // Display Git stats
  const gitStreak = pet.getGitStreak();
  const gitCommits = pet.getGitCommitCount();
  if (gitStreak > 0 || gitCommits > 0) {
    console.log(chalk.gray(`Git Streak: ${chalk.bold.yellow(gitStreak + ' days')} 🔥`));
    console.log(chalk.gray(`Total Commits: ${chalk.bold(gitCommits)} 📝`));
    console.log('');
  }

  // Display suggestions (only if there are any)
  const suggestions = pet.getSuggestions();
  if (suggestions.length > 0) {
    for (const suggestion of suggestions) {
      console.log(chalk.gray(suggestion));
    }
    console.log('');
  }
});
