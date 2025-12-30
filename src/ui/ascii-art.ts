import { PetSpecies, MoodState, SPECIES_CONFIGS } from '../types/species';

export const getPetAscii = (species: PetSpecies, mood: MoodState, isSleeping: boolean): string => {
  if (isSleeping) {
    return getSleepingAscii(species);
  }

  const config = SPECIES_CONFIGS[species];

  switch (mood) {
    case MoodState.HAPPY:
    case MoodState.EXCITED:
      return config.ascii.happy;
    case MoodState.SAD:
      return config.ascii.sad;
    case MoodState.SICK:
      return config.ascii.sick;
    default:
      return config.ascii.normal;
  }
};

const getSleepingAscii = (species: PetSpecies): string => {
  const sleepingArt: Record<PetSpecies, string> = {
    [PetSpecies.CAT]: `   /\\_/\\
 ( -.-)
  > Z <`,
    [PetSpecies.DOG]: `  / \\__
 (    Z\\___
  /    -    O
 /   (_____ /
/_____/   z`,
    [PetSpecies.RABBIT]: `    (\\ /)
   ( -.-)
    z(")(")`,
    [PetSpecies.HAMSTER]: `   (\\,/)
   (-.-)
   (Z Z)
  /_| |_\\`,
    [PetSpecies.BIRD]: `   (>
   />
  (-_-)`,
    [PetSpecies.DRAGON]: `     ,,
    (Z.<
    /|
   // )
  (____/`,
  };
  return sleepingArt[species];
};

export const getActionAscii = (action: string, species: PetSpecies): string => {
  const actionArt: Record<string, Record<PetSpecies, string>> = {
    eat: {
      [PetSpecies.CAT]: `   /\\_/\\
 ( nom)
  > * <`,
      [PetSpecies.DOG]: `  / \\__
 (    nom\\___
  /         O
 /   (_____ /
/_____/   U`,
      [PetSpecies.RABBIT]: `    (\\ /)
   ( •.• )
    c(")(")
   *crunch*`,
      [PetSpecies.HAMSTER]: `   (\\,/)
   (o.O)nom
   (> <)
  /_| |_\\`,
      [PetSpecies.BIRD]: `   (>
   />  peck
  (^o^)`,
      [PetSpecies.DRAGON]: `     ,,
    (nom)<
    /|
   // )
  (____/`,
    },
    play: {
      [PetSpecies.CAT]: `   /\\_/\\
 ( ~^~)
  > * <`,
      [PetSpecies.DOG]: `  / \\__
 (    ~\\___
  /    ~    O
 /   (_____ /
/_____/   U`,
      [PetSpecies.RABBIT]: `    (\\ /)
   ( ~^~ )
    c(")(")`,
      [PetSpecies.HAMSTER]: `   (\\,/)
   (~^~)
   (O O)
  /_| |_\\`,
      [PetSpecies.BIRD]: `   (>
   />  whee!
  (~^~)`,
      [PetSpecies.DRAGON]: `     ,,
    (~^~)<
    /|
   // )
  (____/`,
    },
    clean: {
      [PetSpecies.CAT]: `   /\\_/\\
 ( ^.^)
  > * <
   *splash*`,
      [PetSpecies.DOG]: `  / \\__
 (    @\\___
  /    ~    O
 /   (_____ /
/_____/   U
  *bath time*`,
      [PetSpecies.RABBIT]: `    (\\ /)
   ( ^.^ )
    c(")(")
   *sparkle*`,
      [PetSpecies.HAMSTER]: `   (\\,/)
   (^.^)
   (> <)
  /_| |_\\
   *clean*`,
      [PetSpecies.BIRD]: `   (>
   />
  (^o^)
  *splash*`,
      [PetSpecies.DRAGON]: `     ,,
    (^"^)<
    /|
   // )
  (____/)
  *splash*`,
    },
    heal: {
      [PetSpecies.CAT]: `   /\\_/\\
 ( ^.^)
  > + <
   *glow*`,
      [PetSpecies.DOG]: `  / \\__
 (    +\\___
  /    *    O
 /   (_____ /
/_____/   U
  *healing*`,
      [PetSpecies.RABBIT]: `    (\\ /)
   ( ^.^ )
    c(")(")
   *sparkle*`,
      [PetSpecies.HAMSTER]: `   (\\,/)
   (+^+)
   (> <)
  /_| |_\\
   *heal*`,
      [PetSpecies.BIRD]: `   (>
   />
  (^o^)
  *glow*`,
      [PetSpecies.DRAGON]: `     ,,
    (+^+)<
    /|
   // )
  (____/)
  *healing*`,
    },
  };

  return actionArt[action]?.[species] || SPECIES_CONFIGS[species].ascii.normal;
};
