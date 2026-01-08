# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview
This is a CI/CD pipeline project. The repository structure and development workflows should be established as development progresses.

## Common Development Commands

### Git Operations
```bash
# Initialize repository (if not already done)
git init

# Check status
git status

# Add and commit changes
git add .
git commit -m "descriptive commit message"
```

### Development Workflow
Since this is a new project, establish the following as you build:

1. **Package Management**: Determine and document the package manager (npm, yarn, pnpm, pip, cargo, etc.)
2. **Build System**: Document the build process and commands
3. **Testing Framework**: Set up and document how to run tests
4. **Linting**: Configure and document linting setup
5. **Development Server**: Document how to run the development environment

### Testing
```bash
# Run all tests (to be configured)
# npm test
# pytest
# cargo test
```

### Building
```bash
# Build project (to be configured)
# npm run build
# cargo build
# make build
```

### Linting
```bash
# Run linter (to be configured)
# npm run lint
# pylint
# clippy
```

## Code Architecture Guidelines

As this CI/CD pipeline project develops, document:

1. **Core Components**: Main modules and their responsibilities
2. **Data Flow**: How data moves through the system
3. **Configuration**: How the pipeline is configured and managed
4. **Integration Points**: External services and APIs used
5. **Deployment Strategy**: How the pipeline deploys applications

## Repository Structure (To Be Established)
```
src/          # Source code
tests/        # Test files
config/       # Configuration files
docs/         # Documentation
scripts/      # Utility scripts
```

## Environment Setup
Document required environment variables, development tools, and setup instructions as they become relevant to the project.

## Contributing Guidelines
As the project grows, establish:
- Branch naming conventions
- Pull request templates
- Code review processes
- Release procedures