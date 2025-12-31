import { PetSpecies, MoodState } from '../types/species';

// ============================================
// CAT ASCII ART (pointed ears, whiskers)
// ============================================

const CAT_HAPPY =
  '   /\\_/\\  \n' +
  '  ( ^.^ ) \n' +
  '  ># #<   ';

const CAT_SAD =
  '   /\\_/\\  \n' +
  '  ( ;_; ) \n' +
  '  >T T<   ';

const CAT_SICK =
  '   /\\_/\\  \n' +
  '  ( @.@ ) \n' +
  '  >x x<   ';

const CAT_SLEEPY =
  '   /\\_/\\  \n' +
  '  ( -.- ) \n' +
  '  ># #<   ';

const CAT_SLEEPING =
  '   /\\_/\\  \n' +
  '  (-.-)   \n' +
  ' ~Zzz~    ';

const CAT_CODING =
  '   /\\_/\\  \n' +
  '  [0-0]   \n' +
  ' [code]   ';

const CAT_EATING =
  '   /\\_/\\  \n' +
  '  ( OmO ) \n' +
  '  ># <    ';

const CAT_PLAYING =
  '   /\\_/\\  \n' +
  '  ( ^o^ ) \n' +
  '  >* <    ';

// ============================================
// DOG ASCII ART (floppy ears)
// ============================================

const DOG_HAPPY =
  '   __ /__  \n' +
  '  //  ^  \\\\\n' +
  ' (  >•<  ) \n' +
  '  \\___/   ';

const DOG_SAD =
  '   __ /__  \n' +
  '  //  ;  \\\\\n' +
  ' (  >T<  ) \n' +
  '  \\___/   ';

const DOG_SICK =
  '   __ /__  \n' +
  '  //  @  \\\\\n' +
  ' (  >x<  ) \n' +
  '  \\___/   ';

const DOG_SLEEPY =
  '   __ /__  \n' +
  '  // -.-  \\\\\n' +
  ' (  >•<  ) \n' +
  '  \\___/   ';

const DOG_SLEEPING =
  '   __ /__  \n' +
  '  // - -  \\\\\n' +
  ' ( zzz )   \n' +
  ' ~Zzz~    ';

const DOG_CODING =
  '   __ /__  \n' +
  '  // 0-0  \\\\\n' +
  ' [ code ]  \n' +
  '  \\___/   ';

const DOG_EATING =
  '   __ /__  \n' +
  '  // OmO  \\\\\n' +
  ' (  >•<  ) \n' +
  '  \\___/   ';

const DOG_PLAYING =
  '   __ /__  \n' +
  '  // ^o^  \\\\\n' +
  ' (  >*<  ) \n' +
  '  \\___/   ';

/**
 * Get pet ASCII art based on species, mood, and sleep state
 * Now with distinct art for Cats and Dogs!
 */
export const getPetAscii = (
  species: PetSpecies,
  mood: MoodState,
  isSleeping: boolean
): string => {
  const isCat = species === PetSpecies.CAT;

  // Sleeping state
  if (isSleeping) {
    return isCat ? CAT_SLEEPING : DOG_SLEEPING;
  }

  // Mood-based art
  switch (mood) {
    case MoodState.HAPPY:
    case MoodState.EXCITED:
      return isCat ? CAT_HAPPY : DOG_HAPPY;
    case MoodState.SAD:
      return isCat ? CAT_SAD : DOG_SAD;
    case MoodState.SICK:
      return isCat ? CAT_SICK : DOG_SICK;
    case MoodState.ANGRY:
      return isCat ? CAT_SAD : DOG_SAD;
    case MoodState.SLEEPY:
      return isCat ? CAT_SLEEPY : DOG_SLEEPY;
    default:
      return isCat ? CAT_HAPPY : DOG_HAPPY;
  }
};

/**
 * Get action-specific ASCII art
 */
export const getActionAscii = (action: string, species: PetSpecies): string => {
  const isCat = species === PetSpecies.CAT;

  switch (action) {
    case 'eat':
      return isCat ? CAT_EATING : DOG_EATING;
    case 'play':
      return isCat ? CAT_PLAYING : DOG_PLAYING;
    case 'coding':
      return isCat ? CAT_CODING : DOG_CODING;
    default:
      return isCat ? CAT_HAPPY : DOG_HAPPY;
  }
};
