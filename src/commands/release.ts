import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Database } from '../core/database';
import { drawHeader } from '../ui/display';

export const releaseCommand = new Command('release');

releaseCommand.description('Say goodbye to your pet forever').action(async () => {
  const db = new Database();

  if (!db.hasPet()) {
    console.log(chalk.yellow("You don't have a pet to release."));
    return;
  }

  const pet = db.getPet()!;

  console.log('');
  console.log(drawHeader(`${pet.name} the ${pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}`));
  console.log('');
  console.log(chalk.gray(`Level: ${pet.level} | Coins: ${pet.coins}`));
  console.log('');

  // Strict confirmation - two-step process
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to say goodbye to ${chalk.bold(pet.name)} forever?`,
      default: false,
    },
    {
      type: 'input',
      name: 'typeConfirm',
      message: `Type "yes" to confirm releasing ${pet.name}:`,
      validate: (input: string) => {
        if (input.toLowerCase() === 'yes') return true;
        return 'Please type "yes" to confirm, or press Ctrl+C to cancel.';
      },
      when: (answers) => answers.confirm,
    },
  ]);

  if (answers.typeConfirm && answers.typeConfirm.toLowerCase() === 'yes') {
    db.deletePet();
    console.log('');
    console.log(drawHeader('Goodbye, friend!'));
    console.log('');
    console.log(chalk.gray(`${pet.name} has returned to the wild...`));
    console.log('');
    console.log(chalk.cyan('Run "pet init" to create a new pet when you\'re ready.'));
    console.log('');
  } else {
    console.log('');
    console.log(chalk.green('Cancelled. Your pet is happy to stay with you!'));
    console.log('');
  }
});
