# TypeSalad

> **Adds more static typing and a C#-like structure to JavaScript without relying on TypeScript.**

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Node Version][node-image]][node-url]

**TypeSalad** is a lightweight library that provides typed wrappers, metadata reflection, and convenience utilities for JavaScript. It includes classes such as `SaladString`, `SaladInt`, `SaladBool`, and more—emulating a statically typed style similar to C#, all while staying in pure JavaScript (no compile step required).

## Table of Contents

1. [Features](#features)  
2. [Installation](#installation)  
3. [Usage](#usage)  
4. [API Overview](#api-overview)  
   - [Typed Classes](#typed-classes)  
   - [Helpers & Utilities](#helpers--utilities)  
   - [System Singleton](#system-singleton)  
5. [Examples](#examples)  
6. [Contributing](#contributing)  
7. [License](#license)

---

## Features

- **Typed Wrappers**: Classes like `SaladString`, `SaladInt`, `SaladBool`, `SaladDate`, etc., each storing an internal value but maintaining a `.type` property.
- **C#-like Syntax**: Simulates typed structures and simple reflection (e.g., `addMetadata`, `getMetadata`, and `QueryableArray`).
- **No Build Step Required**: Pure JavaScript, no TypeScript config needed. Just import and go.
- **Events & Packages**: An optional `EventEmitter` class and a `System` singleton that can dynamically load packages (like `SaladMath`) via ES modules.

---

## Installation

```bash
npm install typesalad
```

*(Make sure you have [Node.js](https://nodejs.org/) installed.)*

---

## Usage

### ES Module

```js
import {
  System,
  SaladString,
  SaladInt,
  TypedIf
} from 'typesalad';

// Create typed values
const greeting = new SaladString('Hello, TypeSalad');
const numberOne = new SaladInt(1);
const numberTwo = new SaladInt(2);

// Print using System
System.Print(greeting); // Logs: "Hello, TypeSalad"

// Compare with TypedIf
TypedIf(
  numberOne,
  numberTwo,
  () => console.log('They are equal!'),
  () => console.log('They are not equal!')
);
// Logs: "They are not equal!"
```

### CommonJS (if needed)
If you’re in a CommonJS environment, you could do:
```js
const {
  System,
  SaladString,
  SaladInt,
  TypedIf
} = require('typesalad');
```

*(This depends on how your project is set up. If your `package.json` has `"type": "module"`, then you’ll likely be using ES Modules.)*

---

## API Overview

### Typed Classes

- **SaladString**: Wraps a string.  
- **SaladInt**: Wraps an integer.  
- **SaladFloat**: Wraps a floating-point number.  
- **SaladBool**: Wraps a boolean.  
- **SaladDate**: Wraps a `Date` object.  
- **SaladArray**: A typed, array-like structure.  
- **SaladObject**: A typed, object-like structure.  
- **SaladVec2**, **SaladVec3**: Vector classes for 2D/3D operations.  

Each class has a `.type` property (e.g. `"String"`, `"Int"`, etc.) and methods like `toString()`, `valueOf()`, or other unique methods.

### Helpers & Utilities

- **TypedIf(expr1, expr2, onEqual, onNotEqual)**: Checks if two typed objects share the same `.type` and `.valueOf()`, then invokes the appropriate callback.  
- **createGenericList(expectedType)**: Creates a class that enforces a specific type for all items added.  
- **QueryableArray**: A chainable array wrapper with `.where()`, `.select()`, `.orderBy()`, etc.  
- **Overloadable**: Allows defining multiple method overloads based on parameter types.  

### System Singleton

- **System**: A global singleton offering:
  - `Print(value)`: Logs typed strings.  
  - `Concat(expr1, expr2)`: Concatenates two typed values (String or Int).  
  - `StoreData(key, value) / RetData(key)`: Simple typed storage.  
  - `UsePackage(packageName, packagePath, exportName?)`: Dynamically imports a package and stores it.  

---

## Examples

1. **Using `SaladArray`**:
   ```js
   import { SaladArray, SaladString } from 'typesalad';

   const arr = new SaladArray([
     new SaladString("Apple"),
     new SaladString("Banana")
   ]);

   arr.push(new SaladString("Cherry"));
   console.log(arr.length); // 3
   console.log(arr.toString()); // [Apple, Banana, Cherry]
   ```

2. **Overloading Methods**:
   ```js
   import { Overloadable } from 'typesalad';

   const myObj = new Overloadable();
   myObj.defineOverload('doSomething', ['String'], function(str) {
     return `Doing something with string: ${str}`;
   });

   myObj.defineOverload('doSomething', ['Int'], function(intVal) {
     return `Doing something with int: ${intVal}`;
   });

   console.log(myObj.callOverload('doSomething', new SaladString('Hello'))); 
   // => "Doing something with string: Hello"

   console.log(myObj.callOverload('doSomething', new SaladInt(42))); 
   // => "Doing something with int: 42"
   ```

3. **Metadata Reflection**:
   ```js
   import { addMetadata, getMetadata } from 'typesalad';

   const user = {};
   addMetadata(user, 'role', 'admin');
   console.log(getMetadata(user, 'role')); // "admin"
   ```

---

## Contributing

Contributions are welcome! Here’s how you can help:

1. **Fork** the repository and clone locally.  
2. Create a new branch with a descriptive name.  
3. Make your changes, write tests (if applicable), and commit.  
4. Push to your fork and create a Pull Request.

Please file issues if you find any bugs or have ideas for improvements.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

[npm-image]: https://img.shields.io/npm/v/typesalad.svg
[npm-url]: https://www.npmjs.com/package/typesalad
[license-image]: https://img.shields.io/npm/l/typesalad.svg
[license-url]: https://github.com/yourusername/typesalad/blob/main/LICENSE
[node-image]: https://img.shields.io/node/v/typesalad.svg
[node-url]: https://nodejs.org/en/