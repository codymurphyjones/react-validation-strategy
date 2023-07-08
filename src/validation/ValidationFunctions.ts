import { isNumeric } from "../numbers";
import {
  type ValidationStrategy,
  isLengthValidation,
  isIncludesValidation,
  isMatchValidation,
  isCustomValidation,
} from "./methods";

function performLengthValidation<T>(validationStrategy: ValidationStrategy<T>) {
  return (val: T) => {
    if (isLengthValidation(validationStrategy)) {
      let valLength = 0;
      if (typeof val === "object") {
        valLength = Object.keys(val as object).length;
      } else if (Array.isArray(val)) {
        valLength = val.length;
      } else if (isNumeric(val)) {
        const valAsNumber = val as number;
        valLength = valAsNumber.toString().length;
      } else if (typeof val === "string") {
        valLength = val.length;
      }

      const invert = validationStrategy.invert ?? false;
      try {
        if (invert) {
          if (
            validationStrategy?.min != undefined &&
            valLength < validationStrategy?.min
          ) {
            return true;
          }

          if (
            validationStrategy?.max != undefined &&
            valLength > validationStrategy?.max
          ) {
            return true;
          }

          return false;
        } else {
          if (
            validationStrategy?.min != undefined &&
            valLength < validationStrategy?.min
          ) {
            return false;
          }

          if (
            validationStrategy?.max != undefined &&
            valLength > validationStrategy?.max
          )
            return false;
        }
      } catch (e) {
        return false;
      }

      return true;
    }
    return false;
  };
}

function performsIncludeValidation<T>(
  validationStrategy: ValidationStrategy<T>
) {
  return (val: T) => {
    if (isIncludesValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      let valResult = false;
      if (typeof val === "string") {
        valResult = val.includes(validationStrategy.text ?? "");
      } else if (Array.isArray(val)) {
        valResult = val.includes(validationStrategy.text ?? "");
      }
      return invert ? !valResult : valResult;
    }
    return false;
  };
}

function performsMatchValidation<T>(validationStrategy: ValidationStrategy<T>) {
  return (val: T) => {
    if (isMatchValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const expression = validationStrategy.expression;

      let result = false;
      if (isNumeric(val)) {
        const valAsNumber = val as number;
        result = expression.test(valAsNumber.toString());
      } else if (typeof val === "string") {
        result = expression.test(val);
      }
      return invert ? !result : result;
    }
    return false;
  };
}

function performsCustomValidation<T>(
  validationStrategy: ValidationStrategy<T>
) {
  return (val: T) => {
    if (isCustomValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const customFunc = validationStrategy.custom;
      const result = customFunc(val);
      return invert ? !result : result;
    }
    return false;
  };
}

export function validationListToFunctions<U>(
  validationList: ValidationStrategy<U>[]
): ((val: U) => boolean)[] {
  return validationList.map((validationStrategy) => {
    switch (validationStrategy.method) {
      case "length":
        return performLengthValidation<U>(validationStrategy);
      case "includes":
        return performsIncludeValidation<U>(validationStrategy);
      case "match":
        return performsMatchValidation<U>(validationStrategy);
      case "custom":
        return performsCustomValidation<U>(validationStrategy);
      default:
        return () => {
          return false;
        };
    }
  });
}
