import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { PetSpecies, SPECIES_CONFIGS } from '../types/species';
import { MoodState } from '../types/species';
import { drawHeader } from '../ui/display';
import { getPetAscii } from '../ui/ascii-art';

export const initCommand = new Command('init');

initCommand.description('Create a new pet').action(async () => {
  const db = new Database();

  if (db.hasPet()) {
    console.log(chalk.yellow('You already have a pet!'));
    console.log(chalk.gray('Use "pet status" to see your pet.'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What would you like to name your pet?',
      default: 'Buddy',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Please enter a name for your pet.';
        }
        if (input.length > 20) {
          return 'Name must be 20 characters or less.';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'species',
      message: 'What species of pet would you like?',
      choices: Object.values(PetSpecies).map((species) => ({
        name: `${SPECIES_CONFIGS[species].emoji} ${SPECIES_CONFIGS[species].name}`,
        value: species,
      })),
    },
    {
      type: 'confirm',
      name: 'showTutorial',
      message: 'Would you like to see the tutorial after creating your pet?',
      default: true,
    },
  ]) as { name: string; species: PetSpecies; showTutorial: boolean };

  Pet.createNew(db, answers.name, answers.species);

  // Mark onboarding as complete since they've created their first pet
  db.markOnboardedComplete();

  console.log('');
  console.log(drawHeader('Your new pet has been born!'));
  console.log('');

  const config = SPECIES_CONFIGS[answers.species];
  console.log(chalk.green(getPetAscii(answers.species, MoodState.HAPPY, false)));
  console.log('');

  console.log(chalk.magenta(`A ${config.name} named ${chalk.bold(answers.name)} has joined you!`));
  console.log(chalk.gray(`Birth Date: ${new Date().toLocaleDateString()}`));
  console.log('');
  console.log(chalk.cyan('Use "pet status" to see your pet stats!'));
  console.log(chalk.cyan('Use "pet --help" to see all commands.'));
  console.log('');

  // Ask about tutorial
  if (answers.showTutorial) {
    const { viewTutorial } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'viewTutorial',
        message: 'View the tutorial now?',
        default: true,
      },
    ]);

    if (viewTutorial) {
      console.log('');
      console.log(chalk.cyan('Run "pet tutorial" to see the getting started guide!'));
      console.log('');
    }
  }
});
