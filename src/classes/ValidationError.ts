// Inheritance
export default class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Frescura do TS, preciso fazer isso para poder utilizar o instanceof no Controller.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}