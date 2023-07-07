import { isNumeric } from "./numbers";
import {
  type LengthValidation,
  type ValidationStrategy,
  isLengthValidation,
  isIncludesValidation,
  type IncludesValidation,
} from "./validation/methods";

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
      console.log("we made it here");
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const result = prepareForValidation(val, (inputData) => {
        validationStrategy = validationStrategy as LengthValidation;

        console.log('validation', validationStrategy)
        console.log('input', inputData)
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
      return result;
    }
    return false;
  };
}

function performsIncludeValidation<T>(validationStrategy: ValidationStrategy) {
  return (val: T) => {
    console.log('its me the includes validation call')
    if (isIncludesValidation(validationStrategy)) {
      console.log('includesStrategy', validationStrategy);
      //happy path Number, Array, Object, String
      //convert to array based data set (string, arrays, or keys)
      const result = prepareForValidation(val, (inputData) => {
         try {
          validationStrategy = validationStrategy as IncludesValidation;
          if (typeof inputData === "string") {
            return inputData.includes(validationStrategy.text ?? "");
          }
        } catch (e) {
          console.log(e);
        }

        return false;
      });
      return result;
    }
    console.log('invalidInclude')
    return false;
  };
}

export function validationListToFunctions<U>(
  validationList: ValidationStrategy<U>[]
): ((val: U) => boolean)[] {
  return validationList.map((validationStrategy) => {
    console.log('validationStrategy', validationStrategy)
    switch (validationStrategy.method) {
      case "length":
        return performLengthValidation<U>(validationStrategy);
      case "includes":
        return performsIncludeValidation<U>(validationStrategy);
      /*case 'not':
                return (val) => {
                    return !val.includes(ValidationStrategy.text);
                }*/
      case "blocking":
        return () => {
          return false;
        };
      default:
        return () => {
          return true;
        };
    }
  });
}
