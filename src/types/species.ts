export enum PetSpecies {
  CAT = 'cat',
  DOG = 'dog',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  BIRD = 'bird',
  DRAGON = 'dragon',
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
  [PetSpecies.RABBIT]: {
    name: 'Rabbit',
    emoji: '🐰',
    favoriteFood: 'Carrot',
    favoriteActivity: 'Hopping',
    ascii: {
      normal: `    (\\ /)
   ( •.• )
    c(")(")`,
      happy: `    (\\ /)
   ( ^.^ )
    c(")(")`,
      sad: `    (\\ /)
   ( T.T )
    c(")(")`,
      sick: `    (\\ /)
   ( x.x )
    c(")(")`,
    },
  },
  [PetSpecies.HAMSTER]: {
    name: 'Hamster',
    emoji: '🐹',
    favoriteFood: 'Sunflower seeds',
    favoriteActivity: 'Running on wheel',
    ascii: {
      normal: `   (\\,/)
   (o.O)
   (> <)
  /_| |_\\`,
      happy: `   (\\,/)
   (^.^)
   (> <)
  /_| |_\\`,
      sad: `   (\\,/)
   (T.T)
   (> <)
  /_| |_\\`,
      sick: `   (\\,/)
   (x.x)
   (> <)
  /_| |_\\`,
    },
  },
  [PetSpecies.BIRD]: {
    name: 'Bird',
    emoji: '🐦',
    favoriteFood: 'Seeds',
    favoriteActivity: 'Singing',
    ascii: {
      normal: `   (>
   />
  (___)`,
      happy: `   (>
   />
  (^o^)`,
      sad: `   (>
   />
  (T_T)`,
      sick: `   (>
   />
  (x_x)`,
    },
  },
  [PetSpecies.DRAGON]: {
    name: 'Dragon',
    emoji: '🐉',
    favoriteFood: 'Gems',
    favoriteActivity: 'Flying',
    ascii: {
      normal: `     ,,
    ("><
    /|
   // )
  (____/`,
      happy: `     ,,
    (^"^)
    /|
   // )
  (____/)`,
      sad: `     ,,
    (T.T)
    /|
   // )
  (____ /`,
      sick: `     ,,
    (x.x)
    /|
   // )
  (____ /`,
    },
  },
};
