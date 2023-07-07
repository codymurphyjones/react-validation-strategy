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
    return this.addToQueue({
      method: "length",
      min,
      max,
    });
  }

  includes(val: T): Validator<T> {
    return this.addToQueue({
      method: "includes",
      text: val as string,
    });
  }

  getDefaultValue(): T {
    return this.default;
  }

  getValidationQueue() {
    return this.ValidationQueue;
  }

  match(regex: RegExp): Validator<T> {
    return this.addToQueue({
      method: "match",
      expression: regex,
    });
  }

  // custom<State extends object >(func: (val: T, state: State) => boolean): Validator<T> {
  //   return this.addToQueue({
  //     method: "custom",
  //     custom: func,
  //   });
  // }

  private addToQueue(validationStrategy: ValidationStrategy<T>) {
    this.ValidationQueue.push(validationStrategy);
    return this;
  }

  private getQueueItem() {
    return this.ValidationQueue[this.ValidationQueue.length - 1];
  }

  not() {
    const queueItem = this.getQueueItem()
    if(!queueItem) throw new Error("Unable to use not() without a validation method");

    queueItem.invert = true;
    return this;
  }

  blocking() {
    const queueItem = this.getQueueItem()
    if(!queueItem) throw new Error("Unable to  use blocking() without a validation method");

    queueItem.blocking = true;
    return this;
  }
}
