export class IU {
  constructor({ num1Id, num2Id, operationId, resultId, scientificPanelId }) {
    this._num1El = document.getElementById(num1Id);
    this._num2El = document.getElementById(num2Id);
    this._operationEl = document.getElementById(operationId);
    this._resultEl = document.getElementById(resultId);
    this._scientificPanelId = scientificPanelId;
  }

  init(containerEl) {
    containerEl.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      if (action) this._dispatch(action);
    });
  }

  _getNum1() {
    return parseFloat(this._num1El.value);
  }

  _getNum2() {
    return parseFloat(this._num2El.value);
  }

  _getOperation() {
    return this._operationEl.value;
  }

  _display(result) {
    this._resultEl.textContent = 'Result: ' + result;
  }

  _displayError(message) {
    this._resultEl.textContent = 'Error: ' + message;
  }

  _dispatch(action) {
    switch (action) {
      case 'calculate':    this.runCalculate(); break;
      case 'percentage':   this.runPercentage(); break;
      case 'sqrt':         this.runSqrt(); break;
      case 'sin':          this.runSin(); break;
      case 'cos':          this.runCos(); break;
      case 'tan':          this.runTan(); break;
      case 'log':          this.runLog(); break;
      case 'ln':           this.runLn(); break;
      case 'exp':          this.runExp(); break;
      case 'toggleScientific': this.toggleScientific(); break;
    }
  }

  runCalculate() {
    const num1 = this._getNum1();
    const num2 = this._getNum2();
    const operation = this._getOperation();
    if (operation === 'add') {
      this._display(num1 + num2);
    } else if (operation === 'subtract') {
      this._display(num1 - num2);
    }
  }

  runPercentage() {
    this._display(this._getNum1() / 100);
  }

  runSqrt() {
    const num = this._getNum1();
    if (num < 0) {
      this._displayError('Cannot take square root of a negative number');
      return;
    }
    this._display(Math.sqrt(num));
  }

  runSin() {
    this._display(Math.sin(this._getNum1()));
  }

  runCos() {
    this._display(Math.cos(this._getNum1()));
  }

  runTan() {
    this._display(Math.tan(this._getNum1()));
  }

  runLog() {
    const num = this._getNum1();
    if (num <= 0) {
      this._displayError('log requires a positive number');
      return;
    }
    this._display(Math.log10(num));
  }

  runLn() {
    const num = this._getNum1();
    if (num <= 0) {
      this._displayError('ln requires a positive number');
      return;
    }
    this._display(Math.log(num));
  }

  runExp() {
    this._display(Math.exp(this._getNum1()));
  }

  toggleScientific() {
    document.getElementById(this._scientificPanelId).classList.toggle('visible');
  }
}
