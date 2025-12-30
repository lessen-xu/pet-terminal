#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { statusCommand } from './commands/status';
import { feedCommand } from './commands/feed';
import { playCommand } from './commands/play';
import { cleanCommand } from './commands/clean';
import { sleepCommand } from './commands/sleep';
import { healCommand } from './commands/heal';
import { syncCommand } from './commands/sync';
import { inventoryCommand } from './commands/inventory';
import { shopCommand } from './commands/shop';
import { gitCommand } from './commands/git';
import { careCommand } from './commands/care';
import { tutorialCommand } from './commands/tutorial';
import { WelcomeSystem } from './core/welcome';
import { showDetailedHelp } from './ui/help';

const program = new Command();

program
  .name('pet')
  .description('A terminal-based virtual pet game')
  .version('1.0.0', '-v, --version', 'Show version number')
  .addHelpText('afterAll', '\nNeed help? Run "pet tutorial" for the getting started guide.\n');

// Override default help to use our enhanced help system
program.configureHelp({
  showGlobalOptions: true,
});

program
  .command('hello')
  .description('Say hello to your virtual pet')
  .action(() => {
    WelcomeSystem.showStartupLogo();
  });

// Register all pet commands
program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(feedCommand);
program.addCommand(playCommand);
program.addCommand(cleanCommand);
program.addCommand(sleepCommand);
program.addCommand(healCommand);
program.addCommand(syncCommand);
program.addCommand(inventoryCommand);
program.addCommand(shopCommand);
program.addCommand(gitCommand);
program.addCommand(careCommand);
program.addCommand(tutorialCommand);

// Handle bare "pet" command - show welcome
program.action(() => {
  WelcomeSystem.showStartupLogo();
});

// Parse and execute
(async () => {
  try {
    // Check if we should show startup logo (not for --help or --version)
    const args = process.argv.slice(2);

    // Check if running a subcommand
    const hasValidCommand = args.length > 0 && program.commands.some(cmd =>
      cmd.name() === args[0] || cmd.aliases().includes(args[0])
    );

    // Only show logo if running bare "pet" command
    if (args.length === 0) {
      WelcomeSystem.showStartupLogo();
    } else if (!hasValidCommand && !args.includes('--help') && !args.includes('-h')) {
      // Unknown command, show help
      showDetailedHelp();
    }

    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
