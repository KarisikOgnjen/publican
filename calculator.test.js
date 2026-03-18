const assert = require('assert');
const { calculate } = require('./calculator');

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

console.log('All tests passed.');
