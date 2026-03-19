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

module.exports = { calculate, sin, cos, sqrt, percentage };
