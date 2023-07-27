type ValidationMethods = "length" | "includes" | "match" | "custom";
type ValidationMethod<Key> = Extract<ValidationMethods, Key>;

export type ValidationStrategy<T = string> =
  | LengthValidation
  | IncludesValidation
  | MatchValidation
  | CustomValidation<T>;

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

export function isLengthValidation<T>(
  strategy: ValidationStrategy<T>
): strategy is LengthValidation {
  return strategy.method === "length";
}

export type IncludesValidation = {
  method: ValidationMethod<"includes">;
  text: string;
  blocking?: boolean;
  invert?: boolean;
};

export function isIncludesValidation<T>(
  strategy: ValidationStrategy<T>
): strategy is IncludesValidation {
  return strategy.method === "includes";
}

export type CustomValidation<T = string> = {
  method: ValidationMethod<"custom">;
  custom: (val: T) => boolean;
  blocking?: boolean;
  invert?: boolean;
};

export function isCustomValidation<T>(
  strategy: ValidationStrategy<T>
): strategy is CustomValidation<T> {
  return "custom" in strategy && strategy.method === "custom";
}

export type MatchValidation = {
  method: ValidationMethod<"match">;
  expression: RegExp;
  blocking?: boolean;
  invert?: boolean;
};

export function isMatchValidation<T>(
  strategy: ValidationStrategy<T>
): strategy is MatchValidation {
  return "expression" in strategy && strategy.method === "match";
}
