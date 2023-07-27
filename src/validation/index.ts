import { type ValidationSource } from "./types";
import { Validator } from "./validator";

export { Validator };

export class Validation {
  static new<T>(val: T) {
    return new Validator<T>(val);
  }

  static createValidationSlice<T>(
    source: ValidationSource<T>
  ): ValidationSource<T> {
    return source;
  }

  static createSlice<State extends { [key: string]: unknown }>(
    initialState: State
  ): StateSlice<State> {
    return new StateSlice(initialState);
  }
}

type ValidationState<T> = {
  [K in keyof T]?: Validator<T[K]>;
};

type MergedState<
  T extends unknown[],
  S extends { [key: string]: unknown },
> = T extends [infer S1, ...infer Rest]
  ? S1 extends { [key: string]: unknown }
    ? Rest extends unknown[]
      ? MergedState<Rest, S> & S1
      : never
    : never
  : S;

class StateSlice<State extends { [key: string]: unknown }> {
  state: State;
  validation: ValidationState<State> = {};

  constructor(state: State, validation: ValidationState<State> = {}) {
    this.state = state;
    this.validation = validation;
  }

  mergeStates<T extends { [key: string]: unknown }[]>(
    ...slices: { [K in keyof T]: StateSlice<T[K]> }
  ): StateSlice<MergedState<T, State>> {
    const newState: MergedState<T, State> = { ...this.state } as MergedState<
      T,
      State
    >;
    const newValidation: ValidationState<MergedState<T, State>> = {
      ...this.validation,
    } as ValidationState<MergedState<T, State>>;

    slices.forEach((slice: StateSlice<any>) => {
      Object.assign(newState, slice.state);
      Object.assign(newValidation, slice.validation);
    });

    return new StateSlice(newState, newValidation);
  }

  omit<Keys extends keyof State>(
    ...keys: Keys[]
  ): StateSlice<Omit<State, Keys>> {
    const newState = { ...this.state };
    const newValidation = { ...this.validation };
    keys.forEach((key) => {
      delete newState[key];
      delete newValidation[key];
    });
    const newStateSlice = new StateSlice(newState);
    newStateSlice.validation = newValidation;
    return newStateSlice as StateSlice<Omit<State, Keys>>;
  }

  pick<Keys extends keyof State>(
    ...keys: Keys[]
  ): StateSlice<Pick<State, Keys>> {
    const newState = keys.reduce(
      (state, key) => ({ ...state, [key]: this.state[key] }),
      {} as Pick<State, Keys>
    );
    return new StateSlice(newState);
  }

  validate(validationObj: ValidationState<State>) {
    for (const key in validationObj) {
      if (validationObj.hasOwnProperty(key)) {
        this.validation[key] = validationObj[key];
      }
    }
    return this;
  }

  compile(): ValidationSource<State> {
    const compiledState: ValidationSource<State> =
      {} as ValidationSource<State>;

    for (const key in this.state) {
      if (Object.prototype.hasOwnProperty.call(this.state, key)) {
        const keyTyped = key as keyof State;
        if (this.validation[keyTyped]) {
          compiledState[keyTyped] = this.validation[keyTyped] as Validator<
            State[keyof State]
          >;
        } else {
          compiledState[keyTyped] = new Validator(
            this.state[keyTyped]
          ) as Validator<State[keyof State]>;
        }
      }
    }

    return compiledState;
  }
}

// function createStateSlice<Root>(
//   source: StateSlice<Root>
// ): StateConfiguration<Root> {
//   const stateSlice: StateConfiguration<Root> = {
//     defaultState: {
//       default: "",
//       type: "text",
//       placeholder: "",
//       settings: {
//         errorStyle: {},
//       },
//       accessibility: {
//         ariaLabel: "",
//       },
//     },
//     ...source,
//   };

//   return stateSlice;
// }
/*

const userStateSlice = createStateSlice({
  firstName: "",
  lastName: 15,
  email: "",
  password: "",
  confirmPassword: "",
});

const pizzaOrderSlice = createStateSlice({
  base: "",
  toppings: [],
  sauce: 0,
  cheese: "",
  extras: [],
});

const pizzaOrderSliceDefault = createStateSlice({
  defaultState: {
    default: "", // Default value is a string
    type: "text",
    placeholder: "", // Replace with actual placeholder
    settings: {
      errorStyle: {}, // Replace with actual CSS properties
    },
    accessibility: {
      ariaLabel: "", // Replace with actual label
      tabIndex: true, // Replace with actual tab index
    },
  },
  base: "",
  toppings: [] as string[],
  sauce: 0,
  cheese: "",
  extras: [] as string[],
});

const UserSignIn = createStateSlice({
  username: "",
  password: "",
});

const UserPreferences = createStateSlice({
  displayName: "",
  email: "",
});

const UserPreferences2 = createStateSlice({
  firstName: "",
  lastName: "",
  confirmPassword: "",
});

const UserSignUp = UserSignIn.mergeStates(UserPreferences, UserPreferences2);*/

/*

static createDefaultState(): FieldConfigurationDefault<string> {
    return {
      default: "", // Default value is a string
      type: "text",
      placeholder: "", // Replace with actual placeholder
      settings: {
        errorStyle: {}, // Replace with actual CSS properties
      },
      accessibility: {
        ariaLabel: "", // Replace with actual label
        tabIndex: true, // Replace with actual tab index
      },
    };
  }

















type AccessibilityConfiguration = {
  ariaLabel: string; // Accessibility labels
  tabIndex?: boolean | number; // Tab index for better accessibility navigation
};

type FieldConfiguration<T> = {
  default: T;
  type: "text";
  placeholder: string;
  settings: {
    errorStyle: CSSProperties;
  };
  accessibility: AccessibilityConfiguration;
};

type StateConfiguration<Root> = {
  [K in keyof Root]: FieldConfiguration<Root[K]> | Root[K];
} & { defaultState?: FieldConfiguration<any> };

type FieldConfigurationDefault<T> = Omit<FieldConfiguration<T>, "tabIndex"> & {
  accessibility: {
    ariaLabel: string; // Accessibility labels
    tabIndex?: boolean; // Tab index for better accessibility navigation
  };
};

  */
