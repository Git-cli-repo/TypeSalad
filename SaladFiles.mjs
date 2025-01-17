import { TypeSalad } from '../TypeSalad.mjs';
import { SaladString, SaladObject } from '../TypeSalad.mjs';

/***************************************************************
 * 1) The MAIN CHAINABLE CLASS: SaladFiles
 *    - Manages typed read/write of files (Node only)
 ***************************************************************/
export class SaladFiles extends TypeSalad {
  constructor() {
    super();
    this.type = 'SaladFiles';

    // We'll store a small reference to the 'fs' module once loaded
    this._fs = null;
    this._initialized = false;
  }

  /**
   * initFS() => loads 'fs' in a Node environment.
   *   - We'll do a dynamic import or require. 
   */
  async initFS() {
    if (this._initialized) return;
    if (typeof process === 'undefined' || typeof process.version === 'undefined') {
      throw new Error("[SaladFiles] Not in a Node environment. File operations won't work.");
    }
    // dynamic import of 'fs'
    const fsMod = await import('node:fs/promises');
    this._fs = fsMod;
    this._initialized = true;
  }

  /**
   * readText(fileName: SaladString) => returns a SaladString with file contents
   */
  async readText(fileName) {
    if (!fileName || fileName.type !== 'String') {
      throw new TypeError(`[SaladFiles] readText expects a SaladString, got '${fileName?.type}'.`);
    }
    await this.initFS();

    const pathStr = fileName.valueOf();
    const content = await this._fs.readFile(pathStr, 'utf8');
    return new SaladString(content);
  }

  /**
   * writeText(fileName: SaladString, content: SaladString)
   *   - Writes a file with the given typed string.
   */
  async writeText(fileName, content) {
    if (!fileName || fileName.type !== 'String') {
      throw new TypeError(`[SaladFiles] writeText expects a SaladString for fileName, got '${fileName?.type}'.`);
    }
    if (!content || content.type !== 'String') {
      throw new TypeError(`[SaladFiles] writeText expects a SaladString for content, got '${content?.type}'.`);
    }
    await this.initFS();

    const pathStr = fileName.valueOf();
    const dataStr = content.valueOf();
    await this._fs.writeFile(pathStr, dataStr, 'utf8');
    console.log(`[SaladFiles] Wrote text file => ${pathStr}`);
  }

  /**
   * readJSON(fileName: SaladString) => returns a SaladObject or SaladArray, depending on the JSON
   */
  async readJSON(fileName) {
    const text = await this.readText(fileName);
    try {
      const parsed = JSON.parse(text.valueOf());
      // We'll convert raw JS object to a typed SaladObject
      return this._convertToTyped(parsed);
    } catch (err) {
      throw new Error(`[SaladFiles] Failed to parse JSON in '${fileName.valueOf()}': ${err.message}`);
    }
  }

  /**
   * writeJSON(fileName: SaladString, typedObj: SaladObject or SaladArray)
   */
  async writeJSON(fileName, typedObj) {
    await this.initFS();
    if (!fileName || fileName.type !== 'String') {
      throw new TypeError(`[SaladFiles] writeJSON expects a SaladString for fileName, got '${fileName?.type}'.`);
    }
    // typedObj could be a SaladObject, SaladArray, etc.
    // We'll do a naive .valueOf() => raw JS, then JSON.stringify
    const raw = typedObj?.valueOf?.() ?? typedObj;
    const dataStr = JSON.stringify(raw, null, 2);
    await this.writeText(fileName, new SaladString(dataStr));
  }

  /**
   * A helper to convert raw JS object/array to typed SaladObject or SaladArray
   */
  async _convertToTyped(value) {
    if (Array.isArray(value)) {
      // Return a typed SaladArray of typed items
      const typedItems = value.map((item) => this._convertToTyped(item));
      // We'll assume we have a SaladArray class available
      const { SaladArray } = await import('../TypeSalad.mjs'); // or do an import at the top
      return new SaladArray(typedItems);
    } else if (typeof value === 'object' && value !== null) {
      // Return a typed SaladObject
      const objData = {};
      for (const key in value) {
        objData[key] = this._convertToTyped(value[key]);
      }
      const { SaladObject } = await import('../TypeSalad.mjs');
      return new SaladObject(objData);
    } else if (typeof value === 'string') {
      // Return a SaladString
      const { SaladString } = await import('../TypeSalad.mjs');
      return new SaladString(value);
    } else {
      // For number, boolean, null, etc. we could create typed wrappers or just return the raw value
      // If you want typed Int, typed Bool, etc., do more logic. For now, let's just return raw for simplicity
      return value;
    }
  }
}

/***************************************************************
 * 2) The PACKAGE class: SaladFilesPackage
 *    - This is the "package" that _System will store in Packages["SaladFiles"]
 ***************************************************************/
export class SaladFilesPackage extends TypeSalad {
  constructor() {
    super();
    this.type = 'SaladFilesPackage';
    this._files = new SaladFiles();
  }

  /**
   * readText(fileName: SaladString) => Promise<SaladString>
   */
  async readText(fileName) {
    return await this._files.readText(fileName);
  }

  /**
   * writeText(fileName: SaladString, content: SaladString)
   */
  async writeText(fileName, content) {
    return await this._files.writeText(fileName, content);
  }

  /**
   * readJSON(fileName: SaladString) => Promise<SaladObject or SaladArray>
   */
  async readJSON(fileName) {
    return await this._files.readJSON(fileName);
  }

  /**
   * writeJSON(fileName: SaladString, typedObj: SaladObject / SaladArray)
   */
  async writeJSON(fileName, typedObj) {
    return await this._files.writeJSON(fileName, typedObj);
  }
}
