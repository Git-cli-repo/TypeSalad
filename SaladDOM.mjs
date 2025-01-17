/***************************************************************
 * SaladDOM.mjs
 *   - Two-class approach: "SaladDOMPackage" + "SaladElement"
 ***************************************************************/
import { TypeSalad } from '../TypeSalad.mjs';
import { SaladString, SaladArray, SaladObject } from '../TypeSalad.mjs';

/***************************************************************
 * 1) The CHAINABLE / MAIN CLASS: SaladElement
 ***************************************************************/
export class SaladElement extends TypeSalad {
  /**
   * @param {string} tagOrName - e.g. "div" or "#text"
   * @param {Node} [domRef]    - If provided, we wrap an existing DOM node
   */
  constructor(tagOrName, domRef = null) {
    super();
    this.type = 'SaladElement';

    if (domRef) {
      // We have an actual DOM node
      this._dom = domRef;

      // Distinguish between ELEMENT_NODE and TEXT_NODE (or others)
      if (domRef.nodeType === Node.ELEMENT_NODE) {
        // e.g. <div>
        this._tagName = domRef.tagName.toLowerCase();
      } else if (domRef.nodeType === Node.TEXT_NODE) {
        // e.g. #text
        this._tagName = '#text';
      } else {
        // Could handle COMMENT_NODE, DOCUMENT_NODE, etc. if you like
        this._tagName = '#unknown';
      }

    } else {
      // Creating a brand-new element
      this._dom = document.createElement(tagOrName);
      this._tagName = tagOrName;
    }
  }

  /** Returns the real DOM reference */
  getDomRef() {
    return this._dom;
  }

  /** For debugging */
  toString() {
    return `[SaladElement <${this._tagName}>]`;
  }

  /**
   * setText(typedStr: SaladString)
   *   - sets .textContent
   */
  setText(typedStr) {
    if (!typedStr || typedStr.type !== 'String') {
      throw new TypeError(`setText expects a SaladString, got '${typedStr?.type}'.`);
    }
    this._dom.textContent = typedStr.valueOf();
    return this;
  }

  /**
   * appendChild(child: SaladElement)
   */
  appendChild(child) {
    if (!child || child.type !== 'SaladElement') {
      throw new TypeError(`appendChild expects a SaladElement, got '${child?.type}'.`);
    }
    this._dom.appendChild(child.getDomRef());
    return this;
  }

  /**
   * removeChild(child: SaladElement)
   */
  removeChild(child) {
    if (!child || child.type !== 'SaladElement') {
      throw new TypeError(`removeChild expects a SaladElement, got '${child?.type}'.`);
    }
    this._dom.removeChild(child.getDomRef());
    return this;
  }

  /**
   * setAttribute(attrName: string, typedVal: SaladString)
   */
  setAttribute(attrName, typedVal) {
    if (typedVal?.type === 'String') {
      this._dom.setAttribute(attrName, typedVal.valueOf());
    } else {
      throw new TypeError(`setAttribute expects a SaladString, got '${typedVal?.type}'.`);
    }
    return this;
  }

  /**
   * getAttribute(attrName: string) => SaladString
   */
  getAttribute(attrName) {
    const val = this._dom.getAttribute(attrName);
    return new SaladString(val ?? '');
  }

  /**
   * addClass(typedClassName: SaladString)
   */
  addClass(typedClassName) {
    if (!typedClassName || typedClassName.type !== 'String') {
      throw new TypeError(`addClass expects a SaladString, got '${typedClassName?.type}'.`);
    }
    this._dom.classList.add(typedClassName.valueOf());
    return this;
  }

  /**
   * removeClass(typedClassName: SaladString)
   */
  removeClass(typedClassName) {
    if (!typedClassName || typedClassName.type !== 'String') {
      throw new TypeError(`removeClass expects a SaladString, got '${typedClassName?.type}'.`);
    }
    this._dom.classList.remove(typedClassName.valueOf());
    return this;
  }

  /**
   * setStyle(typedStyleObj: SaladObject)
   *   - typed style property => typed string for each property
   */
  setStyle(typedStyleObj) {
    if (!typedStyleObj || typedStyleObj.type !== 'Object') {
      throw new TypeError(`setStyle expects a SaladObject, got '${typedStyleObj?.type}'.`);
    }

    const rawObj = typedStyleObj.valueOf(); // normal JS object
    for (const key in rawObj) {
      const val = rawObj[key];
      if (val?.type === 'String') {
        this._dom.style[key] = val.valueOf();
      } else {
        throw new TypeError(`Style property '${key}' must be a SaladString, got '${val?.type}'.`);
      }
    }
    return this;
  }

  /**
   * on(eventName: string, callback)
   *   - typed event approach
   */
  on(eventName, callback) {
    // Optionally ensure eventName is a SaladString
    this._dom.addEventListener(eventName, (ev) => {
      callback(ev);
    });
    return this;
  }

  /**
   * getChildren() => returns a SaladArray of SaladElement
   */
  getChildren() {
    const kids = Array.from(this._dom.children).map(node =>
      new SaladElement(node.tagName.toLowerCase(), node)
    );
    return new SaladArray(kids);
  }
}

/***************************************************************
 * 2) PACKAGE CLASS: SaladDOMPackage
 ***************************************************************/
export class SaladDOMPackage extends TypeSalad {
  constructor() {
    super();
    this.type = 'SaladDOMPackage';
  }

  /**
   * createElement(tagName : SaladString) => SaladElement
   */
  createElement(tagName) {
    if (!tagName || tagName.type !== 'String') {
      throw new TypeError(`createElement expects a SaladString, got '${tagName?.type}'.`);
    }
    return new SaladElement(tagName.valueOf());
  }

  /**
   * createTextNode(typedStr : SaladString)
   *   - If we want typed text nodes. We'll wrap them as a "SaladElement"
   */
  createTextNode(typedStr) {
    if (!typedStr || typedStr.type !== 'String') {
      throw new TypeError(`createTextNode expects a SaladString, got '${typedStr?.type}'.`);
    }
    const textNode = document.createTextNode(typedStr.valueOf());
    // Wrap text node in a SaladElement with #text
    return new SaladElement('#text', textNode);
  }

  /**
   * attachToBody(saladElem : SaladElement)
   */
  attachToBody(saladElem) {
    if (!saladElem || saladElem.type !== 'SaladElement') {
      throw new TypeError(`attachToBody expects a SaladElement, got '${saladElem?.type}'.`);
    }
    document.body.appendChild(saladElem.getDomRef());
  }

  /**
   * querySelector(typedSelector : SaladString)
   */
  querySelector(typedSelector) {
    if (!typedSelector || typedSelector.type !== 'String') {
      throw new TypeError(`querySelector expects a SaladString, got '${typedSelector?.type}'.`);
    }
    const raw = document.querySelector(typedSelector.valueOf());
    if (!raw) return null;
    return new SaladElement(raw.tagName?.toLowerCase() || '#unknown', raw);
  }

  /**
   * querySelectorAll(typedSelector : SaladString)
   *   => returns a SaladArray of SaladElement
   */
  querySelectorAll(typedSelector) {
    if (!typedSelector || typedSelector.type !== 'String') {
      throw new TypeError(`querySelectorAll expects a SaladString, got '${typedSelector?.type}'.`);
    }
    const nodeList = document.querySelectorAll(typedSelector.valueOf());
    const elements = Array.from(nodeList).map(node =>
      new SaladElement(node.tagName?.toLowerCase() || '#unknown', node)
    );
    return new SaladArray(elements);
  }

  /**
   * formToObject(saladFormElem : SaladElement)
   *   - If the underlying DOM node is a <form>, we parse it
   *   - Returns a SaladObject of { fieldName: SaladString(...) }
   */
  formToObject(saladFormElem) {
    if (!saladFormElem || saladFormElem.type !== 'SaladElement') {
      throw new TypeError(`formToObject expects a SaladElement, got '${saladFormElem?.type}'.`);
    }
    const domRef = saladFormElem.getDomRef();
    if (!(domRef instanceof HTMLFormElement)) {
      throw new TypeError("formToObject expects a <form> element.");
    }

    const formData = new FormData(domRef);
    const obj = {};
    for (const [key, val] of formData.entries()) {
      obj[key] = new SaladString(val);
    }
    return new SaladObject(obj);
  }
}
