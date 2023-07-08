import { useReducer } from "react";
import { Validation, Validator } from "./validation";
import { ConvertDefaultStateToValidationStructure, makeReducer } from "./state";
import type {
  InferValidatorType,
  ValidationData,
  ValidationSource,
  ValidationUpdate,
} from "./validation/types";
import React from "react";

export function onChange(update: (val: string) => void) {
  return (event: React.ChangeEvent<HTMLInputElement>) =>
    update(event.currentTarget.value);
}

export function onBlur(update: (val: string) => void) {
  return (event: React.ChangeEvent<HTMLInputElement>) =>
    update(event.currentTarget.value);
}

type ValidationOutput<T, K extends keyof ValidationSource<T>> = {
  onChange: ReturnType<typeof onChange>;
  onBlur: ReturnType<typeof onBlur>;
  value: ValidationSource<T>[K] extends Validator<infer U> ? U : never;
  name: K;
  style?: React.CSSProperties;
  ref?: React.RefObject<HTMLInputElement>;
};

function checkStrictValidation(val: unknown) {
  if (typeof val === "string") {
    return val.length === 0;
  } else if (typeof val === "number") {
    return val === 0;
  } else if (Array.isArray(val)) {
    return val.length === 0;
  }
  return false;
}

export function useValidation<T>(defaultFormState: ValidationSource<T>): [
  <K extends keyof ValidationSource<T>>(
    key: K,
    base?: React.CSSProperties,
    invalid?: React.CSSProperties
  ) => ValidationOutput<T, K>,
  <K extends keyof ValidationSource<T>>(key: K, strict?: boolean) => boolean,
  {
    watch: <K extends keyof ValidationSource<T>>(
      key: K
    ) => InferValidatorType<ValidationSource<T>[K]>;
    update: <K extends keyof ValidationSource<T>>(
      key: K,
      val: InferValidatorType<ValidationSource<T>[K]>
    ) => void;
    focus: <K extends keyof ValidationSource<T>>(key: K) => void;
  }
] {
  const validationStructure =
    ConvertDefaultStateToValidationStructure(defaultFormState);
  const keysSynced: (keyof ValidationSource<T>)[] = [];

  const [state, dispatch] = useReducer(
    makeReducer(validationStructure),
    validationStructure[0]
  ) as [ValidationData<T>, React.Dispatch<Partial<ValidationUpdate<T>>>];

  const refCollection: {
    [K in keyof ValidationSource<T>]: React.RefObject<HTMLInputElement>;
  } = {} as any;

  function update<K extends keyof ValidationSource<T>>(
    key: K,
    val: InferValidatorType<ValidationSource<T>[K]>
  ) {
    const action: Partial<ValidationUpdate<T>> = {};
    action[key] = val;
    dispatch(action);
  }


  function watch<K extends keyof ValidationSource<T>>(key: K) {
    const valNode = state[key];
    const val = valNode.value;
    return val as InferValidatorType<ValidationSource<T>[K]>;
}

  function isValid<K extends keyof ValidationSource<T>>(
    key: K,
    strict = false
  ): boolean {
    // if strict is true, just return the state[key].valid.
    if (strict) {
      return state[key].valid;
    } else {
      // if strict is false, check if the value of state[key].value is of zero length.
      const isZeroLength = checkStrictValidation(state[key].value);

      // if so, then return true, else return the value of state[key].valid.
      return isZeroLength ? true : state[key].valid;
    }
  }

  function sync<K extends keyof ValidationSource<T>>(
    key: K,
    base?: React.CSSProperties,
    invalid?: React.CSSProperties
  ): ValidationOutput<T, K> {
    if (!refCollection[key]) {
      refCollection[key] = React.useRef<HTMLInputElement>(null);
    }

    keysSynced.push(key);
    const isStateValid = isValid(key)
    
    return {
      onChange: onChange((val) =>
        update(key, val as InferValidatorType<ValidationSource<T>[K]>)
      ),
      onBlur: onBlur((val) =>
        update(key, val as InferValidatorType<ValidationSource<T>[K]>)
      ),
      name: key,
      value: watch(key),
      ref: refCollection[key],
      style: isStateValid ? base : { ...base, ...invalid },
    };
  }

  function focus<K extends keyof ValidationSource<T>>(key: K): void {
    if (keysSynced.includes(key) && refCollection[key]?.current) {
      refCollection[key]?.current?.focus();
    }
  }

  const actions = {
    watch,
    update,
    focus,
  };
  return [sync, isValid, actions];
}

export { Validation };
