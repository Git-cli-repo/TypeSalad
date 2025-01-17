/***************************************************************
 * TypeSalad.mjs
 * 
 * A library providing typed wrappers, metadata reflection,
 * and helper utilities for typed operations in JavaScript.
 * 
 * @module TypeSalad
 ***************************************************************/

import { error } from "console";

/***************************************************************
 * createSingleton (for System)
 ***************************************************************/

/**
 * Wraps a base class into a singleton pattern, returning the same instance
 * every time the constructor is called.
 *
 * @function createSingleton
 * @param {Class} BaseClass - The base class to wrap as a singleton.
 * @returns {Object} The single instance of the given class.
 */
function createSingleton(BaseClass) {
  let instance;

  /**
   * @class SingletonClass
   * @extends BaseClass
   * @private
   */
  class SingletonClass extends BaseClass {
    constructor(...args) {
      if (instance) {
        return instance;
      }
      super(...args);
      instance = this;
    }
  }

  return new SingletonClass();
}

/***************************************************************
 * EventEmitter (optional, for "C#-like" events)
 ***************************************************************/

/**
 * A simple EventEmitter class that allows adding listeners and emitting events.
 *
 * @class
 */
class EventEmitter {
  /**
   * Creates an EventEmitter instance.
   */
  constructor() {
    /**
     * @type {Object.<string, Function[]>}
     * @private
     */
    this._listeners = {};
  }

  /**
   * Registers a listener for a given event name.
   * @param {string} eventName - The name of the event.
   * @param {Function} listener - The listener callback.
   */
  on(eventName, listener) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(listener);
  }

  /**
   * Emits an event, invoking all associated listeners with supplied arguments.
   * @param {string} eventName - The name of the event.
   * @param {...any} args - Arguments passed to the listener functions.
   */
  emit(eventName, ...args) {
    if (this._listeners[eventName]) {
      for (const listener of this._listeners[eventName]) {
        listener(...args);
      }
    }
  }
}

/***************************************************************
 * Overloadable Helper
 * - Lets you define multiple "overloads" for one method name.
 ***************************************************************/

/**
 * A helper class for creating overloadable methods.
 *
 * @class Overloadable
 */
class Overloadable {
  /**
   * Creates an Overloadable instance.
   */
  constructor() {
    /**
     * Internal store for overload definitions.
     * @type {Object.<string, Function>}
     * @private
     */
    this._overloads = {}; // e.g., { "methodName:paramType1,paramType2,...": function }
  }

  /**
   * Defines a new overload for a given method name and parameter types.
   *
   * @param {string} name - The method name.
   * @param {string[]} paramTypes - An array of parameter types (e.g. `['String','Int']`).
   * @param {Function} fn - The function to call when this overload matches.
   */
  defineOverload(name, paramTypes, fn) {
    const key = `${name}:${paramTypes.join(',')}`;
    this._overloads[key] = fn;
  }

  /**
   * Calls the overload that matches the provided name and argument signature.
   *
   * @param {string} name - The method name to call.
   * @param {...any} args - The arguments passed into the method.
   * @returns {any} The result of the matched overload's function.
   * @throws {Error} If no overload matches the given signature.
   */
  callOverload(name, ...args) {
    const argTypes = args.map(a => a?.type ?? typeof a);
    const key = `${name}:${argTypes.join(',')}`;

    if (this._overloads[key]) {
      return this._overloads[key].apply(this, args);
    } else {
      throw new Error(`No overload for ${name}(${argTypes.join(',')})`);
    }
  }
}

/***************************************************************
 * Reflection-Like Metadata
 * - A simple store/retrieve approach.
 ***************************************************************/

/**
 * @type {WeakMap<object, object>}
 * @private
 */
const metadataStorage = new WeakMap();

/**
 * Adds metadata to a given target object, stored under a specified key.
 *
 * @function addMetadata
 * @param {object} target - The target object to attach metadata to.
 * @param {string} key - The metadata key (e.g. "design:type").
 * @param {any} value - The metadata value.
 */
function addMetadata(target, key, value) {
  if (!metadataStorage.has(target)) {
    metadataStorage.set(target, {});
  }
  const meta = metadataStorage.get(target);
  meta[key] = value;
}

/**
 * Retrieves metadata from a target object by key.
 *
 * @function getMetadata
 * @param {object} target - The target object to retrieve metadata from.
 * @param {string} key - The metadata key.
 * @returns {any} The metadata value, or `undefined` if not found.
 */
function getMetadata(target, key) {
  const meta = metadataStorage.get(target);
  return meta?.[key];
}

/***************************************************************
 * LINQ-Like Queries (QueryableArray)
 ***************************************************************/

/**
 * A wrapper around an array that provides chainable
 * methods similar to LINQ (where, select, orderBy).
 *
 * @class QueryableArray
 */
class QueryableArray {
  /**
   * @param {Array<any>} arr - The initial array to wrap.
   */
  constructor(arr) {
    /**
     * @type {Array<any>}
     * @private
     */
    this._arr = arr;
  }

  /**
   * Filters the array by a predicate function.
   *
   * @param {Function} predicate - A function that returns true/false for each element.
   * @returns {QueryableArray} This instance, for chaining.
   */
  where(predicate) {
    this._arr = this._arr.filter(predicate);
    return this;
  }

  /**
   * Transforms each element in the array by a selector function.
   *
   * @param {Function} selector - A function that returns a transformed value.
   * @returns {QueryableArray} This instance, for chaining.
   */
  select(selector) {
    this._arr = this._arr.map(selector);
    return this;
  }

  /**
   * Sorts the array by a comparer function.
   *
   * @param {Function} comparer - A compare function (like the one used in `array.sort()`).
   * @returns {QueryableArray} This instance, for chaining.
   */
  orderBy(comparer) {
    this._arr = this._arr.sort(comparer);
    return this;
  }

  /**
   * Finalizes the chain and returns the underlying array.
   *
   * @returns {Array<any>} The resulting array after the chain of operations.
   */
  toArray() {
    return this._arr;
  }
}

/***************************************************************
 * Generics Simulation
 * - createGenericList(expectedTypeName)
 ***************************************************************/

/**
 * Creates a "GenericList" class that will only accept items of the expected type.
 *
 * @function createGenericList
 * @param {string} expectedTypeName - The type name expected for items (e.g. "String", "Int").
 * @returns {Class} A new class extending `TypeSalad` that enforces the expected type.
 */
function createGenericList(expectedTypeName) {
  /**
   * @class GenericList
   * @extends TypeSalad
   */
  return class GenericList {
    /**
     * Creates a typed list that only accepts items of the specified type.
     * @param {...any} elements - The initial elements to add to the list.
     */
    constructor(...elements) {
      this._items = [];
      this.type = "GenericList";
      this._expectedType = expectedTypeName;
      for (const el of elements) {
        this.add(el);
      }
    }

    /**
     * Adds an item to the list, checking if it matches the expected type.
     * @param {object} item - An object with a `type` property.
     * @throws {TypeError} If the item does not match the expected type.
     */
    add(item) {
      if (item?.type !== this._expectedType) {
        throw new TypeError(
          `Expected type '${this._expectedType}', received '${item?.type}'.`
        );
      }
      this._items.push(item);
    }

    /**
     * Returns the array of stored items.
     * @type {Array<object>}
     */
    get items() {
      return this._items;
    }

    /**
     * Returns a string representation of the list.
     * @returns {string}
     */
    toString() {
      return new SaladString(`[GenericList of ${this._expectedType}] [${this._items.join(', ')}]`);
    }
  };
}

/***************************************************************
 * Base "TypeSalad" Class
 ***************************************************************/

/**
 * A base class for all typed "Salad" classes.
 * 
 * @class TypeSalad
 */
class TypeSalad {
  // shared logic or placeholders would go here
}

/***************************************************************
 * Basic typed classes: SaladString, SaladInt
 ***************************************************************/

/**
 * Wraps a string value in a typed container.
 *
 * @class SaladString
 * @extends TypeSalad
 */
class SaladString extends TypeSalad {
  /**
   * @param {string} value - The string value to store.
   */
  constructor(value) {
    super();
    if(typeof value == "string"){
      this._value = value;
      this.type = 'String';
    } else {
      throw new TypeError(`Error: Input value was internal type '${typeof value}', expected internal type 'string'.`);
    }

  }

  /**
   * Returns the internal string value.
   * @returns {string}
   */
  toString() {
    return new SaladString(this._value);
  }

  /**
   * Returns the internal string value (for numeric operations, coerces to NaN).
   * @returns {string}
   */
  valueOf() {
    return this._value;
  }
}

/**
 * Wraps an integer value in a typed container.
 *
 * @class SaladInt
 * @extends TypeSalad
 */
class SaladInt extends TypeSalad {
  /**
   * @param {number} value - The integer value to store.
   */
  constructor(value) {
    super();
    if(typeof value == "number"){
      this._value = value;
      this.type = 'Int';
    } else {
      throw new TypeError(`Error: Input value was internal type '${typeof value}', expected internal type 'number'.`);
    }
  }

  /**
   * Returns a string version of the internal integer.
   * @returns {string}
   */
  toString() {
    return new SaladString(`${this._value}`);
  }

  /**
   * Returns the internal integer value as a number.
   * @returns {number}
   */
  valueOf() {
    return this._value;
  }
}

/***************************************************************
 * Additional typed classes: SaladVec2, SaladVec3
 ***************************************************************/

/**
 * Represents a 2D vector in TypeSalad.
 *
 * @class SaladVec2
 * @extends TypeSalad
 */
class SaladVec2 extends TypeSalad {
  /**
   * @param {string|number} x - The X component of the vector.
   * @param {string|number} y - The Y component of the vector.
   */
  constructor(x, y) {
    super();
    if((typeof x == "string" || typeof x == "number") && (typeof y == "string" || typeof y == "number")){
      this.x = x;
      this.y = y;
      this.type = "Vec2";
    } else {
      throw new TypeError(`Error: Input values was internal type '${typeof x}' and '${typeof y}' expected internal types 'string' or 'number'.`);
    }

    

    /**
     * A cached string value for internal comparisons.
     * @type {string}
     * @private
     */
    this._valString = `${x},${y}`;
  }

  /**
   * Returns the stable string so two identical vectors compare as equal.
   * @returns {string}
   */
  valueOf() {
    return this._valString;
  }

  /**
   * Returns a `GenericList` containing typed coordinates ([SaladString, SaladString]).
   * @returns {Object} An instance of the generated GenericList class.
   */
  value() {
    const GL = createGenericList("String");
    const list = new GL();
    list.add(new SaladString(String(this.x)));
    list.add(new SaladString(String(this.y)));
    return list;
  }

  /**
   * Returns a string representation of the vector.
   * @returns {string}
   */
  toString() {
    return new SaladString(`${this.x}, ${this.y}`);
  }

  /**
   * Returns a plain object representation for JSON serialization.
   * @returns {{x: (string|number), y: (string|number)}}
   */
  toJSON() {
    return { x: this.x, y: this.y };
  }
}

/**
 * Represents a 3D vector in TypeSalad.
 *
 * @class SaladVec3
 * @extends TypeSalad
 */
class SaladVec3 extends TypeSalad {
  /**
   * @param {string|number} x - The X component.
   * @param {string|number} y - The Y component.
   * @param {string|number} z - The Z component.
   */
  constructor(x, y, z) {
    super();
    if((typeof x == "string" || typeof x == "number") && (typeof y == "string" || typeof y == "number") && (typeof z == "string" || typeof z == "number")){
      this.x = x;
      this.y = y;
      this.z = z;
      this.type = "Vec3";
    } else {
      throw new TypeError(`Error: Input values was internal type '${typeof x}', '${typeof y}', and '${typeof z}' expected internal types 'string' or 'number'.`);
    }

    /**
     * A cached string value for internal comparisons.
     * @type {string}
     * @private
     */
    this._valString = `${x},${y},${z}`;
  }

  /**
   * Returns a stable string for equality checks.
   * @returns {string}
   */
  valueOf() {
    return this._valString;
  }

  /**
   * Returns a `GenericList` containing typed coordinates ([SaladString, SaladString, SaladString]).
   * @returns {Object} An instance of the generated GenericList class.
   */
  value() {
    const GL = createGenericList("String");
    const list = new GL();
    list.add(new SaladString(String(this.x)));
    list.add(new SaladString(String(this.y)));
    list.add(new SaladString(String(this.z)));
    return list;
  }

  /**
   * Returns a string representation of the vector.
   * @returns {string}
   */
  toString() {
    return new SaladString(`${this.x}, ${this.y}, ${this.z}`);
  }

  /**
   * Returns a plain object representation for JSON serialization.
   * @returns {{x: (string|number), y: (string|number), z: (string|number)}}
   */
  toJSON() {
    return { x: this.x, y: this.y, z: this.z };
  }
}

/***************************************************************
 * Additional TypeSalad Classes
 ***************************************************************/

/**
 * A wrapped boolean type in TypeSalad.
 *
 * @class SaladBool
 * @extends TypeSalad
 */
class SaladBool extends TypeSalad {
  /**
   * @param {boolean} value - The boolean value.
   */
  constructor(value) {
    super();
    this._value = !!value; // Force to boolean
    this.type = "Bool";
  }

  /**
   * Returns a string representation of the boolean.
   * @returns {string}
   */
  toString() {
    return new SaladString(String(this._value));
  }

  /**
   * Returns the internal boolean value.
   * @returns {boolean}
   */
  valueOf() {
    return this._value;
  }
}

/**
 * A wrapped floating-point number in TypeSalad.
 *
 * @class SaladFloat
 * @extends TypeSalad
 */
class SaladFloat extends TypeSalad {
  /**
   * @param {number|string} value - The initial value, coerced to float.
   */
  constructor(value) {
    super();
    this._value = Number(value);
    this.type = "Float";
  }

  /**
   * Returns a string representation of the float value.
   * @returns {string}
   */
  toString() {
    return new SaladString(String(this._value));
  }

  /**
   * Returns the internal float as a number.
   * @returns {number}
   */
  valueOf() {
    return this._value;
  }
}

/**
 * A wrapped Date object in TypeSalad.
 *
 * @class SaladDate
 * @extends TypeSalad
 */
class SaladDate extends TypeSalad {
  /**
   * @param {Date|number|string} value - An existing Date or a value to be passed into `new Date()`.
   */
  constructor(value) {
    super();
    if (value instanceof Date) {
      this._value = value;
    } else {
      this._value = new Date(value); // May throw RangeError if invalid
    }
    this.type = "Date";
  }

  /**
   * Returns an ISO string representation of the date.
   * @returns {string}
   */
  toString() {
    return new SaladString(this._value.toISOString());
  }

  /**
   * Returns the numeric timestamp representation of the date.
   * @returns {number}
   */
  valueOf() {
    return this._value.valueOf();
  }

  /**
   * The full year (e.g. 2025).
   * @type {number}
   * @readonly
   */
  get year() {
    return this._value.getFullYear();
  }

  /**
   * The month (1-12).
   * @type {number}
   * @readonly
   */
  get month() {
    return this._value.getMonth() + 1;
  }

  /**
   * The day of the month (1-31).
   * @type {number}
   * @readonly
   */
  get day() {
    return this._value.getDate();
  }
}

/**
 * A basic array-like type in TypeSalad.
 *
 * @class SaladArray
 * @extends TypeSalad
 */
class SaladArray extends TypeSalad {
  /**
   * @param {Array<any>} [items=[]] - Initial items in the array.
   */
  constructor(items = []) {
    super();
    this._items = items;
    this.type = "Array";
  }

  /**
   * Pushes an item onto the end of the array.
   * @param {any} item - The item to add.
   */
  push(item) {
    this._items.push(item);
  }

  /**
   * Removes and returns the last item in the array.
   * @returns {any} The removed item.
   */
  pop() {
    return this._items.pop();
  }

  /**
   * The current length of the array.
   * @type {number}
   * @readonly
   */
  get length() {
    return this._items.length;
  }

  /**
   * Returns a shallow copy of a portion of the array.
   * @param {...any} args - Same parameters as `Array.prototype.slice`.
   * @returns {SaladArray} A new SaladArray instance containing the sliced portion.
   */
  slice(...args) {
    return new SaladArray(this._items.slice(...args));
  }

  /**
   * Returns a string representation of the array.
   * @returns {string}
   */
  toString() {
    return new SaladString(`[${this._items.map(el => el?.toString?.() || el).join(", ")}]`);
  }

  /**
   * Returns the internal array for numeric or other operations.
   * @returns {Array<any>}
   */
  valueOf() {
    return this._items;
  }
}

/**
 * A key–value dictionary in TypeSalad that can store typed or untyped data.
 *
 * @class SaladObject
 * @extends TypeSalad
 */
class SaladObject extends TypeSalad {
  /**
   * @param {Object} [obj={}] - The initial plain object.
   * @throws {TypeError} If `obj` is not a plain object.
   */
  constructor(obj = {}) {
    super();
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      throw new TypeError("SaladObject expects a plain object.");
    }
    this._obj = obj;
    this.type = "Object";
  }

  /**
   * Retrieves a value by key from the object.
   * @param {string} key - The property key.
   * @returns {any} The value stored under that key.
   */
  get(key) {
    return this._obj[key];
  }

  /**
   * Sets a value by key in the object.
   * @param {string} key - The property key.
   * @param {any} value - The value to store.
   */
  set(key, value) {
    this._obj[key] = value;
  }

  /**
   * Returns a JSON string representation of the object.
   * @returns {string}
   */
  toString() {
    return new SaladString(JSON.stringify(this._obj));
  }

  /**
   * Returns the underlying plain object.
   * @returns {Object}
   */
  valueOf() {
    return this._obj;
  }
}

/***********************************************************
 * TypedIf function
***********************************************************/

/**
 * Ensures both arguments have a `.type` property and optionally compares their values.
 *
 * @function TypedIf
 * @param {object} expr1 - A typed object (e.g., SaladInt, SaladString, etc.).
 * @param {object} expr2 - Another typed object of the same type.
 * @param {Function} onEqual - Callback if `expr1.valueOf() === expr2.valueOf()`.
 * @param {Function} [onNotEqual] - Optional callback if they differ.
 * @throws {TypeError} If either argument is untyped or their types differ.
 */
function TypedIf(expr1, expr2, onEqual, onNotEqual) {
  if (expr1?.type === undefined) {
    throw new TypeError(
      "Parameter 'expr1' is untyped (either not a TypeSalad variable or incorrectly defined)."
    );
  }
  if (expr2?.type === undefined) {
    throw new TypeError(
      "Parameter 'expr2' is untyped (either not a TypeSalad variable or incorrectly defined)."
    );
  }
  if (expr1.type !== expr2.type) {
    throw new TypeError(
      `Parameter 'expr2' was type '${expr2.type}' but 'expr1' is type '${expr1.type}'.`
    );
  }
  if (expr1.valueOf() === expr2.valueOf()) {
    if (typeof onEqual === 'function') {
      onEqual();
    }
  } else if (typeof onNotEqual === 'function') {
    onNotEqual();
  }
}

/***************************************************************
 * _System class with async UsePackage (dynamic import)
 ***************************************************************/

/**
 * An internal System class with storage, printing, dynamic package loading, etc.
 *
 * @class _System
 * @extends EventEmitter
 * @private
 */
class _System extends EventEmitter {
  /**
   * Creates the System instance (should only be called internally via singleton).
   */
  constructor() {
    super();

    /**
     * Holds all loaded packages.
     * Each package is stored as an object: { enabled: boolean, instance: any }
     * @type {Object.<string, {enabled: boolean, instance: any}>}
     */
    this.Packages = {};

    /**
     * A general key-value store used for demonstration.
     * @type {Object.<string, any>}
     */
    this.Storage = {};
  }

  /**
   * Prints a typed string to the console (must have `type === 'String'`).
   * @param {SaladString} value - The typed string value.
   * @throws {TypeError} If `value.type !== 'String'`.
   */
  Print(value) {
    if (value.type === 'String') {
      console.log(value.toString());
      this.emit('printCalled', value);
    } else {
      throw new TypeError(
        `Print expected 'String', got '${value.type}'.`
      );
    }
  }

  /**
   * Concatenates two typed values, but only if both share the same type (String or Int).
   * Returns a new SaladString containing the combined result.
   *
   * @param {TypeSalad} expr1 - First typed object (e.g. SaladString or SaladInt).
   * @param {TypeSalad} expr2 - Second typed object of the same type.
   * @returns {SaladString} The concatenated result, wrapped as a SaladString.
   * @throws {TypeError} If either parameter is untyped or types are mismatched.
   */
  Concat(expr1, expr2) {
    if (expr1.type != undefined) {
      if (expr2.type != undefined) {
        if (expr1.type === expr2.type) {
          if (expr1.type === "String" || expr1.type === "Int") {
            return new SaladString(`${expr1.valueOf()}${expr2.valueOf()}`);
          } else {
            throw new TypeError(
              "Parameters 'expr1' and/or 'expr2' are not of type 'SaladString' or 'SaladInt'"
            );
          } 
        } else {
          throw new TypeError(
            "Parameters 'expr1' and 'expr2' have unmatching types."
          );
        }
      } else {
        throw new TypeError(
          "Parameter 'expr2' is untyped (either not a TypeSalad variable or incorrectly defined)."
        );
      }
    } else {
      throw new TypeError(
        "Parameter 'expr1' is untyped (either not a TypeSalad variable or incorrectly defined)."
      );
    }
  }

  /**
   * Stores typed data in System storage, ensuring type safety if a key already exists.
   *
   * @param {string} key - The storage key.
   * @param {TypeSalad} value - The typed value to store.
   * @throws {TypeError} If the existing key expects a different type or if it contains an untyped variable.
   */
  StoreData(key, value) {
    if (this.Storage[key] == undefined) {
      console.warn(`Key ${key} is undefined in System`);
      this.Storage[key] = value;
    } else {
      if (this.Storage[key] != undefined && this.Storage[key].type != undefined) {
        if (this.Storage[key].type === value.type) {
          this.Storage[key] = value;
        } else {
          throw new TypeError(`Key ${key} expected type ${this.Storage[key].type}, got ${value.key}`);
        }
      } else {
        throw new TypeError(`Key ${key} contains an untyped variable.`);
      }
    }
  }

  /**
   * Retrieves the raw valueOf() from a stored key.
   *
   * @param {string} key - The storage key.
   * @returns {any} The raw value returned by `.valueOf()`.
   */
  RetData(key) {
    if(this.Storage[key]) {
      return this.Storage[key].valueOf();
    }
  }

  /**
   * Dynamically imports a package and initializes it, storing it in `this.Packages`.
   *
   * @async
   * @param {string} packageName - The unique name/key to refer to the package.
   * @param {string} packagePath - The path to the .mjs file for dynamic import.
   * @param {string} [exportName=packageName] - The named export to instantiate.
   * @throws {ReferenceError} If the package is already enabled or the export is not found.
   */
  async UsePackage(packageName, packagePath, exportName = packageName) {
    if (!this.Packages[packageName]) {
      this.Packages[packageName] = { enabled: false, instance: null };
    }

    if (this.Packages[packageName].enabled) {
      throw new ReferenceError(`${packageName} is already enabled.`);
    }

    const mod = await import(packagePath);
    const PkgClass = mod[exportName];
    if (!PkgClass) {
      throw new ReferenceError(
        `Export '${exportName}' not found in '${packagePath}'.`
      );
    }

    const instance = new PkgClass();
    this.Packages[packageName].enabled = true;
    this.Packages[packageName].instance = instance;

    console.warn(`Enabled Package '${packageName}' from '${packagePath}'`);
    this.emit("packageUsed", packageName);
  }

  /**
   * Example accessor for a package named "SaladMath".
   * 
   * @throws {Error} If SaladMath is not enabled (UsePackage hasn't been called).
   * @type {any} - The instantiated export from the "SaladMath" package.
   */
  get SaladMath() {
    const pkg = this.Packages["SaladMath"];
    if (!pkg?.enabled || !pkg.instance) {
      throw new Error("SaladMath is not enabled. Call UsePackage('SaladMath') first.");
    }
    return pkg.instance;
  }

  /**
   * Example accessor for a package named "SaladLinq".
   * 
   * @throws {Error} If SaladLinq is not enabled.
   * @type {any} - The instantiated export from the "SaladLinq" package.
   */
  get SaladLinq() {
    const pkg = this.Packages["SaladLinq"];
    if (!pkg?.enabled || !pkg.instance) {
      throw new Error("SaladLinq is not enabled. Call UsePackage('SaladLinq') first.");
    }
    return pkg.instance;
  }

  /**
   * Example accessor for a package named "SaladDOM".
   * 
   * @throws {Error} If SaladDOM is not enabled.
   * @type {any} - The instantiated export from the "SaladDOM" package.
   */
  get SaladDOM() {
    const pkg = this.Packages["SaladDOM"];
    if (!pkg?.enabled || !pkg.instance) {
      throw new Error("SaladDOM is not enabled. Call UsePackage('SaladDOM') first.");
    }
    return pkg.instance;
  }
}

/***************************************************************
 * Create the Singleton `System`
 ***************************************************************/

/**
 * A singleton instance of the System, providing global access
 * to package management, typed printing, etc.
 * 
 * @name System
 * @type {_System}
 */
const System = createSingleton(_System);

/***************************************************************
 * Export everything in ONE place
 ***************************************************************/

export {
  // Helpers
  Overloadable,
  addMetadata,
  getMetadata,
  QueryableArray,
  createGenericList,
  EventEmitter,

  // Base class
  TypeSalad,

  // Typed classes
  SaladString,
  SaladInt,
  SaladVec2,
  SaladVec3,

  // Additional typed classes
  SaladBool,
  SaladFloat,
  SaladDate,
  SaladArray,
  SaladObject,

  // The typed if function
  TypedIf,

  // The System singleton
  System
};
