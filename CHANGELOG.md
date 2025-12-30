# Changelog

All notable changes to Pet Terminal will be documented in this file.

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

[1.0.1]: https://github.com/lessen-xu/pet-terminal/releases/tag/v1.0.1
[1.0.0]: https://github.com/lessen-xu/pet-terminal/releases/tag/v1.0.0
