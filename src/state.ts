import type { ValidationStrategy } from "./validation/methods";
import type {
  ValidationSource,
  ValidationData,
  ValidationTechnique,
  ValidationUpdate,
  ValidationNode,
  ValidationStrategies,
} from "./validation/types";
import { validationListToFunctions } from "./validation/ValidationFunctions";

export function ConvertDefaultStateToValidationStructure<T>(
  defaultState: ValidationSource<T>
): [ValidationData<T>, ValidationTechnique<T>, ValidationStrategies<T>] {
  const returnObj: Partial<ValidationData<T>> = {};
  const validationDirectives: Partial<ValidationTechnique<T>> = {};
  const validationStrategies: Partial<ValidationStrategies<T>> = {};

  for (const key in defaultState) {
    const validationObjects = defaultState[key];
    if (!validationObjects) continue;

    const keyOfT = key as keyof ValidationSource<T>;
    //type U = ValidationSource<T>[typeof keyOfT] extends Validator<infer T> ? T : never;
    type U = T[typeof keyOfT];
    const value = validationObjects.getDefaultValue() as U;
    const validationStrategyQueue =
      validationObjects.getValidationQueue() as ValidationStrategy<U>[];
    const functionList = validationListToFunctions<U>(validationStrategyQueue);

    returnObj[keyOfT] = {
      value,
      valid: false,
    } as ValidationData<T>[typeof keyOfT];

    validationStrategies[keyOfT] =
      validationStrategyQueue as ValidationStrategies<T>[typeof keyOfT];

    validationDirectives[keyOfT] =
      functionList as ValidationTechnique<T>[typeof keyOfT];
  }

  return [
    returnObj as ValidationData<T>,
    validationDirectives as ValidationTechnique<T>,
    validationStrategies as ValidationStrategies<T>,
  ];
}

export function makeReducer<T>(
  validationStructure: [
    ValidationData<T>,
    ValidationTechnique<T>,
    ValidationStrategies<T>
  ]
) {
  const [, validationSequences, validationStrategies] = validationStructure;

  return function reducer(
    state: ValidationData<T>,
    action: Partial<ValidationUpdate<T>>
  ): ValidationData<T> {
    const returnObj = { ...state }; // Start with current state

    for (const key in action) {
      if (Object.prototype.hasOwnProperty.call(action, key)) {
        const keyOfT = key as keyof T;
        const value = action[keyOfT];
        const validationStrategy = validationStrategies[keyOfT];
        if (value !== undefined) {
          let isValid = true;
          const validationSequence = validationSequences[keyOfT];
          let shouldUpdate = true;
          validationSequence.forEach((validate, index) => {
            const blocking = validationStrategy[index]?.blocking ?? false;
            if (typeof validate === "function") {
              const res = validate(value);
              if (!res) {
                isValid = false;
                if (blocking) {
                  shouldUpdate = false;
                }
              }
            }
          });

          if (shouldUpdate) {
            const keyResult: ValidationNode<typeof value> = {
              value: value,
              valid: isValid,
            };

            returnObj[keyOfT] = keyResult as ValidationData<T>[typeof keyOfT];
          }
        }
      }
    }
    return returnObj;
  };
}
