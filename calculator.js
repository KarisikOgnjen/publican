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

function tan(radian) {
  return Math.tan(radian);
}

function log(num) {
  if (num <= 0) throw new Error('log requires a positive number');
  return Math.log10(num);
}

function naturalLog(num) {
  if (num <= 0) throw new Error('ln requires a positive number');
  return Math.log(num);
}

function exp(num) {
  return Math.exp(num);
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

function double(num) {
  return num * 2;
}

module.exports = { calculate, sin, cos, tan, log, naturalLog, exp, sqrt, percentage, invert, double };
