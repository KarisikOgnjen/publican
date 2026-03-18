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

module.exports = { calculate, sin, cos };
