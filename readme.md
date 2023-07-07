# React Validation Strategy

**`react-validation-strategy`** is a library that provides a clean, modular, and reusable way to manage state and validation in your React applications. It simplifies form handling, abstracts away validation logic, and promotes separation of concerns, all while providing enhanced type safety with TypeScript.


### Table of Contents  
- [Installation](#installation)
- [Getting Started](#getting-started) 
	- [An Advanced Example](#advanced) 
- [Validation](#validation) 
- [Validator](#validator) 
- [ValidationStrategy](#validationstrategy) 

<a name="installation"></a>

## Installation
You can install **`react-validation-strategy`** using npm:

```bash
npm install react-validation-strategy  
```
Or with yarn:

```bash
yarn add react-validation-strategy  
```

<a name="getting-started"></a>

## Getting Started
First, you need to define your validation slice using the provided `Validation.createValidationSlice` function.

```ts
import { Validation } from "react-validation-strategy";

const UserValidation = Validation.createValidationSlice({
  firstName: Validation.new("").length(2, 20),
  lastName: Validation.new("").length(2, 20),
});  
```

In your component, you can then use the useValidation hook with the defined validation slice:

```ts
import { useValidation } from "react-validation-strategy";

export default function UserComponent() {
  const [getProperty, updateProperties, isPropertyValid] = useValidation(UserValidation);

  return (
    <div>
      <input 
        value={getProperty('firstName')} 
        onChange={(e) => updateProperties('firstName', e.target.value)} 
      />
      <input 
        value={getProperty('lastName')} 
        onChange={(e) => updateProperties('lastName', e.target.value)} 
      />
    </div>
  );
}
```

<a name="advanced"></a>

#### An Advanced Example
Here is a more advanced usage of the library with a form:

```ts
import { useValidation, Validation, eventChange } from "react-validation-strategy";

const emailRegex = /\S+@\S+\.\S+/;

const UserValidation = Validation.createValidationSlice({
  firstName: Validation.new("").length(2, 20).match(/^[A-z]*$/).blocking(),
  lastName: Validation.new("").length(2, 20).match(/^[A-z]*$/).blocking(),
  email: Validation.new("").match(emailRegex),
  password: Validation.new("").length(8).match(/[\@\#\$\%\^\&\*\(\)\_\+\!]/),
  age: Validation.new(0).custom((val) => val < 18).not(),
});

export default function UserForm() {
  const [getProperty, updateProperties, isPropertyValid] = useValidation(UserValidation);

  return (
    <form>
      <input
        value={getProperty("firstName")}
        onChange={eventChange((val) => updateProperties("firstName", val))}
      />
      <input
        value={getProperty("lastName")}
        onChange={eventChange((val) => updateProperties("lastName", val))}
      />
      <input
        value={getProperty("email")}
        onChange={eventChange((val) => updateProperties("email", val))}
      />
      <input
        value={getProperty("password")}
        onChange={eventChange((val) => updateProperties("password", val))}
      />
      <input
        value={getProperty("age")}
        onChange={eventChange((val) => updateProperties("age", val))}
      />
      <button type="submit" disabled={!isPropertyValid("firstName") || !isPropertyValid("lastName") || !isPropertyValid("email") || !isPropertyValid("password") || !isPropertyValid("age")}>
        Submit
      </button>
    </form>
  );
}
```

In the example above, the `custom` validation function is used to ensure that the `age` field is less than 18. We then utilize the `not` modifier to invert the value to make sure we're ensuring our users age is valid.  Now direct your attention to the `firstName` and `lastName` properties, which are closed with a `.blocking` call.  A blocking call will make sure that if the field is not a valid input, it will not update the state.

In this example, we are matching everything that IS A letter and blocking the call if it doesn't match. 

  ```ts  
Validation.new("").length(2, 20).match(/^[A-z]*$/).blocking(),
  ```

A modifier statement applies to a single validationStrategy, whether thats 'length', 'match', or even 'custom'.  So in this context, if you enter a value that has a length less than 1 or greater than 20, instead of blocking the update, it just shows that its not a valid input.  However, for the match statement, since the blocking statement is immediately following it, if there is not a match the state update will not execute.

<a name="validation"></a>

## The `Validation` Class
The `Validation` class is essentially a utility class, providing static methods to create validation contexts and define validation rules. Here's a breakdown of the core properties and methods in the Validation class:


| Definition | Return | Description  |
| ------------- | ------------- | ------------- |
|new(defaultValue: T)|Validator<T>|This static method is the primary way to create a new validation context. It accepts a default value as an argument and returns a new Validator instance, initialized with this default value. |
| createValidationSlice<T>(validators: ValidationSource<T>)  | ValidationSource<T> |This static method takes an object where each key-value pair represents a field and its associated Validator instance. This method returns the same object as is, mainly for better typing and consistency.|


The Validation class is designed as a static utility class, meaning you never need to instantiate it and can simply call its static methods directly.

<a name="validator"></a>

## The `Validator` Class
The `Validator` class represents a validation context for a specific field. Here's a breakdown of its properties and methods:

| Definition | Return | Description  |
| ------------- | ------------- | ------------- |
| constructor(defaultValue: T) | Validator<T> |The constructor is used to create a new Validator instance. It accepts a default value for the field this Validator is associated with.|
| length(min: number, max: number) | this(Validator)  |This method adds a length validation rule to this Validator. The rule will check whether the field's value's length is between the specified minimum and maximum. This method returns the Validator instance, allowing for method chaining.|
| match(regex: RegExp)  | this(Validator) |This method adds a match validation rule to this Validator. The rule will check whether the field's value matches the specified regular expression. This method returns the Validator instance, allowing for method chaining.|
| includes(value: string) | this(Validator) |This method adds an includes validation rule to this Validator. The rule will check whether the field's value includes the specified string. This method returns the Validator instance, allowing for method chaining.|
| blocking() | this(Validator)  |This method will enable you to define validationStrategies that can prevent the dom update from occuring if the value is not valid.|
| not() | this(Validator)	  |This method will invert the boolean value on the validationStrategy allowing you to define a rule straight up and invert it as needed for functionality.|
| getDefaultValue() | T  |This method returns the default value for the field this Validator is associated with.|
| getValidationQueue()  | ValidationStrategy<T>[]  |This method returns the array of validation strategies that have been added to this Validator.|

<a name="validationstrategy"></a>

## `ValidationStrategy` Type
The `ValidationStrategy` type is a function type used to represent a validation rule. A validation strategy is a function that takes a value and returns a boolean indicating whether the value passes the validation rule.

Behind the scenes, when you add a validation rule by calling a method like `length`, `match`, or `includes` on a `Validator` instance, what you're really doing is adding a new `ValidationStrategy` function to an internal array.

Then, whenever the `Validator` needs to validate its field's value (e.g., when the `updateProperties` function is called), it goes through this array of `ValidationStrategy` functions, calling each one with the current field value. If any of the `ValidationStrategy` functions return `false`, the field is marked as invalid. Otherwise, it's marked as valid. This way, the `Validator` can easily manage multiple validation rules for a single field.

