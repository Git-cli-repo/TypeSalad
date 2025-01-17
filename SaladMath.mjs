// /src/packages/SaladMath.js

import { TypeSalad, SaladInt } from '../TypeSalad.mjs';

/***************************************************************
 * ImagInt: integer-based imaginary number
 ***************************************************************/
export class ImagInt extends TypeSalad {
  /**
   * @param {SaladInt} realPart
   * @param {SaladInt} imagPart
   */
  constructor(realPart, imagPart) {
    super();
    if (realPart?.type !== 'Int' || imagPart?.type !== 'Int') {
      throw new TypeError(
        `ImagInt expects two SaladInt objects. Got (${realPart?.type}, ${imagPart?.type}).`
      );
    }
    this.realPart = realPart; 
    this.imagPart = imagPart; 
    this.type = 'ImagInt';
  }

  toString() {
    const r = this.realPart.valueOf();
    const i = this.imagPart.valueOf();
    const sign = i >= 0 ? '+' : '-';
    const absI = Math.abs(i);
    return `${r} ${sign} ${absI}i`;
  }

  // For partial numeric coercion, return the real part:
  valueOf() {
    return this.realPart.valueOf();
  }
}

/***************************************************************
 * Vector: magnitude & direction in radians
 ***************************************************************/
export class Vector extends TypeSalad {
  /**
   * @param {number|SaladInt} magnitude
   * @param {number|SaladInt} direction (radians)
   */
  constructor(magnitude, direction) {
    super();
    this.magnitude = magnitude;
    this.direction = direction;
    this.type = 'Vector';
  }

  toCartesian() {
    const mag = (this.magnitude?.valueOf?.() ?? this.magnitude);
    const dir = (this.direction?.valueOf?.() ?? this.direction);
    return {
      x: mag * Math.cos(dir),
      y: mag * Math.sin(dir),
    };
  }

  toString() {
    const mag = (this.magnitude?.valueOf?.() ?? this.magnitude);
    const dir = (this.direction?.valueOf?.() ?? this.direction);
    const deg = (dir * 180) / Math.PI;
    return `Vector(mag=${mag.toFixed(2)}, dir=${deg.toFixed(2)}°)`;
  }
}

/***************************************************************
 * SaladMath Package
 ***************************************************************/
export class SaladMath extends TypeSalad {
  constructor() {
    super();
    this.type = 'SaladMath';
    this.ImagInt = ImagInt;
    this.Vector  = Vector;
  }

  ensureInt(value) {
    if (!value || value.type !== 'Int') {
      throw new TypeError(
        `SaladMath expected SaladInt, got '${value?.type}'.`
      );
    }
  }

  ensureImagInt(value) {
    if (!value || value.type !== 'ImagInt') {
      throw new TypeError(
        `SaladMath expected ImagInt, got '${value?.type}'.`
      );
    }
  }

  ensureVector(value) {
    if (!value || value.type !== 'Vector') {
      throw new TypeError(
        `SaladMath expected Vector, got '${value?.type}'.`
      );
    }
  }

  /***************************************************************
   * Basic Int Ops
   ***************************************************************/
  add(a, b) {
    this.ensureInt(a);
    this.ensureInt(b);
    return new SaladInt(a.valueOf() + b.valueOf());
  }

  subtract(a, b) {
    this.ensureInt(a);
    this.ensureInt(b);
    return new SaladInt(a.valueOf() - b.valueOf());
  }

  multiply(a, b) {
    this.ensureInt(a);
    this.ensureInt(b);
    return new SaladInt(a.valueOf() * b.valueOf());
  }

  divide(a, b) {
    this.ensureInt(a);
    this.ensureInt(b);
    if (b.valueOf() === 0) {
      throw new RangeError('Cannot divide by zero.');
    }
    return new SaladInt(a.valueOf() / b.valueOf());
  }

  /***************************************************************
   * ImagInt Ops
   ***************************************************************/
  addImagInt(a, b) {
    this.ensureImagInt(a);
    this.ensureImagInt(b);
    // (a.real + b.real) + (a.imag + b.imag) i
    const realSum = new SaladInt(a.realPart.valueOf() + b.realPart.valueOf());
    const imagSum = new SaladInt(a.imagPart.valueOf() + b.imagPart.valueOf());
    return new ImagInt(realSum, imagSum);
  }

  subImagInt(a, b) {
    this.ensureImagInt(a);
    this.ensureImagInt(b);
    // (a.real - b.real) + (a.imag - b.imag) i
    const realDiff = new SaladInt(a.realPart.valueOf() - b.realPart.valueOf());
    const imagDiff = new SaladInt(a.imagPart.valueOf() - b.imagPart.valueOf());
    return new ImagInt(realDiff, imagDiff);
  }

  /***************************************************************
   * Vector Ops (Polar Addition, for example)
   ***************************************************************/
  addVectors(a, b) {
    this.ensureVector(a);
    this.ensureVector(b);

    const aCart = a.toCartesian();
    const bCart = b.toCartesian();
    const xSum = aCart.x + bCart.x;
    const ySum = aCart.y + bCart.y;

    const newMag = Math.sqrt(xSum * xSum + ySum * ySum);
    const newDir = Math.atan2(ySum, xSum);

    return new Vector(newMag, newDir);
  }
}
