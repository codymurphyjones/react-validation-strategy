import type { Validator } from ".";

type GeneralStateType = {
  [key: string]: Validator<unknown>;
};

type ValidationMethods = "length" | "includes" | "not" | "blocking" | "custom";
type ValidationMethod<Key> = Extract<ValidationMethods, Key>;


export type ValidationStrategy<T = string, K = GeneralStateType> =
  | LengthValidation
  | IncludesValidation
  | NotValidation
  | BlockingValidation
  | CustomValidation<T, K>;

export type LengthValidation =
  | {
      method: ValidationMethod<"length">;
      min: number;
      max?: number;
    }
  | {
      method: ValidationMethod<"length">;
      min?: number;
      max: number;
};

function logReturn(name: string, val: boolean) {
  console.log(name, val)
  return val;
}

export function isLengthValidation(strategy: ValidationStrategy): strategy is LengthValidation {
        return logReturn('isLengthValidation', strategy.method === "length")
}

export type IncludesValidation = {
  method: ValidationMethod<"includes">; 
  text: string;
};

export function isIncludesValidation(strategy: ValidationStrategy): strategy is IncludesValidation {
  return logReturn('isIncludesValidation', strategy.method === "includes" )
}


export type NotValidation = {
 method: ValidationMethod<"not">;
};

export function isNotValidation(strategy: ValidationStrategy):  strategy is NotValidation {
  return logReturn('isNotValidation', strategy.method === "not" )
}

export type BlockingValidation = {
  method: ValidationMethod<"blocking">;
};

export function isBlockingValidation(strategy: ValidationStrategy):  strategy is BlockingValidation {
  return logReturn('isBlockingValidation', strategy.method === "blocking"  )
}


export type CustomValidation<T = string, K = GeneralStateType> = {
  method: ValidationMethod<"custom">; 
  custom: (val: T, state: K) => boolean;
};

export function isCustomValidation(strategy: ValidationStrategy): strategy is CustomValidation {
  return logReturn('isCustomValidation', "custom" in strategy && strategy.method === "custom"  )
}
