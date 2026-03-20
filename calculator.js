/**
 * Performs a basic arithmetic operation on two numbers.
 * @param {string} operation - The operation to perform ('add' or 'subtract').
 * @param {number} num1 - The first operand.
 * @param {number} num2 - The second operand.
 * @returns {number} The result of the operation.
 * @throws {Error} If the operation is not recognized.
 */
function calculate(operation, num1, num2) {
  if (operation === 'add') {
    return num1 + num2;
  } else if (operation === 'subtract') {
    return num1 - num2;
  } else {
    throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Returns the sine of an angle in radians.
 * @param {number} radian - The angle in radians.
 * @returns {number} The sine of the given angle.
 */
function sin(radian) {
  return Math.sin(radian);
}

/**
 * Returns the cosine of an angle in radians.
 * @param {number} radian - The angle in radians.
 * @returns {number} The cosine of the given angle.
 */
function cos(radian) {
  return Math.cos(radian);
}

/**
 * Returns the square root of a non-negative number.
 * @param {number} num - The number to take the square root of.
 * @returns {number} The square root of the given number.
 * @throws {Error} If the number is negative.
 */
function sqrt(num) {
  if (num < 0) {
    throw new Error('Cannot take square root of a negative number');
  }
  return Math.sqrt(num);
}

/**
 * Converts a percentage value to its decimal equivalent.
 * @param {number} num - The percentage value (e.g. 50 for 50%).
 * @returns {number} The decimal equivalent (e.g. 0.5 for 50%).
 */
function percentage(num) {
  return num / 100;
}

module.exports = { calculate, sin, cos, sqrt, percentage };
