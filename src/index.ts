import { useReducer } from "react";
import { Validation } from "./validation";
import { ConvertDefaultStateToValidationStructure, makeReducer } from "./state";
import type {
  InferValidatorType,
  ValidationData,
  ValidationSource,
  ValidationUpdate,
} from "./validation/types";

export function eventChange(update: (val: string) => void) {
  return (event: React.ChangeEvent<HTMLInputElement>) =>
    update(event.currentTarget.value);
}

export function useValidation<T>(
  defaultFormState: ValidationSource<T>
): [
  <K extends keyof ValidationSource<T>>(
    key: K
  ) => InferValidatorType<ValidationSource<T>[K]>,
  <K extends keyof ValidationSource<T>>(
    key: K,
    val: InferValidatorType<ValidationSource<T>[K]>
  ) => void,
  <K extends keyof ValidationSource<T>>(key: K) => boolean
] {
  const validationStructure =
    ConvertDefaultStateToValidationStructure(defaultFormState);

  const [state, dispatch] = useReducer(
    makeReducer(validationStructure),
    validationStructure[0]
  ) as [ValidationData<T>, React.Dispatch<Partial<ValidationUpdate<T>>>];

  function update<K extends keyof ValidationSource<T>>(
    key: K,
    val: InferValidatorType<ValidationSource<T>[K]>
  ) {
    const action: Partial<ValidationUpdate<T>> = {}
    action[key] = val;
    dispatch(action);
  }

  function getProperty<K extends keyof ValidationSource<T>>(
    key: K
  ): InferValidatorType<ValidationSource<T>[K]> {
    return state[key].value as InferValidatorType<ValidationSource<T>[K]>;
  }

  function isPropertyValid<K extends keyof ValidationSource<T>>(
    key: K
  ): boolean {
    return state[key].valid;
  }

  return [getProperty, update, isPropertyValid];
}

export { Validation };
