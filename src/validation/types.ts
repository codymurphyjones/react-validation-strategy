import { type Validator } from "./";
import { ValidationStrategy } from "./methods";

export type ValidationNode<T> = {
  value: T;
  valid: boolean;
};

export type ValidationSource<Root> = { [K in keyof Root]: Validator<Root[K]> }

export type ValidationUpdate<Root> = {
  [P in keyof ValidationSource<Root>]: ValidationSource<Root>[P] extends Validator<infer T> ? T : never;
};

export type ValidationData<Root> = {
  [P in keyof ValidationSource<Root>]: ValidationSource<Root>[P] extends Validator<infer T> ? ValidationNode<T> : never;
};

export type InferValidatorType<V> = V extends Validator<infer T> ? T : never;

export type ValidationTechnique<Root> = {
  [P in keyof ValidationSource<Root>]: ((val: ValidationSource<Root>[P] extends Validator<infer T> ? T : never) => boolean)[];
};

export type ValidationStrategies<Root> = {
  [P in keyof ValidationSource<Root>]: ValidationStrategy<ValidationSource<Root>[P] extends Validator<infer T> ? T : never>[];
};