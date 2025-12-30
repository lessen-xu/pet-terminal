# Blog Post Draft

You can publish this on Dev.to, Hashnode, or your personal blog.

---

## Title Ideas:

- "I Built a Virtual Pet for My Terminal (And It Loves Watching Me Code)"
- "Pet Terminal: A CLI Companion for Developers"
- "How I Gamified My Git Workflow with a Virtual Pet"

---

## Content:

# I Built a Virtual Pet for My Terminal (And It Loves Watching Me Code)

As developers, we spend countless hours in our terminals. What if that terminal could be a little more... alive?

I'd like to introduce **Pet Terminal** - a virtual pet that lives in your command line and grows happier when you write code.

## The Concept

Pet Terminal is a CLI tool that adds a virtual pet companion to your development workflow. Your pet lives in your project directory, and here's the magic: **every time you make a Git commit, your pet earns rewards**.

This isn't just another Tamagotchi clone. I designed it as a "zero-burden" companion - something that enhances your coding experience without adding more tasks to your todo list.

## How It Works

### Installation

```bash
npm install -g pet-terminal
```

### Creating Your Pet

```bash
pet init
```

You'll choose a name and species. There are six options: Cat, Dog, Rabbit, Hamster, Bird, or Dragon. Each has unique ASCII art that changes based on their mood.

### Earning Rewards

This is where the magic happens. When you code and make commits:

```bash
git commit -m "feat: add new authentication system"
pet git
```

Your pet detects the new commits and rewards you based on commit type:

| Commit Type | Example | Coins | XP |
|-------------|---------|-------|-----|
| Bug Fix | `fix: resolve crash` | +10 | +20 |
| Feature | `feat: add login` | +8 | +15 |
| Refactor | `refactor: simplify` | +6 | +12 |
| Normal | anything else | +5 | +10 |

Plus, every commit gives stat bonuses (hunger +15, happiness +10) because your pet is happy you're coding!

### Caring for Your Pet

```bash
pet status        # Check how your pet is doing
pet feed          # Feed your pet from inventory
pet play          # Play with your pet
pet care          # One-click care for all needs
```

## The Philosophy

Most virtual pets are designed as attention-demanding chores. I wanted something different.

**Pet Terminal's key design principle: your pet gains stats when you do what you already do - write code.**

The stat decay is intentionally lenient:
- Hunger takes ~33 hours to empty
- Happiness takes ~6 days
- Cleanliness takes ~33 days

This means you can ignore your pet for days, and they'll still be fine. Run `pet sync` after a vacation, and your pet is happy to see you - no scolding, no punishment.

## Tech Stack

For those curious, here's what powers Pet Terminal:

- **TypeScript** - Type safety and better DX
- **Commander.js** - Elegant CLI framework
- **Chalk** - Beautiful terminal colors
- **Inquirer** - Interactive prompts
- **lowdb** - Simple JSON database

## Features

### 6 Pet Species

Each species has unique ASCII art and characteristics:

- **Cat** - Independent and graceful
- **Dog** - Loyal and energetic
- **Rabbit** - Gentle and affectionate
- **Hamster** - Small and active
- **Bird** - Cheerful and smart
- **Dragon** - Rare and powerful

### Shop & Inventory

Earn coins from commits and spend them in the shop:

- **Food** - Kibble, fancy meal, premium treats
- **Toys** - Ball, feather toy, laser pointer
- **Medicine** - Bandages, medicine, elixir
- **Cleaning** - Soap, shampoo, premium grooming kit

### Level System

Watch your pet grow stronger! Earn XP from commits and care actions to level up.

### Streak Bonuses

Maintain a daily commit streak for bonus rewards:
- 3+ days: +2 stat bonus per commit
- 7+ days: +5 stat bonus, +10 daily coins
- 30+ days: +5 stat bonus, +50 daily coins

## Why I Built This

Like many developers, I struggle with motivation during long coding sessions. I wanted something that would:

1. **Add joy** to my terminal environment
2. **Not feel like work** - no notifications, no demands
3. **Integrate naturally** with my existing workflow
4. **Be optional** - I can ignore it for days without consequences

Pet Terminal hits all these points. Sometimes I forget about it for a week, then run `pet status` and smile when I see my pet's ASCII art and their progress.

## Getting Started

```bash
# Install
npm install -g pet-terminal

# Create your pet
pet init

# Check on them
pet status

# After coding, collect rewards
pet git
```

## Links

- **GitHub**: https://github.com/lessen-xu/pet-terminal
- **npm**: https://www.npmjs.com/package/pet-terminal

MIT licensed. Contributions welcome!

---

*If you try it out, let me know what you think! And if you enjoy it, please give it a star on GitHub -* https://github.com/lessen-xu/pet-terminal
