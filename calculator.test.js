const assert = require('assert');
const { calculate, sin, cos } = require('./calculator');

// Addition
assert.strictEqual(calculate('add', 2, 3), 5);
assert.strictEqual(calculate('add', -1, 1), 0);
assert.strictEqual(calculate('add', 0, 0), 0);

// Subtraction
assert.strictEqual(calculate('subtract', 5, 3), 2);
assert.strictEqual(calculate('subtract', 0, 5), -5);
assert.strictEqual(calculate('subtract', -2, -3), 1);

// Unknown operation
assert.throws(() => calculate('multiply', 2, 3), /Unknown operation/);

// Sin
assert.strictEqual(sin(0), 0);
assert.strictEqual(sin(Math.PI / 2), 1);
assert.ok(Math.abs(sin(Math.PI) - 0) < 1e-10);

// Cos
assert.strictEqual(cos(0), 1);
assert.ok(Math.abs(cos(Math.PI / 2)) < 1e-10);
assert.ok(Math.abs(cos(Math.PI) - (-1)) < 1e-10);

console.log('All tests passed.');
