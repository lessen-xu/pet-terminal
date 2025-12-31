import * as vscode from 'vscode';
import { Database } from './core/database';
import { Pet } from './core/pet';
import { SPECIES_CONFIGS } from './types/species';
import { PetData } from './types/pet';
import { ItemType, getItem } from './types/items';
import { VSCodeGitWatcher } from './monitor/vscode-watcher';
import { PetPanelProvider } from './ui/vscode-dashboard';

let statusBarItem: vscode.StatusBarItem;
let updateInterval: NodeJS.Timeout | undefined;
let gitWatcher: VSCodeGitWatcher | undefined;
let petPanelProvider: PetPanelProvider | undefined;

interface QuickPickItemWithId extends vscode.QuickPickItem {
  itemId: string;
}

/**
 * Update the status bar with current pet status
 */
function updateStatusBar(): void {
  if (!statusBarItem) {
    return;
  }

  const db = new Database();
  const pet: PetData | null = db.getPet();

  if (pet) {
    // Pet exists - show stats
    const emoji = SPECIES_CONFIGS[pet.species]?.emoji || '🐶';
    const health = pet.stats.health;
    const level = pet.level;
    statusBarItem.text = `${emoji} ${pet.name} | HP: ${health}% | Lvl: ${level}`;
    statusBarItem.tooltip = `Click to open Pet Terminal dashboard`;
  } else {
    // No pet - show create prompt
    statusBarItem.text = '$(pencil) Create a Pet';
    statusBarItem.tooltip = 'Click to create a pet (run "pet init" in terminal)';
  }

  statusBarItem.show();

  // Also update the webview panel if it exists
  if (petPanelProvider) {
    petPanelProvider.update();
  }
}

/**
 * Feed command handler
 */
async function feedCommand(): Promise<void> {
  const db = new Database();

  if (!db.hasPet()) {
    vscode.window.showErrorMessage("You don't have a pet yet! Run 'pet init' in terminal.");
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();

  if (data.isSleeping) {
    vscode.window.showWarningMessage(`${data.name} is sleeping! Wake them up first.`);
    return;
  }

  const inventory = pet.getInventory();
  const foodItems = inventory.getItemsByType(ItemType.FOOD);

  if (foodItems.length === 0) {
    vscode.window.showErrorMessage('Inventory is empty! Find items through gameplay.');
    return;
  }

  // Build quick pick items
  const quickPickItems: QuickPickItemWithId[] = [];
  for (const item of foodItems) {
    const itemDef = getItem(item.itemId);
    if (itemDef) {
      quickPickItems.push({
        label: `${itemDef.emoji} ${itemDef.name}`,
        description: `x${item.quantity}`,
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
  const result = pet.useItem((selected as QuickPickItemWithId).itemId);

  if (result.success) {
    const itemDef = getItem((selected as QuickPickItemWithId).itemId);
    vscode.window.showInformationMessage(
      `${data.name} enjoyed the ${itemDef?.name || 'food'}! ${itemDef?.emoji || ''} ` +
      `(XP: +${result.xpGained})`
    );

    if (result.levelUp) {
      vscode.window.showInformationMessage(`🎉 Level ${result.newLevel} reached!`);
    }
  } else {
    vscode.window.showWarningMessage(result.message);
  }

  // Update status bar to reflect changes
  updateStatusBar();
}

/**
 * Play command handler
 */
async function playCommand(): Promise<void> {
  const db = new Database();

  if (!db.hasPet()) {
    vscode.window.showErrorMessage("You don't have a pet yet! Run 'pet init' in terminal.");
    return;
  }

  const pet = await Pet.loadOrCreate(db);
  const data = pet.getData();

  if (data.isSleeping) {
    vscode.window.showWarningMessage(`${data.name} is sleeping! Wake them up first.`);
    return;
  }

  if (data.stats.energy < 15) {
    vscode.window.showWarningMessage(`${data.name} is too tired to play! Let them rest.`);
    return;
  }

  const inventory = pet.getInventory();
  const toyItems = inventory.getItemsByType(ItemType.TOY);

  if (toyItems.length === 0) {
    vscode.window.showErrorMessage('No toys! Find items through gameplay.');
    return;
  }

  // Build quick pick items
  const quickPickItems: QuickPickItemWithId[] = [];
  for (const item of toyItems) {
    const itemDef = getItem(item.itemId);
    if (itemDef) {
      quickPickItems.push({
        label: `${itemDef.emoji} ${itemDef.name}`,
        description: `x${item.quantity}`,
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
  const result = pet.useItem((selected as QuickPickItemWithId).itemId);

  if (result.success) {
    const itemDef = getItem((selected as QuickPickItemWithId).itemId);
    vscode.window.showInformationMessage(
      `${data.name} had fun with the ${itemDef?.name || 'toy'}! ${itemDef?.emoji || ''} ` +
      `(XP: +${result.xpGained})`
    );

    if (result.levelUp) {
      vscode.window.showInformationMessage(`🎉 Level ${result.newLevel} reached!`);
    }
  } else {
    vscode.window.showWarningMessage(result.message);
  }

  // Update status bar to reflect changes
  updateStatusBar();
}

/**
 * Release command handler
 */
async function releaseCommand(): Promise<void> {
  const db = new Database();

  if (!db.hasPet()) {
    vscode.window.showInformationMessage("You don't have a pet to release.");
    return;
  }

  const pet = db.getPet()!;
  const speciesEmoji = SPECIES_CONFIGS[pet.species]?.emoji || '🐶';

  const result = await vscode.window.showWarningMessage(
    `Are you sure you want to say goodbye to ${pet.name} ${speciesEmoji} forever? This cannot be undone.`,
    { modal: true },
    'Yes, Goodbye'
  );

  if (result === 'Yes, Goodbye') {
    db.deletePet();
    vscode.window.showInformationMessage(
      `${pet.name} has returned to the wild... Run "pet init" to create a new pet.`
    );
    // Update UI to reflect deletion
    updateStatusBar();
    if (petPanelProvider) {
      petPanelProvider.update();
    }
  }
}

/**
 * Called when VS Code launches the extension
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Pet Terminal Extension is active!');

  // Create database instance
  const db = new Database();

  // Create and register the webview panel provider
  petPanelProvider = new PetPanelProvider(context.extensionUri, db);
  const panelDisposable = vscode.window.registerWebviewViewProvider(
    'pet-terminal.dashboard',
    petPanelProvider
  );
  context.subscriptions.push(panelDisposable);

  // Create status bar item (aligned to the right)
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100 // Priority
  );
  statusBarItem.command = 'petTerminal.showStatus';

  // Register commands
  const showStatusDisposable = vscode.commands.registerCommand(
    'petTerminal.showStatus',
    () => {
      vscode.window.showInformationMessage('Open the Pet Terminal panel from the activity bar!');
    }
  );

  const feedDisposable = vscode.commands.registerCommand(
    'petTerminal.feed',
    feedCommand
  );

  const playDisposable = vscode.commands.registerCommand(
    'petTerminal.play',
    playCommand
  );

  const releaseDisposable = vscode.commands.registerCommand(
    'petTerminal.release',
    releaseCommand
  );

  context.subscriptions.push(showStatusDisposable, feedDisposable, playDisposable, releaseDisposable);

  // Start Git watcher for native VS Code Git integration
  gitWatcher = new VSCodeGitWatcher(updateStatusBar);
  gitWatcher.start();

  // Initial update
  updateStatusBar();

  // Poll for changes every 3 seconds (in case user uses CLI)
  updateInterval = setInterval(() => {
    updateStatusBar();
  }, 3000);
}

/**
 * Called when VS Code shuts down the extension
 */
export function deactivate(): void {
  console.log('Pet Terminal Extension is deactivating...');

  // Clean up interval to avoid memory leaks
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = undefined;
  }

  // Dispose Git watcher
  if (gitWatcher) {
    gitWatcher.dispose();
    gitWatcher = undefined;
  }

  // Dispose status bar item
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
