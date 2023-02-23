export default class SameEmailError extends Error {
  constructor() {
    super('E-mail address already registered.');
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, SameEmailError.prototype);
  }
}