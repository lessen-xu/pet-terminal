import chalk from 'chalk';
import { drawHeader, drawDivider } from './display';

/**
 * Command help information
 */
interface CommandHelp {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  related: string[];
}

/**
 * All command help data
 */
const COMMAND_HELP: Record<string, CommandHelp> = {
  init: {
    name: 'init',
    description: 'Create a new pet',
    usage: 'pet init',
    examples: [
      'pet init              # Create your first pet',
    ],
    related: ['status', 'tutorial'],
  },
  status: {
    name: 'status',
    description: 'Display your pet\'s current status and stats',
    usage: 'pet status',
    examples: [
      'pet status            # Check on your pet',
    ],
    related: ['sync', 'care'],
  },
  feed: {
    name: 'feed',
    description: 'Feed your pet to restore hunger',
    usage: 'pet feed',
    examples: [
      'pet feed              # Feed your pet with available food',
    ],
    related: ['shop', 'inventory', 'care'],
  },
  play: {
    name: 'play',
    description: 'Play with your pet to increase happiness',
    usage: 'pet play',
    examples: [
      'pet play              # Play with your pet',
    ],
    related: ['shop', 'inventory', 'care'],
  },
  clean: {
    name: 'clean',
    description: 'Clean your pet to restore cleanliness',
    usage: 'pet clean',
    examples: [
      'pet clean             # Give your pet a bath',
    ],
    related: ['shop', 'inventory', 'care'],
  },
  heal: {
    name: 'heal',
    description: 'Heal your pet with medicine',
    usage: 'pet heal',
    examples: [
      'pet heal              # Use medicine to heal your pet',
    ],
    related: ['shop', 'inventory', 'care'],
  },
  sleep: {
    name: 'sleep',
    description: 'Put your pet to sleep or wake them up',
    usage: 'pet sleep',
    examples: [
      'pet sleep             # Toggle sleep state',
    ],
    related: ['status'],
  },
  care: {
    name: 'care',
    description: 'One-click care for all your pet\'s needs',
    usage: 'pet care',
    examples: [
      'pet care              # Handle all care needs at once',
      'pet auto              # Same as pet care',
      'pet all               # Same as pet care',
    ],
    related: ['status', 'shop', 'inventory'],
  },
  inventory: {
    name: 'inventory',
    description: 'Display items in your inventory',
    usage: 'pet inventory',
    examples: [
      'pet inventory         # Show all items',
      'pet inv               # Short form',
      'pet items             # Alternative alias',
    ],
    related: ['shop', 'feed', 'play', 'clean', 'heal'],
  },
  shop: {
    name: 'shop',
    description: 'Visit the pet shop to buy items',
    usage: 'pet shop',
    examples: [
      'pet shop              # Open the shop',
      'pet store             # Same as pet shop',
    ],
    related: ['inventory', 'git'],
  },
  git: {
    name: 'git',
    description: 'Check for new Git commits and earn rewards',
    usage: 'pet git',
    examples: [
      'pet git               # Check for new commits',
      'pet commits           # Same as pet git',
    ],
    related: ['shop', 'status'],
  },
  sync: {
    name: 'sync',
    description: 'Sync time and show stat changes from decay',
    usage: 'pet sync',
    examples: [
      'pet sync              # Catch up on time passed',
    ],
    related: ['status'],
  },
  tutorial: {
    name: 'tutorial',
    description: 'Show the getting started tutorial',
    usage: 'pet tutorial',
    examples: [
      'pet tutorial          # View the tutorial',
      'pet help              # Same as pet tutorial',
      'pet guide             # Same as pet tutorial',
    ],
    related: ['init'],
  },
};

/**
 * Show detailed help for a specific command
 */
export const showCommandHelp = (commandName: string): void => {
  const help = COMMAND_HELP[commandName];

  if (!help) {
    console.log(chalk.red(`Unknown command: ${commandName}`));
    console.log(chalk.gray('Run "pet --help" to see all commands.'));
    console.log('');
    return;
  }

  console.log('');
  console.log(drawHeader(`PET ${commandName.toUpperCase()}`, 48));
  console.log('');

  // Description
  console.log(chalk.white.bold('Description:'));
  console.log(`  ${help.description}`);
  console.log('');

  // Usage
  console.log(chalk.white.bold('Usage:'));
  console.log(chalk.cyan(`  ${help.usage}`));
  console.log('');

  // Examples
  if (help.examples.length > 0) {
    console.log(chalk.white.bold('Examples:'));
    for (const example of help.examples) {
      console.log(chalk.cyan(`  ${example}`));
    }
    console.log('');
  }

  // Related commands
  if (help.related.length > 0) {
    console.log(chalk.white.bold('Related Commands:'));
    const relatedList = help.related.map(cmd => {
      const cmdHelp = COMMAND_HELP[cmd];
      return cmdHelp ? `${chalk.cyan(cmd)} - ${cmdHelp.description}` : chalk.cyan(cmd);
    }).join('\n  ');
    console.log(`  ${relatedList}`);
    console.log('');
  }

  console.log(drawDivider(48));
  console.log('');
};

/**
 * Show general help
 */
export const showGeneralHelp = (): void => {
  console.log('');
  console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.yellow.bold('  🐾 PET TERMINAL 🐾  Your Coding Companion  ') + chalk.cyan('  ║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
  console.log('');
  console.log(chalk.gray('A terminal-based virtual pet that grows when you code.'));
  console.log('');
  console.log(chalk.white.bold('USAGE:'));
  console.log(chalk.cyan('  pet <command>') + chalk.gray(' [options]'));
  console.log('');
  console.log(chalk.white.bold('COMMANDS:'));
  console.log('');

  // Group commands by category
  const categories = {
    'Getting Started': ['init', 'status', 'tutorial'],
    'Care Commands': ['feed', 'play', 'clean', 'heal', 'sleep', 'care'],
    'Management': ['inventory', 'shop', 'sync'],
    'Git Integration': ['git'],
  };

  for (const [category, commands] of Object.entries(categories)) {
    console.log(chalk.magenta.bold(`  ${category}:`));
    for (const cmd of commands) {
      const help = COMMAND_HELP[cmd];
      if (help) {
        const aliases = getAliases(cmd);
        const aliasStr = aliases.length > 0 ? chalk.gray(` (${aliases.join(', ')})`) : '';
        console.log(`    ${chalk.cyan(cmd.padEnd(12))}${aliasStr}  ${help.description}`);
      }
    }
    console.log('');
  }

  console.log(chalk.white.bold('OPTIONS:'));
  console.log('    ' + chalk.cyan('-h, --help') + '     Show help for a command');
  console.log('    ' + chalk.cyan('-v, --version') + '  Show version number');
  console.log('');

  console.log(chalk.white.bold('EXAMPLES:'));
  console.log(chalk.cyan('  pet init') + chalk.gray('              # Create your first pet'));
  console.log(chalk.cyan('  pet status') + chalk.gray('           # Check on your pet'));
  console.log(chalk.cyan('  pet git') + chalk.gray('               # Earn rewards for commits'));
  console.log(chalk.cyan('  pet care') + chalk.gray('              # One-click care'));
  console.log('');

  console.log(chalk.gray('For detailed help on a command:'));
  console.log(chalk.cyan('  pet help <command>'));
  console.log('');

  console.log(chalk.gray('Type "pet tutorial" to see the getting started guide.'));
  console.log('');
};

/**
 * Get aliases for a command
 */
const getAliases = (command: string): string[] => {
  const aliasMap: Record<string, string[]> = {
    care: ['auto', 'all'],
    inventory: ['inv', 'items'],
    shop: ['store'],
    git: ['commits'],
    tutorial: ['help', 'guide'],
  };
  return aliasMap[command] || [];
};

/**
 * Show enhanced help (general or command-specific)
 */
export const showDetailedHelp = (command?: string): void => {
  if (command && COMMAND_HELP[command]) {
    showCommandHelp(command);
  } else {
    showGeneralHelp();
  }
};

/**
 * Show quick tips
 */
export const showQuickTips = (): void => {
  const tips = [
    '💡 Make Git commits to earn coins and XP for your pet!',
    '💡 Use "pet care" for one-click care of all needs.',
    '💡 Run "pet git" after coding sessions to collect rewards.',
    '💡 Your pet gains stats automatically when you commit!',
    '💡 Use "pet shop" to buy food, toys, and supplies.',
    '💡 Keep a daily commit streak for bonus rewards!',
  ];

  console.log('');
  console.log(chalk.magenta.bold('  Quick Tips:'));
  for (const tip of tips) {
    console.log(chalk.gray(`  ${tip}`));
  }
  console.log('');
};
