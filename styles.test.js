const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

function parseHex(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function getCSSVar(css, varName) {
  const regex = new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{6})`);
  const match = css.match(regex);
  return match ? match[1] : null;
}

// Old green hex values must be removed from color variable definitions
assert.ok(!/#14532d/.test(css), 'Old green color #14532d should be removed');
assert.ok(!/#15803d/.test(css), 'Old green color #15803d should be removed');
assert.ok(!/#16a34a/.test(css), 'Old green color #16a34a should be removed');

// --color-blue-1/2/3 must be defined with actual blue hex values
const blue1 = getCSSVar(css, '--color-blue-1');
const blue2 = getCSSVar(css, '--color-blue-2');
const blue3 = getCSSVar(css, '--color-blue-3');

assert.ok(blue1, '--color-blue-1 must be defined with a hex color value');
assert.ok(blue2, '--color-blue-2 must be defined with a hex color value');
assert.ok(blue3, '--color-blue-3 must be defined with a hex color value');

// Each color variable must have blue as the dominant channel
const b1 = parseHex(blue1);
assert.ok(b1.b > b1.r && b1.b > b1.g,
  `--color-blue-1 (${blue1}) must be a blue color (blue channel must be highest)`);

const b2 = parseHex(blue2);
assert.ok(b2.b > b2.r && b2.b > b2.g,
  `--color-blue-2 (${blue2}) must be a blue color (blue channel must be highest)`);

const b3 = parseHex(blue3);
assert.ok(b3.b > b3.r && b3.b > b3.g,
  `--color-blue-3 (${blue3}) must be a blue color (blue channel must be highest)`);

// Button classes must not reference undefined --color-green-* variables
assert.ok(!css.includes('var(--color-green-1)'),
  'Button classes must not reference undefined --color-green-1');
assert.ok(!css.includes('var(--color-green-2)'),
  'Button classes must not reference undefined --color-green-2');
assert.ok(!css.includes('var(--color-green-3)'),
  'Button classes must not reference undefined --color-green-3');

// Button classes must use the defined blue variables
assert.ok(css.includes('var(--color-blue-1)'),
  '.btn-calculate must use var(--color-blue-1)');
assert.ok(css.includes('var(--color-blue-2)'),
  '.btn-operator/.btn-mode must use var(--color-blue-2)');
assert.ok(css.includes('var(--color-blue-3)'),
  '.btn-basic/.btn-scientific must use var(--color-blue-3)');

console.log('All style tests passed.');
