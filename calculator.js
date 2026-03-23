function calculate(operation, num1, num2) {
  if (operation === 'add') {
    return num1 + num2;
  } else if (operation === 'subtract') {
    return num1 - num2;
  } else {
    throw new Error(`Unknown operation: ${operation}`);
  }
}

function sin(radian) {
  return Math.sin(radian);
}

function cos(radian) {
  return Math.cos(radian);
}

function sqrt(num) {
  if (num < 0) {
    throw new Error('Cannot take square root of a negative number');
  }
  return Math.sqrt(num);
}

function percentage(num) {
  return num / 100;
}

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
