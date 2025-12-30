# Contributing to Pet Terminal

First off, thank you for considering contributing to Pet Terminal! It's people like you that make Pet Terminal such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:
- A clear title and description
- Specific use cases
- Possible implementation ideas (if you have them)

### Pull Requests

Pull requests are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (follow [commit message conventions](#commit-message-conventions))
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Installation

```bash
# Clone your fork
git clone https://github.com/your-username/pet-terminal.git
cd pet-terminal

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Running Commands

```bash
# Run in development mode
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Project Structure

```
pet-terminal/
├── src/
│   ├── commands/       # CLI commands (init, feed, play, etc.)
│   ├── core/           # Core logic (pet, inventory, shop, database)
│   ├── monitor/        # Git monitoring and activity tracking
│   ├── types/          # TypeScript type definitions
│   ├── ui/             # Display and UI components
│   └── index.ts        # Entry point
├── data/               # Local data storage (gitignored)
└── dist/               # Compiled JavaScript output
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type when possible
- Use interfaces for object shapes
- Add JSDoc comments for exported functions

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use const by default, let when reassignment is needed
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)

### Error Handling

```typescript
// Always handle errors gracefully
try {
  // operation
} catch (error) {
  console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
  process.exit(1);
}
```

### User Experience

- Always provide clear feedback to users
- Use chalk for colored terminal output
- Include helpful error messages with suggested actions
- Test edge cases (no pet found, low stats, etc.)

## Commit Message Conventions

We use semantic commit messages to make changelog generation easier:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(commands): add new pet grooming command

fix: resolve issue with pet stats not saving correctly

docs: update README with new installation instructions

refactor(core): simplify inventory management logic
```

## Submitting Changes

### Before Submitting

- [ ] Run `npm run lint` and fix any issues
- [ ] Run `npm run build` to ensure compilation works
- [ ] Test your changes manually
- [ ] Update documentation if needed

### Pull Request Checklist

- [ ] PR title follows semantic commit conventions
- [ ] PR description clearly describes changes
- [ ] Code follows project guidelines
- [ ] No new linting warnings
- [ ] All changes are tested

## Getting Help

If you need help:

- Open a GitHub issue with the `question` label
- Check existing documentation in the README
- Run `pet tutorial` for a guide to using the CLI

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
