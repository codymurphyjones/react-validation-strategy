import type { Validator } from ".";

type GeneralStateType = {
  [key: string]: Validator<unknown>;
};

type ValidationMethods = "length" | "includes" | "match" | "custom";
type ValidationMethod<Key> = Extract<ValidationMethods, Key>;


export type ValidationStrategy<T = string, K = GeneralStateType> =
  | LengthValidation
  | IncludesValidation
  | MatchValidation
  | CustomValidation<T, K>;

export type LengthValidation =
  | {
      method: ValidationMethod<"length">;
      min: number;
      max?: number;
      blocking?: boolean;
      invert?: boolean;
    }
  | {
      method: ValidationMethod<"length">;
      min?: number;
      max: number;
      blocking?: boolean;
      invert?: boolean;
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
  blocking?: boolean;
  invert?: boolean;
};

export function isIncludesValidation(strategy: ValidationStrategy): strategy is IncludesValidation {
  return logReturn('isIncludesValidation', strategy.method === "includes" )
}


export type CustomValidation<T = string, K = GeneralStateType> = {
  method: ValidationMethod<"custom">; 
  custom: (val: T, state: K) => boolean;
  blocking?: boolean;
  invert?: boolean;
};

export function isCustomValidation(strategy: ValidationStrategy): strategy is CustomValidation {
  return logReturn('isCustomValidation', "custom" in strategy && strategy.method === "custom"  )
}

export type MatchValidation = {
  method: ValidationMethod<"match">; 
  expression: RegExp;
  blocking?: boolean;
  invert?: boolean;
};

export function isMatchValidation(strategy: ValidationStrategy): strategy is MatchValidation {
  return logReturn('isMatchValidation', "expression" in strategy && strategy.method === "match"  )
}

