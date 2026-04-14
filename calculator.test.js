const assert = require('assert');
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

console.log('All tests passed.');
