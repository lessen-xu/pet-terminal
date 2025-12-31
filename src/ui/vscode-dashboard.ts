import * as vscode from 'vscode';
import { Database } from '../core/database';
import { Pet } from '../core/pet';
import { ItemType, getItem } from '../types/items';
import { getPetAscii } from './ascii-art';

interface QuickPickItemWithId extends vscode.QuickPickItem {
  itemId: string;
}

/**
 * WebviewViewProvider for the Pet Terminal Dashboard
 * Displays pet ASCII art, stats, and interactive buttons in VS Code sidebar
 */
export class PetPanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _db: Database
  ) {}

  /**
   * Called when VS Code resolves the webview view
   */
  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    // Configure webview options
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set the HTML content
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'feed':
          await this.handleFeed();
          break;
        case 'play':
          await this.handlePlay();
          break;
        case 'ready':
          // Webview is ready, send initial data
          this.update();
          break;
      }
    });

    // Load initial pet data
    this.update();
  }

  /**
   * Update the webview with current pet data
   * Call this whenever pet state changes
   */
  public update(): void {
    if (this._view) {
      const pet = this._db.getPet();
      if (pet) {
        const ascii = getPetAscii(pet.species, pet.mood, pet.isSleeping);
        this._view.webview.postMessage({
          type: 'update',
          pet: pet,
          ascii: ascii,
        });
      } else {
        // No pet exists
        this._view.webview.postMessage({
          type: 'update',
          pet: null,
          ascii: '',
        });
      }
    }
  }

  /**
   * Generate the HTML content for the webview
   */
  private _getHtmlForWebview(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pet Terminal</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      padding: 12px;
      margin: 0;
      min-height: 100vh;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .no-pet {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground);
    }

    .no-pet code {
      background: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }

    .pet-header {
      text-align: center;
      margin-bottom: 4px;
    }

    .pet-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: var(--vscode-foreground);
    }

    .pet-info {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }

    .ascii-container {
      background-color: #1e1e1e;
      border: 2px solid #3e3e3e;
      border-radius: 8px;
      padding: 12px;
      margin: 8px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    }

    #pet-art {
      font-family: 'Consolas', 'Courier New', 'Monaco', monospace;
      font-size: 11px;
      line-height: 1.1;
      white-space: pre;
      color: #4ec9b0;
      text-align: center;
      margin: 0;
    }

    .stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 4px 0;
    }

    .stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 13px;
    }

    .stat-label {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 85px;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--vscode-textLink-foreground);
      transition: width 0.3s ease, background-color 0.3s ease;
    }

    .progress-fill.low {
      background: #f14c4c;
    }

    .progress-fill.medium {
      background: #ffab00;
    }

    .progress-fill.high {
      background: #89d185;
    }

    .coins-display {
      text-align: center;
      padding: 8px;
      background: var(--vscode-editor-selectionBackground);
      border-radius: 6px;
      font-size: 14px;
      margin: 4px 0;
    }

    .buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    button {
      flex: 1;
      padding: 10px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background-color 0.2s ease;
    }

    button:hover:not(:disabled) {
      background: var(--vscode-button-hoverBackground);
    }

    button:disabled {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      margin-left: 8px;
    }

    .status-badge.sleeping {
      background: #1e3a5f;
      color: #7aa2f7;
    }

    .status-badge.awake {
      background: #2a4a3a;
      color: #9ece6a;
    }

    .mood-emoji {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container" id="app">
    <div class="no-pet">
      <p>Loading pet...</p>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'update') {
        renderPet(message.pet, message.ascii);
      }
    });

    // Notify extension that webview is ready
    vscode.postMessage({ command: 'ready' });

    function renderPet(pet, ascii) {
      const app = document.getElementById('app');

      if (!pet) {
        app.innerHTML = \`
          <div class="no-pet">
            <p style="font-size: 24px; margin-bottom: 12px;">🐾</p>
            <p><strong>No pet found!</strong></p>
            <p>Run <code>pet init</code> in the terminal to create your first pet.</p>
          </div>
        \`;
        return;
      }

      const moodEmoji = getMoodEmoji(pet.mood);
      const statusClass = pet.isSleeping ? 'sleeping' : 'awake';
      const statusText = pet.isSleeping ? '😴 Sleeping' : '⚡ Awake';

      app.innerHTML = \`
        <div class="pet-header">
          <h2 class="pet-name">
            \${pet.name} \${getSpeciesEmoji(pet.species)}
          </h2>
          <div class="pet-info">
            Level \${pet.level}
            <span class="status-badge \${statusClass}">\${statusText}</span>
          </div>
          <div class="pet-info">
            <span class="mood-emoji">\${moodEmoji}</span>
            \${pet.mood.charAt(0).toUpperCase() + pet.mood.slice(1)}
          </div>
        </div>

        <div class="ascii-container">
          <pre id="pet-art">\${escapeHtml(ascii)}</pre>
        </div>

        <div class="stats">
          \${renderStat('❤️', 'Health', pet.stats.health)}
          \${renderStat('🍖', 'Hunger', pet.stats.hunger)}
          \${renderStat('😊', 'Happy', pet.stats.happiness)}
          \${renderStat('✨', 'Clean', pet.stats.cleanliness)}
          \${renderStat('⚡', 'Energy', pet.stats.energy)}
        </div>

        <div class="coins-display">
          🪙 \${pet.coins} coins
        </div>

        <div class="buttons">
          <button onclick="sendCommand('feed')" \${pet.isSleeping ? 'disabled' : ''}>
            🍎 Feed
          </button>
          <button onclick="sendCommand('play')" \${pet.isSleeping ? 'disabled' : ''}>
            🎾 Play
          </button>
        </div>
      \`;
    }

    function renderStat(emoji, label, value) {
      const barClass = value < 30 ? 'low' : value < 70 ? 'medium' : 'high';
      return \`
        <div class="stat-row">
          <span class="stat-label">\${emoji} \${label}</span>
          <div class="progress-bar">
            <div class="progress-fill \${barClass}" style="width: \${Math.max(0, Math.min(100, value))}%"></div>
          </div>
          <span style="min-width: 32px; text-align: right; font-size: 11px; color: var(--vscode-descriptionForeground);">
            \${Math.round(value)}%
          </span>
        </div>
      \`;
    }

    function sendCommand(cmd) {
      vscode.postMessage({ command: cmd });
    }

    function getSpeciesEmoji(species) {
      const emojis = {
        cat: '🐱',
        dog: '🐕'
      };
      return emojis[species] || '🐶';
    }

    function getMoodEmoji(mood) {
      const emojis = {
        happy: '😊',
        excited: '🤩',
        sad: '😢',
        sick: '🤒',
        angry: '😠',
        sleepy: '😴'
      };
      return emojis[mood] || '😊';
    }

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
  }

  /**
   * Handle feed command from webview
   */
  private async handleFeed(): Promise<void> {
    if (!this._db.hasPet()) {
      vscode.window.showErrorMessage("You don't have a pet yet! Run 'pet init' in terminal.");
      return;
    }

    const pet = await Pet.loadOrCreate(this._db);
    const data = pet.getData();

    if (data.isSleeping) {
      vscode.window.showWarningMessage(`${data.name} is sleeping! Wake them up first.`);
      this.update();
      return;
    }

    const inventory = pet.getInventory();
    const foodItems = inventory.getItemsByType(ItemType.FOOD);

    if (foodItems.length === 0) {
      vscode.window.showErrorMessage('No food in inventory! Buy some from the shop.');
      return;
    }

    // Build quick pick items
    const quickPickItems: QuickPickItemWithId[] = [];
    for (const item of foodItems) {
      const itemDef = getItem(item.itemId);
      if (itemDef) {
        quickPickItems.push({
          label: `\${itemDef.emoji} \${itemDef.name}`,
          description: `x\${item.quantity}`,
          itemId: item.itemId,
        });
      }
    }

    // Show quick pick
    const selected = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder: 'What would you like to feed your pet?',
    });

    if (!selected) {
      return; // User cancelled
    }

    // Use the item
    const result = pet.useItem(selected.itemId);

    if (result.success) {
      const itemDef = getItem(selected.itemId);
      vscode.window.showInformationMessage(
        `${data.name} enjoyed the ${itemDef?.name || 'food'}! ${itemDef?.emoji || ''} (XP: +${result.xpGained})`
      );

      if (result.levelUp) {
        vscode.window.showInformationMessage(`🎉 Level ${result.newLevel} reached!`);
      }
    } else {
      vscode.window.showWarningMessage(result.message);
    }

    // Update webview to reflect changes
    this.update();
  }

  /**
   * Handle play command from webview
   */
  private async handlePlay(): Promise<void> {
    if (!this._db.hasPet()) {
      vscode.window.showErrorMessage("You don't have a pet yet! Run 'pet init' in terminal.");
      return;
    }

    const pet = await Pet.loadOrCreate(this._db);
    const data = pet.getData();

    if (data.isSleeping) {
      vscode.window.showWarningMessage(`${data.name} is sleeping! Wake them up first.`);
      this.update();
      return;
    }

    if (data.stats.energy < 15) {
      vscode.window.showWarningMessage(`${data.name} is too tired to play! Let them rest.`);
      this.update();
      return;
    }

    const inventory = pet.getInventory();
    const toyItems = inventory.getItemsByType(ItemType.TOY);

    if (toyItems.length === 0) {
      vscode.window.showErrorMessage('No toys! Get some from the shop.');
      return;
    }

    // Build quick pick items
    const quickPickItems: QuickPickItemWithId[] = [];
    for (const item of toyItems) {
      const itemDef = getItem(item.itemId);
      if (itemDef) {
        quickPickItems.push({
          label: `\${itemDef.emoji} \${itemDef.name}`,
          description: `x\${item.quantity}`,
          itemId: item.itemId,
        });
      }
    }

    // Show quick pick
    const selected = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder: 'What would you like to play with?',
    });

    if (!selected) {
      return; // User cancelled
    }

    // Use the item
    const result = pet.useItem(selected.itemId);

    if (result.success) {
      const itemDef = getItem(selected.itemId);
      vscode.window.showInformationMessage(
        `${data.name} had fun with the ${itemDef?.name || 'toy'}! ${itemDef?.emoji || ''} (XP: +${result.xpGained})`
      );

      if (result.levelUp) {
        vscode.window.showInformationMessage(`🎉 Level ${result.newLevel} reached!`);
      }
    } else {
      vscode.window.showWarningMessage(result.message);
    }

    // Update webview to reflect changes
    this.update();
  }
}
