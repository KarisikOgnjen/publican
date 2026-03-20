# Coder Memory

## Project Architecture
<!-- Key architectural patterns and file structure -->
- Vanilla HTML/JS frontend (index.html) with embedded script
- Node.js CommonJS modules (calculator.js) for business logic
- No package.json, no build tooling, no npm dependencies
- Tests use Node.js built-in `assert` module

## Coding Conventions
<!-- Language, style, testing framework in use -->
- CommonJS (module.exports / require) for all JS modules
- Plain functions, no classes
- Test runner: custom (test.sh currently shows "No test command detected")

## Key Files
<!-- Important files: entry points, config, shared utilities -->
- `calculator.js` — core math logic (add, subtract, sin, cos, sqrt, percentage)
- `calculator.test.js` — test suite using Node assert
- `index.html` — browser UI with inline JS
- `CalculatorScreen.js` — React functional component for display (created in task)

## Completed Tasks
<!-- Brief log of implemented features -->
- Added sqrt, sin, cos, percentage to calculator.js
- Created CalculatorScreen React component (accepts value, optional error props)
