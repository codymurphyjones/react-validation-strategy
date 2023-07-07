import { type ValidationStrategy } from "./methods";
import { type ValidationSource } from "./types";

export class Validation {
  static new<T>(val: T) {
    return new Validator<T>(val);
  }

  static createValidationSlice<T>(
    source: ValidationSource<T>
  ): ValidationSource<T> {
    return source;
  }
}

export class Validator<T = unknown> {
  default: T;
  ValidationQueue: ValidationStrategy<T>[] = [];

  constructor(val: T) {
    this.default = val;
  }

  length(min: number, max?: number): Validator<T> {
    this.ValidationQueue.push({
      method: "length",
      min,
      max,
    });
    return this;
  }

  includes(val: T): Validator<T> {
    this.ValidationQueue.push({
      method: "includes",
      text: val as string
    });
    return this;
  }

  getDefaultValue(): T {
    return this.default;
  }

  getValidationQueue() {
    return this.ValidationQueue;
  }

  match(regex: RegExp): Validator<T> {
    return this;
  }

  custom<K>(func: (val: T, state: K) => boolean): Validator<T> {
    return this;
  }

  /*
        includes(val: T) {
            return this;
        }

        not() {
            return this;
        }

        blocking() {`
            return this;
        }
    */
}

/*
const AccountValidation: ValidationConfig = {
  username: Validator.new("").length(5),
  password: Validator.new("")
    .length(5)
    .match(/%|#|$|@|!|\*|/) 
    confirmPassword: Validator.new('').custom((val, state: DeriveStateFrom<typeof AccountValidation>) => val === state.password),
};
*/
