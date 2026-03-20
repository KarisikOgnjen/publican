const React = require('react');

function CalculatorScreen({ value, error }) {
  return React.createElement(
    'div',
    { className: 'calculator-screen' },
    React.createElement(
      'div',
      { className: 'display' },
      (error && error.length > 0) ? error : value
    )
  );
}

module.exports = CalculatorScreen;
