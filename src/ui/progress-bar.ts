import chalk from 'chalk';

const getChalkColor = (color: string): ((text: string) => string) => {
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

export class ProgressBar {
  private width: number;

  constructor(width: number = 20) {
    this.width = width;
  }

  render(value: number, max: number = 100): string {
    const percentage = Math.min(100, (value / max) * 100);
    const filled = Math.round((percentage / 100) * this.width);
    const empty = this.width - filled;

    const filledChar = '█';
    const emptyChar = '░';

    const color = this.getColor(percentage);
    const colorFn = getChalkColor(color);

    return colorFn(filledChar.repeat(filled)) + chalk.gray(emptyChar.repeat(empty));
  }

  private getColor(percentage: number): string {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 30) return 'orange';
    return 'red';
  }

  renderWithLabel(label: string, value: number, max: number = 100): string {
    const bar = this.render(value, max);
    const percentage = Math.round((value / max) * 100);
    const valueStr = percentage.toString().padStart(3);

    return `${label.padEnd(12)} ${bar} ${valueStr}%`;
  }

  renderXP(current: number, max: number): string {
    const bar = this.render(current, max);
    return chalk.cyan(`XP: ${bar} ${current}/${max}`);
  }
}
