export enum PetSpecies {
  CAT = 'cat',
  DOG = 'dog',
}

export enum MoodState {
  HAPPY = 'happy',
  SAD = 'sad',
  SICK = 'sick',
  ANGRY = 'angry',
  SLEEPY = 'sleepy',
  EXCITED = 'excited',
}

export interface SpeciesConfig {
  name: string;
  emoji: string;
  favoriteFood: string;
  favoriteActivity: string;
  ascii: {
    normal: string;
    happy: string;
    sad: string;
    sick: string;
  };
}

export const SPECIES_CONFIGS: Record<PetSpecies, SpeciesConfig> = {
  [PetSpecies.CAT]: {
    name: 'Cat',
    emoji: '🐱',
    favoriteFood: 'Fish',
    favoriteActivity: 'Chasing laser',
    ascii: {
      normal: `   /\\_/\\
 ( o.o )
  > ^ <`,
      happy: `   /\\_/\\
 ( ^.^ )
  > * <`,
      sad: `   /\\_/\\
 ( T.T )
  > ^ <`,
      sick: `   /\\_/\\
 ( x.x )
  > ^ <`,
    },
  },
  [PetSpecies.DOG]: {
    name: 'Dog',
    emoji: '🐕',
    favoriteFood: 'Bone',
    favoriteActivity: 'Fetch',
    ascii: {
      normal: `  / \\__
 (    @\\___
  /         O
 /   (_____ /
/_____/   U`,
      happy: `  / \\__
 (    ^\\___
  /         O
 /   (_____ /
/_____/   U`,
      sad: `  / \\__
 (    T\\___
  /         O
 /   (_____ /
/_____/   U`,
      sick: `  / \\__
 (    x\\___
  /         O
 /   (_____ /
/_____/   U`,
    },
  },
};
