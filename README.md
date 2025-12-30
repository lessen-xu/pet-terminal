# Pet Terminal

> A virtual pet that lives in your terminal - earns rewards when you make Git commits!

[![npm version](https://badge.fury.io/js/pet-terminal.svg)](https://www.npmjs.com/package/pet-terminal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org)
[![GitHub stars](https://img.shields.io/github/stars/lessen-xu/pet-terminal?style=social)](https://github.com/lessen-xu/pet-terminal)

---

<div align="center">

A CLI virtual pet and gamified productivity companion for developers.

[Features](#-features) &bull; [Installation](#-installation) &bull; [Quick Start](#-quick-start) &bull; [Commands](#-commands) &bull; [Philosophy](#-philosophy)

If this project helps you, please give it a  &nbsp; [![GitHub stars](https://img.shields.io/github/stars/lessen-xu/pet-terminal?style=flat&logo=github&label=%E2%AD%90%EF%B8%8F&color=green)](https://github.com/lessen-xu/pet-terminal)

</div>

---

##  Features

-  **Choose your pet**: Cat, Dog, Rabbit, Hamster, Bird, or Dragon with unique ASCII art
-  **Git integration**: Earn coins and XP automatically when you make commits
-  **Smart rewards**: Bug fixes earn more than features - gamified motivation!
-  **Shop system**: Buy food, toys, medicine, and cleaning supplies
-  **Level progression**: Watch your pet grow stronger through care
-  **One-click care**: Busy? Run `pet care` to handle everything at once
-  **Lenient decay**: Stats decay slowly - your pet stays healthy for days!
-  **Streak bonuses**: Maintain daily commit streaks for extra rewards

##  Installation

```bash
npm install -g pet-terminal
```

Or use with npx without installing:

```bash
npx pet-terminal init
```

##  Quick Start

```bash
# Create your first pet
pet init

# Check on your pet
pet status

# After coding, collect rewards
pet git

# One-click care for busy developers
pet care

# See all commands
pet --help
```

##  Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `pet init` | - | Create a new pet |
| `pet status` | - | Display your pet's status with ASCII art |
| `pet feed` | - | Feed your pet from inventory |
| `pet play` | - | Play with your pet |
| `pet clean` | - | Clean your pet |
| `pet heal` | - | Heal your pet with medicine |
| `pet sleep` | - | Put pet to sleep / wake up |
| `pet care` | `auto`, `all` | One-click care for all needs |
| `pet inventory` | `inv`, `items` | Show your inventory |
| `pet shop` | `store` | Visit the pet shop |
| `pet git` | `commits` | Check for new Git commits & earn rewards |
| `pet sync` | - | Sync time after being away |
| `pet tutorial` | `help`, `guide` | Show the interactive tutorial |

##  Philosophy

> **"Writing code = being with your pet"**

Pet Terminal isn't a chore - it's a companion. Unlike traditional virtual pets that demand attention, your pet gains stats automatically when you do what you already do: write code and commit.

This is a **zero-burden** companion designed to make your coding sessions more enjoyable, not another task on your todo list.

##  How It Works

###  Earning Rewards

Every Git commit earns you coins and XP based on the commit type:

| Commit Type | Prefix Examples | Coins | XP |
|-------------|-----------------|-------|-----|
| Bug Fix | `fix:`, `bug:`, `fix(` | +10 | +20 |
| Feature | `feat:`, `add:`, `feat(` | +8 | +15 |
| Refactor | `refactor:`, `refactor(` | +6 | +12 |
| Normal | any other | +5 | +10 |

###  Stat Bonuses

Every commit also gives automatic stat boosts:
- **Hunger +15**: Your pet feels fed seeing you work
- **Happiness +10**: Your pet is happy you're here

###  Stat Decay

Stats decay slowly over real-time:

| Stat | Decay Rate | Time to Empty (from 100%) |
|------|-----------|--------------------------|
| Hunger | -3/hour | ~33 hours |
| Happiness | -0.67/hour | ~150 hours (~6 days) |
| Cleanliness | -0.125/hour | ~800 hours (~33 days) |
| Energy | -2/hour (awake) | ~50 hours |

**The decay is intentionally lenient** - your pet stays healthy for days without attention!

###  Streak Bonuses

Maintain a daily commit streak for bonus rewards:
- **3+ days**: +2 stat bonus per commit
- **7+ days**: +5 stat bonus per commit, +10 daily coins
- **30+ days**: +5 stat bonus per commit, +50 daily coins

##  Screenshots

### Pet Status

```
╔══════════════════════════════════════════╗
║         SPARKY THE CAT                   ║
╚══════════════════════════════════════════╝

   /\_/\           Status: ⚡ Awake
  ( o.o )
   > ^ <    Mood: 😊 HAPPY - Sparky is feeling wonderful!

──────────────────────────────────────────
Hunger        ███████████████░░░░  80%
Happiness     ████████████████░░░░  85%
Health        ███████████████████░  95%
Cleanliness   ████████████░░░░░░░░  70%
Energy        ██████████████████░░  90%
──────────────────────────────────────────

Level: 5 ████████████████░░░░ 85/100 XP

Coins: 150 🪙   |   Git Streak: 5 days
```

### Git Rewards

```
╔══════════════════════════════════════════╗
║              GIT COMMITS                 ║
╚══════════════════════════════════════════╝

Current Streak: 5 days   |   Total Rewarded: 42 commits

Found 3 new commit(s)!

94b2b6e - feat: add new authentication system
  [Feature] +8 🪙 +15 XP  📦 Large Commit Bonus!

a1b2c3d - fix: resolve memory leak in parser
  [Bug Fix] +10 🪙 +20 XP

d4e5f6g - refactor: simplify database queries
  [Refactor] +6 🪙 +12 XP

──────────────────────────────────────────
Total: +24 🪙  +47 XP  🔥 Streak Bonus! +5 🪙
```

##  Configuration

Optional config file at `~/.pet-terminal/config.json`:

```json
{
  "decayRate": 1.0,
  "autoCare": {
    "enabled": false,
    "thresholds": {
      "hunger": 70,
      "happiness": 60,
      "cleanliness": 60,
      "health": 70
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `decayRate` | number | 1.0 | Global decay multiplier (0.5-2.0) |
| `autoCare.enabled` | boolean | false | Enable auto-purchase alerts |
| `autoCare.thresholds` | object | - | Stat thresholds for care reminders |

##  Pet Species

| Species | Description | Special Trait |
|---------|-------------|---------------|
| 🐱 Cat | Independent and graceful | Higher happiness cap |
| 🐕 Dog | Loyal and energetic | Faster energy recovery |
| 🐰 Rabbit | Gentle and affectionate | Extra XP from care |
| 🐹 Hamster | Small and active | Bonus coins from play |
| 🐦 Bird | Cheerful and smart | Stat bonuses from commits |
| 🐉 Dragon | Rare and powerful | All stats boosted |

##  Tips & Tricks

- **Forgot about your pet?** Run `pet sync` to catch up on time passed
- **Low on supplies?** Use `pet care` to see what you need
- **Want quick coins?** Make some commits and run `pet git`
- **Pet sleeping?** Let them sleep to restore energy
- **Stats low?** Use `pet care` for one-click care of all needs

##  Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please check [CHANGELOG.md](CHANGELOG.md) for version history and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines.

##  License

MIT License - see [LICENSE](LICENSE) file for details

##  Credits

Built with:
- [Commander.js](https://www.npmjs.com/package/commander) - CLI framework
- [Chalk](https://www.npmjs.com/package/chalk) - Terminal styling
- [Inquirer](https://www.npmjs.com/package/inquirer) - Interactive prompts
- [lowdb](https://www.npmjs.com/package/lowdb) - JSON database

---

<div align="center">

Made with 💜 for developers who love their terminal pets

If you enjoy Pet Terminal, please give it a  &nbsp; [![GitHub stars](https://img.shields.io/github/stars/lessen-xu/pet-terminal?style=flat&logo=github&label=%E2%AD%90%EF%B8%8F&color=green)](https://github.com/lessen-xu/pet-terminal/stargazers)

[GitHub](https://github.com/lessen-xu/pet-terminal) &bull; [npm](https://www.npmjs.com/package/pet-terminal)

</div>
