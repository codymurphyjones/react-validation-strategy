# Aspirations of React Validation Strategy

This document exists as a point of reference for the long term discussions around react-validation-strategy, this is a living document for expressing ideas and the views expressed here may not directly correlate to the current state of the ecosystem.

#### Planned Changes:
- **`createStateSlice`**: Create the data types needed for managing the reducer object created from a validation input
- **`validate`**: Configures the validation types for a state slice
- **`optional`**: makes it so that a field is not required for a successful validation call.
- **`noValidate`**: Does not automatically validate when state is changed
- **`parse`**: Enables support for custom validators to parse the state.
- **`submit`**: checks to see if all validation states are passing, executes submit call.
- **`messages`**: Display validation messages if a validation fails


[Return to Home](https://github.com/codymurphyjones/react-validation-strategy/)


## The `createStateSlice` Function
The `createStateSlice` function plays a key role in `react-validation-strategy` and aims to enhance type safety in validation systems. This function enables a clear separation of the state and input definitions from the validation definitions. This enhances the maintainability and scalability of your code by segregating concerns, keeping your validation logic separate from your state management.

In its simplest form, the createStateSlice function receives an object representing your state. Each key-value pair in this object represents a field in your state. The keys are your field names and the values are objects specifying the properties of the fields.

Here is an example of how you can use `createStateSlice`:

```ts
const val = Validation.createStateSlice({
  fieldName: {
    value: '', // Default value
    type: 'text', // Input type
    placeholder: 'Enter your first name', // Placeholder
    settings: {
      defaultStyle: {
		border: "thick double rgba(0,0,0,0)"
	  }, // Default CSS styles
      errorStyle: {
		border: "thick double red"
	  },
    },
    accessibility: {
      ariaLabel: 'First Name', // Accessibility labels
      tabIndex: 0, // Tab index for better accessibility navigation
    }
  },
  // Additional fields go here...
})
```


### StateSlice

In the above example, firstName is a field with several properties. Let's breakdown these properties:

First let's take a look at `fieldName`, which will be the label and access key for any data created or updated using that key.  The `StateSlice` object can be passed any key that you like, and you configure it with the settings below.

However, in order to provide a more streamlined configuration for plugging into input forms, there is a key value that can be passed into the `StateSlice` object that will propogate across all of the configurations currently defined, assuming that the values are not overridden directly on the key definition.  The unique key that accomplishes this is called `defaultForm`

#### `defaultForm` Interactions

As the name indicates, the defaultForm field is intended to help streamline the process of input parameter generation.  Of course we could manually define each field if we wanted or needed to but react-validation-strategy strives to simplify your entire input management workload.  

It does this by pretending to be a regular `StateSlice` type with the exception that it doesn't support the defaut value parameter.  Once the data structure is passed into the useValidation call

#### StateSlice Type
| key | type | description  | Required
| ------------- | ------------- | ------------- |---------------|
| `value` | any | The default value of the field. | Yes |
| `type` | string | The type of input, e.g. 'text', 'number', etc. | No |
| `placeholder` | string | Placeholder text displayed in the input field. | No |
| `settings` | object | Contains style-related settings. | No |
| `accessibility` | object | Contains accessibility-related attributes. | No |


#### The `settings`` object can have the following keys:


Key |	Type |	Description	| Required
| ------------- | ------------- | ------------- |---------------|
| `defaultStyle`	| Any	| The default value of the field. |	Yes
| `errorStyle` | String |	The type of input, e.g. 'text', 'number', etc.|	No


#####  The `accessibility` object can have the following keys:

Key |	Type |	Description	| Required
| ------------- | ------------- | ------------- |---------------|
| `ariaLabel`	| Any	| The default value of the field. |	Yes
| `tabIndex`	| String |	The type of input, e.g. 'text', 'number', etc.|	No

Remember, all keys except 'value' are optional. If you only need to set a default value for a field without specifying other properties, you can simply do this:

```ts
const val = Validation.createStateSlice({
  firstName: '',
  // Additional fields go here...
})
```


In this case, `firstName` will be a field with an empty string as its default value.


```diff
import styles from "./index.module.css";	
import Head from "next/head";	
- import { useValidation, Validation } from "react- validation- strategy";	
+ import { useValidation, Validation } from "react- validation- strategy";

const reg = /%|#|\$|@|!/;	
- const AccountValidation = Validation.createValidationSlice({	
-   firstName: Validation.new("")	
-     .length(2, 20)	
+ const AccountValidation = Validation.createStateSlice({
+   defaultForm: {
+     default: "", // Default value
+     type: "text", // Input type
+     placeholder: "Enter your %key", // %id
+     settings: {
+       errorStyle: {
+         border: "thick double red",
+       },
+     },
+     accessibility: {
+      ariaLabel: "First Name", // Accessibility labels
+       tabIndex: 0, // Tab index for better accessibility navigation
+     },
+   },
+   firstName: "",
+   lastName: "",
+   username: "",
+   password: "",
+   confirmPassword: "",
+ }).validate({
+   firstName: Validation.length(2, 20)
	.match(/^[A- z]*$/)
    .blocking(),
-   lastName: Validation.new("")	
-     .length(2, 20)	
-     .match(/^[A- z]*$/)	
-     .blocking(),	
-   username: Validation.new("").length(5, 10).not(),	
-   password: Validation.new("").match(reg),	
-   confirmPassword: Validation.new("").custom((val) => val.length > 5)	
+   username: Validation.length(5, 10).not(),
+   password: Validation.match(reg),
+   confirmPassword: Validation.custom((val, state) => val === state.password),
});

export default function Home() {	
-   const [syncInput, isValid, actions] = useValidation(AccountValidation);
+   const [syncInput, isValid, actions] = useValidation(AccountValidation);

return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create- t3- app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        Username:{" "}
        <input
-          {...syncInput(
+          {...sync(
            "username",
            {
              border: "thick double rgba(0,0,0,0)",
            },
            {
              border: "thick double red",
            }
          )}
          type={"text"}
          placeholder={"Enter your name"}
        />
        <input
- 	   {...syncInput(
+          {...sync(
            "button",
            {
              border: "thick double rgba(0,0,0,0)",
            },
            {
              border: "thick double red",
            }
          )}
          placeholder={"Enter your name"}
          type="radio"
          checked={actions.watch("button") === "1"}
        />
      </main>
    </>
  );
}
```

<!-- 
```ts
const UserValidation = Validation.createStateSlice({
  firstName: "",
  lastName: "",
  username: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  button: "",
  email: "",
}).validate({
  firstName: Validation.new("")
    .length(2, 20)
    .match(/^[A-z]*$/)
    .blocking(),
  lastName: Validation.new("")
    .length(2, 20)
    .match(/^[A-z]*$/)
    .blocking(),
  username: Validation.new("").length(5, 10).not(),
  displayName: Validation.new("").length(2, 200).includes("@").blocking(),
  password: Validation.new("").match(reg),
  confirmPassword: Validation.new("").custom((val) => val.length > 5),
  button: Validation.new(""),
  email: Validation.new("").parse(z.string().email("This must be an email")).length(2, 200).includes("@"),
});
const UserValidation = Validation.createValidationSlice({
  firstName: Validation
    .length(2, 20)
    .match(/^[A-z]*$/)
    .blocking(),
  lastName: Validation
    .length(2, 20)
    .match(/^[A-z]*$/)
    .blocking(),
  username: Validation.length(5, 10).not(),
  displayName: Validation.length(2, 200).includes("@").blocking(),
  password: Validation.match(reg),
  confirmPassword: Validation.custom((val) => val.length > 5),
  email: Validation.length(2, 200).includes("@"),
  button: Validation.new(""),
  //email: Validation.new("").parse(z.string().email("This must be an email")),
});


```

```ts

export default function UserForm() {
  const [syncInput, isValid] = useValidation(UserValidation);

  return (
    <form>
      <input
        {...syncInput(
          "firstName",
          {
            border: "thick double rgba(0,0,0,0)",
          },
          {
            border: "thick double red",
          }
        )}
      />
      <input
        {...syncInput(
          "lastName",
          {
            border: "thick double rgba(0,0,0,0)",
          },
          {
            border: "thick double red",
          }
        )}
      />
      <input
        {...syncInput(
          "email",
          {
            border: "thick double rgba(0,0,0,0)",
          },
          {
            border: "thick double red",
          }
        )}
      />
      <input
        {...syncInput(
          "password",
          {
            border: "thick double rgba(0,0,0,0)",
          },
          {
            border: "thick double red",
          }
        )}
      />
      <input
        {...syncInput(
          "age",
          {
            border: "thick double rgba(0,0,0,0)",
          },
          {
            border: "thick double red",
          }
        )}
      />

      <button
        type="submit"
        disabled={
          !isValid("firstName", true) ||
          !isValid("lastName", true) ||
          !isValid("email", true) ||
          !isValid("password", true) ||
          !isValid("age")
        }
      >
        Submit
      </button>
    </form>
  );
}
	
	```
 -->