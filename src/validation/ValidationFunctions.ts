import { isNumeric } from "../numbers";
import {
  type ValidationStrategy,
  isLengthValidation,
  isIncludesValidation,
  isMatchValidation,
  isCustomValidation,
} from "./methods";

function prepareForValidation<T = unknown>(
  val: T,
  processValidation?: (inputData: string | string[] | unknown[]) => boolean
): boolean {
  let textToValidate;
  if (typeof val === "object") {
    textToValidate = Object.keys(val as object);
  } else if (Array.isArray(val)) {
    textToValidate = val as unknown[];
  } else if (isNumeric(val)) {
    const valAsNumber = val as number;
    textToValidate = valAsNumber.toString();
  } else if (typeof val === "string") {
    textToValidate = val as string;
  } else {
    textToValidate = [] as string[];
  }

  if (processValidation && textToValidate) {
    return processValidation(textToValidate);
  }
  return false;
}

function performLengthValidation<T>(validationStrategy: ValidationStrategy) {
  return (val: T) => {
    if (isLengthValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const result = prepareForValidation(val, (inputData) => {
        try {
          const len = inputData?.length;

          if (
            validationStrategy?.min != undefined &&
            len < validationStrategy?.min
          ) {
            return false;
          }

          if (
            validationStrategy?.max != undefined &&
            len > validationStrategy?.max
          )
            return false;
        } catch (e) {
          return false;
        }

        return true;
      });
      return invert ? !result : result;
    }
    return false;
  };
}

function performsIncludeValidation<T>(validationStrategy: ValidationStrategy) {
  return (val: T) => {
    if (isIncludesValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const result = prepareForValidation(val, (inputData) => {
        try {
          if (typeof inputData === "string") {
            return inputData.includes(validationStrategy.text ?? "");
          }
        } catch (e) {}
        return false;
      });
      return invert ? !result : result;
    }
    return false;
  };
}

function performsMatchValidation<T>(validationStrategy: ValidationStrategy) {
  return (val: T) => {
    console.log("validationStrategy", validationStrategy);
    if (isMatchValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const expression = validationStrategy.expression;
      const result = prepareForValidation(val, (inputData) => {
        try {
          if (typeof inputData === "string") {
            console.log("string");
            console.log("inputData", inputData);
            console.log("expression", expression);
            console.log(expression.test(inputData));
            return expression.test(inputData);
          } else if (isNumeric(inputData)) {
            console.log("number");
            return expression.test(inputData.toString());
          }
        } catch (e) {}
        return false;
      });
      console.log("result", result);
      return invert ? !result : result;
    }
    return false;
  };
}

function performsCustomValidation<T>(validationStrategy: ValidationStrategy) {
  return (val: T) => {
    console.log("validationStrategy", validationStrategy);
    if (isCustomValidation(validationStrategy)) {
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const invert = validationStrategy.invert ?? false;
      const customFunc = validationStrategy.custom;
      const result = prepareForValidation(val, (inputData) => {
        try {
          if (typeof inputData === "string") {
           return customFunc(inputData, {});
          } else {
            return false;
          }
          
        } catch (e) {}
        return false;
      });
      console.log("result", result);
      return invert ? !result : result;
    }
    return false;
  };
}

export function validationListToFunctions<U>(
  validationList: ValidationStrategy<U>[]
): ((val: U) => boolean)[] {
  return validationList.map((validationStrategy) => {
    //console.log('validationStrategy', validationStrategy)
    switch (validationStrategy.method) {
      case "length":
        return performLengthValidation<U>(validationStrategy);
      case "includes":
        return performsIncludeValidation<U>(validationStrategy);
      case "match":
        return performsMatchValidation<U>(validationStrategy);
      // case "custom":
      //   return performsCustomValidation<U>(validationStrategy);
      default:
        return () => {
          return false;
        };
    }
  });
}
