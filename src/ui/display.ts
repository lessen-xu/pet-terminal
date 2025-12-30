import chalk from 'chalk';
import { getStatColor } from '../types/stats';

const getColorFn = (color: string): ((text: string) => string) => {
  switch (color) {
    case 'green':
      return chalk.green;
    case 'yellow':
      return chalk.yellow;
    case 'orange':
      return chalk.hex('#FFA500');
    case 'red':
      return chalk.red;
    default:
      return chalk.white;
  }
};

export const drawProgressBar = (
  label: string,
  value: number,
  width: number = 30,
): string => {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  const color = getStatColor(value);

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  const labelPad = label.padEnd(12);
  const valueStr = value.toString().padStart(3);

  const colorFn = getColorFn(color);
  const coloredBar = colorFn(filledBar) + chalk.gray(emptyBar);

  return `${labelPad}${coloredBar} ${valueStr}%`;
};

export const drawXPBar = (currentXP: number, maxXP: number, width: number = 20): string => {
  const filled = Math.round((currentXP / maxXP) * width);
  const empty = width - filled;

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  const coloredBar = chalk.cyan(filledBar) + chalk.gray(emptyBar);

  return `XP: ${coloredBar} ${currentXP}/${maxXP}`;
};

export const drawHeader = (title: string, width: number = 40): string => {
  const border = '═'.repeat(width - 2);
  const line = chalk.cyan(`╔${border}╗`);
  const empty = ' '.repeat((width - 2 - title.length) / 2);
  const titleLine = chalk.cyan(`║${empty}${chalk.yellow.bold(title)}${empty}║`);
  const bottom = chalk.cyan(`╚${border}╝`);

  return `${line}\n${titleLine}\n${bottom}`;
};

export const drawDivider = (width: number = 40): string => {
  return chalk.gray('─'.repeat(width));
};

export const drawStatChanges = (
  changes: Array<{ stat: string; delta: number }>,
): string[] => {
  const lines: string[] = [];

  for (const change of changes) {
    const sign = change.delta >= 0 ? '+' : '';
    const color = change.delta >= 0 ? 'green' : 'red';
    const statName = change.stat.charAt(0).toUpperCase() + change.stat.slice(1);
    lines.push(
      `  ${statName.padEnd(12)} ${chalk.gray('→')} ${chalk[color](`${sign}${change.delta}`)}`,
    );
  }

  return lines;
};

export const getMoodEmoji = (mood: string): string => {
  const emojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    sick: '🤒',
    angry: '😠',
    sleepy: '😴',
    excited: '🤩',
  };
  return emojis[mood] || '😐';
};

export const getMoodDescription = (mood: string): string => {
  const descriptions: Record<string, string> = {
    happy: 'is feeling wonderful!',
    sad: 'needs some attention.',
    sick: 'needs medicine and rest.',
    angry: 'is not happy right now.',
    sleepy: 'is very tired.',
    excited: 'is full of energy!',
  };
  return descriptions[mood] || 'is doing okay.';
};
