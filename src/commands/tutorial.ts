import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { drawHeader, drawDivider } from '../ui/display';

export const tutorialCommand = new Command('tutorial');

/**
 * Tutorial steps
 */
const TUTORIAL_STEPS = [
  {
    title: 'Welcome & Philosophy',
    emoji: '🐱',
    content: [
      '',
      chalk.white.bold('Welcome to Pet Terminal!'),
      '',
      chalk.gray('Your pet lives in your terminal and grows when you code.'),
      '',
      chalk.magenta('"Writing code = being with your pet"'),
      '',
      chalk.gray('This isn\'t a chore - it\'s a companion! Your pet gains'),
      chalk.gray('stats automatically when you make Git commits, because'),
      chalk.gray('they\'re happy just watching you work.'),
      '',
    ],
  },
  {
    title: 'Meet Your Pet',
    emoji: '📊',
    content: [
      '',
      chalk.white.bold('Your pet has 5 stats to monitor:'),
      '',
      chalk.cyan('  Hunger') + chalk.gray('      - Feed with ') + chalk.cyan('pet feed'),
      chalk.cyan('  Happiness') + chalk.gray('   - Play with ') + chalk.cyan('pet play'),
      chalk.cyan('  Health') + chalk.gray('      - Heal with ') + chalk.cyan('pet heal'),
      chalk.cyan('  Cleanliness') + chalk.gray('  - Clean with ') + chalk.cyan('pet clean'),
      chalk.cyan('  Energy') + chalk.gray('      - Sleep with ') + chalk.cyan('pet sleep'),
      '',
      chalk.gray('Stats decay slowly over time (days!), so don\'t worry too'),
      chalk.gray('much about checking constantly. Your pet is designed to'),
      chalk.gray('stay healthy for extended periods.'),
      '',
    ],
  },
  {
    title: 'Git Integration',
    emoji: '💻',
    content: [
      '',
      chalk.white.bold('This is the BEST part! Your pet LOVES watching you code.'),
      '',
      chalk.gray('Every Git commit gives:'),
      chalk.cyan('  • Coins') + chalk.gray(' for the shop'),
      chalk.cyan('  • Experience Points') + chalk.gray(' to level up'),
      chalk.cyan('  • Stat bonuses') + chalk.gray(' (hunger +15, happiness +10)'),
      '',
      chalk.gray('Just run:'),
      chalk.cyan('  pet git'),
      '',
      chalk.gray('Commit message prefixes affect rewards:'),
      chalk.green('  fix/bug') + chalk.gray('     → Bug Fix    ') + chalk.yellow('+10 🪙, +20 XP'),
      chalk.green('  feat/add') + chalk.gray('    → Feature    ') + chalk.yellow('+8 🪙, +15 XP'),
      chalk.green('  refactor') + chalk.gray('    → Refactor   ') + chalk.yellow('+6 🪙, +12 XP'),
      '',
    ],
  },
  {
    title: 'Shop & Inventory',
    emoji: '🛒',
    content: [
      '',
      chalk.white.bold('Earn coins from commits and spend them at the shop!'),
      '',
      chalk.gray('View your items:'),
      chalk.cyan('  pet inventory') + chalk.gray(' (or ') + chalk.cyan('pet inv') + chalk.gray(')'),
      '',
      chalk.gray('Visit the shop:'),
      chalk.cyan('  pet shop') + chalk.gray(' (or ') + chalk.cyan('pet store') + chalk.gray(')'),
      '',
      chalk.gray('Shop items:'),
      chalk.cyan('  • Fish') + chalk.gray(' - Basic food (+20 hunger)'),
      chalk.cyan('  • Ball') + chalk.gray(' - Toy for playing (+15 happiness)'),
      chalk.cyan('  • Soap') + chalk.gray(' - Cleaning supplies (+20 cleanliness)'),
      chalk.cyan('  • Medicine') + chalk.gray(' - Health restoration (+25 health)'),
      '',
    ],
  },
  {
    title: 'Tips & Tricks',
    emoji: '💡',
    content: [
      '',
      chalk.white.bold('Pro tips for a happy pet:'),
      '',
      chalk.gray('• Use ') + chalk.cyan('pet care') + chalk.gray(' for one-click care of all needs'),
      chalk.gray('• Run ') + chalk.cyan('pet git') + chalk.gray(' after coding sessions'),
      chalk.gray('• Daily commit streaks give bonus rewards!'),
      chalk.gray('• Use ') + chalk.cyan('pet sync') + chalk.gray(' to catch up on time passed'),
      chalk.gray('• Let your pet sleep to restore energy faster'),
      '',
      chalk.white.bold('Commands at a glance:'),
      chalk.cyan('  pet init') + chalk.gray('   - Create a pet'),
      chalk.cyan('  pet status') + chalk.gray(' - Check status'),
      chalk.cyan('  pet care') + chalk.gray('   - Quick care'),
      chalk.cyan('  pet git') + chalk.gray('    - Collect rewards'),
      '',
      chalk.magenta.bold('  That\'s it! Have fun with your new coding companion! 🐾'),
      '',
    ],
  },
];

/**
 * Wait for user input
 */
function waitForContinue(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.gray('[Press Enter to continue, or q to quit] '), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'q');
    });
  });
}

/**
 * Display a tutorial step
 */
async function showStep(stepIndex: number): Promise<boolean> {
  const step = TUTORIAL_STEPS[stepIndex];
  const totalSteps = TUTORIAL_STEPS.length;

  console.log('');
  console.log(drawHeader(`🐾 PET TERMINAL TUTORIAL`, 52));
  console.log('');

  // Progress indicator
  const progress = chalk.gray(`Step ${stepIndex + 1}/${totalSteps}`);
  const title = chalk.yellow.bold(`${step.emoji}  ${step.title}`);
  console.log(`${progress}  ${title}`);
  console.log('');

  console.log(drawDivider(52));

  // Step content
  for (const line of step.content) {
    console.log(line);
  }

  console.log(drawDivider(52));
  console.log('');

  // Wait for user input
  return await waitForContinue();
}

/**
 * Show complete tutorial
 */
async function showTutorial(): Promise<void> {
  // Show welcome
  console.log('');
  console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.yellow.bold('  🐾 PET TERMINAL TUTORIAL 🐾                                 ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.gray('Welcome to Pet Terminal! Let\'s get you started.'));
  console.log('');
  console.log(drawDivider(52));
  console.log('');

  const shouldStart = await waitForContinue();
  if (!shouldStart) {
    console.log('');
    console.log(chalk.gray('Tutorial cancelled. Run "pet tutorial" anytime to continue.'));
    console.log('');
    return;
  }

  // Show each step
  for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
    const shouldContinue = await showStep(i);
    if (!shouldContinue) {
      console.log('');
      console.log(chalk.gray('Tutorial paused. Run "pet tutorial" to continue from the beginning.'));
      console.log('');
      return;
    }
  }

  // Tutorial complete
  console.log('');
  console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.green.bold('  🎉 Tutorial Complete!                                       ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.magenta('  You\'re all set! Enjoy your new coding companion! 🐾'));
  console.log('');
  console.log(chalk.gray('Quick reference:'));
  console.log(chalk.cyan('  pet --help') + chalk.gray('    - Show all commands'));
  console.log(chalk.cyan('  pet status') + chalk.gray('   - Check your pet'));
  console.log(chalk.cyan('  pet git') + chalk.gray('      - Collect rewards'));
  console.log('');
}

tutorialCommand
  .alias('help')
  .alias('guide')
  .description('Show the getting started tutorial')
  .action(async () => {
    await showTutorial();
  });
