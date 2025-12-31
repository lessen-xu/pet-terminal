# Changelog

All notable changes to Pet Terminal will be documented in this file.

## [1.0.2] - 2025-12-31

### Added - VS Code Extension
- Full VS Code Extension support with Status Bar integration
- Webview Dashboard with Tamagotchi-style visual interface and retro ASCII art
- Native Git monitoring via VS Code API - earn XP by committing code
- Interactive Commands via Command Palette (Feed, Play, Release)
- Real-time status updates every 3 seconds

### Added - New Features
- `pet release` command - say goodbye to your pet forever (CLI and VS Code)
- Modal confirmation dialogs for pet release in VS Code

### Changed
- Simplified species from 6 to 2 (Cat and Dog) for improved ASCII art quality
- Each species now has distinct, recognizable ASCII art:
  - Cat: Pointed ears `/\_/\`, whiskers `># #<`
  - Dog: Floppy ears `__ /__`, rounder face
- Updated README to reflect hybrid CLI + VS Code nature
- Updated installation instructions with VS Code `.vsix` support

### Removed
- Rabbit, Hamster, Bird, and Dragon species (art quality improvement)
- dragon_gem item (no longer applicable)

## [1.0.1] - 2025-12-30

### Fixed
- Database path: Changed from `process.cwd()/data/pet.json` to `~/.pet-terminal/pet.json`
- Git availability check logic bug
- Version display now reads from package.json
- XP progress bar display format
- Database path consistency in welcome screen
- Configuration comments to match actual decay rates

### Added
- Unit tests for core functionality (72 tests)
- CI/CD pipeline with GitHub Actions

## [1.0.0] - 2025-12-30

### Added
- Virtual pet system with 6 species: Cat, Dog, Rabbit, Hamster, Bird, Dragon
- Pet stats: Hunger, Happiness, Health, Cleanliness, Energy
- Level system with XP progression
- Mood states: Happy, Neutral, Sad, Critical, Sleeping
- Git commit detection with coin and XP rewards
- Shop system with food, toys, medicine, and cleaning supplies
- Inventory management
- One-click care command (`pet care`)
- Interactive tutorial for new users
- Colorful terminal output with ASCII art
- Config file support at `~/.pet-terminal/config.json`

---

[1.0.2]: https://github.com/lessen-xu/pet-terminal/releases/tag/v1.0.2
[1.0.1]: https://github.com/lessen-xu/pet-terminal/releases/tag/v1.0.1
[1.0.0]: https://github.com/lessen-xu/pet-terminal/releases/tag/v1.0.0
