import { TypeSalad } from '../TypeSalad.mjs';

/***************************************************************
 * 1) The CHAINABLE class: SaladLinq
 *    - Has .where, .select, etc.
 ***************************************************************/
export class SaladLinq extends TypeSalad {
  constructor(sourceArray = []) {
    super();
    this.type = 'SaladLinq';
    // Make a copy so we don't mutate the original
    this._data = Array.isArray(sourceArray) ? [...sourceArray] : [];
  }

  where(predicate) {
    this._data = this._data.filter(predicate);
    return this;
  }

  select(selector) {
    this._data = this._data.map(selector);
    return this;
  }

  orderBy(comparer) {
    this._data.sort(comparer);
    return this;
  }

  skip(count) {
    this._data = this._data.slice(count);
    return this;
  }

  take(count) {
    this._data = this._data.slice(0, count);
    return this;
  }

  distinct() {
    const seen = new Set();
    this._data = this._data.filter(item => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
    return this;
  }

  sum() {
    return this._data.reduce((acc, val) => acc + val, 0);
  }

  min() {
    return this._data.length > 0 ? Math.min(...this._data) : undefined;
  }

  max() {
    return this._data.length > 0 ? Math.max(...this._data) : undefined;
  }

  average() {
    return this._data.length > 0 ? this.sum() / this._data.length : 0;
  }

  groupBy(keySelector) {
    const map = new Map();
    for (const item of this._data) {
      const key = keySelector(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, values: v }));
  }

  toArray() {
    return this._data;
  }
}

/***************************************************************
 * 2) The PACKAGE class: SaladLinqPackage
 *    - This is the one System will instantiate (like SaladMath)
 *    - Exposes .newQuery(...) => returns a SaladLinq chainable
 ***************************************************************/
export class SaladLinqPackage extends TypeSalad {
  constructor() {
    super();
    this.type = 'SaladLinqPackage';
  }

  /**
   * newQuery(source) => returns a chainable SaladLinq
   */
  newQuery(sourceArray) {
    return new SaladLinq(sourceArray);
  }
}
