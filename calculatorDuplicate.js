/**
 * Performs addition or subtraction on two numbers.
 * @param {string} operation - The operation to perform ('add' or 'subtract').
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @returns {number} The result of the operation.
 * @throws {Error} If the operation is unknown.
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
 * Returns the sine of a radian value.
 * @param {number} radian - The angle in radians.
 * @returns {number} The sine of the angle.
 */
function sin(radian) {
  return Math.sin(radian);
}

/**
 * Returns the cosine of a radian value.
 * @param {number} radian - The angle in radians.
 * @returns {number} The cosine of the angle.
 */
function cos(radian) {
  return Math.cos(radian);
}

/**
 * Returns the square root of a number.
 * @param {number} num - The number to take the square root of.
 * @returns {number} The square root of the number.
 * @throws {Error} If the number is negative.
 */
function sqrt(num) {
  if (num < 0) {
    throw new Error('Cannot take square root of a negative number');
  }
  return Math.sqrt(num);
}

/**
 * Converts a number to its percentage equivalent.
 * @param {number} num - The number to convert.
 * @returns {number} The number divided by 100.
 */
function percentage(num) {
  return num / 100;
}

/**
 * Inverts the sign of a number.
 * @param {number} num - The number to invert.
 * @returns {number} The negated number, or 0 if num is 0.
 */
function invert(num) {
  if (num === 0) {
    return 0;
  }
  return -num;
}

/**
 * Doubles a number.
 * @param {number} num - The number to double.
 * @returns {number} The number multiplied by 2.
 */
function double(num) {
  return num * 2;
}

module.exports = { calculate, sin, cos, sqrt, percentage, invert, double };
