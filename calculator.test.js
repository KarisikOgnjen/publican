const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { calculate, sin, cos, sqrt, percentage, invert, double } = require('./calculator');

assert.strictEqual(calculate('add', 2, 3), 5);
assert.strictEqual(calculate('add', -1, 1), 0);
assert.strictEqual(calculate('add', 0, 0), 0);

assert.strictEqual(calculate('subtract', 5, 3), 2);
assert.strictEqual(calculate('subtract', 0, 5), -5);
assert.strictEqual(calculate('subtract', -2, -3), 1);

assert.strictEqual(calculate('multiply', 2, 3), 6);
assert.strictEqual(calculate('multiply', -2, 3), -6);
assert.strictEqual(calculate('multiply', 5, 0), 0);

assert.strictEqual(sin(0), 0);
assert.strictEqual(sin(Math.PI / 2), 1);
assert.ok(Math.abs(sin(Math.PI) - 0) < 1e-10);

assert.strictEqual(cos(0), 1);
assert.ok(Math.abs(cos(Math.PI / 2)) < 1e-10);
assert.ok(Math.abs(cos(Math.PI) - (-1)) < 1e-10);

assert.strictEqual(sqrt(0), 0);
assert.strictEqual(sqrt(4), 2);
assert.strictEqual(sqrt(9), 3);
assert.throws(() => sqrt(-1), /negative/);

assert.strictEqual(percentage(50), 0.5);
assert.strictEqual(percentage(100), 1);
assert.strictEqual(percentage(0), 0);
assert.strictEqual(percentage(200), 2);

assert.strictEqual(invert(5), -5);
assert.strictEqual(invert(-3), 3);
assert.strictEqual(invert(0), 0);
assert.strictEqual(invert(-0), 0);
assert.strictEqual(invert(1.5), -1.5);
assert.strictEqual(invert(-1.5), 1.5);

assert.strictEqual(double(0), 0);
assert.strictEqual(double(5), 10);
assert.strictEqual(double(-3), -6);
assert.strictEqual(double(1.5), 3);

// --- CSS Blue Color Tests ---
// Verifies that the "change to blue" task has been applied: all button color
// variables must contain blue hex colors, and no undefined --color-green-*
// variable references should remain.

function isBlueColor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return b > r && b > g;
}

function extractCSSVar(cssContent, varName) {
  const regex = new RegExp(`${varName}\\s*:\\s*(#[0-9a-fA-F]{6})`);
  const match = cssContent.match(regex);
  return match ? match[1] : null;
}

const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

const blue1 = extractCSSVar(css, '--color-blue-1');
assert.ok(blue1 !== null, '--color-blue-1 must be defined in styles.css');
assert.ok(isBlueColor(blue1), `--color-blue-1 must be a blue color (blue > red and green), got ${blue1}`);

const blue2 = extractCSSVar(css, '--color-blue-2');
assert.ok(blue2 !== null, '--color-blue-2 must be defined in styles.css');
assert.ok(isBlueColor(blue2), `--color-blue-2 must be a blue color (blue > red and green), got ${blue2}`);

const blue3 = extractCSSVar(css, '--color-blue-3');
assert.ok(blue3 !== null, '--color-blue-3 must be defined in styles.css');
assert.ok(isBlueColor(blue3), `--color-blue-3 must be a blue color (blue > red and green), got ${blue3}`);

const colorBtn = extractCSSVar(css, '--color-btn');
assert.ok(colorBtn !== null, '--color-btn must be defined in styles.css');
assert.ok(isBlueColor(colorBtn), `--color-btn must be a blue color (blue > red and green), got ${colorBtn}`);

// All button color classes must reference defined blue variables, not undefined green ones
assert.ok(
  !css.includes('var(--color-green-'),
  'CSS must not reference undefined --color-green-* variables; update class rules to use --color-blue-* variables'
);

console.log('All tests passed.');
