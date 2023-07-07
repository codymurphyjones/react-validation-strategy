import type { Validator } from "./validation";
import type { ValidationStrategy } from "./validation/methods";
import type {
  ValidationSource,
  ValidationData,
  ValidationTechnique,
  ValidationUpdate,
  ValidationNode,
} from "./validation/types";
import { validationListToFunctions } from "./ValidationFunctions";


export function ConvertDefaultStateToValidationStructure<T>(
  defaultState: ValidationSource<T>
): [ValidationData<T>, ValidationTechnique<T>] {
  const returnObj: Partial<ValidationData<T>> = {};
  const validationDirectives: Partial<ValidationTechnique<T>> = {};

  for (const key in defaultState) {
    const validationObjects = defaultState[key];
    if (!validationObjects) continue;

    const keyOfT = key as keyof ValidationSource<T>;
    type U = ValidationSource<T>[typeof keyOfT] extends Validator<infer T> ? T : never;

    const value = validationObjects.getDefaultValue() as U;
    const validationStrategyQueue =
      validationObjects.getValidationQueue() as ValidationStrategy<U>[];
    const functionList = validationListToFunctions<U>(validationStrategyQueue);

    returnObj[keyOfT] = {
      value,
      valid: false,
    } as ValidationData<T>[typeof keyOfT];

    validationDirectives[keyOfT] = functionList;
  }

  return [
    returnObj as ValidationData<T>,
    validationDirectives as ValidationTechnique<T>,
  ];
}


export function makeReducer<T>(
  validationStructure: [ValidationData<T>, ValidationTechnique<T>]
) {
  const [validationData, validationSequences] = validationStructure;
  console.log(validationData);

  return function reducer(
    state: ValidationData<T>,
    action: Partial<ValidationUpdate<T>>
  ): ValidationData<T> {
    const returnObj = {...state}; // Start with current state

    for (const key in action) {
      console.log('action', action)
      if (Object.prototype.hasOwnProperty.call(action, key)) {
        const keyOfT = key as keyof T;
        const value = action[keyOfT];
        if (value !== undefined) {
          console.log('value', value)
          let isValid = false;
          const validationSequence = validationSequences[keyOfT];

          validationSequence.forEach((validate) => {
            if (typeof validate === "function") {
              const res = validate(value);
              console.log('res', res)
              if(res) {
                isValid = true;
                console.log('valid', 'true')
              }
            } else {
              console.log('valid', 'false')
            }
          });

          const keyResult: ValidationNode<typeof value> = {
            value: value,
            valid: isValid,
          };

          returnObj[keyOfT] = keyResult as ValidationData<T>[typeof keyOfT];
        }
      }
    }
    return returnObj;
  };
}