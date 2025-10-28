"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path$1 = require("path");
const fs$2 = require("fs/promises");
const mammoth = require("mammoth");
const PDF2JsonParser = require("pdf2json");
const require$$1 = require("util");
const stream = require("stream");
const require$$3 = require("http");
const require$$4 = require("https");
const require$$0$1 = require("url");
const fs$1 = require("fs");
const require$$8 = require("crypto");
const require$$4$1 = require("assert");
const require$$1$1 = require("tty");
const require$$0$2 = require("os");
const zlib = require("zlib");
const events$1 = require("events");
const module$1 = require("module");
class PDFParser {
  supports(fileType) {
    return fileType.toLowerCase() === ".pdf";
  }
  async parse(buffer, fileName) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDF2JsonParser(null, true);
      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
      });
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          const textPages = [];
          let pageCount = 0;
          if (pdfData.Pages) {
            pageCount = pdfData.Pages.length;
            for (const page of pdfData.Pages) {
              const pageTexts = [];
              if (page.Texts) {
                for (const text2 of page.Texts) {
                  if (text2.R) {
                    for (const run of text2.R) {
                      if (run.T) {
                        pageTexts.push(decodeURIComponent(run.T));
                      }
                    }
                  }
                }
              }
              textPages.push(pageTexts.join(" "));
            }
          }
          const text = textPages.join("\n\n");
          resolve({
            text,
            metadata: {
              fileName,
              fileType: ".pdf",
              pageCount,
              wordCount: text.split(/\s+/).filter((w2) => w2.length > 0).length,
              charCount: text.length
            }
          });
        } catch (error) {
          reject(new Error(`Failed to extract PDF text: ${error.message}`));
        }
      });
      pdfParser.parseBuffer(buffer);
    });
  }
}
class DOCXParser {
  supports(fileType) {
    return [".docx", ".doc"].includes(fileType.toLowerCase());
  }
  async parse(buffer, fileName) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value,
        metadata: {
          fileName,
          fileType: ".docx",
          wordCount: result.value.split(/\s+/).length,
          charCount: result.value.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }
}
class TextParser {
  supports(fileType) {
    return [".txt", ".md", ".markdown"].includes(fileType.toLowerCase());
  }
  async parse(buffer, fileName) {
    try {
      const text = buffer.toString("utf-8");
      return {
        text,
        metadata: {
          fileName,
          fileType: fileName.substring(fileName.lastIndexOf(".")),
          wordCount: text.split(/\s+/).length,
          charCount: text.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse text file: ${error.message}`);
    }
  }
}
class DocumentParserFactory {
  constructor() {
    __publicField(this, "parsers");
    this.parsers = [
      new PDFParser(),
      new DOCXParser(),
      new TextParser()
    ];
  }
  async parse(buffer, fileName) {
    const fileType = fileName.substring(fileName.lastIndexOf("."));
    const parser = this.parsers.find((p2) => p2.supports(fileType));
    if (!parser) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    return parser.parse(buffer, fileName);
  }
  getSupportedFormats() {
    return [".pdf", ".docx", ".doc", ".txt", ".md", ".markdown"];
  }
}
class DocumentService {
  constructor() {
    this.parser = new DocumentParserFactory();
  }
  async parseDocument(buffer, fileName) {
    try {
      const nodeBuffer = Buffer.from(buffer);
      const parsed = await this.parser.parse(nodeBuffer, fileName);
      return parsed;
    } catch (error) {
      console.error("Error parsing document:", error);
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }
  getSupportedFormats() {
    return this.parser.getSupportedFormats();
  }
}
const documentService = new DocumentService();
function bind$2(fn, thisArg) {
  return function wrap2() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag: toStringTag$1 } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type2) => {
  type2 = type2.toLowerCase();
  return (thing) => kindOf(thing) === type2;
};
const typeOfTest = (type2) => (thing) => typeof thing === type2;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer$1(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$2(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString$1 = typeOfTest("string");
const isFunction$2 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag$1 in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer$1(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$2(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$2(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$2(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i2;
  let l2;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i2 = 0, l2 = obj.length; i2 < l2; i2++) {
      fn.call(null, obj[i2], i2, obj);
    }
  } else {
    if (isBuffer$1(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i2 = 0; i2 < len; i2++) {
      key = keys[i2];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer$1(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i2 = keys.length;
  let _key;
  while (i2-- > 0) {
    _key = keys[i2];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i2 = 0, l2 = arguments.length; i2 < l2; i2++) {
    arguments[i2] && forEach(arguments[i2], assignValue);
  }
  return result;
}
const extend = (a2, b2, thisArg, { allOwnKeys } = {}) => {
  forEach(b2, (val, key) => {
    if (thisArg && isFunction$2(val)) {
      a2[key] = bind$2(val, thisArg);
    } else {
      a2[key] = val;
    }
  }, { allOwnKeys });
  return a2;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i2;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i2 = props.length;
    while (i2-- > 0) {
      prop = props[i2];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i2 = thing.length;
  if (!isNumber(i2)) return null;
  const arr = new Array(i2);
  while (i2-- > 0) {
    arr[i2] = thing[i2];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray2) => {
  return (thing) => {
    return TypedArray2 && thing instanceof TypedArray2;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m2, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$2(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$2(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop$1 = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$2(thing.append) && thing[toStringTag$1] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i2) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer$1(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i2] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i2 + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i2] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$2(thing)) && isFunction$2(thing.then) && isFunction$2(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$2(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$2(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer: isBuffer$1,
  isFormData,
  isArrayBufferView,
  isString: isString$1,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$2,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop: noop$1,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var Stream$2 = stream.Stream;
var util$2 = require$$1;
var delayed_stream = DelayedStream$1;
function DelayedStream$1() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;
  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util$2.inherits(DelayedStream$1, Stream$2);
DelayedStream$1.create = function(source, options) {
  var delayedStream = new this();
  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }
  delayedStream.source = source;
  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };
  source.on("error", function() {
  });
  if (delayedStream.pauseStream) {
    source.pause();
  }
  return delayedStream;
};
Object.defineProperty(DelayedStream$1.prototype, "readable", {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});
DelayedStream$1.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream$1.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }
  this.source.resume();
};
DelayedStream$1.prototype.pause = function() {
  this.source.pause();
};
DelayedStream$1.prototype.release = function() {
  this._released = true;
  this._bufferedEvents.forEach((function(args) {
    this.emit.apply(this, args);
  }).bind(this));
  this._bufferedEvents = [];
};
DelayedStream$1.prototype.pipe = function() {
  var r = Stream$2.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};
DelayedStream$1.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }
  if (args[0] === "data") {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }
  this._bufferedEvents.push(args);
};
DelayedStream$1.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  this._maxDataSizeExceeded = true;
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this.emit("error", new Error(message));
};
var util$1 = require$$1;
var Stream$1 = stream.Stream;
var DelayedStream = delayed_stream;
var combined_stream = CombinedStream$1;
function CombinedStream$1() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;
  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util$1.inherits(CombinedStream$1, Stream$1);
CombinedStream$1.create = function(options) {
  var combinedStream = new this();
  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }
  return combinedStream;
};
CombinedStream$1.isStreamLike = function(stream2) {
  return typeof stream2 !== "function" && typeof stream2 !== "string" && typeof stream2 !== "boolean" && typeof stream2 !== "number" && !Buffer.isBuffer(stream2);
};
CombinedStream$1.prototype.append = function(stream2) {
  var isStreamLike = CombinedStream$1.isStreamLike(stream2);
  if (isStreamLike) {
    if (!(stream2 instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream2, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams
      });
      stream2.on("data", this._checkDataSize.bind(this));
      stream2 = newStream;
    }
    this._handleErrors(stream2);
    if (this.pauseStreams) {
      stream2.pause();
    }
  }
  this._streams.push(stream2);
  return this;
};
CombinedStream$1.prototype.pipe = function(dest, options) {
  Stream$1.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};
CombinedStream$1.prototype._getNext = function() {
  this._currentStream = null;
  if (this._insideLoop) {
    this._pendingNext = true;
    return;
  }
  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};
CombinedStream$1.prototype._realGetNext = function() {
  var stream2 = this._streams.shift();
  if (typeof stream2 == "undefined") {
    this.end();
    return;
  }
  if (typeof stream2 !== "function") {
    this._pipeNext(stream2);
    return;
  }
  var getStream = stream2;
  getStream((function(stream3) {
    var isStreamLike = CombinedStream$1.isStreamLike(stream3);
    if (isStreamLike) {
      stream3.on("data", this._checkDataSize.bind(this));
      this._handleErrors(stream3);
    }
    this._pipeNext(stream3);
  }).bind(this));
};
CombinedStream$1.prototype._pipeNext = function(stream2) {
  this._currentStream = stream2;
  var isStreamLike = CombinedStream$1.isStreamLike(stream2);
  if (isStreamLike) {
    stream2.on("end", this._getNext.bind(this));
    stream2.pipe(this, { end: false });
    return;
  }
  var value = stream2;
  this.write(value);
  this._getNext();
};
CombinedStream$1.prototype._handleErrors = function(stream2) {
  var self2 = this;
  stream2.on("error", function(err2) {
    self2._emitError(err2);
  });
};
CombinedStream$1.prototype.write = function(data) {
  this.emit("data", data);
};
CombinedStream$1.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function") this._currentStream.pause();
  this.emit("pause");
};
CombinedStream$1.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function") this._currentStream.resume();
  this.emit("resume");
};
CombinedStream$1.prototype.end = function() {
  this._reset();
  this.emit("end");
};
CombinedStream$1.prototype.destroy = function() {
  this._reset();
  this.emit("close");
};
CombinedStream$1.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};
CombinedStream$1.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this._emitError(new Error(message));
};
CombinedStream$1.prototype._updateDataSize = function() {
  this.dataSize = 0;
  var self2 = this;
  this._streams.forEach(function(stream2) {
    if (!stream2.dataSize) {
      return;
    }
    self2.dataSize += stream2.dataSize;
  });
  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};
CombinedStream$1.prototype._emitError = function(err2) {
  this._reset();
  this.emit("error", err2);
};
var mimeTypes = {};
const require$$0 = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: true
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: true
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: true
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: true
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: [
      "ez"
    ]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: [
      "aw"
    ]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: true
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsat"
    ]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: true
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: false
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/calendar+json": {
    source: "iana",
    compressible: true
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xcs"
    ]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: true
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: true
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: [
      "cdmiq"
    ]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: true
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: true
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: true
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: true
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: true
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: true
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cpl"
    ]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: true
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/csvm+json": {
    source: "iana",
    compressible: true
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: [
      "cu"
    ]
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: true
  },
  "application/dash+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpp"
    ]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "davmount"
    ]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: true
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: true
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: true
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/dssc+der": {
    source: "iana",
    extensions: [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdssc"
    ]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "iana",
    compressible: true,
    extensions: [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: false
  },
  "application/edifact": {
    source: "iana",
    compressible: false
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/elm+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: true
  },
  "application/emma+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: true
  },
  "application/epub+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "epub"
    ]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: true
  },
  "application/express": {
    source: "iana",
    extensions: [
      "exp"
    ]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fdt"
    ]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fido.trusted-apps+json": {
    compressible: true
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: [
      "pfr"
    ]
  },
  "application/font-woff": {
    source: "iana",
    compressible: false
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: true
  },
  "application/geo+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "gml"
    ]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "gpx"
    ]
  },
  "application/gxf": {
    source: "apache",
    extensions: [
      "gxf"
    ]
  },
  "application/gzip": {
    source: "iana",
    compressible: false,
    extensions: [
      "gz"
    ]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: true
  },
  "application/hjson": {
    extensions: [
      "hjson"
    ]
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: [
      "ipfix"
    ]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "its"
    ]
  },
  "application/java-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: false,
    extensions: [
      "ser"
    ]
  },
  "application/java-vm": {
    source: "apache",
    compressible: false,
    extensions: [
      "class"
    ]
  },
  "application/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: true
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: true
  },
  "application/jrd+json": {
    source: "iana",
    compressible: true
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: true
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: [
      "json5"
    ]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: true,
    extensions: [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: true
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: true
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/ld+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lgr"
    ]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: true
  },
  "application/lost+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: false
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: [
      "cpt"
    ]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mads"
    ]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "webmanifest"
    ]
  },
  "application/marc": {
    source: "iana",
    extensions: [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mrcx"
    ]
  },
  "application/mathematica": {
    source: "iana",
    extensions: [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: true
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbox": {
    source: "iana",
    extensions: [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: true
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "meta4"
    ]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mets"
    ]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musd"
    ]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mods"
    ]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    source: "iana",
    extensions: [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: true
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: true
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msword": {
    source: "iana",
    compressible: false,
    extensions: [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    source: "iana",
    compressible: true
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: [
      "mxf"
    ]
  },
  "application/n-quads": {
    source: "iana",
    extensions: [
      "nq"
    ]
  },
  "application/n-triples": {
    source: "iana",
    extensions: [
      "nt"
    ]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: true
  },
  "application/node": {
    source: "iana",
    extensions: [
      "cjs"
    ]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: false,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: [
      "oda"
    ]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: true
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "opf"
    ]
  },
  "application/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "omdoc"
    ]
  },
  "application/onenote": {
    source: "apache",
    extensions: [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: true
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: [
      "oxps"
    ]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: false
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "relo"
    ]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xer"
    ]
  },
  "application/pdf": {
    source: "iana",
    compressible: false,
    extensions: [
      "pdf"
    ]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: false,
    extensions: [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: [
      "asc"
    ]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: [
      "prf"
    ]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pkcs10": {
    source: "iana",
    extensions: [
      "p10"
    ]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: [
      "p7s"
    ]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: [
      "ac"
    ]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: [
      "cer"
    ]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: [
      "pki"
    ]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/postscript": {
    source: "iana",
    compressible: true,
    extensions: [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+xml": {
    source: "iana",
    compressible: true
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: [
      "cww"
    ]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: false
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: true
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: true,
    extensions: [
      "raml"
    ]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: true
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: [
      "rnc"
    ]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: true
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rld"
    ]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: true
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: [
      "mft"
    ]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: [
      "roa"
    ]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rsd"
    ]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rss"
    ]
  },
  "application/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: true
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/sarif+json": {
    source: "iana",
    compressible: true
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: true
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: true
  },
  "application/scim+json": {
    source: "iana",
    compressible: true
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: [
      "spp"
    ]
  },
  "application/sdp": {
    source: "iana",
    extensions: [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: true
  },
  "application/senml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: true
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: true
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: true
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: [
      "setpay"
    ]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: [
      "setreg"
    ]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "shf"
    ]
  },
  "application/sieve": {
    source: "iana",
    extensions: [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: true
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "iana"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: true
  },
  "application/sparql-query": {
    source: "iana",
    extensions: [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "srx"
    ]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: true
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: true
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: [
      "gram"
    ]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "grxml"
    ]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ssml"
    ]
  },
  "application/stix+json": {
    source: "iana",
    compressible: true
  },
  "application/swid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: true
  },
  "application/taxii+json": {
    source: "iana",
    compressible: true
  },
  "application/td+json": {
    source: "iana",
    compressible: true
  },
  "application/tei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: true
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: true,
    extensions: [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: [
      "trig"
    ]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: false,
    extensions: [
      "ubj"
    ]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vcard+json": {
    source: "iana",
    compressible: true
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: true
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: false,
    extensions: [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    source: "iana",
    extensions: [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    source: "iana"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "apk"
    ]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    compressible: false,
    extensions: [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    source: "iana"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: true,
    extensions: [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "iana",
    extensions: [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    source: "iana",
    extensions: [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    source: "iana",
    extensions: [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geo+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geocube+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    compressible: false,
    extensions: [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    compressible: false,
    extensions: [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: false,
    extensions: [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: false,
    extensions: [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "iana"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    source: "iana",
    extensions: [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informix-visionary": {
    source: "iana"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: [
      "sse"
    ]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: false,
    extensions: [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: true,
    extensions: [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-outlook": {
    compressible: false,
    extensions: [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: false,
    extensions: [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: false,
    extensions: [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "iana",
    extensions: [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: false,
    extensions: [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: false,
    extensions: [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: [
      "oth"
    ]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: false,
    extensions: [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: [
      "st"
    ]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: [
      "sema"
    ]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: [
      "semd"
    ]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: [
      "umj"
    ]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    source: "iana"
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: true
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: true,
    extensions: [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: true
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: [
      "wgt"
    ]
  },
  "application/winhlp": {
    source: "apache",
    extensions: [
      "hlp"
    ]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "7z"
    ]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: [
      "ace"
    ]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: [
      "dmg"
    ]
  },
  "application/x-arj": {
    compressible: false,
    extensions: [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: [
      "aas"
    ]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: [
      "torrent"
    ]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz"
    ]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: [
      "cfs"
    ]
  },
  "application/x-chat": {
    source: "apache",
    extensions: [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    extensions: [
      "crx"
    ]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: [
      "cco"
    ]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: [
      "nsc"
    ]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: [
      "cpio"
    ]
  },
  "application/x-csh": {
    source: "apache",
    extensions: [
      "csh"
    ]
  },
  "application/x-deb": {
    compressible: false
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: [
      "dgc"
    ]
  },
  "application/x-director": {
    source: "apache",
    extensions: [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    source: "apache",
    extensions: [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "res"
    ]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: false,
    extensions: [
      "dvi"
    ]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: [
      "evy"
    ]
  },
  "application/x-eva": {
    source: "apache",
    extensions: [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: [
      "gca"
    ]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: [
      "gramps"
    ]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: [
      "gtar"
    ]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    compressible: true,
    extensions: [
      "php"
    ]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: false,
    extensions: [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    compressible: true
  },
  "application/x-keepass2": {
    extensions: [
      "kdbx"
    ]
  },
  "application/x-latex": {
    source: "apache",
    compressible: false,
    extensions: [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    extensions: [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: [
      "run"
    ]
  },
  "application/x-mie": {
    source: "apache",
    extensions: [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    compressible: false
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: [
      "crd"
    ]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    extensions: [
      "exe"
    ]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: [
      "pub"
    ]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: [
      "scd"
    ]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: [
      "trm"
    ]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: [
      "wri"
    ]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: true,
    extensions: [
      "pac"
    ]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: [
      "nzb"
    ]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: false,
    extensions: [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: [
      "ris"
    ]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: [
      "sea"
    ]
  },
  "application/x-sh": {
    source: "apache",
    compressible: true,
    extensions: [
      "sh"
    ]
  },
  "application/x-shar": {
    source: "apache",
    extensions: [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: false,
    extensions: [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: [
      "xap"
    ]
  },
  "application/x-sql": {
    source: "apache",
    extensions: [
      "sql"
    ]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: false,
    extensions: [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: [
      "sitx"
    ]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: [
      "t3"
    ]
  },
  "application/x-tads": {
    source: "apache",
    extensions: [
      "gam"
    ]
  },
  "application/x-tar": {
    source: "apache",
    compressible: true,
    extensions: [
      "tar"
    ]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    source: "apache",
    extensions: [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: [
      "obj"
    ]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    compressible: true,
    extensions: [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    compressible: true,
    extensions: [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    compressible: true,
    extensions: [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    compressible: true,
    extensions: [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: false,
    extensions: [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    compressible: true,
    extensions: [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    compressible: true,
    extensions: [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    compressible: true,
    extensions: [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    compressible: true,
    extensions: [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: true
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: false,
    extensions: [
      "xpi"
    ]
  },
  "application/x-xz": {
    source: "apache",
    extensions: [
      "xz"
    ]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: true
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: true
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: true,
    extensions: [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/xop+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xop"
    ]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xspf"
    ]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    source: "iana",
    extensions: [
      "yang"
    ]
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/yin+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "yin"
    ]
  },
  "application/zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "zip"
    ]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: false,
    extensions: [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana"
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: [
      "adp"
    ]
  },
  "audio/amr": {
    source: "iana",
    extensions: [
      "amr"
    ]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: false,
    extensions: [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: false
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: [
      "mxmf"
    ]
  },
  "audio/mp3": {
    compressible: false,
    extensions: [
      "mp3"
    ]
  },
  "audio/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: [
      "s3m"
    ]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: [
      "sil"
    ]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    compressible: false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: false
  },
  "audio/vorbis": {
    source: "iana",
    compressible: false
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/wave": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "weba"
    ]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: false,
    extensions: [
      "aac"
    ]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: false,
    extensions: [
      "caf"
    ]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: [
      "flac"
    ]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: [
      "ra"
    ]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: [
      "wav"
    ]
  },
  "audio/xm": {
    source: "apache",
    extensions: [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: [
      "cml"
    ]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: [
      "xyz"
    ]
  },
  "font/collection": {
    source: "iana",
    extensions: [
      "ttc"
    ]
  },
  "font/otf": {
    source: "iana",
    compressible: true,
    extensions: [
      "otf"
    ]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttf"
    ]
  },
  "font/woff": {
    source: "iana",
    extensions: [
      "woff"
    ]
  },
  "font/woff2": {
    source: "iana",
    extensions: [
      "woff2"
    ]
  },
  "image/aces": {
    source: "iana",
    extensions: [
      "exr"
    ]
  },
  "image/apng": {
    compressible: false,
    extensions: [
      "apng"
    ]
  },
  "image/avci": {
    source: "iana",
    extensions: [
      "avci"
    ]
  },
  "image/avcs": {
    source: "iana",
    extensions: [
      "avcs"
    ]
  },
  "image/avif": {
    source: "iana",
    compressible: false,
    extensions: [
      "avif"
    ]
  },
  "image/bmp": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/cgm": {
    source: "iana",
    extensions: [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: [
      "drle"
    ]
  },
  "image/emf": {
    source: "iana",
    extensions: [
      "emf"
    ]
  },
  "image/fits": {
    source: "iana",
    extensions: [
      "fits"
    ]
  },
  "image/g3fax": {
    source: "iana",
    extensions: [
      "g3"
    ]
  },
  "image/gif": {
    source: "iana",
    compressible: false,
    extensions: [
      "gif"
    ]
  },
  "image/heic": {
    source: "iana",
    extensions: [
      "heic"
    ]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: [
      "heics"
    ]
  },
  "image/heif": {
    source: "iana",
    extensions: [
      "heif"
    ]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: [
      "heifs"
    ]
  },
  "image/hej2k": {
    source: "iana",
    extensions: [
      "hej2"
    ]
  },
  "image/hsj2": {
    source: "iana",
    extensions: [
      "hsj2"
    ]
  },
  "image/ief": {
    source: "iana",
    extensions: [
      "ief"
    ]
  },
  "image/jls": {
    source: "iana",
    extensions: [
      "jls"
    ]
  },
  "image/jp2": {
    source: "iana",
    compressible: false,
    extensions: [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    source: "iana",
    extensions: [
      "jph"
    ]
  },
  "image/jphc": {
    source: "iana",
    extensions: [
      "jhc"
    ]
  },
  "image/jpm": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpm"
    ]
  },
  "image/jpx": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    source: "iana",
    extensions: [
      "jxr"
    ]
  },
  "image/jxra": {
    source: "iana",
    extensions: [
      "jxra"
    ]
  },
  "image/jxrs": {
    source: "iana",
    extensions: [
      "jxrs"
    ]
  },
  "image/jxs": {
    source: "iana",
    extensions: [
      "jxs"
    ]
  },
  "image/jxsc": {
    source: "iana",
    extensions: [
      "jxsc"
    ]
  },
  "image/jxsi": {
    source: "iana",
    extensions: [
      "jxsi"
    ]
  },
  "image/jxss": {
    source: "iana",
    extensions: [
      "jxss"
    ]
  },
  "image/ktx": {
    source: "iana",
    extensions: [
      "ktx"
    ]
  },
  "image/ktx2": {
    source: "iana",
    extensions: [
      "ktx2"
    ]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: false
  },
  "image/png": {
    source: "iana",
    compressible: false,
    extensions: [
      "png"
    ]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: [
      "btif"
    ]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: [
      "pti"
    ]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: [
      "sgi"
    ]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    source: "iana",
    extensions: [
      "t38"
    ]
  },
  "image/tiff": {
    source: "iana",
    compressible: false,
    extensions: [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: true,
    extensions: [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana"
  },
  "image/vnd.ms-dds": {
    compressible: true,
    extensions: [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: [
      "pcx"
    ]
  },
  "image/webp": {
    source: "apache",
    extensions: [
      "webp"
    ]
  },
  "image/wmf": {
    source: "iana",
    extensions: [
      "wmf"
    ]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: [
      "ras"
    ]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: [
      "cmx"
    ]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    source: "apache",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: [
      "pcx"
    ]
  },
  "image/x-pict": {
    source: "apache",
    extensions: [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: [
      "ppm"
    ]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: [
      "rgb"
    ]
  },
  "image/x-tga": {
    source: "apache",
    extensions: [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: [
      "xbm"
    ]
  },
  "image/x-xcf": {
    compressible: false
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: [
      "xwd"
    ]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    source: "iana",
    extensions: [
      "u8hdr"
    ]
  },
  "message/http": {
    source: "iana",
    compressible: false
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: true
  },
  "message/news": {
    source: "iana"
  },
  "message/partial": {
    source: "iana",
    compressible: false
  },
  "message/rfc822": {
    source: "iana",
    compressible: true,
    extensions: [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    source: "iana"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "iana"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: [
      "wsc"
    ]
  },
  "model/3mf": {
    source: "iana",
    extensions: [
      "3mf"
    ]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: true,
    extensions: [
      "glb"
    ]
  },
  "model/iges": {
    source: "iana",
    compressible: false,
    extensions: [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    source: "iana",
    compressible: false,
    extensions: [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    source: "iana",
    extensions: [
      "mtl"
    ]
  },
  "model/obj": {
    source: "iana",
    extensions: [
      "obj"
    ]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "stpx"
    ]
  },
  "model/step+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpxz"
    ]
  },
  "model/stl": {
    source: "iana",
    extensions: [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: true
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    source: "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: [
      "vtu"
    ]
  },
  "model/vrml": {
    source: "iana",
    compressible: false,
    extensions: [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: false
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: false
  },
  "multipart/form-data": {
    source: "iana",
    compressible: false
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: false
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: false
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: true,
    extensions: [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    source: "iana",
    extensions: [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    compressible: true
  },
  "text/cmd": {
    compressible: true
  },
  "text/coffeescript": {
    extensions: [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "css"
    ]
  },
  "text/csv": {
    source: "iana",
    compressible: true,
    extensions: [
      "csv"
    ]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "iana"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: true,
    extensions: [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    extensions: [
      "jade"
    ]
  },
  "text/javascript": {
    source: "iana",
    compressible: true
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: true,
    extensions: [
      "jsx"
    ]
  },
  "text/less": {
    compressible: true,
    extensions: [
      "less"
    ]
  },
  "text/markdown": {
    source: "iana",
    compressible: true,
    extensions: [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    source: "nginx",
    extensions: [
      "mml"
    ]
  },
  "text/mdx": {
    compressible: true,
    extensions: [
      "mdx"
    ]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "n3"
    ]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: true,
    extensions: [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtx"
    ]
  },
  "text/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: [
      "shex"
    ]
  },
  "text/slim": {
    extensions: [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    source: "iana",
    extensions: [
      "spdx"
    ]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: true,
    extensions: [
      "tsv"
    ]
  },
  "text/troff": {
    source: "iana",
    extensions: [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "ttl"
    ]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: true,
    extensions: [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    source: "iana",
    compressible: true,
    extensions: [
      "vcard"
    ]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: [
      "flx"
    ]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: [
      "gv"
    ]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "iana"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: [
      "wmls"
    ]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "vtt"
    ]
  },
  "text/x-asm": {
    source: "apache",
    extensions: [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    source: "apache",
    extensions: [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    source: "nginx",
    extensions: [
      "htc"
    ]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    compressible: true
  },
  "text/x-handlebars-template": {
    extensions: [
      "hbs"
    ]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    compressible: true
  },
  "text/x-lua": {
    extensions: [
      "lua"
    ]
  },
  "text/x-markdown": {
    compressible: true,
    extensions: [
      "mkd"
    ]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: [
      "nfo"
    ]
  },
  "text/x-opml": {
    source: "apache",
    extensions: [
      "opml"
    ]
  },
  "text/x-org": {
    compressible: true,
    extensions: [
      "org"
    ]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    compressible: true,
    extensions: [
      "pde"
    ]
  },
  "text/x-sass": {
    extensions: [
      "sass"
    ]
  },
  "text/x-scss": {
    extensions: [
      "scss"
    ]
  },
  "text/x-setext": {
    source: "apache",
    extensions: [
      "etx"
    ]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    compressible: true,
    extensions: [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: [
      "vcs"
    ]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: [
      "vcf"
    ]
  },
  "text/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: true,
    extensions: [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: [
      "3g2"
    ]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: [
      "h261"
    ]
  },
  "video/h263": {
    source: "iana",
    extensions: [
      "h263"
    ]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: [
      "m4s"
    ]
  },
  "video/jpeg": {
    source: "iana",
    extensions: [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: [
      "ts"
    ]
  },
  "video/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogv"
    ]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: false,
    extensions: [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "webm"
    ]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: [
      "f4v"
    ]
  },
  "video/x-fli": {
    source: "apache",
    extensions: [
      "fli"
    ]
  },
  "video/x-flv": {
    source: "apache",
    compressible: false,
    extensions: [
      "flv"
    ]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: [
      "m4v"
    ]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: false,
    extensions: [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    source: "apache",
    extensions: [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: false,
    extensions: [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: [
      "movie"
    ]
  },
  "video/x-smv": {
    source: "apache",
    extensions: [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    compressible: true
  },
  "x-shader/x-vertex": {
    compressible: true
  }
};
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
var mimeDb = require$$0;
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
(function(exports2) {
  var db = mimeDb;
  var extname = path$1.extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports2.charset = charset;
  exports2.charsets = { lookup: charset };
  exports2.contentType = contentType;
  exports2.extension = extension;
  exports2.extensions = /* @__PURE__ */ Object.create(null);
  exports2.lookup = lookup;
  exports2.types = /* @__PURE__ */ Object.create(null);
  populateMaps(exports2.extensions, exports2.types);
  function charset(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var mime2 = match && db[match[1].toLowerCase()];
    if (mime2 && mime2.charset) {
      return mime2.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime2 = str.indexOf("/") === -1 ? exports2.lookup(str) : str;
    if (!mime2) {
      return false;
    }
    if (mime2.indexOf("charset") === -1) {
      var charset2 = exports2.charset(mime2);
      if (charset2) mime2 += "; charset=" + charset2.toLowerCase();
    }
    return mime2;
  }
  function extension(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var exts = match && exports2.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path2) {
    if (!path2 || typeof path2 !== "string") {
      return false;
    }
    var extension2 = extname("x." + path2).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports2.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", void 0, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type2) {
      var mime2 = db[type2];
      var exts = mime2.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type2] = exts;
      for (var i2 = 0; i2 < exts.length; i2++) {
        var extension2 = exts[i2];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime2.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type2;
      }
    });
  }
})(mimeTypes);
var defer_1 = defer$1;
function defer$1(fn) {
  var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
  if (nextTick) {
    nextTick(fn);
  } else {
    setTimeout(fn, 0);
  }
}
var defer = defer_1;
var async_1 = async$2;
function async$2(callback) {
  var isAsync = false;
  defer(function() {
    isAsync = true;
  });
  return function async_callback(err2, result) {
    if (isAsync) {
      callback(err2, result);
    } else {
      defer(function nextTick_callback() {
        callback(err2, result);
      });
    }
  };
}
var abort_1 = abort$2;
function abort$2(state2) {
  Object.keys(state2.jobs).forEach(clean.bind(state2));
  state2.jobs = {};
}
function clean(key) {
  if (typeof this.jobs[key] == "function") {
    this.jobs[key]();
  }
}
var async$1 = async_1, abort$1 = abort_1;
var iterate_1 = iterate$2;
function iterate$2(list, iterator2, state2, callback) {
  var key = state2["keyedList"] ? state2["keyedList"][state2.index] : state2.index;
  state2.jobs[key] = runJob(iterator2, key, list[key], function(error, output) {
    if (!(key in state2.jobs)) {
      return;
    }
    delete state2.jobs[key];
    if (error) {
      abort$1(state2);
    } else {
      state2.results[key] = output;
    }
    callback(error, state2.results);
  });
}
function runJob(iterator2, key, item, callback) {
  var aborter;
  if (iterator2.length == 2) {
    aborter = iterator2(item, async$1(callback));
  } else {
    aborter = iterator2(item, key, async$1(callback));
  }
  return aborter;
}
var state_1 = state;
function state(list, sortMethod) {
  var isNamedList = !Array.isArray(list), initState2 = {
    index: 0,
    keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
    jobs: {},
    results: isNamedList ? {} : [],
    size: isNamedList ? Object.keys(list).length : list.length
  };
  if (sortMethod) {
    initState2.keyedList.sort(isNamedList ? sortMethod : function(a2, b2) {
      return sortMethod(list[a2], list[b2]);
    });
  }
  return initState2;
}
var abort = abort_1, async = async_1;
var terminator_1 = terminator$2;
function terminator$2(callback) {
  if (!Object.keys(this.jobs).length) {
    return;
  }
  this.index = this.size;
  abort(this);
  async(callback)(null, this.results);
}
var iterate$1 = iterate_1, initState$1 = state_1, terminator$1 = terminator_1;
var parallel_1 = parallel;
function parallel(list, iterator2, callback) {
  var state2 = initState$1(list);
  while (state2.index < (state2["keyedList"] || list).length) {
    iterate$1(list, iterator2, state2, function(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      if (Object.keys(state2.jobs).length === 0) {
        callback(null, state2.results);
        return;
      }
    });
    state2.index++;
  }
  return terminator$1.bind(state2, callback);
}
var serialOrdered$2 = { exports: {} };
var iterate = iterate_1, initState = state_1, terminator = terminator_1;
serialOrdered$2.exports = serialOrdered$1;
serialOrdered$2.exports.ascending = ascending;
serialOrdered$2.exports.descending = descending;
function serialOrdered$1(list, iterator2, sortMethod, callback) {
  var state2 = initState(list, sortMethod);
  iterate(list, iterator2, state2, function iteratorHandler(error, result) {
    if (error) {
      callback(error, result);
      return;
    }
    state2.index++;
    if (state2.index < (state2["keyedList"] || list).length) {
      iterate(list, iterator2, state2, iteratorHandler);
      return;
    }
    callback(null, state2.results);
  });
  return terminator.bind(state2, callback);
}
function ascending(a2, b2) {
  return a2 < b2 ? -1 : a2 > b2 ? 1 : 0;
}
function descending(a2, b2) {
  return -1 * ascending(a2, b2);
}
var serialOrderedExports = serialOrdered$2.exports;
var serialOrdered = serialOrderedExports;
var serial_1 = serial;
function serial(list, iterator2, callback) {
  return serialOrdered(list, iterator2, null, callback);
}
var asynckit$1 = {
  parallel: parallel_1,
  serial: serial_1,
  serialOrdered: serialOrderedExports
};
var esObjectAtoms = Object;
var esErrors = Error;
var _eval = EvalError;
var range = RangeError;
var ref = ReferenceError;
var syntax = SyntaxError;
var type = TypeError;
var uri = URIError;
var abs$1 = Math.abs;
var floor$1 = Math.floor;
var max$3 = Math.max;
var min$1 = Math.min;
var pow$1 = Math.pow;
var round$1 = Math.round;
var _isNaN = Number.isNaN || function isNaN2(a2) {
  return a2 !== a2;
};
var $isNaN = _isNaN;
var sign$1 = function sign(number) {
  if ($isNaN(number) || number === 0) {
    return number;
  }
  return number < 0 ? -1 : 1;
};
var gOPD = Object.getOwnPropertyDescriptor;
var $gOPD$1 = gOPD;
if ($gOPD$1) {
  try {
    $gOPD$1([], "length");
  } catch (e) {
    $gOPD$1 = null;
  }
}
var gopd = $gOPD$1;
var $defineProperty$2 = Object.defineProperty || false;
if ($defineProperty$2) {
  try {
    $defineProperty$2({}, "a", { value: 1 });
  } catch (e) {
    $defineProperty$2 = false;
  }
}
var esDefineProperty = $defineProperty$2;
var shams$1;
var hasRequiredShams$1;
function requireShams$1() {
  if (hasRequiredShams$1) return shams$1;
  hasRequiredShams$1 = 1;
  shams$1 = function hasSymbols2() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _2 in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(obj, sym)
      );
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
  return shams$1;
}
var hasSymbols$1;
var hasRequiredHasSymbols;
function requireHasSymbols() {
  if (hasRequiredHasSymbols) return hasSymbols$1;
  hasRequiredHasSymbols = 1;
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = requireShams$1();
  hasSymbols$1 = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
  return hasSymbols$1;
}
var Reflect_getPrototypeOf;
var hasRequiredReflect_getPrototypeOf;
function requireReflect_getPrototypeOf() {
  if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
  hasRequiredReflect_getPrototypeOf = 1;
  Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  return Reflect_getPrototypeOf;
}
var Object_getPrototypeOf;
var hasRequiredObject_getPrototypeOf;
function requireObject_getPrototypeOf() {
  if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
  hasRequiredObject_getPrototypeOf = 1;
  var $Object2 = esObjectAtoms;
  Object_getPrototypeOf = $Object2.getPrototypeOf || null;
  return Object_getPrototypeOf;
}
var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
var toStr = Object.prototype.toString;
var max$2 = Math.max;
var funcType = "[object Function]";
var concatty = function concatty2(a2, b2) {
  var arr = [];
  for (var i2 = 0; i2 < a2.length; i2 += 1) {
    arr[i2] = a2[i2];
  }
  for (var j2 = 0; j2 < b2.length; j2 += 1) {
    arr[j2 + a2.length] = b2[j2];
  }
  return arr;
};
var slicy = function slicy2(arrLike, offset) {
  var arr = [];
  for (var i2 = offset, j2 = 0; i2 < arrLike.length; i2 += 1, j2 += 1) {
    arr[j2] = arrLike[i2];
  }
  return arr;
};
var joiny = function(arr, joiner) {
  var str = "";
  for (var i2 = 0; i2 < arr.length; i2 += 1) {
    str += arr[i2];
    if (i2 + 1 < arr.length) {
      str += joiner;
    }
  }
  return str;
};
var implementation$1 = function bind(that) {
  var target = this;
  if (typeof target !== "function" || toStr.apply(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }
  var args = slicy(arguments, 1);
  var bound;
  var binder = function() {
    if (this instanceof bound) {
      var result = target.apply(
        this,
        concatty(args, arguments)
      );
      if (Object(result) === result) {
        return result;
      }
      return this;
    }
    return target.apply(
      that,
      concatty(args, arguments)
    );
  };
  var boundLength = max$2(0, target.length - args.length);
  var boundArgs = [];
  for (var i2 = 0; i2 < boundLength; i2++) {
    boundArgs[i2] = "$" + i2;
  }
  bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
  if (target.prototype) {
    var Empty = function Empty2() {
    };
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }
  return bound;
};
var implementation = implementation$1;
var functionBind = Function.prototype.bind || implementation;
var functionCall;
var hasRequiredFunctionCall;
function requireFunctionCall() {
  if (hasRequiredFunctionCall) return functionCall;
  hasRequiredFunctionCall = 1;
  functionCall = Function.prototype.call;
  return functionCall;
}
var functionApply;
var hasRequiredFunctionApply;
function requireFunctionApply() {
  if (hasRequiredFunctionApply) return functionApply;
  hasRequiredFunctionApply = 1;
  functionApply = Function.prototype.apply;
  return functionApply;
}
var reflectApply;
var hasRequiredReflectApply;
function requireReflectApply() {
  if (hasRequiredReflectApply) return reflectApply;
  hasRequiredReflectApply = 1;
  reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  return reflectApply;
}
var actualApply;
var hasRequiredActualApply;
function requireActualApply() {
  if (hasRequiredActualApply) return actualApply;
  hasRequiredActualApply = 1;
  var bind3 = functionBind;
  var $apply2 = requireFunctionApply();
  var $call2 = requireFunctionCall();
  var $reflectApply = requireReflectApply();
  actualApply = $reflectApply || bind3.call($call2, $apply2);
  return actualApply;
}
var callBindApplyHelpers;
var hasRequiredCallBindApplyHelpers;
function requireCallBindApplyHelpers() {
  if (hasRequiredCallBindApplyHelpers) return callBindApplyHelpers;
  hasRequiredCallBindApplyHelpers = 1;
  var bind3 = functionBind;
  var $TypeError2 = type;
  var $call2 = requireFunctionCall();
  var $actualApply = requireActualApply();
  callBindApplyHelpers = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError2("a function is required");
    }
    return $actualApply(bind3, $call2, args);
  };
  return callBindApplyHelpers;
}
var get;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get;
  hasRequiredGet = 1;
  var callBind = requireCallBindApplyHelpers();
  var gOPD2 = gopd;
  var hasProtoAccessor;
  try {
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD2 && gOPD2(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  );
  var $Object2 = Object;
  var $getPrototypeOf = $Object2.getPrototypeOf;
  get = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
    /** @type {import('./get')} */
    function getDunder(value) {
      return $getPrototypeOf(value == null ? value : $Object2(value));
    }
  ) : false;
  return get;
}
var getProto$1;
var hasRequiredGetProto;
function requireGetProto() {
  if (hasRequiredGetProto) return getProto$1;
  hasRequiredGetProto = 1;
  var reflectGetProto = requireReflect_getPrototypeOf();
  var originalGetProto = requireObject_getPrototypeOf();
  var getDunderProto = requireGet();
  getProto$1 = reflectGetProto ? function getProto2(O2) {
    return reflectGetProto(O2);
  } : originalGetProto ? function getProto2(O2) {
    if (!O2 || typeof O2 !== "object" && typeof O2 !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O2);
  } : getDunderProto ? function getProto2(O2) {
    return getDunderProto(O2);
  } : null;
  return getProto$1;
}
var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind$1 = functionBind;
var hasown = bind$1.call(call, $hasOwn);
var undefined$1;
var $Object = esObjectAtoms;
var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError = syntax;
var $TypeError$1 = type;
var $URIError = uri;
var abs = abs$1;
var floor = floor$1;
var max$1 = max$3;
var min = min$1;
var pow = pow$1;
var round = round$1;
var sign2 = sign$1;
var $Function = Function;
var getEvalledConstructor = function(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
  } catch (e) {
  }
};
var $gOPD = gopd;
var $defineProperty$1 = esDefineProperty;
var throwTypeError = function() {
  throw new $TypeError$1();
};
var ThrowTypeError = $gOPD ? function() {
  try {
    arguments.callee;
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD(arguments, "callee").get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols = requireHasSymbols()();
var getProto = requireGetProto();
var $ObjectGPO = requireObject_getPrototypeOf();
var $ReflectGPO = requireReflect_getPrototypeOf();
var $apply = requireFunctionApply();
var $call = requireFunctionCall();
var needsEval = {};
var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined$1 : getProto(Uint8Array);
var INTRINSICS = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
  "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
  "%AsyncFromSyncIteratorPrototype%": undefined$1,
  "%AsyncFunction%": needsEval,
  "%AsyncGenerator%": needsEval,
  "%AsyncGeneratorFunction%": needsEval,
  "%AsyncIteratorPrototype%": needsEval,
  "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
  "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": $Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $EvalError,
  "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
  "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
  "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
  "%Function%": $Function,
  "%GeneratorFunction%": needsEval,
  "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
  "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
  "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
  "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
  "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": $Object,
  "%Object.getOwnPropertyDescriptor%": $gOPD,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
  "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
  "%RangeError%": $RangeError,
  "%ReferenceError%": $ReferenceError,
  "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined$1,
  "%Symbol%": hasSymbols ? Symbol : undefined$1,
  "%SyntaxError%": $SyntaxError,
  "%ThrowTypeError%": ThrowTypeError,
  "%TypedArray%": TypedArray,
  "%TypeError%": $TypeError$1,
  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
  "%URIError%": $URIError,
  "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
  "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
  "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
  "%Function.prototype.call%": $call,
  "%Function.prototype.apply%": $apply,
  "%Object.defineProperty%": $defineProperty$1,
  "%Object.getPrototypeOf%": $ObjectGPO,
  "%Math.abs%": abs,
  "%Math.floor%": floor,
  "%Math.max%": max$1,
  "%Math.min%": min,
  "%Math.pow%": pow,
  "%Math.round%": round,
  "%Math.sign%": sign2,
  "%Reflect.getPrototypeOf%": $ReflectGPO
};
if (getProto) {
  try {
    null.error;
  } catch (e) {
    var errorProto = getProto(getProto(e));
    INTRINSICS["%Error.prototype%"] = errorProto;
  }
}
var doEval = function doEval2(name) {
  var value;
  if (name === "%AsyncFunction%") {
    value = getEvalledConstructor("async function () {}");
  } else if (name === "%GeneratorFunction%") {
    value = getEvalledConstructor("function* () {}");
  } else if (name === "%AsyncGeneratorFunction%") {
    value = getEvalledConstructor("async function* () {}");
  } else if (name === "%AsyncGenerator%") {
    var fn = doEval2("%AsyncGeneratorFunction%");
    if (fn) {
      value = fn.prototype;
    }
  } else if (name === "%AsyncIteratorPrototype%") {
    var gen = doEval2("%AsyncGenerator%");
    if (gen && getProto) {
      value = getProto(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
};
var bind2 = functionBind;
var hasOwn$2 = hasown;
var $concat = bind2.call($call, Array.prototype.concat);
var $spliceApply = bind2.call($apply, Array.prototype.splice);
var $replace = bind2.call($call, String.prototype.replace);
var $strSlice = bind2.call($call, String.prototype.slice);
var $exec = bind2.call($call, RegExp.prototype.exec);
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = function stringToPath2(string) {
  var first = $strSlice(string, 0, 1);
  var last = $strSlice(string, -1);
  if (first === "%" && last !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
  } else if (last === "%" && first !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
  }
  var result = [];
  $replace(string, rePropName, function(match, number, quote, subString) {
    result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
  });
  return result;
};
var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn$2(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = "%" + alias[0] + "%";
  }
  if (hasOwn$2(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === "undefined" && !allowMissing) {
      throw new $TypeError$1("intrinsic " + name + " exists, but is not available. Please file an issue!");
    }
    return {
      alias,
      name: intrinsicName,
      value
    };
  }
  throw new $SyntaxError("intrinsic " + name + " does not exist!");
};
var getIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== "string" || name.length === 0) {
    throw new $TypeError$1("intrinsic name must be a non-empty string");
  }
  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
    throw new $TypeError$1('"allowMissing" argument must be a boolean');
  }
  if ($exec(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  }
  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }
  for (var i2 = 1, isOwn = true; i2 < parts.length; i2 += 1) {
    var part = parts[i2];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
      throw new $SyntaxError("property names with quotes must have matching quotes");
    }
    if (part === "constructor" || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += "." + part;
    intrinsicRealName = "%" + intrinsicBaseName + "%";
    if (hasOwn$2(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError$1("base intrinsic for " + name + " exists, but the property is not available.");
        }
        return void 0;
      }
      if ($gOPD && i2 + 1 >= parts.length) {
        var desc = $gOPD(value, part);
        isOwn = !!desc;
        if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn$2(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
var shams;
var hasRequiredShams;
function requireShams() {
  if (hasRequiredShams) return shams;
  hasRequiredShams = 1;
  var hasSymbols2 = requireShams$1();
  shams = function hasToStringTagShams() {
    return hasSymbols2() && !!Symbol.toStringTag;
  };
  return shams;
}
var GetIntrinsic2 = getIntrinsic;
var $defineProperty = GetIntrinsic2("%Object.defineProperty%", true);
var hasToStringTag = requireShams()();
var hasOwn$1 = hasown;
var $TypeError = type;
var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
var esSetTostringtag = function setToStringTag(object, value) {
  var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
  var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
  if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
    throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
  }
  if (toStringTag && (overrideIfSet || !hasOwn$1(object, toStringTag))) {
    if ($defineProperty) {
      $defineProperty(object, toStringTag, {
        configurable: !nonConfigurable,
        enumerable: false,
        value,
        writable: false
      });
    } else {
      object[toStringTag] = value;
    }
  }
};
var populate$1 = function(dst, src2) {
  Object.keys(src2).forEach(function(prop) {
    dst[prop] = dst[prop] || src2[prop];
  });
  return dst;
};
var CombinedStream = combined_stream;
var util = require$$1;
var path = path$1;
var http$1 = require$$3;
var https$1 = require$$4;
var parseUrl$2 = require$$0$1.parse;
var fs = fs$1;
var Stream = stream.Stream;
var crypto = require$$8;
var mime = mimeTypes;
var asynckit = asynckit$1;
var setToStringTag2 = esSetTostringtag;
var hasOwn = hasown;
var populate = populate$1;
function FormData$1(options) {
  if (!(this instanceof FormData$1)) {
    return new FormData$1(options);
  }
  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];
  CombinedStream.call(this);
  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}
util.inherits(FormData$1, CombinedStream);
FormData$1.LINE_BREAK = "\r\n";
FormData$1.DEFAULT_CONTENT_TYPE = "application/octet-stream";
FormData$1.prototype.append = function(field, value, options) {
  options = options || {};
  if (typeof options === "string") {
    options = { filename: options };
  }
  var append2 = CombinedStream.prototype.append.bind(this);
  if (typeof value === "number" || value == null) {
    value = String(value);
  }
  if (Array.isArray(value)) {
    this._error(new Error("Arrays are not supported."));
    return;
  }
  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();
  append2(header);
  append2(value);
  append2(footer);
  this._trackLength(header, value, options);
};
FormData$1.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;
  if (options.knownLength != null) {
    valueLength += Number(options.knownLength);
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === "string") {
    valueLength = Buffer.byteLength(value);
  }
  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData$1.LINE_BREAK.length;
  if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
    return;
  }
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};
FormData$1.prototype._lengthRetriever = function(value, callback) {
  if (hasOwn(value, "fd")) {
    if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
      callback(null, value.end + 1 - (value.start ? value.start : 0));
    } else {
      fs.stat(value.path, function(err2, stat) {
        if (err2) {
          callback(err2);
          return;
        }
        var fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }
  } else if (hasOwn(value, "httpVersion")) {
    callback(null, Number(value.headers["content-length"]));
  } else if (hasOwn(value, "httpModule")) {
    value.on("response", function(response) {
      value.pause();
      callback(null, Number(response.headers["content-length"]));
    });
    value.resume();
  } else {
    callback("Unknown stream");
  }
};
FormData$1.prototype._multiPartHeader = function(field, value, options) {
  if (typeof options.header === "string") {
    return options.header;
  }
  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);
  var contents = "";
  var headers = {
    // add custom disposition as third element or keep it two elements if not
    "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    "Content-Type": [].concat(contentType || [])
  };
  if (typeof options.header === "object") {
    populate(headers, options.header);
  }
  var header;
  for (var prop in headers) {
    if (hasOwn(headers, prop)) {
      header = headers[prop];
      if (header == null) {
        continue;
      }
      if (!Array.isArray(header)) {
        header = [header];
      }
      if (header.length) {
        contents += prop + ": " + header.join("; ") + FormData$1.LINE_BREAK;
      }
    }
  }
  return "--" + this.getBoundary() + FormData$1.LINE_BREAK + contents + FormData$1.LINE_BREAK;
};
FormData$1.prototype._getContentDisposition = function(value, options) {
  var filename;
  if (typeof options.filepath === "string") {
    filename = path.normalize(options.filepath).replace(/\\/g, "/");
  } else if (options.filename || value && (value.name || value.path)) {
    filename = path.basename(options.filename || value && (value.name || value.path));
  } else if (value && value.readable && hasOwn(value, "httpVersion")) {
    filename = path.basename(value.client._httpMessage.path || "");
  }
  if (filename) {
    return 'filename="' + filename + '"';
  }
};
FormData$1.prototype._getContentType = function(value, options) {
  var contentType = options.contentType;
  if (!contentType && value && value.name) {
    contentType = mime.lookup(value.name);
  }
  if (!contentType && value && value.path) {
    contentType = mime.lookup(value.path);
  }
  if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
    contentType = value.headers["content-type"];
  }
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }
  if (!contentType && value && typeof value === "object") {
    contentType = FormData$1.DEFAULT_CONTENT_TYPE;
  }
  return contentType;
};
FormData$1.prototype._multiPartFooter = function() {
  return (function(next) {
    var footer = FormData$1.LINE_BREAK;
    var lastPart = this._streams.length === 0;
    if (lastPart) {
      footer += this._lastBoundary();
    }
    next(footer);
  }).bind(this);
};
FormData$1.prototype._lastBoundary = function() {
  return "--" + this.getBoundary() + "--" + FormData$1.LINE_BREAK;
};
FormData$1.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    "content-type": "multipart/form-data; boundary=" + this.getBoundary()
  };
  for (header in userHeaders) {
    if (hasOwn(userHeaders, header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }
  return formHeaders;
};
FormData$1.prototype.setBoundary = function(boundary) {
  if (typeof boundary !== "string") {
    throw new TypeError("FormData boundary must be a string");
  }
  this._boundary = boundary;
};
FormData$1.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};
FormData$1.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc(0);
  var boundary = this.getBoundary();
  for (var i2 = 0, len = this._streams.length; i2 < len; i2++) {
    if (typeof this._streams[i2] !== "function") {
      if (Buffer.isBuffer(this._streams[i2])) {
        dataBuffer = Buffer.concat([dataBuffer, this._streams[i2]]);
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i2])]);
      }
      if (typeof this._streams[i2] !== "string" || this._streams[i2].substring(2, boundary.length + 2) !== boundary) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData$1.LINE_BREAK)]);
      }
    }
  }
  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};
FormData$1.prototype._generateBoundary = function() {
  this._boundary = "--------------------------" + crypto.randomBytes(12).toString("hex");
};
FormData$1.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this.hasKnownLength()) {
    this._error(new Error("Cannot calculate proper length in synchronous way."));
  }
  return knownLength;
};
FormData$1.prototype.hasKnownLength = function() {
  var hasKnownLength = true;
  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }
  return hasKnownLength;
};
FormData$1.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }
  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err2, values) {
    if (err2) {
      cb(err2);
      return;
    }
    values.forEach(function(length) {
      knownLength += length;
    });
    cb(null, knownLength);
  });
};
FormData$1.prototype.submit = function(params, cb) {
  var request;
  var options;
  var defaults2 = { method: "post" };
  if (typeof params === "string") {
    params = parseUrl$2(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults2);
  } else {
    options = populate(params, defaults2);
    if (!options.port) {
      options.port = options.protocol === "https:" ? 443 : 80;
    }
  }
  options.headers = this.getHeaders(params.headers);
  if (options.protocol === "https:") {
    request = https$1.request(options);
  } else {
    request = http$1.request(options);
  }
  this.getLength((function(err2, length) {
    if (err2 && err2 !== "Unknown stream") {
      this._error(err2);
      return;
    }
    if (length) {
      request.setHeader("Content-Length", length);
    }
    this.pipe(request);
    if (cb) {
      var onResponse;
      var callback = function(error, responce) {
        request.removeListener("error", callback);
        request.removeListener("response", onResponse);
        return cb.call(this, error, responce);
      };
      onResponse = callback.bind(this, null);
      request.on("error", callback);
      request.on("response", onResponse);
    }
  }).bind(this));
  return request;
};
FormData$1.prototype._error = function(err2) {
  if (!this.error) {
    this.error = err2;
    this.pause();
    this.emit("error", err2);
  }
};
FormData$1.prototype.toString = function() {
  return "[object FormData]";
};
setToStringTag2(FormData$1, "FormData");
var form_data = FormData$1;
const FormData$2 = /* @__PURE__ */ getDefaultExportFromCjs(form_data);
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path2, key, dots) {
  if (!path2) return key;
  return path2.concat(key).map(function each(token, i2) {
    token = removeBrackets(token);
    return !dots && i2 ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData$2 || FormData)();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path2) {
    let arr = value;
    if (value && !path2 && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path2, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path2) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path2.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path2,
        exposedHelpers
      );
      if (result === true) {
        build(el, path2 ? path2.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url2, params, options) {
  if (!params) {
    return url2;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url2.indexOf("#");
    if (hashmarkIndex !== -1) {
      url2 = url2.slice(0, hashmarkIndex);
    }
    url2 += (url2.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url2;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h2) {
      if (h2 !== null) {
        fn(h2);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams = require$$0$1.URLSearchParams;
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  const randomValues = new Uint32Array(size);
  require$$8.randomFillSync(randomValues);
  for (let i2 = 0; i2 < size; i2++) {
    str += alphabet[randomValues[i2] % length];
  }
  return str;
};
const platform$1 = {
  isNode: true,
  classes: {
    URLSearchParams,
    FormData: FormData$2,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  ALPHABET,
  generateString,
  protocols: ["http", "https", "file", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path2, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i2;
  const len = keys.length;
  let key;
  for (i2 = 0; i2 < len; i2++) {
    key = keys[i2];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path2, value, target, index) {
    let name = path2[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path2.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path2, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i2;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i2 = line.indexOf(":");
    key = line.substring(0, i2).trim().toLowerCase();
    val = line.substring(i2 + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w2, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i2 = keys.length;
    let deleted = false;
    while (i2--) {
      const key = keys[i2];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var proxyFromEnv = {};
var parseUrl$1 = require$$0$1.parse;
var DEFAULT_PORTS = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s2) {
  return s2.length <= this.length && this.indexOf(s2, this.length - s2.length) !== -1;
};
function getProxyForUrl(url2) {
  var parsedUrl = typeof url2 === "string" ? parseUrl$1(url2) : url2 || {};
  var proto = parsedUrl.protocol;
  var hostname = parsedUrl.host;
  var port = parsedUrl.port;
  if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
    return "";
  }
  proto = proto.split(":", 1)[0];
  hostname = hostname.replace(/:\d*$/, "");
  port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
  if (!shouldProxy(hostname, port)) {
    return "";
  }
  var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
  if (proxy && proxy.indexOf("://") === -1) {
    proxy = proto + "://" + proxy;
  }
  return proxy;
}
function shouldProxy(hostname, port) {
  var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
  if (!NO_PROXY) {
    return true;
  }
  if (NO_PROXY === "*") {
    return false;
  }
  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) {
      return true;
    }
    var parsedProxy = proxy.match(/^(.+):(\d+)$/);
    var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
    var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
    if (parsedProxyPort && parsedProxyPort !== port) {
      return true;
    }
    if (!/^[.*]/.test(parsedProxyHostname)) {
      return hostname !== parsedProxyHostname;
    }
    if (parsedProxyHostname.charAt(0) === "*") {
      parsedProxyHostname = parsedProxyHostname.slice(1);
    }
    return !stringEndsWith.call(hostname, parsedProxyHostname);
  });
}
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
}
proxyFromEnv.getProxyForUrl = getProxyForUrl;
var followRedirects$1 = { exports: {} };
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s2 = 1e3;
  var m2 = s2 * 60;
  var h2 = m2 * 60;
  var d2 = h2 * 24;
  var w2 = d2 * 7;
  var y2 = d2 * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse(val);
    } else if (type2 === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n2 = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n2 * y2;
      case "weeks":
      case "week":
      case "w":
        return n2 * w2;
      case "days":
      case "day":
      case "d":
        return n2 * d2;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n2 * h2;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n2 * m2;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n2 * s2;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n2;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d2) {
      return Math.round(ms2 / d2) + "d";
    }
    if (msAbs >= h2) {
      return Math.round(ms2 / h2) + "h";
    }
    if (msAbs >= m2) {
      return Math.round(ms2 / m2) + "m";
    }
    if (msAbs >= s2) {
      return Math.round(ms2 / s2) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d2) {
      return plural(ms2, msAbs, d2, "day");
    }
    if (msAbs >= h2) {
      return plural(ms2, msAbs, h2, "hour");
    }
    if (msAbs >= m2) {
      return plural(ms2, msAbs, m2, "minute");
    }
    if (msAbs >= s2) {
      return plural(ms2, msAbs, s2, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n2, name) {
    var isPlural = msAbs >= n2 * 1.5;
    return Math.round(ms2 / n2) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy2;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i2 = 0; i2 < namespace.length; i2++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i2);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self2 = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend2;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v2) => {
          enableOverride = v2;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy2() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module2, exports2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m2;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m2 = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m2[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = requireCommon()(exports2);
    const { formatters } = module2.exports;
    formatters.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0$2;
  const tty = require$$1$1;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let flagForceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    flagForceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    flagForceColor = 1;
  }
  function envForceColor() {
    if ("FORCE_COLOR" in env) {
      if (env.FORCE_COLOR === "true") {
        return 1;
      }
      if (env.FORCE_COLOR === "false") {
        return 0;
      }
      return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
    const noFlagForceColor = envForceColor();
    if (noFlagForceColor !== void 0) {
      flagForceColor = noFlagForceColor;
    }
    const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
    if (forceColor === 0) {
      return 0;
    }
    if (sniffFlags) {
      if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
        return 3;
      }
      if (hasFlag2("color=256")) {
        return 2;
      }
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min2 = forceColor || 0;
    if (env.TERM === "dumb") {
      return min2;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE", "DRONE"].some((sign3) => sign3 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min2;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min2;
  }
  function getSupportLevel(stream2, options = {}) {
    const level = supportsColor(stream2, {
      streamIsTTY: stream2 && stream2.isTTY,
      ...options
    });
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel({ isTTY: tty.isatty(1) }),
    stderr: getSupportLevel({ isTTY: tty.isatty(2) })
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module2, exports2) {
    const tty = require$$1$1;
    const util2 = require$$1;
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_2, k2) => {
        return k2.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c2 = this.color;
        const colorCode = "\x1B[3" + (c2 < 8 ? c2 : "8;5;" + c2);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util2.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i2 = 0; i2 < keys.length; i2++) {
        debug2.inspectOpts[keys[i2]] = exports2.inspectOpts[keys[i2]];
      }
    }
    module2.exports = requireCommon()(exports2);
    const { formatters } = module2.exports;
    formatters.o = function(v2) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v2, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v2) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v2, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src.exports;
  hasRequiredSrc = 1;
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    src.exports = requireBrowser();
  } else {
    src.exports = requireNode();
  }
  return src.exports;
}
var debug$1;
var debug_1 = function() {
  if (!debug$1) {
    try {
      debug$1 = requireSrc()("follow-redirects");
    } catch (error) {
    }
    if (typeof debug$1 !== "function") {
      debug$1 = function() {
      };
    }
  }
  debug$1.apply(null, arguments);
};
var url = require$$0$1;
var URL$1 = url.URL;
var http = require$$3;
var https = require$$4;
var Writable = stream.Writable;
var assert = require$$4$1;
var debug = debug_1;
(function detectUnsupportedEnvironment() {
  var looksLikeNode = typeof process !== "undefined";
  var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  var looksLikeV8 = isFunction$1(Error.captureStackTrace);
  if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
    console.warn("The follow-redirects package should be excluded from browser builds.");
  }
})();
var useNativeURL = false;
try {
  assert(new URL$1(""));
} catch (error) {
  useNativeURL = error.code === "ERR_INVALID_URL";
}
var preservedUrlFields = [
  "auth",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "hash"
];
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = /* @__PURE__ */ Object.create(null);
events.forEach(function(event) {
  eventHandlers[event] = function(arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});
var InvalidUrlError = createErrorType(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
);
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded",
  RedirectionError
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);
var destroy = Writable.prototype.destroy || noop;
function RedirectableRequest(options, responseCallback) {
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];
  if (responseCallback) {
    this.on("response", responseCallback);
  }
  var self2 = this;
  this._onNativeResponse = function(response) {
    try {
      self2._processResponse(response);
    } catch (cause) {
      self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
    }
  };
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};
RedirectableRequest.prototype.write = function(data, encoding, callback) {
  if (this._ending) {
    throw new WriteAfterEndError();
  }
  if (!isString(data) && !isBuffer(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction$1(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data, encoding });
    this._currentRequest.write(data, encoding, callback);
  } else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};
RedirectableRequest.prototype.end = function(data, encoding, callback) {
  if (isFunction$1(data)) {
    callback = data;
    data = encoding = null;
  } else if (isFunction$1(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  } else {
    var self2 = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function() {
      self2._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};
RedirectableRequest.prototype.setHeader = function(name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};
RedirectableRequest.prototype.removeHeader = function(name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
  var self2 = this;
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }
  function startTimer(socket) {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
    }
    self2._timeout = setTimeout(function() {
      self2.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }
  function clearTimer() {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
      self2._timeout = null;
    }
    self2.removeListener("abort", clearTimer);
    self2.removeListener("error", clearTimer);
    self2.removeListener("response", clearTimer);
    self2.removeListener("close", clearTimer);
    if (callback) {
      self2.removeListener("timeout", callback);
    }
    if (!self2.socket) {
      self2._currentRequest.removeListener("socket", startTimer);
    }
  }
  if (callback) {
    this.on("timeout", callback);
  }
  if (this.socket) {
    startTimer(this.socket);
  } else {
    this._currentRequest.once("socket", startTimer);
  }
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);
  this.on("close", clearTimer);
  return this;
};
[
  "flushHeaders",
  "getHeader",
  "setNoDelay",
  "setSocketKeepAlive"
].forEach(function(method) {
  RedirectableRequest.prototype[method] = function(a2, b2) {
    return this._currentRequest[method](a2, b2);
  };
});
["aborted", "connection", "socket"].forEach(function(property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function() {
      return this._currentRequest[property];
    }
  });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
  if (!options.headers) {
    options.headers = {};
  }
  if (options.host) {
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};
RedirectableRequest.prototype._performRequest = function() {
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    throw new TypeError("Unsupported protocol " + protocol);
  }
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }
  var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }
  this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : (
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path
  );
  if (this._isRedirect) {
    var i2 = 0;
    var self2 = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      if (request === self2._currentRequest) {
        if (error) {
          self2.emit("error", error);
        } else if (i2 < buffers.length) {
          var buffer = buffers[i2++];
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        } else if (self2._ended) {
          request.end();
        }
      }
    })();
  }
};
RedirectableRequest.prototype._processResponse = function(response) {
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode
    });
  }
  var location2 = response.headers.location;
  if (!location2 || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);
    this._requestBodyBuffers = [];
    return;
  }
  destroyRequest(this._currentRequest);
  response.destroy();
  if (++this._redirectCount > this._options.maxRedirects) {
    throw new TooManyRedirectsError();
  }
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: response.req.getHeader("host")
    }, this._options.headers);
  }
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
  // the server is redirecting the user agent to a different resource […]
  // A user agent can perform a retrieval request targeting that URI
  // (a GET or HEAD request if using HTTP) […]
  statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
  var currentUrlParts = parseUrl(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location2) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));
  var redirectUrl = resolveUrl(location2, currentUrl);
  debug("redirecting to", redirectUrl.href);
  this._isRedirect = true;
  spreadUrlObject(redirectUrl, this._options);
  if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
    removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
  }
  if (isFunction$1(beforeRedirect)) {
    var responseDetails = {
      headers: response.headers,
      statusCode
    };
    var requestDetails = {
      url: currentUrl,
      method,
      headers: requestHeaders
    };
    beforeRedirect(this._options, responseDetails, requestDetails);
    this._sanitizeOptions(this._options);
  }
  this._performRequest();
};
function wrap(protocols) {
  var exports2 = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  };
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function(scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
    function request(input, options, callback) {
      if (isURL(input)) {
        input = spreadUrlObject(input);
      } else if (isString(input)) {
        input = spreadUrlObject(parseUrl(input));
      } else {
        callback = options;
        options = validateUrl(input);
        input = { protocol };
      }
      if (isFunction$1(options)) {
        callback = options;
        options = null;
      }
      options = Object.assign({
        maxRedirects: exports2.maxRedirects,
        maxBodyLength: exports2.maxBodyLength
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString(options.host) && !isString(options.hostname)) {
        options.hostname = "::1";
      }
      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }
    function get2(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get2, configurable: true, enumerable: true, writable: true }
    });
  });
  return exports2;
}
function noop() {
}
function parseUrl(input) {
  var parsed;
  if (useNativeURL) {
    parsed = new URL$1(input);
  } else {
    parsed = validateUrl(url.parse(input));
    if (!isString(parsed.protocol)) {
      throw new InvalidUrlError({ input });
    }
  }
  return parsed;
}
function resolveUrl(relative, base) {
  return useNativeURL ? new URL$1(relative, base) : parseUrl(url.resolve(base, relative));
}
function validateUrl(input) {
  if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  return input;
}
function spreadUrlObject(urlObject, target) {
  var spread2 = target || {};
  for (var key of preservedUrlFields) {
    spread2[key] = urlObject[key];
  }
  if (spread2.hostname.startsWith("[")) {
    spread2.hostname = spread2.hostname.slice(1, -1);
  }
  if (spread2.port !== "") {
    spread2.port = Number(spread2.port);
  }
  spread2.path = spread2.search ? spread2.pathname + spread2.search : spread2.pathname;
  return spread2;
}
function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
  function CustomError(properties) {
    if (isFunction$1(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    }
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? message + ": " + this.cause.message : message;
  }
  CustomError.prototype = new (baseClass || Error)();
  Object.defineProperties(CustomError.prototype, {
    constructor: {
      value: CustomError,
      enumerable: false
    },
    name: {
      value: "Error [" + code + "]",
      enumerable: false
    }
  });
  return CustomError;
}
function destroyRequest(request, error) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.destroy(error);
}
function isSubdomain(subdomain, domain) {
  assert(isString(subdomain) && isString(domain));
  var dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
  return typeof value === "string" || value instanceof String;
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isBuffer(value) {
  return typeof value === "object" && "length" in value;
}
function isURL(value) {
  return URL$1 && value instanceof URL$1;
}
followRedirects$1.exports = wrap({ http, https });
followRedirects$1.exports.wrap = wrap;
var followRedirectsExports = followRedirects$1.exports;
const followRedirects = /* @__PURE__ */ getDefaultExportFromCjs(followRedirectsExports);
const VERSION$1 = "1.12.2";
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}
const DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri2, asBlob, options) {
  const _Blob = options && options.Blob || platform.classes.Blob;
  const protocol = parseProtocol(uri2);
  if (asBlob === void 0 && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri2 = protocol.length ? uri2.slice(protocol.length + 1) : uri2;
    const match = DATA_URL_PATTERN.exec(uri2);
    if (!match) {
      throw new AxiosError$1("Invalid URL", AxiosError$1.ERR_INVALID_URL);
    }
    const mime2 = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError$1("Blob is not supported", AxiosError$1.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime2 });
    }
    return buffer;
  }
  throw new AxiosError$1("Unsupported protocol " + protocol, AxiosError$1.ERR_NOT_SUPPORT);
}
const kInternals = Symbol("internals");
class AxiosTransformStream extends stream.Transform {
  constructor(options) {
    options = utils$1.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils$1.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const internals = this[kInternals] = {
      timeWindow: options.timeWindow,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1e3 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    const pushChunk = (_chunk, _callback) => {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      internals.isCaptured && this.emit("progress", internals.bytesSeen);
      if (this.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    };
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err2, _chunk) {
      if (err2) {
        return callback(err2);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
}
const { asyncIterator } = Symbol;
const readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
const BOUNDARY_ALPHABET = platform.ALPHABET.ALPHA_DIGIT + "-_";
const textEncoder = typeof TextEncoder === "function" ? new TextEncoder() : new require$$1.TextEncoder();
const CRLF = "\r\n";
const CRLF_BYTES = textEncoder.encode(CRLF);
const CRLF_BYTES_COUNT = 2;
class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils$1.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async *encode() {
    yield this.headers;
    const { value } = this;
    if (utils$1.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
const formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + platform.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils$1.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils$1.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return stream.Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
};
class ZlibHeaderTransformStream extends stream.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
}
const callbackify = (fn, reducer) => {
  return utils$1.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err2) {
        cb(err2);
      }
    }, cb);
  } : fn;
};
function speedometer(samplesCount, min2) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min2 = min2 !== void 0 ? min2 : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i2 = tail;
    let bytesCount = 0;
    while (i2 !== head) {
      bytesCount += bytes[i2++];
      i2 = i2 % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min2) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
function estimateDataURLDecodedBytes(url2) {
  if (!url2 || typeof url2 !== "string") return 0;
  if (!url2.startsWith("data:")) return 0;
  const comma = url2.indexOf(",");
  if (comma < 0) return 0;
  const meta = url2.slice(5, comma);
  const body = url2.slice(comma + 1);
  const isBase64 = /;base64/i.test(meta);
  if (isBase64) {
    let effectiveLen = body.length;
    const len = body.length;
    for (let i2 = 0; i2 < len; i2++) {
      if (body.charCodeAt(i2) === 37 && i2 + 2 < len) {
        const a2 = body.charCodeAt(i2 + 1);
        const b2 = body.charCodeAt(i2 + 2);
        const isHex = (a2 >= 48 && a2 <= 57 || a2 >= 65 && a2 <= 70 || a2 >= 97 && a2 <= 102) && (b2 >= 48 && b2 <= 57 || b2 >= 65 && b2 <= 70 || b2 >= 97 && b2 <= 102);
        if (isHex) {
          effectiveLen -= 2;
          i2 += 2;
        }
      }
    }
    let pad = 0;
    let idx = len - 1;
    const tailIsPct3D = (j2) => j2 >= 2 && body.charCodeAt(j2 - 2) === 37 && // '%'
    body.charCodeAt(j2 - 1) === 51 && // '3'
    (body.charCodeAt(j2) === 68 || body.charCodeAt(j2) === 100);
    if (idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
        idx--;
      } else if (tailIsPct3D(idx)) {
        pad++;
        idx -= 3;
      }
    }
    if (pad === 1 && idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
      } else if (tailIsPct3D(idx)) {
        pad++;
      }
    }
    const groups = Math.floor(effectiveLen / 4);
    const bytes = groups * 3 - (pad || 0);
    return bytes > 0 ? bytes : 0;
  }
  return Buffer.byteLength(body, "utf8");
}
const zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
const brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
const isBrotliSupported = utils$1.isFunction(zlib.createBrotliDecompress);
const { http: httpFollow, https: httpsFollow } = followRedirects;
const isHttps = /https:?/;
const supportedProtocols = platform.protocols.map((protocol) => {
  return protocol + ":";
});
const flushOnFinish = (stream2, [throttled, flush]) => {
  stream2.on("end", flush).on("error", flush);
  return throttled;
};
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location2) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = proxyFromEnv.getProxyForUrl(location2);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location2;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
const isHttpAdapterSupported = typeof process !== "undefined" && utils$1.kindOf(process) === "process";
const wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone) return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
const resolveFamily = ({ address, family }) => {
  if (!utils$1.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
const buildAddressEntry = (address, family) => resolveFamily(utils$1.isObject(address) ? address : { address, family });
const httpAdapter = isHttpAdapterSupported && function httpAdapter2(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data, lookup, family } = config;
    const { responseType, responseEncoding } = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    if (lookup) {
      const _lookup = callbackify(lookup, (value) => utils$1.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err2, arg0, arg1) => {
          if (err2) {
            return cb(err2);
          }
          const addresses = utils$1.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err2, addresses) : cb(err2, addresses[0].address, addresses[0].family);
        });
      };
    }
    const emitter = new events$1.EventEmitter();
    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort2);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", abort2);
      }
      emitter.removeAllListeners();
    };
    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });
    function abort2(reason) {
      emitter.emit("abort", !reason || reason.type ? new CanceledError$1(null, config, req) : reason);
    }
    emitter.once("abort", reject);
    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort2);
      if (config.signal) {
        config.signal.aborted ? abort2() : config.signal.addEventListener("abort", abort2);
      }
    }
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    const parsed = new URL(fullPath, platform.hasBrowserEnv ? platform.origin : void 0);
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      if (config.maxContentLength > -1) {
        const dataUrl = String(config.url || fullPath || "");
        const estimated = estimateDataURLDecodedBytes(dataUrl);
        if (estimated > config.maxContentLength) {
          return reject(new AxiosError$1(
            "maxContentLength size of " + config.maxContentLength + " exceeded",
            AxiosError$1.ERR_BAD_RESPONSE,
            config
          ));
        }
      }
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config
        });
      }
      try {
        convertedData = fromDataURI(config.url, responseType === "blob", {
          Blob: config.env && config.env.Blob
        });
      } catch (err2) {
        throw AxiosError$1.from(err2, AxiosError$1.ERR_BAD_REQUEST, config);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils$1.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders$1(),
        config
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError$1(
        "Unsupported protocol " + protocol,
        AxiosError$1.ERR_BAD_REQUEST,
        config
      ));
    }
    const headers = AxiosHeaders$1.from(config.headers).normalize();
    headers.set("User-Agent", "axios/" + VERSION$1, false);
    const { onUploadProgress, onDownloadProgress } = config;
    const maxRate = config.maxRate;
    let maxUploadRate = void 0;
    let maxDownloadRate = void 0;
    if (utils$1.isSpecCompliantForm(data)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data = formDataToStream(data, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION$1}-boundary`,
        boundary: userBoundary && userBoundary[1] || void 0
      });
    } else if (utils$1.isFormData(data) && utils$1.isFunction(data.getHeaders)) {
      headers.set(data.getHeaders());
      if (!headers.hasContentLength()) {
        try {
          const knownLength = await require$$1.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
        } catch (e) {
        }
      }
    } else if (utils$1.isBlob(data) || utils$1.isFile(data)) {
      data.size && headers.setContentType(data.type || "application/octet-stream");
      headers.setContentLength(data.size || 0);
      data = stream.Readable.from(readBlob(data));
    } else if (data && !utils$1.isStream(data)) {
      if (Buffer.isBuffer(data)) ;
      else if (utils$1.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils$1.isString(data)) {
        data = Buffer.from(data, "utf-8");
      } else {
        return reject(new AxiosError$1(
          "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
          AxiosError$1.ERR_BAD_REQUEST,
          config
        ));
      }
      headers.setContentLength(data.length, false);
      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError$1(
          "Request body larger than maxBodyLength limit",
          AxiosError$1.ERR_BAD_REQUEST,
          config
        ));
      }
    }
    const contentLength = utils$1.toFiniteNumber(headers.getContentLength());
    if (utils$1.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils$1.isStream(data)) {
        data = stream.Readable.from(data, { objectMode: false });
      }
      data = stream.pipeline([data, new AxiosTransformStream({
        maxRate: utils$1.toFiniteNumber(maxUploadRate)
      })], utils$1.noop);
      onUploadProgress && data.on("progress", flushOnFinish(
        data,
        progressEventDecorator(
          contentLength,
          progressEventReducer(asyncDecorator(onUploadProgress), false, 3)
        )
      ));
    }
    let auth = void 0;
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers.delete("authorization");
    let path2;
    try {
      path2 = buildURL(
        parsed.pathname + parsed.search,
        config.params,
        config.paramsSerializer
      ).replace(/^\?/, "");
    } catch (err2) {
      const customErr = new Error(err2.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""),
      false
    );
    const options = {
      path: path2,
      method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };
    !utils$1.isUndefined(lookup) && (options.lookup = lookup);
    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? require$$4 : require$$3;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }
    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed) return;
      const streams = [res];
      const responseLength = +res.headers["content-length"];
      if (onDownloadProgress || maxDownloadRate) {
        const transformStream = new AxiosTransformStream({
          maxRate: utils$1.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", flushOnFinish(
          transformStream,
          progressEventDecorator(
            responseLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true, 3)
          )
        ));
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream());
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream.pipeline(streams, utils$1.noop) : streams[0];
      const offListeners = stream.finished(responseStream, () => {
        offListeners();
        onFinished();
      });
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders$1(res.headers),
        config,
        request: lastRequest
      };
      if (responseType === "stream") {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError$1(
              "maxContentLength size of " + config.maxContentLength + " exceeded",
              AxiosError$1.ERR_BAD_RESPONSE,
              config,
              lastRequest
            ));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err2 = new AxiosError$1(
            "stream has been aborted",
            AxiosError$1.ERR_BAD_RESPONSE,
            config,
            lastRequest
          );
          responseStream.destroy(err2);
          reject(err2);
        });
        responseStream.on("error", function handleStreamError(err2) {
          if (req.destroyed) return;
          reject(AxiosError$1.from(err2, null, config, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils$1.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err2) {
            return reject(AxiosError$1.from(err2, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
      emitter.once("abort", (err2) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err2);
          responseStream.destroy();
        }
      });
    });
    emitter.once("abort", (err2) => {
      reject(err2);
      req.destroy(err2);
    });
    req.on("error", function handleRequestError(err2) {
      reject(AxiosError$1.from(err2, null, config, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1e3 * 60);
    });
    if (config.timeout) {
      const timeout = parseInt(config.timeout, 10);
      if (Number.isNaN(timeout)) {
        reject(new AxiosError$1(
          "error trying to parse `config.timeout` to int",
          AxiosError$1.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone) return;
        let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = config.transitional || transitionalDefaults;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError$1(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config,
          req
        ));
        abort2();
      });
    }
    if (utils$1.isStream(data)) {
      let ended = false;
      let errored = false;
      data.on("end", () => {
        ended = true;
      });
      data.once("error", (err2) => {
        errored = true;
        req.destroy(err2);
      });
      data.on("close", () => {
        if (!ended && !errored) {
          abort2(new CanceledError$1("Request stream has been aborted", config, req));
        }
      });
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url2) => {
  url2 = new URL(url2, platform.origin);
  return origin2.protocol === url2.protocol && origin2.host === url2.host && (isMSIE || origin2.port === url2.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path2, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path2) && cookie.push("path=" + path2);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a2, b2, prop, caseless) {
    if (!utils$1.isUndefined(b2)) {
      return getMergedValue(a2, b2, prop, caseless);
    } else if (!utils$1.isUndefined(a2)) {
      return getMergedValue(void 0, a2, prop, caseless);
    }
  }
  function valueFromConfig2(a2, b2) {
    if (!utils$1.isUndefined(b2)) {
      return getMergedValue(void 0, b2);
    }
  }
  function defaultToConfig2(a2, b2) {
    if (!utils$1.isUndefined(b2)) {
      return getMergedValue(void 0, b2);
    } else if (!utils$1.isUndefined(a2)) {
      return getMergedValue(void 0, a2);
    }
  }
  function mergeDirectKeys(a2, b2, prop) {
    if (prop in config2) {
      return getMergedValue(a2, b2);
    } else if (prop in config1) {
      return getMergedValue(void 0, a2);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a2, b2, prop) => mergeDeepProperties(headersToObject(a2), headersToObject(b2), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err2) {
        reject(err2);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err2 = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
      err2.event = event || null;
      reject(err2);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err2 = reason instanceof Error ? reason : this.reason;
        controller.abort(err2 instanceof AxiosError$1 ? err2 : new CanceledError$1(err2 instanceof Error ? err2.message : err2));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream2) {
  if (stream2[Symbol.asyncIterator]) {
    yield* stream2;
    return;
  }
  const reader = stream2.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream2, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream2, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err2) {
        _onFinish(err2);
        throw err2;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder: TextEncoder$1
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder$1 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder$1()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type2) => {
      !resolvers[type2] && (resolvers[type2] = (res, config) => {
        let method = res && res[type2];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type2}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url: url2,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url2, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url2, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url2, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err2) {
      unsubscribe && unsubscribe();
      if (err2 && err2.name === "TypeError" && /Load failed|fetch/i.test(err2.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err2.cause || err2
          }
        );
      }
      throw AxiosError$1.from(err2, err2 && err2.code, config, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config) => {
  let env = config ? config.env : {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i2 = len, seed, target, map = seedCache;
  while (i2--) {
    seed = seeds[i2];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i2 ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2, config) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i2 = 0; i2 < length; i2++) {
      nameOrAdapter = adapters2[i2];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
        break;
      }
      rejectedReasons[id || "#" + i2] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state2]) => `adapter ${id} ` + (state2 === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s2 = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s2,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type2, i2) => {
  validators$1[type2] = function validator2(thing) {
    return typeof thing === type2 || "a" + (i2 < 1 ? "n " : " ") + type2;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i2 = keys.length;
  while (i2-- > 0) {
    const opt = keys[i2];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err2) {
      if (err2 instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err2.stack) {
            err2.stack = stack;
          } else if (stack && !String(err2.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err2.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err2;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i2 = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i2 < len) {
        promise = promise.then(chain[i2++], chain[i2++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i2 < len) {
      const onFulfilled = requestInterceptorChain[i2++];
      const onRejected = requestInterceptorChain[i2++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i2 = 0;
    len = responseInterceptorChain.length;
    while (i2 < len) {
      promise = promise.then(responseInterceptorChain[i2++], responseInterceptorChain[i2++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url2, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url: url2,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url2, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: url2,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i2 = token._listeners.length;
      while (i2-- > 0) {
        token._listeners[i2](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort2 = (err2) => {
      controller.abort(err2);
    };
    this.subscribe(abort2);
    controller.signal.unsubscribe = () => this.unsubscribe(abort2);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c2) {
      cancel = c2;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap2(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind$2(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
class OllamaClient {
  constructor(config) {
    __publicField(this, "client");
    __publicField(this, "config");
    this.config = {
      baseUrl: "http://127.0.0.1:11434",
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    };
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 12e4
      // 2 minutes for LLM responses
    });
  }
  async chat(messages, config) {
    const mergedConfig = { ...this.config, ...config };
    try {
      const response = await this.client.post("/api/chat", {
        model: mergedConfig.model,
        messages,
        stream: false,
        options: {
          temperature: mergedConfig.temperature,
          num_predict: mergedConfig.maxTokens
        }
      });
      return {
        content: response.data.message.content,
        model: mergedConfig.model,
        tokensUsed: response.data.eval_count
      };
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        throw new Error("Ollama is not running. Please start Ollama and try again.");
      }
      throw new Error(`LLM request failed: ${error.message}`);
    }
  }
  async summarize(text, config) {
    const messages = [
      {
        role: "system",
        content: "You are a professional document summarizer. Create concise, accurate summaries that capture the key points and main ideas of documents."
      },
      {
        role: "user",
        content: `Please provide a comprehensive summary of the following document:

${text}`
      }
    ];
    const response = await this.chat(messages, config);
    return response.content;
  }
  async isAvailable() {
    var _a2;
    try {
      const response = await this.client.get("/api/tags");
      console.log("[Ollama] Successfully connected, response:", response.status);
      return true;
    } catch (error) {
      console.error("[Ollama] Connection failed:", {
        message: error.message,
        code: error.code,
        response: (_a2 = error.response) == null ? void 0 : _a2.status,
        baseURL: this.config.baseUrl
      });
      return false;
    }
  }
  async listModels() {
    try {
      const response = await this.client.get("/api/tags");
      return response.data.models.map((m2) => m2.name);
    } catch {
      return [];
    }
  }
  async pullModel(modelName, _onProgress) {
    try {
      const response = await this.client.post("/api/pull", {
        name: modelName,
        stream: true
      }, {
        responseType: "stream"
      });
      return new Promise((resolve, reject) => {
        response.data.on("end", () => resolve());
        response.data.on("error", (err2) => reject(err2));
      });
    } catch (error) {
      throw new Error(`Failed to download model: ${error.message}`);
    }
  }
}
class HuggingFaceClient {
  constructor(_config, _apiKey) {
  }
  async chat(_messages, _config) {
    throw new Error("HuggingFace client not implemented yet");
  }
  async summarize(_text, _config) {
    throw new Error("HuggingFace client not implemented yet");
  }
  async isAvailable() {
    return false;
  }
  async listModels() {
    return [];
  }
}
function createLLMClient(type2, config, apiKey) {
  switch (type2) {
    case "ollama":
      return new OllamaClient(config);
    case "huggingface":
      return new HuggingFaceClient(config, apiKey);
    default:
      throw new Error(`Unknown LLM client type: ${type2}`);
  }
}
class LLMService {
  constructor() {
    this.client = null;
    this.currentModel = "granite3.3:8b";
  }
  async initialize(model) {
    try {
      this.currentModel = model || this.currentModel;
      this.client = createLLMClient("ollama", {
        model: this.currentModel,
        baseUrl: "http://127.0.0.1:11434",
        temperature: 0.7,
        maxTokens: 2048
      });
      const available = await this.client.isAvailable();
      if (!available) {
        throw new Error("Ollama is not running");
      }
    } catch (error) {
      console.error("Failed to initialize LLM:", error);
      throw error;
    }
  }
  async summarize(text, onProgress) {
    if (!this.client) {
      await this.initialize();
    }
    try {
      const summary = await this.client.summarize(text);
      return summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }
  async chat(messages) {
    if (!this.client) {
      await this.initialize();
    }
    try {
      const response = await this.client.chat(messages);
      return response.content;
    } catch (error) {
      console.error("Error in chat:", error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }
  async listAvailableModels() {
    if (!this.client) {
      await this.initialize();
    }
    try {
      return await this.client.listModels();
    } catch {
      return [];
    }
  }
  async isOllamaRunning() {
    try {
      if (!this.client) {
        await this.initialize();
      }
      return await this.client.isAvailable();
    } catch {
      return false;
    }
  }
  getCurrentModel() {
    return this.currentModel;
  }
  setModel(model) {
    this.currentModel = model;
    this.client = null;
  }
}
const llmService = new LLMService();
var _typeof = { exports: {} };
(function(module2) {
  function _typeof2(o2) {
    "@babel/helpers - typeof";
    return module2.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o3) {
      return typeof o3;
    } : function(o3) {
      return o3 && "function" == typeof Symbol && o3.constructor === Symbol && o3 !== Symbol.prototype ? "symbol" : typeof o3;
    }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _typeof2(o2);
  }
  module2.exports = _typeof2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
})(_typeof);
var _typeofExports = _typeof.exports;
const t = /* @__PURE__ */ getDefaultExportFromCjs(_typeofExports);
var require$1 = module$1.createRequire("/");
var Worker;
try {
  Worker = require$1("worker_threads").Worker;
} catch (e) {
}
var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b2 = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b2[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new i32(b2[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j2 = b2[i2]; j2 < b2[i2 + 1]; ++j2) {
      r[j2] = j2 - b2[i2] << 5 | i2;
    }
  }
  return { b: b2, r };
};
var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b.b, revfd = _b.r;
var rev = new u16(32768);
for (var i$1 = 0; i$1 < 32768; ++i$1) {
  var x$1 = (i$1 & 43690) >> 1 | (i$1 & 21845) << 1;
  x$1 = (x$1 & 52428) >> 2 | (x$1 & 13107) << 2;
  x$1 = (x$1 & 61680) >> 4 | (x$1 & 3855) << 4;
  rev[i$1] = ((x$1 & 65280) >> 8 | (x$1 & 255) << 8) >> 1;
}
var hMap = function(cd, mb, r) {
  var s2 = cd.length;
  var i2 = 0;
  var l2 = new u16(mb);
  for (; i2 < s2; ++i2) {
    if (cd[i2])
      ++l2[cd[i2] - 1];
  }
  var le2 = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le2[i2] = le2[i2 - 1] + l2[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s2; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v2 = le2[cd[i2] - 1]++ << r_1;
        for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
          co[rev[v2] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s2);
    for (i2 = 0; i2 < s2; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le2[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (var i$1 = 0; i$1 < 144; ++i$1)
  flt[i$1] = 8;
for (var i$1 = 144; i$1 < 256; ++i$1)
  flt[i$1] = 9;
for (var i$1 = 256; i$1 < 280; ++i$1)
  flt[i$1] = 7;
for (var i$1 = 280; i$1 < 288; ++i$1)
  flt[i$1] = 8;
var fdt = new u8(32);
for (var i$1 = 0; i$1 < 32; ++i$1)
  fdt[i$1] = 5;
var flm = /* @__PURE__ */ hMap(flt, 9, 0), flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0), fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a2) {
  var m2 = a2[0];
  for (var i2 = 1; i2 < a2.length; ++i2) {
    if (a2[i2] > m2)
      m2 = a2[i2];
  }
  return m2;
};
var bits = function(d2, p2, m2) {
  var o2 = p2 / 8 | 0;
  return (d2[o2] | d2[o2 + 1] << 8) >> (p2 & 7) & m2;
};
var bits16 = function(d2, p2) {
  var o2 = p2 / 8 | 0;
  return (d2[o2] | d2[o2 + 1] << 8 | d2[o2 + 2] << 16) >> (p2 & 7);
};
var shft = function(p2) {
  return (p2 + 7) / 8 | 0;
};
var slc = function(v2, s2, e) {
  if (e == null || e > v2.length)
    e = v2.length;
  return new u8(v2.subarray(s2, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt2) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt2)
    throw e;
  return e;
};
var inflt = function(dat, st2, buf, dict) {
  var sl = dat.length, dl = 0;
  if (!sl || st2.f && !st2.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st2.i != 2;
  var noSt = st2.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l3) {
    var bl = buf.length;
    if (l3 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l3));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st2.f || 0, pos = st2.p || 0, bt2 = st2.b || 0, lm = st2.l, dm = st2.d, lbt = st2.m, dbt = st2.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type2 = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type2) {
        var s2 = shft(pos) + 4, l2 = dat[s2 - 4] | dat[s2 - 3] << 8, t3 = s2 + l2;
        if (t3 > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + l2);
        buf.set(dat.subarray(s2, t3), bt2);
        st2.b = bt2 += l2, st2.p = pos = t3 * 8, st2.f = final;
        continue;
      } else if (type2 == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type2 == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s2 = r >> 4;
          if (s2 < 16) {
            ldt[i2++] = s2;
          } else {
            var c2 = 0, n2 = 0;
            if (s2 == 16)
              n2 = 3 + bits(dat, pos, 3), pos += 2, c2 = ldt[i2 - 1];
            else if (s2 == 17)
              n2 = 3 + bits(dat, pos, 7), pos += 3;
            else if (s2 == 18)
              n2 = 11 + bits(dat, pos, 127), pos += 7;
            while (n2--)
              ldt[i2++] = c2;
          }
        }
        var lt2 = ldt.subarray(0, hLit), dt2 = ldt.subarray(hLit);
        lbt = max(lt2);
        dbt = max(dt2);
        lm = hMap(lt2, lbt, 1);
        dm = hMap(dt2, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt2 + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c2 = lm[bits16(dat, pos) & lms], sym = c2 >> 4;
      pos += c2 & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c2)
        err(2);
      if (sym < 256)
        buf[bt2++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b2 = fleb[i2];
          add = bits(dat, pos, (1 << b2) - 1) + fl[i2];
          pos += b2;
        }
        var d2 = dm[bits16(dat, pos) & dms], dsym = d2 >> 4;
        if (!d2)
          err(3);
        pos += d2 & 15;
        var dt2 = fd[dsym];
        if (dsym > 3) {
          var b2 = fdeb[dsym];
          dt2 += bits16(dat, pos) & (1 << b2) - 1, pos += b2;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + 131072);
        var end = bt2 + add;
        if (bt2 < dt2) {
          var shift = dl - dt2, dend = Math.min(dt2, end);
          if (shift + bt2 < 0)
            err(3);
          for (; bt2 < dend; ++bt2)
            buf[bt2] = dict[shift + bt2];
        }
        for (; bt2 < end; ++bt2)
          buf[bt2] = buf[bt2 - dt2];
      }
    }
    st2.l = lm, st2.p = lpos, st2.b = bt2, st2.f = final;
    if (lm)
      final = 1, st2.m = lbt, st2.d = dm, st2.n = dbt;
  } while (!final);
  return bt2 != buf.length && noBuf ? slc(buf, 0, bt2) : buf.subarray(0, bt2);
};
var wbits = function(d2, p2, v2) {
  v2 <<= p2 & 7;
  var o2 = p2 / 8 | 0;
  d2[o2] |= v2;
  d2[o2 + 1] |= v2 >> 8;
};
var wbits16 = function(d2, p2, v2) {
  v2 <<= p2 & 7;
  var o2 = p2 / 8 | 0;
  d2[o2] |= v2;
  d2[o2 + 1] |= v2 >> 8;
  d2[o2 + 2] |= v2 >> 16;
};
var hTree = function(d2, mb) {
  var t3 = [];
  for (var i2 = 0; i2 < d2.length; ++i2) {
    if (d2[i2])
      t3.push({ s: i2, f: d2[i2] });
  }
  var s2 = t3.length;
  var t22 = t3.slice();
  if (!s2)
    return { t: et$1, l: 0 };
  if (s2 == 1) {
    var v2 = new u8(t3[0].s + 1);
    v2[t3[0].s] = 1;
    return { t: v2, l: 1 };
  }
  t3.sort(function(a2, b2) {
    return a2.f - b2.f;
  });
  t3.push({ s: -1, f: 25001 });
  var l2 = t3[0], r = t3[1], i0 = 0, i1 = 1, i22 = 2;
  t3[0] = { s: -1, f: l2.f + r.f, l: l2, r };
  while (i1 != s2 - 1) {
    l2 = t3[t3[i0].f < t3[i22].f ? i0++ : i22++];
    r = t3[i0 != i1 && t3[i0].f < t3[i22].f ? i0++ : i22++];
    t3[i1++] = { s: -1, f: l2.f + r.f, l: l2, r };
  }
  var maxSym = t22[0].s;
  for (var i2 = 1; i2 < s2; ++i2) {
    if (t22[i2].s > maxSym)
      maxSym = t22[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t3[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt2 = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t22.sort(function(a2, b2) {
      return tr[b2.s] - tr[a2.s] || a2.f - b2.f;
    });
    for (; i2 < s2; ++i2) {
      var i2_1 = t22[i2].s;
      if (tr[i2_1] > mb) {
        dt2 += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt2 >>= lft;
    while (dt2 > 0) {
      var i2_2 = t22[i2].s;
      if (tr[i2_2] < mb)
        dt2 -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt2; --i2) {
      var i2_3 = t22[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt2;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n2, l2, d2) {
  return n2.s == -1 ? Math.max(ln(n2.l, l2, d2 + 1), ln(n2.r, l2, d2 + 1)) : l2[n2.s] = d2;
};
var lc = function(c2) {
  var s2 = c2.length;
  while (s2 && !c2[--s2])
    ;
  var cl = new u16(++s2);
  var cli = 0, cln = c2[0], cls = 1;
  var w2 = function(v2) {
    cl[cli++] = v2;
  };
  for (var i2 = 1; i2 <= s2; ++i2) {
    if (c2[i2] == cln && i2 != s2)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w2(32754);
        if (cls > 2) {
          w2(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w2(cln), --cls;
        for (; cls > 6; cls -= 6)
          w2(8304);
        if (cls > 2)
          w2(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w2(cln);
      cls = 1;
      cln = c2[i2];
    }
  }
  return { c: cl.subarray(0, cli), n: s2 };
};
var clen = function(cf, cl) {
  var l2 = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l2 += cf[i2] * cl[i2];
  return l2;
};
var wfblk = function(out, pos, dat) {
  var s2 = dat.length;
  var o2 = shft(pos + 2);
  out[o2] = s2 & 255;
  out[o2 + 1] = s2 >> 8;
  out[o2 + 2] = out[o2] ^ 255;
  out[o2 + 3] = out[o2 + 1] ^ 255;
  for (var i2 = 0; i2 < s2; ++i2)
    out[o2 + i2 + 4] = dat[i2];
  return (o2 + 4 + s2) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p2) {
  wbits(out, p2++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    ++lcfreq[lcdt[i2] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p2, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p2, 1 + (dtlen < ftlen)), p2 += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p2, nlc - 257);
    wbits(out, p2 + 5, ndc - 1);
    wbits(out, p2 + 10, nlcc - 4);
    p2 += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p2 + 3 * i2, lct[clim[i2]]);
    p2 += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it2 = 0; it2 < 2; ++it2) {
      var clct = lcts[it2];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p2, llm[len]), p2 += lct[len];
        if (len > 15)
          wbits(out, p2, clct[i2] >> 5 & 127), p2 += clct[i2] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p2, lm[len + 257]), p2 += ll[len + 257];
      if (len > 7)
        wbits(out, p2, sym >> 23 & 31), p2 += fleb[len];
      var dst = sym & 31;
      wbits16(out, p2, dm[dst]), p2 += dl[dst];
      if (dst > 3)
        wbits16(out, p2, sym >> 5 & 8191), p2 += fdeb[dst];
    } else {
      wbits16(out, p2, lm[sym]), p2 += ll[sym];
    }
  }
  wbits16(out, p2, lm[256]);
  return p2 + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et$1 = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st2) {
  var s2 = st2.z || dat.length;
  var o2 = new u8(pre + s2 + 5 * (1 + Math.ceil(s2 / 7e3)) + post);
  var w2 = o2.subarray(pre, o2.length - post);
  var lst = st2.l;
  var pos = (st2.r || 0) & 7;
  if (lvl) {
    if (pos)
      w2[0] = st2.r >> 3;
    var opt = deo[lvl - 1];
    var n2 = opt >> 13, c2 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st2.p || new u16(32768), head = st2.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st2.i || 0, li = 0, wi = st2.w || 0, bs = 0;
    for (; i2 + 2 < s2; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s2 - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w2, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j2 = 0; j2 < 286; ++j2)
            lf[j2] = 0;
          for (var j2 = 0; j2 < 30; ++j2)
            df[j2] = 0;
        }
        var l2 = 2, d2 = 0, ch_1 = c2, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n2, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l2] == dat[i2 + l2 - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l2) {
                l2 = nl, d2 = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j2 = 0; j2 < mmd; ++j2) {
                  var ti = i2 - dif + j2 & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d2) {
          syms[li++] = 268435456 | revfl[l2] << 18 | revfd[d2];
          var lin = revfl[l2] & 31, din = revfd[d2] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l2;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s2; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w2, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st2.r = pos & 7 | w2[pos / 8 | 0] << 3;
      pos -= 7;
      st2.h = head, st2.p = prev, st2.i = i2, st2.w = wi;
    }
  } else {
    for (var i2 = st2.w || 0; i2 < s2 + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s2) {
        w2[pos / 8 | 0] = lst;
        e = s2;
      }
      pos = wfblk(w2, pos + 1, dat.subarray(i2, e));
    }
    st2.i = s2;
  }
  return slc(o2, 0, pre + shft(pos) + post);
};
var adler = function() {
  var a2 = 1, b2 = 0;
  return {
    p: function(d2) {
      var n2 = a2, m2 = b2;
      var l2 = d2.length | 0;
      for (var i2 = 0; i2 != l2; ) {
        var e = Math.min(i2 + 2655, l2);
        for (; i2 < e; ++i2)
          m2 += n2 += d2[i2];
        n2 = (n2 & 65535) + 15 * (n2 >> 16), m2 = (m2 & 65535) + 15 * (m2 >> 16);
      }
      a2 = n2, b2 = m2;
    },
    d: function() {
      a2 %= 65521, b2 %= 65521;
      return (a2 & 255) << 24 | (a2 & 65280) << 8 | (b2 & 255) << 8 | b2 >> 8;
    }
  };
};
var dopt = function(dat, opt, pre, post, st2) {
  if (!st2) {
    st2 = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st2.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st2.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st2);
};
var wbytes = function(d2, b2, v2) {
  for (; v2; ++b2)
    d2[b2] = v2, v2 >>>= 8;
};
var zlh = function(c2, o2) {
  var lv = o2.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
  c2[0] = 120, c2[1] = fl2 << 6 | (o2.dictionary && 32);
  c2[1] |= 31 - (c2[0] << 8 | c2[1]) % 31;
  if (o2.dictionary) {
    var h2 = adler();
    h2.p(o2.dictionary);
    wbytes(c2, 2, h2.d());
  }
};
var zls = function(d2, dict) {
  if ((d2[0] & 15) != 8 || d2[0] >> 4 > 7 || (d2[0] << 8 | d2[1]) % 31)
    err(6, "invalid zlib data");
  if ((d2[1] >> 5 & 1) == 1)
    err(6, "invalid zlib data: " + (d2[1] & 32 ? "need" : "unexpected") + " dictionary");
  return (d2[1] >> 3 & 4) + 2;
};
function zlibSync(data, opts) {
  if (!opts)
    opts = {};
  var a2 = adler();
  a2.p(data);
  var d2 = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
  return zlh(d2, opts), wbytes(d2, d2.length - 4, a2.d()), d2;
}
function unzlibSync(data, opts) {
  return inflt(data.subarray(zls(data), -4), { i: 2 }, opts, opts);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et$1, { stream: true });
  tds = 1;
} catch (e) {
}
/** @license
 *
 * jsPDF - PDF Document creation from JavaScript
 * Version 2.5.2 Built on 2024-09-17T13:29:57.859Z
 *                      CommitID 00000000
 *
 * Copyright (c) 2010-2021 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
 *               2015-2021 yWorks GmbH, http://www.yworks.com
 *               2015-2021 Lukas Holländer <lukas.hollaender@yworks.com>, https://github.com/HackbrettXXX
 *               2016-2018 Aras Abbasi <aras.abbasi@gmail.com>
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, https://github.com/willowsystems
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Steven Spungin, https://github.com/Flamenco
 *               2014 Kenneth Glassey, https://github.com/Gavvers
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth, Flamenco
 */
var n = /* @__PURE__ */ function() {
  return "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this;
}();
function i() {
  n.console && "function" == typeof n.console.log && n.console.log.apply(n.console, arguments);
}
var a = { log: i, warn: function(t3) {
  n.console && ("function" == typeof n.console.warn ? n.console.warn.apply(n.console, arguments) : i.call(null, arguments));
}, error: function(t3) {
  n.console && ("function" == typeof n.console.error ? n.console.error.apply(n.console, arguments) : i(t3));
} };
function o(t3, e, r) {
  var n2 = new XMLHttpRequest();
  n2.open("GET", t3), n2.responseType = "blob", n2.onload = function() {
    l(n2.response, e, r);
  }, n2.onerror = function() {
    a.error("could not download file");
  }, n2.send();
}
function s(t3) {
  var e = new XMLHttpRequest();
  e.open("HEAD", t3, false);
  try {
    e.send();
  } catch (t4) {
  }
  return e.status >= 200 && e.status <= 299;
}
function c(t3) {
  try {
    t3.dispatchEvent(new MouseEvent("click"));
  } catch (r) {
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null), t3.dispatchEvent(e);
  }
}
var u, h, l = n.saveAs || ("object" !== ("undefined" == typeof window ? "undefined" : t(window)) || window !== n ? function() {
} : "undefined" != typeof HTMLAnchorElement && "download" in HTMLAnchorElement.prototype ? function(t3, e, r) {
  var i2 = n.URL || n.webkitURL, a2 = document.createElement("a");
  e = e || t3.name || "download", a2.download = e, a2.rel = "noopener", "string" == typeof t3 ? (a2.href = t3, a2.origin !== location.origin ? s(a2.href) ? o(t3, e, r) : c(a2, a2.target = "_blank") : c(a2)) : (a2.href = i2.createObjectURL(t3), setTimeout(function() {
    i2.revokeObjectURL(a2.href);
  }, 4e4), setTimeout(function() {
    c(a2);
  }, 0));
} : "msSaveOrOpenBlob" in navigator ? function(e, r, n2) {
  if (r = r || e.name || "download", "string" == typeof e) if (s(e)) o(e, r, n2);
  else {
    var i2 = document.createElement("a");
    i2.href = e, i2.target = "_blank", setTimeout(function() {
      c(i2);
    });
  }
  else navigator.msSaveOrOpenBlob(function(e2, r2) {
    return void 0 === r2 ? r2 = { autoBom: false } : "object" !== t(r2) && (a.warn("Deprecated: Expected third argument to be a object"), r2 = { autoBom: !r2 }), r2.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e2.type) ? new Blob([String.fromCharCode(65279), e2], { type: e2.type }) : e2;
  }(e, n2), r);
} : function(e, r, i2, a2) {
  if ((a2 = a2 || open("", "_blank")) && (a2.document.title = a2.document.body.innerText = "downloading..."), "string" == typeof e) return o(e, r, i2);
  var s2 = "application/octet-stream" === e.type, c2 = /constructor/i.test(n.HTMLElement) || n.safari, u2 = /CriOS\/[\d]+/.test(navigator.userAgent);
  if ((u2 || s2 && c2) && "object" === ("undefined" == typeof FileReader ? "undefined" : t(FileReader))) {
    var h2 = new FileReader();
    h2.onloadend = function() {
      var t3 = h2.result;
      t3 = u2 ? t3 : t3.replace(/^data:[^;]*;/, "data:attachment/file;"), a2 ? a2.location.href = t3 : location = t3, a2 = null;
    }, h2.readAsDataURL(e);
  } else {
    var l2 = n.URL || n.webkitURL, f2 = l2.createObjectURL(e);
    a2 ? a2.location = f2 : location.href = f2, a2 = null, setTimeout(function() {
      l2.revokeObjectURL(f2);
    }, 4e4);
  }
});
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * {@link   http://www.phpied.com/rgb-color-parser-in-javascript/}
 * @license Use it if you like it
 */
function f(t3) {
  var e;
  t3 = t3 || "", this.ok = false, "#" == t3.charAt(0) && (t3 = t3.substr(1, 6));
  t3 = { aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "00ffff", aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "000000", blanchedalmond: "ffebcd", blue: "0000ff", blueviolet: "8a2be2", brown: "a52a2a", burlywood: "deb887", cadetblue: "5f9ea0", chartreuse: "7fff00", chocolate: "d2691e", coral: "ff7f50", cornflowerblue: "6495ed", cornsilk: "fff8dc", crimson: "dc143c", cyan: "00ffff", darkblue: "00008b", darkcyan: "008b8b", darkgoldenrod: "b8860b", darkgray: "a9a9a9", darkgreen: "006400", darkkhaki: "bdb76b", darkmagenta: "8b008b", darkolivegreen: "556b2f", darkorange: "ff8c00", darkorchid: "9932cc", darkred: "8b0000", darksalmon: "e9967a", darkseagreen: "8fbc8f", darkslateblue: "483d8b", darkslategray: "2f4f4f", darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493", deepskyblue: "00bfff", dimgray: "696969", dodgerblue: "1e90ff", feldspar: "d19275", firebrick: "b22222", floralwhite: "fffaf0", forestgreen: "228b22", fuchsia: "ff00ff", gainsboro: "dcdcdc", ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520", gray: "808080", green: "008000", greenyellow: "adff2f", honeydew: "f0fff0", hotpink: "ff69b4", indianred: "cd5c5c", indigo: "4b0082", ivory: "fffff0", khaki: "f0e68c", lavender: "e6e6fa", lavenderblush: "fff0f5", lawngreen: "7cfc00", lemonchiffon: "fffacd", lightblue: "add8e6", lightcoral: "f08080", lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2", lightgrey: "d3d3d3", lightgreen: "90ee90", lightpink: "ffb6c1", lightsalmon: "ffa07a", lightseagreen: "20b2aa", lightskyblue: "87cefa", lightslateblue: "8470ff", lightslategray: "778899", lightsteelblue: "b0c4de", lightyellow: "ffffe0", lime: "00ff00", limegreen: "32cd32", linen: "faf0e6", magenta: "ff00ff", maroon: "800000", mediumaquamarine: "66cdaa", mediumblue: "0000cd", mediumorchid: "ba55d3", mediumpurple: "9370d8", mediumseagreen: "3cb371", mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a", mediumturquoise: "48d1cc", mediumvioletred: "c71585", midnightblue: "191970", mintcream: "f5fffa", mistyrose: "ffe4e1", moccasin: "ffe4b5", navajowhite: "ffdead", navy: "000080", oldlace: "fdf5e6", olive: "808000", olivedrab: "6b8e23", orange: "ffa500", orangered: "ff4500", orchid: "da70d6", palegoldenrod: "eee8aa", palegreen: "98fb98", paleturquoise: "afeeee", palevioletred: "d87093", papayawhip: "ffefd5", peachpuff: "ffdab9", peru: "cd853f", pink: "ffc0cb", plum: "dda0dd", powderblue: "b0e0e6", purple: "800080", red: "ff0000", rosybrown: "bc8f8f", royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072", sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee", sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb", slateblue: "6a5acd", slategray: "708090", snow: "fffafa", springgreen: "00ff7f", steelblue: "4682b4", tan: "d2b48c", teal: "008080", thistle: "d8bfd8", tomato: "ff6347", turquoise: "40e0d0", violet: "ee82ee", violetred: "d02090", wheat: "f5deb3", white: "ffffff", whitesmoke: "f5f5f5", yellow: "ffff00", yellowgreen: "9acd32" }[t3 = (t3 = t3.replace(/ /g, "")).toLowerCase()] || t3;
  for (var r = [{ re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/, example: ["rgb(123, 234, 45)", "rgb(255,234,245)"], process: function(t4) {
    return [parseInt(t4[1]), parseInt(t4[2]), parseInt(t4[3])];
  } }, { re: /^(\w{2})(\w{2})(\w{2})$/, example: ["#00ff00", "336699"], process: function(t4) {
    return [parseInt(t4[1], 16), parseInt(t4[2], 16), parseInt(t4[3], 16)];
  } }, { re: /^(\w{1})(\w{1})(\w{1})$/, example: ["#fb0", "f0f"], process: function(t4) {
    return [parseInt(t4[1] + t4[1], 16), parseInt(t4[2] + t4[2], 16), parseInt(t4[3] + t4[3], 16)];
  } }], n2 = 0; n2 < r.length; n2++) {
    var i2 = r[n2].re, a2 = r[n2].process, o2 = i2.exec(t3);
    o2 && (e = a2(o2), this.r = e[0], this.g = e[1], this.b = e[2], this.ok = true);
  }
  this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r, this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g, this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b, this.toRGB = function() {
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  }, this.toHex = function() {
    var t4 = this.r.toString(16), e2 = this.g.toString(16), r2 = this.b.toString(16);
    return 1 == t4.length && (t4 = "0" + t4), 1 == e2.length && (e2 = "0" + e2), 1 == r2.length && (r2 = "0" + r2), "#" + t4 + e2 + r2;
  };
}
/**
 * @license
 * Joseph Myers does not specify a particular license for his work.
 *
 * Author: Joseph Myers
 * Accessed from: http://www.myersdaily.org/joseph/javascript/md5.js
 *
 * Modified by: Owen Leong
 */
function d(t3, e) {
  var r = t3[0], n2 = t3[1], i2 = t3[2], a2 = t3[3];
  r = g(r, n2, i2, a2, e[0], 7, -680876936), a2 = g(a2, r, n2, i2, e[1], 12, -389564586), i2 = g(i2, a2, r, n2, e[2], 17, 606105819), n2 = g(n2, i2, a2, r, e[3], 22, -1044525330), r = g(r, n2, i2, a2, e[4], 7, -176418897), a2 = g(a2, r, n2, i2, e[5], 12, 1200080426), i2 = g(i2, a2, r, n2, e[6], 17, -1473231341), n2 = g(n2, i2, a2, r, e[7], 22, -45705983), r = g(r, n2, i2, a2, e[8], 7, 1770035416), a2 = g(a2, r, n2, i2, e[9], 12, -1958414417), i2 = g(i2, a2, r, n2, e[10], 17, -42063), n2 = g(n2, i2, a2, r, e[11], 22, -1990404162), r = g(r, n2, i2, a2, e[12], 7, 1804603682), a2 = g(a2, r, n2, i2, e[13], 12, -40341101), i2 = g(i2, a2, r, n2, e[14], 17, -1502002290), r = m(r, n2 = g(n2, i2, a2, r, e[15], 22, 1236535329), i2, a2, e[1], 5, -165796510), a2 = m(a2, r, n2, i2, e[6], 9, -1069501632), i2 = m(i2, a2, r, n2, e[11], 14, 643717713), n2 = m(n2, i2, a2, r, e[0], 20, -373897302), r = m(r, n2, i2, a2, e[5], 5, -701558691), a2 = m(a2, r, n2, i2, e[10], 9, 38016083), i2 = m(i2, a2, r, n2, e[15], 14, -660478335), n2 = m(n2, i2, a2, r, e[4], 20, -405537848), r = m(r, n2, i2, a2, e[9], 5, 568446438), a2 = m(a2, r, n2, i2, e[14], 9, -1019803690), i2 = m(i2, a2, r, n2, e[3], 14, -187363961), n2 = m(n2, i2, a2, r, e[8], 20, 1163531501), r = m(r, n2, i2, a2, e[13], 5, -1444681467), a2 = m(a2, r, n2, i2, e[2], 9, -51403784), i2 = m(i2, a2, r, n2, e[7], 14, 1735328473), r = v(r, n2 = m(n2, i2, a2, r, e[12], 20, -1926607734), i2, a2, e[5], 4, -378558), a2 = v(a2, r, n2, i2, e[8], 11, -2022574463), i2 = v(i2, a2, r, n2, e[11], 16, 1839030562), n2 = v(n2, i2, a2, r, e[14], 23, -35309556), r = v(r, n2, i2, a2, e[1], 4, -1530992060), a2 = v(a2, r, n2, i2, e[4], 11, 1272893353), i2 = v(i2, a2, r, n2, e[7], 16, -155497632), n2 = v(n2, i2, a2, r, e[10], 23, -1094730640), r = v(r, n2, i2, a2, e[13], 4, 681279174), a2 = v(a2, r, n2, i2, e[0], 11, -358537222), i2 = v(i2, a2, r, n2, e[3], 16, -722521979), n2 = v(n2, i2, a2, r, e[6], 23, 76029189), r = v(r, n2, i2, a2, e[9], 4, -640364487), a2 = v(a2, r, n2, i2, e[12], 11, -421815835), i2 = v(i2, a2, r, n2, e[15], 16, 530742520), r = b(r, n2 = v(n2, i2, a2, r, e[2], 23, -995338651), i2, a2, e[0], 6, -198630844), a2 = b(a2, r, n2, i2, e[7], 10, 1126891415), i2 = b(i2, a2, r, n2, e[14], 15, -1416354905), n2 = b(n2, i2, a2, r, e[5], 21, -57434055), r = b(r, n2, i2, a2, e[12], 6, 1700485571), a2 = b(a2, r, n2, i2, e[3], 10, -1894986606), i2 = b(i2, a2, r, n2, e[10], 15, -1051523), n2 = b(n2, i2, a2, r, e[1], 21, -2054922799), r = b(r, n2, i2, a2, e[8], 6, 1873313359), a2 = b(a2, r, n2, i2, e[15], 10, -30611744), i2 = b(i2, a2, r, n2, e[6], 15, -1560198380), n2 = b(n2, i2, a2, r, e[13], 21, 1309151649), r = b(r, n2, i2, a2, e[4], 6, -145523070), a2 = b(a2, r, n2, i2, e[11], 10, -1120210379), i2 = b(i2, a2, r, n2, e[2], 15, 718787259), n2 = b(n2, i2, a2, r, e[9], 21, -343485551), t3[0] = _(r, t3[0]), t3[1] = _(n2, t3[1]), t3[2] = _(i2, t3[2]), t3[3] = _(a2, t3[3]);
}
function p(t3, e, r, n2, i2, a2) {
  return e = _(_(e, t3), _(n2, a2)), _(e << i2 | e >>> 32 - i2, r);
}
function g(t3, e, r, n2, i2, a2, o2) {
  return p(e & r | ~e & n2, t3, e, i2, a2, o2);
}
function m(t3, e, r, n2, i2, a2, o2) {
  return p(e & n2 | r & ~n2, t3, e, i2, a2, o2);
}
function v(t3, e, r, n2, i2, a2, o2) {
  return p(e ^ r ^ n2, t3, e, i2, a2, o2);
}
function b(t3, e, r, n2, i2, a2, o2) {
  return p(r ^ (e | ~n2), t3, e, i2, a2, o2);
}
function y(t3) {
  var e, r = t3.length, n2 = [1732584193, -271733879, -1732584194, 271733878];
  for (e = 64; e <= t3.length; e += 64) d(n2, w(t3.substring(e - 64, e)));
  t3 = t3.substring(e - 64);
  var i2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (e = 0; e < t3.length; e++) i2[e >> 2] |= t3.charCodeAt(e) << (e % 4 << 3);
  if (i2[e >> 2] |= 128 << (e % 4 << 3), e > 55) for (d(n2, i2), e = 0; e < 16; e++) i2[e] = 0;
  return i2[14] = 8 * r, d(n2, i2), n2;
}
function w(t3) {
  var e, r = [];
  for (e = 0; e < 64; e += 4) r[e >> 2] = t3.charCodeAt(e) + (t3.charCodeAt(e + 1) << 8) + (t3.charCodeAt(e + 2) << 16) + (t3.charCodeAt(e + 3) << 24);
  return r;
}
u = n.atob.bind(n), h = n.btoa.bind(n);
var N = "0123456789abcdef".split("");
function L(t3) {
  for (var e = "", r = 0; r < 4; r++) e += N[t3 >> 8 * r + 4 & 15] + N[t3 >> 8 * r & 15];
  return e;
}
function A(t3) {
  return String.fromCharCode((255 & t3) >> 0, (65280 & t3) >> 8, (16711680 & t3) >> 16, (4278190080 & t3) >> 24);
}
function x(t3) {
  return y(t3).map(A).join("");
}
var S = "5d41402abc4b2a76b9719d911017c592" != function(t3) {
  for (var e = 0; e < t3.length; e++) t3[e] = L(t3[e]);
  return t3.join("");
}(y("hello"));
function _(t3, e) {
  if (S) {
    var r = (65535 & t3) + (65535 & e);
    return (t3 >> 16) + (e >> 16) + (r >> 16) << 16 | 65535 & r;
  }
  return t3 + e & 4294967295;
}
/**
 * @license
 * FPDF is released under a permissive license: there is no usage restriction.
 * You may embed it freely in your application (commercial or not), with or
 * without modifications.
 *
 * Reference: http://www.fpdf.org/en/script/script37.php
 */
function P(t3, e) {
  var r, n2, i2, a2;
  if (t3 !== r) {
    for (var o2 = (i2 = t3, a2 = 1 + (256 / t3.length >> 0), new Array(a2 + 1).join(i2)), s2 = [], c2 = 0; c2 < 256; c2++) s2[c2] = c2;
    var u2 = 0;
    for (c2 = 0; c2 < 256; c2++) {
      var h2 = s2[c2];
      u2 = (u2 + h2 + o2.charCodeAt(c2)) % 256, s2[c2] = s2[u2], s2[u2] = h2;
    }
    r = t3, n2 = s2;
  } else s2 = n2;
  var l2 = e.length, f2 = 0, d2 = 0, p2 = "";
  for (c2 = 0; c2 < l2; c2++) d2 = (d2 + (h2 = s2[f2 = (f2 + 1) % 256])) % 256, s2[f2] = s2[d2], s2[d2] = h2, o2 = s2[(s2[f2] + s2[d2]) % 256], p2 += String.fromCharCode(e.charCodeAt(c2) ^ o2);
  return p2;
}
/**
 * @license
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 * Author: Owen Leong (@owenl131)
 * Date: 15 Oct 2020
 * References:
 * https://www.cs.cmu.edu/~dst/Adobe/Gallery/anon21jul01-pdf-encryption.txt
 * https://github.com/foliojs/pdfkit/blob/master/lib/security.js
 * http://www.fpdf.org/en/script/script37.php
 */
var k = { print: 4, modify: 8, copy: 16, "annot-forms": 32 };
function I(t3, e, r, n2) {
  this.v = 1, this.r = 2;
  var i2 = 192;
  t3.forEach(function(t4) {
    if (void 0 !== k.perm) throw new Error("Invalid permission: " + t4);
    i2 += k[t4];
  }), this.padding = "(¿N^NuAd\0NVÿú\b..\0¶Ðh>/\f©þdSiz";
  var a2 = (e + this.padding).substr(0, 32), o2 = (r + this.padding).substr(0, 32);
  this.O = this.processOwnerPassword(a2, o2), this.P = -(1 + (255 ^ i2)), this.encryptionKey = x(a2 + this.O + this.lsbFirstWord(this.P) + this.hexToBytes(n2)).substr(0, 5), this.U = P(this.encryptionKey, this.padding);
}
function F(t3) {
  if (/[^\u0000-\u00ff]/.test(t3)) throw new Error("Invalid PDF Name Object: " + t3 + ", Only accept ASCII characters.");
  for (var e = "", r = t3.length, n2 = 0; n2 < r; n2++) {
    var i2 = t3.charCodeAt(n2);
    if (i2 < 33 || 35 === i2 || 37 === i2 || 40 === i2 || 41 === i2 || 47 === i2 || 60 === i2 || 62 === i2 || 91 === i2 || 93 === i2 || 123 === i2 || 125 === i2 || i2 > 126) e += "#" + ("0" + i2.toString(16)).slice(-2);
    else e += t3[n2];
  }
  return e;
}
function C(e) {
  if ("object" !== t(e)) throw new Error("Invalid Context passed to initialize PubSub (jsPDF-module)");
  var r = {};
  this.subscribe = function(t3, e2, n2) {
    if (n2 = n2 || false, "string" != typeof t3 || "function" != typeof e2 || "boolean" != typeof n2) throw new Error("Invalid arguments passed to PubSub.subscribe (jsPDF-module)");
    r.hasOwnProperty(t3) || (r[t3] = {});
    var i2 = Math.random().toString(35);
    return r[t3][i2] = [e2, !!n2], i2;
  }, this.unsubscribe = function(t3) {
    for (var e2 in r) if (r[e2][t3]) return delete r[e2][t3], 0 === Object.keys(r[e2]).length && delete r[e2], true;
    return false;
  }, this.publish = function(t3) {
    if (r.hasOwnProperty(t3)) {
      var i2 = Array.prototype.slice.call(arguments, 1), o2 = [];
      for (var s2 in r[t3]) {
        var c2 = r[t3][s2];
        try {
          c2[0].apply(e, i2);
        } catch (t4) {
          n.console && a.error("jsPDF PubSub Error", t4.message, t4);
        }
        c2[1] && o2.push(s2);
      }
      o2.length && o2.forEach(this.unsubscribe);
    }
  }, this.getTopics = function() {
    return r;
  };
}
function j(t3) {
  if (!(this instanceof j)) return new j(t3);
  var e = "opacity,stroke-opacity".split(",");
  for (var r in t3) t3.hasOwnProperty(r) && e.indexOf(r) >= 0 && (this[r] = t3[r]);
  this.id = "", this.objectNumber = -1;
}
function O(t3, e) {
  this.gState = t3, this.matrix = e, this.id = "", this.objectNumber = -1;
}
function B(t3, e, r, n2, i2) {
  if (!(this instanceof B)) return new B(t3, e, r, n2, i2);
  this.type = "axial" === t3 ? 2 : 3, this.coords = e, this.colors = r, O.call(this, n2, i2);
}
function M(t3, e, r, n2, i2) {
  if (!(this instanceof M)) return new M(t3, e, r, n2, i2);
  this.boundingBox = t3, this.xStep = e, this.yStep = r, this.stream = "", this.cloneIndex = 0, O.call(this, n2, i2);
}
function E(e) {
  var r, i2 = "string" == typeof arguments[0] ? arguments[0] : "p", o2 = arguments[1], s2 = arguments[2], c2 = arguments[3], u2 = [], d2 = 1, p2 = 16, g2 = "S", m2 = null;
  "object" === t(e = e || {}) && (i2 = e.orientation, o2 = e.unit || o2, s2 = e.format || s2, c2 = e.compress || e.compressPdf || c2, null !== (m2 = e.encryption || null) && (m2.userPassword = m2.userPassword || "", m2.ownerPassword = m2.ownerPassword || "", m2.userPermissions = m2.userPermissions || []), d2 = "number" == typeof e.userUnit ? Math.abs(e.userUnit) : 1, void 0 !== e.precision && (r = e.precision), void 0 !== e.floatPrecision && (p2 = e.floatPrecision), g2 = e.defaultPathOperation || "S"), u2 = e.filters || (true === c2 ? ["FlateEncode"] : u2), o2 = o2 || "mm", i2 = ("" + (i2 || "P")).toLowerCase();
  var v2 = e.putOnlyUsedFonts || false, b2 = {}, y2 = { internal: {}, __private__: {} };
  y2.__private__.PubSub = C;
  var w2 = "1.3", N2 = y2.__private__.getPdfVersion = function() {
    return w2;
  };
  y2.__private__.setPdfVersion = function(t3) {
    w2 = t3;
  };
  var L2 = { a0: [2383.94, 3370.39], a1: [1683.78, 2383.94], a2: [1190.55, 1683.78], a3: [841.89, 1190.55], a4: [595.28, 841.89], a5: [419.53, 595.28], a6: [297.64, 419.53], a7: [209.76, 297.64], a8: [147.4, 209.76], a9: [104.88, 147.4], a10: [73.7, 104.88], b0: [2834.65, 4008.19], b1: [2004.09, 2834.65], b2: [1417.32, 2004.09], b3: [1000.63, 1417.32], b4: [708.66, 1000.63], b5: [498.9, 708.66], b6: [354.33, 498.9], b7: [249.45, 354.33], b8: [175.75, 249.45], b9: [124.72, 175.75], b10: [87.87, 124.72], c0: [2599.37, 3676.54], c1: [1836.85, 2599.37], c2: [1298.27, 1836.85], c3: [918.43, 1298.27], c4: [649.13, 918.43], c5: [459.21, 649.13], c6: [323.15, 459.21], c7: [229.61, 323.15], c8: [161.57, 229.61], c9: [113.39, 161.57], c10: [79.37, 113.39], dl: [311.81, 623.62], letter: [612, 792], "government-letter": [576, 756], legal: [612, 1008], "junior-legal": [576, 360], ledger: [1224, 792], tabloid: [792, 1224], "credit-card": [153, 243] };
  y2.__private__.getPageFormats = function() {
    return L2;
  };
  var A2 = y2.__private__.getPageFormat = function(t3) {
    return L2[t3];
  };
  s2 = s2 || "a4";
  var x2 = { COMPAT: "compat", ADVANCED: "advanced" }, S2 = x2.COMPAT;
  function _2() {
    this.saveGraphicsState(), lt2(new Vt2(_t2, 0, 0, -_t2, 0, Rr() * _t2).toString() + " cm"), this.setFontSize(this.getFontSize() / _t2), g2 = "n", S2 = x2.ADVANCED;
  }
  function P2() {
    this.restoreGraphicsState(), g2 = "S", S2 = x2.COMPAT;
  }
  var k2 = y2.__private__.combineFontStyleAndFontWeight = function(t3, e2) {
    if ("bold" == t3 && "normal" == e2 || "bold" == t3 && 400 == e2 || "normal" == t3 && "italic" == e2 || "bold" == t3 && "italic" == e2) throw new Error("Invalid Combination of fontweight and fontstyle");
    return e2 && (t3 = 400 == e2 || "normal" === e2 ? "italic" === t3 ? "italic" : "normal" : 700 != e2 && "bold" !== e2 || "normal" !== t3 ? (700 == e2 ? "bold" : e2) + "" + t3 : "bold"), t3;
  };
  y2.advancedAPI = function(t3) {
    var e2 = S2 === x2.COMPAT;
    return e2 && _2.call(this), "function" != typeof t3 || (t3(this), e2 && P2.call(this)), this;
  }, y2.compatAPI = function(t3) {
    var e2 = S2 === x2.ADVANCED;
    return e2 && P2.call(this), "function" != typeof t3 || (t3(this), e2 && _2.call(this)), this;
  }, y2.isAdvancedAPI = function() {
    return S2 === x2.ADVANCED;
  };
  var O2, q2 = function(t3) {
    if (S2 !== x2.ADVANCED) throw new Error(t3 + " is only available in 'advanced' API mode. You need to call advancedAPI() first.");
  }, D2 = y2.roundToPrecision = y2.__private__.roundToPrecision = function(t3, e2) {
    var n2 = r || e2;
    if (isNaN(t3) || isNaN(n2)) throw new Error("Invalid argument passed to jsPDF.roundToPrecision");
    return t3.toFixed(n2).replace(/0+$/, "");
  };
  O2 = y2.hpf = y2.__private__.hpf = "number" == typeof p2 ? function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.hpf");
    return D2(t3, p2);
  } : "smart" === p2 ? function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.hpf");
    return D2(t3, t3 > -1 && t3 < 1 ? 16 : 5);
  } : function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.hpf");
    return D2(t3, 16);
  };
  var R2 = y2.f2 = y2.__private__.f2 = function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.f2");
    return D2(t3, 2);
  }, T2 = y2.__private__.f3 = function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.f3");
    return D2(t3, 3);
  }, U2 = y2.scale = y2.__private__.scale = function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.scale");
    return S2 === x2.COMPAT ? t3 * _t2 : S2 === x2.ADVANCED ? t3 : void 0;
  }, z2 = function(t3) {
    return S2 === x2.COMPAT ? Rr() - t3 : S2 === x2.ADVANCED ? t3 : void 0;
  }, H2 = function(t3) {
    return U2(z2(t3));
  };
  y2.__private__.setPrecision = y2.setPrecision = function(t3) {
    "number" == typeof parseInt(t3, 10) && (r = parseInt(t3, 10));
  };
  var W2, V2 = "00000000000000000000000000000000", G2 = y2.__private__.getFileId = function() {
    return V2;
  }, Y2 = y2.__private__.setFileId = function(t3) {
    return V2 = void 0 !== t3 && /^[a-fA-F0-9]{32}$/.test(t3) ? t3.toUpperCase() : V2.split("").map(function() {
      return "ABCDEF0123456789".charAt(Math.floor(16 * Math.random()));
    }).join(""), null !== m2 && (Ye = new I(m2.userPermissions, m2.userPassword, m2.ownerPassword, V2)), V2;
  };
  y2.setFileId = function(t3) {
    return Y2(t3), this;
  }, y2.getFileId = function() {
    return G2();
  };
  var J2 = y2.__private__.convertDateToPDFDate = function(t3) {
    var e2 = t3.getTimezoneOffset(), r2 = e2 < 0 ? "+" : "-", n2 = Math.floor(Math.abs(e2 / 60)), i3 = Math.abs(e2 % 60), a2 = [r2, Q2(n2), "'", Q2(i3), "'"].join("");
    return ["D:", t3.getFullYear(), Q2(t3.getMonth() + 1), Q2(t3.getDate()), Q2(t3.getHours()), Q2(t3.getMinutes()), Q2(t3.getSeconds()), a2].join("");
  }, X2 = y2.__private__.convertPDFDateToDate = function(t3) {
    var e2 = parseInt(t3.substr(2, 4), 10), r2 = parseInt(t3.substr(6, 2), 10) - 1, n2 = parseInt(t3.substr(8, 2), 10), i3 = parseInt(t3.substr(10, 2), 10), a2 = parseInt(t3.substr(12, 2), 10), o3 = parseInt(t3.substr(14, 2), 10);
    return new Date(e2, r2, n2, i3, a2, o3, 0);
  }, K2 = y2.__private__.setCreationDate = function(t3) {
    var e2;
    if (void 0 === t3 && (t3 = /* @__PURE__ */ new Date()), t3 instanceof Date) e2 = J2(t3);
    else {
      if (!/^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|-0[0-9]|-1[0-1])'(0[0-9]|[1-5][0-9])'?$/.test(t3)) throw new Error("Invalid argument passed to jsPDF.setCreationDate");
      e2 = t3;
    }
    return W2 = e2;
  }, Z2 = y2.__private__.getCreationDate = function(t3) {
    var e2 = W2;
    return "jsDate" === t3 && (e2 = X2(W2)), e2;
  };
  y2.setCreationDate = function(t3) {
    return K2(t3), this;
  }, y2.getCreationDate = function(t3) {
    return Z2(t3);
  };
  var $2, Q2 = y2.__private__.padd2 = function(t3) {
    return ("0" + parseInt(t3)).slice(-2);
  }, tt2 = y2.__private__.padd2Hex = function(t3) {
    return ("00" + (t3 = t3.toString())).substr(t3.length);
  }, et2 = 0, rt2 = [], nt2 = [], it2 = 0, at2 = [], ot2 = [], st2 = false, ct2 = nt2, ut2 = function() {
    et2 = 0, it2 = 0, nt2 = [], rt2 = [], at2 = [], Qt2 = Kt2(), te2 = Kt2();
  };
  y2.__private__.setCustomOutputDestination = function(t3) {
    st2 = true, ct2 = t3;
  };
  var ht2 = function(t3) {
    st2 || (ct2 = t3);
  };
  y2.__private__.resetCustomOutputDestination = function() {
    st2 = false, ct2 = nt2;
  };
  var lt2 = y2.__private__.out = function(t3) {
    return t3 = t3.toString(), it2 += t3.length + 1, ct2.push(t3), ct2;
  }, ft2 = y2.__private__.write = function(t3) {
    return lt2(1 === arguments.length ? t3.toString() : Array.prototype.join.call(arguments, " "));
  }, dt2 = y2.__private__.getArrayBuffer = function(t3) {
    for (var e2 = t3.length, r2 = new ArrayBuffer(e2), n2 = new Uint8Array(r2); e2--; ) n2[e2] = t3.charCodeAt(e2);
    return r2;
  }, pt2 = [["Helvetica", "helvetica", "normal", "WinAnsiEncoding"], ["Helvetica-Bold", "helvetica", "bold", "WinAnsiEncoding"], ["Helvetica-Oblique", "helvetica", "italic", "WinAnsiEncoding"], ["Helvetica-BoldOblique", "helvetica", "bolditalic", "WinAnsiEncoding"], ["Courier", "courier", "normal", "WinAnsiEncoding"], ["Courier-Bold", "courier", "bold", "WinAnsiEncoding"], ["Courier-Oblique", "courier", "italic", "WinAnsiEncoding"], ["Courier-BoldOblique", "courier", "bolditalic", "WinAnsiEncoding"], ["Times-Roman", "times", "normal", "WinAnsiEncoding"], ["Times-Bold", "times", "bold", "WinAnsiEncoding"], ["Times-Italic", "times", "italic", "WinAnsiEncoding"], ["Times-BoldItalic", "times", "bolditalic", "WinAnsiEncoding"], ["ZapfDingbats", "zapfdingbats", "normal", null], ["Symbol", "symbol", "normal", null]];
  y2.__private__.getStandardFonts = function() {
    return pt2;
  };
  var gt2 = e.fontSize || 16;
  y2.__private__.setFontSize = y2.setFontSize = function(t3) {
    return gt2 = S2 === x2.ADVANCED ? t3 / _t2 : t3, this;
  };
  var mt2, vt2 = y2.__private__.getFontSize = y2.getFontSize = function() {
    return S2 === x2.COMPAT ? gt2 : gt2 * _t2;
  }, bt2 = e.R2L || false;
  y2.__private__.setR2L = y2.setR2L = function(t3) {
    return bt2 = t3, this;
  }, y2.__private__.getR2L = y2.getR2L = function() {
    return bt2;
  };
  var yt2, wt2 = y2.__private__.setZoomMode = function(t3) {
    var e2 = [void 0, null, "fullwidth", "fullheight", "fullpage", "original"];
    if (/^(?:\d+\.\d*|\d*\.\d+|\d+)%$/.test(t3)) mt2 = t3;
    else if (isNaN(t3)) {
      if (-1 === e2.indexOf(t3)) throw new Error('zoom must be Integer (e.g. 2), a percentage Value (e.g. 300%) or fullwidth, fullheight, fullpage, original. "' + t3 + '" is not recognized.');
      mt2 = t3;
    } else mt2 = parseInt(t3, 10);
  };
  y2.__private__.getZoomMode = function() {
    return mt2;
  };
  var Nt2, Lt2 = y2.__private__.setPageMode = function(t3) {
    if (-1 == [void 0, null, "UseNone", "UseOutlines", "UseThumbs", "FullScreen"].indexOf(t3)) throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "' + t3 + '" is not recognized.');
    yt2 = t3;
  };
  y2.__private__.getPageMode = function() {
    return yt2;
  };
  var At2 = y2.__private__.setLayoutMode = function(t3) {
    if (-1 == [void 0, null, "continuous", "single", "twoleft", "tworight", "two"].indexOf(t3)) throw new Error('Layout mode must be one of continuous, single, twoleft, tworight. "' + t3 + '" is not recognized.');
    Nt2 = t3;
  };
  y2.__private__.getLayoutMode = function() {
    return Nt2;
  }, y2.__private__.setDisplayMode = y2.setDisplayMode = function(t3, e2, r2) {
    return wt2(t3), At2(e2), Lt2(r2), this;
  };
  var xt2 = { title: "", subject: "", author: "", keywords: "", creator: "" };
  y2.__private__.getDocumentProperty = function(t3) {
    if (-1 === Object.keys(xt2).indexOf(t3)) throw new Error("Invalid argument passed to jsPDF.getDocumentProperty");
    return xt2[t3];
  }, y2.__private__.getDocumentProperties = function() {
    return xt2;
  }, y2.__private__.setDocumentProperties = y2.setProperties = y2.setDocumentProperties = function(t3) {
    for (var e2 in xt2) xt2.hasOwnProperty(e2) && t3[e2] && (xt2[e2] = t3[e2]);
    return this;
  }, y2.__private__.setDocumentProperty = function(t3, e2) {
    if (-1 === Object.keys(xt2).indexOf(t3)) throw new Error("Invalid arguments passed to jsPDF.setDocumentProperty");
    return xt2[t3] = e2;
  };
  var St, _t2, Pt2, kt2, It2, Ft2 = {}, Ct2 = {}, jt2 = [], Ot2 = {}, Bt2 = {}, Mt2 = {}, Et2 = {}, qt2 = null, Dt2 = 0, Rt2 = [], Tt2 = new C(y2), Ut2 = e.hotfixes || [], zt2 = {}, Ht2 = {}, Wt2 = [], Vt2 = function t3(e2, r2, n2, i3, a2, o3) {
    if (!(this instanceof t3)) return new t3(e2, r2, n2, i3, a2, o3);
    isNaN(e2) && (e2 = 1), isNaN(r2) && (r2 = 0), isNaN(n2) && (n2 = 0), isNaN(i3) && (i3 = 1), isNaN(a2) && (a2 = 0), isNaN(o3) && (o3 = 0), this._matrix = [e2, r2, n2, i3, a2, o3];
  };
  Object.defineProperty(Vt2.prototype, "sx", { get: function() {
    return this._matrix[0];
  }, set: function(t3) {
    this._matrix[0] = t3;
  } }), Object.defineProperty(Vt2.prototype, "shy", { get: function() {
    return this._matrix[1];
  }, set: function(t3) {
    this._matrix[1] = t3;
  } }), Object.defineProperty(Vt2.prototype, "shx", { get: function() {
    return this._matrix[2];
  }, set: function(t3) {
    this._matrix[2] = t3;
  } }), Object.defineProperty(Vt2.prototype, "sy", { get: function() {
    return this._matrix[3];
  }, set: function(t3) {
    this._matrix[3] = t3;
  } }), Object.defineProperty(Vt2.prototype, "tx", { get: function() {
    return this._matrix[4];
  }, set: function(t3) {
    this._matrix[4] = t3;
  } }), Object.defineProperty(Vt2.prototype, "ty", { get: function() {
    return this._matrix[5];
  }, set: function(t3) {
    this._matrix[5] = t3;
  } }), Object.defineProperty(Vt2.prototype, "a", { get: function() {
    return this._matrix[0];
  }, set: function(t3) {
    this._matrix[0] = t3;
  } }), Object.defineProperty(Vt2.prototype, "b", { get: function() {
    return this._matrix[1];
  }, set: function(t3) {
    this._matrix[1] = t3;
  } }), Object.defineProperty(Vt2.prototype, "c", { get: function() {
    return this._matrix[2];
  }, set: function(t3) {
    this._matrix[2] = t3;
  } }), Object.defineProperty(Vt2.prototype, "d", { get: function() {
    return this._matrix[3];
  }, set: function(t3) {
    this._matrix[3] = t3;
  } }), Object.defineProperty(Vt2.prototype, "e", { get: function() {
    return this._matrix[4];
  }, set: function(t3) {
    this._matrix[4] = t3;
  } }), Object.defineProperty(Vt2.prototype, "f", { get: function() {
    return this._matrix[5];
  }, set: function(t3) {
    this._matrix[5] = t3;
  } }), Object.defineProperty(Vt2.prototype, "rotation", { get: function() {
    return Math.atan2(this.shx, this.sx);
  } }), Object.defineProperty(Vt2.prototype, "scaleX", { get: function() {
    return this.decompose().scale.sx;
  } }), Object.defineProperty(Vt2.prototype, "scaleY", { get: function() {
    return this.decompose().scale.sy;
  } }), Object.defineProperty(Vt2.prototype, "isIdentity", { get: function() {
    return 1 === this.sx && (0 === this.shy && (0 === this.shx && (1 === this.sy && (0 === this.tx && 0 === this.ty))));
  } }), Vt2.prototype.join = function(t3) {
    return [this.sx, this.shy, this.shx, this.sy, this.tx, this.ty].map(O2).join(t3);
  }, Vt2.prototype.multiply = function(t3) {
    var e2 = t3.sx * this.sx + t3.shy * this.shx, r2 = t3.sx * this.shy + t3.shy * this.sy, n2 = t3.shx * this.sx + t3.sy * this.shx, i3 = t3.shx * this.shy + t3.sy * this.sy, a2 = t3.tx * this.sx + t3.ty * this.shx + this.tx, o3 = t3.tx * this.shy + t3.ty * this.sy + this.ty;
    return new Vt2(e2, r2, n2, i3, a2, o3);
  }, Vt2.prototype.decompose = function() {
    var t3 = this.sx, e2 = this.shy, r2 = this.shx, n2 = this.sy, i3 = this.tx, a2 = this.ty, o3 = Math.sqrt(t3 * t3 + e2 * e2), s3 = (t3 /= o3) * r2 + (e2 /= o3) * n2;
    r2 -= t3 * s3, n2 -= e2 * s3;
    var c3 = Math.sqrt(r2 * r2 + n2 * n2);
    return s3 /= c3, t3 * (n2 /= c3) < e2 * (r2 /= c3) && (t3 = -t3, e2 = -e2, s3 = -s3, o3 = -o3), { scale: new Vt2(o3, 0, 0, c3, 0, 0), translate: new Vt2(1, 0, 0, 1, i3, a2), rotate: new Vt2(t3, e2, -e2, t3, 0, 0), skew: new Vt2(1, 0, s3, 1, 0, 0) };
  }, Vt2.prototype.toString = function(t3) {
    return this.join(" ");
  }, Vt2.prototype.inversed = function() {
    var t3 = this.sx, e2 = this.shy, r2 = this.shx, n2 = this.sy, i3 = this.tx, a2 = this.ty, o3 = 1 / (t3 * n2 - e2 * r2), s3 = n2 * o3, c3 = -e2 * o3, u3 = -r2 * o3, h2 = t3 * o3;
    return new Vt2(s3, c3, u3, h2, -s3 * i3 - u3 * a2, -c3 * i3 - h2 * a2);
  }, Vt2.prototype.applyToPoint = function(t3) {
    var e2 = t3.x * this.sx + t3.y * this.shx + this.tx, r2 = t3.x * this.shy + t3.y * this.sy + this.ty;
    return new Cr(e2, r2);
  }, Vt2.prototype.applyToRectangle = function(t3) {
    var e2 = this.applyToPoint(t3), r2 = this.applyToPoint(new Cr(t3.x + t3.w, t3.y + t3.h));
    return new jr(e2.x, e2.y, r2.x - e2.x, r2.y - e2.y);
  }, Vt2.prototype.clone = function() {
    var t3 = this.sx, e2 = this.shy, r2 = this.shx, n2 = this.sy, i3 = this.tx, a2 = this.ty;
    return new Vt2(t3, e2, r2, n2, i3, a2);
  }, y2.Matrix = Vt2;
  var Gt2 = y2.matrixMult = function(t3, e2) {
    return e2.multiply(t3);
  }, Yt2 = new Vt2(1, 0, 0, 1, 0, 0);
  y2.unitMatrix = y2.identityMatrix = Yt2;
  var Jt2 = function(t3, e2) {
    if (!Bt2[t3]) {
      var r2 = (e2 instanceof B ? "Sh" : "P") + (Object.keys(Ot2).length + 1).toString(10);
      e2.id = r2, Bt2[t3] = r2, Ot2[r2] = e2, Tt2.publish("addPattern", e2);
    }
  };
  y2.ShadingPattern = B, y2.TilingPattern = M, y2.addShadingPattern = function(t3, e2) {
    return q2("addShadingPattern()"), Jt2(t3, e2), this;
  }, y2.beginTilingPattern = function(t3) {
    q2("beginTilingPattern()"), Br(t3.boundingBox[0], t3.boundingBox[1], t3.boundingBox[2] - t3.boundingBox[0], t3.boundingBox[3] - t3.boundingBox[1], t3.matrix);
  }, y2.endTilingPattern = function(t3, e2) {
    q2("endTilingPattern()"), e2.stream = ot2[$2].join("\n"), Jt2(t3, e2), Tt2.publish("endTilingPattern", e2), Wt2.pop().restore();
  };
  var Xt2 = y2.__private__.newObject = function() {
    var t3 = Kt2();
    return Zt2(t3, true), t3;
  }, Kt2 = y2.__private__.newObjectDeferred = function() {
    return et2++, rt2[et2] = function() {
      return it2;
    }, et2;
  }, Zt2 = function(t3, e2) {
    return e2 = "boolean" == typeof e2 && e2, rt2[t3] = it2, e2 && lt2(t3 + " 0 obj"), t3;
  }, $t2 = y2.__private__.newAdditionalObject = function() {
    var t3 = { objId: Kt2(), content: "" };
    return at2.push(t3), t3;
  }, Qt2 = Kt2(), te2 = Kt2(), ee2 = y2.__private__.decodeColorString = function(t3) {
    var e2 = t3.split(" ");
    if (2 !== e2.length || "g" !== e2[1] && "G" !== e2[1]) {
      if (5 === e2.length && ("k" === e2[4] || "K" === e2[4])) {
        e2 = [(1 - e2[0]) * (1 - e2[3]), (1 - e2[1]) * (1 - e2[3]), (1 - e2[2]) * (1 - e2[3]), "r"];
      }
    } else {
      var r2 = parseFloat(e2[0]);
      e2 = [r2, r2, r2, "r"];
    }
    for (var n2 = "#", i3 = 0; i3 < 3; i3++) n2 += ("0" + Math.floor(255 * parseFloat(e2[i3])).toString(16)).slice(-2);
    return n2;
  }, re2 = y2.__private__.encodeColorString = function(e2) {
    var r2;
    "string" == typeof e2 && (e2 = { ch1: e2 });
    var n2 = e2.ch1, i3 = e2.ch2, a2 = e2.ch3, o3 = e2.ch4, s3 = "draw" === e2.pdfColorType ? ["G", "RG", "K"] : ["g", "rg", "k"];
    if ("string" == typeof n2 && "#" !== n2.charAt(0)) {
      var c3 = new f(n2);
      if (c3.ok) n2 = c3.toHex();
      else if (!/^\d*\.?\d*$/.test(n2)) throw new Error('Invalid color "' + n2 + '" passed to jsPDF.encodeColorString.');
    }
    if ("string" == typeof n2 && /^#[0-9A-Fa-f]{3}$/.test(n2) && (n2 = "#" + n2[1] + n2[1] + n2[2] + n2[2] + n2[3] + n2[3]), "string" == typeof n2 && /^#[0-9A-Fa-f]{6}$/.test(n2)) {
      var u3 = parseInt(n2.substr(1), 16);
      n2 = u3 >> 16 & 255, i3 = u3 >> 8 & 255, a2 = 255 & u3;
    }
    if (void 0 === i3 || void 0 === o3 && n2 === i3 && i3 === a2) if ("string" == typeof n2) r2 = n2 + " " + s3[0];
    else switch (e2.precision) {
      case 2:
        r2 = R2(n2 / 255) + " " + s3[0];
        break;
      case 3:
      default:
        r2 = T2(n2 / 255) + " " + s3[0];
    }
    else if (void 0 === o3 || "object" === t(o3)) {
      if (o3 && !isNaN(o3.a) && 0 === o3.a) return r2 = ["1.", "1.", "1.", s3[1]].join(" ");
      if ("string" == typeof n2) r2 = [n2, i3, a2, s3[1]].join(" ");
      else switch (e2.precision) {
        case 2:
          r2 = [R2(n2 / 255), R2(i3 / 255), R2(a2 / 255), s3[1]].join(" ");
          break;
        default:
        case 3:
          r2 = [T2(n2 / 255), T2(i3 / 255), T2(a2 / 255), s3[1]].join(" ");
      }
    } else if ("string" == typeof n2) r2 = [n2, i3, a2, o3, s3[2]].join(" ");
    else switch (e2.precision) {
      case 2:
        r2 = [R2(n2), R2(i3), R2(a2), R2(o3), s3[2]].join(" ");
        break;
      case 3:
      default:
        r2 = [T2(n2), T2(i3), T2(a2), T2(o3), s3[2]].join(" ");
    }
    return r2;
  }, ne2 = y2.__private__.getFilters = function() {
    return u2;
  }, ie2 = y2.__private__.putStream = function(t3) {
    var e2 = (t3 = t3 || {}).data || "", r2 = t3.filters || ne2(), n2 = t3.alreadyAppliedFilters || [], i3 = t3.addLength1 || false, a2 = e2.length, o3 = t3.objectId, s3 = function(t4) {
      return t4;
    };
    if (null !== m2 && void 0 === o3) throw new Error("ObjectId must be passed to putStream for file encryption");
    null !== m2 && (s3 = Ye.encryptor(o3, 0));
    var c3 = {};
    true === r2 && (r2 = ["FlateEncode"]);
    var u3 = t3.additionalKeyValues || [], h2 = (c3 = void 0 !== E.API.processDataByFilters ? E.API.processDataByFilters(e2, r2) : { data: e2, reverseChain: [] }).reverseChain + (Array.isArray(n2) ? n2.join(" ") : n2.toString());
    if (0 !== c3.data.length && (u3.push({ key: "Length", value: c3.data.length }), true === i3 && u3.push({ key: "Length1", value: a2 })), 0 != h2.length) if (h2.split("/").length - 1 == 1) u3.push({ key: "Filter", value: h2 });
    else {
      u3.push({ key: "Filter", value: "[" + h2 + "]" });
      for (var l2 = 0; l2 < u3.length; l2 += 1) if ("DecodeParms" === u3[l2].key) {
        for (var f2 = [], d3 = 0; d3 < c3.reverseChain.split("/").length - 1; d3 += 1) f2.push("null");
        f2.push(u3[l2].value), u3[l2].value = "[" + f2.join(" ") + "]";
      }
    }
    lt2("<<");
    for (var p3 = 0; p3 < u3.length; p3++) lt2("/" + u3[p3].key + " " + u3[p3].value);
    lt2(">>"), 0 !== c3.data.length && (lt2("stream"), lt2(s3(c3.data)), lt2("endstream"));
  }, ae2 = y2.__private__.putPage = function(t3) {
    var e2 = t3.number, r2 = t3.data, n2 = t3.objId, i3 = t3.contentsObjId;
    Zt2(n2, true), lt2("<</Type /Page"), lt2("/Parent " + t3.rootDictionaryObjId + " 0 R"), lt2("/Resources " + t3.resourceDictionaryObjId + " 0 R"), lt2("/MediaBox [" + parseFloat(O2(t3.mediaBox.bottomLeftX)) + " " + parseFloat(O2(t3.mediaBox.bottomLeftY)) + " " + O2(t3.mediaBox.topRightX) + " " + O2(t3.mediaBox.topRightY) + "]"), null !== t3.cropBox && lt2("/CropBox [" + O2(t3.cropBox.bottomLeftX) + " " + O2(t3.cropBox.bottomLeftY) + " " + O2(t3.cropBox.topRightX) + " " + O2(t3.cropBox.topRightY) + "]"), null !== t3.bleedBox && lt2("/BleedBox [" + O2(t3.bleedBox.bottomLeftX) + " " + O2(t3.bleedBox.bottomLeftY) + " " + O2(t3.bleedBox.topRightX) + " " + O2(t3.bleedBox.topRightY) + "]"), null !== t3.trimBox && lt2("/TrimBox [" + O2(t3.trimBox.bottomLeftX) + " " + O2(t3.trimBox.bottomLeftY) + " " + O2(t3.trimBox.topRightX) + " " + O2(t3.trimBox.topRightY) + "]"), null !== t3.artBox && lt2("/ArtBox [" + O2(t3.artBox.bottomLeftX) + " " + O2(t3.artBox.bottomLeftY) + " " + O2(t3.artBox.topRightX) + " " + O2(t3.artBox.topRightY) + "]"), "number" == typeof t3.userUnit && 1 !== t3.userUnit && lt2("/UserUnit " + t3.userUnit), Tt2.publish("putPage", { objId: n2, pageContext: Rt2[e2], pageNumber: e2, page: r2 }), lt2("/Contents " + i3 + " 0 R"), lt2(">>"), lt2("endobj");
    var a2 = r2.join("\n");
    return S2 === x2.ADVANCED && (a2 += "\nQ"), Zt2(i3, true), ie2({ data: a2, filters: ne2(), objectId: i3 }), lt2("endobj"), n2;
  }, oe2 = y2.__private__.putPages = function() {
    var t3, e2, r2 = [];
    for (t3 = 1; t3 <= Dt2; t3++) Rt2[t3].objId = Kt2(), Rt2[t3].contentsObjId = Kt2();
    for (t3 = 1; t3 <= Dt2; t3++) r2.push(ae2({ number: t3, data: ot2[t3], objId: Rt2[t3].objId, contentsObjId: Rt2[t3].contentsObjId, mediaBox: Rt2[t3].mediaBox, cropBox: Rt2[t3].cropBox, bleedBox: Rt2[t3].bleedBox, trimBox: Rt2[t3].trimBox, artBox: Rt2[t3].artBox, userUnit: Rt2[t3].userUnit, rootDictionaryObjId: Qt2, resourceDictionaryObjId: te2 }));
    Zt2(Qt2, true), lt2("<</Type /Pages");
    var n2 = "/Kids [";
    for (e2 = 0; e2 < Dt2; e2++) n2 += r2[e2] + " 0 R ";
    lt2(n2 + "]"), lt2("/Count " + Dt2), lt2(">>"), lt2("endobj"), Tt2.publish("postPutPages");
  }, se2 = function(t3) {
    Tt2.publish("putFont", { font: t3, out: lt2, newObject: Xt2, putStream: ie2 }), true !== t3.isAlreadyPutted && (t3.objectNumber = Xt2(), lt2("<<"), lt2("/Type /Font"), lt2("/BaseFont /" + F(t3.postScriptName)), lt2("/Subtype /Type1"), "string" == typeof t3.encoding && lt2("/Encoding /" + t3.encoding), lt2("/FirstChar 32"), lt2("/LastChar 255"), lt2(">>"), lt2("endobj"));
  }, ce2 = function() {
    for (var t3 in Ft2) Ft2.hasOwnProperty(t3) && (false === v2 || true === v2 && b2.hasOwnProperty(t3)) && se2(Ft2[t3]);
  }, ue2 = function(t3) {
    t3.objectNumber = Xt2();
    var e2 = [];
    e2.push({ key: "Type", value: "/XObject" }), e2.push({ key: "Subtype", value: "/Form" }), e2.push({ key: "BBox", value: "[" + [O2(t3.x), O2(t3.y), O2(t3.x + t3.width), O2(t3.y + t3.height)].join(" ") + "]" }), e2.push({ key: "Matrix", value: "[" + t3.matrix.toString() + "]" });
    var r2 = t3.pages[1].join("\n");
    ie2({ data: r2, additionalKeyValues: e2, objectId: t3.objectNumber }), lt2("endobj");
  }, he2 = function() {
    for (var t3 in zt2) zt2.hasOwnProperty(t3) && ue2(zt2[t3]);
  }, le2 = function(t3, e2) {
    var r2, n2 = [], i3 = 1 / (e2 - 1);
    for (r2 = 0; r2 < 1; r2 += i3) n2.push(r2);
    if (n2.push(1), 0 != t3[0].offset) {
      var a2 = { offset: 0, color: t3[0].color };
      t3.unshift(a2);
    }
    if (1 != t3[t3.length - 1].offset) {
      var o3 = { offset: 1, color: t3[t3.length - 1].color };
      t3.push(o3);
    }
    for (var s3 = "", c3 = 0, u3 = 0; u3 < n2.length; u3++) {
      for (r2 = n2[u3]; r2 > t3[c3 + 1].offset; ) c3++;
      var h2 = t3[c3].offset, l2 = (r2 - h2) / (t3[c3 + 1].offset - h2), f2 = t3[c3].color, d3 = t3[c3 + 1].color;
      s3 += tt2(Math.round((1 - l2) * f2[0] + l2 * d3[0]).toString(16)) + tt2(Math.round((1 - l2) * f2[1] + l2 * d3[1]).toString(16)) + tt2(Math.round((1 - l2) * f2[2] + l2 * d3[2]).toString(16));
    }
    return s3.trim();
  }, fe2 = function(t3, e2) {
    e2 || (e2 = 21);
    var r2 = Xt2(), n2 = le2(t3.colors, e2), i3 = [];
    i3.push({ key: "FunctionType", value: "0" }), i3.push({ key: "Domain", value: "[0.0 1.0]" }), i3.push({ key: "Size", value: "[" + e2 + "]" }), i3.push({ key: "BitsPerSample", value: "8" }), i3.push({ key: "Range", value: "[0.0 1.0 0.0 1.0 0.0 1.0]" }), i3.push({ key: "Decode", value: "[0.0 1.0 0.0 1.0 0.0 1.0]" }), ie2({ data: n2, additionalKeyValues: i3, alreadyAppliedFilters: ["/ASCIIHexDecode"], objectId: r2 }), lt2("endobj"), t3.objectNumber = Xt2(), lt2("<< /ShadingType " + t3.type), lt2("/ColorSpace /DeviceRGB");
    var a2 = "/Coords [" + O2(parseFloat(t3.coords[0])) + " " + O2(parseFloat(t3.coords[1])) + " ";
    2 === t3.type ? a2 += O2(parseFloat(t3.coords[2])) + " " + O2(parseFloat(t3.coords[3])) : a2 += O2(parseFloat(t3.coords[2])) + " " + O2(parseFloat(t3.coords[3])) + " " + O2(parseFloat(t3.coords[4])) + " " + O2(parseFloat(t3.coords[5])), lt2(a2 += "]"), t3.matrix && lt2("/Matrix [" + t3.matrix.toString() + "]"), lt2("/Function " + r2 + " 0 R"), lt2("/Extend [true true]"), lt2(">>"), lt2("endobj");
  }, de2 = function(t3, e2) {
    var r2 = Kt2(), n2 = Xt2();
    e2.push({ resourcesOid: r2, objectOid: n2 }), t3.objectNumber = n2;
    var i3 = [];
    i3.push({ key: "Type", value: "/Pattern" }), i3.push({ key: "PatternType", value: "1" }), i3.push({ key: "PaintType", value: "1" }), i3.push({ key: "TilingType", value: "1" }), i3.push({ key: "BBox", value: "[" + t3.boundingBox.map(O2).join(" ") + "]" }), i3.push({ key: "XStep", value: O2(t3.xStep) }), i3.push({ key: "YStep", value: O2(t3.yStep) }), i3.push({ key: "Resources", value: r2 + " 0 R" }), t3.matrix && i3.push({ key: "Matrix", value: "[" + t3.matrix.toString() + "]" }), ie2({ data: t3.stream, additionalKeyValues: i3, objectId: t3.objectNumber }), lt2("endobj");
  }, pe2 = function(t3) {
    var e2;
    for (e2 in Ot2) Ot2.hasOwnProperty(e2) && (Ot2[e2] instanceof B ? fe2(Ot2[e2]) : Ot2[e2] instanceof M && de2(Ot2[e2], t3));
  }, ge2 = function(t3) {
    for (var e2 in t3.objectNumber = Xt2(), lt2("<<"), t3) switch (e2) {
      case "opacity":
        lt2("/ca " + R2(t3[e2]));
        break;
      case "stroke-opacity":
        lt2("/CA " + R2(t3[e2]));
    }
    lt2(">>"), lt2("endobj");
  }, me2 = function() {
    var t3;
    for (t3 in Mt2) Mt2.hasOwnProperty(t3) && ge2(Mt2[t3]);
  }, ve2 = function() {
    for (var t3 in lt2("/XObject <<"), zt2) zt2.hasOwnProperty(t3) && zt2[t3].objectNumber >= 0 && lt2("/" + t3 + " " + zt2[t3].objectNumber + " 0 R");
    Tt2.publish("putXobjectDict"), lt2(">>");
  }, be2 = function() {
    Ye.oid = Xt2(), lt2("<<"), lt2("/Filter /Standard"), lt2("/V " + Ye.v), lt2("/R " + Ye.r), lt2("/U <" + Ye.toHexString(Ye.U) + ">"), lt2("/O <" + Ye.toHexString(Ye.O) + ">"), lt2("/P " + Ye.P), lt2(">>"), lt2("endobj");
  }, ye2 = function() {
    for (var t3 in lt2("/Font <<"), Ft2) Ft2.hasOwnProperty(t3) && (false === v2 || true === v2 && b2.hasOwnProperty(t3)) && lt2("/" + t3 + " " + Ft2[t3].objectNumber + " 0 R");
    lt2(">>");
  }, we2 = function() {
    if (Object.keys(Ot2).length > 0) {
      for (var t3 in lt2("/Shading <<"), Ot2) Ot2.hasOwnProperty(t3) && Ot2[t3] instanceof B && Ot2[t3].objectNumber >= 0 && lt2("/" + t3 + " " + Ot2[t3].objectNumber + " 0 R");
      Tt2.publish("putShadingPatternDict"), lt2(">>");
    }
  }, Ne2 = function(t3) {
    if (Object.keys(Ot2).length > 0) {
      for (var e2 in lt2("/Pattern <<"), Ot2) Ot2.hasOwnProperty(e2) && Ot2[e2] instanceof y2.TilingPattern && Ot2[e2].objectNumber >= 0 && Ot2[e2].objectNumber < t3 && lt2("/" + e2 + " " + Ot2[e2].objectNumber + " 0 R");
      Tt2.publish("putTilingPatternDict"), lt2(">>");
    }
  }, Le2 = function() {
    if (Object.keys(Mt2).length > 0) {
      var t3;
      for (t3 in lt2("/ExtGState <<"), Mt2) Mt2.hasOwnProperty(t3) && Mt2[t3].objectNumber >= 0 && lt2("/" + t3 + " " + Mt2[t3].objectNumber + " 0 R");
      Tt2.publish("putGStateDict"), lt2(">>");
    }
  }, Ae = function(t3) {
    Zt2(t3.resourcesOid, true), lt2("<<"), lt2("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]"), ye2(), we2(), Ne2(t3.objectOid), Le2(), ve2(), lt2(">>"), lt2("endobj");
  }, xe = function() {
    var t3 = [];
    ce2(), me2(), he2(), pe2(t3), Tt2.publish("putResources"), t3.forEach(Ae), Ae({ resourcesOid: te2, objectOid: Number.MAX_SAFE_INTEGER }), Tt2.publish("postPutResources");
  }, Se = function() {
    Tt2.publish("putAdditionalObjects");
    for (var t3 = 0; t3 < at2.length; t3++) {
      var e2 = at2[t3];
      Zt2(e2.objId, true), lt2(e2.content), lt2("endobj");
    }
    Tt2.publish("postPutAdditionalObjects");
  }, _e = function(t3) {
    Ct2[t3.fontName] = Ct2[t3.fontName] || {}, Ct2[t3.fontName][t3.fontStyle] = t3.id;
  }, Pe = function(t3, e2, r2, n2, i3) {
    var a2 = { id: "F" + (Object.keys(Ft2).length + 1).toString(10), postScriptName: t3, fontName: e2, fontStyle: r2, encoding: n2, isStandardFont: i3 || false, metadata: {} };
    return Tt2.publish("addFont", { font: a2, instance: this }), Ft2[a2.id] = a2, _e(a2), a2.id;
  }, ke = function(t3) {
    for (var e2 = 0, r2 = pt2.length; e2 < r2; e2++) {
      var n2 = Pe.call(this, t3[e2][0], t3[e2][1], t3[e2][2], pt2[e2][3], true);
      false === v2 && (b2[n2] = true);
      var i3 = t3[e2][0].split("-");
      _e({ id: n2, fontName: i3[0], fontStyle: i3[1] || "" });
    }
    Tt2.publish("addFonts", { fonts: Ft2, dictionary: Ct2 });
  }, Ie = function(t3) {
    return t3.foo = function() {
      try {
        return t3.apply(this, arguments);
      } catch (t4) {
        var e2 = t4.stack || "";
        ~e2.indexOf(" at ") && (e2 = e2.split(" at ")[1]);
        var r2 = "Error in function " + e2.split("\n")[0].split("<")[0] + ": " + t4.message;
        if (!n.console) throw new Error(r2);
        n.console.error(r2, t4), n.alert && alert(r2);
      }
    }, t3.foo.bar = t3, t3.foo;
  }, Fe = function(t3, e2) {
    var r2, n2, i3, a2, o3, s3, c3, u3, h2;
    if (i3 = (e2 = e2 || {}).sourceEncoding || "Unicode", o3 = e2.outputEncoding, (e2.autoencode || o3) && Ft2[St].metadata && Ft2[St].metadata[i3] && Ft2[St].metadata[i3].encoding && (a2 = Ft2[St].metadata[i3].encoding, !o3 && Ft2[St].encoding && (o3 = Ft2[St].encoding), !o3 && a2.codePages && (o3 = a2.codePages[0]), "string" == typeof o3 && (o3 = a2[o3]), o3)) {
      for (c3 = false, s3 = [], r2 = 0, n2 = t3.length; r2 < n2; r2++) (u3 = o3[t3.charCodeAt(r2)]) ? s3.push(String.fromCharCode(u3)) : s3.push(t3[r2]), s3[r2].charCodeAt(0) >> 8 && (c3 = true);
      t3 = s3.join("");
    }
    for (r2 = t3.length; void 0 === c3 && 0 !== r2; ) t3.charCodeAt(r2 - 1) >> 8 && (c3 = true), r2--;
    if (!c3) return t3;
    for (s3 = e2.noBOM ? [] : [254, 255], r2 = 0, n2 = t3.length; r2 < n2; r2++) {
      if ((h2 = (u3 = t3.charCodeAt(r2)) >> 8) >> 8) throw new Error("Character at position " + r2 + " of string '" + t3 + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
      s3.push(h2), s3.push(u3 - (h2 << 8));
    }
    return String.fromCharCode.apply(void 0, s3);
  }, Ce = y2.__private__.pdfEscape = y2.pdfEscape = function(t3, e2) {
    return Fe(t3, e2).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }, je = y2.__private__.beginPage = function(t3) {
    ot2[++Dt2] = [], Rt2[Dt2] = { objId: 0, contentsObjId: 0, userUnit: Number(d2), artBox: null, bleedBox: null, cropBox: null, trimBox: null, mediaBox: { bottomLeftX: 0, bottomLeftY: 0, topRightX: Number(t3[0]), topRightY: Number(t3[1]) } }, Me(Dt2), ht2(ot2[$2]);
  }, Oe = function(t3, e2) {
    var r2, n2, o3;
    switch (i2 = e2 || i2, "string" == typeof t3 && (r2 = A2(t3.toLowerCase()), Array.isArray(r2) && (n2 = r2[0], o3 = r2[1])), Array.isArray(t3) && (n2 = t3[0] * _t2, o3 = t3[1] * _t2), isNaN(n2) && (n2 = s2[0], o3 = s2[1]), (n2 > 14400 || o3 > 14400) && (a.warn("A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400"), n2 = Math.min(14400, n2), o3 = Math.min(14400, o3)), s2 = [n2, o3], i2.substr(0, 1)) {
      case "l":
        o3 > n2 && (s2 = [o3, n2]);
        break;
      case "p":
        n2 > o3 && (s2 = [o3, n2]);
    }
    je(s2), pr(fr), lt2(Lr), 0 !== kr && lt2(kr + " J"), 0 !== Ir && lt2(Ir + " j"), Tt2.publish("addPage", { pageNumber: Dt2 });
  }, Be = function(t3) {
    t3 > 0 && t3 <= Dt2 && (ot2.splice(t3, 1), Rt2.splice(t3, 1), Dt2--, $2 > Dt2 && ($2 = Dt2), this.setPage($2));
  }, Me = function(t3) {
    t3 > 0 && t3 <= Dt2 && ($2 = t3);
  }, Ee = y2.__private__.getNumberOfPages = y2.getNumberOfPages = function() {
    return ot2.length - 1;
  }, qe = function(t3, e2, r2) {
    var n2, i3 = void 0;
    return r2 = r2 || {}, t3 = void 0 !== t3 ? t3 : Ft2[St].fontName, e2 = void 0 !== e2 ? e2 : Ft2[St].fontStyle, n2 = t3.toLowerCase(), void 0 !== Ct2[n2] && void 0 !== Ct2[n2][e2] ? i3 = Ct2[n2][e2] : void 0 !== Ct2[t3] && void 0 !== Ct2[t3][e2] ? i3 = Ct2[t3][e2] : false === r2.disableWarning && a.warn("Unable to look up font label for font '" + t3 + "', '" + e2 + "'. Refer to getFontList() for available fonts."), i3 || r2.noFallback || null == (i3 = Ct2.times[e2]) && (i3 = Ct2.times.normal), i3;
  }, De = y2.__private__.putInfo = function() {
    var t3 = Xt2(), e2 = function(t4) {
      return t4;
    };
    for (var r2 in null !== m2 && (e2 = Ye.encryptor(t3, 0)), lt2("<<"), lt2("/Producer (" + Ce(e2("jsPDF " + E.version)) + ")"), xt2) xt2.hasOwnProperty(r2) && xt2[r2] && lt2("/" + r2.substr(0, 1).toUpperCase() + r2.substr(1) + " (" + Ce(e2(xt2[r2])) + ")");
    lt2("/CreationDate (" + Ce(e2(W2)) + ")"), lt2(">>"), lt2("endobj");
  }, Re = y2.__private__.putCatalog = function(t3) {
    var e2 = (t3 = t3 || {}).rootDictionaryObjId || Qt2;
    switch (Xt2(), lt2("<<"), lt2("/Type /Catalog"), lt2("/Pages " + e2 + " 0 R"), mt2 || (mt2 = "fullwidth"), mt2) {
      case "fullwidth":
        lt2("/OpenAction [3 0 R /FitH null]");
        break;
      case "fullheight":
        lt2("/OpenAction [3 0 R /FitV null]");
        break;
      case "fullpage":
        lt2("/OpenAction [3 0 R /Fit]");
        break;
      case "original":
        lt2("/OpenAction [3 0 R /XYZ null null 1]");
        break;
      default:
        var r2 = "" + mt2;
        "%" === r2.substr(r2.length - 1) && (mt2 = parseInt(mt2) / 100), "number" == typeof mt2 && lt2("/OpenAction [3 0 R /XYZ null null " + R2(mt2) + "]");
    }
    switch (Nt2 || (Nt2 = "continuous"), Nt2) {
      case "continuous":
        lt2("/PageLayout /OneColumn");
        break;
      case "single":
        lt2("/PageLayout /SinglePage");
        break;
      case "two":
      case "twoleft":
        lt2("/PageLayout /TwoColumnLeft");
        break;
      case "tworight":
        lt2("/PageLayout /TwoColumnRight");
    }
    yt2 && lt2("/PageMode /" + yt2), Tt2.publish("putCatalog"), lt2(">>"), lt2("endobj");
  }, Te = y2.__private__.putTrailer = function() {
    lt2("trailer"), lt2("<<"), lt2("/Size " + (et2 + 1)), lt2("/Root " + et2 + " 0 R"), lt2("/Info " + (et2 - 1) + " 0 R"), null !== m2 && lt2("/Encrypt " + Ye.oid + " 0 R"), lt2("/ID [ <" + V2 + "> <" + V2 + "> ]"), lt2(">>");
  }, Ue = y2.__private__.putHeader = function() {
    lt2("%PDF-" + w2), lt2("%ºß¬à");
  }, ze = y2.__private__.putXRef = function() {
    var t3 = "0000000000";
    lt2("xref"), lt2("0 " + (et2 + 1)), lt2("0000000000 65535 f ");
    for (var e2 = 1; e2 <= et2; e2++) {
      "function" == typeof rt2[e2] ? lt2((t3 + rt2[e2]()).slice(-10) + " 00000 n ") : void 0 !== rt2[e2] ? lt2((t3 + rt2[e2]).slice(-10) + " 00000 n ") : lt2("0000000000 00000 n ");
    }
  }, He = y2.__private__.buildDocument = function() {
    ut2(), ht2(nt2), Tt2.publish("buildDocument"), Ue(), oe2(), Se(), xe(), null !== m2 && be2(), De(), Re();
    var t3 = it2;
    return ze(), Te(), lt2("startxref"), lt2("" + t3), lt2("%%EOF"), ht2(ot2[$2]), nt2.join("\n");
  }, We = y2.__private__.getBlob = function(t3) {
    return new Blob([dt2(t3)], { type: "application/pdf" });
  }, Ve = y2.output = y2.__private__.output = Ie(function(t3, e2) {
    switch ("string" == typeof (e2 = e2 || {}) ? e2 = { filename: e2 } : e2.filename = e2.filename || "generated.pdf", t3) {
      case void 0:
        return He();
      case "save":
        y2.save(e2.filename);
        break;
      case "arraybuffer":
        return dt2(He());
      case "blob":
        return We(He());
      case "bloburi":
      case "bloburl":
        if (void 0 !== n.URL && "function" == typeof n.URL.createObjectURL) return n.URL && n.URL.createObjectURL(We(He())) || void 0;
        a.warn("bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.");
        break;
      case "datauristring":
      case "dataurlstring":
        var r2 = "", i3 = He();
        try {
          r2 = h(i3);
        } catch (t4) {
          r2 = h(unescape(encodeURIComponent(i3)));
        }
        return "data:application/pdf;filename=" + e2.filename + ";base64," + r2;
      case "pdfobjectnewwindow":
        if ("[object Window]" === Object.prototype.toString.call(n)) {
          var o3 = "https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js", s3 = ' integrity="sha512-4ze/a9/4jqu+tX9dfOqJYSvyYd5M6qum/3HpCLr+/Jqf0whc37VUbkpNGHR7/8pSnCFw47T1fmIpwBV7UySh3g==" crossorigin="anonymous"';
          e2.pdfObjectUrl && (o3 = e2.pdfObjectUrl, s3 = "");
          var c3 = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><script src="' + o3 + '"' + s3 + '><\/script><script >PDFObject.embed("' + this.output("dataurlstring") + '", ' + JSON.stringify(e2) + ");<\/script></body></html>", u3 = n.open();
          return null !== u3 && u3.document.write(c3), u3;
        }
        throw new Error("The option pdfobjectnewwindow just works in a browser-environment.");
      case "pdfjsnewwindow":
        if ("[object Window]" === Object.prototype.toString.call(n)) {
          var l2 = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe id="pdfViewer" src="' + (e2.pdfJsUrl || "examples/PDF.js/web/viewer.html") + "?file=&downloadName=" + e2.filename + '" width="500px" height="400px" /></body></html>', f2 = n.open();
          if (null !== f2) {
            f2.document.write(l2);
            var d3 = this;
            f2.document.documentElement.querySelector("#pdfViewer").onload = function() {
              f2.document.title = e2.filename, f2.document.documentElement.querySelector("#pdfViewer").contentWindow.PDFViewerApplication.open(d3.output("bloburl"));
            };
          }
          return f2;
        }
        throw new Error("The option pdfjsnewwindow just works in a browser-environment.");
      case "dataurlnewwindow":
        if ("[object Window]" !== Object.prototype.toString.call(n)) throw new Error("The option dataurlnewwindow just works in a browser-environment.");
        var p3 = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe src="' + this.output("datauristring", e2) + '"></iframe></body></html>', g3 = n.open();
        if (null !== g3 && (g3.document.write(p3), g3.document.title = e2.filename), g3 || "undefined" == typeof safari) return g3;
        break;
      case "datauri":
      case "dataurl":
        return n.document.location.href = this.output("datauristring", e2);
      default:
        return null;
    }
  }), Ge = function(t3) {
    return true === Array.isArray(Ut2) && Ut2.indexOf(t3) > -1;
  };
  switch (o2) {
    case "pt":
      _t2 = 1;
      break;
    case "mm":
      _t2 = 72 / 25.4;
      break;
    case "cm":
      _t2 = 72 / 2.54;
      break;
    case "in":
      _t2 = 72;
      break;
    case "px":
      _t2 = 1 == Ge("px_scaling") ? 0.75 : 96 / 72;
      break;
    case "pc":
    case "em":
      _t2 = 12;
      break;
    case "ex":
      _t2 = 6;
      break;
    default:
      if ("number" != typeof o2) throw new Error("Invalid unit: " + o2);
      _t2 = o2;
  }
  var Ye = null;
  K2(), Y2();
  var Je = function(t3) {
    return null !== m2 ? Ye.encryptor(t3, 0) : function(t4) {
      return t4;
    };
  }, Xe = y2.__private__.getPageInfo = y2.getPageInfo = function(t3) {
    if (isNaN(t3) || t3 % 1 != 0) throw new Error("Invalid argument passed to jsPDF.getPageInfo");
    return { objId: Rt2[t3].objId, pageNumber: t3, pageContext: Rt2[t3] };
  }, Ke = y2.__private__.getPageInfoByObjId = function(t3) {
    if (isNaN(t3) || t3 % 1 != 0) throw new Error("Invalid argument passed to jsPDF.getPageInfoByObjId");
    for (var e2 in Rt2) if (Rt2[e2].objId === t3) break;
    return Xe(e2);
  }, Ze = y2.__private__.getCurrentPageInfo = y2.getCurrentPageInfo = function() {
    return { objId: Rt2[$2].objId, pageNumber: $2, pageContext: Rt2[$2] };
  };
  y2.addPage = function() {
    return Oe.apply(this, arguments), this;
  }, y2.setPage = function() {
    return Me.apply(this, arguments), ht2.call(this, ot2[$2]), this;
  }, y2.insertPage = function(t3) {
    return this.addPage(), this.movePage($2, t3), this;
  }, y2.movePage = function(t3, e2) {
    var r2, n2;
    if (t3 > e2) {
      r2 = ot2[t3], n2 = Rt2[t3];
      for (var i3 = t3; i3 > e2; i3--) ot2[i3] = ot2[i3 - 1], Rt2[i3] = Rt2[i3 - 1];
      ot2[e2] = r2, Rt2[e2] = n2, this.setPage(e2);
    } else if (t3 < e2) {
      r2 = ot2[t3], n2 = Rt2[t3];
      for (var a2 = t3; a2 < e2; a2++) ot2[a2] = ot2[a2 + 1], Rt2[a2] = Rt2[a2 + 1];
      ot2[e2] = r2, Rt2[e2] = n2, this.setPage(e2);
    }
    return this;
  }, y2.deletePage = function() {
    return Be.apply(this, arguments), this;
  }, y2.__private__.text = y2.text = function(e2, r2, n2, i3, a2) {
    var o3, s3, c3, u3, h2, l2, f2, d3, p3, g3 = (i3 = i3 || {}).scope || this;
    if ("number" == typeof e2 && "number" == typeof r2 && ("string" == typeof n2 || Array.isArray(n2))) {
      var m3 = n2;
      n2 = r2, r2 = e2, e2 = m3;
    }
    if (arguments[3] instanceof Vt2 == false ? (c3 = arguments[4], u3 = arguments[5], "object" === t(f2 = arguments[3]) && null !== f2 || ("string" == typeof c3 && (u3 = c3, c3 = null), "string" == typeof f2 && (u3 = f2, f2 = null), "number" == typeof f2 && (c3 = f2, f2 = null), i3 = { flags: f2, angle: c3, align: u3 })) : (q2("The transform parameter of text() with a Matrix value"), p3 = a2), isNaN(r2) || isNaN(n2) || null == e2) throw new Error("Invalid arguments passed to jsPDF.text");
    if (0 === e2.length) return g3;
    var v3 = "", y3 = false, w3 = "number" == typeof i3.lineHeightFactor ? i3.lineHeightFactor : lr, N3 = g3.internal.scaleFactor;
    function L3(t3) {
      return t3 = t3.split("	").join(Array(i3.TabLen || 9).join(" ")), Ce(t3, f2);
    }
    function A3(t3) {
      for (var e3, r3 = t3.concat(), n3 = [], i4 = r3.length; i4--; ) "string" == typeof (e3 = r3.shift()) ? n3.push(e3) : Array.isArray(t3) && (1 === e3.length || void 0 === e3[1] && void 0 === e3[2]) ? n3.push(e3[0]) : n3.push([e3[0], e3[1], e3[2]]);
      return n3;
    }
    function _3(t3, e3) {
      var r3;
      if ("string" == typeof t3) r3 = e3(t3)[0];
      else if (Array.isArray(t3)) {
        for (var n3, i4, a3 = t3.concat(), o4 = [], s4 = a3.length; s4--; ) "string" == typeof (n3 = a3.shift()) ? o4.push(e3(n3)[0]) : Array.isArray(n3) && "string" == typeof n3[0] && (i4 = e3(n3[0], n3[1], n3[2]), o4.push([i4[0], i4[1], i4[2]]));
        r3 = o4;
      }
      return r3;
    }
    var P3 = false, k3 = true;
    if ("string" == typeof e2) P3 = true;
    else if (Array.isArray(e2)) {
      var I2 = e2.concat();
      s3 = [];
      for (var F2, C2 = I2.length; C2--; ) ("string" != typeof (F2 = I2.shift()) || Array.isArray(F2) && "string" != typeof F2[0]) && (k3 = false);
      P3 = k3;
    }
    if (false === P3) throw new Error('Type of text must be string or Array. "' + e2 + '" is not recognized.');
    "string" == typeof e2 && (e2 = e2.match(/[\r?\n]/) ? e2.split(/\r\n|\r|\n/g) : [e2]);
    var j2 = gt2 / g3.internal.scaleFactor, B2 = j2 * (w3 - 1);
    switch (i3.baseline) {
      case "bottom":
        n2 -= B2;
        break;
      case "top":
        n2 += j2 - B2;
        break;
      case "hanging":
        n2 += j2 - 2 * B2;
        break;
      case "middle":
        n2 += j2 / 2 - B2;
    }
    if ((l2 = i3.maxWidth || 0) > 0 && ("string" == typeof e2 ? e2 = g3.splitTextToSize(e2, l2) : "[object Array]" === Object.prototype.toString.call(e2) && (e2 = e2.reduce(function(t3, e3) {
      return t3.concat(g3.splitTextToSize(e3, l2));
    }, []))), o3 = { text: e2, x: r2, y: n2, options: i3, mutex: { pdfEscape: Ce, activeFontKey: St, fonts: Ft2, activeFontSize: gt2 } }, Tt2.publish("preProcessText", o3), e2 = o3.text, c3 = (i3 = o3.options).angle, p3 instanceof Vt2 == false && c3 && "number" == typeof c3) {
      c3 *= Math.PI / 180, 0 === i3.rotationDirection && (c3 = -c3), S2 === x2.ADVANCED && (c3 = -c3);
      var M2 = Math.cos(c3), E2 = Math.sin(c3);
      p3 = new Vt2(M2, E2, -E2, M2, 0, 0);
    } else c3 && c3 instanceof Vt2 && (p3 = c3);
    S2 !== x2.ADVANCED || p3 || (p3 = Yt2), void 0 !== (h2 = i3.charSpace || _r) && (v3 += O2(U2(h2)) + " Tc\n", this.setCharSpace(this.getCharSpace() || 0)), void 0 !== (d3 = i3.horizontalScale) && (v3 += O2(100 * d3) + " Tz\n");
    i3.lang;
    var D3 = -1, R3 = void 0 !== i3.renderingMode ? i3.renderingMode : i3.stroke, T3 = g3.internal.getCurrentPageInfo().pageContext;
    switch (R3) {
      case 0:
      case false:
      case "fill":
        D3 = 0;
        break;
      case 1:
      case true:
      case "stroke":
        D3 = 1;
        break;
      case 2:
      case "fillThenStroke":
        D3 = 2;
        break;
      case 3:
      case "invisible":
        D3 = 3;
        break;
      case 4:
      case "fillAndAddForClipping":
        D3 = 4;
        break;
      case 5:
      case "strokeAndAddPathForClipping":
        D3 = 5;
        break;
      case 6:
      case "fillThenStrokeAndAddToPathForClipping":
        D3 = 6;
        break;
      case 7:
      case "addToPathForClipping":
        D3 = 7;
    }
    var z3 = void 0 !== T3.usedRenderingMode ? T3.usedRenderingMode : -1;
    -1 !== D3 ? v3 += D3 + " Tr\n" : -1 !== z3 && (v3 += "0 Tr\n"), -1 !== D3 && (T3.usedRenderingMode = D3), u3 = i3.align || "left";
    var H3, W3 = gt2 * w3, V3 = g3.internal.pageSize.getWidth(), G3 = Ft2[St];
    h2 = i3.charSpace || _r, l2 = i3.maxWidth || 0, f2 = Object.assign({ autoencode: true, noBOM: true }, i3.flags);
    var Y3 = [], J3 = function(t3) {
      return g3.getStringUnitWidth(t3, { font: G3, charSpace: h2, fontSize: gt2, doKerning: false }) * gt2 / N3;
    };
    if ("[object Array]" === Object.prototype.toString.call(e2)) {
      var X3;
      s3 = A3(e2), "left" !== u3 && (H3 = s3.map(J3));
      var K3, Z3 = 0;
      if ("right" === u3) {
        r2 -= H3[0], e2 = [], C2 = s3.length;
        for (var $3 = 0; $3 < C2; $3++) 0 === $3 ? (K3 = br(r2), X3 = yr(n2)) : (K3 = U2(Z3 - H3[$3]), X3 = -W3), e2.push([s3[$3], K3, X3]), Z3 = H3[$3];
      } else if ("center" === u3) {
        r2 -= H3[0] / 2, e2 = [], C2 = s3.length;
        for (var Q3 = 0; Q3 < C2; Q3++) 0 === Q3 ? (K3 = br(r2), X3 = yr(n2)) : (K3 = U2((Z3 - H3[Q3]) / 2), X3 = -W3), e2.push([s3[Q3], K3, X3]), Z3 = H3[Q3];
      } else if ("left" === u3) {
        e2 = [], C2 = s3.length;
        for (var tt3 = 0; tt3 < C2; tt3++) e2.push(s3[tt3]);
      } else if ("justify" === u3 && "Identity-H" === G3.encoding) {
        e2 = [], C2 = s3.length, l2 = 0 !== l2 ? l2 : V3;
        for (var et3 = 0, rt3 = 0; rt3 < C2; rt3++) if (X3 = 0 === rt3 ? yr(n2) : -W3, K3 = 0 === rt3 ? br(r2) : et3, rt3 < C2 - 1) {
          var nt3 = U2((l2 - H3[rt3]) / (s3[rt3].split(" ").length - 1)), it3 = s3[rt3].split(" ");
          e2.push([it3[0] + " ", K3, X3]), et3 = 0;
          for (var at3 = 1; at3 < it3.length; at3++) {
            var ot3 = (J3(it3[at3 - 1] + " " + it3[at3]) - J3(it3[at3])) * N3 + nt3;
            at3 == it3.length - 1 ? e2.push([it3[at3], ot3, 0]) : e2.push([it3[at3] + " ", ot3, 0]), et3 -= ot3;
          }
        } else e2.push([s3[rt3], K3, X3]);
        e2.push(["", et3, 0]);
      } else {
        if ("justify" !== u3) throw new Error('Unrecognized alignment option, use "left", "center", "right" or "justify".');
        e2 = [], C2 = s3.length, l2 = 0 !== l2 ? l2 : V3;
        for (rt3 = 0; rt3 < C2; rt3++) X3 = 0 === rt3 ? yr(n2) : -W3, K3 = 0 === rt3 ? br(r2) : 0, rt3 < C2 - 1 ? Y3.push(O2(U2((l2 - H3[rt3]) / (s3[rt3].split(" ").length - 1)))) : Y3.push(0), e2.push([s3[rt3], K3, X3]);
      }
    }
    var st3 = "boolean" == typeof i3.R2L ? i3.R2L : bt2;
    true === st3 && (e2 = _3(e2, function(t3, e3, r3) {
      return [t3.split("").reverse().join(""), e3, r3];
    })), o3 = { text: e2, x: r2, y: n2, options: i3, mutex: { pdfEscape: Ce, activeFontKey: St, fonts: Ft2, activeFontSize: gt2 } }, Tt2.publish("postProcessText", o3), e2 = o3.text, y3 = o3.mutex.isHex || false;
    var ct3 = Ft2[St].encoding;
    "WinAnsiEncoding" !== ct3 && "StandardEncoding" !== ct3 || (e2 = _3(e2, function(t3, e3, r3) {
      return [L3(t3), e3, r3];
    })), s3 = A3(e2), e2 = [];
    for (var ut3, ht3, ft3, dt3 = 0, pt3 = 1, mt3 = Array.isArray(s3[0]) ? pt3 : dt3, vt3 = "", yt3 = function(t3, e3, r3) {
      var n3 = "";
      return r3 instanceof Vt2 ? (r3 = "number" == typeof i3.angle ? Gt2(r3, new Vt2(1, 0, 0, 1, t3, e3)) : Gt2(new Vt2(1, 0, 0, 1, t3, e3), r3), S2 === x2.ADVANCED && (r3 = Gt2(new Vt2(1, 0, 0, -1, 0, 0), r3)), n3 = r3.join(" ") + " Tm\n") : n3 = O2(t3) + " " + O2(e3) + " Td\n", n3;
    }, wt3 = 0; wt3 < s3.length; wt3++) {
      switch (vt3 = "", mt3) {
        case pt3:
          ft3 = (y3 ? "<" : "(") + s3[wt3][0] + (y3 ? ">" : ")"), ut3 = parseFloat(s3[wt3][1]), ht3 = parseFloat(s3[wt3][2]);
          break;
        case dt3:
          ft3 = (y3 ? "<" : "(") + s3[wt3] + (y3 ? ">" : ")"), ut3 = br(r2), ht3 = yr(n2);
      }
      void 0 !== Y3 && void 0 !== Y3[wt3] && (vt3 = Y3[wt3] + " Tw\n"), 0 === wt3 ? e2.push(vt3 + yt3(ut3, ht3, p3) + ft3) : mt3 === dt3 ? e2.push(vt3 + ft3) : mt3 === pt3 && e2.push(vt3 + yt3(ut3, ht3, p3) + ft3);
    }
    e2 = mt3 === dt3 ? e2.join(" Tj\nT* ") : e2.join(" Tj\n"), e2 += " Tj\n";
    var Nt3 = "BT\n/";
    return Nt3 += St + " " + gt2 + " Tf\n", Nt3 += O2(gt2 * w3) + " TL\n", Nt3 += xr + "\n", Nt3 += v3, Nt3 += e2, lt2(Nt3 += "ET"), b2[St] = true, g3;
  };
  var $e = y2.__private__.clip = y2.clip = function(t3) {
    return lt2("evenodd" === t3 ? "W*" : "W"), this;
  };
  y2.clipEvenOdd = function() {
    return $e("evenodd");
  }, y2.__private__.discardPath = y2.discardPath = function() {
    return lt2("n"), this;
  };
  var Qe = y2.__private__.isValidStyle = function(t3) {
    var e2 = false;
    return -1 !== [void 0, null, "S", "D", "F", "DF", "FD", "f", "f*", "B", "B*", "n"].indexOf(t3) && (e2 = true), e2;
  };
  y2.__private__.setDefaultPathOperation = y2.setDefaultPathOperation = function(t3) {
    return Qe(t3) && (g2 = t3), this;
  };
  var tr = y2.__private__.getStyle = y2.getStyle = function(t3) {
    var e2 = g2;
    switch (t3) {
      case "D":
      case "S":
        e2 = "S";
        break;
      case "F":
        e2 = "f";
        break;
      case "FD":
      case "DF":
        e2 = "B";
        break;
      case "f":
      case "f*":
      case "B":
      case "B*":
        e2 = t3;
    }
    return e2;
  }, er = y2.close = function() {
    return lt2("h"), this;
  };
  y2.stroke = function() {
    return lt2("S"), this;
  }, y2.fill = function(t3) {
    return rr("f", t3), this;
  }, y2.fillEvenOdd = function(t3) {
    return rr("f*", t3), this;
  }, y2.fillStroke = function(t3) {
    return rr("B", t3), this;
  }, y2.fillStrokeEvenOdd = function(t3) {
    return rr("B*", t3), this;
  };
  var rr = function(e2, r2) {
    "object" === t(r2) ? ar(r2, e2) : lt2(e2);
  }, nr = function(t3) {
    null === t3 || S2 === x2.ADVANCED && void 0 === t3 || (t3 = tr(t3), lt2(t3));
  };
  function ir(t3, e2, r2, n2, i3) {
    var a2 = new M(e2 || this.boundingBox, r2 || this.xStep, n2 || this.yStep, this.gState, i3 || this.matrix);
    a2.stream = this.stream;
    var o3 = t3 + "$$" + this.cloneIndex++ + "$$";
    return Jt2(o3, a2), a2;
  }
  var ar = function(t3, e2) {
    var r2 = Bt2[t3.key], n2 = Ot2[r2];
    if (n2 instanceof B) lt2("q"), lt2(or(e2)), n2.gState && y2.setGState(n2.gState), lt2(t3.matrix.toString() + " cm"), lt2("/" + r2 + " sh"), lt2("Q");
    else if (n2 instanceof M) {
      var i3 = new Vt2(1, 0, 0, -1, 0, Rr());
      t3.matrix && (i3 = i3.multiply(t3.matrix || Yt2), r2 = ir.call(n2, t3.key, t3.boundingBox, t3.xStep, t3.yStep, i3).id), lt2("q"), lt2("/Pattern cs"), lt2("/" + r2 + " scn"), n2.gState && y2.setGState(n2.gState), lt2(e2), lt2("Q");
    }
  }, or = function(t3) {
    switch (t3) {
      case "f":
      case "F":
        return "W n";
      case "f*":
        return "W* n";
      case "B":
        return "W S";
      case "B*":
        return "W* S";
      case "S":
        return "W S";
      case "n":
        return "W n";
    }
  }, sr = y2.moveTo = function(t3, e2) {
    return lt2(O2(U2(t3)) + " " + O2(H2(e2)) + " m"), this;
  }, cr = y2.lineTo = function(t3, e2) {
    return lt2(O2(U2(t3)) + " " + O2(H2(e2)) + " l"), this;
  }, ur = y2.curveTo = function(t3, e2, r2, n2, i3, a2) {
    return lt2([O2(U2(t3)), O2(H2(e2)), O2(U2(r2)), O2(H2(n2)), O2(U2(i3)), O2(H2(a2)), "c"].join(" ")), this;
  };
  y2.__private__.line = y2.line = function(t3, e2, r2, n2, i3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n2) || !Qe(i3)) throw new Error("Invalid arguments passed to jsPDF.line");
    return S2 === x2.COMPAT ? this.lines([[r2 - t3, n2 - e2]], t3, e2, [1, 1], i3 || "S") : this.lines([[r2 - t3, n2 - e2]], t3, e2, [1, 1]).stroke();
  }, y2.__private__.lines = y2.lines = function(t3, e2, r2, n2, i3, a2) {
    var o3, s3, c3, u3, h2, l2, f2, d3, p3, g3, m3, v3;
    if ("number" == typeof t3 && (v3 = r2, r2 = e2, e2 = t3, t3 = v3), n2 = n2 || [1, 1], a2 = a2 || false, isNaN(e2) || isNaN(r2) || !Array.isArray(t3) || !Array.isArray(n2) || !Qe(i3) || "boolean" != typeof a2) throw new Error("Invalid arguments passed to jsPDF.lines");
    for (sr(e2, r2), o3 = n2[0], s3 = n2[1], u3 = t3.length, g3 = e2, m3 = r2, c3 = 0; c3 < u3; c3++) 2 === (h2 = t3[c3]).length ? (g3 = h2[0] * o3 + g3, m3 = h2[1] * s3 + m3, cr(g3, m3)) : (l2 = h2[0] * o3 + g3, f2 = h2[1] * s3 + m3, d3 = h2[2] * o3 + g3, p3 = h2[3] * s3 + m3, g3 = h2[4] * o3 + g3, m3 = h2[5] * s3 + m3, ur(l2, f2, d3, p3, g3, m3));
    return a2 && er(), nr(i3), this;
  }, y2.path = function(t3) {
    for (var e2 = 0; e2 < t3.length; e2++) {
      var r2 = t3[e2], n2 = r2.c;
      switch (r2.op) {
        case "m":
          sr(n2[0], n2[1]);
          break;
        case "l":
          cr(n2[0], n2[1]);
          break;
        case "c":
          ur.apply(this, n2);
          break;
        case "h":
          er();
      }
    }
    return this;
  }, y2.__private__.rect = y2.rect = function(t3, e2, r2, n2, i3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n2) || !Qe(i3)) throw new Error("Invalid arguments passed to jsPDF.rect");
    return S2 === x2.COMPAT && (n2 = -n2), lt2([O2(U2(t3)), O2(H2(e2)), O2(U2(r2)), O2(U2(n2)), "re"].join(" ")), nr(i3), this;
  }, y2.__private__.triangle = y2.triangle = function(t3, e2, r2, n2, i3, a2, o3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n2) || isNaN(i3) || isNaN(a2) || !Qe(o3)) throw new Error("Invalid arguments passed to jsPDF.triangle");
    return this.lines([[r2 - t3, n2 - e2], [i3 - r2, a2 - n2], [t3 - i3, e2 - a2]], t3, e2, [1, 1], o3, true), this;
  }, y2.__private__.roundedRect = y2.roundedRect = function(t3, e2, r2, n2, i3, a2, o3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n2) || isNaN(i3) || isNaN(a2) || !Qe(o3)) throw new Error("Invalid arguments passed to jsPDF.roundedRect");
    var s3 = 4 / 3 * (Math.SQRT2 - 1);
    return i3 = Math.min(i3, 0.5 * r2), a2 = Math.min(a2, 0.5 * n2), this.lines([[r2 - 2 * i3, 0], [i3 * s3, 0, i3, a2 - a2 * s3, i3, a2], [0, n2 - 2 * a2], [0, a2 * s3, -i3 * s3, a2, -i3, a2], [2 * i3 - r2, 0], [-i3 * s3, 0, -i3, -a2 * s3, -i3, -a2], [0, 2 * a2 - n2], [0, -a2 * s3, i3 * s3, -a2, i3, -a2]], t3 + i3, e2, [1, 1], o3, true), this;
  }, y2.__private__.ellipse = y2.ellipse = function(t3, e2, r2, n2, i3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n2) || !Qe(i3)) throw new Error("Invalid arguments passed to jsPDF.ellipse");
    var a2 = 4 / 3 * (Math.SQRT2 - 1) * r2, o3 = 4 / 3 * (Math.SQRT2 - 1) * n2;
    return sr(t3 + r2, e2), ur(t3 + r2, e2 - o3, t3 + a2, e2 - n2, t3, e2 - n2), ur(t3 - a2, e2 - n2, t3 - r2, e2 - o3, t3 - r2, e2), ur(t3 - r2, e2 + o3, t3 - a2, e2 + n2, t3, e2 + n2), ur(t3 + a2, e2 + n2, t3 + r2, e2 + o3, t3 + r2, e2), nr(i3), this;
  }, y2.__private__.circle = y2.circle = function(t3, e2, r2, n2) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || !Qe(n2)) throw new Error("Invalid arguments passed to jsPDF.circle");
    return this.ellipse(t3, e2, r2, r2, n2);
  }, y2.setFont = function(t3, e2, r2) {
    return r2 && (e2 = k2(e2, r2)), St = qe(t3, e2, { disableWarning: false }), this;
  };
  var hr = y2.__private__.getFont = y2.getFont = function() {
    return Ft2[qe.apply(y2, arguments)];
  };
  y2.__private__.getFontList = y2.getFontList = function() {
    var t3, e2, r2 = {};
    for (t3 in Ct2) if (Ct2.hasOwnProperty(t3)) for (e2 in r2[t3] = [], Ct2[t3]) Ct2[t3].hasOwnProperty(e2) && r2[t3].push(e2);
    return r2;
  }, y2.addFont = function(t3, e2, r2, n2, i3) {
    var a2 = ["StandardEncoding", "MacRomanEncoding", "Identity-H", "WinAnsiEncoding"];
    return arguments[3] && -1 !== a2.indexOf(arguments[3]) ? i3 = arguments[3] : arguments[3] && -1 == a2.indexOf(arguments[3]) && (r2 = k2(r2, n2)), i3 = i3 || "Identity-H", Pe.call(this, t3, e2, r2, i3);
  };
  var lr, fr = e.lineWidth || 0.200025, dr = y2.__private__.getLineWidth = y2.getLineWidth = function() {
    return fr;
  }, pr = y2.__private__.setLineWidth = y2.setLineWidth = function(t3) {
    return fr = t3, lt2(O2(U2(t3)) + " w"), this;
  };
  y2.__private__.setLineDash = E.API.setLineDash = E.API.setLineDashPattern = function(t3, e2) {
    if (t3 = t3 || [], e2 = e2 || 0, isNaN(e2) || !Array.isArray(t3)) throw new Error("Invalid arguments passed to jsPDF.setLineDash");
    return t3 = t3.map(function(t4) {
      return O2(U2(t4));
    }).join(" "), e2 = O2(U2(e2)), lt2("[" + t3 + "] " + e2 + " d"), this;
  };
  var gr = y2.__private__.getLineHeight = y2.getLineHeight = function() {
    return gt2 * lr;
  };
  y2.__private__.getLineHeight = y2.getLineHeight = function() {
    return gt2 * lr;
  };
  var mr = y2.__private__.setLineHeightFactor = y2.setLineHeightFactor = function(t3) {
    return "number" == typeof (t3 = t3 || 1.15) && (lr = t3), this;
  }, vr = y2.__private__.getLineHeightFactor = y2.getLineHeightFactor = function() {
    return lr;
  };
  mr(e.lineHeight);
  var br = y2.__private__.getHorizontalCoordinate = function(t3) {
    return U2(t3);
  }, yr = y2.__private__.getVerticalCoordinate = function(t3) {
    return S2 === x2.ADVANCED ? t3 : Rt2[$2].mediaBox.topRightY - Rt2[$2].mediaBox.bottomLeftY - U2(t3);
  }, wr = y2.__private__.getHorizontalCoordinateString = y2.getHorizontalCoordinateString = function(t3) {
    return O2(br(t3));
  }, Nr = y2.__private__.getVerticalCoordinateString = y2.getVerticalCoordinateString = function(t3) {
    return O2(yr(t3));
  }, Lr = e.strokeColor || "0 G";
  y2.__private__.getStrokeColor = y2.getDrawColor = function() {
    return ee2(Lr);
  }, y2.__private__.setStrokeColor = y2.setDrawColor = function(t3, e2, r2, n2) {
    return Lr = re2({ ch1: t3, ch2: e2, ch3: r2, ch4: n2, pdfColorType: "draw", precision: 2 }), lt2(Lr), this;
  };
  var Ar = e.fillColor || "0 g";
  y2.__private__.getFillColor = y2.getFillColor = function() {
    return ee2(Ar);
  }, y2.__private__.setFillColor = y2.setFillColor = function(t3, e2, r2, n2) {
    return Ar = re2({ ch1: t3, ch2: e2, ch3: r2, ch4: n2, pdfColorType: "fill", precision: 2 }), lt2(Ar), this;
  };
  var xr = e.textColor || "0 g", Sr = y2.__private__.getTextColor = y2.getTextColor = function() {
    return ee2(xr);
  };
  y2.__private__.setTextColor = y2.setTextColor = function(t3, e2, r2, n2) {
    return xr = re2({ ch1: t3, ch2: e2, ch3: r2, ch4: n2, pdfColorType: "text", precision: 3 }), this;
  };
  var _r = e.charSpace, Pr = y2.__private__.getCharSpace = y2.getCharSpace = function() {
    return parseFloat(_r || 0);
  };
  y2.__private__.setCharSpace = y2.setCharSpace = function(t3) {
    if (isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.setCharSpace");
    return _r = t3, this;
  };
  var kr = 0;
  y2.CapJoinStyles = { 0: 0, butt: 0, but: 0, miter: 0, 1: 1, round: 1, rounded: 1, circle: 1, 2: 2, projecting: 2, project: 2, square: 2, bevel: 2 }, y2.__private__.setLineCap = y2.setLineCap = function(t3) {
    var e2 = y2.CapJoinStyles[t3];
    if (void 0 === e2) throw new Error("Line cap style of '" + t3 + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
    return kr = e2, lt2(e2 + " J"), this;
  };
  var Ir = 0;
  y2.__private__.setLineJoin = y2.setLineJoin = function(t3) {
    var e2 = y2.CapJoinStyles[t3];
    if (void 0 === e2) throw new Error("Line join style of '" + t3 + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
    return Ir = e2, lt2(e2 + " j"), this;
  }, y2.__private__.setLineMiterLimit = y2.__private__.setMiterLimit = y2.setLineMiterLimit = y2.setMiterLimit = function(t3) {
    if (t3 = t3 || 0, isNaN(t3)) throw new Error("Invalid argument passed to jsPDF.setLineMiterLimit");
    return lt2(O2(U2(t3)) + " M"), this;
  }, y2.GState = j, y2.setGState = function(t3) {
    (t3 = "string" == typeof t3 ? Mt2[Et2[t3]] : Fr(null, t3)).equals(qt2) || (lt2("/" + t3.id + " gs"), qt2 = t3);
  };
  var Fr = function(t3, e2) {
    if (!t3 || !Et2[t3]) {
      var r2 = false;
      for (var n2 in Mt2) if (Mt2.hasOwnProperty(n2) && Mt2[n2].equals(e2)) {
        r2 = true;
        break;
      }
      if (r2) e2 = Mt2[n2];
      else {
        var i3 = "GS" + (Object.keys(Mt2).length + 1).toString(10);
        Mt2[i3] = e2, e2.id = i3;
      }
      return t3 && (Et2[t3] = e2.id), Tt2.publish("addGState", e2), e2;
    }
  };
  y2.addGState = function(t3, e2) {
    return Fr(t3, e2), this;
  }, y2.saveGraphicsState = function() {
    return lt2("q"), jt2.push({ key: St, size: gt2, color: xr }), this;
  }, y2.restoreGraphicsState = function() {
    lt2("Q");
    var t3 = jt2.pop();
    return St = t3.key, gt2 = t3.size, xr = t3.color, qt2 = null, this;
  }, y2.setCurrentTransformationMatrix = function(t3) {
    return lt2(t3.toString() + " cm"), this;
  }, y2.comment = function(t3) {
    return lt2("#" + t3), this;
  };
  var Cr = function(t3, e2) {
    var r2 = t3 || 0;
    Object.defineProperty(this, "x", { enumerable: true, get: function() {
      return r2;
    }, set: function(t4) {
      isNaN(t4) || (r2 = parseFloat(t4));
    } });
    var n2 = e2 || 0;
    Object.defineProperty(this, "y", { enumerable: true, get: function() {
      return n2;
    }, set: function(t4) {
      isNaN(t4) || (n2 = parseFloat(t4));
    } });
    var i3 = "pt";
    return Object.defineProperty(this, "type", { enumerable: true, get: function() {
      return i3;
    }, set: function(t4) {
      i3 = t4.toString();
    } }), this;
  }, jr = function(t3, e2, r2, n2) {
    Cr.call(this, t3, e2), this.type = "rect";
    var i3 = r2 || 0;
    Object.defineProperty(this, "w", { enumerable: true, get: function() {
      return i3;
    }, set: function(t4) {
      isNaN(t4) || (i3 = parseFloat(t4));
    } });
    var a2 = n2 || 0;
    return Object.defineProperty(this, "h", { enumerable: true, get: function() {
      return a2;
    }, set: function(t4) {
      isNaN(t4) || (a2 = parseFloat(t4));
    } }), this;
  }, Or = function() {
    this.page = Dt2, this.currentPage = $2, this.pages = ot2.slice(0), this.pagesContext = Rt2.slice(0), this.x = Pt2, this.y = kt2, this.matrix = It2, this.width = qr($2), this.height = Rr($2), this.outputDestination = ct2, this.id = "", this.objectNumber = -1;
  };
  Or.prototype.restore = function() {
    Dt2 = this.page, $2 = this.currentPage, Rt2 = this.pagesContext, ot2 = this.pages, Pt2 = this.x, kt2 = this.y, It2 = this.matrix, Dr($2, this.width), Tr($2, this.height), ct2 = this.outputDestination;
  };
  var Br = function(t3, e2, r2, n2, i3) {
    Wt2.push(new Or()), Dt2 = $2 = 0, ot2 = [], Pt2 = t3, kt2 = e2, It2 = i3, je([r2, n2]);
  }, Mr = function(t3) {
    if (Ht2[t3]) Wt2.pop().restore();
    else {
      var e2 = new Or(), r2 = "Xo" + (Object.keys(zt2).length + 1).toString(10);
      e2.id = r2, Ht2[t3] = r2, zt2[r2] = e2, Tt2.publish("addFormObject", e2), Wt2.pop().restore();
    }
  };
  for (var Er in y2.beginFormObject = function(t3, e2, r2, n2, i3) {
    return Br(t3, e2, r2, n2, i3), this;
  }, y2.endFormObject = function(t3) {
    return Mr(t3), this;
  }, y2.doFormObject = function(t3, e2) {
    var r2 = zt2[Ht2[t3]];
    return lt2("q"), lt2(e2.toString() + " cm"), lt2("/" + r2.id + " Do"), lt2("Q"), this;
  }, y2.getFormObject = function(t3) {
    var e2 = zt2[Ht2[t3]];
    return { x: e2.x, y: e2.y, width: e2.width, height: e2.height, matrix: e2.matrix };
  }, y2.save = function(t3, e2) {
    return t3 = t3 || "generated.pdf", (e2 = e2 || {}).returnPromise = e2.returnPromise || false, false === e2.returnPromise ? (l(We(He()), t3), "function" == typeof l.unload && n.setTimeout && setTimeout(l.unload, 911), this) : new Promise(function(e3, r2) {
      try {
        var i3 = l(We(He()), t3);
        "function" == typeof l.unload && n.setTimeout && setTimeout(l.unload, 911), e3(i3);
      } catch (t4) {
        r2(t4.message);
      }
    });
  }, E.API) E.API.hasOwnProperty(Er) && ("events" === Er && E.API.events.length ? function(t3, e2) {
    var r2, n2, i3;
    for (i3 = e2.length - 1; -1 !== i3; i3--) r2 = e2[i3][0], n2 = e2[i3][1], t3.subscribe.apply(t3, [r2].concat("function" == typeof n2 ? [n2] : n2));
  }(Tt2, E.API.events) : y2[Er] = E.API[Er]);
  var qr = y2.getPageWidth = function(t3) {
    return (Rt2[t3 = t3 || $2].mediaBox.topRightX - Rt2[t3].mediaBox.bottomLeftX) / _t2;
  }, Dr = y2.setPageWidth = function(t3, e2) {
    Rt2[t3].mediaBox.topRightX = e2 * _t2 + Rt2[t3].mediaBox.bottomLeftX;
  }, Rr = y2.getPageHeight = function(t3) {
    return (Rt2[t3 = t3 || $2].mediaBox.topRightY - Rt2[t3].mediaBox.bottomLeftY) / _t2;
  }, Tr = y2.setPageHeight = function(t3, e2) {
    Rt2[t3].mediaBox.topRightY = e2 * _t2 + Rt2[t3].mediaBox.bottomLeftY;
  };
  return y2.internal = { pdfEscape: Ce, getStyle: tr, getFont: hr, getFontSize: vt2, getCharSpace: Pr, getTextColor: Sr, getLineHeight: gr, getLineHeightFactor: vr, getLineWidth: dr, write: ft2, getHorizontalCoordinate: br, getVerticalCoordinate: yr, getCoordinateString: wr, getVerticalCoordinateString: Nr, collections: {}, newObject: Xt2, newAdditionalObject: $t2, newObjectDeferred: Kt2, newObjectDeferredBegin: Zt2, getFilters: ne2, putStream: ie2, events: Tt2, scaleFactor: _t2, pageSize: { getWidth: function() {
    return qr($2);
  }, setWidth: function(t3) {
    Dr($2, t3);
  }, getHeight: function() {
    return Rr($2);
  }, setHeight: function(t3) {
    Tr($2, t3);
  } }, encryptionOptions: m2, encryption: Ye, getEncryptor: Je, output: Ve, getNumberOfPages: Ee, pages: ot2, out: lt2, f2: R2, f3: T2, getPageInfo: Xe, getPageInfoByObjId: Ke, getCurrentPageInfo: Ze, getPDFVersion: N2, Point: Cr, Rectangle: jr, Matrix: Vt2, hasHotfix: Ge }, Object.defineProperty(y2.internal.pageSize, "width", { get: function() {
    return qr($2);
  }, set: function(t3) {
    Dr($2, t3);
  }, enumerable: true, configurable: true }), Object.defineProperty(y2.internal.pageSize, "height", { get: function() {
    return Rr($2);
  }, set: function(t3) {
    Tr($2, t3);
  }, enumerable: true, configurable: true }), ke.call(y2, pt2), St = "F1", Oe(s2, i2), Tt2.publish("initialized"), y2;
}
I.prototype.lsbFirstWord = function(t3) {
  return String.fromCharCode(t3 >> 0 & 255, t3 >> 8 & 255, t3 >> 16 & 255, t3 >> 24 & 255);
}, I.prototype.toHexString = function(t3) {
  return t3.split("").map(function(t4) {
    return ("0" + (255 & t4.charCodeAt(0)).toString(16)).slice(-2);
  }).join("");
}, I.prototype.hexToBytes = function(t3) {
  for (var e = [], r = 0; r < t3.length; r += 2) e.push(String.fromCharCode(parseInt(t3.substr(r, 2), 16)));
  return e.join("");
}, I.prototype.processOwnerPassword = function(t3, e) {
  return P(x(e).substr(0, 5), t3);
}, I.prototype.encryptor = function(t3, e) {
  var r = x(this.encryptionKey + String.fromCharCode(255 & t3, t3 >> 8 & 255, t3 >> 16 & 255, 255 & e, e >> 8 & 255)).substr(0, 10);
  return function(t4) {
    return P(r, t4);
  };
}, j.prototype.equals = function(e) {
  var r, n2 = "id,objectNumber,equals";
  if (!e || t(e) !== t(this)) return false;
  var i2 = 0;
  for (r in this) if (!(n2.indexOf(r) >= 0)) {
    if (this.hasOwnProperty(r) && !e.hasOwnProperty(r)) return false;
    if (this[r] !== e[r]) return false;
    i2++;
  }
  for (r in e) e.hasOwnProperty(r) && n2.indexOf(r) < 0 && i2--;
  return 0 === i2;
}, E.API = { events: [] }, E.version = "2.5.2";
var q = E.API, D = 1, R = function(t3) {
  return t3.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}, T = function(t3) {
  return t3.replace(/\\\\/g, "\\").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
}, U = function(t3) {
  return t3.toFixed(2);
}, z = function(t3) {
  return t3.toFixed(5);
};
q.__acroform__ = {};
var H = function(t3, e) {
  t3.prototype = Object.create(e.prototype), t3.prototype.constructor = t3;
}, W = function(t3) {
  return t3 * D;
}, V = function(t3) {
  var e = new ut(), r = At.internal.getHeight(t3) || 0, n2 = At.internal.getWidth(t3) || 0;
  return e.BBox = [0, 0, Number(U(n2)), Number(U(r))], e;
}, G = q.__acroform__.setBit = function(t3, e) {
  if (t3 = t3 || 0, e = e || 0, isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBit");
  return t3 |= 1 << e;
}, Y = q.__acroform__.clearBit = function(t3, e) {
  if (t3 = t3 || 0, e = e || 0, isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBit");
  return t3 &= ~(1 << e);
}, J = q.__acroform__.getBit = function(t3, e) {
  if (isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBit");
  return 0 == (t3 & 1 << e) ? 0 : 1;
}, X = q.__acroform__.getBitForPdf = function(t3, e) {
  if (isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBitForPdf");
  return J(t3, e - 1);
}, K = q.__acroform__.setBitForPdf = function(t3, e) {
  if (isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBitForPdf");
  return G(t3, e - 1);
}, Z = q.__acroform__.clearBitForPdf = function(t3, e) {
  if (isNaN(t3) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBitForPdf");
  return Y(t3, e - 1);
}, $ = q.__acroform__.calculateCoordinates = function(t3, e) {
  var r = e.internal.getHorizontalCoordinate, n2 = e.internal.getVerticalCoordinate, i2 = t3[0], a2 = t3[1], o2 = t3[2], s2 = t3[3], c2 = {};
  return c2.lowerLeft_X = r(i2) || 0, c2.lowerLeft_Y = n2(a2 + s2) || 0, c2.upperRight_X = r(i2 + o2) || 0, c2.upperRight_Y = n2(a2) || 0, [Number(U(c2.lowerLeft_X)), Number(U(c2.lowerLeft_Y)), Number(U(c2.upperRight_X)), Number(U(c2.upperRight_Y))];
}, Q = function(t3) {
  if (t3.appearanceStreamContent) return t3.appearanceStreamContent;
  if (t3.V || t3.DV) {
    var e = [], r = t3._V || t3.DV, n2 = tt(t3, r), i2 = t3.scope.internal.getFont(t3.fontName, t3.fontStyle).id;
    e.push("/Tx BMC"), e.push("q"), e.push("BT"), e.push(t3.scope.__private__.encodeColorString(t3.color)), e.push("/" + i2 + " " + U(n2.fontSize) + " Tf"), e.push("1 0 0 1 0 0 Tm"), e.push(n2.text), e.push("ET"), e.push("Q"), e.push("EMC");
    var a2 = V(t3);
    return a2.scope = t3.scope, a2.stream = e.join("\n"), a2;
  }
}, tt = function(t3, e) {
  var r = 0 === t3.fontSize ? t3.maxFontSize : t3.fontSize, n2 = { text: "", fontSize: "" }, i2 = (e = ")" == (e = "(" == e.substr(0, 1) ? e.substr(1) : e).substr(e.length - 1) ? e.substr(0, e.length - 1) : e).split(" ");
  i2 = t3.multiline ? i2.map(function(t4) {
    return t4.split("\n");
  }) : i2.map(function(t4) {
    return [t4];
  });
  var a2 = r, o2 = At.internal.getHeight(t3) || 0;
  o2 = o2 < 0 ? -o2 : o2;
  var s2 = At.internal.getWidth(t3) || 0;
  s2 = s2 < 0 ? -s2 : s2;
  var c2 = function(e2, r2, n3) {
    if (e2 + 1 < i2.length) {
      var a3 = r2 + " " + i2[e2 + 1][0];
      return et(a3, t3, n3).width <= s2 - 4;
    }
    return false;
  };
  a2++;
  t: for (; a2 > 0; ) {
    e = "", a2--;
    var u2, h2, l2 = et("3", t3, a2).height, f2 = t3.multiline ? o2 - a2 : (o2 - l2) / 2, d2 = f2 += 2, p2 = 0, g2 = 0, m2 = 0;
    if (a2 <= 0) {
      e = "(...) Tj\n", e += "% Width of Text: " + et(e, t3, a2 = 12).width + ", FieldWidth:" + s2 + "\n";
      break;
    }
    for (var v2 = "", b2 = 0, y2 = 0; y2 < i2.length; y2++) if (i2.hasOwnProperty(y2)) {
      var w2 = false;
      if (1 !== i2[y2].length && m2 !== i2[y2].length - 1) {
        if ((l2 + 2) * (b2 + 2) + 2 > o2) continue t;
        v2 += i2[y2][m2], w2 = true, g2 = y2, y2--;
      } else {
        v2 = " " == (v2 += i2[y2][m2] + " ").substr(v2.length - 1) ? v2.substr(0, v2.length - 1) : v2;
        var N2 = parseInt(y2), L2 = c2(N2, v2, a2), A2 = y2 >= i2.length - 1;
        if (L2 && !A2) {
          v2 += " ", m2 = 0;
          continue;
        }
        if (L2 || A2) {
          if (A2) g2 = N2;
          else if (t3.multiline && (l2 + 2) * (b2 + 2) + 2 > o2) continue t;
        } else {
          if (!t3.multiline) continue t;
          if ((l2 + 2) * (b2 + 2) + 2 > o2) continue t;
          g2 = N2;
        }
      }
      for (var x2 = "", S2 = p2; S2 <= g2; S2++) {
        var _2 = i2[S2];
        if (t3.multiline) {
          if (S2 === g2) {
            x2 += _2[m2] + " ", m2 = (m2 + 1) % _2.length;
            continue;
          }
          if (S2 === p2) {
            x2 += _2[_2.length - 1] + " ";
            continue;
          }
        }
        x2 += _2[0] + " ";
      }
      switch (x2 = " " == x2.substr(x2.length - 1) ? x2.substr(0, x2.length - 1) : x2, h2 = et(x2, t3, a2).width, t3.textAlign) {
        case "right":
          u2 = s2 - h2 - 2;
          break;
        case "center":
          u2 = (s2 - h2) / 2;
          break;
        case "left":
        default:
          u2 = 2;
      }
      e += U(u2) + " " + U(d2) + " Td\n", e += "(" + R(x2) + ") Tj\n", e += -U(u2) + " 0 Td\n", d2 = -(a2 + 2), h2 = 0, p2 = w2 ? g2 : g2 + 1, b2++, v2 = "";
    }
    break;
  }
  return n2.text = e, n2.fontSize = a2, n2;
}, et = function(t3, e, r) {
  var n2 = e.scope.internal.getFont(e.fontName, e.fontStyle), i2 = e.scope.getStringUnitWidth(t3, { font: n2, fontSize: parseFloat(r), charSpace: 0 }) * parseFloat(r);
  return { height: e.scope.getStringUnitWidth("3", { font: n2, fontSize: parseFloat(r), charSpace: 0 }) * parseFloat(r) * 1.5, width: i2 };
}, rt = { fields: [], xForms: [], acroFormDictionaryRoot: null, printedOut: false, internal: null, isInitialized: false }, nt = function(t3, e) {
  var r = { type: "reference", object: t3 };
  void 0 === e.internal.getPageInfo(t3.page).pageContext.annotations.find(function(t4) {
    return t4.type === r.type && t4.object === r.object;
  }) && e.internal.getPageInfo(t3.page).pageContext.annotations.push(r);
}, it = function(e, r) {
  for (var n2 in e) if (e.hasOwnProperty(n2)) {
    var i2 = n2, a2 = e[n2];
    r.internal.newObjectDeferredBegin(a2.objId, true), "object" === t(a2) && "function" == typeof a2.putStream && a2.putStream(), delete e[i2];
  }
}, at = function(e, r) {
  if (r.scope = e, void 0 !== e.internal && (void 0 === e.internal.acroformPlugin || false === e.internal.acroformPlugin.isInitialized)) {
    if (lt.FieldNum = 0, e.internal.acroformPlugin = JSON.parse(JSON.stringify(rt)), e.internal.acroformPlugin.acroFormDictionaryRoot) throw new Error("Exception while creating AcroformDictionary");
    D = e.internal.scaleFactor, e.internal.acroformPlugin.acroFormDictionaryRoot = new ht(), e.internal.acroformPlugin.acroFormDictionaryRoot.scope = e, e.internal.acroformPlugin.acroFormDictionaryRoot._eventID = e.internal.events.subscribe("postPutResources", function() {
      !function(t3) {
        t3.internal.events.unsubscribe(t3.internal.acroformPlugin.acroFormDictionaryRoot._eventID), delete t3.internal.acroformPlugin.acroFormDictionaryRoot._eventID, t3.internal.acroformPlugin.printedOut = true;
      }(e);
    }), e.internal.events.subscribe("buildDocument", function() {
      !function(t3) {
        t3.internal.acroformPlugin.acroFormDictionaryRoot.objId = void 0;
        var e2 = t3.internal.acroformPlugin.acroFormDictionaryRoot.Fields;
        for (var r2 in e2) if (e2.hasOwnProperty(r2)) {
          var n2 = e2[r2];
          n2.objId = void 0, n2.hasAnnotation && nt(n2, t3);
        }
      }(e);
    }), e.internal.events.subscribe("putCatalog", function() {
      !function(t3) {
        if (void 0 === t3.internal.acroformPlugin.acroFormDictionaryRoot) throw new Error("putCatalogCallback: Root missing.");
        t3.internal.write("/AcroForm " + t3.internal.acroformPlugin.acroFormDictionaryRoot.objId + " 0 R");
      }(e);
    }), e.internal.events.subscribe("postPutPages", function(r2) {
      !function(e2, r3) {
        var n2 = !e2;
        for (var i2 in e2 || (r3.internal.newObjectDeferredBegin(r3.internal.acroformPlugin.acroFormDictionaryRoot.objId, true), r3.internal.acroformPlugin.acroFormDictionaryRoot.putStream()), e2 = e2 || r3.internal.acroformPlugin.acroFormDictionaryRoot.Kids) if (e2.hasOwnProperty(i2)) {
          var a2 = e2[i2], o2 = [], s2 = a2.Rect;
          if (a2.Rect && (a2.Rect = $(a2.Rect, r3)), r3.internal.newObjectDeferredBegin(a2.objId, true), a2.DA = At.createDefaultAppearanceStream(a2), "object" === t(a2) && "function" == typeof a2.getKeyValueListForStream && (o2 = a2.getKeyValueListForStream()), a2.Rect = s2, a2.hasAppearanceStream && !a2.appearanceStreamContent) {
            var c2 = Q(a2);
            o2.push({ key: "AP", value: "<</N " + c2 + ">>" }), r3.internal.acroformPlugin.xForms.push(c2);
          }
          if (a2.appearanceStreamContent) {
            var u2 = "";
            for (var h2 in a2.appearanceStreamContent) if (a2.appearanceStreamContent.hasOwnProperty(h2)) {
              var l2 = a2.appearanceStreamContent[h2];
              if (u2 += "/" + h2 + " ", u2 += "<<", Object.keys(l2).length >= 1 || Array.isArray(l2)) {
                for (var i2 in l2) if (l2.hasOwnProperty(i2)) {
                  var f2 = l2[i2];
                  "function" == typeof f2 && (f2 = f2.call(r3, a2)), u2 += "/" + i2 + " " + f2 + " ", r3.internal.acroformPlugin.xForms.indexOf(f2) >= 0 || r3.internal.acroformPlugin.xForms.push(f2);
                }
              } else "function" == typeof (f2 = l2) && (f2 = f2.call(r3, a2)), u2 += "/" + i2 + " " + f2, r3.internal.acroformPlugin.xForms.indexOf(f2) >= 0 || r3.internal.acroformPlugin.xForms.push(f2);
              u2 += ">>";
            }
            o2.push({ key: "AP", value: "<<\n" + u2 + ">>" });
          }
          r3.internal.putStream({ additionalKeyValues: o2, objectId: a2.objId }), r3.internal.out("endobj");
        }
        n2 && it(r3.internal.acroformPlugin.xForms, r3);
      }(r2, e);
    }), e.internal.acroformPlugin.isInitialized = true;
  }
}, ot = q.__acroform__.arrayToPdfArray = function(e, r, n2) {
  var i2 = function(t3) {
    return t3;
  };
  if (Array.isArray(e)) {
    for (var a2 = "[", o2 = 0; o2 < e.length; o2++) switch (0 !== o2 && (a2 += " "), t(e[o2])) {
      case "boolean":
      case "number":
      case "object":
        a2 += e[o2].toString();
        break;
      case "string":
        "/" !== e[o2].substr(0, 1) ? (void 0 !== r && n2 && (i2 = n2.internal.getEncryptor(r)), a2 += "(" + R(i2(e[o2].toString())) + ")") : a2 += e[o2].toString();
    }
    return a2 += "]";
  }
  throw new Error("Invalid argument passed to jsPDF.__acroform__.arrayToPdfArray");
};
var st = function(t3, e, r) {
  var n2 = function(t4) {
    return t4;
  };
  return void 0 !== e && r && (n2 = r.internal.getEncryptor(e)), (t3 = t3 || "").toString(), t3 = "(" + R(n2(t3)) + ")";
}, ct = function() {
  this._objId = void 0, this._scope = void 0, Object.defineProperty(this, "objId", { get: function() {
    if (void 0 === this._objId) {
      if (void 0 === this.scope) return;
      this._objId = this.scope.internal.newObjectDeferred();
    }
    return this._objId;
  }, set: function(t3) {
    this._objId = t3;
  } }), Object.defineProperty(this, "scope", { value: this._scope, writable: true });
};
ct.prototype.toString = function() {
  return this.objId + " 0 R";
}, ct.prototype.putStream = function() {
  var t3 = this.getKeyValueListForStream();
  this.scope.internal.putStream({ data: this.stream, additionalKeyValues: t3, objectId: this.objId }), this.scope.internal.out("endobj");
}, ct.prototype.getKeyValueListForStream = function() {
  var t3 = [], e = Object.getOwnPropertyNames(this).filter(function(t4) {
    return "content" != t4 && "appearanceStreamContent" != t4 && "scope" != t4 && "objId" != t4 && "_" != t4.substring(0, 1);
  });
  for (var r in e) if (false === Object.getOwnPropertyDescriptor(this, e[r]).configurable) {
    var n2 = e[r], i2 = this[n2];
    i2 && (Array.isArray(i2) ? t3.push({ key: n2, value: ot(i2, this.objId, this.scope) }) : i2 instanceof ct ? (i2.scope = this.scope, t3.push({ key: n2, value: i2.objId + " 0 R" })) : "function" != typeof i2 && t3.push({ key: n2, value: i2 }));
  }
  return t3;
};
var ut = function() {
  ct.call(this), Object.defineProperty(this, "Type", { value: "/XObject", configurable: false, writable: true }), Object.defineProperty(this, "Subtype", { value: "/Form", configurable: false, writable: true }), Object.defineProperty(this, "FormType", { value: 1, configurable: false, writable: true });
  var t3, e = [];
  Object.defineProperty(this, "BBox", { configurable: false, get: function() {
    return e;
  }, set: function(t4) {
    e = t4;
  } }), Object.defineProperty(this, "Resources", { value: "2 0 R", configurable: false, writable: true }), Object.defineProperty(this, "stream", { enumerable: false, configurable: true, set: function(e2) {
    t3 = e2.trim();
  }, get: function() {
    return t3 || null;
  } });
};
H(ut, ct);
var ht = function() {
  ct.call(this);
  var t3, e = [];
  Object.defineProperty(this, "Kids", { enumerable: false, configurable: true, get: function() {
    return e.length > 0 ? e : void 0;
  } }), Object.defineProperty(this, "Fields", { enumerable: false, configurable: false, get: function() {
    return e;
  } }), Object.defineProperty(this, "DA", { enumerable: false, configurable: false, get: function() {
    if (t3) {
      var e2 = function(t4) {
        return t4;
      };
      return this.scope && (e2 = this.scope.internal.getEncryptor(this.objId)), "(" + R(e2(t3)) + ")";
    }
  }, set: function(e2) {
    t3 = e2;
  } });
};
H(ht, ct);
var lt = function t2() {
  ct.call(this);
  var e = 4;
  Object.defineProperty(this, "F", { enumerable: false, configurable: false, get: function() {
    return e;
  }, set: function(t3) {
    if (isNaN(t3)) throw new Error('Invalid value "' + t3 + '" for attribute F supplied.');
    e = t3;
  } }), Object.defineProperty(this, "showWhenPrinted", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(e, 3));
  }, set: function(t3) {
    true === Boolean(t3) ? this.F = K(e, 3) : this.F = Z(e, 3);
  } });
  var r = 0;
  Object.defineProperty(this, "Ff", { enumerable: false, configurable: false, get: function() {
    return r;
  }, set: function(t3) {
    if (isNaN(t3)) throw new Error('Invalid value "' + t3 + '" for attribute Ff supplied.');
    r = t3;
  } });
  var n2 = [];
  Object.defineProperty(this, "Rect", { enumerable: false, configurable: false, get: function() {
    if (0 !== n2.length) return n2;
  }, set: function(t3) {
    n2 = void 0 !== t3 ? t3 : [];
  } }), Object.defineProperty(this, "x", { enumerable: true, configurable: true, get: function() {
    return !n2 || isNaN(n2[0]) ? 0 : n2[0];
  }, set: function(t3) {
    n2[0] = t3;
  } }), Object.defineProperty(this, "y", { enumerable: true, configurable: true, get: function() {
    return !n2 || isNaN(n2[1]) ? 0 : n2[1];
  }, set: function(t3) {
    n2[1] = t3;
  } }), Object.defineProperty(this, "width", { enumerable: true, configurable: true, get: function() {
    return !n2 || isNaN(n2[2]) ? 0 : n2[2];
  }, set: function(t3) {
    n2[2] = t3;
  } }), Object.defineProperty(this, "height", { enumerable: true, configurable: true, get: function() {
    return !n2 || isNaN(n2[3]) ? 0 : n2[3];
  }, set: function(t3) {
    n2[3] = t3;
  } });
  var i2 = "";
  Object.defineProperty(this, "FT", { enumerable: true, configurable: false, get: function() {
    return i2;
  }, set: function(t3) {
    switch (t3) {
      case "/Btn":
      case "/Tx":
      case "/Ch":
      case "/Sig":
        i2 = t3;
        break;
      default:
        throw new Error('Invalid value "' + t3 + '" for attribute FT supplied.');
    }
  } });
  var a2 = null;
  Object.defineProperty(this, "T", { enumerable: true, configurable: false, get: function() {
    if (!a2 || a2.length < 1) {
      if (this instanceof yt) return;
      a2 = "FieldObject" + t2.FieldNum++;
    }
    var e2 = function(t3) {
      return t3;
    };
    return this.scope && (e2 = this.scope.internal.getEncryptor(this.objId)), "(" + R(e2(a2)) + ")";
  }, set: function(t3) {
    a2 = t3.toString();
  } }), Object.defineProperty(this, "fieldName", { configurable: true, enumerable: true, get: function() {
    return a2;
  }, set: function(t3) {
    a2 = t3;
  } });
  var o2 = "helvetica";
  Object.defineProperty(this, "fontName", { enumerable: true, configurable: true, get: function() {
    return o2;
  }, set: function(t3) {
    o2 = t3;
  } });
  var s2 = "normal";
  Object.defineProperty(this, "fontStyle", { enumerable: true, configurable: true, get: function() {
    return s2;
  }, set: function(t3) {
    s2 = t3;
  } });
  var c2 = 0;
  Object.defineProperty(this, "fontSize", { enumerable: true, configurable: true, get: function() {
    return c2;
  }, set: function(t3) {
    c2 = t3;
  } });
  var u2 = void 0;
  Object.defineProperty(this, "maxFontSize", { enumerable: true, configurable: true, get: function() {
    return void 0 === u2 ? 50 / D : u2;
  }, set: function(t3) {
    u2 = t3;
  } });
  var h2 = "black";
  Object.defineProperty(this, "color", { enumerable: true, configurable: true, get: function() {
    return h2;
  }, set: function(t3) {
    h2 = t3;
  } });
  var l2 = "/F1 0 Tf 0 g";
  Object.defineProperty(this, "DA", { enumerable: true, configurable: false, get: function() {
    if (!(!l2 || this instanceof yt || this instanceof Nt)) return st(l2, this.objId, this.scope);
  }, set: function(t3) {
    t3 = t3.toString(), l2 = t3;
  } });
  var f2 = null;
  Object.defineProperty(this, "DV", { enumerable: false, configurable: false, get: function() {
    if (f2) return this instanceof mt == false ? st(f2, this.objId, this.scope) : f2;
  }, set: function(t3) {
    t3 = t3.toString(), f2 = this instanceof mt == false ? "(" === t3.substr(0, 1) ? T(t3.substr(1, t3.length - 2)) : T(t3) : t3;
  } }), Object.defineProperty(this, "defaultValue", { enumerable: true, configurable: true, get: function() {
    return this instanceof mt == true ? T(f2.substr(1, f2.length - 1)) : f2;
  }, set: function(t3) {
    t3 = t3.toString(), f2 = this instanceof mt == true ? "/" + t3 : t3;
  } });
  var d2 = null;
  Object.defineProperty(this, "_V", { enumerable: false, configurable: false, get: function() {
    if (d2) return d2;
  }, set: function(t3) {
    this.V = t3;
  } }), Object.defineProperty(this, "V", { enumerable: false, configurable: false, get: function() {
    if (d2) return this instanceof mt == false ? st(d2, this.objId, this.scope) : d2;
  }, set: function(t3) {
    t3 = t3.toString(), d2 = this instanceof mt == false ? "(" === t3.substr(0, 1) ? T(t3.substr(1, t3.length - 2)) : T(t3) : t3;
  } }), Object.defineProperty(this, "value", { enumerable: true, configurable: true, get: function() {
    return this instanceof mt == true ? T(d2.substr(1, d2.length - 1)) : d2;
  }, set: function(t3) {
    t3 = t3.toString(), d2 = this instanceof mt == true ? "/" + t3 : t3;
  } }), Object.defineProperty(this, "hasAnnotation", { enumerable: true, configurable: true, get: function() {
    return this.Rect;
  } }), Object.defineProperty(this, "Type", { enumerable: true, configurable: false, get: function() {
    return this.hasAnnotation ? "/Annot" : null;
  } }), Object.defineProperty(this, "Subtype", { enumerable: true, configurable: false, get: function() {
    return this.hasAnnotation ? "/Widget" : null;
  } });
  var p2, g2 = false;
  Object.defineProperty(this, "hasAppearanceStream", { enumerable: true, configurable: true, get: function() {
    return g2;
  }, set: function(t3) {
    t3 = Boolean(t3), g2 = t3;
  } }), Object.defineProperty(this, "page", { enumerable: true, configurable: true, get: function() {
    if (p2) return p2;
  }, set: function(t3) {
    p2 = t3;
  } }), Object.defineProperty(this, "readOnly", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 1));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 1) : this.Ff = Z(this.Ff, 1);
  } }), Object.defineProperty(this, "required", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 2));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 2) : this.Ff = Z(this.Ff, 2);
  } }), Object.defineProperty(this, "noExport", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 3));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 3) : this.Ff = Z(this.Ff, 3);
  } });
  var m2 = null;
  Object.defineProperty(this, "Q", { enumerable: true, configurable: false, get: function() {
    if (null !== m2) return m2;
  }, set: function(t3) {
    if (-1 === [0, 1, 2].indexOf(t3)) throw new Error('Invalid value "' + t3 + '" for attribute Q supplied.');
    m2 = t3;
  } }), Object.defineProperty(this, "textAlign", { get: function() {
    var t3;
    switch (m2) {
      case 0:
      default:
        t3 = "left";
        break;
      case 1:
        t3 = "center";
        break;
      case 2:
        t3 = "right";
    }
    return t3;
  }, configurable: true, enumerable: true, set: function(t3) {
    switch (t3) {
      case "right":
      case 2:
        m2 = 2;
        break;
      case "center":
      case 1:
        m2 = 1;
        break;
      case "left":
      case 0:
      default:
        m2 = 0;
    }
  } });
};
H(lt, ct);
var ft = function() {
  lt.call(this), this.FT = "/Ch", this.V = "()", this.fontName = "zapfdingbats";
  var t3 = 0;
  Object.defineProperty(this, "TI", { enumerable: true, configurable: false, get: function() {
    return t3;
  }, set: function(e2) {
    t3 = e2;
  } }), Object.defineProperty(this, "topIndex", { enumerable: true, configurable: true, get: function() {
    return t3;
  }, set: function(e2) {
    t3 = e2;
  } });
  var e = [];
  Object.defineProperty(this, "Opt", { enumerable: true, configurable: false, get: function() {
    return ot(e, this.objId, this.scope);
  }, set: function(t4) {
    var r, n2;
    n2 = [], "string" == typeof (r = t4) && (n2 = function(t5, e2, r2) {
      r2 || (r2 = 1);
      for (var n3, i2 = []; n3 = e2.exec(t5); ) i2.push(n3[r2]);
      return i2;
    }(r, /\((.*?)\)/g)), e = n2;
  } }), this.getOptions = function() {
    return e;
  }, this.setOptions = function(t4) {
    e = t4, this.sort && e.sort();
  }, this.addOption = function(t4) {
    t4 = (t4 = t4 || "").toString(), e.push(t4), this.sort && e.sort();
  }, this.removeOption = function(t4, r) {
    for (r = r || false, t4 = (t4 = t4 || "").toString(); -1 !== e.indexOf(t4) && (e.splice(e.indexOf(t4), 1), false !== r); ) ;
  }, Object.defineProperty(this, "combo", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 18));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 18) : this.Ff = Z(this.Ff, 18);
  } }), Object.defineProperty(this, "edit", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 19));
  }, set: function(t4) {
    true === this.combo && (true === Boolean(t4) ? this.Ff = K(this.Ff, 19) : this.Ff = Z(this.Ff, 19));
  } }), Object.defineProperty(this, "sort", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 20));
  }, set: function(t4) {
    true === Boolean(t4) ? (this.Ff = K(this.Ff, 20), e.sort()) : this.Ff = Z(this.Ff, 20);
  } }), Object.defineProperty(this, "multiSelect", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 22));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 22) : this.Ff = Z(this.Ff, 22);
  } }), Object.defineProperty(this, "doNotSpellCheck", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 23));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 23) : this.Ff = Z(this.Ff, 23);
  } }), Object.defineProperty(this, "commitOnSelChange", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 27));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 27) : this.Ff = Z(this.Ff, 27);
  } }), this.hasAppearanceStream = false;
};
H(ft, lt);
var dt = function() {
  ft.call(this), this.fontName = "helvetica", this.combo = false;
};
H(dt, ft);
var pt = function() {
  dt.call(this), this.combo = true;
};
H(pt, dt);
var gt = function() {
  pt.call(this), this.edit = true;
};
H(gt, pt);
var mt = function() {
  lt.call(this), this.FT = "/Btn", Object.defineProperty(this, "noToggleToOff", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 15));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 15) : this.Ff = Z(this.Ff, 15);
  } }), Object.defineProperty(this, "radio", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 16));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 16) : this.Ff = Z(this.Ff, 16);
  } }), Object.defineProperty(this, "pushButton", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 17));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 17) : this.Ff = Z(this.Ff, 17);
  } }), Object.defineProperty(this, "radioIsUnison", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 26));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 26) : this.Ff = Z(this.Ff, 26);
  } });
  var e, r = {};
  Object.defineProperty(this, "MK", { enumerable: false, configurable: false, get: function() {
    var t3 = function(t4) {
      return t4;
    };
    if (this.scope && (t3 = this.scope.internal.getEncryptor(this.objId)), 0 !== Object.keys(r).length) {
      var e2, n2 = [];
      for (e2 in n2.push("<<"), r) n2.push("/" + e2 + " (" + R(t3(r[e2])) + ")");
      return n2.push(">>"), n2.join("\n");
    }
  }, set: function(e2) {
    "object" === t(e2) && (r = e2);
  } }), Object.defineProperty(this, "caption", { enumerable: true, configurable: true, get: function() {
    return r.CA || "";
  }, set: function(t3) {
    "string" == typeof t3 && (r.CA = t3);
  } }), Object.defineProperty(this, "AS", { enumerable: false, configurable: false, get: function() {
    return e;
  }, set: function(t3) {
    e = t3;
  } }), Object.defineProperty(this, "appearanceState", { enumerable: true, configurable: true, get: function() {
    return e.substr(1, e.length - 1);
  }, set: function(t3) {
    e = "/" + t3;
  } });
};
H(mt, lt);
var vt = function() {
  mt.call(this), this.pushButton = true;
};
H(vt, mt);
var bt = function() {
  mt.call(this), this.radio = true, this.pushButton = false;
  var t3 = [];
  Object.defineProperty(this, "Kids", { enumerable: true, configurable: false, get: function() {
    return t3;
  }, set: function(e) {
    t3 = void 0 !== e ? e : [];
  } });
};
H(bt, mt);
var yt = function() {
  var e, r;
  lt.call(this), Object.defineProperty(this, "Parent", { enumerable: false, configurable: false, get: function() {
    return e;
  }, set: function(t3) {
    e = t3;
  } }), Object.defineProperty(this, "optionName", { enumerable: false, configurable: true, get: function() {
    return r;
  }, set: function(t3) {
    r = t3;
  } });
  var n2, i2 = {};
  Object.defineProperty(this, "MK", { enumerable: false, configurable: false, get: function() {
    var t3 = function(t4) {
      return t4;
    };
    this.scope && (t3 = this.scope.internal.getEncryptor(this.objId));
    var e2, r2 = [];
    for (e2 in r2.push("<<"), i2) r2.push("/" + e2 + " (" + R(t3(i2[e2])) + ")");
    return r2.push(">>"), r2.join("\n");
  }, set: function(e2) {
    "object" === t(e2) && (i2 = e2);
  } }), Object.defineProperty(this, "caption", { enumerable: true, configurable: true, get: function() {
    return i2.CA || "";
  }, set: function(t3) {
    "string" == typeof t3 && (i2.CA = t3);
  } }), Object.defineProperty(this, "AS", { enumerable: false, configurable: false, get: function() {
    return n2;
  }, set: function(t3) {
    n2 = t3;
  } }), Object.defineProperty(this, "appearanceState", { enumerable: true, configurable: true, get: function() {
    return n2.substr(1, n2.length - 1);
  }, set: function(t3) {
    n2 = "/" + t3;
  } }), this.caption = "l", this.appearanceState = "Off", this._AppearanceType = At.RadioButton.Circle, this.appearanceStreamContent = this._AppearanceType.createAppearanceStream(this.optionName);
};
H(yt, lt), bt.prototype.setAppearance = function(t3) {
  if (!("createAppearanceStream" in t3) || !("getCA" in t3)) throw new Error("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");
  for (var e in this.Kids) if (this.Kids.hasOwnProperty(e)) {
    var r = this.Kids[e];
    r.appearanceStreamContent = t3.createAppearanceStream(r.optionName), r.caption = t3.getCA();
  }
}, bt.prototype.createOption = function(t3) {
  var e = new yt();
  return e.Parent = this, e.optionName = t3, this.Kids.push(e), xt.call(this.scope, e), e;
};
var wt = function() {
  mt.call(this), this.fontName = "zapfdingbats", this.caption = "3", this.appearanceState = "On", this.value = "On", this.textAlign = "center", this.appearanceStreamContent = At.CheckBox.createAppearanceStream();
};
H(wt, mt);
var Nt = function() {
  lt.call(this), this.FT = "/Tx", Object.defineProperty(this, "multiline", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 13));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 13) : this.Ff = Z(this.Ff, 13);
  } }), Object.defineProperty(this, "fileSelect", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 21));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 21) : this.Ff = Z(this.Ff, 21);
  } }), Object.defineProperty(this, "doNotSpellCheck", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 23));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 23) : this.Ff = Z(this.Ff, 23);
  } }), Object.defineProperty(this, "doNotScroll", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 24));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 24) : this.Ff = Z(this.Ff, 24);
  } }), Object.defineProperty(this, "comb", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 25));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 25) : this.Ff = Z(this.Ff, 25);
  } }), Object.defineProperty(this, "richText", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 26));
  }, set: function(t4) {
    true === Boolean(t4) ? this.Ff = K(this.Ff, 26) : this.Ff = Z(this.Ff, 26);
  } });
  var t3 = null;
  Object.defineProperty(this, "MaxLen", { enumerable: true, configurable: false, get: function() {
    return t3;
  }, set: function(e) {
    t3 = e;
  } }), Object.defineProperty(this, "maxLength", { enumerable: true, configurable: true, get: function() {
    return t3;
  }, set: function(e) {
    Number.isInteger(e) && (t3 = e);
  } }), Object.defineProperty(this, "hasAppearanceStream", { enumerable: true, configurable: true, get: function() {
    return this.V || this.DV;
  } });
};
H(Nt, lt);
var Lt = function() {
  Nt.call(this), Object.defineProperty(this, "password", { enumerable: true, configurable: true, get: function() {
    return Boolean(X(this.Ff, 14));
  }, set: function(t3) {
    true === Boolean(t3) ? this.Ff = K(this.Ff, 14) : this.Ff = Z(this.Ff, 14);
  } }), this.password = true;
};
H(Lt, Nt);
var At = { CheckBox: { createAppearanceStream: function() {
  return { N: { On: At.CheckBox.YesNormal }, D: { On: At.CheckBox.YesPushDown, Off: At.CheckBox.OffPushDown } };
}, YesPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [], n2 = t3.scope.internal.getFont(t3.fontName, t3.fontStyle).id, i2 = t3.scope.__private__.encodeColorString(t3.color), a2 = tt(t3, t3.caption);
  return r.push("0.749023 g"), r.push("0 0 " + U(At.internal.getWidth(t3)) + " " + U(At.internal.getHeight(t3)) + " re"), r.push("f"), r.push("BMC"), r.push("q"), r.push("0 0 1 rg"), r.push("/" + n2 + " " + U(a2.fontSize) + " Tf " + i2), r.push("BT"), r.push(a2.text), r.push("ET"), r.push("Q"), r.push("EMC"), e.stream = r.join("\n"), e;
}, YesNormal: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = t3.scope.internal.getFont(t3.fontName, t3.fontStyle).id, n2 = t3.scope.__private__.encodeColorString(t3.color), i2 = [], a2 = At.internal.getHeight(t3), o2 = At.internal.getWidth(t3), s2 = tt(t3, t3.caption);
  return i2.push("1 g"), i2.push("0 0 " + U(o2) + " " + U(a2) + " re"), i2.push("f"), i2.push("q"), i2.push("0 0 1 rg"), i2.push("0 0 " + U(o2 - 1) + " " + U(a2 - 1) + " re"), i2.push("W"), i2.push("n"), i2.push("0 g"), i2.push("BT"), i2.push("/" + r + " " + U(s2.fontSize) + " Tf " + n2), i2.push(s2.text), i2.push("ET"), i2.push("Q"), e.stream = i2.join("\n"), e;
}, OffPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [];
  return r.push("0.749023 g"), r.push("0 0 " + U(At.internal.getWidth(t3)) + " " + U(At.internal.getHeight(t3)) + " re"), r.push("f"), e.stream = r.join("\n"), e;
} }, RadioButton: { Circle: { createAppearanceStream: function(t3) {
  var e = { D: { Off: At.RadioButton.Circle.OffPushDown }, N: {} };
  return e.N[t3] = At.RadioButton.Circle.YesNormal, e.D[t3] = At.RadioButton.Circle.YesPushDown, e;
}, getCA: function() {
  return "l";
}, YesNormal: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [], n2 = At.internal.getWidth(t3) <= At.internal.getHeight(t3) ? At.internal.getWidth(t3) / 4 : At.internal.getHeight(t3) / 4;
  n2 = Number((0.9 * n2).toFixed(5));
  var i2 = At.internal.Bezier_C, a2 = Number((n2 * i2).toFixed(5));
  return r.push("q"), r.push("1 0 0 1 " + z(At.internal.getWidth(t3) / 2) + " " + z(At.internal.getHeight(t3) / 2) + " cm"), r.push(n2 + " 0 m"), r.push(n2 + " " + a2 + " " + a2 + " " + n2 + " 0 " + n2 + " c"), r.push("-" + a2 + " " + n2 + " -" + n2 + " " + a2 + " -" + n2 + " 0 c"), r.push("-" + n2 + " -" + a2 + " -" + a2 + " -" + n2 + " 0 -" + n2 + " c"), r.push(a2 + " -" + n2 + " " + n2 + " -" + a2 + " " + n2 + " 0 c"), r.push("f"), r.push("Q"), e.stream = r.join("\n"), e;
}, YesPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [], n2 = At.internal.getWidth(t3) <= At.internal.getHeight(t3) ? At.internal.getWidth(t3) / 4 : At.internal.getHeight(t3) / 4;
  n2 = Number((0.9 * n2).toFixed(5));
  var i2 = Number((2 * n2).toFixed(5)), a2 = Number((i2 * At.internal.Bezier_C).toFixed(5)), o2 = Number((n2 * At.internal.Bezier_C).toFixed(5));
  return r.push("0.749023 g"), r.push("q"), r.push("1 0 0 1 " + z(At.internal.getWidth(t3) / 2) + " " + z(At.internal.getHeight(t3) / 2) + " cm"), r.push(i2 + " 0 m"), r.push(i2 + " " + a2 + " " + a2 + " " + i2 + " 0 " + i2 + " c"), r.push("-" + a2 + " " + i2 + " -" + i2 + " " + a2 + " -" + i2 + " 0 c"), r.push("-" + i2 + " -" + a2 + " -" + a2 + " -" + i2 + " 0 -" + i2 + " c"), r.push(a2 + " -" + i2 + " " + i2 + " -" + a2 + " " + i2 + " 0 c"), r.push("f"), r.push("Q"), r.push("0 g"), r.push("q"), r.push("1 0 0 1 " + z(At.internal.getWidth(t3) / 2) + " " + z(At.internal.getHeight(t3) / 2) + " cm"), r.push(n2 + " 0 m"), r.push(n2 + " " + o2 + " " + o2 + " " + n2 + " 0 " + n2 + " c"), r.push("-" + o2 + " " + n2 + " -" + n2 + " " + o2 + " -" + n2 + " 0 c"), r.push("-" + n2 + " -" + o2 + " -" + o2 + " -" + n2 + " 0 -" + n2 + " c"), r.push(o2 + " -" + n2 + " " + n2 + " -" + o2 + " " + n2 + " 0 c"), r.push("f"), r.push("Q"), e.stream = r.join("\n"), e;
}, OffPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [], n2 = At.internal.getWidth(t3) <= At.internal.getHeight(t3) ? At.internal.getWidth(t3) / 4 : At.internal.getHeight(t3) / 4;
  n2 = Number((0.9 * n2).toFixed(5));
  var i2 = Number((2 * n2).toFixed(5)), a2 = Number((i2 * At.internal.Bezier_C).toFixed(5));
  return r.push("0.749023 g"), r.push("q"), r.push("1 0 0 1 " + z(At.internal.getWidth(t3) / 2) + " " + z(At.internal.getHeight(t3) / 2) + " cm"), r.push(i2 + " 0 m"), r.push(i2 + " " + a2 + " " + a2 + " " + i2 + " 0 " + i2 + " c"), r.push("-" + a2 + " " + i2 + " -" + i2 + " " + a2 + " -" + i2 + " 0 c"), r.push("-" + i2 + " -" + a2 + " -" + a2 + " -" + i2 + " 0 -" + i2 + " c"), r.push(a2 + " -" + i2 + " " + i2 + " -" + a2 + " " + i2 + " 0 c"), r.push("f"), r.push("Q"), e.stream = r.join("\n"), e;
} }, Cross: { createAppearanceStream: function(t3) {
  var e = { D: { Off: At.RadioButton.Cross.OffPushDown }, N: {} };
  return e.N[t3] = At.RadioButton.Cross.YesNormal, e.D[t3] = At.RadioButton.Cross.YesPushDown, e;
}, getCA: function() {
  return "8";
}, YesNormal: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [], n2 = At.internal.calculateCross(t3);
  return r.push("q"), r.push("1 1 " + U(At.internal.getWidth(t3) - 2) + " " + U(At.internal.getHeight(t3) - 2) + " re"), r.push("W"), r.push("n"), r.push(U(n2.x1.x) + " " + U(n2.x1.y) + " m"), r.push(U(n2.x2.x) + " " + U(n2.x2.y) + " l"), r.push(U(n2.x4.x) + " " + U(n2.x4.y) + " m"), r.push(U(n2.x3.x) + " " + U(n2.x3.y) + " l"), r.push("s"), r.push("Q"), e.stream = r.join("\n"), e;
}, YesPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = At.internal.calculateCross(t3), n2 = [];
  return n2.push("0.749023 g"), n2.push("0 0 " + U(At.internal.getWidth(t3)) + " " + U(At.internal.getHeight(t3)) + " re"), n2.push("f"), n2.push("q"), n2.push("1 1 " + U(At.internal.getWidth(t3) - 2) + " " + U(At.internal.getHeight(t3) - 2) + " re"), n2.push("W"), n2.push("n"), n2.push(U(r.x1.x) + " " + U(r.x1.y) + " m"), n2.push(U(r.x2.x) + " " + U(r.x2.y) + " l"), n2.push(U(r.x4.x) + " " + U(r.x4.y) + " m"), n2.push(U(r.x3.x) + " " + U(r.x3.y) + " l"), n2.push("s"), n2.push("Q"), e.stream = n2.join("\n"), e;
}, OffPushDown: function(t3) {
  var e = V(t3);
  e.scope = t3.scope;
  var r = [];
  return r.push("0.749023 g"), r.push("0 0 " + U(At.internal.getWidth(t3)) + " " + U(At.internal.getHeight(t3)) + " re"), r.push("f"), e.stream = r.join("\n"), e;
} } }, createDefaultAppearanceStream: function(t3) {
  var e = t3.scope.internal.getFont(t3.fontName, t3.fontStyle).id, r = t3.scope.__private__.encodeColorString(t3.color);
  return "/" + e + " " + t3.fontSize + " Tf " + r;
} };
At.internal = { Bezier_C: 0.551915024494, calculateCross: function(t3) {
  var e = At.internal.getWidth(t3), r = At.internal.getHeight(t3), n2 = Math.min(e, r);
  return { x1: { x: (e - n2) / 2, y: (r - n2) / 2 + n2 }, x2: { x: (e - n2) / 2 + n2, y: (r - n2) / 2 }, x3: { x: (e - n2) / 2, y: (r - n2) / 2 }, x4: { x: (e - n2) / 2 + n2, y: (r - n2) / 2 + n2 } };
} }, At.internal.getWidth = function(e) {
  var r = 0;
  return "object" === t(e) && (r = W(e.Rect[2])), r;
}, At.internal.getHeight = function(e) {
  var r = 0;
  return "object" === t(e) && (r = W(e.Rect[3])), r;
};
var xt = q.addField = function(t3) {
  if (at(this, t3), !(t3 instanceof lt)) throw new Error("Invalid argument passed to jsPDF.addField.");
  var e;
  return (e = t3).scope.internal.acroformPlugin.printedOut && (e.scope.internal.acroformPlugin.printedOut = false, e.scope.internal.acroformPlugin.acroFormDictionaryRoot = null), e.scope.internal.acroformPlugin.acroFormDictionaryRoot.Fields.push(e), t3.page = t3.scope.internal.getCurrentPageInfo().pageNumber, this;
};
q.AcroFormChoiceField = ft, q.AcroFormListBox = dt, q.AcroFormComboBox = pt, q.AcroFormEditBox = gt, q.AcroFormButton = mt, q.AcroFormPushButton = vt, q.AcroFormRadioButton = bt, q.AcroFormCheckBox = wt, q.AcroFormTextField = Nt, q.AcroFormPasswordField = Lt, q.AcroFormAppearance = At, q.AcroForm = { ChoiceField: ft, ListBox: dt, ComboBox: pt, EditBox: gt, Button: mt, PushButton: vt, RadioButton: bt, CheckBox: wt, TextField: Nt, PasswordField: Lt, Appearance: At }, E.AcroForm = { ChoiceField: ft, ListBox: dt, ComboBox: pt, EditBox: gt, Button: mt, PushButton: vt, RadioButton: bt, CheckBox: wt, TextField: Nt, PasswordField: Lt, Appearance: At };
E.AcroForm;
function _t(t3) {
  return t3.reduce(function(t4, e, r) {
    return t4[e] = r, t4;
  }, {});
}
!function(e) {
  e.__addimage__ = {};
  var r = "UNKNOWN", n2 = { PNG: [[137, 80, 78, 71]], TIFF: [[77, 77, 0, 42], [73, 73, 42, 0]], JPEG: [[255, 216, 255, 224, void 0, void 0, 74, 70, 73, 70, 0], [255, 216, 255, 225, void 0, void 0, 69, 120, 105, 102, 0, 0], [255, 216, 255, 219], [255, 216, 255, 238]], JPEG2000: [[0, 0, 0, 12, 106, 80, 32, 32]], GIF87a: [[71, 73, 70, 56, 55, 97]], GIF89a: [[71, 73, 70, 56, 57, 97]], WEBP: [[82, 73, 70, 70, void 0, void 0, void 0, void 0, 87, 69, 66, 80]], BMP: [[66, 77], [66, 65], [67, 73], [67, 80], [73, 67], [80, 84]] }, i2 = e.__addimage__.getImageFileTypeByImageData = function(t3, e2) {
    var i3, a3, o3, s3, c3, u2 = r;
    if ("RGBA" === (e2 = e2 || r) || void 0 !== t3.data && t3.data instanceof Uint8ClampedArray && "height" in t3 && "width" in t3) return "RGBA";
    if (x2(t3)) for (c3 in n2) for (o3 = n2[c3], i3 = 0; i3 < o3.length; i3 += 1) {
      for (s3 = true, a3 = 0; a3 < o3[i3].length; a3 += 1) if (void 0 !== o3[i3][a3] && o3[i3][a3] !== t3[a3]) {
        s3 = false;
        break;
      }
      if (true === s3) {
        u2 = c3;
        break;
      }
    }
    else for (c3 in n2) for (o3 = n2[c3], i3 = 0; i3 < o3.length; i3 += 1) {
      for (s3 = true, a3 = 0; a3 < o3[i3].length; a3 += 1) if (void 0 !== o3[i3][a3] && o3[i3][a3] !== t3.charCodeAt(a3)) {
        s3 = false;
        break;
      }
      if (true === s3) {
        u2 = c3;
        break;
      }
    }
    return u2 === r && e2 !== r && (u2 = e2), u2;
  }, a2 = function t3(e2) {
    for (var r2 = this.internal.write, n3 = this.internal.putStream, i3 = (0, this.internal.getFilters)(); -1 !== i3.indexOf("FlateEncode"); ) i3.splice(i3.indexOf("FlateEncode"), 1);
    e2.objectId = this.internal.newObject();
    var a3 = [];
    if (a3.push({ key: "Type", value: "/XObject" }), a3.push({ key: "Subtype", value: "/Image" }), a3.push({ key: "Width", value: e2.width }), a3.push({ key: "Height", value: e2.height }), e2.colorSpace === b2.INDEXED ? a3.push({ key: "ColorSpace", value: "[/Indexed /DeviceRGB " + (e2.palette.length / 3 - 1) + " " + ("sMask" in e2 && void 0 !== e2.sMask ? e2.objectId + 2 : e2.objectId + 1) + " 0 R]" }) : (a3.push({ key: "ColorSpace", value: "/" + e2.colorSpace }), e2.colorSpace === b2.DEVICE_CMYK && a3.push({ key: "Decode", value: "[1 0 1 0 1 0 1 0]" })), a3.push({ key: "BitsPerComponent", value: e2.bitsPerComponent }), "decodeParameters" in e2 && void 0 !== e2.decodeParameters && a3.push({ key: "DecodeParms", value: "<<" + e2.decodeParameters + ">>" }), "transparency" in e2 && Array.isArray(e2.transparency)) {
      for (var o3 = "", s3 = 0, c3 = e2.transparency.length; s3 < c3; s3++) o3 += e2.transparency[s3] + " " + e2.transparency[s3] + " ";
      a3.push({ key: "Mask", value: "[" + o3 + "]" });
    }
    void 0 !== e2.sMask && a3.push({ key: "SMask", value: e2.objectId + 1 + " 0 R" });
    var u2 = void 0 !== e2.filter ? ["/" + e2.filter] : void 0;
    if (n3({ data: e2.data, additionalKeyValues: a3, alreadyAppliedFilters: u2, objectId: e2.objectId }), r2("endobj"), "sMask" in e2 && void 0 !== e2.sMask) {
      var h3 = "/Predictor " + e2.predictor + " /Colors 1 /BitsPerComponent " + e2.bitsPerComponent + " /Columns " + e2.width, l3 = { width: e2.width, height: e2.height, colorSpace: "DeviceGray", bitsPerComponent: e2.bitsPerComponent, decodeParameters: h3, data: e2.sMask };
      "filter" in e2 && (l3.filter = e2.filter), t3.call(this, l3);
    }
    if (e2.colorSpace === b2.INDEXED) {
      var f3 = this.internal.newObject();
      n3({ data: _2(new Uint8Array(e2.palette)), objectId: f3 }), r2("endobj");
    }
  }, o2 = function() {
    var t3 = this.internal.collections.addImage_images;
    for (var e2 in t3) a2.call(this, t3[e2]);
  }, s2 = function() {
    var t3, e2 = this.internal.collections.addImage_images, r2 = this.internal.write;
    for (var n3 in e2) r2("/I" + (t3 = e2[n3]).index, t3.objectId, "0", "R");
  }, c2 = function() {
    this.internal.collections.addImage_images || (this.internal.collections.addImage_images = {}, this.internal.events.subscribe("putResources", o2), this.internal.events.subscribe("putXobjectDict", s2));
  }, h2 = function() {
    var t3 = this.internal.collections.addImage_images;
    return c2.call(this), t3;
  }, l2 = function() {
    return Object.keys(this.internal.collections.addImage_images).length;
  }, f2 = function(t3) {
    return "function" == typeof e["process" + t3.toUpperCase()];
  }, d2 = function(e2) {
    return "object" === t(e2) && 1 === e2.nodeType;
  }, p2 = function(t3, r2) {
    if ("IMG" === t3.nodeName && t3.hasAttribute("src")) {
      var n3 = "" + t3.getAttribute("src");
      if (0 === n3.indexOf("data:image/")) return u(unescape(n3).split("base64,").pop());
      var i3 = e.loadFile(n3, true);
      if (void 0 !== i3) return i3;
    }
    if ("CANVAS" === t3.nodeName) {
      if (0 === t3.width || 0 === t3.height) throw new Error("Given canvas must have data. Canvas width: " + t3.width + ", height: " + t3.height);
      var a3;
      switch (r2) {
        case "PNG":
          a3 = "image/png";
          break;
        case "WEBP":
          a3 = "image/webp";
          break;
        case "JPEG":
        case "JPG":
        default:
          a3 = "image/jpeg";
      }
      return u(t3.toDataURL(a3, 1).split("base64,").pop());
    }
  }, g2 = function(t3) {
    var e2 = this.internal.collections.addImage_images;
    if (e2) {
      for (var r2 in e2) if (t3 === e2[r2].alias) return e2[r2];
    }
  }, m2 = function(t3, e2, r2) {
    return t3 || e2 || (t3 = -96, e2 = -96), t3 < 0 && (t3 = -1 * r2.width * 72 / t3 / this.internal.scaleFactor), e2 < 0 && (e2 = -1 * r2.height * 72 / e2 / this.internal.scaleFactor), 0 === t3 && (t3 = e2 * r2.width / r2.height), 0 === e2 && (e2 = t3 * r2.height / r2.width), [t3, e2];
  }, v2 = function(t3, e2, r2, n3, i3, a3) {
    var o3 = m2.call(this, r2, n3, i3), s3 = this.internal.getCoordinateString, c3 = this.internal.getVerticalCoordinateString, u2 = h2.call(this);
    if (r2 = o3[0], n3 = o3[1], u2[i3.index] = i3, a3) {
      a3 *= Math.PI / 180;
      var l3 = Math.cos(a3), f3 = Math.sin(a3), d3 = function(t4) {
        return t4.toFixed(4);
      }, p3 = [d3(l3), d3(f3), d3(-1 * f3), d3(l3), 0, 0, "cm"];
    }
    this.internal.write("q"), a3 ? (this.internal.write([1, "0", "0", 1, s3(t3), c3(e2 + n3), "cm"].join(" ")), this.internal.write(p3.join(" ")), this.internal.write([s3(r2), "0", "0", s3(n3), "0", "0", "cm"].join(" "))) : this.internal.write([s3(r2), "0", "0", s3(n3), s3(t3), c3(e2 + n3), "cm"].join(" ")), this.isAdvancedAPI() && this.internal.write([1, 0, 0, -1, 0, 0, "cm"].join(" ")), this.internal.write("/I" + i3.index + " Do"), this.internal.write("Q");
  }, b2 = e.color_spaces = { DEVICE_RGB: "DeviceRGB", DEVICE_GRAY: "DeviceGray", DEVICE_CMYK: "DeviceCMYK", CAL_GREY: "CalGray", CAL_RGB: "CalRGB", LAB: "Lab", ICC_BASED: "ICCBased", INDEXED: "Indexed", PATTERN: "Pattern", SEPARATION: "Separation", DEVICE_N: "DeviceN" };
  e.decode = { DCT_DECODE: "DCTDecode", FLATE_DECODE: "FlateDecode", LZW_DECODE: "LZWDecode", JPX_DECODE: "JPXDecode", JBIG2_DECODE: "JBIG2Decode", ASCII85_DECODE: "ASCII85Decode", ASCII_HEX_DECODE: "ASCIIHexDecode", RUN_LENGTH_DECODE: "RunLengthDecode", CCITT_FAX_DECODE: "CCITTFaxDecode" };
  var y2 = e.image_compression = { NONE: "NONE", FAST: "FAST", MEDIUM: "MEDIUM", SLOW: "SLOW" }, w2 = e.__addimage__.sHashCode = function(t3) {
    var e2, r2, n3 = 0;
    if ("string" == typeof t3) for (r2 = t3.length, e2 = 0; e2 < r2; e2++) n3 = (n3 << 5) - n3 + t3.charCodeAt(e2), n3 |= 0;
    else if (x2(t3)) for (r2 = t3.byteLength / 2, e2 = 0; e2 < r2; e2++) n3 = (n3 << 5) - n3 + t3[e2], n3 |= 0;
    return n3;
  }, N2 = e.__addimage__.validateStringAsBase64 = function(t3) {
    (t3 = t3 || "").toString().trim();
    var e2 = true;
    return 0 === t3.length && (e2 = false), t3.length % 4 != 0 && (e2 = false), false === /^[A-Za-z0-9+/]+$/.test(t3.substr(0, t3.length - 2)) && (e2 = false), false === /^[A-Za-z0-9/][A-Za-z0-9+/]|[A-Za-z0-9+/]=|==$/.test(t3.substr(-2)) && (e2 = false), e2;
  }, L2 = e.__addimage__.extractImageFromDataUrl = function(t3) {
    var e2 = (t3 = t3 || "").split("base64,"), r2 = null;
    if (2 === e2.length) {
      var n3 = /^data:(\w*\/\w*);*(charset=(?!charset=)[\w=-]*)*;*$/.exec(e2[0]);
      Array.isArray(n3) && (r2 = { mimeType: n3[1], charset: n3[2], data: e2[1] });
    }
    return r2;
  }, A2 = e.__addimage__.supportsArrayBuffer = function() {
    return "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array;
  };
  e.__addimage__.isArrayBuffer = function(t3) {
    return A2() && t3 instanceof ArrayBuffer;
  };
  var x2 = e.__addimage__.isArrayBufferView = function(t3) {
    return A2() && "undefined" != typeof Uint32Array && (t3 instanceof Int8Array || t3 instanceof Uint8Array || "undefined" != typeof Uint8ClampedArray && t3 instanceof Uint8ClampedArray || t3 instanceof Int16Array || t3 instanceof Uint16Array || t3 instanceof Int32Array || t3 instanceof Uint32Array || t3 instanceof Float32Array || t3 instanceof Float64Array);
  }, S2 = e.__addimage__.binaryStringToUint8Array = function(t3) {
    for (var e2 = t3.length, r2 = new Uint8Array(e2), n3 = 0; n3 < e2; n3++) r2[n3] = t3.charCodeAt(n3);
    return r2;
  }, _2 = e.__addimage__.arrayBufferToBinaryString = function(t3) {
    for (var e2 = "", r2 = x2(t3) ? t3 : new Uint8Array(t3), n3 = 0; n3 < r2.length; n3 += 8192) e2 += String.fromCharCode.apply(null, r2.subarray(n3, n3 + 8192));
    return e2;
  };
  e.addImage = function() {
    var e2, n3, i3, a3, o3, s3, u2, h3, l3;
    if ("number" == typeof arguments[1] ? (n3 = r, i3 = arguments[1], a3 = arguments[2], o3 = arguments[3], s3 = arguments[4], u2 = arguments[5], h3 = arguments[6], l3 = arguments[7]) : (n3 = arguments[1], i3 = arguments[2], a3 = arguments[3], o3 = arguments[4], s3 = arguments[5], u2 = arguments[6], h3 = arguments[7], l3 = arguments[8]), "object" === t(e2 = arguments[0]) && !d2(e2) && "imageData" in e2) {
      var f3 = e2;
      e2 = f3.imageData, n3 = f3.format || n3 || r, i3 = f3.x || i3 || 0, a3 = f3.y || a3 || 0, o3 = f3.w || f3.width || o3, s3 = f3.h || f3.height || s3, u2 = f3.alias || u2, h3 = f3.compression || h3, l3 = f3.rotation || f3.angle || l3;
    }
    var p3 = this.internal.getFilters();
    if (void 0 === h3 && -1 !== p3.indexOf("FlateEncode") && (h3 = "SLOW"), isNaN(i3) || isNaN(a3)) throw new Error("Invalid coordinates passed to jsPDF.addImage");
    c2.call(this);
    var g3 = P2.call(this, e2, n3, u2, h3);
    return v2.call(this, i3, a3, o3, s3, g3, l3), this;
  };
  var P2 = function(t3, n3, a3, o3) {
    var s3, c3, u2;
    if ("string" == typeof t3 && i2(t3) === r) {
      t3 = unescape(t3);
      var h3 = k2(t3, false);
      ("" !== h3 || void 0 !== (h3 = e.loadFile(t3, true))) && (t3 = h3);
    }
    if (d2(t3) && (t3 = p2(t3, n3)), n3 = i2(t3, n3), !f2(n3)) throw new Error("addImage does not support files of type '" + n3 + "', please ensure that a plugin for '" + n3 + "' support is added.");
    if ((null == (u2 = a3) || 0 === u2.length) && (a3 = function(t4) {
      return "string" == typeof t4 || x2(t4) ? w2(t4) : x2(t4.data) ? w2(t4.data) : null;
    }(t3)), (s3 = g2.call(this, a3)) || (A2() && (t3 instanceof Uint8Array || "RGBA" === n3 || (c3 = t3, t3 = S2(t3))), s3 = this["process" + n3.toUpperCase()](t3, l2.call(this), a3, function(t4) {
      return t4 && "string" == typeof t4 && (t4 = t4.toUpperCase()), t4 in e.image_compression ? t4 : y2.NONE;
    }(o3), c3)), !s3) throw new Error("An unknown error occurred whilst processing the image.");
    return s3;
  }, k2 = e.__addimage__.convertBase64ToBinaryString = function(t3, e2) {
    var r2;
    e2 = "boolean" != typeof e2 || e2;
    var n3, i3 = "";
    if ("string" == typeof t3) {
      n3 = null !== (r2 = L2(t3)) ? r2.data : t3;
      try {
        i3 = u(n3);
      } catch (t4) {
        if (e2) throw N2(n3) ? new Error("atob-Error in jsPDF.convertBase64ToBinaryString " + t4.message) : new Error("Supplied Data is not a valid base64-String jsPDF.convertBase64ToBinaryString ");
      }
    }
    return i3;
  };
  e.getImageProperties = function(t3) {
    var n3, a3, o3 = "";
    if (d2(t3) && (t3 = p2(t3)), "string" == typeof t3 && i2(t3) === r && ("" === (o3 = k2(t3, false)) && (o3 = e.loadFile(t3) || ""), t3 = o3), a3 = i2(t3), !f2(a3)) throw new Error("addImage does not support files of type '" + a3 + "', please ensure that a plugin for '" + a3 + "' support is added.");
    if (!A2() || t3 instanceof Uint8Array || (t3 = S2(t3)), !(n3 = this["process" + a3.toUpperCase()](t3))) throw new Error("An unknown error occurred whilst processing the image");
    return n3.fileType = a3, n3;
  };
}(E.API), /**
 * @license
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = function(t4) {
    if (void 0 !== t4 && "" != t4) return true;
  };
  E.API.events.push(["addPage", function(t4) {
    this.internal.getPageInfo(t4.pageNumber).pageContext.annotations = [];
  }]), t3.events.push(["putPage", function(t4) {
    for (var r, n2, i2, a2 = this.internal.getCoordinateString, o2 = this.internal.getVerticalCoordinateString, s2 = this.internal.getPageInfoByObjId(t4.objId), c2 = t4.pageContext.annotations, u2 = false, h2 = 0; h2 < c2.length && !u2; h2++) switch ((r = c2[h2]).type) {
      case "link":
        (e(r.options.url) || e(r.options.pageNumber)) && (u2 = true);
        break;
      case "reference":
      case "text":
      case "freetext":
        u2 = true;
    }
    if (0 != u2) {
      this.internal.write("/Annots [");
      for (var l2 = 0; l2 < c2.length; l2++) {
        r = c2[l2];
        var f2 = this.internal.pdfEscape, d2 = this.internal.getEncryptor(t4.objId);
        switch (r.type) {
          case "reference":
            this.internal.write(" " + r.object.objId + " 0 R ");
            break;
          case "text":
            var p2 = this.internal.newAdditionalObject(), g2 = this.internal.newAdditionalObject(), m2 = this.internal.getEncryptor(p2.objId), v2 = r.title || "Note";
            i2 = "<</Type /Annot /Subtype /Text " + (n2 = "/Rect [" + a2(r.bounds.x) + " " + o2(r.bounds.y + r.bounds.h) + " " + a2(r.bounds.x + r.bounds.w) + " " + o2(r.bounds.y) + "] ") + "/Contents (" + f2(m2(r.contents)) + ")", i2 += " /Popup " + g2.objId + " 0 R", i2 += " /P " + s2.objId + " 0 R", i2 += " /T (" + f2(m2(v2)) + ") >>", p2.content = i2;
            var b2 = p2.objId + " 0 R";
            i2 = "<</Type /Annot /Subtype /Popup " + (n2 = "/Rect [" + a2(r.bounds.x + 30) + " " + o2(r.bounds.y + r.bounds.h) + " " + a2(r.bounds.x + r.bounds.w + 30) + " " + o2(r.bounds.y) + "] ") + " /Parent " + b2, r.open && (i2 += " /Open true"), i2 += " >>", g2.content = i2, this.internal.write(p2.objId, "0 R", g2.objId, "0 R");
            break;
          case "freetext":
            n2 = "/Rect [" + a2(r.bounds.x) + " " + o2(r.bounds.y) + " " + a2(r.bounds.x + r.bounds.w) + " " + o2(r.bounds.y + r.bounds.h) + "] ";
            var y2 = r.color || "#000000";
            i2 = "<</Type /Annot /Subtype /FreeText " + n2 + "/Contents (" + f2(d2(r.contents)) + ")", i2 += " /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#" + y2 + ")", i2 += " /Border [0 0 0]", i2 += " >>", this.internal.write(i2);
            break;
          case "link":
            if (r.options.name) {
              var w2 = this.annotations._nameMap[r.options.name];
              r.options.pageNumber = w2.page, r.options.top = w2.y;
            } else r.options.top || (r.options.top = 0);
            if (n2 = "/Rect [" + r.finalBounds.x + " " + r.finalBounds.y + " " + r.finalBounds.w + " " + r.finalBounds.h + "] ", i2 = "", r.options.url) i2 = "<</Type /Annot /Subtype /Link " + n2 + "/Border [0 0 0] /A <</S /URI /URI (" + f2(d2(r.options.url)) + ") >>";
            else if (r.options.pageNumber) {
              switch (i2 = "<</Type /Annot /Subtype /Link " + n2 + "/Border [0 0 0] /Dest [" + this.internal.getPageInfo(r.options.pageNumber).objId + " 0 R", r.options.magFactor = r.options.magFactor || "XYZ", r.options.magFactor) {
                case "Fit":
                  i2 += " /Fit]";
                  break;
                case "FitH":
                  i2 += " /FitH " + r.options.top + "]";
                  break;
                case "FitV":
                  r.options.left = r.options.left || 0, i2 += " /FitV " + r.options.left + "]";
                  break;
                case "XYZ":
                default:
                  var N2 = o2(r.options.top);
                  r.options.left = r.options.left || 0, void 0 === r.options.zoom && (r.options.zoom = 0), i2 += " /XYZ " + r.options.left + " " + N2 + " " + r.options.zoom + "]";
              }
            }
            "" != i2 && (i2 += " >>", this.internal.write(i2));
        }
      }
      this.internal.write("]");
    }
  }]), t3.createAnnotation = function(t4) {
    var e2 = this.internal.getCurrentPageInfo();
    switch (t4.type) {
      case "link":
        this.link(t4.bounds.x, t4.bounds.y, t4.bounds.w, t4.bounds.h, t4);
        break;
      case "text":
      case "freetext":
        e2.pageContext.annotations.push(t4);
    }
  }, t3.link = function(t4, e2, r, n2, i2) {
    var a2 = this.internal.getCurrentPageInfo(), o2 = this.internal.getCoordinateString, s2 = this.internal.getVerticalCoordinateString;
    a2.pageContext.annotations.push({ finalBounds: { x: o2(t4), y: s2(e2), w: o2(t4 + r), h: s2(e2 + n2) }, options: i2, type: "link" });
  }, t3.textWithLink = function(t4, e2, r, n2) {
    var i2, a2, o2 = this.getTextWidth(t4), s2 = this.internal.getLineHeight() / this.internal.scaleFactor;
    if (void 0 !== n2.maxWidth) {
      a2 = n2.maxWidth;
      var c2 = this.splitTextToSize(t4, a2).length;
      i2 = Math.ceil(s2 * c2);
    } else a2 = o2, i2 = s2;
    return this.text(t4, e2, r, n2), r += 0.2 * s2, "center" === n2.align && (e2 -= o2 / 2), "right" === n2.align && (e2 -= o2), this.link(e2, r - s2, a2, i2, n2), o2;
  }, t3.getTextWidth = function(t4) {
    var e2 = this.internal.getFontSize();
    return this.getStringUnitWidth(t4) * e2 / this.internal.scaleFactor;
  };
}(E.API), /**
 * @license
 * Copyright (c) 2017 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = { 1569: [65152], 1570: [65153, 65154], 1571: [65155, 65156], 1572: [65157, 65158], 1573: [65159, 65160], 1574: [65161, 65162, 65163, 65164], 1575: [65165, 65166], 1576: [65167, 65168, 65169, 65170], 1577: [65171, 65172], 1578: [65173, 65174, 65175, 65176], 1579: [65177, 65178, 65179, 65180], 1580: [65181, 65182, 65183, 65184], 1581: [65185, 65186, 65187, 65188], 1582: [65189, 65190, 65191, 65192], 1583: [65193, 65194], 1584: [65195, 65196], 1585: [65197, 65198], 1586: [65199, 65200], 1587: [65201, 65202, 65203, 65204], 1588: [65205, 65206, 65207, 65208], 1589: [65209, 65210, 65211, 65212], 1590: [65213, 65214, 65215, 65216], 1591: [65217, 65218, 65219, 65220], 1592: [65221, 65222, 65223, 65224], 1593: [65225, 65226, 65227, 65228], 1594: [65229, 65230, 65231, 65232], 1601: [65233, 65234, 65235, 65236], 1602: [65237, 65238, 65239, 65240], 1603: [65241, 65242, 65243, 65244], 1604: [65245, 65246, 65247, 65248], 1605: [65249, 65250, 65251, 65252], 1606: [65253, 65254, 65255, 65256], 1607: [65257, 65258, 65259, 65260], 1608: [65261, 65262], 1609: [65263, 65264, 64488, 64489], 1610: [65265, 65266, 65267, 65268], 1649: [64336, 64337], 1655: [64477], 1657: [64358, 64359, 64360, 64361], 1658: [64350, 64351, 64352, 64353], 1659: [64338, 64339, 64340, 64341], 1662: [64342, 64343, 64344, 64345], 1663: [64354, 64355, 64356, 64357], 1664: [64346, 64347, 64348, 64349], 1667: [64374, 64375, 64376, 64377], 1668: [64370, 64371, 64372, 64373], 1670: [64378, 64379, 64380, 64381], 1671: [64382, 64383, 64384, 64385], 1672: [64392, 64393], 1676: [64388, 64389], 1677: [64386, 64387], 1678: [64390, 64391], 1681: [64396, 64397], 1688: [64394, 64395], 1700: [64362, 64363, 64364, 64365], 1702: [64366, 64367, 64368, 64369], 1705: [64398, 64399, 64400, 64401], 1709: [64467, 64468, 64469, 64470], 1711: [64402, 64403, 64404, 64405], 1713: [64410, 64411, 64412, 64413], 1715: [64406, 64407, 64408, 64409], 1722: [64414, 64415], 1723: [64416, 64417, 64418, 64419], 1726: [64426, 64427, 64428, 64429], 1728: [64420, 64421], 1729: [64422, 64423, 64424, 64425], 1733: [64480, 64481], 1734: [64473, 64474], 1735: [64471, 64472], 1736: [64475, 64476], 1737: [64482, 64483], 1739: [64478, 64479], 1740: [64508, 64509, 64510, 64511], 1744: [64484, 64485, 64486, 64487], 1746: [64430, 64431], 1747: [64432, 64433] }, r = { 65247: { 65154: 65269, 65156: 65271, 65160: 65273, 65166: 65275 }, 65248: { 65154: 65270, 65156: 65272, 65160: 65274, 65166: 65276 }, 65165: { 65247: { 65248: { 65258: 65010 } } }, 1617: { 1612: 64606, 1613: 64607, 1614: 64608, 1615: 64609, 1616: 64610 } }, n2 = { 1612: 64606, 1613: 64607, 1614: 64608, 1615: 64609, 1616: 64610 }, i2 = [1570, 1571, 1573, 1575];
  t3.__arabicParser__ = {};
  var a2 = t3.__arabicParser__.isInArabicSubstitutionA = function(t4) {
    return void 0 !== e[t4.charCodeAt(0)];
  }, o2 = t3.__arabicParser__.isArabicLetter = function(t4) {
    return "string" == typeof t4 && /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/.test(t4);
  }, s2 = t3.__arabicParser__.isArabicEndLetter = function(t4) {
    return o2(t4) && a2(t4) && e[t4.charCodeAt(0)].length <= 2;
  }, c2 = t3.__arabicParser__.isArabicAlfLetter = function(t4) {
    return o2(t4) && i2.indexOf(t4.charCodeAt(0)) >= 0;
  };
  t3.__arabicParser__.arabicLetterHasIsolatedForm = function(t4) {
    return o2(t4) && a2(t4) && e[t4.charCodeAt(0)].length >= 1;
  };
  var u2 = t3.__arabicParser__.arabicLetterHasFinalForm = function(t4) {
    return o2(t4) && a2(t4) && e[t4.charCodeAt(0)].length >= 2;
  };
  t3.__arabicParser__.arabicLetterHasInitialForm = function(t4) {
    return o2(t4) && a2(t4) && e[t4.charCodeAt(0)].length >= 3;
  };
  var h2 = t3.__arabicParser__.arabicLetterHasMedialForm = function(t4) {
    return o2(t4) && a2(t4) && 4 == e[t4.charCodeAt(0)].length;
  }, l2 = t3.__arabicParser__.resolveLigatures = function(t4) {
    var e2 = 0, n3 = r, i3 = "", a3 = 0;
    for (e2 = 0; e2 < t4.length; e2 += 1) void 0 !== n3[t4.charCodeAt(e2)] ? (a3++, "number" == typeof (n3 = n3[t4.charCodeAt(e2)]) && (i3 += String.fromCharCode(n3), n3 = r, a3 = 0), e2 === t4.length - 1 && (n3 = r, i3 += t4.charAt(e2 - (a3 - 1)), e2 -= a3 - 1, a3 = 0)) : (n3 = r, i3 += t4.charAt(e2 - a3), e2 -= a3, a3 = 0);
    return i3;
  };
  t3.__arabicParser__.isArabicDiacritic = function(t4) {
    return void 0 !== t4 && void 0 !== n2[t4.charCodeAt(0)];
  };
  var f2 = t3.__arabicParser__.getCorrectForm = function(t4, e2, r2) {
    return o2(t4) ? false === a2(t4) ? -1 : !u2(t4) || !o2(e2) && !o2(r2) || !o2(r2) && s2(e2) || s2(t4) && !o2(e2) || s2(t4) && c2(e2) || s2(t4) && s2(e2) ? 0 : h2(t4) && o2(e2) && !s2(e2) && o2(r2) && u2(r2) ? 3 : s2(t4) || !o2(r2) ? 1 : 2 : -1;
  }, d2 = function(t4) {
    var r2 = 0, n3 = 0, i3 = 0, a3 = "", s3 = "", c3 = "", u3 = (t4 = t4 || "").split("\\s+"), h3 = [];
    for (r2 = 0; r2 < u3.length; r2 += 1) {
      for (h3.push(""), n3 = 0; n3 < u3[r2].length; n3 += 1) a3 = u3[r2][n3], s3 = u3[r2][n3 - 1], c3 = u3[r2][n3 + 1], o2(a3) ? (i3 = f2(a3, s3, c3), h3[r2] += -1 !== i3 ? String.fromCharCode(e[a3.charCodeAt(0)][i3]) : a3) : h3[r2] += a3;
      h3[r2] = l2(h3[r2]);
    }
    return h3.join(" ");
  }, p2 = t3.__arabicParser__.processArabic = t3.processArabic = function() {
    var t4, e2 = "string" == typeof arguments[0] ? arguments[0] : arguments[0].text, r2 = [];
    if (Array.isArray(e2)) {
      var n3 = 0;
      for (r2 = [], n3 = 0; n3 < e2.length; n3 += 1) Array.isArray(e2[n3]) ? r2.push([d2(e2[n3][0]), e2[n3][1], e2[n3][2]]) : r2.push([d2(e2[n3])]);
      t4 = r2;
    } else t4 = d2(e2);
    return "string" == typeof arguments[0] ? t4 : (arguments[0].text = t4, arguments[0]);
  };
  t3.events.push(["preProcessText", p2]);
}(E.API), E.API.autoPrint = function(t3) {
  var e;
  switch ((t3 = t3 || {}).variant = t3.variant || "non-conform", t3.variant) {
    case "javascript":
      this.addJS("print({});");
      break;
    case "non-conform":
    default:
      this.internal.events.subscribe("postPutResources", function() {
        e = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/S /Named"), this.internal.out("/Type /Action"), this.internal.out("/N /Print"), this.internal.out(">>"), this.internal.out("endobj");
      }), this.internal.events.subscribe("putCatalog", function() {
        this.internal.out("/OpenAction " + e + " 0 R");
      });
  }
  return this;
}, /**
 * @license
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = function() {
    var t4 = void 0;
    Object.defineProperty(this, "pdf", { get: function() {
      return t4;
    }, set: function(e3) {
      t4 = e3;
    } });
    var e2 = 150;
    Object.defineProperty(this, "width", { get: function() {
      return e2;
    }, set: function(t5) {
      e2 = isNaN(t5) || false === Number.isInteger(t5) || t5 < 0 ? 150 : t5, this.getContext("2d").pageWrapXEnabled && (this.getContext("2d").pageWrapX = e2 + 1);
    } });
    var r = 300;
    Object.defineProperty(this, "height", { get: function() {
      return r;
    }, set: function(t5) {
      r = isNaN(t5) || false === Number.isInteger(t5) || t5 < 0 ? 300 : t5, this.getContext("2d").pageWrapYEnabled && (this.getContext("2d").pageWrapY = r + 1);
    } });
    var n2 = [];
    Object.defineProperty(this, "childNodes", { get: function() {
      return n2;
    }, set: function(t5) {
      n2 = t5;
    } });
    var i2 = {};
    Object.defineProperty(this, "style", { get: function() {
      return i2;
    }, set: function(t5) {
      i2 = t5;
    } }), Object.defineProperty(this, "parentNode", {});
  };
  e.prototype.getContext = function(t4, e2) {
    var r;
    if ("2d" !== (t4 = t4 || "2d")) return null;
    for (r in e2) this.pdf.context2d.hasOwnProperty(r) && (this.pdf.context2d[r] = e2[r]);
    return this.pdf.context2d._canvas = this, this.pdf.context2d;
  }, e.prototype.toDataURL = function() {
    throw new Error("toDataURL is not implemented.");
  }, t3.events.push(["initialized", function() {
    this.canvas = new e(), this.canvas.pdf = this;
  }]);
}(E.API), function(e) {
  var r = { left: 0, top: 0, bottom: 0, right: 0 }, n2 = false, i2 = function() {
    void 0 === this.internal.__cell__ && (this.internal.__cell__ = {}, this.internal.__cell__.padding = 3, this.internal.__cell__.headerFunction = void 0, this.internal.__cell__.margins = Object.assign({}, r), this.internal.__cell__.margins.width = this.getPageWidth(), a2.call(this));
  }, a2 = function() {
    this.internal.__cell__.lastCell = new o2(), this.internal.__cell__.pages = 1;
  }, o2 = function() {
    var t3 = arguments[0];
    Object.defineProperty(this, "x", { enumerable: true, get: function() {
      return t3;
    }, set: function(e3) {
      t3 = e3;
    } });
    var e2 = arguments[1];
    Object.defineProperty(this, "y", { enumerable: true, get: function() {
      return e2;
    }, set: function(t4) {
      e2 = t4;
    } });
    var r2 = arguments[2];
    Object.defineProperty(this, "width", { enumerable: true, get: function() {
      return r2;
    }, set: function(t4) {
      r2 = t4;
    } });
    var n3 = arguments[3];
    Object.defineProperty(this, "height", { enumerable: true, get: function() {
      return n3;
    }, set: function(t4) {
      n3 = t4;
    } });
    var i3 = arguments[4];
    Object.defineProperty(this, "text", { enumerable: true, get: function() {
      return i3;
    }, set: function(t4) {
      i3 = t4;
    } });
    var a3 = arguments[5];
    Object.defineProperty(this, "lineNumber", { enumerable: true, get: function() {
      return a3;
    }, set: function(t4) {
      a3 = t4;
    } });
    var o3 = arguments[6];
    return Object.defineProperty(this, "align", { enumerable: true, get: function() {
      return o3;
    }, set: function(t4) {
      o3 = t4;
    } }), this;
  };
  o2.prototype.clone = function() {
    return new o2(this.x, this.y, this.width, this.height, this.text, this.lineNumber, this.align);
  }, o2.prototype.toArray = function() {
    return [this.x, this.y, this.width, this.height, this.text, this.lineNumber, this.align];
  }, e.setHeaderFunction = function(t3) {
    return i2.call(this), this.internal.__cell__.headerFunction = "function" == typeof t3 ? t3 : void 0, this;
  }, e.getTextDimensions = function(t3, e2) {
    i2.call(this);
    var r2 = (e2 = e2 || {}).fontSize || this.getFontSize(), n3 = e2.font || this.getFont(), a3 = e2.scaleFactor || this.internal.scaleFactor, o3 = 0, s3 = 0, c3 = 0, u2 = this;
    if (!Array.isArray(t3) && "string" != typeof t3) {
      if ("number" != typeof t3) throw new Error("getTextDimensions expects text-parameter to be of type String or type Number or an Array of Strings.");
      t3 = String(t3);
    }
    var h2 = e2.maxWidth;
    h2 > 0 ? "string" == typeof t3 ? t3 = this.splitTextToSize(t3, h2) : "[object Array]" === Object.prototype.toString.call(t3) && (t3 = t3.reduce(function(t4, e3) {
      return t4.concat(u2.splitTextToSize(e3, h2));
    }, [])) : t3 = Array.isArray(t3) ? t3 : [t3];
    for (var l2 = 0; l2 < t3.length; l2++) o3 < (c3 = this.getStringUnitWidth(t3[l2], { font: n3 }) * r2) && (o3 = c3);
    return 0 !== o3 && (s3 = t3.length), { w: o3 /= a3, h: Math.max((s3 * r2 * this.getLineHeightFactor() - r2 * (this.getLineHeightFactor() - 1)) / a3, 0) };
  }, e.cellAddPage = function() {
    i2.call(this), this.addPage();
    var t3 = this.internal.__cell__.margins || r;
    return this.internal.__cell__.lastCell = new o2(t3.left, t3.top, void 0, void 0), this.internal.__cell__.pages += 1, this;
  };
  var s2 = e.cell = function() {
    var t3;
    t3 = arguments[0] instanceof o2 ? arguments[0] : new o2(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]), i2.call(this);
    var e2 = this.internal.__cell__.lastCell, a3 = this.internal.__cell__.padding, s3 = this.internal.__cell__.margins || r, c3 = this.internal.__cell__.tableHeaderRow, u2 = this.internal.__cell__.printHeaders;
    return void 0 !== e2.lineNumber && (e2.lineNumber === t3.lineNumber ? (t3.x = (e2.x || 0) + (e2.width || 0), t3.y = e2.y || 0) : e2.y + e2.height + t3.height + s3.bottom > this.getPageHeight() ? (this.cellAddPage(), t3.y = s3.top, u2 && c3 && (this.printHeaderRow(t3.lineNumber, true), t3.y += c3[0].height)) : t3.y = e2.y + e2.height || t3.y), void 0 !== t3.text[0] && (this.rect(t3.x, t3.y, t3.width, t3.height, true === n2 ? "FD" : void 0), "right" === t3.align ? this.text(t3.text, t3.x + t3.width - a3, t3.y + a3, { align: "right", baseline: "top" }) : "center" === t3.align ? this.text(t3.text, t3.x + t3.width / 2, t3.y + a3, { align: "center", baseline: "top", maxWidth: t3.width - a3 - a3 }) : this.text(t3.text, t3.x + a3, t3.y + a3, { align: "left", baseline: "top", maxWidth: t3.width - a3 - a3 })), this.internal.__cell__.lastCell = t3, this;
  };
  e.table = function(e2, n3, u2, h2, l2) {
    if (i2.call(this), !u2) throw new Error("No data for PDF table.");
    var f2, d2, p2, g2, m2 = [], v2 = [], b2 = [], y2 = {}, w2 = {}, N2 = [], L2 = [], A2 = (l2 = l2 || {}).autoSize || false, x2 = false !== l2.printHeaders, S2 = l2.css && void 0 !== l2.css["font-size"] ? 16 * l2.css["font-size"] : l2.fontSize || 12, _2 = l2.margins || Object.assign({ width: this.getPageWidth() }, r), P2 = "number" == typeof l2.padding ? l2.padding : 3, k2 = l2.headerBackgroundColor || "#c8c8c8", I2 = l2.headerTextColor || "#000";
    if (a2.call(this), this.internal.__cell__.printHeaders = x2, this.internal.__cell__.margins = _2, this.internal.__cell__.table_font_size = S2, this.internal.__cell__.padding = P2, this.internal.__cell__.headerBackgroundColor = k2, this.internal.__cell__.headerTextColor = I2, this.setFontSize(S2), null == h2) v2 = m2 = Object.keys(u2[0]), b2 = m2.map(function() {
      return "left";
    });
    else if (Array.isArray(h2) && "object" === t(h2[0])) for (m2 = h2.map(function(t3) {
      return t3.name;
    }), v2 = h2.map(function(t3) {
      return t3.prompt || t3.name || "";
    }), b2 = h2.map(function(t3) {
      return t3.align || "left";
    }), f2 = 0; f2 < h2.length; f2 += 1) w2[h2[f2].name] = h2[f2].width * (19.049976 / 25.4);
    else Array.isArray(h2) && "string" == typeof h2[0] && (v2 = m2 = h2, b2 = m2.map(function() {
      return "left";
    }));
    if (A2 || Array.isArray(h2) && "string" == typeof h2[0]) for (f2 = 0; f2 < m2.length; f2 += 1) {
      for (y2[g2 = m2[f2]] = u2.map(function(t3) {
        return t3[g2];
      }), this.setFont(void 0, "bold"), N2.push(this.getTextDimensions(v2[f2], { fontSize: this.internal.__cell__.table_font_size, scaleFactor: this.internal.scaleFactor }).w), d2 = y2[g2], this.setFont(void 0, "normal"), p2 = 0; p2 < d2.length; p2 += 1) N2.push(this.getTextDimensions(d2[p2], { fontSize: this.internal.__cell__.table_font_size, scaleFactor: this.internal.scaleFactor }).w);
      w2[g2] = Math.max.apply(null, N2) + P2 + P2, N2 = [];
    }
    if (x2) {
      var F2 = {};
      for (f2 = 0; f2 < m2.length; f2 += 1) F2[m2[f2]] = {}, F2[m2[f2]].text = v2[f2], F2[m2[f2]].align = b2[f2];
      var C2 = c2.call(this, F2, w2);
      L2 = m2.map(function(t3) {
        return new o2(e2, n3, w2[t3], C2, F2[t3].text, void 0, F2[t3].align);
      }), this.setTableHeaderRow(L2), this.printHeaderRow(1, false);
    }
    var j2 = h2.reduce(function(t3, e3) {
      return t3[e3.name] = e3.align, t3;
    }, {});
    for (f2 = 0; f2 < u2.length; f2 += 1) {
      "rowStart" in l2 && l2.rowStart instanceof Function && l2.rowStart({ row: f2, data: u2[f2] }, this);
      var O2 = c2.call(this, u2[f2], w2);
      for (p2 = 0; p2 < m2.length; p2 += 1) {
        var B2 = u2[f2][m2[p2]];
        "cellStart" in l2 && l2.cellStart instanceof Function && l2.cellStart({ row: f2, col: p2, data: B2 }, this), s2.call(this, new o2(e2, n3, w2[m2[p2]], O2, B2, f2 + 2, j2[m2[p2]]));
      }
    }
    return this.internal.__cell__.table_x = e2, this.internal.__cell__.table_y = n3, this;
  };
  var c2 = function(t3, e2) {
    var r2 = this.internal.__cell__.padding, n3 = this.internal.__cell__.table_font_size, i3 = this.internal.scaleFactor;
    return Object.keys(t3).map(function(n4) {
      var i4 = t3[n4];
      return this.splitTextToSize(i4.hasOwnProperty("text") ? i4.text : i4, e2[n4] - r2 - r2);
    }, this).map(function(t4) {
      return this.getLineHeightFactor() * t4.length * n3 / i3 + r2 + r2;
    }, this).reduce(function(t4, e3) {
      return Math.max(t4, e3);
    }, 0);
  };
  e.setTableHeaderRow = function(t3) {
    i2.call(this), this.internal.__cell__.tableHeaderRow = t3;
  }, e.printHeaderRow = function(t3, e2) {
    if (i2.call(this), !this.internal.__cell__.tableHeaderRow) throw new Error("Property tableHeaderRow does not exist.");
    var r2;
    if (n2 = true, "function" == typeof this.internal.__cell__.headerFunction) {
      var a3 = this.internal.__cell__.headerFunction(this, this.internal.__cell__.pages);
      this.internal.__cell__.lastCell = new o2(a3[0], a3[1], a3[2], a3[3], void 0, -1);
    }
    this.setFont(void 0, "bold");
    for (var c3 = [], u2 = 0; u2 < this.internal.__cell__.tableHeaderRow.length; u2 += 1) {
      r2 = this.internal.__cell__.tableHeaderRow[u2].clone(), e2 && (r2.y = this.internal.__cell__.margins.top || 0, c3.push(r2)), r2.lineNumber = t3;
      var h2 = this.getTextColor();
      this.setTextColor(this.internal.__cell__.headerTextColor), this.setFillColor(this.internal.__cell__.headerBackgroundColor), s2.call(this, r2), this.setTextColor(h2);
    }
    c3.length > 0 && this.setTableHeaderRow(c3), this.setFont(void 0, "normal"), n2 = false;
  };
}(E.API);
var Pt = { italic: ["italic", "oblique", "normal"], oblique: ["oblique", "italic", "normal"], normal: ["normal", "oblique", "italic"] }, kt = ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded"], It = _t(kt), Ft = [100, 200, 300, 400, 500, 600, 700, 800, 900], Ct = _t(Ft);
function jt(t3) {
  var e = t3.family.replace(/"|'/g, "").toLowerCase(), r = function(t4) {
    return Pt[t4 = t4 || "normal"] ? t4 : "normal";
  }(t3.style), n2 = function(t4) {
    if (!t4) return 400;
    if ("number" == typeof t4) return t4 >= 100 && t4 <= 900 && t4 % 100 == 0 ? t4 : 400;
    if (/^\d00$/.test(t4)) return parseInt(t4);
    switch (t4) {
      case "bold":
        return 700;
      case "normal":
      default:
        return 400;
    }
  }(t3.weight), i2 = function(t4) {
    return "number" == typeof It[t4 = t4 || "normal"] ? t4 : "normal";
  }(t3.stretch);
  return { family: e, style: r, weight: n2, stretch: i2, src: t3.src || [], ref: t3.ref || { name: e, style: [i2, r, n2].join(" ") } };
}
function Ot(t3, e, r, n2) {
  var i2;
  for (i2 = r; i2 >= 0 && i2 < e.length; i2 += n2) if (t3[e[i2]]) return t3[e[i2]];
  for (i2 = r; i2 >= 0 && i2 < e.length; i2 -= n2) if (t3[e[i2]]) return t3[e[i2]];
}
var Bt = { "sans-serif": "helvetica", fixed: "courier", monospace: "courier", terminal: "courier", cursive: "times", fantasy: "times", serif: "times" }, Mt = { caption: "times", icon: "times", menu: "times", "message-box": "times", "small-caption": "times", "status-bar": "times" };
function Et(t3) {
  return [t3.stretch, t3.style, t3.weight, t3.family].join(" ");
}
function qt(t3, e, r) {
  for (var n2 = (r = r || {}).defaultFontFamily || "times", i2 = Object.assign({}, Bt, r.genericFontFamilies || {}), a2 = null, o2 = null, s2 = 0; s2 < e.length; ++s2) if (i2[(a2 = jt(e[s2])).family] && (a2.family = i2[a2.family]), t3.hasOwnProperty(a2.family)) {
    o2 = t3[a2.family];
    break;
  }
  if (!(o2 = o2 || t3[n2])) throw new Error("Could not find a font-family for the rule '" + Et(a2) + "' and default family '" + n2 + "'.");
  if (o2 = function(t4, e2) {
    if (e2[t4]) return e2[t4];
    var r2 = It[t4], n3 = r2 <= It.normal ? -1 : 1, i3 = Ot(e2, kt, r2, n3);
    if (!i3) throw new Error("Could not find a matching font-stretch value for " + t4);
    return i3;
  }(a2.stretch, o2), o2 = function(t4, e2) {
    if (e2[t4]) return e2[t4];
    for (var r2 = Pt[t4], n3 = 0; n3 < r2.length; ++n3) if (e2[r2[n3]]) return e2[r2[n3]];
    throw new Error("Could not find a matching font-style for " + t4);
  }(a2.style, o2), !(o2 = function(t4, e2) {
    if (e2[t4]) return e2[t4];
    if (400 === t4 && e2[500]) return e2[500];
    if (500 === t4 && e2[400]) return e2[400];
    var r2 = Ct[t4], n3 = Ot(e2, Ft, r2, t4 < 400 ? -1 : 1);
    if (!n3) throw new Error("Could not find a matching font-weight for value " + t4);
    return n3;
  }(a2.weight, o2))) throw new Error("Failed to resolve a font for the rule '" + Et(a2) + "'.");
  return o2;
}
function Dt(t3) {
  return t3.trimLeft();
}
function Rt(t3, e) {
  for (var r = 0; r < t3.length; ) {
    if (t3.charAt(r) === e) return [t3.substring(0, r), t3.substring(r + 1)];
    r += 1;
  }
  return null;
}
function Tt(t3) {
  var e = t3.match(/^(-[a-z_]|[a-z_])[a-z0-9_-]*/i);
  return null === e ? null : [e[0], t3.substring(e[0].length)];
}
var Ut, zt, Ht, Wt = ["times"];
!function(e) {
  var r, n2, i2, o2, s2, c2, u2, h2, l2, d2 = function(t3) {
    return t3 = t3 || {}, this.isStrokeTransparent = t3.isStrokeTransparent || false, this.strokeOpacity = t3.strokeOpacity || 1, this.strokeStyle = t3.strokeStyle || "#000000", this.fillStyle = t3.fillStyle || "#000000", this.isFillTransparent = t3.isFillTransparent || false, this.fillOpacity = t3.fillOpacity || 1, this.font = t3.font || "10px sans-serif", this.textBaseline = t3.textBaseline || "alphabetic", this.textAlign = t3.textAlign || "left", this.lineWidth = t3.lineWidth || 1, this.lineJoin = t3.lineJoin || "miter", this.lineCap = t3.lineCap || "butt", this.path = t3.path || [], this.transform = void 0 !== t3.transform ? t3.transform.clone() : new h2(), this.globalCompositeOperation = t3.globalCompositeOperation || "normal", this.globalAlpha = t3.globalAlpha || 1, this.clip_path = t3.clip_path || [], this.currentPoint = t3.currentPoint || new c2(), this.miterLimit = t3.miterLimit || 10, this.lastPoint = t3.lastPoint || new c2(), this.lineDashOffset = t3.lineDashOffset || 0, this.lineDash = t3.lineDash || [], this.margin = t3.margin || [0, 0, 0, 0], this.prevPageLastElemOffset = t3.prevPageLastElemOffset || 0, this.ignoreClearRect = "boolean" != typeof t3.ignoreClearRect || t3.ignoreClearRect, this;
  };
  e.events.push(["initialized", function() {
    this.context2d = new p2(this), r = this.internal.f2, n2 = this.internal.getCoordinateString, i2 = this.internal.getVerticalCoordinateString, o2 = this.internal.getHorizontalCoordinate, s2 = this.internal.getVerticalCoordinate, c2 = this.internal.Point, u2 = this.internal.Rectangle, h2 = this.internal.Matrix, l2 = new d2();
  }]);
  var p2 = function(t3) {
    Object.defineProperty(this, "canvas", { get: function() {
      return { parentNode: false, style: false };
    } });
    var e2 = t3;
    Object.defineProperty(this, "pdf", { get: function() {
      return e2;
    } });
    var r2 = false;
    Object.defineProperty(this, "pageWrapXEnabled", { get: function() {
      return r2;
    }, set: function(t4) {
      r2 = Boolean(t4);
    } });
    var n3 = false;
    Object.defineProperty(this, "pageWrapYEnabled", { get: function() {
      return n3;
    }, set: function(t4) {
      n3 = Boolean(t4);
    } });
    var i3 = 0;
    Object.defineProperty(this, "posX", { get: function() {
      return i3;
    }, set: function(t4) {
      isNaN(t4) || (i3 = t4);
    } });
    var a2 = 0;
    Object.defineProperty(this, "posY", { get: function() {
      return a2;
    }, set: function(t4) {
      isNaN(t4) || (a2 = t4);
    } }), Object.defineProperty(this, "margin", { get: function() {
      return l2.margin;
    }, set: function(t4) {
      var e3;
      "number" == typeof t4 ? e3 = [t4, t4, t4, t4] : ((e3 = new Array(4))[0] = t4[0], e3[1] = t4.length >= 2 ? t4[1] : e3[0], e3[2] = t4.length >= 3 ? t4[2] : e3[0], e3[3] = t4.length >= 4 ? t4[3] : e3[1]), l2.margin = e3;
    } });
    var o3 = false;
    Object.defineProperty(this, "autoPaging", { get: function() {
      return o3;
    }, set: function(t4) {
      o3 = t4;
    } });
    var s3 = 0;
    Object.defineProperty(this, "lastBreak", { get: function() {
      return s3;
    }, set: function(t4) {
      s3 = t4;
    } });
    var c3 = [];
    Object.defineProperty(this, "pageBreaks", { get: function() {
      return c3;
    }, set: function(t4) {
      c3 = t4;
    } }), Object.defineProperty(this, "ctx", { get: function() {
      return l2;
    }, set: function(t4) {
      t4 instanceof d2 && (l2 = t4);
    } }), Object.defineProperty(this, "path", { get: function() {
      return l2.path;
    }, set: function(t4) {
      l2.path = t4;
    } });
    var u3 = [];
    Object.defineProperty(this, "ctxStack", { get: function() {
      return u3;
    }, set: function(t4) {
      u3 = t4;
    } }), Object.defineProperty(this, "fillStyle", { get: function() {
      return this.ctx.fillStyle;
    }, set: function(t4) {
      var e3;
      e3 = g2(t4), this.ctx.fillStyle = e3.style, this.ctx.isFillTransparent = 0 === e3.a, this.ctx.fillOpacity = e3.a, this.pdf.setFillColor(e3.r, e3.g, e3.b, { a: e3.a }), this.pdf.setTextColor(e3.r, e3.g, e3.b, { a: e3.a });
    } }), Object.defineProperty(this, "strokeStyle", { get: function() {
      return this.ctx.strokeStyle;
    }, set: function(t4) {
      var e3 = g2(t4);
      this.ctx.strokeStyle = e3.style, this.ctx.isStrokeTransparent = 0 === e3.a, this.ctx.strokeOpacity = e3.a, 0 === e3.a ? this.pdf.setDrawColor(255, 255, 255) : (e3.a, this.pdf.setDrawColor(e3.r, e3.g, e3.b));
    } }), Object.defineProperty(this, "lineCap", { get: function() {
      return this.ctx.lineCap;
    }, set: function(t4) {
      -1 !== ["butt", "round", "square"].indexOf(t4) && (this.ctx.lineCap = t4, this.pdf.setLineCap(t4));
    } }), Object.defineProperty(this, "lineWidth", { get: function() {
      return this.ctx.lineWidth;
    }, set: function(t4) {
      isNaN(t4) || (this.ctx.lineWidth = t4, this.pdf.setLineWidth(t4));
    } }), Object.defineProperty(this, "lineJoin", { get: function() {
      return this.ctx.lineJoin;
    }, set: function(t4) {
      -1 !== ["bevel", "round", "miter"].indexOf(t4) && (this.ctx.lineJoin = t4, this.pdf.setLineJoin(t4));
    } }), Object.defineProperty(this, "miterLimit", { get: function() {
      return this.ctx.miterLimit;
    }, set: function(t4) {
      isNaN(t4) || (this.ctx.miterLimit = t4, this.pdf.setMiterLimit(t4));
    } }), Object.defineProperty(this, "textBaseline", { get: function() {
      return this.ctx.textBaseline;
    }, set: function(t4) {
      this.ctx.textBaseline = t4;
    } }), Object.defineProperty(this, "textAlign", { get: function() {
      return this.ctx.textAlign;
    }, set: function(t4) {
      -1 !== ["right", "end", "center", "left", "start"].indexOf(t4) && (this.ctx.textAlign = t4);
    } });
    var h3 = null;
    function f2(t4, e3) {
      if (null === h3) {
        var r3 = function(t5) {
          var e4 = [];
          return Object.keys(t5).forEach(function(r4) {
            t5[r4].forEach(function(t6) {
              var n4 = null;
              switch (t6) {
                case "bold":
                  n4 = { family: r4, weight: "bold" };
                  break;
                case "italic":
                  n4 = { family: r4, style: "italic" };
                  break;
                case "bolditalic":
                  n4 = { family: r4, weight: "bold", style: "italic" };
                  break;
                case "":
                case "normal":
                  n4 = { family: r4 };
              }
              null !== n4 && (n4.ref = { name: r4, style: t6 }, e4.push(n4));
            });
          }), e4;
        }(t4.getFontList());
        h3 = function(t5) {
          for (var e4 = {}, r4 = 0; r4 < t5.length; ++r4) {
            var n4 = jt(t5[r4]), i4 = n4.family, a3 = n4.stretch, o4 = n4.style, s4 = n4.weight;
            e4[i4] = e4[i4] || {}, e4[i4][a3] = e4[i4][a3] || {}, e4[i4][a3][o4] = e4[i4][a3][o4] || {}, e4[i4][a3][o4][s4] = n4;
          }
          return e4;
        }(r3.concat(e3));
      }
      return h3;
    }
    var p3 = null;
    Object.defineProperty(this, "fontFaces", { get: function() {
      return p3;
    }, set: function(t4) {
      h3 = null, p3 = t4;
    } }), Object.defineProperty(this, "font", { get: function() {
      return this.ctx.font;
    }, set: function(t4) {
      var e3;
      if (this.ctx.font = t4, null !== (e3 = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-_,\"\'\sa-z]+?)\s*$/i.exec(t4))) {
        var r3 = e3[1], n4 = (e3[2], e3[3]), i4 = e3[4], a3 = (e3[5], e3[6]), o4 = /^([.\d]+)((?:%|in|[cem]m|ex|p[ctx]))$/i.exec(i4)[2];
        i4 = "px" === o4 ? Math.floor(parseFloat(i4) * this.pdf.internal.scaleFactor) : "em" === o4 ? Math.floor(parseFloat(i4) * this.pdf.getFontSize()) : Math.floor(parseFloat(i4) * this.pdf.internal.scaleFactor), this.pdf.setFontSize(i4);
        var s4 = function(t5) {
          var e4, r4, n5 = [], i5 = t5.trim();
          if ("" === i5) return Wt;
          if (i5 in Mt) return [Mt[i5]];
          for (; "" !== i5; ) {
            switch (r4 = null, e4 = (i5 = Dt(i5)).charAt(0)) {
              case '"':
              case "'":
                r4 = Rt(i5.substring(1), e4);
                break;
              default:
                r4 = Tt(i5);
            }
            if (null === r4) return Wt;
            if (n5.push(r4[0]), "" !== (i5 = Dt(r4[1])) && "," !== i5.charAt(0)) return Wt;
            i5 = i5.replace(/^,/, "");
          }
          return n5;
        }(a3);
        if (this.fontFaces) {
          var c4 = qt(f2(this.pdf, this.fontFaces), s4.map(function(t5) {
            return { family: t5, stretch: "normal", weight: n4, style: r3 };
          }));
          this.pdf.setFont(c4.ref.name, c4.ref.style);
        } else {
          var u4 = "";
          ("bold" === n4 || parseInt(n4, 10) >= 700 || "bold" === r3) && (u4 = "bold"), "italic" === r3 && (u4 += "italic"), 0 === u4.length && (u4 = "normal");
          for (var h4 = "", l3 = { arial: "Helvetica", Arial: "Helvetica", verdana: "Helvetica", Verdana: "Helvetica", helvetica: "Helvetica", Helvetica: "Helvetica", "sans-serif": "Helvetica", fixed: "Courier", monospace: "Courier", terminal: "Courier", cursive: "Times", fantasy: "Times", serif: "Times" }, d3 = 0; d3 < s4.length; d3++) {
            if (void 0 !== this.pdf.internal.getFont(s4[d3], u4, { noFallback: true, disableWarning: true })) {
              h4 = s4[d3];
              break;
            }
            if ("bolditalic" === u4 && void 0 !== this.pdf.internal.getFont(s4[d3], "bold", { noFallback: true, disableWarning: true })) h4 = s4[d3], u4 = "bold";
            else if (void 0 !== this.pdf.internal.getFont(s4[d3], "normal", { noFallback: true, disableWarning: true })) {
              h4 = s4[d3], u4 = "normal";
              break;
            }
          }
          if ("" === h4) {
            for (var p4 = 0; p4 < s4.length; p4++) if (l3[s4[p4]]) {
              h4 = l3[s4[p4]];
              break;
            }
          }
          h4 = "" === h4 ? "Times" : h4, this.pdf.setFont(h4, u4);
        }
      }
    } }), Object.defineProperty(this, "globalCompositeOperation", { get: function() {
      return this.ctx.globalCompositeOperation;
    }, set: function(t4) {
      this.ctx.globalCompositeOperation = t4;
    } }), Object.defineProperty(this, "globalAlpha", { get: function() {
      return this.ctx.globalAlpha;
    }, set: function(t4) {
      this.ctx.globalAlpha = t4;
    } }), Object.defineProperty(this, "lineDashOffset", { get: function() {
      return this.ctx.lineDashOffset;
    }, set: function(t4) {
      this.ctx.lineDashOffset = t4, T2.call(this);
    } }), Object.defineProperty(this, "lineDash", { get: function() {
      return this.ctx.lineDash;
    }, set: function(t4) {
      this.ctx.lineDash = t4, T2.call(this);
    } }), Object.defineProperty(this, "ignoreClearRect", { get: function() {
      return this.ctx.ignoreClearRect;
    }, set: function(t4) {
      this.ctx.ignoreClearRect = Boolean(t4);
    } });
  };
  p2.prototype.setLineDash = function(t3) {
    this.lineDash = t3;
  }, p2.prototype.getLineDash = function() {
    return this.lineDash.length % 2 ? this.lineDash.concat(this.lineDash) : this.lineDash.slice();
  }, p2.prototype.fill = function() {
    A2.call(this, "fill", false);
  }, p2.prototype.stroke = function() {
    A2.call(this, "stroke", false);
  }, p2.prototype.beginPath = function() {
    this.path = [{ type: "begin" }];
  }, p2.prototype.moveTo = function(t3, e2) {
    if (isNaN(t3) || isNaN(e2)) throw a.error("jsPDF.context2d.moveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.moveTo");
    var r2 = this.ctx.transform.applyToPoint(new c2(t3, e2));
    this.path.push({ type: "mt", x: r2.x, y: r2.y }), this.ctx.lastPoint = new c2(t3, e2);
  }, p2.prototype.closePath = function() {
    var e2 = new c2(0, 0), r2 = 0;
    for (r2 = this.path.length - 1; -1 !== r2; r2--) if ("begin" === this.path[r2].type && "object" === t(this.path[r2 + 1]) && "number" == typeof this.path[r2 + 1].x) {
      e2 = new c2(this.path[r2 + 1].x, this.path[r2 + 1].y);
      break;
    }
    this.path.push({ type: "close" }), this.ctx.lastPoint = new c2(e2.x, e2.y);
  }, p2.prototype.lineTo = function(t3, e2) {
    if (isNaN(t3) || isNaN(e2)) throw a.error("jsPDF.context2d.lineTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.lineTo");
    var r2 = this.ctx.transform.applyToPoint(new c2(t3, e2));
    this.path.push({ type: "lt", x: r2.x, y: r2.y }), this.ctx.lastPoint = new c2(r2.x, r2.y);
  }, p2.prototype.clip = function() {
    this.ctx.clip_path = JSON.parse(JSON.stringify(this.path)), A2.call(this, null, true);
  }, p2.prototype.quadraticCurveTo = function(t3, e2, r2, n3) {
    if (isNaN(r2) || isNaN(n3) || isNaN(t3) || isNaN(e2)) throw a.error("jsPDF.context2d.quadraticCurveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.quadraticCurveTo");
    var i3 = this.ctx.transform.applyToPoint(new c2(r2, n3)), o3 = this.ctx.transform.applyToPoint(new c2(t3, e2));
    this.path.push({ type: "qct", x1: o3.x, y1: o3.y, x: i3.x, y: i3.y }), this.ctx.lastPoint = new c2(i3.x, i3.y);
  }, p2.prototype.bezierCurveTo = function(t3, e2, r2, n3, i3, o3) {
    if (isNaN(i3) || isNaN(o3) || isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3)) throw a.error("jsPDF.context2d.bezierCurveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.bezierCurveTo");
    var s3 = this.ctx.transform.applyToPoint(new c2(i3, o3)), u3 = this.ctx.transform.applyToPoint(new c2(t3, e2)), h3 = this.ctx.transform.applyToPoint(new c2(r2, n3));
    this.path.push({ type: "bct", x1: u3.x, y1: u3.y, x2: h3.x, y2: h3.y, x: s3.x, y: s3.y }), this.ctx.lastPoint = new c2(s3.x, s3.y);
  }, p2.prototype.arc = function(t3, e2, r2, n3, i3, o3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3) || isNaN(i3)) throw a.error("jsPDF.context2d.arc: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.arc");
    if (o3 = Boolean(o3), !this.ctx.transform.isIdentity) {
      var s3 = this.ctx.transform.applyToPoint(new c2(t3, e2));
      t3 = s3.x, e2 = s3.y;
      var u3 = this.ctx.transform.applyToPoint(new c2(0, r2)), h3 = this.ctx.transform.applyToPoint(new c2(0, 0));
      r2 = Math.sqrt(Math.pow(u3.x - h3.x, 2) + Math.pow(u3.y - h3.y, 2));
    }
    Math.abs(i3 - n3) >= 2 * Math.PI && (n3 = 0, i3 = 2 * Math.PI), this.path.push({ type: "arc", x: t3, y: e2, radius: r2, startAngle: n3, endAngle: i3, counterclockwise: o3 });
  }, p2.prototype.arcTo = function(t3, e2, r2, n3, i3) {
    throw new Error("arcTo not implemented.");
  }, p2.prototype.rect = function(t3, e2, r2, n3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3)) throw a.error("jsPDF.context2d.rect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.rect");
    this.moveTo(t3, e2), this.lineTo(t3 + r2, e2), this.lineTo(t3 + r2, e2 + n3), this.lineTo(t3, e2 + n3), this.lineTo(t3, e2), this.lineTo(t3 + r2, e2), this.lineTo(t3, e2);
  }, p2.prototype.fillRect = function(t3, e2, r2, n3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3)) throw a.error("jsPDF.context2d.fillRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.fillRect");
    if (!m2.call(this)) {
      var i3 = {};
      "butt" !== this.lineCap && (i3.lineCap = this.lineCap, this.lineCap = "butt"), "miter" !== this.lineJoin && (i3.lineJoin = this.lineJoin, this.lineJoin = "miter"), this.beginPath(), this.rect(t3, e2, r2, n3), this.fill(), i3.hasOwnProperty("lineCap") && (this.lineCap = i3.lineCap), i3.hasOwnProperty("lineJoin") && (this.lineJoin = i3.lineJoin);
    }
  }, p2.prototype.strokeRect = function(t3, e2, r2, n3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3)) throw a.error("jsPDF.context2d.strokeRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.strokeRect");
    v2.call(this) || (this.beginPath(), this.rect(t3, e2, r2, n3), this.stroke());
  }, p2.prototype.clearRect = function(t3, e2, r2, n3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3)) throw a.error("jsPDF.context2d.clearRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.clearRect");
    this.ignoreClearRect || (this.fillStyle = "#ffffff", this.fillRect(t3, e2, r2, n3));
  }, p2.prototype.save = function(t3) {
    t3 = "boolean" != typeof t3 || t3;
    for (var e2 = this.pdf.internal.getCurrentPageInfo().pageNumber, r2 = 0; r2 < this.pdf.internal.getNumberOfPages(); r2++) this.pdf.setPage(r2 + 1), this.pdf.internal.out("q");
    if (this.pdf.setPage(e2), t3) {
      this.ctx.fontSize = this.pdf.internal.getFontSize();
      var n3 = new d2(this.ctx);
      this.ctxStack.push(this.ctx), this.ctx = n3;
    }
  }, p2.prototype.restore = function(t3) {
    t3 = "boolean" != typeof t3 || t3;
    for (var e2 = this.pdf.internal.getCurrentPageInfo().pageNumber, r2 = 0; r2 < this.pdf.internal.getNumberOfPages(); r2++) this.pdf.setPage(r2 + 1), this.pdf.internal.out("Q");
    this.pdf.setPage(e2), t3 && 0 !== this.ctxStack.length && (this.ctx = this.ctxStack.pop(), this.fillStyle = this.ctx.fillStyle, this.strokeStyle = this.ctx.strokeStyle, this.font = this.ctx.font, this.lineCap = this.ctx.lineCap, this.lineWidth = this.ctx.lineWidth, this.lineJoin = this.ctx.lineJoin, this.lineDash = this.ctx.lineDash, this.lineDashOffset = this.ctx.lineDashOffset);
  }, p2.prototype.toDataURL = function() {
    throw new Error("toDataUrl not implemented.");
  };
  var g2 = function(t3) {
    var e2, r2, n3, i3;
    if (true === t3.isCanvasGradient && (t3 = t3.getColor()), !t3) return { r: 0, g: 0, b: 0, a: 0, style: t3 };
    if (/transparent|rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0+\s*\)/.test(t3)) e2 = 0, r2 = 0, n3 = 0, i3 = 0;
    else {
      var a2 = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(t3);
      if (null !== a2) e2 = parseInt(a2[1]), r2 = parseInt(a2[2]), n3 = parseInt(a2[3]), i3 = 1;
      else if (null !== (a2 = /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/.exec(t3))) e2 = parseInt(a2[1]), r2 = parseInt(a2[2]), n3 = parseInt(a2[3]), i3 = parseFloat(a2[4]);
      else {
        if (i3 = 1, "string" == typeof t3 && "#" !== t3.charAt(0)) {
          var o3 = new f(t3);
          t3 = o3.ok ? o3.toHex() : "#000000";
        }
        4 === t3.length ? (e2 = t3.substring(1, 2), e2 += e2, r2 = t3.substring(2, 3), r2 += r2, n3 = t3.substring(3, 4), n3 += n3) : (e2 = t3.substring(1, 3), r2 = t3.substring(3, 5), n3 = t3.substring(5, 7)), e2 = parseInt(e2, 16), r2 = parseInt(r2, 16), n3 = parseInt(n3, 16);
      }
    }
    return { r: e2, g: r2, b: n3, a: i3, style: t3 };
  }, m2 = function() {
    return this.ctx.isFillTransparent || 0 == this.globalAlpha;
  }, v2 = function() {
    return Boolean(this.ctx.isStrokeTransparent || 0 == this.globalAlpha);
  };
  p2.prototype.fillText = function(t3, e2, r2, n3) {
    if (isNaN(e2) || isNaN(r2) || "string" != typeof t3) throw a.error("jsPDF.context2d.fillText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.fillText");
    if (n3 = isNaN(n3) ? void 0 : n3, !m2.call(this)) {
      var i3 = q2(this.ctx.transform.rotation), o3 = this.ctx.transform.scaleX;
      C2.call(this, { text: t3, x: e2, y: r2, scale: o3, angle: i3, align: this.textAlign, maxWidth: n3 });
    }
  }, p2.prototype.strokeText = function(t3, e2, r2, n3) {
    if (isNaN(e2) || isNaN(r2) || "string" != typeof t3) throw a.error("jsPDF.context2d.strokeText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.strokeText");
    if (!v2.call(this)) {
      n3 = isNaN(n3) ? void 0 : n3;
      var i3 = q2(this.ctx.transform.rotation), o3 = this.ctx.transform.scaleX;
      C2.call(this, { text: t3, x: e2, y: r2, scale: o3, renderingMode: "stroke", angle: i3, align: this.textAlign, maxWidth: n3 });
    }
  }, p2.prototype.measureText = function(t3) {
    if ("string" != typeof t3) throw a.error("jsPDF.context2d.measureText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.measureText");
    var e2 = this.pdf, r2 = this.pdf.internal.scaleFactor, n3 = e2.internal.getFontSize(), i3 = e2.getStringUnitWidth(t3) * n3 / e2.internal.scaleFactor, o3 = function(t4) {
      var e3 = (t4 = t4 || {}).width || 0;
      return Object.defineProperty(this, "width", { get: function() {
        return e3;
      } }), this;
    };
    return new o3({ width: i3 *= Math.round(96 * r2 / 72 * 1e4) / 1e4 });
  }, p2.prototype.scale = function(t3, e2) {
    if (isNaN(t3) || isNaN(e2)) throw a.error("jsPDF.context2d.scale: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.scale");
    var r2 = new h2(t3, 0, 0, e2, 0, 0);
    this.ctx.transform = this.ctx.transform.multiply(r2);
  }, p2.prototype.rotate = function(t3) {
    if (isNaN(t3)) throw a.error("jsPDF.context2d.rotate: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.rotate");
    var e2 = new h2(Math.cos(t3), Math.sin(t3), -Math.sin(t3), Math.cos(t3), 0, 0);
    this.ctx.transform = this.ctx.transform.multiply(e2);
  }, p2.prototype.translate = function(t3, e2) {
    if (isNaN(t3) || isNaN(e2)) throw a.error("jsPDF.context2d.translate: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.translate");
    var r2 = new h2(1, 0, 0, 1, t3, e2);
    this.ctx.transform = this.ctx.transform.multiply(r2);
  }, p2.prototype.transform = function(t3, e2, r2, n3, i3, o3) {
    if (isNaN(t3) || isNaN(e2) || isNaN(r2) || isNaN(n3) || isNaN(i3) || isNaN(o3)) throw a.error("jsPDF.context2d.transform: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.transform");
    var s3 = new h2(t3, e2, r2, n3, i3, o3);
    this.ctx.transform = this.ctx.transform.multiply(s3);
  }, p2.prototype.setTransform = function(t3, e2, r2, n3, i3, a2) {
    t3 = isNaN(t3) ? 1 : t3, e2 = isNaN(e2) ? 0 : e2, r2 = isNaN(r2) ? 0 : r2, n3 = isNaN(n3) ? 1 : n3, i3 = isNaN(i3) ? 0 : i3, a2 = isNaN(a2) ? 0 : a2, this.ctx.transform = new h2(t3, e2, r2, n3, i3, a2);
  };
  var b2 = function() {
    return this.margin[0] > 0 || this.margin[1] > 0 || this.margin[2] > 0 || this.margin[3] > 0;
  };
  p2.prototype.drawImage = function(t3, e2, r2, n3, i3, a2, o3, s3, c3) {
    var l3 = this.pdf.getImageProperties(t3), f2 = 1, d3 = 1, p3 = 1, g3 = 1;
    void 0 !== n3 && void 0 !== s3 && (p3 = s3 / n3, g3 = c3 / i3, f2 = l3.width / n3 * s3 / n3, d3 = l3.height / i3 * c3 / i3), void 0 === a2 && (a2 = e2, o3 = r2, e2 = 0, r2 = 0), void 0 !== n3 && void 0 === s3 && (s3 = n3, c3 = i3), void 0 === n3 && void 0 === s3 && (s3 = l3.width, c3 = l3.height);
    for (var m3, v3 = this.ctx.transform.decompose(), w3 = q2(v3.rotate.shx), A3 = new h2(), S3 = (A3 = (A3 = (A3 = A3.multiply(v3.translate)).multiply(v3.skew)).multiply(v3.scale)).applyToRectangle(new u2(a2 - e2 * p3, o3 - r2 * g3, n3 * f2, i3 * d3)), _3 = y2.call(this, S3), P3 = [], k3 = 0; k3 < _3.length; k3 += 1) -1 === P3.indexOf(_3[k3]) && P3.push(_3[k3]);
    if (L2(P3), this.autoPaging) for (var I3 = P3[0], F3 = P3[P3.length - 1], C3 = I3; C3 < F3 + 1; C3++) {
      this.pdf.setPage(C3);
      var j3 = this.pdf.internal.pageSize.width - this.margin[3] - this.margin[1], O3 = 1 === C3 ? this.posY + this.margin[0] : this.margin[0], B3 = this.pdf.internal.pageSize.height - this.posY - this.margin[0] - this.margin[2], M3 = this.pdf.internal.pageSize.height - this.margin[0] - this.margin[2], E3 = 1 === C3 ? 0 : B3 + (C3 - 2) * M3;
      if (0 !== this.ctx.clip_path.length) {
        var D3 = this.path;
        m3 = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = N2(m3, this.posX + this.margin[3], -E3 + O3 + this.ctx.prevPageLastElemOffset), x2.call(this, "fill", true), this.path = D3;
      }
      var R3 = JSON.parse(JSON.stringify(S3));
      R3 = N2([R3], this.posX + this.margin[3], -E3 + O3 + this.ctx.prevPageLastElemOffset)[0];
      var T3 = (C3 > I3 || C3 < F3) && b2.call(this);
      T3 && (this.pdf.saveGraphicsState(), this.pdf.rect(this.margin[3], this.margin[0], j3, M3, null).clip().discardPath()), this.pdf.addImage(t3, "JPEG", R3.x, R3.y, R3.w, R3.h, null, null, w3), T3 && this.pdf.restoreGraphicsState();
    }
    else this.pdf.addImage(t3, "JPEG", S3.x, S3.y, S3.w, S3.h, null, null, w3);
  };
  var y2 = function(t3, e2, r2) {
    var n3 = [];
    e2 = e2 || this.pdf.internal.pageSize.width, r2 = r2 || this.pdf.internal.pageSize.height - this.margin[0] - this.margin[2];
    var i3 = this.posY + this.ctx.prevPageLastElemOffset;
    switch (t3.type) {
      default:
      case "mt":
      case "lt":
        n3.push(Math.floor((t3.y + i3) / r2) + 1);
        break;
      case "arc":
        n3.push(Math.floor((t3.y + i3 - t3.radius) / r2) + 1), n3.push(Math.floor((t3.y + i3 + t3.radius) / r2) + 1);
        break;
      case "qct":
        var a2 = D2(this.ctx.lastPoint.x, this.ctx.lastPoint.y, t3.x1, t3.y1, t3.x, t3.y);
        n3.push(Math.floor((a2.y + i3) / r2) + 1), n3.push(Math.floor((a2.y + a2.h + i3) / r2) + 1);
        break;
      case "bct":
        var o3 = R2(this.ctx.lastPoint.x, this.ctx.lastPoint.y, t3.x1, t3.y1, t3.x2, t3.y2, t3.x, t3.y);
        n3.push(Math.floor((o3.y + i3) / r2) + 1), n3.push(Math.floor((o3.y + o3.h + i3) / r2) + 1);
        break;
      case "rect":
        n3.push(Math.floor((t3.y + i3) / r2) + 1), n3.push(Math.floor((t3.y + t3.h + i3) / r2) + 1);
    }
    for (var s3 = 0; s3 < n3.length; s3 += 1) for (; this.pdf.internal.getNumberOfPages() < n3[s3]; ) w2.call(this);
    return n3;
  }, w2 = function() {
    var t3 = this.fillStyle, e2 = this.strokeStyle, r2 = this.font, n3 = this.lineCap, i3 = this.lineWidth, a2 = this.lineJoin;
    this.pdf.addPage(), this.fillStyle = t3, this.strokeStyle = e2, this.font = r2, this.lineCap = n3, this.lineWidth = i3, this.lineJoin = a2;
  }, N2 = function(t3, e2, r2) {
    for (var n3 = 0; n3 < t3.length; n3++) switch (t3[n3].type) {
      case "bct":
        t3[n3].x2 += e2, t3[n3].y2 += r2;
      case "qct":
        t3[n3].x1 += e2, t3[n3].y1 += r2;
      case "mt":
      case "lt":
      case "arc":
      default:
        t3[n3].x += e2, t3[n3].y += r2;
    }
    return t3;
  }, L2 = function(t3) {
    return t3.sort(function(t4, e2) {
      return t4 - e2;
    });
  }, A2 = function(t3, e2) {
    for (var r2, n3, i3 = this.fillStyle, a2 = this.strokeStyle, o3 = this.lineCap, s3 = this.lineWidth, c3 = Math.abs(s3 * this.ctx.transform.scaleX), u3 = this.lineJoin, h3 = JSON.parse(JSON.stringify(this.path)), l3 = JSON.parse(JSON.stringify(this.path)), f2 = [], d3 = 0; d3 < l3.length; d3++) if (void 0 !== l3[d3].x) for (var p3 = y2.call(this, l3[d3]), g3 = 0; g3 < p3.length; g3 += 1) -1 === f2.indexOf(p3[g3]) && f2.push(p3[g3]);
    for (var m3 = 0; m3 < f2.length; m3++) for (; this.pdf.internal.getNumberOfPages() < f2[m3]; ) w2.call(this);
    if (L2(f2), this.autoPaging) for (var v3 = f2[0], A3 = f2[f2.length - 1], S3 = v3; S3 < A3 + 1; S3++) {
      this.pdf.setPage(S3), this.fillStyle = i3, this.strokeStyle = a2, this.lineCap = o3, this.lineWidth = c3, this.lineJoin = u3;
      var _3 = this.pdf.internal.pageSize.width - this.margin[3] - this.margin[1], P3 = 1 === S3 ? this.posY + this.margin[0] : this.margin[0], k3 = this.pdf.internal.pageSize.height - this.posY - this.margin[0] - this.margin[2], I3 = this.pdf.internal.pageSize.height - this.margin[0] - this.margin[2], F3 = 1 === S3 ? 0 : k3 + (S3 - 2) * I3;
      if (0 !== this.ctx.clip_path.length) {
        var C3 = this.path;
        r2 = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = N2(r2, this.posX + this.margin[3], -F3 + P3 + this.ctx.prevPageLastElemOffset), x2.call(this, t3, true), this.path = C3;
      }
      if (n3 = JSON.parse(JSON.stringify(h3)), this.path = N2(n3, this.posX + this.margin[3], -F3 + P3 + this.ctx.prevPageLastElemOffset), false === e2 || 0 === S3) {
        var j3 = (S3 > v3 || S3 < A3) && b2.call(this);
        j3 && (this.pdf.saveGraphicsState(), this.pdf.rect(this.margin[3], this.margin[0], _3, I3, null).clip().discardPath()), x2.call(this, t3, e2), j3 && this.pdf.restoreGraphicsState();
      }
      this.lineWidth = s3;
    }
    else this.lineWidth = c3, x2.call(this, t3, e2), this.lineWidth = s3;
    this.path = h3;
  }, x2 = function(t3, e2) {
    if (("stroke" !== t3 || e2 || !v2.call(this)) && ("stroke" === t3 || e2 || !m2.call(this))) {
      for (var r2, n3, i3 = [], a2 = this.path, o3 = 0; o3 < a2.length; o3++) {
        var s3 = a2[o3];
        switch (s3.type) {
          case "begin":
            i3.push({ begin: true });
            break;
          case "close":
            i3.push({ close: true });
            break;
          case "mt":
            i3.push({ start: s3, deltas: [], abs: [] });
            break;
          case "lt":
            var c3 = i3.length;
            if (a2[o3 - 1] && !isNaN(a2[o3 - 1].x) && (r2 = [s3.x - a2[o3 - 1].x, s3.y - a2[o3 - 1].y], c3 > 0)) {
              for (; c3 >= 0; c3--) if (true !== i3[c3 - 1].close && true !== i3[c3 - 1].begin) {
                i3[c3 - 1].deltas.push(r2), i3[c3 - 1].abs.push(s3);
                break;
              }
            }
            break;
          case "bct":
            r2 = [s3.x1 - a2[o3 - 1].x, s3.y1 - a2[o3 - 1].y, s3.x2 - a2[o3 - 1].x, s3.y2 - a2[o3 - 1].y, s3.x - a2[o3 - 1].x, s3.y - a2[o3 - 1].y], i3[i3.length - 1].deltas.push(r2);
            break;
          case "qct":
            var u3 = a2[o3 - 1].x + 2 / 3 * (s3.x1 - a2[o3 - 1].x), h3 = a2[o3 - 1].y + 2 / 3 * (s3.y1 - a2[o3 - 1].y), l3 = s3.x + 2 / 3 * (s3.x1 - s3.x), f2 = s3.y + 2 / 3 * (s3.y1 - s3.y), d3 = s3.x, p3 = s3.y;
            r2 = [u3 - a2[o3 - 1].x, h3 - a2[o3 - 1].y, l3 - a2[o3 - 1].x, f2 - a2[o3 - 1].y, d3 - a2[o3 - 1].x, p3 - a2[o3 - 1].y], i3[i3.length - 1].deltas.push(r2);
            break;
          case "arc":
            i3.push({ deltas: [], abs: [], arc: true }), Array.isArray(i3[i3.length - 1].abs) && i3[i3.length - 1].abs.push(s3);
        }
      }
      n3 = e2 ? null : "stroke" === t3 ? "stroke" : "fill";
      for (var g3 = false, b3 = 0; b3 < i3.length; b3++) if (i3[b3].arc) for (var y3 = i3[b3].abs, w3 = 0; w3 < y3.length; w3++) {
        var N3 = y3[w3];
        "arc" === N3.type ? P2.call(this, N3.x, N3.y, N3.radius, N3.startAngle, N3.endAngle, N3.counterclockwise, void 0, e2, !g3) : j2.call(this, N3.x, N3.y), g3 = true;
      }
      else if (true === i3[b3].close) this.pdf.internal.out("h"), g3 = false;
      else if (true !== i3[b3].begin) {
        var L3 = i3[b3].start.x, A3 = i3[b3].start.y;
        O2.call(this, i3[b3].deltas, L3, A3), g3 = true;
      }
      n3 && k2.call(this, n3), e2 && I2.call(this);
    }
  }, S2 = function(t3) {
    var e2 = this.pdf.internal.getFontSize() / this.pdf.internal.scaleFactor, r2 = e2 * (this.pdf.internal.getLineHeightFactor() - 1);
    switch (this.ctx.textBaseline) {
      case "bottom":
        return t3 - r2;
      case "top":
        return t3 + e2 - r2;
      case "hanging":
        return t3 + e2 - 2 * r2;
      case "middle":
        return t3 + e2 / 2 - r2;
      case "ideographic":
        return t3;
      case "alphabetic":
      default:
        return t3;
    }
  }, _2 = function(t3) {
    return t3 + this.pdf.internal.getFontSize() / this.pdf.internal.scaleFactor * (this.pdf.internal.getLineHeightFactor() - 1);
  };
  p2.prototype.createLinearGradient = function() {
    var t3 = function() {
    };
    return t3.colorStops = [], t3.addColorStop = function(t4, e2) {
      this.colorStops.push([t4, e2]);
    }, t3.getColor = function() {
      return 0 === this.colorStops.length ? "#000000" : this.colorStops[0][1];
    }, t3.isCanvasGradient = true, t3;
  }, p2.prototype.createPattern = function() {
    return this.createLinearGradient();
  }, p2.prototype.createRadialGradient = function() {
    return this.createLinearGradient();
  };
  var P2 = function(t3, e2, r2, n3, i3, a2, o3, s3, c3) {
    for (var u3 = M2.call(this, r2, n3, i3, a2), h3 = 0; h3 < u3.length; h3++) {
      var l3 = u3[h3];
      0 === h3 && (c3 ? F2.call(this, l3.x1 + t3, l3.y1 + e2) : j2.call(this, l3.x1 + t3, l3.y1 + e2)), B2.call(this, t3, e2, l3.x2, l3.y2, l3.x3, l3.y3, l3.x4, l3.y4);
    }
    s3 ? I2.call(this) : k2.call(this, o3);
  }, k2 = function(t3) {
    switch (t3) {
      case "stroke":
        this.pdf.internal.out("S");
        break;
      case "fill":
        this.pdf.internal.out("f");
    }
  }, I2 = function() {
    this.pdf.clip(), this.pdf.discardPath();
  }, F2 = function(t3, e2) {
    this.pdf.internal.out(n2(t3) + " " + i2(e2) + " m");
  }, C2 = function(t3) {
    var e2;
    switch (t3.align) {
      case "right":
      case "end":
        e2 = "right";
        break;
      case "center":
        e2 = "center";
        break;
      case "left":
      case "start":
      default:
        e2 = "left";
    }
    var r2 = this.pdf.getTextDimensions(t3.text), n3 = S2.call(this, t3.y), i3 = _2.call(this, n3) - r2.h, a2 = this.ctx.transform.applyToPoint(new c2(t3.x, n3)), o3 = this.ctx.transform.decompose(), s3 = new h2();
    s3 = (s3 = (s3 = s3.multiply(o3.translate)).multiply(o3.skew)).multiply(o3.scale);
    for (var l3, f2, d3, p3 = this.ctx.transform.applyToRectangle(new u2(t3.x, n3, r2.w, r2.h)), g3 = s3.applyToRectangle(new u2(t3.x, i3, r2.w, r2.h)), m3 = y2.call(this, g3), v3 = [], w3 = 0; w3 < m3.length; w3 += 1) -1 === v3.indexOf(m3[w3]) && v3.push(m3[w3]);
    if (L2(v3), this.autoPaging) for (var A3 = v3[0], P3 = v3[v3.length - 1], k3 = A3; k3 < P3 + 1; k3++) {
      this.pdf.setPage(k3);
      var I3 = 1 === k3 ? this.posY + this.margin[0] : this.margin[0], F3 = this.pdf.internal.pageSize.height - this.posY - this.margin[0] - this.margin[2], C3 = this.pdf.internal.pageSize.height - this.margin[2], j3 = C3 - this.margin[0], O3 = this.pdf.internal.pageSize.width - this.margin[1], B3 = O3 - this.margin[3], M3 = 1 === k3 ? 0 : F3 + (k3 - 2) * j3;
      if (0 !== this.ctx.clip_path.length) {
        var E3 = this.path;
        l3 = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = N2(l3, this.posX + this.margin[3], -1 * M3 + I3), x2.call(this, "fill", true), this.path = E3;
      }
      var q3 = N2([JSON.parse(JSON.stringify(g3))], this.posX + this.margin[3], -M3 + I3 + this.ctx.prevPageLastElemOffset)[0];
      t3.scale >= 0.01 && (f2 = this.pdf.internal.getFontSize(), this.pdf.setFontSize(f2 * t3.scale), d3 = this.lineWidth, this.lineWidth = d3 * t3.scale);
      var D3 = "text" !== this.autoPaging;
      if (D3 || q3.y + q3.h <= C3) {
        if (D3 || q3.y >= I3 && q3.x <= O3) {
          var R3 = D3 ? t3.text : this.pdf.splitTextToSize(t3.text, t3.maxWidth || O3 - q3.x)[0], T3 = N2([JSON.parse(JSON.stringify(p3))], this.posX + this.margin[3], -M3 + I3 + this.ctx.prevPageLastElemOffset)[0], U2 = D3 && (k3 > A3 || k3 < P3) && b2.call(this);
          U2 && (this.pdf.saveGraphicsState(), this.pdf.rect(this.margin[3], this.margin[0], B3, j3, null).clip().discardPath()), this.pdf.text(R3, T3.x, T3.y, { angle: t3.angle, align: e2, renderingMode: t3.renderingMode }), U2 && this.pdf.restoreGraphicsState();
        }
      } else q3.y < C3 && (this.ctx.prevPageLastElemOffset += C3 - q3.y);
      t3.scale >= 0.01 && (this.pdf.setFontSize(f2), this.lineWidth = d3);
    }
    else t3.scale >= 0.01 && (f2 = this.pdf.internal.getFontSize(), this.pdf.setFontSize(f2 * t3.scale), d3 = this.lineWidth, this.lineWidth = d3 * t3.scale), this.pdf.text(t3.text, a2.x + this.posX, a2.y + this.posY, { angle: t3.angle, align: e2, renderingMode: t3.renderingMode, maxWidth: t3.maxWidth }), t3.scale >= 0.01 && (this.pdf.setFontSize(f2), this.lineWidth = d3);
  }, j2 = function(t3, e2, r2, a2) {
    r2 = r2 || 0, a2 = a2 || 0, this.pdf.internal.out(n2(t3 + r2) + " " + i2(e2 + a2) + " l");
  }, O2 = function(t3, e2, r2) {
    return this.pdf.lines(t3, e2, r2, null, null);
  }, B2 = function(t3, e2, n3, i3, a2, c3, u3, h3) {
    this.pdf.internal.out([r(o2(n3 + t3)), r(s2(i3 + e2)), r(o2(a2 + t3)), r(s2(c3 + e2)), r(o2(u3 + t3)), r(s2(h3 + e2)), "c"].join(" "));
  }, M2 = function(t3, e2, r2, n3) {
    for (var i3 = 2 * Math.PI, a2 = Math.PI / 2; e2 > r2; ) e2 -= i3;
    var o3 = Math.abs(r2 - e2);
    o3 < i3 && n3 && (o3 = i3 - o3);
    for (var s3 = [], c3 = n3 ? -1 : 1, u3 = e2; o3 > 1e-5; ) {
      var h3 = u3 + c3 * Math.min(o3, a2);
      s3.push(E2.call(this, t3, u3, h3)), o3 -= Math.abs(h3 - u3), u3 = h3;
    }
    return s3;
  }, E2 = function(t3, e2, r2) {
    var n3 = (r2 - e2) / 2, i3 = t3 * Math.cos(n3), a2 = t3 * Math.sin(n3), o3 = i3, s3 = -a2, c3 = o3 * o3 + s3 * s3, u3 = c3 + o3 * i3 + s3 * a2, h3 = 4 / 3 * (Math.sqrt(2 * c3 * u3) - u3) / (o3 * a2 - s3 * i3), l3 = o3 - h3 * s3, f2 = s3 + h3 * o3, d3 = l3, p3 = -f2, g3 = n3 + e2, m3 = Math.cos(g3), v3 = Math.sin(g3);
    return { x1: t3 * Math.cos(e2), y1: t3 * Math.sin(e2), x2: l3 * m3 - f2 * v3, y2: l3 * v3 + f2 * m3, x3: d3 * m3 - p3 * v3, y3: d3 * v3 + p3 * m3, x4: t3 * Math.cos(r2), y4: t3 * Math.sin(r2) };
  }, q2 = function(t3) {
    return 180 * t3 / Math.PI;
  }, D2 = function(t3, e2, r2, n3, i3, a2) {
    var o3 = t3 + 0.5 * (r2 - t3), s3 = e2 + 0.5 * (n3 - e2), c3 = i3 + 0.5 * (r2 - i3), h3 = a2 + 0.5 * (n3 - a2), l3 = Math.min(t3, i3, o3, c3), f2 = Math.max(t3, i3, o3, c3), d3 = Math.min(e2, a2, s3, h3), p3 = Math.max(e2, a2, s3, h3);
    return new u2(l3, d3, f2 - l3, p3 - d3);
  }, R2 = function(t3, e2, r2, n3, i3, a2, o3, s3) {
    var c3, h3, l3, f2, d3, p3, g3, m3, v3, b3, y3, w3, N3, L3, A3 = r2 - t3, x3 = n3 - e2, S3 = i3 - r2, _3 = a2 - n3, P3 = o3 - i3, k3 = s3 - a2;
    for (h3 = 0; h3 < 41; h3++) v3 = (g3 = (l3 = t3 + (c3 = h3 / 40) * A3) + c3 * ((d3 = r2 + c3 * S3) - l3)) + c3 * (d3 + c3 * (i3 + c3 * P3 - d3) - g3), b3 = (m3 = (f2 = e2 + c3 * x3) + c3 * ((p3 = n3 + c3 * _3) - f2)) + c3 * (p3 + c3 * (a2 + c3 * k3 - p3) - m3), 0 == h3 ? (y3 = v3, w3 = b3, N3 = v3, L3 = b3) : (y3 = Math.min(y3, v3), w3 = Math.min(w3, b3), N3 = Math.max(N3, v3), L3 = Math.max(L3, b3));
    return new u2(Math.round(y3), Math.round(w3), Math.round(N3 - y3), Math.round(L3 - w3));
  }, T2 = function() {
    if (this.prevLineDash || this.ctx.lineDash.length || this.ctx.lineDashOffset) {
      var t3, e2, r2 = (t3 = this.ctx.lineDash, e2 = this.ctx.lineDashOffset, JSON.stringify({ lineDash: t3, lineDashOffset: e2 }));
      this.prevLineDash !== r2 && (this.pdf.setLineDash(this.ctx.lineDash, this.ctx.lineDashOffset), this.prevLineDash = r2);
    }
  };
}(E.API), /**
 * @license
 * jsPDF filters PlugIn
 * Copyright (c) 2014 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var r = function(t4) {
    var e, r2, n3, i3, a3, o2, s2, c2, u2, h2;
    for (r2 = [], n3 = 0, i3 = (t4 += e = "\0\0\0\0".slice(t4.length % 4 || 4)).length; i3 > n3; n3 += 4) 0 !== (a3 = (t4.charCodeAt(n3) << 24) + (t4.charCodeAt(n3 + 1) << 16) + (t4.charCodeAt(n3 + 2) << 8) + t4.charCodeAt(n3 + 3)) ? (o2 = (a3 = ((a3 = ((a3 = ((a3 = (a3 - (h2 = a3 % 85)) / 85) - (u2 = a3 % 85)) / 85) - (c2 = a3 % 85)) / 85) - (s2 = a3 % 85)) / 85) % 85, r2.push(o2 + 33, s2 + 33, c2 + 33, u2 + 33, h2 + 33)) : r2.push(122);
    return function(t5, e2) {
      for (var r3 = e2; r3 > 0; r3--) t5.pop();
    }(r2, e.length), String.fromCharCode.apply(String, r2) + "~>";
  }, n2 = function(t4) {
    var e, r2, n3, i3, a3, o2 = String, s2 = "length", c2 = 255, u2 = "charCodeAt", h2 = "slice", l2 = "replace";
    for (t4[h2](-2), t4 = t4[h2](0, -2)[l2](/\s/g, "")[l2]("z", "!!!!!"), n3 = [], i3 = 0, a3 = (t4 += e = "uuuuu"[h2](t4[s2] % 5 || 5))[s2]; a3 > i3; i3 += 5) r2 = 52200625 * (t4[u2](i3) - 33) + 614125 * (t4[u2](i3 + 1) - 33) + 7225 * (t4[u2](i3 + 2) - 33) + 85 * (t4[u2](i3 + 3) - 33) + (t4[u2](i3 + 4) - 33), n3.push(c2 & r2 >> 24, c2 & r2 >> 16, c2 & r2 >> 8, c2 & r2);
    return function(t5, e2) {
      for (var r3 = e2; r3 > 0; r3--) t5.pop();
    }(n3, e[s2]), o2.fromCharCode.apply(o2, n3);
  }, i2 = function(t4) {
    var e = new RegExp(/^([0-9A-Fa-f]{2})+$/);
    if (-1 !== (t4 = t4.replace(/\s/g, "")).indexOf(">") && (t4 = t4.substr(0, t4.indexOf(">"))), t4.length % 2 && (t4 += "0"), false === e.test(t4)) return "";
    for (var r2 = "", n3 = 0; n3 < t4.length; n3 += 2) r2 += String.fromCharCode("0x" + (t4[n3] + t4[n3 + 1]));
    return r2;
  }, a2 = function(t4) {
    for (var r2 = new Uint8Array(t4.length), n3 = t4.length; n3--; ) r2[n3] = t4.charCodeAt(n3);
    return t4 = (r2 = zlibSync(r2)).reduce(function(t5, e) {
      return t5 + String.fromCharCode(e);
    }, "");
  };
  t3.processDataByFilters = function(t4, e) {
    var o2 = 0, s2 = t4 || "", c2 = [];
    for ("string" == typeof (e = e || []) && (e = [e]), o2 = 0; o2 < e.length; o2 += 1) switch (e[o2]) {
      case "ASCII85Decode":
      case "/ASCII85Decode":
        s2 = n2(s2), c2.push("/ASCII85Encode");
        break;
      case "ASCII85Encode":
      case "/ASCII85Encode":
        s2 = r(s2), c2.push("/ASCII85Decode");
        break;
      case "ASCIIHexDecode":
      case "/ASCIIHexDecode":
        s2 = i2(s2), c2.push("/ASCIIHexEncode");
        break;
      case "ASCIIHexEncode":
      case "/ASCIIHexEncode":
        s2 = s2.split("").map(function(t5) {
          return ("0" + t5.charCodeAt().toString(16)).slice(-2);
        }).join("") + ">", c2.push("/ASCIIHexDecode");
        break;
      case "FlateEncode":
      case "/FlateEncode":
        s2 = a2(s2), c2.push("/FlateDecode");
        break;
      default:
        throw new Error('The filter: "' + e[o2] + '" is not implemented');
    }
    return { data: s2, reverseChain: c2.reverse().join(" ") };
  };
}(E.API), /**
 * @license
 * jsPDF fileloading PlugIn
 * Copyright (c) 2018 Aras Abbasi (aras.abbasi@gmail.com)
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  t3.loadFile = function(t4, e, r) {
    return function(t5, e2, r2) {
      e2 = false !== e2, r2 = "function" == typeof r2 ? r2 : function() {
      };
      var n2 = void 0;
      try {
        n2 = function(t6, e3, r3) {
          var n3 = new XMLHttpRequest(), i2 = 0, a2 = function(t7) {
            var e4 = t7.length, r4 = [], n4 = String.fromCharCode;
            for (i2 = 0; i2 < e4; i2 += 1) r4.push(n4(255 & t7.charCodeAt(i2)));
            return r4.join("");
          };
          if (n3.open("GET", t6, !e3), n3.overrideMimeType("text/plain; charset=x-user-defined"), false === e3 && (n3.onload = function() {
            200 === n3.status ? r3(a2(this.responseText)) : r3(void 0);
          }), n3.send(null), e3 && 200 === n3.status) return a2(n3.responseText);
        }(t5, e2, r2);
      } catch (t6) {
      }
      return n2;
    }(t4, e, r);
  }, t3.loadImageFile = t3.loadFile;
}(E.API), function(e) {
  function r() {
    return (n.html2canvas ? Promise.resolve(n.html2canvas) : Promise.resolve().then(() => require("./html2canvas.esm-CpBUo6M0.js"))).catch(function(t3) {
      return Promise.reject(new Error("Could not load html2canvas: " + t3));
    }).then(function(t3) {
      return t3.default ? t3.default : t3;
    });
  }
  function i2() {
    return (n.DOMPurify ? Promise.resolve(n.DOMPurify) : Promise.resolve().then(() => require("./purify.es-DhyF8gil.js"))).catch(function(t3) {
      return Promise.reject(new Error("Could not load dompurify: " + t3));
    }).then(function(t3) {
      return t3.default ? t3.default : t3;
    });
  }
  var a2 = function(e2) {
    var r2 = t(e2);
    return "undefined" === r2 ? "undefined" : "string" === r2 || e2 instanceof String ? "string" : "number" === r2 || e2 instanceof Number ? "number" : "function" === r2 || e2 instanceof Function ? "function" : e2 && e2.constructor === Array ? "array" : e2 && 1 === e2.nodeType ? "element" : "object" === r2 ? "object" : "unknown";
  }, o2 = function(t3, e2) {
    var r2 = document.createElement(t3);
    for (var n2 in e2.className && (r2.className = e2.className), e2.innerHTML && e2.dompurify && (r2.innerHTML = e2.dompurify.sanitize(e2.innerHTML)), e2.style) r2.style[n2] = e2.style[n2];
    return r2;
  }, s2 = function t3(e2) {
    var r2 = Object.assign(t3.convert(Promise.resolve()), JSON.parse(JSON.stringify(t3.template))), n2 = t3.convert(Promise.resolve(), r2);
    return n2 = (n2 = n2.setProgress(1, t3, 1, [t3])).set(e2);
  };
  (s2.prototype = Object.create(Promise.prototype)).constructor = s2, s2.convert = function(t3, e2) {
    return t3.__proto__ = e2 || s2.prototype, t3;
  }, s2.template = { prop: { src: null, container: null, overlay: null, canvas: null, img: null, pdf: null, pageSize: null, callback: function() {
  } }, progress: { val: 0, state: null, n: 0, stack: [] }, opt: { filename: "file.pdf", margin: [0, 0, 0, 0], enableLinks: true, x: 0, y: 0, html2canvas: {}, jsPDF: {}, backgroundColor: "transparent" } }, s2.prototype.from = function(t3, e2) {
    return this.then(function() {
      switch (e2 = e2 || function(t4) {
        switch (a2(t4)) {
          case "string":
            return "string";
          case "element":
            return "canvas" === t4.nodeName.toLowerCase() ? "canvas" : "element";
          default:
            return "unknown";
        }
      }(t3)) {
        case "string":
          return this.then(i2).then(function(e3) {
            return this.set({ src: o2("div", { innerHTML: t3, dompurify: e3 }) });
          });
        case "element":
          return this.set({ src: t3 });
        case "canvas":
          return this.set({ canvas: t3 });
        case "img":
          return this.set({ img: t3 });
        default:
          return this.error("Unknown source type.");
      }
    });
  }, s2.prototype.to = function(t3) {
    switch (t3) {
      case "container":
        return this.toContainer();
      case "canvas":
        return this.toCanvas();
      case "img":
        return this.toImg();
      case "pdf":
        return this.toPdf();
      default:
        return this.error("Invalid target.");
    }
  }, s2.prototype.toContainer = function() {
    return this.thenList([function() {
      return this.prop.src || this.error("Cannot duplicate - no source HTML.");
    }, function() {
      return this.prop.pageSize || this.setPageSize();
    }]).then(function() {
      var t3 = { position: "relative", display: "inline-block", width: ("number" != typeof this.opt.width || isNaN(this.opt.width) || "number" != typeof this.opt.windowWidth || isNaN(this.opt.windowWidth) ? Math.max(this.prop.src.clientWidth, this.prop.src.scrollWidth, this.prop.src.offsetWidth) : this.opt.windowWidth) + "px", left: 0, right: 0, top: 0, margin: "auto", backgroundColor: this.opt.backgroundColor }, e2 = function t4(e3, r2) {
        for (var n2 = 3 === e3.nodeType ? document.createTextNode(e3.nodeValue) : e3.cloneNode(false), i3 = e3.firstChild; i3; i3 = i3.nextSibling) true !== r2 && 1 === i3.nodeType && "SCRIPT" === i3.nodeName || n2.appendChild(t4(i3, r2));
        return 1 === e3.nodeType && ("CANVAS" === e3.nodeName ? (n2.width = e3.width, n2.height = e3.height, n2.getContext("2d").drawImage(e3, 0, 0)) : "TEXTAREA" !== e3.nodeName && "SELECT" !== e3.nodeName || (n2.value = e3.value), n2.addEventListener("load", function() {
          n2.scrollTop = e3.scrollTop, n2.scrollLeft = e3.scrollLeft;
        }, true)), n2;
      }(this.prop.src, this.opt.html2canvas.javascriptEnabled);
      "BODY" === e2.tagName && (t3.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px"), this.prop.overlay = o2("div", { className: "html2pdf__overlay", style: { position: "fixed", overflow: "hidden", zIndex: 1e3, left: "-100000px", right: 0, bottom: 0, top: 0 } }), this.prop.container = o2("div", { className: "html2pdf__container", style: t3 }), this.prop.container.appendChild(e2), this.prop.container.firstChild.appendChild(o2("div", { style: { clear: "both", border: "0 none transparent", margin: 0, padding: 0, height: 0 } })), this.prop.container.style.float = "none", this.prop.overlay.appendChild(this.prop.container), document.body.appendChild(this.prop.overlay), this.prop.container.firstChild.style.position = "relative", this.prop.container.height = Math.max(this.prop.container.firstChild.clientHeight, this.prop.container.firstChild.scrollHeight, this.prop.container.firstChild.offsetHeight) + "px";
    });
  }, s2.prototype.toCanvas = function() {
    var t3 = [function() {
      return document.body.contains(this.prop.container) || this.toContainer();
    }];
    return this.thenList(t3).then(r).then(function(t4) {
      var e2 = Object.assign({}, this.opt.html2canvas);
      return delete e2.onrendered, t4(this.prop.container, e2);
    }).then(function(t4) {
      (this.opt.html2canvas.onrendered || function() {
      })(t4), this.prop.canvas = t4, document.body.removeChild(this.prop.overlay);
    });
  }, s2.prototype.toContext2d = function() {
    var t3 = [function() {
      return document.body.contains(this.prop.container) || this.toContainer();
    }];
    return this.thenList(t3).then(r).then(function(t4) {
      var e2 = this.opt.jsPDF, r2 = this.opt.fontFaces, n2 = "number" != typeof this.opt.width || isNaN(this.opt.width) || "number" != typeof this.opt.windowWidth || isNaN(this.opt.windowWidth) ? 1 : this.opt.width / this.opt.windowWidth, i3 = Object.assign({ async: true, allowTaint: true, scale: n2, scrollX: this.opt.scrollX || 0, scrollY: this.opt.scrollY || 0, backgroundColor: "#ffffff", imageTimeout: 15e3, logging: true, proxy: null, removeContainer: true, foreignObjectRendering: false, useCORS: false }, this.opt.html2canvas);
      if (delete i3.onrendered, e2.context2d.autoPaging = void 0 === this.opt.autoPaging || this.opt.autoPaging, e2.context2d.posX = this.opt.x, e2.context2d.posY = this.opt.y, e2.context2d.margin = this.opt.margin, e2.context2d.fontFaces = r2, r2) for (var a3 = 0; a3 < r2.length; ++a3) {
        var o3 = r2[a3], s3 = o3.src.find(function(t5) {
          return "truetype" === t5.format;
        });
        s3 && e2.addFont(s3.url, o3.ref.name, o3.ref.style);
      }
      return i3.windowHeight = i3.windowHeight || 0, i3.windowHeight = 0 == i3.windowHeight ? Math.max(this.prop.container.clientHeight, this.prop.container.scrollHeight, this.prop.container.offsetHeight) : i3.windowHeight, e2.context2d.save(true), t4(this.prop.container, i3);
    }).then(function(t4) {
      this.opt.jsPDF.context2d.restore(true), (this.opt.html2canvas.onrendered || function() {
      })(t4), this.prop.canvas = t4, document.body.removeChild(this.prop.overlay);
    });
  }, s2.prototype.toImg = function() {
    return this.thenList([function() {
      return this.prop.canvas || this.toCanvas();
    }]).then(function() {
      var t3 = this.prop.canvas.toDataURL("image/" + this.opt.image.type, this.opt.image.quality);
      this.prop.img = document.createElement("img"), this.prop.img.src = t3;
    });
  }, s2.prototype.toPdf = function() {
    return this.thenList([function() {
      return this.toContext2d();
    }]).then(function() {
      this.prop.pdf = this.prop.pdf || this.opt.jsPDF;
    });
  }, s2.prototype.output = function(t3, e2, r2) {
    return "img" === (r2 = r2 || "pdf").toLowerCase() || "image" === r2.toLowerCase() ? this.outputImg(t3, e2) : this.outputPdf(t3, e2);
  }, s2.prototype.outputPdf = function(t3, e2) {
    return this.thenList([function() {
      return this.prop.pdf || this.toPdf();
    }]).then(function() {
      return this.prop.pdf.output(t3, e2);
    });
  }, s2.prototype.outputImg = function(t3) {
    return this.thenList([function() {
      return this.prop.img || this.toImg();
    }]).then(function() {
      switch (t3) {
        case void 0:
        case "img":
          return this.prop.img;
        case "datauristring":
        case "dataurlstring":
          return this.prop.img.src;
        case "datauri":
        case "dataurl":
          return document.location.href = this.prop.img.src;
        default:
          throw 'Image output type "' + t3 + '" is not supported.';
      }
    });
  }, s2.prototype.save = function(t3) {
    return this.thenList([function() {
      return this.prop.pdf || this.toPdf();
    }]).set(t3 ? { filename: t3 } : null).then(function() {
      this.prop.pdf.save(this.opt.filename);
    });
  }, s2.prototype.doCallback = function() {
    return this.thenList([function() {
      return this.prop.pdf || this.toPdf();
    }]).then(function() {
      this.prop.callback(this.prop.pdf);
    });
  }, s2.prototype.set = function(t3) {
    if ("object" !== a2(t3)) return this;
    var e2 = Object.keys(t3 || {}).map(function(e3) {
      if (e3 in s2.template.prop) return function() {
        this.prop[e3] = t3[e3];
      };
      switch (e3) {
        case "margin":
          return this.setMargin.bind(this, t3.margin);
        case "jsPDF":
          return function() {
            return this.opt.jsPDF = t3.jsPDF, this.setPageSize();
          };
        case "pageSize":
          return this.setPageSize.bind(this, t3.pageSize);
        default:
          return function() {
            this.opt[e3] = t3[e3];
          };
      }
    }, this);
    return this.then(function() {
      return this.thenList(e2);
    });
  }, s2.prototype.get = function(t3, e2) {
    return this.then(function() {
      var r2 = t3 in s2.template.prop ? this.prop[t3] : this.opt[t3];
      return e2 ? e2(r2) : r2;
    });
  }, s2.prototype.setMargin = function(t3) {
    return this.then(function() {
      switch (a2(t3)) {
        case "number":
          t3 = [t3, t3, t3, t3];
        case "array":
          if (2 === t3.length && (t3 = [t3[0], t3[1], t3[0], t3[1]]), 4 === t3.length) break;
        default:
          return this.error("Invalid margin array.");
      }
      this.opt.margin = t3;
    }).then(this.setPageSize);
  }, s2.prototype.setPageSize = function(t3) {
    function e2(t4, e3) {
      return Math.floor(t4 * e3 / 72 * 96);
    }
    return this.then(function() {
      (t3 = t3 || E.getPageSize(this.opt.jsPDF)).hasOwnProperty("inner") || (t3.inner = { width: t3.width - this.opt.margin[1] - this.opt.margin[3], height: t3.height - this.opt.margin[0] - this.opt.margin[2] }, t3.inner.px = { width: e2(t3.inner.width, t3.k), height: e2(t3.inner.height, t3.k) }, t3.inner.ratio = t3.inner.height / t3.inner.width), this.prop.pageSize = t3;
    });
  }, s2.prototype.setProgress = function(t3, e2, r2, n2) {
    return null != t3 && (this.progress.val = t3), null != e2 && (this.progress.state = e2), null != r2 && (this.progress.n = r2), null != n2 && (this.progress.stack = n2), this.progress.ratio = this.progress.val / this.progress.state, this;
  }, s2.prototype.updateProgress = function(t3, e2, r2, n2) {
    return this.setProgress(t3 ? this.progress.val + t3 : null, e2 || null, r2 ? this.progress.n + r2 : null, n2 ? this.progress.stack.concat(n2) : null);
  }, s2.prototype.then = function(t3, e2) {
    var r2 = this;
    return this.thenCore(t3, e2, function(t4, e3) {
      return r2.updateProgress(null, null, 1, [t4]), Promise.prototype.then.call(this, function(e4) {
        return r2.updateProgress(null, t4), e4;
      }).then(t4, e3).then(function(t5) {
        return r2.updateProgress(1), t5;
      });
    });
  }, s2.prototype.thenCore = function(t3, e2, r2) {
    r2 = r2 || Promise.prototype.then;
    t3 && (t3 = t3.bind(this)), e2 && (e2 = e2.bind(this));
    var n2 = -1 !== Promise.toString().indexOf("[native code]") && "Promise" === Promise.name ? this : s2.convert(Object.assign({}, this), Promise.prototype), i3 = r2.call(n2, t3, e2);
    return s2.convert(i3, this.__proto__);
  }, s2.prototype.thenExternal = function(t3, e2) {
    return Promise.prototype.then.call(this, t3, e2);
  }, s2.prototype.thenList = function(t3) {
    var e2 = this;
    return t3.forEach(function(t4) {
      e2 = e2.thenCore(t4);
    }), e2;
  }, s2.prototype.catch = function(t3) {
    t3 && (t3 = t3.bind(this));
    var e2 = Promise.prototype.catch.call(this, t3);
    return s2.convert(e2, this);
  }, s2.prototype.catchExternal = function(t3) {
    return Promise.prototype.catch.call(this, t3);
  }, s2.prototype.error = function(t3) {
    return this.then(function() {
      throw new Error(t3);
    });
  }, s2.prototype.using = s2.prototype.set, s2.prototype.saveAs = s2.prototype.save, s2.prototype.export = s2.prototype.output, s2.prototype.run = s2.prototype.then, E.getPageSize = function(e2, r2, n2) {
    if ("object" === t(e2)) {
      var i3 = e2;
      e2 = i3.orientation, r2 = i3.unit || r2, n2 = i3.format || n2;
    }
    r2 = r2 || "mm", n2 = n2 || "a4", e2 = ("" + (e2 || "P")).toLowerCase();
    var a3, o3 = ("" + n2).toLowerCase(), s3 = { a0: [2383.94, 3370.39], a1: [1683.78, 2383.94], a2: [1190.55, 1683.78], a3: [841.89, 1190.55], a4: [595.28, 841.89], a5: [419.53, 595.28], a6: [297.64, 419.53], a7: [209.76, 297.64], a8: [147.4, 209.76], a9: [104.88, 147.4], a10: [73.7, 104.88], b0: [2834.65, 4008.19], b1: [2004.09, 2834.65], b2: [1417.32, 2004.09], b3: [1000.63, 1417.32], b4: [708.66, 1000.63], b5: [498.9, 708.66], b6: [354.33, 498.9], b7: [249.45, 354.33], b8: [175.75, 249.45], b9: [124.72, 175.75], b10: [87.87, 124.72], c0: [2599.37, 3676.54], c1: [1836.85, 2599.37], c2: [1298.27, 1836.85], c3: [918.43, 1298.27], c4: [649.13, 918.43], c5: [459.21, 649.13], c6: [323.15, 459.21], c7: [229.61, 323.15], c8: [161.57, 229.61], c9: [113.39, 161.57], c10: [79.37, 113.39], dl: [311.81, 623.62], letter: [612, 792], "government-letter": [576, 756], legal: [612, 1008], "junior-legal": [576, 360], ledger: [1224, 792], tabloid: [792, 1224], "credit-card": [153, 243] };
    switch (r2) {
      case "pt":
        a3 = 1;
        break;
      case "mm":
        a3 = 72 / 25.4;
        break;
      case "cm":
        a3 = 72 / 2.54;
        break;
      case "in":
        a3 = 72;
        break;
      case "px":
        a3 = 0.75;
        break;
      case "pc":
      case "em":
        a3 = 12;
        break;
      case "ex":
        a3 = 6;
        break;
      default:
        throw "Invalid unit: " + r2;
    }
    var c2, u2 = 0, h2 = 0;
    if (s3.hasOwnProperty(o3)) u2 = s3[o3][1] / a3, h2 = s3[o3][0] / a3;
    else try {
      u2 = n2[1], h2 = n2[0];
    } catch (t3) {
      throw new Error("Invalid format: " + n2);
    }
    if ("p" === e2 || "portrait" === e2) e2 = "p", h2 > u2 && (c2 = h2, h2 = u2, u2 = c2);
    else {
      if ("l" !== e2 && "landscape" !== e2) throw "Invalid orientation: " + e2;
      e2 = "l", u2 > h2 && (c2 = h2, h2 = u2, u2 = c2);
    }
    return { width: h2, height: u2, unit: r2, k: a3, orientation: e2 };
  }, e.html = function(t3, e2) {
    (e2 = e2 || {}).callback = e2.callback || function() {
    }, e2.html2canvas = e2.html2canvas || {}, e2.html2canvas.canvas = e2.html2canvas.canvas || this.canvas, e2.jsPDF = e2.jsPDF || this, e2.fontFaces = e2.fontFaces ? e2.fontFaces.map(jt) : null;
    var r2 = new s2(e2);
    return e2.worker ? r2 : r2.from(t3).doCallback();
  };
}(E.API), E.API.addJS = function(t3) {
  return Ht = t3, this.internal.events.subscribe("postPutResources", function() {
    Ut = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/Names [(EmbeddedJS) " + (Ut + 1) + " 0 R]"), this.internal.out(">>"), this.internal.out("endobj"), zt = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/S /JavaScript"), this.internal.out("/JS (" + Ht + ")"), this.internal.out(">>"), this.internal.out("endobj");
  }), this.internal.events.subscribe("putCatalog", function() {
    void 0 !== Ut && void 0 !== zt && this.internal.out("/Names <</JavaScript " + Ut + " 0 R>>");
  }), this;
}, /**
 * @license
 * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e;
  t3.events.push(["postPutResources", function() {
    var t4 = this, r = /^(\d+) 0 obj$/;
    if (this.outline.root.children.length > 0) for (var n2 = t4.outline.render().split(/\r\n/), i2 = 0; i2 < n2.length; i2++) {
      var a2 = n2[i2], o2 = r.exec(a2);
      if (null != o2) {
        var s2 = o2[1];
        t4.internal.newObjectDeferredBegin(s2, false);
      }
      t4.internal.write(a2);
    }
    if (this.outline.createNamedDestinations) {
      var c2 = this.internal.pages.length, u2 = [];
      for (i2 = 0; i2 < c2; i2++) {
        var h2 = t4.internal.newObject();
        u2.push(h2);
        var l2 = t4.internal.getPageInfo(i2 + 1);
        t4.internal.write("<< /D[" + l2.objId + " 0 R /XYZ null null null]>> endobj");
      }
      var f2 = t4.internal.newObject();
      t4.internal.write("<< /Names [ ");
      for (i2 = 0; i2 < u2.length; i2++) t4.internal.write("(page_" + (i2 + 1) + ")" + u2[i2] + " 0 R");
      t4.internal.write(" ] >>", "endobj"), e = t4.internal.newObject(), t4.internal.write("<< /Dests " + f2 + " 0 R"), t4.internal.write(">>", "endobj");
    }
  }]), t3.events.push(["putCatalog", function() {
    this.outline.root.children.length > 0 && (this.internal.write("/Outlines", this.outline.makeRef(this.outline.root)), this.outline.createNamedDestinations && this.internal.write("/Names " + e + " 0 R"));
  }]), t3.events.push(["initialized", function() {
    var t4 = this;
    t4.outline = { createNamedDestinations: false, root: { children: [] } }, t4.outline.add = function(t5, e2, r) {
      var n2 = { title: e2, options: r, children: [] };
      return null == t5 && (t5 = this.root), t5.children.push(n2), n2;
    }, t4.outline.render = function() {
      return this.ctx = {}, this.ctx.val = "", this.ctx.pdf = t4, this.genIds_r(this.root), this.renderRoot(this.root), this.renderItems(this.root), this.ctx.val;
    }, t4.outline.genIds_r = function(e2) {
      e2.id = t4.internal.newObjectDeferred();
      for (var r = 0; r < e2.children.length; r++) this.genIds_r(e2.children[r]);
    }, t4.outline.renderRoot = function(t5) {
      this.objStart(t5), this.line("/Type /Outlines"), t5.children.length > 0 && (this.line("/First " + this.makeRef(t5.children[0])), this.line("/Last " + this.makeRef(t5.children[t5.children.length - 1]))), this.line("/Count " + this.count_r({ count: 0 }, t5)), this.objEnd();
    }, t4.outline.renderItems = function(e2) {
      for (var r = this.ctx.pdf.internal.getVerticalCoordinateString, n2 = 0; n2 < e2.children.length; n2++) {
        var i2 = e2.children[n2];
        this.objStart(i2), this.line("/Title " + this.makeString(i2.title)), this.line("/Parent " + this.makeRef(e2)), n2 > 0 && this.line("/Prev " + this.makeRef(e2.children[n2 - 1])), n2 < e2.children.length - 1 && this.line("/Next " + this.makeRef(e2.children[n2 + 1])), i2.children.length > 0 && (this.line("/First " + this.makeRef(i2.children[0])), this.line("/Last " + this.makeRef(i2.children[i2.children.length - 1])));
        var a2 = this.count = this.count_r({ count: 0 }, i2);
        if (a2 > 0 && this.line("/Count " + a2), i2.options && i2.options.pageNumber) {
          var o2 = t4.internal.getPageInfo(i2.options.pageNumber);
          this.line("/Dest [" + o2.objId + " 0 R /XYZ 0 " + r(0) + " 0]");
        }
        this.objEnd();
      }
      for (var s2 = 0; s2 < e2.children.length; s2++) this.renderItems(e2.children[s2]);
    }, t4.outline.line = function(t5) {
      this.ctx.val += t5 + "\r\n";
    }, t4.outline.makeRef = function(t5) {
      return t5.id + " 0 R";
    }, t4.outline.makeString = function(e2) {
      return "(" + t4.internal.pdfEscape(e2) + ")";
    }, t4.outline.objStart = function(t5) {
      this.ctx.val += "\r\n" + t5.id + " 0 obj\r\n<<\r\n";
    }, t4.outline.objEnd = function() {
      this.ctx.val += ">> \r\nendobj\r\n";
    }, t4.outline.count_r = function(t5, e2) {
      for (var r = 0; r < e2.children.length; r++) t5.count++, this.count_r(t5, e2.children[r]);
      return t5.count;
    };
  }]);
}(E.API), /**
 * @license
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = [192, 193, 194, 195, 196, 197, 198, 199];
  t3.processJPEG = function(t4, r, n2, i2, a2, o2) {
    var s2, c2 = this.decode.DCT_DECODE, u2 = null;
    if ("string" == typeof t4 || this.__addimage__.isArrayBuffer(t4) || this.__addimage__.isArrayBufferView(t4)) {
      switch (t4 = a2 || t4, t4 = this.__addimage__.isArrayBuffer(t4) ? new Uint8Array(t4) : t4, (s2 = function(t5) {
        for (var r2, n3 = 256 * t5.charCodeAt(4) + t5.charCodeAt(5), i3 = t5.length, a3 = { width: 0, height: 0, numcomponents: 1 }, o3 = 4; o3 < i3; o3 += 2) {
          if (o3 += n3, -1 !== e.indexOf(t5.charCodeAt(o3 + 1))) {
            r2 = 256 * t5.charCodeAt(o3 + 5) + t5.charCodeAt(o3 + 6), a3 = { width: 256 * t5.charCodeAt(o3 + 7) + t5.charCodeAt(o3 + 8), height: r2, numcomponents: t5.charCodeAt(o3 + 9) };
            break;
          }
          n3 = 256 * t5.charCodeAt(o3 + 2) + t5.charCodeAt(o3 + 3);
        }
        return a3;
      }(t4 = this.__addimage__.isArrayBufferView(t4) ? this.__addimage__.arrayBufferToBinaryString(t4) : t4)).numcomponents) {
        case 1:
          o2 = this.color_spaces.DEVICE_GRAY;
          break;
        case 4:
          o2 = this.color_spaces.DEVICE_CMYK;
          break;
        case 3:
          o2 = this.color_spaces.DEVICE_RGB;
      }
      u2 = { data: t4, width: s2.width, height: s2.height, colorSpace: o2, bitsPerComponent: 8, filter: c2, index: r, alias: n2 };
    }
    return u2;
  };
}(E.API);
var Vt, Gt, Yt, Jt, Xt, Kt = function() {
  var t3, e, i2;
  function a2(t4) {
    var e2, r, n2, i3, a3, o3, s2, c2, u2, h2, l2, f2, d2, p2;
    for (this.data = t4, this.pos = 8, this.palette = [], this.imgData = [], this.transparency = {}, this.animation = null, this.text = {}, o3 = null; ; ) {
      switch (e2 = this.readUInt32(), u2 = (function() {
        var t5, e3;
        for (e3 = [], t5 = 0; t5 < 4; ++t5) e3.push(String.fromCharCode(this.data[this.pos++]));
        return e3;
      }).call(this).join("")) {
        case "IHDR":
          this.width = this.readUInt32(), this.height = this.readUInt32(), this.bits = this.data[this.pos++], this.colorType = this.data[this.pos++], this.compressionMethod = this.data[this.pos++], this.filterMethod = this.data[this.pos++], this.interlaceMethod = this.data[this.pos++];
          break;
        case "acTL":
          this.animation = { numFrames: this.readUInt32(), numPlays: this.readUInt32() || 1 / 0, frames: [] };
          break;
        case "PLTE":
          this.palette = this.read(e2);
          break;
        case "fcTL":
          o3 && this.animation.frames.push(o3), this.pos += 4, o3 = { width: this.readUInt32(), height: this.readUInt32(), xOffset: this.readUInt32(), yOffset: this.readUInt32() }, a3 = this.readUInt16(), i3 = this.readUInt16() || 100, o3.delay = 1e3 * a3 / i3, o3.disposeOp = this.data[this.pos++], o3.blendOp = this.data[this.pos++], o3.data = [];
          break;
        case "IDAT":
        case "fdAT":
          for ("fdAT" === u2 && (this.pos += 4, e2 -= 4), t4 = (null != o3 ? o3.data : void 0) || this.imgData, f2 = 0; 0 <= e2 ? f2 < e2 : f2 > e2; 0 <= e2 ? ++f2 : --f2) t4.push(this.data[this.pos++]);
          break;
        case "tRNS":
          switch (this.transparency = {}, this.colorType) {
            case 3:
              if (n2 = this.palette.length / 3, this.transparency.indexed = this.read(e2), this.transparency.indexed.length > n2) throw new Error("More transparent colors than palette size");
              if ((h2 = n2 - this.transparency.indexed.length) > 0) for (d2 = 0; 0 <= h2 ? d2 < h2 : d2 > h2; 0 <= h2 ? ++d2 : --d2) this.transparency.indexed.push(255);
              break;
            case 0:
              this.transparency.grayscale = this.read(e2)[0];
              break;
            case 2:
              this.transparency.rgb = this.read(e2);
          }
          break;
        case "tEXt":
          s2 = (l2 = this.read(e2)).indexOf(0), c2 = String.fromCharCode.apply(String, l2.slice(0, s2)), this.text[c2] = String.fromCharCode.apply(String, l2.slice(s2 + 1));
          break;
        case "IEND":
          return o3 && this.animation.frames.push(o3), this.colors = (function() {
            switch (this.colorType) {
              case 0:
              case 3:
              case 4:
                return 1;
              case 2:
              case 6:
                return 3;
            }
          }).call(this), this.hasAlphaChannel = 4 === (p2 = this.colorType) || 6 === p2, r = this.colors + (this.hasAlphaChannel ? 1 : 0), this.pixelBitlength = this.bits * r, this.colorSpace = (function() {
            switch (this.colors) {
              case 1:
                return "DeviceGray";
              case 3:
                return "DeviceRGB";
            }
          }).call(this), void (this.imgData = new Uint8Array(this.imgData));
        default:
          this.pos += e2;
      }
      if (this.pos += 4, this.pos > this.data.length) throw new Error("Incomplete or corrupt PNG file");
    }
  }
  a2.prototype.read = function(t4) {
    var e2, r;
    for (r = [], e2 = 0; 0 <= t4 ? e2 < t4 : e2 > t4; 0 <= t4 ? ++e2 : --e2) r.push(this.data[this.pos++]);
    return r;
  }, a2.prototype.readUInt32 = function() {
    return this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++];
  }, a2.prototype.readUInt16 = function() {
    return this.data[this.pos++] << 8 | this.data[this.pos++];
  }, a2.prototype.decodePixels = function(t4) {
    var e2 = this.pixelBitlength / 8, n2 = new Uint8Array(this.width * this.height * e2), i3 = 0, a3 = this;
    if (null == t4 && (t4 = this.imgData), 0 === t4.length) return new Uint8Array(0);
    function o3(r, o4, s2, c2) {
      var u2, h2, l2, f2, d2, p2, g2, m2, v2, b2, y2, w2, N2, L2, A2, x2, S2, _2, P2, k2, I2, F2 = Math.ceil((a3.width - r) / s2), C2 = Math.ceil((a3.height - o4) / c2), j2 = a3.width == F2 && a3.height == C2;
      for (L2 = e2 * F2, w2 = j2 ? n2 : new Uint8Array(L2 * C2), p2 = t4.length, N2 = 0, h2 = 0; N2 < C2 && i3 < p2; ) {
        switch (t4[i3++]) {
          case 0:
            for (f2 = S2 = 0; S2 < L2; f2 = S2 += 1) w2[h2++] = t4[i3++];
            break;
          case 1:
            for (f2 = _2 = 0; _2 < L2; f2 = _2 += 1) u2 = t4[i3++], d2 = f2 < e2 ? 0 : w2[h2 - e2], w2[h2++] = (u2 + d2) % 256;
            break;
          case 2:
            for (f2 = P2 = 0; P2 < L2; f2 = P2 += 1) u2 = t4[i3++], l2 = (f2 - f2 % e2) / e2, A2 = N2 && w2[(N2 - 1) * L2 + l2 * e2 + f2 % e2], w2[h2++] = (A2 + u2) % 256;
            break;
          case 3:
            for (f2 = k2 = 0; k2 < L2; f2 = k2 += 1) u2 = t4[i3++], l2 = (f2 - f2 % e2) / e2, d2 = f2 < e2 ? 0 : w2[h2 - e2], A2 = N2 && w2[(N2 - 1) * L2 + l2 * e2 + f2 % e2], w2[h2++] = (u2 + Math.floor((d2 + A2) / 2)) % 256;
            break;
          case 4:
            for (f2 = I2 = 0; I2 < L2; f2 = I2 += 1) u2 = t4[i3++], l2 = (f2 - f2 % e2) / e2, d2 = f2 < e2 ? 0 : w2[h2 - e2], 0 === N2 ? A2 = x2 = 0 : (A2 = w2[(N2 - 1) * L2 + l2 * e2 + f2 % e2], x2 = l2 && w2[(N2 - 1) * L2 + (l2 - 1) * e2 + f2 % e2]), g2 = d2 + A2 - x2, m2 = Math.abs(g2 - d2), b2 = Math.abs(g2 - A2), y2 = Math.abs(g2 - x2), v2 = m2 <= b2 && m2 <= y2 ? d2 : b2 <= y2 ? A2 : x2, w2[h2++] = (u2 + v2) % 256;
            break;
          default:
            throw new Error("Invalid filter algorithm: " + t4[i3 - 1]);
        }
        if (!j2) {
          var O2 = ((o4 + N2 * c2) * a3.width + r) * e2, B2 = N2 * L2;
          for (f2 = 0; f2 < F2; f2 += 1) {
            for (var M2 = 0; M2 < e2; M2 += 1) n2[O2++] = w2[B2++];
            O2 += (s2 - 1) * e2;
          }
        }
        N2++;
      }
    }
    return t4 = unzlibSync(t4), 1 == a3.interlaceMethod ? (o3(0, 0, 8, 8), o3(4, 0, 8, 8), o3(0, 4, 4, 8), o3(2, 0, 4, 4), o3(0, 2, 2, 4), o3(1, 0, 2, 2), o3(0, 1, 1, 2)) : o3(0, 0, 1, 1), n2;
  }, a2.prototype.decodePalette = function() {
    var t4, e2, r, n2, i3, a3, o3, s2, c2;
    for (r = this.palette, a3 = this.transparency.indexed || [], i3 = new Uint8Array((a3.length || 0) + r.length), n2 = 0, t4 = 0, e2 = o3 = 0, s2 = r.length; o3 < s2; e2 = o3 += 3) i3[n2++] = r[e2], i3[n2++] = r[e2 + 1], i3[n2++] = r[e2 + 2], i3[n2++] = null != (c2 = a3[t4++]) ? c2 : 255;
    return i3;
  }, a2.prototype.copyToImageData = function(t4, e2) {
    var r, n2, i3, a3, o3, s2, c2, u2, h2, l2, f2;
    if (n2 = this.colors, h2 = null, r = this.hasAlphaChannel, this.palette.length && (h2 = null != (f2 = this._decodedPalette) ? f2 : this._decodedPalette = this.decodePalette(), n2 = 4, r = true), u2 = (i3 = t4.data || t4).length, o3 = h2 || e2, a3 = s2 = 0, 1 === n2) for (; a3 < u2; ) c2 = h2 ? 4 * e2[a3 / 4] : s2, l2 = o3[c2++], i3[a3++] = l2, i3[a3++] = l2, i3[a3++] = l2, i3[a3++] = r ? o3[c2++] : 255, s2 = c2;
    else for (; a3 < u2; ) c2 = h2 ? 4 * e2[a3 / 4] : s2, i3[a3++] = o3[c2++], i3[a3++] = o3[c2++], i3[a3++] = o3[c2++], i3[a3++] = r ? o3[c2++] : 255, s2 = c2;
  }, a2.prototype.decode = function() {
    var t4;
    return t4 = new Uint8Array(this.width * this.height * 4), this.copyToImageData(t4, this.decodePixels()), t4;
  };
  var o2 = function() {
    if ("[object Window]" === Object.prototype.toString.call(n)) {
      try {
        e = n.document.createElement("canvas"), i2 = e.getContext("2d");
      } catch (t4) {
        return false;
      }
      return true;
    }
    return false;
  };
  return o2(), t3 = function(t4) {
    var r;
    if (true === o2()) return i2.width = t4.width, i2.height = t4.height, i2.clearRect(0, 0, t4.width, t4.height), i2.putImageData(t4, 0, 0), (r = new Image()).src = e.toDataURL(), r;
    throw new Error("This method requires a Browser with Canvas-capability.");
  }, a2.prototype.decodeFrames = function(e2) {
    var r, n2, i3, a3, o3, s2, c2, u2;
    if (this.animation) {
      for (u2 = [], n2 = o3 = 0, s2 = (c2 = this.animation.frames).length; o3 < s2; n2 = ++o3) r = c2[n2], i3 = e2.createImageData(r.width, r.height), a3 = this.decodePixels(new Uint8Array(r.data)), this.copyToImageData(i3, a3), r.imageData = i3, u2.push(r.image = t3(i3));
      return u2;
    }
  }, a2.prototype.renderFrame = function(t4, e2) {
    var r, n2, i3;
    return r = (n2 = this.animation.frames)[e2], i3 = n2[e2 - 1], 0 === e2 && t4.clearRect(0, 0, this.width, this.height), 1 === (null != i3 ? i3.disposeOp : void 0) ? t4.clearRect(i3.xOffset, i3.yOffset, i3.width, i3.height) : 2 === (null != i3 ? i3.disposeOp : void 0) && t4.putImageData(i3.imageData, i3.xOffset, i3.yOffset), 0 === r.blendOp && t4.clearRect(r.xOffset, r.yOffset, r.width, r.height), t4.drawImage(r.image, r.xOffset, r.yOffset);
  }, a2.prototype.animate = function(t4) {
    var e2, r, n2, i3, a3, o3, s2 = this;
    return r = 0, o3 = this.animation, i3 = o3.numFrames, n2 = o3.frames, a3 = o3.numPlays, (e2 = function() {
      var o4, c2;
      if (o4 = r++ % i3, c2 = n2[o4], s2.renderFrame(t4, o4), i3 > 1 && r / i3 < a3) return s2.animation._timeout = setTimeout(e2, c2.delay);
    })();
  }, a2.prototype.stopAnimation = function() {
    var t4;
    return clearTimeout(null != (t4 = this.animation) ? t4._timeout : void 0);
  }, a2.prototype.render = function(t4) {
    var e2, r;
    return t4._png && t4._png.stopAnimation(), t4._png = this, t4.width = this.width, t4.height = this.height, e2 = t4.getContext("2d"), this.animation ? (this.decodeFrames(e2), this.animate(e2)) : (r = e2.createImageData(this.width, this.height), this.copyToImageData(r, this.decodePixels()), e2.putImageData(r, 0, 0));
  }, a2;
}();
/**
 * @license
 *
 * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */
/**
 * @license
 * (c) Dean McNamee <dean@gmail.com>, 2013.
 *
 * https://github.com/deanm/omggif
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
 * including animation and compression.  It does not rely on any specific
 * underlying system, so should run in the browser, Node, or Plask.
 */
function Zt(t3) {
  var e = 0;
  if (71 !== t3[e++] || 73 !== t3[e++] || 70 !== t3[e++] || 56 !== t3[e++] || 56 != (t3[e++] + 1 & 253) || 97 !== t3[e++]) throw new Error("Invalid GIF 87a/89a header.");
  var r = t3[e++] | t3[e++] << 8, n2 = t3[e++] | t3[e++] << 8, i2 = t3[e++], a2 = i2 >> 7, o2 = 1 << (7 & i2) + 1;
  t3[e++];
  t3[e++];
  var s2 = null, c2 = null;
  a2 && (s2 = e, c2 = o2, e += 3 * o2);
  var u2 = true, h2 = [], l2 = 0, f2 = null, d2 = 0, p2 = null;
  for (this.width = r, this.height = n2; u2 && e < t3.length; ) switch (t3[e++]) {
    case 33:
      switch (t3[e++]) {
        case 255:
          if (11 !== t3[e] || 78 == t3[e + 1] && 69 == t3[e + 2] && 84 == t3[e + 3] && 83 == t3[e + 4] && 67 == t3[e + 5] && 65 == t3[e + 6] && 80 == t3[e + 7] && 69 == t3[e + 8] && 50 == t3[e + 9] && 46 == t3[e + 10] && 48 == t3[e + 11] && 3 == t3[e + 12] && 1 == t3[e + 13] && 0 == t3[e + 16]) e += 14, p2 = t3[e++] | t3[e++] << 8, e++;
          else for (e += 12; ; ) {
            if (!((P2 = t3[e++]) >= 0)) throw Error("Invalid block size");
            if (0 === P2) break;
            e += P2;
          }
          break;
        case 249:
          if (4 !== t3[e++] || 0 !== t3[e + 4]) throw new Error("Invalid graphics extension block.");
          var g2 = t3[e++];
          l2 = t3[e++] | t3[e++] << 8, f2 = t3[e++], 0 == (1 & g2) && (f2 = null), d2 = g2 >> 2 & 7, e++;
          break;
        case 254:
          for (; ; ) {
            if (!((P2 = t3[e++]) >= 0)) throw Error("Invalid block size");
            if (0 === P2) break;
            e += P2;
          }
          break;
        default:
          throw new Error("Unknown graphic control label: 0x" + t3[e - 1].toString(16));
      }
      break;
    case 44:
      var m2 = t3[e++] | t3[e++] << 8, v2 = t3[e++] | t3[e++] << 8, b2 = t3[e++] | t3[e++] << 8, y2 = t3[e++] | t3[e++] << 8, w2 = t3[e++], N2 = w2 >> 6 & 1, L2 = 1 << (7 & w2) + 1, A2 = s2, x2 = c2, S2 = false;
      if (w2 >> 7) {
        S2 = true;
        A2 = e, x2 = L2, e += 3 * L2;
      }
      var _2 = e;
      for (e++; ; ) {
        var P2;
        if (!((P2 = t3[e++]) >= 0)) throw Error("Invalid block size");
        if (0 === P2) break;
        e += P2;
      }
      h2.push({ x: m2, y: v2, width: b2, height: y2, has_local_palette: S2, palette_offset: A2, palette_size: x2, data_offset: _2, data_length: e - _2, transparent_index: f2, interlaced: !!N2, delay: l2, disposal: d2 });
      break;
    case 59:
      u2 = false;
      break;
    default:
      throw new Error("Unknown gif block: 0x" + t3[e - 1].toString(16));
  }
  this.numFrames = function() {
    return h2.length;
  }, this.loopCount = function() {
    return p2;
  }, this.frameInfo = function(t4) {
    if (t4 < 0 || t4 >= h2.length) throw new Error("Frame index out of range.");
    return h2[t4];
  }, this.decodeAndBlitFrameBGRA = function(e2, n3) {
    var i3 = this.frameInfo(e2), a3 = i3.width * i3.height, o3 = new Uint8Array(a3);
    $t(t3, i3.data_offset, o3, a3);
    var s3 = i3.palette_offset, c3 = i3.transparent_index;
    null === c3 && (c3 = 256);
    var u3 = i3.width, h3 = r - u3, l3 = u3, f3 = 4 * (i3.y * r + i3.x), d3 = 4 * ((i3.y + i3.height) * r + i3.x), p3 = f3, g3 = 4 * h3;
    true === i3.interlaced && (g3 += 4 * r * 7);
    for (var m3 = 8, v3 = 0, b3 = o3.length; v3 < b3; ++v3) {
      var y3 = o3[v3];
      if (0 === l3 && (l3 = u3, (p3 += g3) >= d3 && (g3 = 4 * h3 + 4 * r * (m3 - 1), p3 = f3 + (u3 + h3) * (m3 << 1), m3 >>= 1)), y3 === c3) p3 += 4;
      else {
        var w3 = t3[s3 + 3 * y3], N3 = t3[s3 + 3 * y3 + 1], L3 = t3[s3 + 3 * y3 + 2];
        n3[p3++] = L3, n3[p3++] = N3, n3[p3++] = w3, n3[p3++] = 255;
      }
      --l3;
    }
  }, this.decodeAndBlitFrameRGBA = function(e2, n3) {
    var i3 = this.frameInfo(e2), a3 = i3.width * i3.height, o3 = new Uint8Array(a3);
    $t(t3, i3.data_offset, o3, a3);
    var s3 = i3.palette_offset, c3 = i3.transparent_index;
    null === c3 && (c3 = 256);
    var u3 = i3.width, h3 = r - u3, l3 = u3, f3 = 4 * (i3.y * r + i3.x), d3 = 4 * ((i3.y + i3.height) * r + i3.x), p3 = f3, g3 = 4 * h3;
    true === i3.interlaced && (g3 += 4 * r * 7);
    for (var m3 = 8, v3 = 0, b3 = o3.length; v3 < b3; ++v3) {
      var y3 = o3[v3];
      if (0 === l3 && (l3 = u3, (p3 += g3) >= d3 && (g3 = 4 * h3 + 4 * r * (m3 - 1), p3 = f3 + (u3 + h3) * (m3 << 1), m3 >>= 1)), y3 === c3) p3 += 4;
      else {
        var w3 = t3[s3 + 3 * y3], N3 = t3[s3 + 3 * y3 + 1], L3 = t3[s3 + 3 * y3 + 2];
        n3[p3++] = w3, n3[p3++] = N3, n3[p3++] = L3, n3[p3++] = 255;
      }
      --l3;
    }
  };
}
function $t(t3, e, r, n2) {
  for (var i2 = t3[e++], o2 = 1 << i2, s2 = o2 + 1, c2 = s2 + 1, u2 = i2 + 1, h2 = (1 << u2) - 1, l2 = 0, f2 = 0, d2 = 0, p2 = t3[e++], g2 = new Int32Array(4096), m2 = null; ; ) {
    for (; l2 < 16 && 0 !== p2; ) f2 |= t3[e++] << l2, l2 += 8, 1 === p2 ? p2 = t3[e++] : --p2;
    if (l2 < u2) break;
    var v2 = f2 & h2;
    if (f2 >>= u2, l2 -= u2, v2 !== o2) {
      if (v2 === s2) break;
      for (var b2 = v2 < c2 ? v2 : m2, y2 = 0, w2 = b2; w2 > o2; ) w2 = g2[w2] >> 8, ++y2;
      var N2 = w2;
      if (d2 + y2 + (b2 !== v2 ? 1 : 0) > n2) return void a.log("Warning, gif stream longer than expected.");
      r[d2++] = N2;
      var L2 = d2 += y2;
      for (b2 !== v2 && (r[d2++] = N2), w2 = b2; y2--; ) w2 = g2[w2], r[--L2] = 255 & w2, w2 >>= 8;
      null !== m2 && c2 < 4096 && (g2[c2++] = m2 << 8 | N2, c2 >= h2 + 1 && u2 < 12 && (++u2, h2 = h2 << 1 | 1)), m2 = v2;
    } else c2 = s2 + 1, h2 = (1 << (u2 = i2 + 1)) - 1, m2 = null;
  }
  return d2 !== n2 && a.log("Warning, gif stream shorter than expected."), r;
}
/**
 * @license
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function Qt(t3) {
  var e, r, n2, i2, a2, o2 = Math.floor, s2 = new Array(64), c2 = new Array(64), u2 = new Array(64), h2 = new Array(64), l2 = new Array(65535), f2 = new Array(65535), d2 = new Array(64), p2 = new Array(64), g2 = [], m2 = 0, v2 = 7, b2 = new Array(64), y2 = new Array(64), w2 = new Array(64), N2 = new Array(256), L2 = new Array(2048), A2 = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63], x2 = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], S2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], _2 = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125], P2 = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250], k2 = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], I2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], F2 = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119], C2 = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];
  function j2(t4, e2) {
    for (var r2 = 0, n3 = 0, i3 = new Array(), a3 = 1; a3 <= 16; a3++) {
      for (var o3 = 1; o3 <= t4[a3]; o3++) i3[e2[n3]] = [], i3[e2[n3]][0] = r2, i3[e2[n3]][1] = a3, n3++, r2++;
      r2 *= 2;
    }
    return i3;
  }
  function O2(t4) {
    for (var e2 = t4[0], r2 = t4[1] - 1; r2 >= 0; ) e2 & 1 << r2 && (m2 |= 1 << v2), r2--, --v2 < 0 && (255 == m2 ? (B2(255), B2(0)) : B2(m2), v2 = 7, m2 = 0);
  }
  function B2(t4) {
    g2.push(t4);
  }
  function M2(t4) {
    B2(t4 >> 8 & 255), B2(255 & t4);
  }
  function E2(t4, e2, r2, n3, i3) {
    for (var a3, o3 = i3[0], s3 = i3[240], c3 = function(t5, e3) {
      var r3, n4, i4, a4, o4, s4, c4, u4, h4, l3, f3 = 0;
      for (h4 = 0; h4 < 8; ++h4) {
        r3 = t5[f3], n4 = t5[f3 + 1], i4 = t5[f3 + 2], a4 = t5[f3 + 3], o4 = t5[f3 + 4], s4 = t5[f3 + 5], c4 = t5[f3 + 6];
        var p3 = r3 + (u4 = t5[f3 + 7]), g4 = r3 - u4, m4 = n4 + c4, v4 = n4 - c4, b4 = i4 + s4, y4 = i4 - s4, w4 = a4 + o4, N3 = a4 - o4, L3 = p3 + w4, A3 = p3 - w4, x3 = m4 + b4, S3 = m4 - b4;
        t5[f3] = L3 + x3, t5[f3 + 4] = L3 - x3;
        var _3 = 0.707106781 * (S3 + A3);
        t5[f3 + 2] = A3 + _3, t5[f3 + 6] = A3 - _3;
        var P3 = 0.382683433 * ((L3 = N3 + y4) - (S3 = v4 + g4)), k3 = 0.5411961 * L3 + P3, I3 = 1.306562965 * S3 + P3, F3 = 0.707106781 * (x3 = y4 + v4), C3 = g4 + F3, j3 = g4 - F3;
        t5[f3 + 5] = j3 + k3, t5[f3 + 3] = j3 - k3, t5[f3 + 1] = C3 + I3, t5[f3 + 7] = C3 - I3, f3 += 8;
      }
      for (f3 = 0, h4 = 0; h4 < 8; ++h4) {
        r3 = t5[f3], n4 = t5[f3 + 8], i4 = t5[f3 + 16], a4 = t5[f3 + 24], o4 = t5[f3 + 32], s4 = t5[f3 + 40], c4 = t5[f3 + 48];
        var O3 = r3 + (u4 = t5[f3 + 56]), B3 = r3 - u4, M3 = n4 + c4, E3 = n4 - c4, q3 = i4 + s4, D2 = i4 - s4, R2 = a4 + o4, T2 = a4 - o4, U2 = O3 + R2, z2 = O3 - R2, H2 = M3 + q3, W2 = M3 - q3;
        t5[f3] = U2 + H2, t5[f3 + 32] = U2 - H2;
        var V2 = 0.707106781 * (W2 + z2);
        t5[f3 + 16] = z2 + V2, t5[f3 + 48] = z2 - V2;
        var G2 = 0.382683433 * ((U2 = T2 + D2) - (W2 = E3 + B3)), Y2 = 0.5411961 * U2 + G2, J2 = 1.306562965 * W2 + G2, X2 = 0.707106781 * (H2 = D2 + E3), K2 = B3 + X2, Z2 = B3 - X2;
        t5[f3 + 40] = Z2 + Y2, t5[f3 + 24] = Z2 - Y2, t5[f3 + 8] = K2 + J2, t5[f3 + 56] = K2 - J2, f3++;
      }
      for (h4 = 0; h4 < 64; ++h4) l3 = t5[h4] * e3[h4], d2[h4] = l3 > 0 ? l3 + 0.5 | 0 : l3 - 0.5 | 0;
      return d2;
    }(t4, e2), u3 = 0; u3 < 64; ++u3) p2[A2[u3]] = c3[u3];
    var h3 = p2[0] - r2;
    r2 = p2[0], 0 == h3 ? O2(n3[0]) : (O2(n3[f2[a3 = 32767 + h3]]), O2(l2[a3]));
    for (var g3 = 63; g3 > 0 && 0 == p2[g3]; ) g3--;
    if (0 == g3) return O2(o3), r2;
    for (var m3, v3 = 1; v3 <= g3; ) {
      for (var b3 = v3; 0 == p2[v3] && v3 <= g3; ) ++v3;
      var y3 = v3 - b3;
      if (y3 >= 16) {
        m3 = y3 >> 4;
        for (var w3 = 1; w3 <= m3; ++w3) O2(s3);
        y3 &= 15;
      }
      a3 = 32767 + p2[v3], O2(i3[(y3 << 4) + f2[a3]]), O2(l2[a3]), v3++;
    }
    return 63 != g3 && O2(o3), r2;
  }
  function q2(t4) {
    (t4 = Math.min(Math.max(t4, 1), 100), a2 != t4) && (!function(t5) {
      for (var e2 = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99], r2 = 0; r2 < 64; r2++) {
        var n3 = o2((e2[r2] * t5 + 50) / 100);
        n3 = Math.min(Math.max(n3, 1), 255), s2[A2[r2]] = n3;
      }
      for (var i3 = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], a3 = 0; a3 < 64; a3++) {
        var l3 = o2((i3[a3] * t5 + 50) / 100);
        l3 = Math.min(Math.max(l3, 1), 255), c2[A2[a3]] = l3;
      }
      for (var f3 = [1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958, 0.5411961, 0.275899379], d3 = 0, p3 = 0; p3 < 8; p3++) for (var g3 = 0; g3 < 8; g3++) u2[d3] = 1 / (s2[A2[d3]] * f3[p3] * f3[g3] * 8), h2[d3] = 1 / (c2[A2[d3]] * f3[p3] * f3[g3] * 8), d3++;
    }(t4 < 50 ? Math.floor(5e3 / t4) : Math.floor(200 - 2 * t4)), a2 = t4);
  }
  this.encode = function(t4, a3) {
    a3 && q2(a3), g2 = new Array(), m2 = 0, v2 = 7, M2(65496), M2(65504), M2(16), B2(74), B2(70), B2(73), B2(70), B2(0), B2(1), B2(1), B2(0), M2(1), M2(1), B2(0), B2(0), function() {
      M2(65499), M2(132), B2(0);
      for (var t5 = 0; t5 < 64; t5++) B2(s2[t5]);
      B2(1);
      for (var e2 = 0; e2 < 64; e2++) B2(c2[e2]);
    }(), function(t5, e2) {
      M2(65472), M2(17), B2(8), M2(e2), M2(t5), B2(3), B2(1), B2(17), B2(0), B2(2), B2(17), B2(1), B2(3), B2(17), B2(1);
    }(t4.width, t4.height), function() {
      M2(65476), M2(418), B2(0);
      for (var t5 = 0; t5 < 16; t5++) B2(x2[t5 + 1]);
      for (var e2 = 0; e2 <= 11; e2++) B2(S2[e2]);
      B2(16);
      for (var r2 = 0; r2 < 16; r2++) B2(_2[r2 + 1]);
      for (var n3 = 0; n3 <= 161; n3++) B2(P2[n3]);
      B2(1);
      for (var i3 = 0; i3 < 16; i3++) B2(k2[i3 + 1]);
      for (var a4 = 0; a4 <= 11; a4++) B2(I2[a4]);
      B2(17);
      for (var o4 = 0; o4 < 16; o4++) B2(F2[o4 + 1]);
      for (var s3 = 0; s3 <= 161; s3++) B2(C2[s3]);
    }(), M2(65498), M2(12), B2(3), B2(1), B2(0), B2(2), B2(17), B2(3), B2(17), B2(0), B2(63), B2(0);
    var o3 = 0, l3 = 0, f3 = 0;
    m2 = 0, v2 = 7, this.encode.displayName = "_encode_";
    for (var d3, p3, N3, A3, j3, D2, R2, T2, U2, z2 = t4.data, H2 = t4.width, W2 = t4.height, V2 = 4 * H2, G2 = 0; G2 < W2; ) {
      for (d3 = 0; d3 < V2; ) {
        for (j3 = V2 * G2 + d3, R2 = -1, T2 = 0, U2 = 0; U2 < 64; U2++) D2 = j3 + (T2 = U2 >> 3) * V2 + (R2 = 4 * (7 & U2)), G2 + T2 >= W2 && (D2 -= V2 * (G2 + 1 + T2 - W2)), d3 + R2 >= V2 && (D2 -= d3 + R2 - V2 + 4), p3 = z2[D2++], N3 = z2[D2++], A3 = z2[D2++], b2[U2] = (L2[p3] + L2[N3 + 256 >> 0] + L2[A3 + 512 >> 0] >> 16) - 128, y2[U2] = (L2[p3 + 768 >> 0] + L2[N3 + 1024 >> 0] + L2[A3 + 1280 >> 0] >> 16) - 128, w2[U2] = (L2[p3 + 1280 >> 0] + L2[N3 + 1536 >> 0] + L2[A3 + 1792 >> 0] >> 16) - 128;
        o3 = E2(b2, u2, o3, e, n2), l3 = E2(y2, h2, l3, r, i2), f3 = E2(w2, h2, f3, r, i2), d3 += 32;
      }
      G2 += 8;
    }
    if (v2 >= 0) {
      var Y2 = [];
      Y2[1] = v2 + 1, Y2[0] = (1 << v2 + 1) - 1, O2(Y2);
    }
    return M2(65497), new Uint8Array(g2);
  }, t3 = t3 || 50, function() {
    for (var t4 = String.fromCharCode, e2 = 0; e2 < 256; e2++) N2[e2] = t4(e2);
  }(), e = j2(x2, S2), r = j2(k2, I2), n2 = j2(_2, P2), i2 = j2(F2, C2), function() {
    for (var t4 = 1, e2 = 2, r2 = 1; r2 <= 15; r2++) {
      for (var n3 = t4; n3 < e2; n3++) f2[32767 + n3] = r2, l2[32767 + n3] = [], l2[32767 + n3][1] = r2, l2[32767 + n3][0] = n3;
      for (var i3 = -(e2 - 1); i3 <= -t4; i3++) f2[32767 + i3] = r2, l2[32767 + i3] = [], l2[32767 + i3][1] = r2, l2[32767 + i3][0] = e2 - 1 + i3;
      t4 <<= 1, e2 <<= 1;
    }
  }(), function() {
    for (var t4 = 0; t4 < 256; t4++) L2[t4] = 19595 * t4, L2[t4 + 256 >> 0] = 38470 * t4, L2[t4 + 512 >> 0] = 7471 * t4 + 32768, L2[t4 + 768 >> 0] = -11059 * t4, L2[t4 + 1024 >> 0] = -21709 * t4, L2[t4 + 1280 >> 0] = 32768 * t4 + 8421375, L2[t4 + 1536 >> 0] = -27439 * t4, L2[t4 + 1792 >> 0] = -5329 * t4;
  }(), q2(t3);
}
/**
 * @license
 * Copyright (c) 2017 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function te(t3, e) {
  if (this.pos = 0, this.buffer = t3, this.datav = new DataView(t3.buffer), this.is_with_alpha = !!e, this.bottom_up = true, this.flag = String.fromCharCode(this.buffer[0]) + String.fromCharCode(this.buffer[1]), this.pos += 2, -1 === ["BM", "BA", "CI", "CP", "IC", "PT"].indexOf(this.flag)) throw new Error("Invalid BMP File");
  this.parseHeader(), this.parseBGR();
}
function ee(t3) {
  function e(t4) {
    if (!t4) throw Error("assert :P");
  }
  function r(t4, e2, r2) {
    for (var n3 = 0; 4 > n3; n3++) if (t4[e2 + n3] != r2.charCodeAt(n3)) return true;
    return false;
  }
  function n2(t4, e2, r2, n3, i3) {
    for (var a3 = 0; a3 < i3; a3++) t4[e2 + a3] = r2[n3 + a3];
  }
  function i2(t4, e2, r2, n3) {
    for (var i3 = 0; i3 < n3; i3++) t4[e2 + i3] = r2;
  }
  function a2(t4) {
    return new Int32Array(t4);
  }
  function o2(t4, e2) {
    for (var r2 = [], n3 = 0; n3 < t4; n3++) r2.push(new e2());
    return r2;
  }
  function s2(t4, e2) {
    var r2 = [];
    return function t5(r3, n3, i3) {
      for (var a3 = i3[n3], o3 = 0; o3 < a3 && (r3.push(i3.length > n3 + 1 ? [] : new e2()), !(i3.length < n3 + 1)); o3++) t5(r3[o3], n3 + 1, i3);
    }(r2, 0, t4), r2;
  }
  var c2 = function() {
    var t4 = this;
    function c3(t5, e2) {
      for (var r2 = 1 << e2 - 1 >>> 0; t5 & r2; ) r2 >>>= 1;
      return r2 ? (t5 & r2 - 1) + r2 : t5;
    }
    function u3(t5, r2, n3, i3, a3) {
      e(!(i3 % n3));
      do {
        t5[r2 + (i3 -= n3)] = a3;
      } while (0 < i3);
    }
    function h3(t5, r2, n3, i3, o3) {
      if (e(2328 >= o3), 512 >= o3) var s3 = a2(512);
      else if (null == (s3 = a2(o3))) return 0;
      return function(t6, r3, n4, i4, o4, s4) {
        var h4, f4, d4 = r3, p4 = 1 << n4, g4 = a2(16), m4 = a2(16);
        for (e(0 != o4), e(null != i4), e(null != t6), e(0 < n4), f4 = 0; f4 < o4; ++f4) {
          if (15 < i4[f4]) return 0;
          ++g4[i4[f4]];
        }
        if (g4[0] == o4) return 0;
        for (m4[1] = 0, h4 = 1; 15 > h4; ++h4) {
          if (g4[h4] > 1 << h4) return 0;
          m4[h4 + 1] = m4[h4] + g4[h4];
        }
        for (f4 = 0; f4 < o4; ++f4) h4 = i4[f4], 0 < i4[f4] && (s4[m4[h4]++] = f4);
        if (1 == m4[15]) return (i4 = new l3()).g = 0, i4.value = s4[0], u3(t6, d4, 1, p4, i4), p4;
        var v4, b4 = -1, y4 = p4 - 1, w4 = 0, N4 = 1, L4 = 1, A4 = 1 << n4;
        for (f4 = 0, h4 = 1, o4 = 2; h4 <= n4; ++h4, o4 <<= 1) {
          if (N4 += L4 <<= 1, 0 > (L4 -= g4[h4])) return 0;
          for (; 0 < g4[h4]; --g4[h4]) (i4 = new l3()).g = h4, i4.value = s4[f4++], u3(t6, d4 + w4, o4, A4, i4), w4 = c3(w4, h4);
        }
        for (h4 = n4 + 1, o4 = 2; 15 >= h4; ++h4, o4 <<= 1) {
          if (N4 += L4 <<= 1, 0 > (L4 -= g4[h4])) return 0;
          for (; 0 < g4[h4]; --g4[h4]) {
            if (i4 = new l3(), (w4 & y4) != b4) {
              for (d4 += A4, v4 = 1 << (b4 = h4) - n4; 15 > b4 && !(0 >= (v4 -= g4[b4])); ) ++b4, v4 <<= 1;
              p4 += A4 = 1 << (v4 = b4 - n4), t6[r3 + (b4 = w4 & y4)].g = v4 + n4, t6[r3 + b4].value = d4 - r3 - b4;
            }
            i4.g = h4 - n4, i4.value = s4[f4++], u3(t6, d4 + (w4 >> n4), o4, A4, i4), w4 = c3(w4, h4);
          }
        }
        return N4 != 2 * m4[15] - 1 ? 0 : p4;
      }(t5, r2, n3, i3, o3, s3);
    }
    function l3() {
      this.value = this.g = 0;
    }
    function f3() {
      this.value = this.g = 0;
    }
    function d3() {
      this.G = o2(5, l3), this.H = a2(5), this.jc = this.Qb = this.qb = this.nd = 0, this.pd = o2(Dr, f3);
    }
    function p3(t5, r2, n3, i3) {
      e(null != t5), e(null != r2), e(2147483648 > i3), t5.Ca = 254, t5.I = 0, t5.b = -8, t5.Ka = 0, t5.oa = r2, t5.pa = n3, t5.Jd = r2, t5.Yc = n3 + i3, t5.Zc = 4 <= i3 ? n3 + i3 - 4 + 1 : n3, _2(t5);
    }
    function g3(t5, e2) {
      for (var r2 = 0; 0 < e2--; ) r2 |= k2(t5, 128) << e2;
      return r2;
    }
    function m3(t5, e2) {
      var r2 = g3(t5, e2);
      return P2(t5) ? -r2 : r2;
    }
    function v3(t5, r2, n3, i3) {
      var a3, o3 = 0;
      for (e(null != t5), e(null != r2), e(4294967288 > i3), t5.Sb = i3, t5.Ra = 0, t5.u = 0, t5.h = 0, 4 < i3 && (i3 = 4), a3 = 0; a3 < i3; ++a3) o3 += r2[n3 + a3] << 8 * a3;
      t5.Ra = o3, t5.bb = i3, t5.oa = r2, t5.pa = n3;
    }
    function b3(t5) {
      for (; 8 <= t5.u && t5.bb < t5.Sb; ) t5.Ra >>>= 8, t5.Ra += t5.oa[t5.pa + t5.bb] << Ur - 8 >>> 0, ++t5.bb, t5.u -= 8;
      A3(t5) && (t5.h = 1, t5.u = 0);
    }
    function y3(t5, r2) {
      if (e(0 <= r2), !t5.h && r2 <= Tr) {
        var n3 = L3(t5) & Rr[r2];
        return t5.u += r2, b3(t5), n3;
      }
      return t5.h = 1, t5.u = 0;
    }
    function w3() {
      this.b = this.Ca = this.I = 0, this.oa = [], this.pa = 0, this.Jd = [], this.Yc = 0, this.Zc = [], this.Ka = 0;
    }
    function N3() {
      this.Ra = 0, this.oa = [], this.h = this.u = this.bb = this.Sb = this.pa = 0;
    }
    function L3(t5) {
      return t5.Ra >>> (t5.u & Ur - 1) >>> 0;
    }
    function A3(t5) {
      return e(t5.bb <= t5.Sb), t5.h || t5.bb == t5.Sb && t5.u > Ur;
    }
    function x2(t5, e2) {
      t5.u = e2, t5.h = A3(t5);
    }
    function S2(t5) {
      t5.u >= zr && (e(t5.u >= zr), b3(t5));
    }
    function _2(t5) {
      e(null != t5 && null != t5.oa), t5.pa < t5.Zc ? (t5.I = (t5.oa[t5.pa++] | t5.I << 8) >>> 0, t5.b += 8) : (e(null != t5 && null != t5.oa), t5.pa < t5.Yc ? (t5.b += 8, t5.I = t5.oa[t5.pa++] | t5.I << 8) : t5.Ka ? t5.b = 0 : (t5.I <<= 8, t5.b += 8, t5.Ka = 1));
    }
    function P2(t5) {
      return g3(t5, 1);
    }
    function k2(t5, e2) {
      var r2 = t5.Ca;
      0 > t5.b && _2(t5);
      var n3 = t5.b, i3 = r2 * e2 >>> 8, a3 = (t5.I >>> n3 > i3) + 0;
      for (a3 ? (r2 -= i3, t5.I -= i3 + 1 << n3 >>> 0) : r2 = i3 + 1, n3 = r2, i3 = 0; 256 <= n3; ) i3 += 8, n3 >>= 8;
      return n3 = 7 ^ i3 + Hr[n3], t5.b -= n3, t5.Ca = (r2 << n3) - 1, a3;
    }
    function I2(t5, e2, r2) {
      t5[e2 + 0] = r2 >> 24 & 255, t5[e2 + 1] = r2 >> 16 & 255, t5[e2 + 2] = r2 >> 8 & 255, t5[e2 + 3] = r2 >> 0 & 255;
    }
    function F2(t5, e2) {
      return t5[e2 + 0] << 0 | t5[e2 + 1] << 8;
    }
    function C2(t5, e2) {
      return F2(t5, e2) | t5[e2 + 2] << 16;
    }
    function j2(t5, e2) {
      return F2(t5, e2) | F2(t5, e2 + 2) << 16;
    }
    function O2(t5, r2) {
      var n3 = 1 << r2;
      return e(null != t5), e(0 < r2), t5.X = a2(n3), null == t5.X ? 0 : (t5.Mb = 32 - r2, t5.Xa = r2, 1);
    }
    function B2(t5, r2) {
      e(null != t5), e(null != r2), e(t5.Xa == r2.Xa), n2(r2.X, 0, t5.X, 0, 1 << r2.Xa);
    }
    function M2() {
      this.X = [], this.Xa = this.Mb = 0;
    }
    function E2(t5, r2, n3, i3) {
      e(null != n3), e(null != i3);
      var a3 = n3[0], o3 = i3[0];
      return 0 == a3 && (a3 = (t5 * o3 + r2 / 2) / r2), 0 == o3 && (o3 = (r2 * a3 + t5 / 2) / t5), 0 >= a3 || 0 >= o3 ? 0 : (n3[0] = a3, i3[0] = o3, 1);
    }
    function q2(t5, e2) {
      return t5 + (1 << e2) - 1 >>> e2;
    }
    function D2(t5, e2) {
      return ((4278255360 & t5) + (4278255360 & e2) >>> 0 & 4278255360) + ((16711935 & t5) + (16711935 & e2) >>> 0 & 16711935) >>> 0;
    }
    function R2(e2, r2) {
      t4[r2] = function(r3, n3, i3, a3, o3, s3, c4) {
        var u4;
        for (u4 = 0; u4 < o3; ++u4) {
          var h4 = t4[e2](s3[c4 + u4 - 1], i3, a3 + u4);
          s3[c4 + u4] = D2(r3[n3 + u4], h4);
        }
      };
    }
    function T2() {
      this.ud = this.hd = this.jd = 0;
    }
    function U2(t5, e2) {
      return ((4278124286 & (t5 ^ e2)) >>> 1) + (t5 & e2) >>> 0;
    }
    function z2(t5) {
      return 0 <= t5 && 256 > t5 ? t5 : 0 > t5 ? 0 : 255 < t5 ? 255 : void 0;
    }
    function H2(t5, e2) {
      return z2(t5 + (t5 - e2 + 0.5 >> 1));
    }
    function W2(t5, e2, r2) {
      return Math.abs(e2 - r2) - Math.abs(t5 - r2);
    }
    function V2(t5, e2, r2, n3, i3, a3, o3) {
      for (n3 = a3[o3 - 1], r2 = 0; r2 < i3; ++r2) a3[o3 + r2] = n3 = D2(t5[e2 + r2], n3);
    }
    function G2(t5, e2, r2, n3, i3) {
      var a3;
      for (a3 = 0; a3 < r2; ++a3) {
        var o3 = t5[e2 + a3], s3 = o3 >> 8 & 255, c4 = 16711935 & (c4 = (c4 = 16711935 & o3) + ((s3 << 16) + s3));
        n3[i3 + a3] = (4278255360 & o3) + c4 >>> 0;
      }
    }
    function Y2(t5, e2) {
      e2.jd = t5 >> 0 & 255, e2.hd = t5 >> 8 & 255, e2.ud = t5 >> 16 & 255;
    }
    function J2(t5, e2, r2, n3, i3, a3) {
      var o3;
      for (o3 = 0; o3 < n3; ++o3) {
        var s3 = e2[r2 + o3], c4 = s3 >>> 8, u4 = s3, h4 = 255 & (h4 = (h4 = s3 >>> 16) + ((t5.jd << 24 >> 24) * (c4 << 24 >> 24) >>> 5));
        u4 = 255 & (u4 = (u4 = u4 + ((t5.hd << 24 >> 24) * (c4 << 24 >> 24) >>> 5)) + ((t5.ud << 24 >> 24) * (h4 << 24 >> 24) >>> 5));
        i3[a3 + o3] = (4278255360 & s3) + (h4 << 16) + u4;
      }
    }
    function X2(e2, r2, n3, i3, a3) {
      t4[r2] = function(t5, e3, r3, n4, o3, s3, c4, u4, h4) {
        for (n4 = c4; n4 < u4; ++n4) for (c4 = 0; c4 < h4; ++c4) o3[s3++] = a3(r3[i3(t5[e3++])]);
      }, t4[e2] = function(e3, r3, o3, s3, c4, u4, h4) {
        var l4 = 8 >> e3.b, f4 = e3.Ea, d4 = e3.K[0], p4 = e3.w;
        if (8 > l4) for (e3 = (1 << e3.b) - 1, p4 = (1 << l4) - 1; r3 < o3; ++r3) {
          var g4, m4 = 0;
          for (g4 = 0; g4 < f4; ++g4) g4 & e3 || (m4 = i3(s3[c4++])), u4[h4++] = a3(d4[m4 & p4]), m4 >>= l4;
        }
        else t4["VP8LMapColor" + n3](s3, c4, d4, p4, u4, h4, r3, o3, f4);
      };
    }
    function K2(t5, e2, r2, n3, i3) {
      for (r2 = e2 + r2; e2 < r2; ) {
        var a3 = t5[e2++];
        n3[i3++] = a3 >> 16 & 255, n3[i3++] = a3 >> 8 & 255, n3[i3++] = a3 >> 0 & 255;
      }
    }
    function Z2(t5, e2, r2, n3, i3) {
      for (r2 = e2 + r2; e2 < r2; ) {
        var a3 = t5[e2++];
        n3[i3++] = a3 >> 16 & 255, n3[i3++] = a3 >> 8 & 255, n3[i3++] = a3 >> 0 & 255, n3[i3++] = a3 >> 24 & 255;
      }
    }
    function $2(t5, e2, r2, n3, i3) {
      for (r2 = e2 + r2; e2 < r2; ) {
        var a3 = (o3 = t5[e2++]) >> 16 & 240 | o3 >> 12 & 15, o3 = o3 >> 0 & 240 | o3 >> 28 & 15;
        n3[i3++] = a3, n3[i3++] = o3;
      }
    }
    function Q2(t5, e2, r2, n3, i3) {
      for (r2 = e2 + r2; e2 < r2; ) {
        var a3 = (o3 = t5[e2++]) >> 16 & 248 | o3 >> 13 & 7, o3 = o3 >> 5 & 224 | o3 >> 3 & 31;
        n3[i3++] = a3, n3[i3++] = o3;
      }
    }
    function tt2(t5, e2, r2, n3, i3) {
      for (r2 = e2 + r2; e2 < r2; ) {
        var a3 = t5[e2++];
        n3[i3++] = a3 >> 0 & 255, n3[i3++] = a3 >> 8 & 255, n3[i3++] = a3 >> 16 & 255;
      }
    }
    function et2(t5, e2, r2, i3, a3, o3) {
      if (0 == o3) for (r2 = e2 + r2; e2 < r2; ) I2(i3, ((o3 = t5[e2++])[0] >> 24 | o3[1] >> 8 & 65280 | o3[2] << 8 & 16711680 | o3[3] << 24) >>> 0), a3 += 32;
      else n2(i3, a3, t5, e2, r2);
    }
    function rt2(e2, r2) {
      t4[r2][0] = t4[e2 + "0"], t4[r2][1] = t4[e2 + "1"], t4[r2][2] = t4[e2 + "2"], t4[r2][3] = t4[e2 + "3"], t4[r2][4] = t4[e2 + "4"], t4[r2][5] = t4[e2 + "5"], t4[r2][6] = t4[e2 + "6"], t4[r2][7] = t4[e2 + "7"], t4[r2][8] = t4[e2 + "8"], t4[r2][9] = t4[e2 + "9"], t4[r2][10] = t4[e2 + "10"], t4[r2][11] = t4[e2 + "11"], t4[r2][12] = t4[e2 + "12"], t4[r2][13] = t4[e2 + "13"], t4[r2][14] = t4[e2 + "0"], t4[r2][15] = t4[e2 + "0"];
    }
    function nt2(t5) {
      return t5 == Hn || t5 == Wn || t5 == Vn || t5 == Gn;
    }
    function it2() {
      this.eb = [], this.size = this.A = this.fb = 0;
    }
    function at2() {
      this.y = [], this.f = [], this.ea = [], this.F = [], this.Tc = this.Ed = this.Cd = this.Fd = this.lb = this.Db = this.Ab = this.fa = this.J = this.W = this.N = this.O = 0;
    }
    function ot2() {
      this.Rd = this.height = this.width = this.S = 0, this.f = {}, this.f.RGBA = new it2(), this.f.kb = new at2(), this.sd = null;
    }
    function st2() {
      this.width = [0], this.height = [0], this.Pd = [0], this.Qd = [0], this.format = [0];
    }
    function ct2() {
      this.Id = this.fd = this.Md = this.hb = this.ib = this.da = this.bd = this.cd = this.j = this.v = this.Da = this.Sd = this.ob = 0;
    }
    function ut2(t5) {
      return alert("todo:WebPSamplerProcessPlane"), t5.T;
    }
    function ht2(t5, e2) {
      var r2 = t5.T, i3 = e2.ba.f.RGBA, a3 = i3.eb, o3 = i3.fb + t5.ka * i3.A, s3 = vi[e2.ba.S], c4 = t5.y, u4 = t5.O, h4 = t5.f, l4 = t5.N, f4 = t5.ea, d4 = t5.W, p4 = e2.cc, g4 = e2.dc, m4 = e2.Mc, v4 = e2.Nc, b4 = t5.ka, y4 = t5.ka + t5.T, w4 = t5.U, N4 = w4 + 1 >> 1;
      for (0 == b4 ? s3(c4, u4, null, null, h4, l4, f4, d4, h4, l4, f4, d4, a3, o3, null, null, w4) : (s3(e2.ec, e2.fc, c4, u4, p4, g4, m4, v4, h4, l4, f4, d4, a3, o3 - i3.A, a3, o3, w4), ++r2); b4 + 2 < y4; b4 += 2) p4 = h4, g4 = l4, m4 = f4, v4 = d4, l4 += t5.Rc, d4 += t5.Rc, o3 += 2 * i3.A, s3(c4, (u4 += 2 * t5.fa) - t5.fa, c4, u4, p4, g4, m4, v4, h4, l4, f4, d4, a3, o3 - i3.A, a3, o3, w4);
      return u4 += t5.fa, t5.j + y4 < t5.o ? (n2(e2.ec, e2.fc, c4, u4, w4), n2(e2.cc, e2.dc, h4, l4, N4), n2(e2.Mc, e2.Nc, f4, d4, N4), r2--) : 1 & y4 || s3(c4, u4, null, null, h4, l4, f4, d4, h4, l4, f4, d4, a3, o3 + i3.A, null, null, w4), r2;
    }
    function lt2(t5, r2, n3) {
      var i3 = t5.F, a3 = [t5.J];
      if (null != i3) {
        var o3 = t5.U, s3 = r2.ba.S, c4 = s3 == Tn || s3 == Vn;
        r2 = r2.ba.f.RGBA;
        var u4 = [0], h4 = t5.ka;
        u4[0] = t5.T, t5.Kb && (0 == h4 ? --u4[0] : (--h4, a3[0] -= t5.width), t5.j + t5.ka + t5.T == t5.o && (u4[0] = t5.o - t5.j - h4));
        var l4 = r2.eb;
        h4 = r2.fb + h4 * r2.A;
        t5 = Sn(i3, a3[0], t5.width, o3, u4, l4, h4 + (c4 ? 0 : 3), r2.A), e(n3 == u4), t5 && nt2(s3) && An(l4, h4, c4, o3, u4, r2.A);
      }
      return 0;
    }
    function ft2(t5) {
      var e2 = t5.ma, r2 = e2.ba.S, n3 = 11 > r2, i3 = r2 == qn || r2 == Rn || r2 == Tn || r2 == Un || 12 == r2 || nt2(r2);
      if (e2.memory = null, e2.Ib = null, e2.Jb = null, e2.Nd = null, !Mr(e2.Oa, t5, i3 ? 11 : 12)) return 0;
      if (i3 && nt2(r2) && br(), t5.da) alert("todo:use_scaling");
      else {
        if (n3) {
          if (e2.Ib = ut2, t5.Kb) {
            if (r2 = t5.U + 1 >> 1, e2.memory = a2(t5.U + 2 * r2), null == e2.memory) return 0;
            e2.ec = e2.memory, e2.fc = 0, e2.cc = e2.ec, e2.dc = e2.fc + t5.U, e2.Mc = e2.cc, e2.Nc = e2.dc + r2, e2.Ib = ht2, br();
          }
        } else alert("todo:EmitYUV");
        i3 && (e2.Jb = lt2, n3 && mr());
      }
      if (n3 && !Ci) {
        for (t5 = 0; 256 > t5; ++t5) ji[t5] = 89858 * (t5 - 128) + _i >> Si, Mi[t5] = -22014 * (t5 - 128) + _i, Bi[t5] = -45773 * (t5 - 128), Oi[t5] = 113618 * (t5 - 128) + _i >> Si;
        for (t5 = Pi; t5 < ki; ++t5) e2 = 76283 * (t5 - 16) + _i >> Si, Ei[t5 - Pi] = Vt2(e2, 255), qi[t5 - Pi] = Vt2(e2 + 8 >> 4, 15);
        Ci = 1;
      }
      return 1;
    }
    function dt2(t5) {
      var r2 = t5.ma, n3 = t5.U, i3 = t5.T;
      return e(!(1 & t5.ka)), 0 >= n3 || 0 >= i3 ? 0 : (n3 = r2.Ib(t5, r2), null != r2.Jb && r2.Jb(t5, r2, n3), r2.Dc += n3, 1);
    }
    function pt2(t5) {
      t5.ma.memory = null;
    }
    function gt2(t5, e2, r2, n3) {
      return 47 != y3(t5, 8) ? 0 : (e2[0] = y3(t5, 14) + 1, r2[0] = y3(t5, 14) + 1, n3[0] = y3(t5, 1), 0 != y3(t5, 3) ? 0 : !t5.h);
    }
    function mt2(t5, e2) {
      if (4 > t5) return t5 + 1;
      var r2 = t5 - 2 >> 1;
      return (2 + (1 & t5) << r2) + y3(e2, r2) + 1;
    }
    function vt2(t5, e2) {
      return 120 < e2 ? e2 - 120 : 1 <= (r2 = ((r2 = $n[e2 - 1]) >> 4) * t5 + (8 - (15 & r2))) ? r2 : 1;
      var r2;
    }
    function bt2(t5, e2, r2) {
      var n3 = L3(r2), i3 = t5[e2 += 255 & n3].g - 8;
      return 0 < i3 && (x2(r2, r2.u + 8), n3 = L3(r2), e2 += t5[e2].value, e2 += n3 & (1 << i3) - 1), x2(r2, r2.u + t5[e2].g), t5[e2].value;
    }
    function yt2(t5, r2, n3) {
      return n3.g += t5.g, n3.value += t5.value << r2 >>> 0, e(8 >= n3.g), t5.g;
    }
    function wt2(t5, r2, n3) {
      var i3 = t5.xc;
      return e((r2 = 0 == i3 ? 0 : t5.vc[t5.md * (n3 >> i3) + (r2 >> i3)]) < t5.Wb), t5.Ya[r2];
    }
    function Nt2(t5, r2, i3, a3) {
      var o3 = t5.ab, s3 = t5.c * r2, c4 = t5.C;
      r2 = c4 + r2;
      var u4 = i3, h4 = a3;
      for (a3 = t5.Ta, i3 = t5.Ua; 0 < o3--; ) {
        var l4 = t5.gc[o3], f4 = c4, d4 = r2, p4 = u4, g4 = h4, m4 = (h4 = a3, u4 = i3, l4.Ea);
        switch (e(f4 < d4), e(d4 <= l4.nc), l4.hc) {
          case 2:
            Gr(p4, g4, (d4 - f4) * m4, h4, u4);
            break;
          case 0:
            var v4 = f4, b4 = d4, y4 = h4, w4 = u4, N4 = (_3 = l4).Ea;
            0 == v4 && (Wr(p4, g4, null, null, 1, y4, w4), V2(p4, g4 + 1, 0, 0, N4 - 1, y4, w4 + 1), g4 += N4, w4 += N4, ++v4);
            for (var L4 = 1 << _3.b, A4 = L4 - 1, x3 = q2(N4, _3.b), S3 = _3.K, _3 = _3.w + (v4 >> _3.b) * x3; v4 < b4; ) {
              var P3 = S3, k3 = _3, I3 = 1;
              for (Vr(p4, g4, y4, w4 - N4, 1, y4, w4); I3 < N4; ) {
                var F3 = (I3 & ~A4) + L4;
                F3 > N4 && (F3 = N4), (0, Zr[P3[k3++] >> 8 & 15])(p4, g4 + +I3, y4, w4 + I3 - N4, F3 - I3, y4, w4 + I3), I3 = F3;
              }
              g4 += N4, w4 += N4, ++v4 & A4 || (_3 += x3);
            }
            d4 != l4.nc && n2(h4, u4 - m4, h4, u4 + (d4 - f4 - 1) * m4, m4);
            break;
          case 1:
            for (m4 = p4, b4 = g4, N4 = (p4 = l4.Ea) - (w4 = p4 & ~(y4 = (g4 = 1 << l4.b) - 1)), v4 = q2(p4, l4.b), L4 = l4.K, l4 = l4.w + (f4 >> l4.b) * v4; f4 < d4; ) {
              for (A4 = L4, x3 = l4, S3 = new T2(), _3 = b4 + w4, P3 = b4 + p4; b4 < _3; ) Y2(A4[x3++], S3), $r(S3, m4, b4, g4, h4, u4), b4 += g4, u4 += g4;
              b4 < P3 && (Y2(A4[x3++], S3), $r(S3, m4, b4, N4, h4, u4), b4 += N4, u4 += N4), ++f4 & y4 || (l4 += v4);
            }
            break;
          case 3:
            if (p4 == h4 && g4 == u4 && 0 < l4.b) {
              for (b4 = h4, p4 = m4 = u4 + (d4 - f4) * m4 - (w4 = (d4 - f4) * q2(l4.Ea, l4.b)), g4 = h4, y4 = u4, v4 = [], w4 = (N4 = w4) - 1; 0 <= w4; --w4) v4[w4] = g4[y4 + w4];
              for (w4 = N4 - 1; 0 <= w4; --w4) b4[p4 + w4] = v4[w4];
              Yr(l4, f4, d4, h4, m4, h4, u4);
            } else Yr(l4, f4, d4, p4, g4, h4, u4);
        }
        u4 = a3, h4 = i3;
      }
      h4 != i3 && n2(a3, i3, u4, h4, s3);
    }
    function Lt2(t5, r2) {
      var n3 = t5.V, i3 = t5.Ba + t5.c * t5.C, a3 = r2 - t5.C;
      if (e(r2 <= t5.l.o), e(16 >= a3), 0 < a3) {
        var o3 = t5.l, s3 = t5.Ta, c4 = t5.Ua, u4 = o3.width;
        if (Nt2(t5, a3, n3, i3), a3 = c4 = [c4], e((n3 = t5.C) < (i3 = r2)), e(o3.v < o3.va), i3 > o3.o && (i3 = o3.o), n3 < o3.j) {
          var h4 = o3.j - n3;
          n3 = o3.j;
          a3[0] += h4 * u4;
        }
        if (n3 >= i3 ? n3 = 0 : (a3[0] += 4 * o3.v, o3.ka = n3 - o3.j, o3.U = o3.va - o3.v, o3.T = i3 - n3, n3 = 1), n3) {
          if (c4 = c4[0], 11 > (n3 = t5.ca).S) {
            var l4 = n3.f.RGBA, f4 = (i3 = n3.S, a3 = o3.U, o3 = o3.T, h4 = l4.eb, l4.A), d4 = o3;
            for (l4 = l4.fb + t5.Ma * l4.A; 0 < d4--; ) {
              var p4 = s3, g4 = c4, m4 = a3, v4 = h4, b4 = l4;
              switch (i3) {
                case En:
                  Qr(p4, g4, m4, v4, b4);
                  break;
                case qn:
                  tn(p4, g4, m4, v4, b4);
                  break;
                case Hn:
                  tn(p4, g4, m4, v4, b4), An(v4, b4, 0, m4, 1, 0);
                  break;
                case Dn:
                  nn(p4, g4, m4, v4, b4);
                  break;
                case Rn:
                  et2(p4, g4, m4, v4, b4, 1);
                  break;
                case Wn:
                  et2(p4, g4, m4, v4, b4, 1), An(v4, b4, 0, m4, 1, 0);
                  break;
                case Tn:
                  et2(p4, g4, m4, v4, b4, 0);
                  break;
                case Vn:
                  et2(p4, g4, m4, v4, b4, 0), An(v4, b4, 1, m4, 1, 0);
                  break;
                case Un:
                  en(p4, g4, m4, v4, b4);
                  break;
                case Gn:
                  en(p4, g4, m4, v4, b4), xn(v4, b4, m4, 1, 0);
                  break;
                case zn:
                  rn(p4, g4, m4, v4, b4);
                  break;
                default:
                  e(0);
              }
              c4 += u4, l4 += f4;
            }
            t5.Ma += o3;
          } else alert("todo:EmitRescaledRowsYUVA");
          e(t5.Ma <= n3.height);
        }
      }
      t5.C = r2, e(t5.C <= t5.i);
    }
    function At2(t5) {
      var e2;
      if (0 < t5.ua) return 0;
      for (e2 = 0; e2 < t5.Wb; ++e2) {
        var r2 = t5.Ya[e2].G, n3 = t5.Ya[e2].H;
        if (0 < r2[1][n3[1] + 0].g || 0 < r2[2][n3[2] + 0].g || 0 < r2[3][n3[3] + 0].g) return 0;
      }
      return 1;
    }
    function xt2(t5, r2, n3, i3, a3, o3) {
      if (0 != t5.Z) {
        var s3 = t5.qd, c4 = t5.rd;
        for (e(null != mi[t5.Z]); r2 < n3; ++r2) mi[t5.Z](s3, c4, i3, a3, i3, a3, o3), s3 = i3, c4 = a3, a3 += o3;
        t5.qd = s3, t5.rd = c4;
      }
    }
    function St(t5, r2) {
      var n3 = t5.l.ma, i3 = 0 == n3.Z || 1 == n3.Z ? t5.l.j : t5.C;
      i3 = t5.C < i3 ? i3 : t5.C;
      if (e(r2 <= t5.l.o), r2 > i3) {
        var a3 = t5.l.width, o3 = n3.ca, s3 = n3.tb + a3 * i3, c4 = t5.V, u4 = t5.Ba + t5.c * i3, h4 = t5.gc;
        e(1 == t5.ab), e(3 == h4[0].hc), Xr(h4[0], i3, r2, c4, u4, o3, s3), xt2(n3, i3, r2, o3, s3, a3);
      }
      t5.C = t5.Ma = r2;
    }
    function _t2(t5, r2, n3, i3, a3, o3, s3) {
      var c4 = t5.$ / i3, u4 = t5.$ % i3, h4 = t5.m, l4 = t5.s, f4 = n3 + t5.$, d4 = f4;
      a3 = n3 + i3 * a3;
      var p4 = n3 + i3 * o3, g4 = 280 + l4.ua, m4 = t5.Pb ? c4 : 16777216, v4 = 0 < l4.ua ? l4.Wa : null, b4 = l4.wc, y4 = f4 < p4 ? wt2(l4, u4, c4) : null;
      e(t5.C < o3), e(p4 <= a3);
      var w4 = false;
      t: for (; ; ) {
        for (; w4 || f4 < p4; ) {
          var N4 = 0;
          if (c4 >= m4) {
            var _3 = f4 - n3;
            e((m4 = t5).Pb), m4.wd = m4.m, m4.xd = _3, 0 < m4.s.ua && B2(m4.s.Wa, m4.s.vb), m4 = c4 + ti;
          }
          if (u4 & b4 || (y4 = wt2(l4, u4, c4)), e(null != y4), y4.Qb && (r2[f4] = y4.qb, w4 = true), !w4) if (S2(h4), y4.jc) {
            N4 = h4, _3 = r2;
            var P3 = f4, k3 = y4.pd[L3(N4) & Dr - 1];
            e(y4.jc), 256 > k3.g ? (x2(N4, N4.u + k3.g), _3[P3] = k3.value, N4 = 0) : (x2(N4, N4.u + k3.g - 256), e(256 <= k3.value), N4 = k3.value), 0 == N4 && (w4 = true);
          } else N4 = bt2(y4.G[0], y4.H[0], h4);
          if (h4.h) break;
          if (w4 || 256 > N4) {
            if (!w4) if (y4.nd) r2[f4] = (y4.qb | N4 << 8) >>> 0;
            else {
              if (S2(h4), w4 = bt2(y4.G[1], y4.H[1], h4), S2(h4), _3 = bt2(y4.G[2], y4.H[2], h4), P3 = bt2(y4.G[3], y4.H[3], h4), h4.h) break;
              r2[f4] = (P3 << 24 | w4 << 16 | N4 << 8 | _3) >>> 0;
            }
            if (w4 = false, ++f4, ++u4 >= i3 && (u4 = 0, ++c4, null != s3 && c4 <= o3 && !(c4 % 16) && s3(t5, c4), null != v4)) for (; d4 < f4; ) N4 = r2[d4++], v4.X[(506832829 * N4 & 4294967295) >>> v4.Mb] = N4;
          } else if (280 > N4) {
            if (N4 = mt2(N4 - 256, h4), _3 = bt2(y4.G[4], y4.H[4], h4), S2(h4), _3 = vt2(i3, _3 = mt2(_3, h4)), h4.h) break;
            if (f4 - n3 < _3 || a3 - f4 < N4) break t;
            for (P3 = 0; P3 < N4; ++P3) r2[f4 + P3] = r2[f4 + P3 - _3];
            for (f4 += N4, u4 += N4; u4 >= i3; ) u4 -= i3, ++c4, null != s3 && c4 <= o3 && !(c4 % 16) && s3(t5, c4);
            if (e(f4 <= a3), u4 & b4 && (y4 = wt2(l4, u4, c4)), null != v4) for (; d4 < f4; ) N4 = r2[d4++], v4.X[(506832829 * N4 & 4294967295) >>> v4.Mb] = N4;
          } else {
            if (!(N4 < g4)) break t;
            for (w4 = N4 - 280, e(null != v4); d4 < f4; ) N4 = r2[d4++], v4.X[(506832829 * N4 & 4294967295) >>> v4.Mb] = N4;
            N4 = f4, e(!(w4 >>> (_3 = v4).Xa)), r2[N4] = _3.X[w4], w4 = true;
          }
          w4 || e(h4.h == A3(h4));
        }
        if (t5.Pb && h4.h && f4 < a3) e(t5.m.h), t5.a = 5, t5.m = t5.wd, t5.$ = t5.xd, 0 < t5.s.ua && B2(t5.s.vb, t5.s.Wa);
        else {
          if (h4.h) break t;
          null != s3 && s3(t5, c4 > o3 ? o3 : c4), t5.a = 0, t5.$ = f4 - n3;
        }
        return 1;
      }
      return t5.a = 3, 0;
    }
    function Pt2(t5) {
      e(null != t5), t5.vc = null, t5.yc = null, t5.Ya = null;
      var r2 = t5.Wa;
      null != r2 && (r2.X = null), t5.vb = null, e(null != t5);
    }
    function kt2() {
      var e2 = new or();
      return null == e2 ? null : (e2.a = 0, e2.xb = gi, rt2("Predictor", "VP8LPredictors"), rt2("Predictor", "VP8LPredictors_C"), rt2("PredictorAdd", "VP8LPredictorsAdd"), rt2("PredictorAdd", "VP8LPredictorsAdd_C"), Gr = G2, $r = J2, Qr = K2, tn = Z2, en = $2, rn = Q2, nn = tt2, t4.VP8LMapColor32b = Jr, t4.VP8LMapColor8b = Kr, e2);
    }
    function It2(t5, r2, n3, s3, c4) {
      var u4 = 1, f4 = [t5], p4 = [r2], g4 = s3.m, m4 = s3.s, v4 = null, b4 = 0;
      t: for (; ; ) {
        if (n3) for (; u4 && y3(g4, 1); ) {
          var w4 = f4, N4 = p4, A4 = s3, _3 = 1, P3 = A4.m, k3 = A4.gc[A4.ab], I3 = y3(P3, 2);
          if (A4.Oc & 1 << I3) u4 = 0;
          else {
            switch (A4.Oc |= 1 << I3, k3.hc = I3, k3.Ea = w4[0], k3.nc = N4[0], k3.K = [null], ++A4.ab, e(4 >= A4.ab), I3) {
              case 0:
              case 1:
                k3.b = y3(P3, 3) + 2, _3 = It2(q2(k3.Ea, k3.b), q2(k3.nc, k3.b), 0, A4, k3.K), k3.K = k3.K[0];
                break;
              case 3:
                var F3, C3 = y3(P3, 8) + 1, j3 = 16 < C3 ? 0 : 4 < C3 ? 1 : 2 < C3 ? 2 : 3;
                if (w4[0] = q2(k3.Ea, j3), k3.b = j3, F3 = _3 = It2(C3, 1, 0, A4, k3.K)) {
                  var B3, M3 = C3, E3 = k3, R3 = 1 << (8 >> E3.b), T3 = a2(R3);
                  if (null == T3) F3 = 0;
                  else {
                    var U3 = E3.K[0], z3 = E3.w;
                    for (T3[0] = E3.K[0][0], B3 = 1; B3 < 1 * M3; ++B3) T3[B3] = D2(U3[z3 + B3], T3[B3 - 1]);
                    for (; B3 < 4 * R3; ++B3) T3[B3] = 0;
                    E3.K[0] = null, E3.K[0] = T3, F3 = 1;
                  }
                }
                _3 = F3;
                break;
              case 2:
                break;
              default:
                e(0);
            }
            u4 = _3;
          }
        }
        if (f4 = f4[0], p4 = p4[0], u4 && y3(g4, 1) && !(u4 = 1 <= (b4 = y3(g4, 4)) && 11 >= b4)) {
          s3.a = 3;
          break t;
        }
        var H3;
        if (H3 = u4) e: {
          var W3, V3, G3, Y3 = s3, J3 = f4, X3 = p4, K3 = b4, Z3 = n3, $3 = Y3.m, Q3 = Y3.s, tt3 = [null], et3 = 1, rt3 = 0, nt3 = Qn[K3];
          r: for (; ; ) {
            if (Z3 && y3($3, 1)) {
              var it3 = y3($3, 3) + 2, at3 = q2(J3, it3), ot3 = q2(X3, it3), st3 = at3 * ot3;
              if (!It2(at3, ot3, 0, Y3, tt3)) break r;
              for (tt3 = tt3[0], Q3.xc = it3, W3 = 0; W3 < st3; ++W3) {
                var ct3 = tt3[W3] >> 8 & 65535;
                tt3[W3] = ct3, ct3 >= et3 && (et3 = ct3 + 1);
              }
            }
            if ($3.h) break r;
            for (V3 = 0; 5 > V3; ++V3) {
              var ut3 = Xn[V3];
              !V3 && 0 < K3 && (ut3 += 1 << K3), rt3 < ut3 && (rt3 = ut3);
            }
            var ht3 = o2(et3 * nt3, l3), lt3 = et3, ft3 = o2(lt3, d3);
            if (null == ft3) var dt3 = null;
            else e(65536 >= lt3), dt3 = ft3;
            var pt3 = a2(rt3);
            if (null == dt3 || null == pt3 || null == ht3) {
              Y3.a = 1;
              break r;
            }
            var gt3 = ht3;
            for (W3 = G3 = 0; W3 < et3; ++W3) {
              var mt3 = dt3[W3], vt3 = mt3.G, bt3 = mt3.H, wt3 = 0, Nt3 = 1, Lt3 = 0;
              for (V3 = 0; 5 > V3; ++V3) {
                ut3 = Xn[V3], vt3[V3] = gt3, bt3[V3] = G3, !V3 && 0 < K3 && (ut3 += 1 << K3);
                n: {
                  var At3, xt3 = ut3, St2 = Y3, kt3 = pt3, Ft3 = gt3, Ct3 = G3, jt3 = 0, Ot3 = St2.m, Bt3 = y3(Ot3, 1);
                  if (i2(kt3, 0, 0, xt3), Bt3) {
                    var Mt3 = y3(Ot3, 1) + 1, Et3 = y3(Ot3, 1), qt3 = y3(Ot3, 0 == Et3 ? 1 : 8);
                    kt3[qt3] = 1, 2 == Mt3 && (kt3[qt3 = y3(Ot3, 8)] = 1);
                    var Dt3 = 1;
                  } else {
                    var Rt3 = a2(19), Tt3 = y3(Ot3, 4) + 4;
                    if (19 < Tt3) {
                      St2.a = 3;
                      var Ut3 = 0;
                      break n;
                    }
                    for (At3 = 0; At3 < Tt3; ++At3) Rt3[Zn[At3]] = y3(Ot3, 3);
                    var zt3 = void 0, Ht3 = void 0, Wt3 = St2, Vt3 = Rt3, Gt3 = xt3, Yt3 = kt3, Jt3 = 0, Xt3 = Wt3.m, Kt3 = 8, Zt3 = o2(128, l3);
                    i: for (; h3(Zt3, 0, 7, Vt3, 19); ) {
                      if (y3(Xt3, 1)) {
                        var $t3 = 2 + 2 * y3(Xt3, 3);
                        if ((zt3 = 2 + y3(Xt3, $t3)) > Gt3) break i;
                      } else zt3 = Gt3;
                      for (Ht3 = 0; Ht3 < Gt3 && zt3--; ) {
                        S2(Xt3);
                        var Qt3 = Zt3[0 + (127 & L3(Xt3))];
                        x2(Xt3, Xt3.u + Qt3.g);
                        var te3 = Qt3.value;
                        if (16 > te3) Yt3[Ht3++] = te3, 0 != te3 && (Kt3 = te3);
                        else {
                          var ee3 = 16 == te3, re3 = te3 - 16, ne3 = Jn[re3], ie3 = y3(Xt3, Yn[re3]) + ne3;
                          if (Ht3 + ie3 > Gt3) break i;
                          for (var ae3 = ee3 ? Kt3 : 0; 0 < ie3--; ) Yt3[Ht3++] = ae3;
                        }
                      }
                      Jt3 = 1;
                      break i;
                    }
                    Jt3 || (Wt3.a = 3), Dt3 = Jt3;
                  }
                  (Dt3 = Dt3 && !Ot3.h) && (jt3 = h3(Ft3, Ct3, 8, kt3, xt3)), Dt3 && 0 != jt3 ? Ut3 = jt3 : (St2.a = 3, Ut3 = 0);
                }
                if (0 == Ut3) break r;
                if (Nt3 && 1 == Kn[V3] && (Nt3 = 0 == gt3[G3].g), wt3 += gt3[G3].g, G3 += Ut3, 3 >= V3) {
                  var oe3, se3 = pt3[0];
                  for (oe3 = 1; oe3 < ut3; ++oe3) pt3[oe3] > se3 && (se3 = pt3[oe3]);
                  Lt3 += se3;
                }
              }
              if (mt3.nd = Nt3, mt3.Qb = 0, Nt3 && (mt3.qb = (vt3[3][bt3[3] + 0].value << 24 | vt3[1][bt3[1] + 0].value << 16 | vt3[2][bt3[2] + 0].value) >>> 0, 0 == wt3 && 256 > vt3[0][bt3[0] + 0].value && (mt3.Qb = 1, mt3.qb += vt3[0][bt3[0] + 0].value << 8)), mt3.jc = !mt3.Qb && 6 > Lt3, mt3.jc) {
                var ce3, ue3 = mt3;
                for (ce3 = 0; ce3 < Dr; ++ce3) {
                  var he3 = ce3, le3 = ue3.pd[he3], fe3 = ue3.G[0][ue3.H[0] + he3];
                  256 <= fe3.value ? (le3.g = fe3.g + 256, le3.value = fe3.value) : (le3.g = 0, le3.value = 0, he3 >>= yt2(fe3, 8, le3), he3 >>= yt2(ue3.G[1][ue3.H[1] + he3], 16, le3), he3 >>= yt2(ue3.G[2][ue3.H[2] + he3], 0, le3), yt2(ue3.G[3][ue3.H[3] + he3], 24, le3));
                }
              }
            }
            Q3.vc = tt3, Q3.Wb = et3, Q3.Ya = dt3, Q3.yc = ht3, H3 = 1;
            break e;
          }
          H3 = 0;
        }
        if (!(u4 = H3)) {
          s3.a = 3;
          break t;
        }
        if (0 < b4) {
          if (m4.ua = 1 << b4, !O2(m4.Wa, b4)) {
            s3.a = 1, u4 = 0;
            break t;
          }
        } else m4.ua = 0;
        var de3 = s3, pe3 = f4, ge3 = p4, me3 = de3.s, ve3 = me3.xc;
        if (de3.c = pe3, de3.i = ge3, me3.md = q2(pe3, ve3), me3.wc = 0 == ve3 ? -1 : (1 << ve3) - 1, n3) {
          s3.xb = pi;
          break t;
        }
        if (null == (v4 = a2(f4 * p4))) {
          s3.a = 1, u4 = 0;
          break t;
        }
        u4 = (u4 = _t2(s3, v4, 0, f4, p4, p4, null)) && !g4.h;
        break t;
      }
      return u4 ? (null != c4 ? c4[0] = v4 : (e(null == v4), e(n3)), s3.$ = 0, n3 || Pt2(m4)) : Pt2(m4), u4;
    }
    function Ft2(t5, r2) {
      var n3 = t5.c * t5.i, i3 = n3 + r2 + 16 * r2;
      return e(t5.c <= r2), t5.V = a2(i3), null == t5.V ? (t5.Ta = null, t5.Ua = 0, t5.a = 1, 0) : (t5.Ta = t5.V, t5.Ua = t5.Ba + n3 + r2, 1);
    }
    function Ct2(t5, r2) {
      var n3 = t5.C, i3 = r2 - n3, a3 = t5.V, o3 = t5.Ba + t5.c * n3;
      for (e(r2 <= t5.l.o); 0 < i3; ) {
        var s3 = 16 < i3 ? 16 : i3, c4 = t5.l.ma, u4 = t5.l.width, h4 = u4 * s3, l4 = c4.ca, f4 = c4.tb + u4 * n3, d4 = t5.Ta, p4 = t5.Ua;
        Nt2(t5, s3, a3, o3), _n(d4, p4, l4, f4, h4), xt2(c4, n3, n3 + s3, l4, f4, u4), i3 -= s3, a3 += s3 * t5.c, n3 += s3;
      }
      e(n3 == r2), t5.C = t5.Ma = r2;
    }
    function jt2() {
      this.ub = this.yd = this.td = this.Rb = 0;
    }
    function Ot2() {
      this.Kd = this.Ld = this.Ud = this.Td = this.i = this.c = 0;
    }
    function Bt2() {
      this.Fb = this.Bb = this.Cb = 0, this.Zb = a2(4), this.Lb = a2(4);
    }
    function Mt2() {
      this.Yb = function() {
        var t5 = [];
        return function t6(e2, r2, n3) {
          for (var i3 = n3[r2], a3 = 0; a3 < i3 && (e2.push(n3.length > r2 + 1 ? [] : 0), !(n3.length < r2 + 1)); a3++) t6(e2[a3], r2 + 1, n3);
        }(t5, 0, [3, 11]), t5;
      }();
    }
    function Et2() {
      this.jb = a2(3), this.Wc = s2([4, 8], Mt2), this.Xc = s2([4, 17], Mt2);
    }
    function qt2() {
      this.Pc = this.wb = this.Tb = this.zd = 0, this.vd = new a2(4), this.od = new a2(4);
    }
    function Dt2() {
      this.ld = this.La = this.dd = this.tc = 0;
    }
    function Rt2() {
      this.Na = this.la = 0;
    }
    function Tt2() {
      this.Sc = [0, 0], this.Eb = [0, 0], this.Qc = [0, 0], this.ia = this.lc = 0;
    }
    function Ut2() {
      this.ad = a2(384), this.Za = 0, this.Ob = a2(16), this.$b = this.Ad = this.ia = this.Gc = this.Hc = this.Dd = 0;
    }
    function zt2() {
      this.uc = this.M = this.Nb = 0, this.wa = Array(new Dt2()), this.Y = 0, this.ya = Array(new Ut2()), this.aa = 0, this.l = new Gt2();
    }
    function Ht2() {
      this.y = a2(16), this.f = a2(8), this.ea = a2(8);
    }
    function Wt2() {
      this.cb = this.a = 0, this.sc = "", this.m = new w3(), this.Od = new jt2(), this.Kc = new Ot2(), this.ed = new qt2(), this.Qa = new Bt2(), this.Ic = this.$c = this.Aa = 0, this.D = new zt2(), this.Xb = this.Va = this.Hb = this.zb = this.yb = this.Ub = this.za = 0, this.Jc = o2(8, w3), this.ia = 0, this.pb = o2(4, Tt2), this.Pa = new Et2(), this.Bd = this.kc = 0, this.Ac = [], this.Bc = 0, this.zc = [0, 0, 0, 0], this.Gd = Array(new Ht2()), this.Hd = 0, this.rb = Array(new Rt2()), this.sb = 0, this.wa = Array(new Dt2()), this.Y = 0, this.oc = [], this.pc = 0, this.sa = [], this.ta = 0, this.qa = [], this.ra = 0, this.Ha = [], this.B = this.R = this.Ia = 0, this.Ec = [], this.M = this.ja = this.Vb = this.Fc = 0, this.ya = Array(new Ut2()), this.L = this.aa = 0, this.gd = s2([4, 2], Dt2), this.ga = null, this.Fa = [], this.Cc = this.qc = this.P = 0, this.Gb = [], this.Uc = 0, this.mb = [], this.nb = 0, this.rc = [], this.Ga = this.Vc = 0;
    }
    function Vt2(t5, e2) {
      return 0 > t5 ? 0 : t5 > e2 ? e2 : t5;
    }
    function Gt2() {
      this.T = this.U = this.ka = this.height = this.width = 0, this.y = [], this.f = [], this.ea = [], this.Rc = this.fa = this.W = this.N = this.O = 0, this.ma = "void", this.put = "VP8IoPutHook", this.ac = "VP8IoSetupHook", this.bc = "VP8IoTeardownHook", this.ha = this.Kb = 0, this.data = [], this.hb = this.ib = this.da = this.o = this.j = this.va = this.v = this.Da = this.ob = this.w = 0, this.F = [], this.J = 0;
    }
    function Yt2() {
      var t5 = new Wt2();
      return null != t5 && (t5.a = 0, t5.sc = "OK", t5.cb = 0, t5.Xb = 0, ni || (ni = Zt2)), t5;
    }
    function Jt2(t5, e2, r2) {
      return 0 == t5.a && (t5.a = e2, t5.sc = r2, t5.cb = 0), 0;
    }
    function Xt2(t5, e2, r2) {
      return 3 <= r2 && 157 == t5[e2 + 0] && 1 == t5[e2 + 1] && 42 == t5[e2 + 2];
    }
    function Kt2(t5, r2) {
      if (null == t5) return 0;
      if (t5.a = 0, t5.sc = "OK", null == r2) return Jt2(t5, 2, "null VP8Io passed to VP8GetHeaders()");
      var n3 = r2.data, a3 = r2.w, o3 = r2.ha;
      if (4 > o3) return Jt2(t5, 7, "Truncated header.");
      var s3 = n3[a3 + 0] | n3[a3 + 1] << 8 | n3[a3 + 2] << 16, c4 = t5.Od;
      if (c4.Rb = !(1 & s3), c4.td = s3 >> 1 & 7, c4.yd = s3 >> 4 & 1, c4.ub = s3 >> 5, 3 < c4.td) return Jt2(t5, 3, "Incorrect keyframe parameters.");
      if (!c4.yd) return Jt2(t5, 4, "Frame not displayable.");
      a3 += 3, o3 -= 3;
      var u4 = t5.Kc;
      if (c4.Rb) {
        if (7 > o3) return Jt2(t5, 7, "cannot parse picture header");
        if (!Xt2(n3, a3, o3)) return Jt2(t5, 3, "Bad code word");
        u4.c = 16383 & (n3[a3 + 4] << 8 | n3[a3 + 3]), u4.Td = n3[a3 + 4] >> 6, u4.i = 16383 & (n3[a3 + 6] << 8 | n3[a3 + 5]), u4.Ud = n3[a3 + 6] >> 6, a3 += 7, o3 -= 7, t5.za = u4.c + 15 >> 4, t5.Ub = u4.i + 15 >> 4, r2.width = u4.c, r2.height = u4.i, r2.Da = 0, r2.j = 0, r2.v = 0, r2.va = r2.width, r2.o = r2.height, r2.da = 0, r2.ib = r2.width, r2.hb = r2.height, r2.U = r2.width, r2.T = r2.height, i2((s3 = t5.Pa).jb, 0, 255, s3.jb.length), e(null != (s3 = t5.Qa)), s3.Cb = 0, s3.Bb = 0, s3.Fb = 1, i2(s3.Zb, 0, 0, s3.Zb.length), i2(s3.Lb, 0, 0, s3.Lb);
      }
      if (c4.ub > o3) return Jt2(t5, 7, "bad partition length");
      p3(s3 = t5.m, n3, a3, c4.ub), a3 += c4.ub, o3 -= c4.ub, c4.Rb && (u4.Ld = P2(s3), u4.Kd = P2(s3)), u4 = t5.Qa;
      var h4, l4 = t5.Pa;
      if (e(null != s3), e(null != u4), u4.Cb = P2(s3), u4.Cb) {
        if (u4.Bb = P2(s3), P2(s3)) {
          for (u4.Fb = P2(s3), h4 = 0; 4 > h4; ++h4) u4.Zb[h4] = P2(s3) ? m3(s3, 7) : 0;
          for (h4 = 0; 4 > h4; ++h4) u4.Lb[h4] = P2(s3) ? m3(s3, 6) : 0;
        }
        if (u4.Bb) for (h4 = 0; 3 > h4; ++h4) l4.jb[h4] = P2(s3) ? g3(s3, 8) : 255;
      } else u4.Bb = 0;
      if (s3.Ka) return Jt2(t5, 3, "cannot parse segment header");
      if ((u4 = t5.ed).zd = P2(s3), u4.Tb = g3(s3, 6), u4.wb = g3(s3, 3), u4.Pc = P2(s3), u4.Pc && P2(s3)) {
        for (l4 = 0; 4 > l4; ++l4) P2(s3) && (u4.vd[l4] = m3(s3, 6));
        for (l4 = 0; 4 > l4; ++l4) P2(s3) && (u4.od[l4] = m3(s3, 6));
      }
      if (t5.L = 0 == u4.Tb ? 0 : u4.zd ? 1 : 2, s3.Ka) return Jt2(t5, 3, "cannot parse filter header");
      var f4 = o3;
      if (o3 = h4 = a3, a3 = h4 + f4, u4 = f4, t5.Xb = (1 << g3(t5.m, 2)) - 1, f4 < 3 * (l4 = t5.Xb)) n3 = 7;
      else {
        for (h4 += 3 * l4, u4 -= 3 * l4, f4 = 0; f4 < l4; ++f4) {
          var d4 = n3[o3 + 0] | n3[o3 + 1] << 8 | n3[o3 + 2] << 16;
          d4 > u4 && (d4 = u4), p3(t5.Jc[+f4], n3, h4, d4), h4 += d4, u4 -= d4, o3 += 3;
        }
        p3(t5.Jc[+l4], n3, h4, u4), n3 = h4 < a3 ? 0 : 5;
      }
      if (0 != n3) return Jt2(t5, n3, "cannot parse partitions");
      for (n3 = g3(h4 = t5.m, 7), o3 = P2(h4) ? m3(h4, 4) : 0, a3 = P2(h4) ? m3(h4, 4) : 0, u4 = P2(h4) ? m3(h4, 4) : 0, l4 = P2(h4) ? m3(h4, 4) : 0, h4 = P2(h4) ? m3(h4, 4) : 0, f4 = t5.Qa, d4 = 0; 4 > d4; ++d4) {
        if (f4.Cb) {
          var v4 = f4.Zb[d4];
          f4.Fb || (v4 += n3);
        } else {
          if (0 < d4) {
            t5.pb[d4] = t5.pb[0];
            continue;
          }
          v4 = n3;
        }
        var b4 = t5.pb[d4];
        b4.Sc[0] = ei[Vt2(v4 + o3, 127)], b4.Sc[1] = ri[Vt2(v4 + 0, 127)], b4.Eb[0] = 2 * ei[Vt2(v4 + a3, 127)], b4.Eb[1] = 101581 * ri[Vt2(v4 + u4, 127)] >> 16, 8 > b4.Eb[1] && (b4.Eb[1] = 8), b4.Qc[0] = ei[Vt2(v4 + l4, 117)], b4.Qc[1] = ri[Vt2(v4 + h4, 127)], b4.lc = v4 + h4;
      }
      if (!c4.Rb) return Jt2(t5, 4, "Not a key frame.");
      for (P2(s3), c4 = t5.Pa, n3 = 0; 4 > n3; ++n3) {
        for (o3 = 0; 8 > o3; ++o3) for (a3 = 0; 3 > a3; ++a3) for (u4 = 0; 11 > u4; ++u4) l4 = k2(s3, ui[n3][o3][a3][u4]) ? g3(s3, 8) : si[n3][o3][a3][u4], c4.Wc[n3][o3].Yb[a3][u4] = l4;
        for (o3 = 0; 17 > o3; ++o3) c4.Xc[n3][o3] = c4.Wc[n3][hi[o3]];
      }
      return t5.kc = P2(s3), t5.kc && (t5.Bd = g3(s3, 8)), t5.cb = 1;
    }
    function Zt2(t5, e2, r2, n3, i3, a3, o3) {
      var s3 = e2[i3].Yb[r2];
      for (r2 = 0; 16 > i3; ++i3) {
        if (!k2(t5, s3[r2 + 0])) return i3;
        for (; !k2(t5, s3[r2 + 1]); ) if (s3 = e2[++i3].Yb[0], r2 = 0, 16 == i3) return 16;
        var c4 = e2[i3 + 1].Yb;
        if (k2(t5, s3[r2 + 2])) {
          var u4 = t5, h4 = 0;
          if (k2(u4, (f4 = s3)[(l4 = r2) + 3])) if (k2(u4, f4[l4 + 6])) {
            for (s3 = 0, l4 = 2 * (h4 = k2(u4, f4[l4 + 8])) + (f4 = k2(u4, f4[l4 + 9 + h4])), h4 = 0, f4 = ii[l4]; f4[s3]; ++s3) h4 += h4 + k2(u4, f4[s3]);
            h4 += 3 + (8 << l4);
          } else k2(u4, f4[l4 + 7]) ? (h4 = 7 + 2 * k2(u4, 165), h4 += k2(u4, 145)) : h4 = 5 + k2(u4, 159);
          else h4 = k2(u4, f4[l4 + 4]) ? 3 + k2(u4, f4[l4 + 5]) : 2;
          s3 = c4[2];
        } else h4 = 1, s3 = c4[1];
        c4 = o3 + ai[i3], 0 > (u4 = t5).b && _2(u4);
        var l4, f4 = u4.b, d4 = (l4 = u4.Ca >> 1) - (u4.I >> f4) >> 31;
        --u4.b, u4.Ca += d4, u4.Ca |= 1, u4.I -= (l4 + 1 & d4) << f4, a3[c4] = ((h4 ^ d4) - d4) * n3[(0 < i3) + 0];
      }
      return 16;
    }
    function $t2(t5) {
      var e2 = t5.rb[t5.sb - 1];
      e2.la = 0, e2.Na = 0, i2(t5.zc, 0, 0, t5.zc.length), t5.ja = 0;
    }
    function Qt2(t5, r2) {
      if (null == t5) return 0;
      if (null == r2) return Jt2(t5, 2, "NULL VP8Io parameter in VP8Decode().");
      if (!t5.cb && !Kt2(t5, r2)) return 0;
      if (e(t5.cb), null == r2.ac || r2.ac(r2)) {
        r2.ob && (t5.L = 0);
        var s3 = Ri[t5.L];
        if (2 == t5.L ? (t5.yb = 0, t5.zb = 0) : (t5.yb = r2.v - s3 >> 4, t5.zb = r2.j - s3 >> 4, 0 > t5.yb && (t5.yb = 0), 0 > t5.zb && (t5.zb = 0)), t5.Va = r2.o + 15 + s3 >> 4, t5.Hb = r2.va + 15 + s3 >> 4, t5.Hb > t5.za && (t5.Hb = t5.za), t5.Va > t5.Ub && (t5.Va = t5.Ub), 0 < t5.L) {
          var c4 = t5.ed;
          for (s3 = 0; 4 > s3; ++s3) {
            var u4;
            if (t5.Qa.Cb) {
              var h4 = t5.Qa.Lb[s3];
              t5.Qa.Fb || (h4 += c4.Tb);
            } else h4 = c4.Tb;
            for (u4 = 0; 1 >= u4; ++u4) {
              var l4 = t5.gd[s3][u4], f4 = h4;
              if (c4.Pc && (f4 += c4.vd[0], u4 && (f4 += c4.od[0])), 0 < (f4 = 0 > f4 ? 0 : 63 < f4 ? 63 : f4)) {
                var d4 = f4;
                0 < c4.wb && ((d4 = 4 < c4.wb ? d4 >> 2 : d4 >> 1) > 9 - c4.wb && (d4 = 9 - c4.wb)), 1 > d4 && (d4 = 1), l4.dd = d4, l4.tc = 2 * f4 + d4, l4.ld = 40 <= f4 ? 2 : 15 <= f4 ? 1 : 0;
              } else l4.tc = 0;
              l4.La = u4;
            }
          }
        }
        s3 = 0;
      } else Jt2(t5, 6, "Frame setup failed"), s3 = t5.a;
      if (s3 = 0 == s3) {
        if (s3) {
          t5.$c = 0, 0 < t5.Aa || (t5.Ic = Ui);
          t: {
            s3 = t5.Ic;
            c4 = 4 * (d4 = t5.za);
            var p4 = 32 * d4, g4 = d4 + 1, m4 = 0 < t5.L ? d4 * (0 < t5.Aa ? 2 : 1) : 0, v4 = (2 == t5.Aa ? 2 : 1) * d4;
            if ((l4 = c4 + 832 + (u4 = 3 * (16 * s3 + Ri[t5.L]) / 2 * p4) + (h4 = null != t5.Fa && 0 < t5.Fa.length ? t5.Kc.c * t5.Kc.i : 0)) != l4) s3 = 0;
            else {
              if (l4 > t5.Vb) {
                if (t5.Vb = 0, t5.Ec = a2(l4), t5.Fc = 0, null == t5.Ec) {
                  s3 = Jt2(t5, 1, "no memory during frame initialization.");
                  break t;
                }
                t5.Vb = l4;
              }
              l4 = t5.Ec, f4 = t5.Fc, t5.Ac = l4, t5.Bc = f4, f4 += c4, t5.Gd = o2(p4, Ht2), t5.Hd = 0, t5.rb = o2(g4 + 1, Rt2), t5.sb = 1, t5.wa = m4 ? o2(m4, Dt2) : null, t5.Y = 0, t5.D.Nb = 0, t5.D.wa = t5.wa, t5.D.Y = t5.Y, 0 < t5.Aa && (t5.D.Y += d4), e(true), t5.oc = l4, t5.pc = f4, f4 += 832, t5.ya = o2(v4, Ut2), t5.aa = 0, t5.D.ya = t5.ya, t5.D.aa = t5.aa, 2 == t5.Aa && (t5.D.aa += d4), t5.R = 16 * d4, t5.B = 8 * d4, d4 = (p4 = Ri[t5.L]) * t5.R, p4 = p4 / 2 * t5.B, t5.sa = l4, t5.ta = f4 + d4, t5.qa = t5.sa, t5.ra = t5.ta + 16 * s3 * t5.R + p4, t5.Ha = t5.qa, t5.Ia = t5.ra + 8 * s3 * t5.B + p4, t5.$c = 0, f4 += u4, t5.mb = h4 ? l4 : null, t5.nb = h4 ? f4 : null, e(f4 + h4 <= t5.Fc + t5.Vb), $t2(t5), i2(t5.Ac, t5.Bc, 0, c4), s3 = 1;
            }
          }
          if (s3) {
            if (r2.ka = 0, r2.y = t5.sa, r2.O = t5.ta, r2.f = t5.qa, r2.N = t5.ra, r2.ea = t5.Ha, r2.Vd = t5.Ia, r2.fa = t5.R, r2.Rc = t5.B, r2.F = null, r2.J = 0, !Cn) {
              for (s3 = -255; 255 >= s3; ++s3) Pn[255 + s3] = 0 > s3 ? -s3 : s3;
              for (s3 = -1020; 1020 >= s3; ++s3) kn[1020 + s3] = -128 > s3 ? -128 : 127 < s3 ? 127 : s3;
              for (s3 = -112; 112 >= s3; ++s3) In[112 + s3] = -16 > s3 ? -16 : 15 < s3 ? 15 : s3;
              for (s3 = -255; 510 >= s3; ++s3) Fn[255 + s3] = 0 > s3 ? 0 : 255 < s3 ? 255 : s3;
              Cn = 1;
            }
            an = ue2, on = ae2, cn = oe2, un = se2, hn = ce2, sn = ie2, ln2 = Je, fn = Xe, dn = $e, pn = Qe, gn = Ke, mn = Ze, vn = tr, bn = er, yn = ze, wn = He, Nn = We, Ln = Ve, fi[0] = xe, fi[1] = le2, fi[2] = Le2, fi[3] = Ae, fi[4] = Se, fi[5] = Pe, fi[6] = _e, fi[7] = ke, fi[8] = Fe, fi[9] = Ie, li[0] = ve2, li[1] = de2, li[2] = pe2, li[3] = ge2, li[4] = be2, li[5] = ye2, li[6] = we2, di[0] = Be, di[1] = fe2, di[2] = Ce, di[3] = je, di[4] = Ee, di[5] = Me, di[6] = qe, s3 = 1;
          } else s3 = 0;
        }
        s3 && (s3 = function(t6, r3) {
          for (t6.M = 0; t6.M < t6.Va; ++t6.M) {
            var o3, s4 = t6.Jc[t6.M & t6.Xb], c5 = t6.m, u5 = t6;
            for (o3 = 0; o3 < u5.za; ++o3) {
              var h5 = c5, l5 = u5, f5 = l5.Ac, d5 = l5.Bc + 4 * o3, p5 = l5.zc, g5 = l5.ya[l5.aa + o3];
              if (l5.Qa.Bb ? g5.$b = k2(h5, l5.Pa.jb[0]) ? 2 + k2(h5, l5.Pa.jb[2]) : k2(h5, l5.Pa.jb[1]) : g5.$b = 0, l5.kc && (g5.Ad = k2(h5, l5.Bd)), g5.Za = !k2(h5, 145) + 0, g5.Za) {
                var m5 = g5.Ob, v5 = 0;
                for (l5 = 0; 4 > l5; ++l5) {
                  var b4, y4 = p5[0 + l5];
                  for (b4 = 0; 4 > b4; ++b4) {
                    y4 = ci[f5[d5 + b4]][y4];
                    for (var w4 = oi[k2(h5, y4[0])]; 0 < w4; ) w4 = oi[2 * w4 + k2(h5, y4[w4])];
                    y4 = -w4, f5[d5 + b4] = y4;
                  }
                  n2(m5, v5, f5, d5, 4), v5 += 4, p5[0 + l5] = y4;
                }
              } else y4 = k2(h5, 156) ? k2(h5, 128) ? 1 : 3 : k2(h5, 163) ? 2 : 0, g5.Ob[0] = y4, i2(f5, d5, y4, 4), i2(p5, 0, y4, 4);
              g5.Dd = k2(h5, 142) ? k2(h5, 114) ? k2(h5, 183) ? 1 : 3 : 2 : 0;
            }
            if (u5.m.Ka) return Jt2(t6, 7, "Premature end-of-partition0 encountered.");
            for (; t6.ja < t6.za; ++t6.ja) {
              if (u5 = s4, h5 = (c5 = t6).rb[c5.sb - 1], f5 = c5.rb[c5.sb + c5.ja], o3 = c5.ya[c5.aa + c5.ja], d5 = c5.kc ? o3.Ad : 0) h5.la = f5.la = 0, o3.Za || (h5.Na = f5.Na = 0), o3.Hc = 0, o3.Gc = 0, o3.ia = 0;
              else {
                var N4, L4;
                h5 = f5, f5 = u5, d5 = c5.Pa.Xc, p5 = c5.ya[c5.aa + c5.ja], g5 = c5.pb[p5.$b];
                if (l5 = p5.ad, m5 = 0, v5 = c5.rb[c5.sb - 1], y4 = b4 = 0, i2(l5, m5, 0, 384), p5.Za) var A4 = 0, x3 = d5[3];
                else {
                  w4 = a2(16);
                  var S3 = h5.Na + v5.Na;
                  if (S3 = ni(f5, d5[1], S3, g5.Eb, 0, w4, 0), h5.Na = v5.Na = (0 < S3) + 0, 1 < S3) an(w4, 0, l5, m5);
                  else {
                    var _3 = w4[0] + 3 >> 3;
                    for (w4 = 0; 256 > w4; w4 += 16) l5[m5 + w4] = _3;
                  }
                  A4 = 1, x3 = d5[0];
                }
                var P3 = 15 & h5.la, I3 = 15 & v5.la;
                for (w4 = 0; 4 > w4; ++w4) {
                  var F3 = 1 & I3;
                  for (_3 = L4 = 0; 4 > _3; ++_3) P3 = P3 >> 1 | (F3 = (S3 = ni(f5, x3, S3 = F3 + (1 & P3), g5.Sc, A4, l5, m5)) > A4) << 7, L4 = L4 << 2 | (3 < S3 ? 3 : 1 < S3 ? 2 : 0 != l5[m5 + 0]), m5 += 16;
                  P3 >>= 4, I3 = I3 >> 1 | F3 << 7, b4 = (b4 << 8 | L4) >>> 0;
                }
                for (x3 = P3, A4 = I3 >> 4, N4 = 0; 4 > N4; N4 += 2) {
                  for (L4 = 0, P3 = h5.la >> 4 + N4, I3 = v5.la >> 4 + N4, w4 = 0; 2 > w4; ++w4) {
                    for (F3 = 1 & I3, _3 = 0; 2 > _3; ++_3) S3 = F3 + (1 & P3), P3 = P3 >> 1 | (F3 = 0 < (S3 = ni(f5, d5[2], S3, g5.Qc, 0, l5, m5))) << 3, L4 = L4 << 2 | (3 < S3 ? 3 : 1 < S3 ? 2 : 0 != l5[m5 + 0]), m5 += 16;
                    P3 >>= 2, I3 = I3 >> 1 | F3 << 5;
                  }
                  y4 |= L4 << 4 * N4, x3 |= P3 << 4 << N4, A4 |= (240 & I3) << N4;
                }
                h5.la = x3, v5.la = A4, p5.Hc = b4, p5.Gc = y4, p5.ia = 43690 & y4 ? 0 : g5.ia, d5 = !(b4 | y4);
              }
              if (0 < c5.L && (c5.wa[c5.Y + c5.ja] = c5.gd[o3.$b][o3.Za], c5.wa[c5.Y + c5.ja].La |= !d5), u5.Ka) return Jt2(t6, 7, "Premature end-of-file encountered.");
            }
            if ($t2(t6), c5 = r3, u5 = 1, o3 = (s4 = t6).D, h5 = 0 < s4.L && s4.M >= s4.zb && s4.M <= s4.Va, 0 == s4.Aa) t: {
              if (o3.M = s4.M, o3.uc = h5, Or(s4, o3), u5 = 1, o3 = (L4 = s4.D).Nb, h5 = (y4 = Ri[s4.L]) * s4.R, f5 = y4 / 2 * s4.B, w4 = 16 * o3 * s4.R, _3 = 8 * o3 * s4.B, d5 = s4.sa, p5 = s4.ta - h5 + w4, g5 = s4.qa, l5 = s4.ra - f5 + _3, m5 = s4.Ha, v5 = s4.Ia - f5 + _3, I3 = 0 == (P3 = L4.M), b4 = P3 >= s4.Va - 1, 2 == s4.Aa && Or(s4, L4), L4.uc) for (F3 = (S3 = s4).D.M, e(S3.D.uc), L4 = S3.yb; L4 < S3.Hb; ++L4) {
                A4 = L4, x3 = F3;
                var C3 = (j3 = (U3 = S3).D).Nb;
                N4 = U3.R;
                var j3 = j3.wa[j3.Y + A4], O3 = U3.sa, B3 = U3.ta + 16 * C3 * N4 + 16 * A4, M3 = j3.dd, E3 = j3.tc;
                if (0 != E3) if (e(3 <= E3), 1 == U3.L) 0 < A4 && wn(O3, B3, N4, E3 + 4), j3.La && Ln(O3, B3, N4, E3), 0 < x3 && yn(O3, B3, N4, E3 + 4), j3.La && Nn(O3, B3, N4, E3);
                else {
                  var q3 = U3.B, D3 = U3.qa, R3 = U3.ra + 8 * C3 * q3 + 8 * A4, T3 = U3.Ha, U3 = U3.Ia + 8 * C3 * q3 + 8 * A4;
                  C3 = j3.ld;
                  0 < A4 && (fn(O3, B3, N4, E3 + 4, M3, C3), pn(D3, R3, T3, U3, q3, E3 + 4, M3, C3)), j3.La && (mn(O3, B3, N4, E3, M3, C3), bn(D3, R3, T3, U3, q3, E3, M3, C3)), 0 < x3 && (ln2(O3, B3, N4, E3 + 4, M3, C3), dn(D3, R3, T3, U3, q3, E3 + 4, M3, C3)), j3.La && (gn(O3, B3, N4, E3, M3, C3), vn(D3, R3, T3, U3, q3, E3, M3, C3));
                }
              }
              if (s4.ia && alert("todo:DitherRow"), null != c5.put) {
                if (L4 = 16 * P3, P3 = 16 * (P3 + 1), I3 ? (c5.y = s4.sa, c5.O = s4.ta + w4, c5.f = s4.qa, c5.N = s4.ra + _3, c5.ea = s4.Ha, c5.W = s4.Ia + _3) : (L4 -= y4, c5.y = d5, c5.O = p5, c5.f = g5, c5.N = l5, c5.ea = m5, c5.W = v5), b4 || (P3 -= y4), P3 > c5.o && (P3 = c5.o), c5.F = null, c5.J = null, null != s4.Fa && 0 < s4.Fa.length && L4 < P3 && (c5.J = lr(s4, c5, L4, P3 - L4), c5.F = s4.mb, null == c5.F && 0 == c5.F.length)) {
                  u5 = Jt2(s4, 3, "Could not decode alpha data.");
                  break t;
                }
                L4 < c5.j && (y4 = c5.j - L4, L4 = c5.j, e(!(1 & y4)), c5.O += s4.R * y4, c5.N += s4.B * (y4 >> 1), c5.W += s4.B * (y4 >> 1), null != c5.F && (c5.J += c5.width * y4)), L4 < P3 && (c5.O += c5.v, c5.N += c5.v >> 1, c5.W += c5.v >> 1, null != c5.F && (c5.J += c5.v), c5.ka = L4 - c5.j, c5.U = c5.va - c5.v, c5.T = P3 - L4, u5 = c5.put(c5));
              }
              o3 + 1 != s4.Ic || b4 || (n2(s4.sa, s4.ta - h5, d5, p5 + 16 * s4.R, h5), n2(s4.qa, s4.ra - f5, g5, l5 + 8 * s4.B, f5), n2(s4.Ha, s4.Ia - f5, m5, v5 + 8 * s4.B, f5));
            }
            if (!u5) return Jt2(t6, 6, "Output aborted.");
          }
          return 1;
        }(t5, r2)), null != r2.bc && r2.bc(r2), s3 &= 1;
      }
      return s3 ? (t5.cb = 0, s3) : 0;
    }
    function te2(t5, e2, r2, n3, i3) {
      i3 = t5[e2 + r2 + 32 * n3] + (i3 >> 3), t5[e2 + r2 + 32 * n3] = -256 & i3 ? 0 > i3 ? 0 : 255 : i3;
    }
    function ee2(t5, e2, r2, n3, i3, a3) {
      te2(t5, e2, 0, r2, n3 + i3), te2(t5, e2, 1, r2, n3 + a3), te2(t5, e2, 2, r2, n3 - a3), te2(t5, e2, 3, r2, n3 - i3);
    }
    function re2(t5) {
      return (20091 * t5 >> 16) + t5;
    }
    function ne2(t5, e2, r2, n3) {
      var i3, o3 = 0, s3 = a2(16);
      for (i3 = 0; 4 > i3; ++i3) {
        var c4 = t5[e2 + 0] + t5[e2 + 8], u4 = t5[e2 + 0] - t5[e2 + 8], h4 = (35468 * t5[e2 + 4] >> 16) - re2(t5[e2 + 12]), l4 = re2(t5[e2 + 4]) + (35468 * t5[e2 + 12] >> 16);
        s3[o3 + 0] = c4 + l4, s3[o3 + 1] = u4 + h4, s3[o3 + 2] = u4 - h4, s3[o3 + 3] = c4 - l4, o3 += 4, e2++;
      }
      for (i3 = o3 = 0; 4 > i3; ++i3) c4 = (t5 = s3[o3 + 0] + 4) + s3[o3 + 8], u4 = t5 - s3[o3 + 8], h4 = (35468 * s3[o3 + 4] >> 16) - re2(s3[o3 + 12]), te2(r2, n3, 0, 0, c4 + (l4 = re2(s3[o3 + 4]) + (35468 * s3[o3 + 12] >> 16))), te2(r2, n3, 1, 0, u4 + h4), te2(r2, n3, 2, 0, u4 - h4), te2(r2, n3, 3, 0, c4 - l4), o3++, n3 += 32;
    }
    function ie2(t5, e2, r2, n3) {
      var i3 = t5[e2 + 0] + 4, a3 = 35468 * t5[e2 + 4] >> 16, o3 = re2(t5[e2 + 4]), s3 = 35468 * t5[e2 + 1] >> 16;
      ee2(r2, n3, 0, i3 + o3, t5 = re2(t5[e2 + 1]), s3), ee2(r2, n3, 1, i3 + a3, t5, s3), ee2(r2, n3, 2, i3 - a3, t5, s3), ee2(r2, n3, 3, i3 - o3, t5, s3);
    }
    function ae2(t5, e2, r2, n3, i3) {
      ne2(t5, e2, r2, n3), i3 && ne2(t5, e2 + 16, r2, n3 + 4);
    }
    function oe2(t5, e2, r2, n3) {
      on(t5, e2 + 0, r2, n3, 1), on(t5, e2 + 32, r2, n3 + 128, 1);
    }
    function se2(t5, e2, r2, n3) {
      var i3;
      for (t5 = t5[e2 + 0] + 4, i3 = 0; 4 > i3; ++i3) for (e2 = 0; 4 > e2; ++e2) te2(r2, n3, e2, i3, t5);
    }
    function ce2(t5, e2, r2, n3) {
      t5[e2 + 0] && un(t5, e2 + 0, r2, n3), t5[e2 + 16] && un(t5, e2 + 16, r2, n3 + 4), t5[e2 + 32] && un(t5, e2 + 32, r2, n3 + 128), t5[e2 + 48] && un(t5, e2 + 48, r2, n3 + 128 + 4);
    }
    function ue2(t5, e2, r2, n3) {
      var i3, o3 = a2(16);
      for (i3 = 0; 4 > i3; ++i3) {
        var s3 = t5[e2 + 0 + i3] + t5[e2 + 12 + i3], c4 = t5[e2 + 4 + i3] + t5[e2 + 8 + i3], u4 = t5[e2 + 4 + i3] - t5[e2 + 8 + i3], h4 = t5[e2 + 0 + i3] - t5[e2 + 12 + i3];
        o3[0 + i3] = s3 + c4, o3[8 + i3] = s3 - c4, o3[4 + i3] = h4 + u4, o3[12 + i3] = h4 - u4;
      }
      for (i3 = 0; 4 > i3; ++i3) s3 = (t5 = o3[0 + 4 * i3] + 3) + o3[3 + 4 * i3], c4 = o3[1 + 4 * i3] + o3[2 + 4 * i3], u4 = o3[1 + 4 * i3] - o3[2 + 4 * i3], h4 = t5 - o3[3 + 4 * i3], r2[n3 + 0] = s3 + c4 >> 3, r2[n3 + 16] = h4 + u4 >> 3, r2[n3 + 32] = s3 - c4 >> 3, r2[n3 + 48] = h4 - u4 >> 3, n3 += 64;
    }
    function he2(t5, e2, r2) {
      var n3, i3 = e2 - 32, a3 = Bn, o3 = 255 - t5[i3 - 1];
      for (n3 = 0; n3 < r2; ++n3) {
        var s3, c4 = a3, u4 = o3 + t5[e2 - 1];
        for (s3 = 0; s3 < r2; ++s3) t5[e2 + s3] = c4[u4 + t5[i3 + s3]];
        e2 += 32;
      }
    }
    function le2(t5, e2) {
      he2(t5, e2, 4);
    }
    function fe2(t5, e2) {
      he2(t5, e2, 8);
    }
    function de2(t5, e2) {
      he2(t5, e2, 16);
    }
    function pe2(t5, e2) {
      var r2;
      for (r2 = 0; 16 > r2; ++r2) n2(t5, e2 + 32 * r2, t5, e2 - 32, 16);
    }
    function ge2(t5, e2) {
      var r2;
      for (r2 = 16; 0 < r2; --r2) i2(t5, e2, t5[e2 - 1], 16), e2 += 32;
    }
    function me2(t5, e2, r2) {
      var n3;
      for (n3 = 0; 16 > n3; ++n3) i2(e2, r2 + 32 * n3, t5, 16);
    }
    function ve2(t5, e2) {
      var r2, n3 = 16;
      for (r2 = 0; 16 > r2; ++r2) n3 += t5[e2 - 1 + 32 * r2] + t5[e2 + r2 - 32];
      me2(n3 >> 5, t5, e2);
    }
    function be2(t5, e2) {
      var r2, n3 = 8;
      for (r2 = 0; 16 > r2; ++r2) n3 += t5[e2 - 1 + 32 * r2];
      me2(n3 >> 4, t5, e2);
    }
    function ye2(t5, e2) {
      var r2, n3 = 8;
      for (r2 = 0; 16 > r2; ++r2) n3 += t5[e2 + r2 - 32];
      me2(n3 >> 4, t5, e2);
    }
    function we2(t5, e2) {
      me2(128, t5, e2);
    }
    function Ne2(t5, e2, r2) {
      return t5 + 2 * e2 + r2 + 2 >> 2;
    }
    function Le2(t5, e2) {
      var r2, i3 = e2 - 32;
      i3 = new Uint8Array([Ne2(t5[i3 - 1], t5[i3 + 0], t5[i3 + 1]), Ne2(t5[i3 + 0], t5[i3 + 1], t5[i3 + 2]), Ne2(t5[i3 + 1], t5[i3 + 2], t5[i3 + 3]), Ne2(t5[i3 + 2], t5[i3 + 3], t5[i3 + 4])]);
      for (r2 = 0; 4 > r2; ++r2) n2(t5, e2 + 32 * r2, i3, 0, i3.length);
    }
    function Ae(t5, e2) {
      var r2 = t5[e2 - 1], n3 = t5[e2 - 1 + 32], i3 = t5[e2 - 1 + 64], a3 = t5[e2 - 1 + 96];
      I2(t5, e2 + 0, 16843009 * Ne2(t5[e2 - 1 - 32], r2, n3)), I2(t5, e2 + 32, 16843009 * Ne2(r2, n3, i3)), I2(t5, e2 + 64, 16843009 * Ne2(n3, i3, a3)), I2(t5, e2 + 96, 16843009 * Ne2(i3, a3, a3));
    }
    function xe(t5, e2) {
      var r2, n3 = 4;
      for (r2 = 0; 4 > r2; ++r2) n3 += t5[e2 + r2 - 32] + t5[e2 - 1 + 32 * r2];
      for (n3 >>= 3, r2 = 0; 4 > r2; ++r2) i2(t5, e2 + 32 * r2, n3, 4);
    }
    function Se(t5, e2) {
      var r2 = t5[e2 - 1 + 0], n3 = t5[e2 - 1 + 32], i3 = t5[e2 - 1 + 64], a3 = t5[e2 - 1 - 32], o3 = t5[e2 + 0 - 32], s3 = t5[e2 + 1 - 32], c4 = t5[e2 + 2 - 32], u4 = t5[e2 + 3 - 32];
      t5[e2 + 0 + 96] = Ne2(n3, i3, t5[e2 - 1 + 96]), t5[e2 + 1 + 96] = t5[e2 + 0 + 64] = Ne2(r2, n3, i3), t5[e2 + 2 + 96] = t5[e2 + 1 + 64] = t5[e2 + 0 + 32] = Ne2(a3, r2, n3), t5[e2 + 3 + 96] = t5[e2 + 2 + 64] = t5[e2 + 1 + 32] = t5[e2 + 0 + 0] = Ne2(o3, a3, r2), t5[e2 + 3 + 64] = t5[e2 + 2 + 32] = t5[e2 + 1 + 0] = Ne2(s3, o3, a3), t5[e2 + 3 + 32] = t5[e2 + 2 + 0] = Ne2(c4, s3, o3), t5[e2 + 3 + 0] = Ne2(u4, c4, s3);
    }
    function _e(t5, e2) {
      var r2 = t5[e2 + 1 - 32], n3 = t5[e2 + 2 - 32], i3 = t5[e2 + 3 - 32], a3 = t5[e2 + 4 - 32], o3 = t5[e2 + 5 - 32], s3 = t5[e2 + 6 - 32], c4 = t5[e2 + 7 - 32];
      t5[e2 + 0 + 0] = Ne2(t5[e2 + 0 - 32], r2, n3), t5[e2 + 1 + 0] = t5[e2 + 0 + 32] = Ne2(r2, n3, i3), t5[e2 + 2 + 0] = t5[e2 + 1 + 32] = t5[e2 + 0 + 64] = Ne2(n3, i3, a3), t5[e2 + 3 + 0] = t5[e2 + 2 + 32] = t5[e2 + 1 + 64] = t5[e2 + 0 + 96] = Ne2(i3, a3, o3), t5[e2 + 3 + 32] = t5[e2 + 2 + 64] = t5[e2 + 1 + 96] = Ne2(a3, o3, s3), t5[e2 + 3 + 64] = t5[e2 + 2 + 96] = Ne2(o3, s3, c4), t5[e2 + 3 + 96] = Ne2(s3, c4, c4);
    }
    function Pe(t5, e2) {
      var r2 = t5[e2 - 1 + 0], n3 = t5[e2 - 1 + 32], i3 = t5[e2 - 1 + 64], a3 = t5[e2 - 1 - 32], o3 = t5[e2 + 0 - 32], s3 = t5[e2 + 1 - 32], c4 = t5[e2 + 2 - 32], u4 = t5[e2 + 3 - 32];
      t5[e2 + 0 + 0] = t5[e2 + 1 + 64] = a3 + o3 + 1 >> 1, t5[e2 + 1 + 0] = t5[e2 + 2 + 64] = o3 + s3 + 1 >> 1, t5[e2 + 2 + 0] = t5[e2 + 3 + 64] = s3 + c4 + 1 >> 1, t5[e2 + 3 + 0] = c4 + u4 + 1 >> 1, t5[e2 + 0 + 96] = Ne2(i3, n3, r2), t5[e2 + 0 + 64] = Ne2(n3, r2, a3), t5[e2 + 0 + 32] = t5[e2 + 1 + 96] = Ne2(r2, a3, o3), t5[e2 + 1 + 32] = t5[e2 + 2 + 96] = Ne2(a3, o3, s3), t5[e2 + 2 + 32] = t5[e2 + 3 + 96] = Ne2(o3, s3, c4), t5[e2 + 3 + 32] = Ne2(s3, c4, u4);
    }
    function ke(t5, e2) {
      var r2 = t5[e2 + 0 - 32], n3 = t5[e2 + 1 - 32], i3 = t5[e2 + 2 - 32], a3 = t5[e2 + 3 - 32], o3 = t5[e2 + 4 - 32], s3 = t5[e2 + 5 - 32], c4 = t5[e2 + 6 - 32], u4 = t5[e2 + 7 - 32];
      t5[e2 + 0 + 0] = r2 + n3 + 1 >> 1, t5[e2 + 1 + 0] = t5[e2 + 0 + 64] = n3 + i3 + 1 >> 1, t5[e2 + 2 + 0] = t5[e2 + 1 + 64] = i3 + a3 + 1 >> 1, t5[e2 + 3 + 0] = t5[e2 + 2 + 64] = a3 + o3 + 1 >> 1, t5[e2 + 0 + 32] = Ne2(r2, n3, i3), t5[e2 + 1 + 32] = t5[e2 + 0 + 96] = Ne2(n3, i3, a3), t5[e2 + 2 + 32] = t5[e2 + 1 + 96] = Ne2(i3, a3, o3), t5[e2 + 3 + 32] = t5[e2 + 2 + 96] = Ne2(a3, o3, s3), t5[e2 + 3 + 64] = Ne2(o3, s3, c4), t5[e2 + 3 + 96] = Ne2(s3, c4, u4);
    }
    function Ie(t5, e2) {
      var r2 = t5[e2 - 1 + 0], n3 = t5[e2 - 1 + 32], i3 = t5[e2 - 1 + 64], a3 = t5[e2 - 1 + 96];
      t5[e2 + 0 + 0] = r2 + n3 + 1 >> 1, t5[e2 + 2 + 0] = t5[e2 + 0 + 32] = n3 + i3 + 1 >> 1, t5[e2 + 2 + 32] = t5[e2 + 0 + 64] = i3 + a3 + 1 >> 1, t5[e2 + 1 + 0] = Ne2(r2, n3, i3), t5[e2 + 3 + 0] = t5[e2 + 1 + 32] = Ne2(n3, i3, a3), t5[e2 + 3 + 32] = t5[e2 + 1 + 64] = Ne2(i3, a3, a3), t5[e2 + 3 + 64] = t5[e2 + 2 + 64] = t5[e2 + 0 + 96] = t5[e2 + 1 + 96] = t5[e2 + 2 + 96] = t5[e2 + 3 + 96] = a3;
    }
    function Fe(t5, e2) {
      var r2 = t5[e2 - 1 + 0], n3 = t5[e2 - 1 + 32], i3 = t5[e2 - 1 + 64], a3 = t5[e2 - 1 + 96], o3 = t5[e2 - 1 - 32], s3 = t5[e2 + 0 - 32], c4 = t5[e2 + 1 - 32], u4 = t5[e2 + 2 - 32];
      t5[e2 + 0 + 0] = t5[e2 + 2 + 32] = r2 + o3 + 1 >> 1, t5[e2 + 0 + 32] = t5[e2 + 2 + 64] = n3 + r2 + 1 >> 1, t5[e2 + 0 + 64] = t5[e2 + 2 + 96] = i3 + n3 + 1 >> 1, t5[e2 + 0 + 96] = a3 + i3 + 1 >> 1, t5[e2 + 3 + 0] = Ne2(s3, c4, u4), t5[e2 + 2 + 0] = Ne2(o3, s3, c4), t5[e2 + 1 + 0] = t5[e2 + 3 + 32] = Ne2(r2, o3, s3), t5[e2 + 1 + 32] = t5[e2 + 3 + 64] = Ne2(n3, r2, o3), t5[e2 + 1 + 64] = t5[e2 + 3 + 96] = Ne2(i3, n3, r2), t5[e2 + 1 + 96] = Ne2(a3, i3, n3);
    }
    function Ce(t5, e2) {
      var r2;
      for (r2 = 0; 8 > r2; ++r2) n2(t5, e2 + 32 * r2, t5, e2 - 32, 8);
    }
    function je(t5, e2) {
      var r2;
      for (r2 = 0; 8 > r2; ++r2) i2(t5, e2, t5[e2 - 1], 8), e2 += 32;
    }
    function Oe(t5, e2, r2) {
      var n3;
      for (n3 = 0; 8 > n3; ++n3) i2(e2, r2 + 32 * n3, t5, 8);
    }
    function Be(t5, e2) {
      var r2, n3 = 8;
      for (r2 = 0; 8 > r2; ++r2) n3 += t5[e2 + r2 - 32] + t5[e2 - 1 + 32 * r2];
      Oe(n3 >> 4, t5, e2);
    }
    function Me(t5, e2) {
      var r2, n3 = 4;
      for (r2 = 0; 8 > r2; ++r2) n3 += t5[e2 + r2 - 32];
      Oe(n3 >> 3, t5, e2);
    }
    function Ee(t5, e2) {
      var r2, n3 = 4;
      for (r2 = 0; 8 > r2; ++r2) n3 += t5[e2 - 1 + 32 * r2];
      Oe(n3 >> 3, t5, e2);
    }
    function qe(t5, e2) {
      Oe(128, t5, e2);
    }
    function De(t5, e2, r2) {
      var n3 = t5[e2 - r2], i3 = t5[e2 + 0], a3 = 3 * (i3 - n3) + jn[1020 + t5[e2 - 2 * r2] - t5[e2 + r2]], o3 = On[112 + (a3 + 4 >> 3)];
      t5[e2 - r2] = Bn[255 + n3 + On[112 + (a3 + 3 >> 3)]], t5[e2 + 0] = Bn[255 + i3 - o3];
    }
    function Re(t5, e2, r2, n3) {
      var i3 = t5[e2 + 0], a3 = t5[e2 + r2];
      return Mn[255 + t5[e2 - 2 * r2] - t5[e2 - r2]] > n3 || Mn[255 + a3 - i3] > n3;
    }
    function Te(t5, e2, r2, n3) {
      return 4 * Mn[255 + t5[e2 - r2] - t5[e2 + 0]] + Mn[255 + t5[e2 - 2 * r2] - t5[e2 + r2]] <= n3;
    }
    function Ue(t5, e2, r2, n3, i3) {
      var a3 = t5[e2 - 3 * r2], o3 = t5[e2 - 2 * r2], s3 = t5[e2 - r2], c4 = t5[e2 + 0], u4 = t5[e2 + r2], h4 = t5[e2 + 2 * r2], l4 = t5[e2 + 3 * r2];
      return 4 * Mn[255 + s3 - c4] + Mn[255 + o3 - u4] > n3 ? 0 : Mn[255 + t5[e2 - 4 * r2] - a3] <= i3 && Mn[255 + a3 - o3] <= i3 && Mn[255 + o3 - s3] <= i3 && Mn[255 + l4 - h4] <= i3 && Mn[255 + h4 - u4] <= i3 && Mn[255 + u4 - c4] <= i3;
    }
    function ze(t5, e2, r2, n3) {
      var i3 = 2 * n3 + 1;
      for (n3 = 0; 16 > n3; ++n3) Te(t5, e2 + n3, r2, i3) && De(t5, e2 + n3, r2);
    }
    function He(t5, e2, r2, n3) {
      var i3 = 2 * n3 + 1;
      for (n3 = 0; 16 > n3; ++n3) Te(t5, e2 + n3 * r2, 1, i3) && De(t5, e2 + n3 * r2, 1);
    }
    function We(t5, e2, r2, n3) {
      var i3;
      for (i3 = 3; 0 < i3; --i3) ze(t5, e2 += 4 * r2, r2, n3);
    }
    function Ve(t5, e2, r2, n3) {
      var i3;
      for (i3 = 3; 0 < i3; --i3) He(t5, e2 += 4, r2, n3);
    }
    function Ge(t5, e2, r2, n3, i3, a3, o3, s3) {
      for (a3 = 2 * a3 + 1; 0 < i3--; ) {
        if (Ue(t5, e2, r2, a3, o3)) if (Re(t5, e2, r2, s3)) De(t5, e2, r2);
        else {
          var c4 = t5, u4 = e2, h4 = r2, l4 = c4[u4 - 2 * h4], f4 = c4[u4 - h4], d4 = c4[u4 + 0], p4 = c4[u4 + h4], g4 = c4[u4 + 2 * h4], m4 = 27 * (b4 = jn[1020 + 3 * (d4 - f4) + jn[1020 + l4 - p4]]) + 63 >> 7, v4 = 18 * b4 + 63 >> 7, b4 = 9 * b4 + 63 >> 7;
          c4[u4 - 3 * h4] = Bn[255 + c4[u4 - 3 * h4] + b4], c4[u4 - 2 * h4] = Bn[255 + l4 + v4], c4[u4 - h4] = Bn[255 + f4 + m4], c4[u4 + 0] = Bn[255 + d4 - m4], c4[u4 + h4] = Bn[255 + p4 - v4], c4[u4 + 2 * h4] = Bn[255 + g4 - b4];
        }
        e2 += n3;
      }
    }
    function Ye(t5, e2, r2, n3, i3, a3, o3, s3) {
      for (a3 = 2 * a3 + 1; 0 < i3--; ) {
        if (Ue(t5, e2, r2, a3, o3)) if (Re(t5, e2, r2, s3)) De(t5, e2, r2);
        else {
          var c4 = t5, u4 = e2, h4 = r2, l4 = c4[u4 - h4], f4 = c4[u4 + 0], d4 = c4[u4 + h4], p4 = On[112 + ((g4 = 3 * (f4 - l4)) + 4 >> 3)], g4 = On[112 + (g4 + 3 >> 3)], m4 = p4 + 1 >> 1;
          c4[u4 - 2 * h4] = Bn[255 + c4[u4 - 2 * h4] + m4], c4[u4 - h4] = Bn[255 + l4 + g4], c4[u4 + 0] = Bn[255 + f4 - p4], c4[u4 + h4] = Bn[255 + d4 - m4];
        }
        e2 += n3;
      }
    }
    function Je(t5, e2, r2, n3, i3, a3) {
      Ge(t5, e2, r2, 1, 16, n3, i3, a3);
    }
    function Xe(t5, e2, r2, n3, i3, a3) {
      Ge(t5, e2, 1, r2, 16, n3, i3, a3);
    }
    function Ke(t5, e2, r2, n3, i3, a3) {
      var o3;
      for (o3 = 3; 0 < o3; --o3) Ye(t5, e2 += 4 * r2, r2, 1, 16, n3, i3, a3);
    }
    function Ze(t5, e2, r2, n3, i3, a3) {
      var o3;
      for (o3 = 3; 0 < o3; --o3) Ye(t5, e2 += 4, 1, r2, 16, n3, i3, a3);
    }
    function $e(t5, e2, r2, n3, i3, a3, o3, s3) {
      Ge(t5, e2, i3, 1, 8, a3, o3, s3), Ge(r2, n3, i3, 1, 8, a3, o3, s3);
    }
    function Qe(t5, e2, r2, n3, i3, a3, o3, s3) {
      Ge(t5, e2, 1, i3, 8, a3, o3, s3), Ge(r2, n3, 1, i3, 8, a3, o3, s3);
    }
    function tr(t5, e2, r2, n3, i3, a3, o3, s3) {
      Ye(t5, e2 + 4 * i3, i3, 1, 8, a3, o3, s3), Ye(r2, n3 + 4 * i3, i3, 1, 8, a3, o3, s3);
    }
    function er(t5, e2, r2, n3, i3, a3, o3, s3) {
      Ye(t5, e2 + 4, 1, i3, 8, a3, o3, s3), Ye(r2, n3 + 4, 1, i3, 8, a3, o3, s3);
    }
    function rr() {
      this.ba = new ot2(), this.ec = [], this.cc = [], this.Mc = [], this.Dc = this.Nc = this.dc = this.fc = 0, this.Oa = new ct2(), this.memory = 0, this.Ib = "OutputFunc", this.Jb = "OutputAlphaFunc", this.Nd = "OutputRowFunc";
    }
    function nr() {
      this.data = [], this.offset = this.kd = this.ha = this.w = 0, this.na = [], this.xa = this.gb = this.Ja = this.Sa = this.P = 0;
    }
    function ir() {
      this.nc = this.Ea = this.b = this.hc = 0, this.K = [], this.w = 0;
    }
    function ar() {
      this.ua = 0, this.Wa = new M2(), this.vb = new M2(), this.md = this.xc = this.wc = 0, this.vc = [], this.Wb = 0, this.Ya = new d3(), this.yc = new l3();
    }
    function or() {
      this.xb = this.a = 0, this.l = new Gt2(), this.ca = new ot2(), this.V = [], this.Ba = 0, this.Ta = [], this.Ua = 0, this.m = new N3(), this.Pb = 0, this.wd = new N3(), this.Ma = this.$ = this.C = this.i = this.c = this.xd = 0, this.s = new ar(), this.ab = 0, this.gc = o2(4, ir), this.Oc = 0;
    }
    function sr() {
      this.Lc = this.Z = this.$a = this.i = this.c = 0, this.l = new Gt2(), this.ic = 0, this.ca = [], this.tb = 0, this.qd = null, this.rd = 0;
    }
    function cr(t5, e2, r2, n3, i3, a3, o3) {
      for (t5 = null == t5 ? 0 : t5[e2 + 0], e2 = 0; e2 < o3; ++e2) i3[a3 + e2] = t5 + r2[n3 + e2] & 255, t5 = i3[a3 + e2];
    }
    function ur(t5, e2, r2, n3, i3, a3, o3) {
      var s3;
      if (null == t5) cr(null, null, r2, n3, i3, a3, o3);
      else for (s3 = 0; s3 < o3; ++s3) i3[a3 + s3] = t5[e2 + s3] + r2[n3 + s3] & 255;
    }
    function hr(t5, e2, r2, n3, i3, a3, o3) {
      if (null == t5) cr(null, null, r2, n3, i3, a3, o3);
      else {
        var s3, c4 = t5[e2 + 0], u4 = c4, h4 = c4;
        for (s3 = 0; s3 < o3; ++s3) u4 = h4 + (c4 = t5[e2 + s3]) - u4, h4 = r2[n3 + s3] + (-256 & u4 ? 0 > u4 ? 0 : 255 : u4) & 255, u4 = c4, i3[a3 + s3] = h4;
      }
    }
    function lr(t5, r2, i3, o3) {
      var s3 = r2.width, c4 = r2.o;
      if (e(null != t5 && null != r2), 0 > i3 || 0 >= o3 || i3 + o3 > c4) return null;
      if (!t5.Cc) {
        if (null == t5.ga) {
          var u4;
          if (t5.ga = new sr(), (u4 = null == t5.ga) || (u4 = r2.width * r2.o, e(0 == t5.Gb.length), t5.Gb = a2(u4), t5.Uc = 0, null == t5.Gb ? u4 = 0 : (t5.mb = t5.Gb, t5.nb = t5.Uc, t5.rc = null, u4 = 1), u4 = !u4), !u4) {
            u4 = t5.ga;
            var h4 = t5.Fa, l4 = t5.P, f4 = t5.qc, d4 = t5.mb, p4 = t5.nb, g4 = l4 + 1, m4 = f4 - 1, b4 = u4.l;
            if (e(null != h4 && null != d4 && null != r2), mi[0] = null, mi[1] = cr, mi[2] = ur, mi[3] = hr, u4.ca = d4, u4.tb = p4, u4.c = r2.width, u4.i = r2.height, e(0 < u4.c && 0 < u4.i), 1 >= f4) r2 = 0;
            else if (u4.$a = h4[l4 + 0] >> 0 & 3, u4.Z = h4[l4 + 0] >> 2 & 3, u4.Lc = h4[l4 + 0] >> 4 & 3, l4 = h4[l4 + 0] >> 6 & 3, 0 > u4.$a || 1 < u4.$a || 4 <= u4.Z || 1 < u4.Lc || l4) r2 = 0;
            else if (b4.put = dt2, b4.ac = ft2, b4.bc = pt2, b4.ma = u4, b4.width = r2.width, b4.height = r2.height, b4.Da = r2.Da, b4.v = r2.v, b4.va = r2.va, b4.j = r2.j, b4.o = r2.o, u4.$a) t: {
              e(1 == u4.$a), r2 = kt2();
              e: for (; ; ) {
                if (null == r2) {
                  r2 = 0;
                  break t;
                }
                if (e(null != u4), u4.mc = r2, r2.c = u4.c, r2.i = u4.i, r2.l = u4.l, r2.l.ma = u4, r2.l.width = u4.c, r2.l.height = u4.i, r2.a = 0, v3(r2.m, h4, g4, m4), !It2(u4.c, u4.i, 1, r2, null)) break e;
                if (1 == r2.ab && 3 == r2.gc[0].hc && At2(r2.s) ? (u4.ic = 1, h4 = r2.c * r2.i, r2.Ta = null, r2.Ua = 0, r2.V = a2(h4), r2.Ba = 0, null == r2.V ? (r2.a = 1, r2 = 0) : r2 = 1) : (u4.ic = 0, r2 = Ft2(r2, u4.c)), !r2) break e;
                r2 = 1;
                break t;
              }
              u4.mc = null, r2 = 0;
            }
            else r2 = m4 >= u4.c * u4.i;
            u4 = !r2;
          }
          if (u4) return null;
          1 != t5.ga.Lc ? t5.Ga = 0 : o3 = c4 - i3;
        }
        e(null != t5.ga), e(i3 + o3 <= c4);
        t: {
          if (r2 = (h4 = t5.ga).c, c4 = h4.l.o, 0 == h4.$a) {
            if (g4 = t5.rc, m4 = t5.Vc, b4 = t5.Fa, l4 = t5.P + 1 + i3 * r2, f4 = t5.mb, d4 = t5.nb + i3 * r2, e(l4 <= t5.P + t5.qc), 0 != h4.Z) for (e(null != mi[h4.Z]), u4 = 0; u4 < o3; ++u4) mi[h4.Z](g4, m4, b4, l4, f4, d4, r2), g4 = f4, m4 = d4, d4 += r2, l4 += r2;
            else for (u4 = 0; u4 < o3; ++u4) n2(f4, d4, b4, l4, r2), g4 = f4, m4 = d4, d4 += r2, l4 += r2;
            t5.rc = g4, t5.Vc = m4;
          } else {
            if (e(null != h4.mc), r2 = i3 + o3, e(null != (u4 = h4.mc)), e(r2 <= u4.i), u4.C >= r2) r2 = 1;
            else if (h4.ic || mr(), h4.ic) {
              h4 = u4.V, g4 = u4.Ba, m4 = u4.c;
              var y4 = u4.i, w4 = (b4 = 1, l4 = u4.$ / m4, f4 = u4.$ % m4, d4 = u4.m, p4 = u4.s, u4.$), N4 = m4 * y4, L4 = m4 * r2, x3 = p4.wc, _3 = w4 < L4 ? wt2(p4, f4, l4) : null;
              e(w4 <= N4), e(r2 <= y4), e(At2(p4));
              e: for (; ; ) {
                for (; !d4.h && w4 < L4; ) {
                  if (f4 & x3 || (_3 = wt2(p4, f4, l4)), e(null != _3), S2(d4), 256 > (y4 = bt2(_3.G[0], _3.H[0], d4))) h4[g4 + w4] = y4, ++w4, ++f4 >= m4 && (f4 = 0, ++l4 <= r2 && !(l4 % 16) && St(u4, l4));
                  else {
                    if (!(280 > y4)) {
                      b4 = 0;
                      break e;
                    }
                    y4 = mt2(y4 - 256, d4);
                    var P3, k3 = bt2(_3.G[4], _3.H[4], d4);
                    if (S2(d4), !(w4 >= (k3 = vt2(m4, k3 = mt2(k3, d4))) && N4 - w4 >= y4)) {
                      b4 = 0;
                      break e;
                    }
                    for (P3 = 0; P3 < y4; ++P3) h4[g4 + w4 + P3] = h4[g4 + w4 + P3 - k3];
                    for (w4 += y4, f4 += y4; f4 >= m4; ) f4 -= m4, ++l4 <= r2 && !(l4 % 16) && St(u4, l4);
                    w4 < L4 && f4 & x3 && (_3 = wt2(p4, f4, l4));
                  }
                  e(d4.h == A3(d4));
                }
                St(u4, l4 > r2 ? r2 : l4);
                break e;
              }
              !b4 || d4.h && w4 < N4 ? (b4 = 0, u4.a = d4.h ? 5 : 3) : u4.$ = w4, r2 = b4;
            } else r2 = _t2(u4, u4.V, u4.Ba, u4.c, u4.i, r2, Ct2);
            if (!r2) {
              o3 = 0;
              break t;
            }
          }
          i3 + o3 >= c4 && (t5.Cc = 1), o3 = 1;
        }
        if (!o3) return null;
        if (t5.Cc && (null != (o3 = t5.ga) && (o3.mc = null), t5.ga = null, 0 < t5.Ga)) return alert("todo:WebPDequantizeLevels"), null;
      }
      return t5.nb + i3 * s3;
    }
    function fr(t5, e2, r2, n3, i3, a3) {
      for (; 0 < i3--; ) {
        var o3, s3 = t5, c4 = e2 + (r2 ? 1 : 0), u4 = t5, h4 = e2 + (r2 ? 0 : 3);
        for (o3 = 0; o3 < n3; ++o3) {
          var l4 = u4[h4 + 4 * o3];
          255 != l4 && (l4 *= 32897, s3[c4 + 4 * o3 + 0] = s3[c4 + 4 * o3 + 0] * l4 >> 23, s3[c4 + 4 * o3 + 1] = s3[c4 + 4 * o3 + 1] * l4 >> 23, s3[c4 + 4 * o3 + 2] = s3[c4 + 4 * o3 + 2] * l4 >> 23);
        }
        e2 += a3;
      }
    }
    function dr(t5, e2, r2, n3, i3) {
      for (; 0 < n3--; ) {
        var a3;
        for (a3 = 0; a3 < r2; ++a3) {
          var o3 = t5[e2 + 2 * a3 + 0], s3 = 15 & (u4 = t5[e2 + 2 * a3 + 1]), c4 = 4369 * s3, u4 = (240 & u4 | u4 >> 4) * c4 >> 16;
          t5[e2 + 2 * a3 + 0] = (240 & o3 | o3 >> 4) * c4 >> 16 & 240 | (15 & o3 | o3 << 4) * c4 >> 16 >> 4 & 15, t5[e2 + 2 * a3 + 1] = 240 & u4 | s3;
        }
        e2 += i3;
      }
    }
    function pr(t5, e2, r2, n3, i3, a3, o3, s3) {
      var c4, u4, h4 = 255;
      for (u4 = 0; u4 < i3; ++u4) {
        for (c4 = 0; c4 < n3; ++c4) {
          var l4 = t5[e2 + c4];
          a3[o3 + 4 * c4] = l4, h4 &= l4;
        }
        e2 += r2, o3 += s3;
      }
      return 255 != h4;
    }
    function gr(t5, e2, r2, n3, i3) {
      var a3;
      for (a3 = 0; a3 < i3; ++a3) r2[n3 + a3] = t5[e2 + a3] >> 8;
    }
    function mr() {
      An = fr, xn = dr, Sn = pr, _n = gr;
    }
    function vr(r2, n3, i3) {
      t4[r2] = function(t5, r3, a3, o3, s3, c4, u4, h4, l4, f4, d4, p4, g4, m4, v4, b4, y4) {
        var w4, N4 = y4 - 1 >> 1, L4 = s3[c4 + 0] | u4[h4 + 0] << 16, A4 = l4[f4 + 0] | d4[p4 + 0] << 16;
        e(null != t5);
        var x3 = 3 * L4 + A4 + 131074 >> 2;
        for (n3(t5[r3 + 0], 255 & x3, x3 >> 16, g4, m4), null != a3 && (x3 = 3 * A4 + L4 + 131074 >> 2, n3(a3[o3 + 0], 255 & x3, x3 >> 16, v4, b4)), w4 = 1; w4 <= N4; ++w4) {
          var S3 = s3[c4 + w4] | u4[h4 + w4] << 16, _3 = l4[f4 + w4] | d4[p4 + w4] << 16, P3 = L4 + S3 + A4 + _3 + 524296, k3 = P3 + 2 * (S3 + A4) >> 3;
          x3 = k3 + L4 >> 1, L4 = (P3 = P3 + 2 * (L4 + _3) >> 3) + S3 >> 1, n3(t5[r3 + 2 * w4 - 1], 255 & x3, x3 >> 16, g4, m4 + (2 * w4 - 1) * i3), n3(t5[r3 + 2 * w4 - 0], 255 & L4, L4 >> 16, g4, m4 + (2 * w4 - 0) * i3), null != a3 && (x3 = P3 + A4 >> 1, L4 = k3 + _3 >> 1, n3(a3[o3 + 2 * w4 - 1], 255 & x3, x3 >> 16, v4, b4 + (2 * w4 - 1) * i3), n3(a3[o3 + 2 * w4 + 0], 255 & L4, L4 >> 16, v4, b4 + (2 * w4 + 0) * i3)), L4 = S3, A4 = _3;
        }
        1 & y4 || (x3 = 3 * L4 + A4 + 131074 >> 2, n3(t5[r3 + y4 - 1], 255 & x3, x3 >> 16, g4, m4 + (y4 - 1) * i3), null != a3 && (x3 = 3 * A4 + L4 + 131074 >> 2, n3(a3[o3 + y4 - 1], 255 & x3, x3 >> 16, v4, b4 + (y4 - 1) * i3)));
      };
    }
    function br() {
      vi[En] = bi, vi[qn] = wi, vi[Dn] = yi, vi[Rn] = Ni, vi[Tn] = Li, vi[Un] = Ai, vi[zn] = xi, vi[Hn] = wi, vi[Wn] = Ni, vi[Vn] = Li, vi[Gn] = Ai;
    }
    function yr(t5) {
      return t5 & -16384 ? 0 > t5 ? 0 : 255 : t5 >> Ii;
    }
    function wr(t5, e2) {
      return yr((19077 * t5 >> 8) + (26149 * e2 >> 8) - 14234);
    }
    function Nr(t5, e2, r2) {
      return yr((19077 * t5 >> 8) - (6419 * e2 >> 8) - (13320 * r2 >> 8) + 8708);
    }
    function Lr(t5, e2) {
      return yr((19077 * t5 >> 8) + (33050 * e2 >> 8) - 17685);
    }
    function Ar(t5, e2, r2, n3, i3) {
      n3[i3 + 0] = wr(t5, r2), n3[i3 + 1] = Nr(t5, e2, r2), n3[i3 + 2] = Lr(t5, e2);
    }
    function xr(t5, e2, r2, n3, i3) {
      n3[i3 + 0] = Lr(t5, e2), n3[i3 + 1] = Nr(t5, e2, r2), n3[i3 + 2] = wr(t5, r2);
    }
    function Sr(t5, e2, r2, n3, i3) {
      var a3 = Nr(t5, e2, r2);
      e2 = a3 << 3 & 224 | Lr(t5, e2) >> 3, n3[i3 + 0] = 248 & wr(t5, r2) | a3 >> 5, n3[i3 + 1] = e2;
    }
    function _r(t5, e2, r2, n3, i3) {
      var a3 = 240 & Lr(t5, e2) | 15;
      n3[i3 + 0] = 240 & wr(t5, r2) | Nr(t5, e2, r2) >> 4, n3[i3 + 1] = a3;
    }
    function Pr(t5, e2, r2, n3, i3) {
      n3[i3 + 0] = 255, Ar(t5, e2, r2, n3, i3 + 1);
    }
    function kr(t5, e2, r2, n3, i3) {
      xr(t5, e2, r2, n3, i3), n3[i3 + 3] = 255;
    }
    function Ir(t5, e2, r2, n3, i3) {
      Ar(t5, e2, r2, n3, i3), n3[i3 + 3] = 255;
    }
    function Vt2(t5, e2) {
      return 0 > t5 ? 0 : t5 > e2 ? e2 : t5;
    }
    function Fr(e2, r2, n3) {
      t4[e2] = function(t5, e3, i3, a3, o3, s3, c4, u4, h4) {
        for (var l4 = u4 + (-2 & h4) * n3; u4 != l4; ) r2(t5[e3 + 0], i3[a3 + 0], o3[s3 + 0], c4, u4), r2(t5[e3 + 1], i3[a3 + 0], o3[s3 + 0], c4, u4 + n3), e3 += 2, ++a3, ++s3, u4 += 2 * n3;
        1 & h4 && r2(t5[e3 + 0], i3[a3 + 0], o3[s3 + 0], c4, u4);
      };
    }
    function Cr(t5, e2, r2) {
      return 0 == r2 ? 0 == t5 ? 0 == e2 ? 6 : 5 : 0 == e2 ? 4 : 0 : r2;
    }
    function jr(t5, e2, r2, n3, i3) {
      switch (t5 >>> 30) {
        case 3:
          on(e2, r2, n3, i3, 0);
          break;
        case 2:
          sn(e2, r2, n3, i3);
          break;
        case 1:
          un(e2, r2, n3, i3);
      }
    }
    function Or(t5, e2) {
      var r2, a3, o3 = e2.M, s3 = e2.Nb, c4 = t5.oc, u4 = t5.pc + 40, h4 = t5.oc, l4 = t5.pc + 584, f4 = t5.oc, d4 = t5.pc + 600;
      for (r2 = 0; 16 > r2; ++r2) c4[u4 + 32 * r2 - 1] = 129;
      for (r2 = 0; 8 > r2; ++r2) h4[l4 + 32 * r2 - 1] = 129, f4[d4 + 32 * r2 - 1] = 129;
      for (0 < o3 ? c4[u4 - 1 - 32] = h4[l4 - 1 - 32] = f4[d4 - 1 - 32] = 129 : (i2(c4, u4 - 32 - 1, 127, 21), i2(h4, l4 - 32 - 1, 127, 9), i2(f4, d4 - 32 - 1, 127, 9)), a3 = 0; a3 < t5.za; ++a3) {
        var p4 = e2.ya[e2.aa + a3];
        if (0 < a3) {
          for (r2 = -1; 16 > r2; ++r2) n2(c4, u4 + 32 * r2 - 4, c4, u4 + 32 * r2 + 12, 4);
          for (r2 = -1; 8 > r2; ++r2) n2(h4, l4 + 32 * r2 - 4, h4, l4 + 32 * r2 + 4, 4), n2(f4, d4 + 32 * r2 - 4, f4, d4 + 32 * r2 + 4, 4);
        }
        var g4 = t5.Gd, m4 = t5.Hd + a3, v4 = p4.ad, b4 = p4.Hc;
        if (0 < o3 && (n2(c4, u4 - 32, g4[m4].y, 0, 16), n2(h4, l4 - 32, g4[m4].f, 0, 8), n2(f4, d4 - 32, g4[m4].ea, 0, 8)), p4.Za) {
          var y4 = c4, w4 = u4 - 32 + 16;
          for (0 < o3 && (a3 >= t5.za - 1 ? i2(y4, w4, g4[m4].y[15], 4) : n2(y4, w4, g4[m4 + 1].y, 0, 4)), r2 = 0; 4 > r2; r2++) y4[w4 + 128 + r2] = y4[w4 + 256 + r2] = y4[w4 + 384 + r2] = y4[w4 + 0 + r2];
          for (r2 = 0; 16 > r2; ++r2, b4 <<= 2) y4 = c4, w4 = u4 + Di[r2], fi[p4.Ob[r2]](y4, w4), jr(b4, v4, 16 * +r2, y4, w4);
        } else if (y4 = Cr(a3, o3, p4.Ob[0]), li[y4](c4, u4), 0 != b4) for (r2 = 0; 16 > r2; ++r2, b4 <<= 2) jr(b4, v4, 16 * +r2, c4, u4 + Di[r2]);
        for (r2 = p4.Gc, y4 = Cr(a3, o3, p4.Dd), di[y4](h4, l4), di[y4](f4, d4), b4 = v4, y4 = h4, w4 = l4, 255 & (p4 = r2 >> 0) && (170 & p4 ? cn(b4, 256, y4, w4) : hn(b4, 256, y4, w4)), p4 = f4, b4 = d4, 255 & (r2 >>= 8) && (170 & r2 ? cn(v4, 320, p4, b4) : hn(v4, 320, p4, b4)), o3 < t5.Ub - 1 && (n2(g4[m4].y, 0, c4, u4 + 480, 16), n2(g4[m4].f, 0, h4, l4 + 224, 8), n2(g4[m4].ea, 0, f4, d4 + 224, 8)), r2 = 8 * s3 * t5.B, g4 = t5.sa, m4 = t5.ta + 16 * a3 + 16 * s3 * t5.R, v4 = t5.qa, p4 = t5.ra + 8 * a3 + r2, b4 = t5.Ha, y4 = t5.Ia + 8 * a3 + r2, r2 = 0; 16 > r2; ++r2) n2(g4, m4 + r2 * t5.R, c4, u4 + 32 * r2, 16);
        for (r2 = 0; 8 > r2; ++r2) n2(v4, p4 + r2 * t5.B, h4, l4 + 32 * r2, 8), n2(b4, y4 + r2 * t5.B, f4, d4 + 32 * r2, 8);
      }
    }
    function Br(t5, n3, i3, a3, o3, s3, c4, u4, h4) {
      var l4 = [0], f4 = [0], d4 = 0, p4 = null != h4 ? h4.kd : 0, g4 = null != h4 ? h4 : new nr();
      if (null == t5 || 12 > i3) return 7;
      g4.data = t5, g4.w = n3, g4.ha = i3, n3 = [n3], i3 = [i3], g4.gb = [g4.gb];
      t: {
        var m4 = n3, b4 = i3, y4 = g4.gb;
        if (e(null != t5), e(null != b4), e(null != y4), y4[0] = 0, 12 <= b4[0] && !r(t5, m4[0], "RIFF")) {
          if (r(t5, m4[0] + 8, "WEBP")) {
            y4 = 3;
            break t;
          }
          var w4 = j2(t5, m4[0] + 4);
          if (12 > w4 || 4294967286 < w4) {
            y4 = 3;
            break t;
          }
          if (p4 && w4 > b4[0] - 8) {
            y4 = 7;
            break t;
          }
          y4[0] = w4, m4[0] += 12, b4[0] -= 12;
        }
        y4 = 0;
      }
      if (0 != y4) return y4;
      for (w4 = 0 < g4.gb[0], i3 = i3[0]; ; ) {
        t: {
          var L4 = t5;
          b4 = n3, y4 = i3;
          var A4 = l4, x3 = f4, S3 = m4 = [0];
          if ((k3 = d4 = [d4])[0] = 0, 8 > y4[0]) y4 = 7;
          else {
            if (!r(L4, b4[0], "VP8X")) {
              if (10 != j2(L4, b4[0] + 4)) {
                y4 = 3;
                break t;
              }
              if (18 > y4[0]) {
                y4 = 7;
                break t;
              }
              var _3 = j2(L4, b4[0] + 8), P3 = 1 + C2(L4, b4[0] + 12);
              if (2147483648 <= P3 * (L4 = 1 + C2(L4, b4[0] + 15))) {
                y4 = 3;
                break t;
              }
              null != S3 && (S3[0] = _3), null != A4 && (A4[0] = P3), null != x3 && (x3[0] = L4), b4[0] += 18, y4[0] -= 18, k3[0] = 1;
            }
            y4 = 0;
          }
        }
        if (d4 = d4[0], m4 = m4[0], 0 != y4) return y4;
        if (b4 = !!(2 & m4), !w4 && d4) return 3;
        if (null != s3 && (s3[0] = !!(16 & m4)), null != c4 && (c4[0] = b4), null != u4 && (u4[0] = 0), c4 = l4[0], m4 = f4[0], d4 && b4 && null == h4) {
          y4 = 0;
          break;
        }
        if (4 > i3) {
          y4 = 7;
          break;
        }
        if (w4 && d4 || !w4 && !d4 && !r(t5, n3[0], "ALPH")) {
          i3 = [i3], g4.na = [g4.na], g4.P = [g4.P], g4.Sa = [g4.Sa];
          t: {
            _3 = t5, y4 = n3, w4 = i3;
            var k3 = g4.gb;
            A4 = g4.na, x3 = g4.P, S3 = g4.Sa;
            P3 = 22, e(null != _3), e(null != w4), L4 = y4[0];
            var I3 = w4[0];
            for (e(null != A4), e(null != S3), A4[0] = null, x3[0] = null, S3[0] = 0; ; ) {
              if (y4[0] = L4, w4[0] = I3, 8 > I3) {
                y4 = 7;
                break t;
              }
              var F3 = j2(_3, L4 + 4);
              if (4294967286 < F3) {
                y4 = 3;
                break t;
              }
              var O3 = 8 + F3 + 1 & -2;
              if (P3 += O3, 0 < k3 && P3 > k3) {
                y4 = 3;
                break t;
              }
              if (!r(_3, L4, "VP8 ") || !r(_3, L4, "VP8L")) {
                y4 = 0;
                break t;
              }
              if (I3[0] < O3) {
                y4 = 7;
                break t;
              }
              r(_3, L4, "ALPH") || (A4[0] = _3, x3[0] = L4 + 8, S3[0] = F3), L4 += O3, I3 -= O3;
            }
          }
          if (i3 = i3[0], g4.na = g4.na[0], g4.P = g4.P[0], g4.Sa = g4.Sa[0], 0 != y4) break;
        }
        i3 = [i3], g4.Ja = [g4.Ja], g4.xa = [g4.xa];
        t: if (k3 = t5, y4 = n3, w4 = i3, A4 = g4.gb[0], x3 = g4.Ja, S3 = g4.xa, _3 = y4[0], L4 = !r(k3, _3, "VP8 "), P3 = !r(k3, _3, "VP8L"), e(null != k3), e(null != w4), e(null != x3), e(null != S3), 8 > w4[0]) y4 = 7;
        else {
          if (L4 || P3) {
            if (k3 = j2(k3, _3 + 4), 12 <= A4 && k3 > A4 - 12) {
              y4 = 3;
              break t;
            }
            if (p4 && k3 > w4[0] - 8) {
              y4 = 7;
              break t;
            }
            x3[0] = k3, y4[0] += 8, w4[0] -= 8, S3[0] = P3;
          } else S3[0] = 5 <= w4[0] && 47 == k3[_3 + 0] && !(k3[_3 + 4] >> 5), x3[0] = w4[0];
          y4 = 0;
        }
        if (i3 = i3[0], g4.Ja = g4.Ja[0], g4.xa = g4.xa[0], n3 = n3[0], 0 != y4) break;
        if (4294967286 < g4.Ja) return 3;
        if (null == u4 || b4 || (u4[0] = g4.xa ? 2 : 1), c4 = [c4], m4 = [m4], g4.xa) {
          if (5 > i3) {
            y4 = 7;
            break;
          }
          u4 = c4, p4 = m4, b4 = s3, null == t5 || 5 > i3 ? t5 = 0 : 5 <= i3 && 47 == t5[n3 + 0] && !(t5[n3 + 4] >> 5) ? (w4 = [0], k3 = [0], A4 = [0], v3(x3 = new N3(), t5, n3, i3), gt2(x3, w4, k3, A4) ? (null != u4 && (u4[0] = w4[0]), null != p4 && (p4[0] = k3[0]), null != b4 && (b4[0] = A4[0]), t5 = 1) : t5 = 0) : t5 = 0;
        } else {
          if (10 > i3) {
            y4 = 7;
            break;
          }
          u4 = m4, null == t5 || 10 > i3 || !Xt2(t5, n3 + 3, i3 - 3) ? t5 = 0 : (p4 = t5[n3 + 0] | t5[n3 + 1] << 8 | t5[n3 + 2] << 16, b4 = 16383 & (t5[n3 + 7] << 8 | t5[n3 + 6]), t5 = 16383 & (t5[n3 + 9] << 8 | t5[n3 + 8]), 1 & p4 || 3 < (p4 >> 1 & 7) || !(p4 >> 4 & 1) || p4 >> 5 >= g4.Ja || !b4 || !t5 ? t5 = 0 : (c4 && (c4[0] = b4), u4 && (u4[0] = t5), t5 = 1));
        }
        if (!t5) return 3;
        if (c4 = c4[0], m4 = m4[0], d4 && (l4[0] != c4 || f4[0] != m4)) return 3;
        null != h4 && (h4[0] = g4, h4.offset = n3 - h4.w, e(4294967286 > n3 - h4.w), e(h4.offset == h4.ha - i3));
        break;
      }
      return 0 == y4 || 7 == y4 && d4 && null == h4 ? (null != s3 && (s3[0] |= null != g4.na && 0 < g4.na.length), null != a3 && (a3[0] = c4), null != o3 && (o3[0] = m4), 0) : y4;
    }
    function Mr(t5, e2, r2) {
      var n3 = e2.width, i3 = e2.height, a3 = 0, o3 = 0, s3 = n3, c4 = i3;
      if (e2.Da = null != t5 && 0 < t5.Da, e2.Da && (s3 = t5.cd, c4 = t5.bd, a3 = t5.v, o3 = t5.j, 11 > r2 || (a3 &= -2, o3 &= -2), 0 > a3 || 0 > o3 || 0 >= s3 || 0 >= c4 || a3 + s3 > n3 || o3 + c4 > i3)) return 0;
      if (e2.v = a3, e2.j = o3, e2.va = a3 + s3, e2.o = o3 + c4, e2.U = s3, e2.T = c4, e2.da = null != t5 && 0 < t5.da, e2.da) {
        if (!E2(s3, c4, r2 = [t5.ib], a3 = [t5.hb])) return 0;
        e2.ib = r2[0], e2.hb = a3[0];
      }
      return e2.ob = null != t5 && t5.ob, e2.Kb = null == t5 || !t5.Sd, e2.da && (e2.ob = e2.ib < 3 * n3 / 4 && e2.hb < 3 * i3 / 4, e2.Kb = 0), 1;
    }
    function Er(t5) {
      if (null == t5) return 2;
      if (11 > t5.S) {
        var e2 = t5.f.RGBA;
        e2.fb += (t5.height - 1) * e2.A, e2.A = -e2.A;
      } else e2 = t5.f.kb, t5 = t5.height, e2.O += (t5 - 1) * e2.fa, e2.fa = -e2.fa, e2.N += (t5 - 1 >> 1) * e2.Ab, e2.Ab = -e2.Ab, e2.W += (t5 - 1 >> 1) * e2.Db, e2.Db = -e2.Db, null != e2.F && (e2.J += (t5 - 1) * e2.lb, e2.lb = -e2.lb);
      return 0;
    }
    function qr(t5, e2, r2, n3) {
      if (null == n3 || 0 >= t5 || 0 >= e2) return 2;
      if (null != r2) {
        if (r2.Da) {
          var i3 = r2.cd, o3 = r2.bd, s3 = -2 & r2.v, c4 = -2 & r2.j;
          if (0 > s3 || 0 > c4 || 0 >= i3 || 0 >= o3 || s3 + i3 > t5 || c4 + o3 > e2) return 2;
          t5 = i3, e2 = o3;
        }
        if (r2.da) {
          if (!E2(t5, e2, i3 = [r2.ib], o3 = [r2.hb])) return 2;
          t5 = i3[0], e2 = o3[0];
        }
      }
      n3.width = t5, n3.height = e2;
      t: {
        var u4 = n3.width, h4 = n3.height;
        if (t5 = n3.S, 0 >= u4 || 0 >= h4 || !(t5 >= En && 13 > t5)) t5 = 2;
        else {
          if (0 >= n3.Rd && null == n3.sd) {
            s3 = o3 = i3 = e2 = 0;
            var l4 = (c4 = u4 * zi[t5]) * h4;
            if (11 > t5 || (o3 = (h4 + 1) / 2 * (e2 = (u4 + 1) / 2), 12 == t5 && (s3 = (i3 = u4) * h4)), null == (h4 = a2(l4 + 2 * o3 + s3))) {
              t5 = 1;
              break t;
            }
            n3.sd = h4, 11 > t5 ? ((u4 = n3.f.RGBA).eb = h4, u4.fb = 0, u4.A = c4, u4.size = l4) : ((u4 = n3.f.kb).y = h4, u4.O = 0, u4.fa = c4, u4.Fd = l4, u4.f = h4, u4.N = 0 + l4, u4.Ab = e2, u4.Cd = o3, u4.ea = h4, u4.W = 0 + l4 + o3, u4.Db = e2, u4.Ed = o3, 12 == t5 && (u4.F = h4, u4.J = 0 + l4 + 2 * o3), u4.Tc = s3, u4.lb = i3);
          }
          if (e2 = 1, i3 = n3.S, o3 = n3.width, s3 = n3.height, i3 >= En && 13 > i3) if (11 > i3) t5 = n3.f.RGBA, e2 &= (c4 = Math.abs(t5.A)) * (s3 - 1) + o3 <= t5.size, e2 &= c4 >= o3 * zi[i3], e2 &= null != t5.eb;
          else {
            t5 = n3.f.kb, c4 = (o3 + 1) / 2, l4 = (s3 + 1) / 2, u4 = Math.abs(t5.fa);
            h4 = Math.abs(t5.Ab);
            var f4 = Math.abs(t5.Db), d4 = Math.abs(t5.lb), p4 = d4 * (s3 - 1) + o3;
            e2 &= u4 * (s3 - 1) + o3 <= t5.Fd, e2 &= h4 * (l4 - 1) + c4 <= t5.Cd, e2 = (e2 &= f4 * (l4 - 1) + c4 <= t5.Ed) & u4 >= o3 & h4 >= c4 & f4 >= c4, e2 &= null != t5.y, e2 &= null != t5.f, e2 &= null != t5.ea, 12 == i3 && (e2 &= d4 >= o3, e2 &= p4 <= t5.Tc, e2 &= null != t5.F);
          }
          else e2 = 0;
          t5 = e2 ? 0 : 2;
        }
      }
      return 0 != t5 || null != r2 && r2.fd && (t5 = Er(n3)), t5;
    }
    var Dr = 64, Rr = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535, 131071, 262143, 524287, 1048575, 2097151, 4194303, 8388607, 16777215], Tr = 24, Ur = 32, zr = 8, Hr = [0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];
    R2("Predictor0", "PredictorAdd0"), t4.Predictor0 = function() {
      return 4278190080;
    }, t4.Predictor1 = function(t5) {
      return t5;
    }, t4.Predictor2 = function(t5, e2, r2) {
      return e2[r2 + 0];
    }, t4.Predictor3 = function(t5, e2, r2) {
      return e2[r2 + 1];
    }, t4.Predictor4 = function(t5, e2, r2) {
      return e2[r2 - 1];
    }, t4.Predictor5 = function(t5, e2, r2) {
      return U2(U2(t5, e2[r2 + 1]), e2[r2 + 0]);
    }, t4.Predictor6 = function(t5, e2, r2) {
      return U2(t5, e2[r2 - 1]);
    }, t4.Predictor7 = function(t5, e2, r2) {
      return U2(t5, e2[r2 + 0]);
    }, t4.Predictor8 = function(t5, e2, r2) {
      return U2(e2[r2 - 1], e2[r2 + 0]);
    }, t4.Predictor9 = function(t5, e2, r2) {
      return U2(e2[r2 + 0], e2[r2 + 1]);
    }, t4.Predictor10 = function(t5, e2, r2) {
      return U2(U2(t5, e2[r2 - 1]), U2(e2[r2 + 0], e2[r2 + 1]));
    }, t4.Predictor11 = function(t5, e2, r2) {
      var n3 = e2[r2 + 0];
      return 0 >= W2(n3 >> 24 & 255, t5 >> 24 & 255, (e2 = e2[r2 - 1]) >> 24 & 255) + W2(n3 >> 16 & 255, t5 >> 16 & 255, e2 >> 16 & 255) + W2(n3 >> 8 & 255, t5 >> 8 & 255, e2 >> 8 & 255) + W2(255 & n3, 255 & t5, 255 & e2) ? n3 : t5;
    }, t4.Predictor12 = function(t5, e2, r2) {
      var n3 = e2[r2 + 0];
      return (z2((t5 >> 24 & 255) + (n3 >> 24 & 255) - ((e2 = e2[r2 - 1]) >> 24 & 255)) << 24 | z2((t5 >> 16 & 255) + (n3 >> 16 & 255) - (e2 >> 16 & 255)) << 16 | z2((t5 >> 8 & 255) + (n3 >> 8 & 255) - (e2 >> 8 & 255)) << 8 | z2((255 & t5) + (255 & n3) - (255 & e2))) >>> 0;
    }, t4.Predictor13 = function(t5, e2, r2) {
      var n3 = e2[r2 - 1];
      return (H2((t5 = U2(t5, e2[r2 + 0])) >> 24 & 255, n3 >> 24 & 255) << 24 | H2(t5 >> 16 & 255, n3 >> 16 & 255) << 16 | H2(t5 >> 8 & 255, n3 >> 8 & 255) << 8 | H2(t5 >> 0 & 255, n3 >> 0 & 255)) >>> 0;
    };
    var Wr = t4.PredictorAdd0;
    t4.PredictorAdd1 = V2, R2("Predictor2", "PredictorAdd2"), R2("Predictor3", "PredictorAdd3"), R2("Predictor4", "PredictorAdd4"), R2("Predictor5", "PredictorAdd5"), R2("Predictor6", "PredictorAdd6"), R2("Predictor7", "PredictorAdd7"), R2("Predictor8", "PredictorAdd8"), R2("Predictor9", "PredictorAdd9"), R2("Predictor10", "PredictorAdd10"), R2("Predictor11", "PredictorAdd11"), R2("Predictor12", "PredictorAdd12"), R2("Predictor13", "PredictorAdd13");
    var Vr = t4.PredictorAdd2;
    X2("ColorIndexInverseTransform", "MapARGB", "32b", function(t5) {
      return t5 >> 8 & 255;
    }, function(t5) {
      return t5;
    }), X2("VP8LColorIndexInverseTransformAlpha", "MapAlpha", "8b", function(t5) {
      return t5;
    }, function(t5) {
      return t5 >> 8 & 255;
    });
    var Gr, Yr = t4.ColorIndexInverseTransform, Jr = t4.MapARGB, Xr = t4.VP8LColorIndexInverseTransformAlpha, Kr = t4.MapAlpha, Zr = t4.VP8LPredictorsAdd = [];
    Zr.length = 16, (t4.VP8LPredictors = []).length = 16, (t4.VP8LPredictorsAdd_C = []).length = 16, (t4.VP8LPredictors_C = []).length = 16;
    var $r, Qr, tn, en, rn, nn, an, on, sn, cn, un, hn, ln2, fn, dn, pn, gn, mn, vn, bn, yn, wn, Nn, Ln, An, xn, Sn, _n, Pn = a2(511), kn = a2(2041), In = a2(225), Fn = a2(767), Cn = 0, jn = kn, On = In, Bn = Fn, Mn = Pn, En = 0, qn = 1, Dn = 2, Rn = 3, Tn = 4, Un = 5, zn = 6, Hn = 7, Wn = 8, Vn = 9, Gn = 10, Yn = [2, 3, 7], Jn = [3, 3, 11], Xn = [280, 256, 256, 256, 40], Kn = [0, 1, 1, 1, 0], Zn = [17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], $n = [24, 7, 23, 25, 40, 6, 39, 41, 22, 26, 38, 42, 56, 5, 55, 57, 21, 27, 54, 58, 37, 43, 72, 4, 71, 73, 20, 28, 53, 59, 70, 74, 36, 44, 88, 69, 75, 52, 60, 3, 87, 89, 19, 29, 86, 90, 35, 45, 68, 76, 85, 91, 51, 61, 104, 2, 103, 105, 18, 30, 102, 106, 34, 46, 84, 92, 67, 77, 101, 107, 50, 62, 120, 1, 119, 121, 83, 93, 17, 31, 100, 108, 66, 78, 118, 122, 33, 47, 117, 123, 49, 63, 99, 109, 82, 94, 0, 116, 124, 65, 79, 16, 32, 98, 110, 48, 115, 125, 81, 95, 64, 114, 126, 97, 111, 80, 113, 127, 96, 112], Qn = [2954, 2956, 2958, 2962, 2970, 2986, 3018, 3082, 3212, 3468, 3980, 5004], ti = 8, ei = [4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 25, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 93, 95, 96, 98, 100, 101, 102, 104, 106, 108, 110, 112, 114, 116, 118, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 143, 145, 148, 151, 154, 157], ri = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 119, 122, 125, 128, 131, 134, 137, 140, 143, 146, 149, 152, 155, 158, 161, 164, 167, 170, 173, 177, 181, 185, 189, 193, 197, 201, 205, 209, 213, 217, 221, 225, 229, 234, 239, 245, 249, 254, 259, 264, 269, 274, 279, 284], ni = null, ii = [[173, 148, 140, 0], [176, 155, 140, 135, 0], [180, 157, 141, 134, 130, 0], [254, 254, 243, 230, 196, 177, 153, 140, 133, 130, 129, 0]], ai = [0, 1, 4, 8, 5, 2, 3, 6, 9, 12, 13, 10, 7, 11, 14, 15], oi = [-0, 1, -1, 2, -2, 3, 4, 6, -3, 5, -4, -5, -6, 7, -7, 8, -8, -9], si = [[[[128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128], [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128], [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128]], [[253, 136, 254, 255, 228, 219, 128, 128, 128, 128, 128], [189, 129, 242, 255, 227, 213, 255, 219, 128, 128, 128], [106, 126, 227, 252, 214, 209, 255, 255, 128, 128, 128]], [[1, 98, 248, 255, 236, 226, 255, 255, 128, 128, 128], [181, 133, 238, 254, 221, 234, 255, 154, 128, 128, 128], [78, 134, 202, 247, 198, 180, 255, 219, 128, 128, 128]], [[1, 185, 249, 255, 243, 255, 128, 128, 128, 128, 128], [184, 150, 247, 255, 236, 224, 128, 128, 128, 128, 128], [77, 110, 216, 255, 236, 230, 128, 128, 128, 128, 128]], [[1, 101, 251, 255, 241, 255, 128, 128, 128, 128, 128], [170, 139, 241, 252, 236, 209, 255, 255, 128, 128, 128], [37, 116, 196, 243, 228, 255, 255, 255, 128, 128, 128]], [[1, 204, 254, 255, 245, 255, 128, 128, 128, 128, 128], [207, 160, 250, 255, 238, 128, 128, 128, 128, 128, 128], [102, 103, 231, 255, 211, 171, 128, 128, 128, 128, 128]], [[1, 152, 252, 255, 240, 255, 128, 128, 128, 128, 128], [177, 135, 243, 255, 234, 225, 128, 128, 128, 128, 128], [80, 129, 211, 255, 194, 224, 128, 128, 128, 128, 128]], [[1, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128], [246, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128], [255, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128]]], [[[198, 35, 237, 223, 193, 187, 162, 160, 145, 155, 62], [131, 45, 198, 221, 172, 176, 220, 157, 252, 221, 1], [68, 47, 146, 208, 149, 167, 221, 162, 255, 223, 128]], [[1, 149, 241, 255, 221, 224, 255, 255, 128, 128, 128], [184, 141, 234, 253, 222, 220, 255, 199, 128, 128, 128], [81, 99, 181, 242, 176, 190, 249, 202, 255, 255, 128]], [[1, 129, 232, 253, 214, 197, 242, 196, 255, 255, 128], [99, 121, 210, 250, 201, 198, 255, 202, 128, 128, 128], [23, 91, 163, 242, 170, 187, 247, 210, 255, 255, 128]], [[1, 200, 246, 255, 234, 255, 128, 128, 128, 128, 128], [109, 178, 241, 255, 231, 245, 255, 255, 128, 128, 128], [44, 130, 201, 253, 205, 192, 255, 255, 128, 128, 128]], [[1, 132, 239, 251, 219, 209, 255, 165, 128, 128, 128], [94, 136, 225, 251, 218, 190, 255, 255, 128, 128, 128], [22, 100, 174, 245, 186, 161, 255, 199, 128, 128, 128]], [[1, 182, 249, 255, 232, 235, 128, 128, 128, 128, 128], [124, 143, 241, 255, 227, 234, 128, 128, 128, 128, 128], [35, 77, 181, 251, 193, 211, 255, 205, 128, 128, 128]], [[1, 157, 247, 255, 236, 231, 255, 255, 128, 128, 128], [121, 141, 235, 255, 225, 227, 255, 255, 128, 128, 128], [45, 99, 188, 251, 195, 217, 255, 224, 128, 128, 128]], [[1, 1, 251, 255, 213, 255, 128, 128, 128, 128, 128], [203, 1, 248, 255, 255, 128, 128, 128, 128, 128, 128], [137, 1, 177, 255, 224, 255, 128, 128, 128, 128, 128]]], [[[253, 9, 248, 251, 207, 208, 255, 192, 128, 128, 128], [175, 13, 224, 243, 193, 185, 249, 198, 255, 255, 128], [73, 17, 171, 221, 161, 179, 236, 167, 255, 234, 128]], [[1, 95, 247, 253, 212, 183, 255, 255, 128, 128, 128], [239, 90, 244, 250, 211, 209, 255, 255, 128, 128, 128], [155, 77, 195, 248, 188, 195, 255, 255, 128, 128, 128]], [[1, 24, 239, 251, 218, 219, 255, 205, 128, 128, 128], [201, 51, 219, 255, 196, 186, 128, 128, 128, 128, 128], [69, 46, 190, 239, 201, 218, 255, 228, 128, 128, 128]], [[1, 191, 251, 255, 255, 128, 128, 128, 128, 128, 128], [223, 165, 249, 255, 213, 255, 128, 128, 128, 128, 128], [141, 124, 248, 255, 255, 128, 128, 128, 128, 128, 128]], [[1, 16, 248, 255, 255, 128, 128, 128, 128, 128, 128], [190, 36, 230, 255, 236, 255, 128, 128, 128, 128, 128], [149, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128]], [[1, 226, 255, 128, 128, 128, 128, 128, 128, 128, 128], [247, 192, 255, 128, 128, 128, 128, 128, 128, 128, 128], [240, 128, 255, 128, 128, 128, 128, 128, 128, 128, 128]], [[1, 134, 252, 255, 255, 128, 128, 128, 128, 128, 128], [213, 62, 250, 255, 255, 128, 128, 128, 128, 128, 128], [55, 93, 255, 128, 128, 128, 128, 128, 128, 128, 128]], [[128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128], [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128], [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128]]], [[[202, 24, 213, 235, 186, 191, 220, 160, 240, 175, 255], [126, 38, 182, 232, 169, 184, 228, 174, 255, 187, 128], [61, 46, 138, 219, 151, 178, 240, 170, 255, 216, 128]], [[1, 112, 230, 250, 199, 191, 247, 159, 255, 255, 128], [166, 109, 228, 252, 211, 215, 255, 174, 128, 128, 128], [39, 77, 162, 232, 172, 180, 245, 178, 255, 255, 128]], [[1, 52, 220, 246, 198, 199, 249, 220, 255, 255, 128], [124, 74, 191, 243, 183, 193, 250, 221, 255, 255, 128], [24, 71, 130, 219, 154, 170, 243, 182, 255, 255, 128]], [[1, 182, 225, 249, 219, 240, 255, 224, 128, 128, 128], [149, 150, 226, 252, 216, 205, 255, 171, 128, 128, 128], [28, 108, 170, 242, 183, 194, 254, 223, 255, 255, 128]], [[1, 81, 230, 252, 204, 203, 255, 192, 128, 128, 128], [123, 102, 209, 247, 188, 196, 255, 233, 128, 128, 128], [20, 95, 153, 243, 164, 173, 255, 203, 128, 128, 128]], [[1, 222, 248, 255, 216, 213, 128, 128, 128, 128, 128], [168, 175, 246, 252, 235, 205, 255, 255, 128, 128, 128], [47, 116, 215, 255, 211, 212, 255, 255, 128, 128, 128]], [[1, 121, 236, 253, 212, 214, 255, 255, 128, 128, 128], [141, 84, 213, 252, 201, 202, 255, 219, 128, 128, 128], [42, 80, 160, 240, 162, 185, 255, 205, 128, 128, 128]], [[1, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128], [244, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128], [238, 1, 255, 128, 128, 128, 128, 128, 128, 128, 128]]]], ci = [[[231, 120, 48, 89, 115, 113, 120, 152, 112], [152, 179, 64, 126, 170, 118, 46, 70, 95], [175, 69, 143, 80, 85, 82, 72, 155, 103], [56, 58, 10, 171, 218, 189, 17, 13, 152], [114, 26, 17, 163, 44, 195, 21, 10, 173], [121, 24, 80, 195, 26, 62, 44, 64, 85], [144, 71, 10, 38, 171, 213, 144, 34, 26], [170, 46, 55, 19, 136, 160, 33, 206, 71], [63, 20, 8, 114, 114, 208, 12, 9, 226], [81, 40, 11, 96, 182, 84, 29, 16, 36]], [[134, 183, 89, 137, 98, 101, 106, 165, 148], [72, 187, 100, 130, 157, 111, 32, 75, 80], [66, 102, 167, 99, 74, 62, 40, 234, 128], [41, 53, 9, 178, 241, 141, 26, 8, 107], [74, 43, 26, 146, 73, 166, 49, 23, 157], [65, 38, 105, 160, 51, 52, 31, 115, 128], [104, 79, 12, 27, 217, 255, 87, 17, 7], [87, 68, 71, 44, 114, 51, 15, 186, 23], [47, 41, 14, 110, 182, 183, 21, 17, 194], [66, 45, 25, 102, 197, 189, 23, 18, 22]], [[88, 88, 147, 150, 42, 46, 45, 196, 205], [43, 97, 183, 117, 85, 38, 35, 179, 61], [39, 53, 200, 87, 26, 21, 43, 232, 171], [56, 34, 51, 104, 114, 102, 29, 93, 77], [39, 28, 85, 171, 58, 165, 90, 98, 64], [34, 22, 116, 206, 23, 34, 43, 166, 73], [107, 54, 32, 26, 51, 1, 81, 43, 31], [68, 25, 106, 22, 64, 171, 36, 225, 114], [34, 19, 21, 102, 132, 188, 16, 76, 124], [62, 18, 78, 95, 85, 57, 50, 48, 51]], [[193, 101, 35, 159, 215, 111, 89, 46, 111], [60, 148, 31, 172, 219, 228, 21, 18, 111], [112, 113, 77, 85, 179, 255, 38, 120, 114], [40, 42, 1, 196, 245, 209, 10, 25, 109], [88, 43, 29, 140, 166, 213, 37, 43, 154], [61, 63, 30, 155, 67, 45, 68, 1, 209], [100, 80, 8, 43, 154, 1, 51, 26, 71], [142, 78, 78, 16, 255, 128, 34, 197, 171], [41, 40, 5, 102, 211, 183, 4, 1, 221], [51, 50, 17, 168, 209, 192, 23, 25, 82]], [[138, 31, 36, 171, 27, 166, 38, 44, 229], [67, 87, 58, 169, 82, 115, 26, 59, 179], [63, 59, 90, 180, 59, 166, 93, 73, 154], [40, 40, 21, 116, 143, 209, 34, 39, 175], [47, 15, 16, 183, 34, 223, 49, 45, 183], [46, 17, 33, 183, 6, 98, 15, 32, 183], [57, 46, 22, 24, 128, 1, 54, 17, 37], [65, 32, 73, 115, 28, 128, 23, 128, 205], [40, 3, 9, 115, 51, 192, 18, 6, 223], [87, 37, 9, 115, 59, 77, 64, 21, 47]], [[104, 55, 44, 218, 9, 54, 53, 130, 226], [64, 90, 70, 205, 40, 41, 23, 26, 57], [54, 57, 112, 184, 5, 41, 38, 166, 213], [30, 34, 26, 133, 152, 116, 10, 32, 134], [39, 19, 53, 221, 26, 114, 32, 73, 255], [31, 9, 65, 234, 2, 15, 1, 118, 73], [75, 32, 12, 51, 192, 255, 160, 43, 51], [88, 31, 35, 67, 102, 85, 55, 186, 85], [56, 21, 23, 111, 59, 205, 45, 37, 192], [55, 38, 70, 124, 73, 102, 1, 34, 98]], [[125, 98, 42, 88, 104, 85, 117, 175, 82], [95, 84, 53, 89, 128, 100, 113, 101, 45], [75, 79, 123, 47, 51, 128, 81, 171, 1], [57, 17, 5, 71, 102, 57, 53, 41, 49], [38, 33, 13, 121, 57, 73, 26, 1, 85], [41, 10, 67, 138, 77, 110, 90, 47, 114], [115, 21, 2, 10, 102, 255, 166, 23, 6], [101, 29, 16, 10, 85, 128, 101, 196, 26], [57, 18, 10, 102, 102, 213, 34, 20, 43], [117, 20, 15, 36, 163, 128, 68, 1, 26]], [[102, 61, 71, 37, 34, 53, 31, 243, 192], [69, 60, 71, 38, 73, 119, 28, 222, 37], [68, 45, 128, 34, 1, 47, 11, 245, 171], [62, 17, 19, 70, 146, 85, 55, 62, 70], [37, 43, 37, 154, 100, 163, 85, 160, 1], [63, 9, 92, 136, 28, 64, 32, 201, 85], [75, 15, 9, 9, 64, 255, 184, 119, 16], [86, 6, 28, 5, 64, 255, 25, 248, 1], [56, 8, 17, 132, 137, 255, 55, 116, 128], [58, 15, 20, 82, 135, 57, 26, 121, 40]], [[164, 50, 31, 137, 154, 133, 25, 35, 218], [51, 103, 44, 131, 131, 123, 31, 6, 158], [86, 40, 64, 135, 148, 224, 45, 183, 128], [22, 26, 17, 131, 240, 154, 14, 1, 209], [45, 16, 21, 91, 64, 222, 7, 1, 197], [56, 21, 39, 155, 60, 138, 23, 102, 213], [83, 12, 13, 54, 192, 255, 68, 47, 28], [85, 26, 85, 85, 128, 128, 32, 146, 171], [18, 11, 7, 63, 144, 171, 4, 4, 246], [35, 27, 10, 146, 174, 171, 12, 26, 128]], [[190, 80, 35, 99, 180, 80, 126, 54, 45], [85, 126, 47, 87, 176, 51, 41, 20, 32], [101, 75, 128, 139, 118, 146, 116, 128, 85], [56, 41, 15, 176, 236, 85, 37, 9, 62], [71, 30, 17, 119, 118, 255, 17, 18, 138], [101, 38, 60, 138, 55, 70, 43, 26, 142], [146, 36, 19, 30, 171, 255, 97, 27, 20], [138, 45, 61, 62, 219, 1, 81, 188, 64], [32, 41, 20, 117, 151, 142, 20, 21, 163], [112, 19, 12, 61, 195, 128, 48, 4, 24]]], ui = [[[[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[176, 246, 255, 255, 255, 255, 255, 255, 255, 255, 255], [223, 241, 252, 255, 255, 255, 255, 255, 255, 255, 255], [249, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 244, 252, 255, 255, 255, 255, 255, 255, 255, 255], [234, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 246, 254, 255, 255, 255, 255, 255, 255, 255, 255], [239, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 248, 254, 255, 255, 255, 255, 255, 255, 255, 255], [251, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [251, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 254, 253, 255, 254, 255, 255, 255, 255, 255, 255], [250, 255, 254, 255, 254, 255, 255, 255, 255, 255, 255], [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]]], [[[217, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [225, 252, 241, 253, 255, 255, 254, 255, 255, 255, 255], [234, 250, 241, 250, 253, 255, 253, 254, 255, 255, 255]], [[255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255], [223, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [238, 253, 254, 254, 255, 255, 255, 255, 255, 255, 255]], [[255, 248, 254, 255, 255, 255, 255, 255, 255, 255, 255], [249, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 253, 255, 255, 255, 255, 255, 255, 255, 255, 255], [247, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [253, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 254, 253, 255, 255, 255, 255, 255, 255, 255, 255], [250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]]], [[[186, 251, 250, 255, 255, 255, 255, 255, 255, 255, 255], [234, 251, 244, 254, 255, 255, 255, 255, 255, 255, 255], [251, 251, 243, 253, 254, 255, 254, 255, 255, 255, 255]], [[255, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [236, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [251, 253, 253, 254, 254, 255, 255, 255, 255, 255, 255]], [[255, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255], [254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]]], [[[248, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [250, 254, 252, 254, 255, 255, 255, 255, 255, 255, 255], [248, 254, 249, 253, 255, 255, 255, 255, 255, 255, 255]], [[255, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255], [246, 253, 253, 255, 255, 255, 255, 255, 255, 255, 255], [252, 254, 251, 254, 254, 255, 255, 255, 255, 255, 255]], [[255, 254, 252, 255, 255, 255, 255, 255, 255, 255, 255], [248, 254, 253, 255, 255, 255, 255, 255, 255, 255, 255], [253, 255, 254, 254, 255, 255, 255, 255, 255, 255, 255]], [[255, 251, 254, 255, 255, 255, 255, 255, 255, 255, 255], [245, 251, 254, 255, 255, 255, 255, 255, 255, 255, 255], [253, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 251, 253, 255, 255, 255, 255, 255, 255, 255, 255], [252, 253, 254, 255, 255, 255, 255, 255, 255, 255, 255], [255, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255], [249, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 254, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 253, 255, 255, 255, 255, 255, 255, 255, 255], [250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]], [[255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255], [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]]]], hi = [0, 1, 2, 3, 6, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 7, 0], li = [], fi = [], di = [], pi = 1, gi = 2, mi = [], vi = [];
    vr("UpsampleRgbLinePair", Ar, 3), vr("UpsampleBgrLinePair", xr, 3), vr("UpsampleRgbaLinePair", Ir, 4), vr("UpsampleBgraLinePair", kr, 4), vr("UpsampleArgbLinePair", Pr, 4), vr("UpsampleRgba4444LinePair", _r, 2), vr("UpsampleRgb565LinePair", Sr, 2);
    var bi = t4.UpsampleRgbLinePair, yi = t4.UpsampleBgrLinePair, wi = t4.UpsampleRgbaLinePair, Ni = t4.UpsampleBgraLinePair, Li = t4.UpsampleArgbLinePair, Ai = t4.UpsampleRgba4444LinePair, xi = t4.UpsampleRgb565LinePair, Si = 16, _i = 1 << Si - 1, Pi = -227, ki = 482, Ii = 6, Ci = 0, ji = a2(256), Oi = a2(256), Bi = a2(256), Mi = a2(256), Ei = a2(ki - Pi), qi = a2(ki - Pi);
    Fr("YuvToRgbRow", Ar, 3), Fr("YuvToBgrRow", xr, 3), Fr("YuvToRgbaRow", Ir, 4), Fr("YuvToBgraRow", kr, 4), Fr("YuvToArgbRow", Pr, 4), Fr("YuvToRgba4444Row", _r, 2), Fr("YuvToRgb565Row", Sr, 2);
    var Di = [0, 4, 8, 12, 128, 132, 136, 140, 256, 260, 264, 268, 384, 388, 392, 396], Ri = [0, 2, 8], Ti = [8, 7, 6, 4, 4, 2, 2, 2, 1, 1, 1, 1], Ui = 1;
    this.WebPDecodeRGBA = function(t5, r2, n3, i3, a3) {
      var o3 = qn, s3 = new rr(), c4 = new ot2();
      s3.ba = c4, c4.S = o3, c4.width = [c4.width], c4.height = [c4.height];
      var u4 = c4.width, h4 = c4.height, l4 = new st2();
      if (null == l4 || null == t5) var f4 = 2;
      else e(null != l4), f4 = Br(t5, r2, n3, l4.width, l4.height, l4.Pd, l4.Qd, l4.format, null);
      if (0 != f4 ? u4 = 0 : (null != u4 && (u4[0] = l4.width[0]), null != h4 && (h4[0] = l4.height[0]), u4 = 1), u4) {
        c4.width = c4.width[0], c4.height = c4.height[0], null != i3 && (i3[0] = c4.width), null != a3 && (a3[0] = c4.height);
        t: {
          if (i3 = new Gt2(), (a3 = new nr()).data = t5, a3.w = r2, a3.ha = n3, a3.kd = 1, r2 = [0], e(null != a3), (0 == (t5 = Br(a3.data, a3.w, a3.ha, null, null, null, r2, null, a3)) || 7 == t5) && r2[0] && (t5 = 4), 0 == (r2 = t5)) {
            if (e(null != s3), i3.data = a3.data, i3.w = a3.w + a3.offset, i3.ha = a3.ha - a3.offset, i3.put = dt2, i3.ac = ft2, i3.bc = pt2, i3.ma = s3, a3.xa) {
              if (null == (t5 = kt2())) {
                s3 = 1;
                break t;
              }
              if (function(t6, r3) {
                var n4 = [0], i4 = [0], a4 = [0];
                e: for (; ; ) {
                  if (null == t6) return 0;
                  if (null == r3) return t6.a = 2, 0;
                  if (t6.l = r3, t6.a = 0, v3(t6.m, r3.data, r3.w, r3.ha), !gt2(t6.m, n4, i4, a4)) {
                    t6.a = 3;
                    break e;
                  }
                  if (t6.xb = gi, r3.width = n4[0], r3.height = i4[0], !It2(n4[0], i4[0], 1, t6, null)) break e;
                  return 1;
                }
                return e(0 != t6.a), 0;
              }(t5, i3)) {
                if (i3 = 0 == (r2 = qr(i3.width, i3.height, s3.Oa, s3.ba))) {
                  e: {
                    i3 = t5;
                    r: for (; ; ) {
                      if (null == i3) {
                        i3 = 0;
                        break e;
                      }
                      if (e(null != i3.s.yc), e(null != i3.s.Ya), e(0 < i3.s.Wb), e(null != (n3 = i3.l)), e(null != (a3 = n3.ma)), 0 != i3.xb) {
                        if (i3.ca = a3.ba, i3.tb = a3.tb, e(null != i3.ca), !Mr(a3.Oa, n3, Rn)) {
                          i3.a = 2;
                          break r;
                        }
                        if (!Ft2(i3, n3.width)) break r;
                        if (n3.da) break r;
                        if ((n3.da || nt2(i3.ca.S)) && mr(), 11 > i3.ca.S || (alert("todo:WebPInitConvertARGBToYUV"), null != i3.ca.f.kb.F && mr()), i3.Pb && 0 < i3.s.ua && null == i3.s.vb.X && !O2(i3.s.vb, i3.s.Wa.Xa)) {
                          i3.a = 1;
                          break r;
                        }
                        i3.xb = 0;
                      }
                      if (!_t2(i3, i3.V, i3.Ba, i3.c, i3.i, n3.o, Lt2)) break r;
                      a3.Dc = i3.Ma, i3 = 1;
                      break e;
                    }
                    e(0 != i3.a), i3 = 0;
                  }
                  i3 = !i3;
                }
                i3 && (r2 = t5.a);
              } else r2 = t5.a;
            } else {
              if (null == (t5 = new Yt2())) {
                s3 = 1;
                break t;
              }
              if (t5.Fa = a3.na, t5.P = a3.P, t5.qc = a3.Sa, Kt2(t5, i3)) {
                if (0 == (r2 = qr(i3.width, i3.height, s3.Oa, s3.ba))) {
                  if (t5.Aa = 0, n3 = s3.Oa, e(null != (a3 = t5)), null != n3) {
                    if (0 < (u4 = 0 > (u4 = n3.Md) ? 0 : 100 < u4 ? 255 : 255 * u4 / 100)) {
                      for (h4 = l4 = 0; 4 > h4; ++h4) 12 > (f4 = a3.pb[h4]).lc && (f4.ia = u4 * Ti[0 > f4.lc ? 0 : f4.lc] >> 3), l4 |= f4.ia;
                      l4 && (alert("todo:VP8InitRandom"), a3.ia = 1);
                    }
                    a3.Ga = n3.Id, 100 < a3.Ga ? a3.Ga = 100 : 0 > a3.Ga && (a3.Ga = 0);
                  }
                  Qt2(t5, i3) || (r2 = t5.a);
                }
              } else r2 = t5.a;
            }
            0 == r2 && null != s3.Oa && s3.Oa.fd && (r2 = Er(s3.ba));
          }
          s3 = r2;
        }
        o3 = 0 != s3 ? null : 11 > o3 ? c4.f.RGBA.eb : c4.f.kb.y;
      } else o3 = null;
      return o3;
    };
    var zi = [3, 4, 3, 4, 4, 2, 2, 4, 4, 4, 2, 1, 1];
  };
  function u2(t4, e2) {
    for (var r2 = "", n3 = 0; n3 < 4; n3++) r2 += String.fromCharCode(t4[e2++]);
    return r2;
  }
  function h2(t4, e2) {
    return (t4[e2 + 0] << 0 | t4[e2 + 1] << 8 | t4[e2 + 2] << 16) >>> 0;
  }
  function l2(t4, e2) {
    return (t4[e2 + 0] << 0 | t4[e2 + 1] << 8 | t4[e2 + 2] << 16 | t4[e2 + 3] << 24) >>> 0;
  }
  new c2();
  var f2 = [0], d2 = [0], p2 = [], g2 = new c2(), m2 = t3, v2 = function(t4, e2) {
    var r2 = {}, n3 = 0, i3 = false, a3 = 0, o3 = 0;
    if (r2.frames = [], !/** @license
       * Copyright (c) 2017 Dominik Homberger
      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      https://webpjs.appspot.com
      WebPRiffParser dominikhlbg@gmail.com
      */
    function(t5, e3, r3, n4) {
      for (var i4 = 0; i4 < n4; i4++) if (t5[e3 + i4] != r3.charCodeAt(i4)) return true;
      return false;
    }(t4, e2, "RIFF", 4)) {
      var s3, c3;
      l2(t4, e2 += 4);
      for (e2 += 8; e2 < t4.length; ) {
        var f3 = u2(t4, e2), d3 = l2(t4, e2 += 4);
        e2 += 4;
        var p3 = d3 + (1 & d3);
        switch (f3) {
          case "VP8 ":
          case "VP8L":
            void 0 === r2.frames[n3] && (r2.frames[n3] = {});
            (v3 = r2.frames[n3]).src_off = i3 ? o3 : e2 - 8, v3.src_size = a3 + d3 + 8, n3++, i3 && (i3 = false, a3 = 0, o3 = 0);
            break;
          case "VP8X":
            (v3 = r2.header = {}).feature_flags = t4[e2];
            var g3 = e2 + 4;
            v3.canvas_width = 1 + h2(t4, g3);
            g3 += 3;
            v3.canvas_height = 1 + h2(t4, g3);
            g3 += 3;
            break;
          case "ALPH":
            i3 = true, a3 = p3 + 8, o3 = e2 - 8;
            break;
          case "ANIM":
            (v3 = r2.header).bgcolor = l2(t4, e2);
            g3 = e2 + 4;
            v3.loop_count = (s3 = t4)[(c3 = g3) + 0] << 0 | s3[c3 + 1] << 8;
            g3 += 2;
            break;
          case "ANMF":
            var m3, v3;
            (v3 = r2.frames[n3] = {}).offset_x = 2 * h2(t4, e2), e2 += 3, v3.offset_y = 2 * h2(t4, e2), e2 += 3, v3.width = 1 + h2(t4, e2), e2 += 3, v3.height = 1 + h2(t4, e2), e2 += 3, v3.duration = h2(t4, e2), e2 += 3, m3 = t4[e2++], v3.dispose = 1 & m3, v3.blend = m3 >> 1 & 1;
        }
        "ANMF" != f3 && (e2 += p3);
      }
      return r2;
    }
  }(m2, 0);
  v2.response = m2, v2.rgbaoutput = true, v2.dataurl = false;
  var b2 = v2.header ? v2.header : null, y2 = v2.frames ? v2.frames : null;
  if (b2) {
    b2.loop_counter = b2.loop_count, f2 = [b2.canvas_height], d2 = [b2.canvas_width];
    for (var w2 = 0; w2 < y2.length && 0 != y2[w2].blend; w2++) ;
  }
  var N2 = y2[0], L2 = g2.WebPDecodeRGBA(m2, N2.src_off, N2.src_size, d2, f2);
  N2.rgba = L2, N2.imgwidth = d2[0], N2.imgheight = f2[0];
  for (var A2 = 0; A2 < d2[0] * f2[0] * 4; A2++) p2[A2] = L2[A2];
  return this.width = d2, this.height = f2, this.data = p2, this;
}
!function(t3) {
  var r = function() {
    return "function" == typeof zlibSync;
  }, n2 = function(r2, n3, a3, h3) {
    var l3 = 4, f3 = s2;
    switch (h3) {
      case t3.image_compression.FAST:
        l3 = 1, f3 = o2;
        break;
      case t3.image_compression.MEDIUM:
        l3 = 6, f3 = c2;
        break;
      case t3.image_compression.SLOW:
        l3 = 9, f3 = u2;
    }
    r2 = i2(r2, n3, a3, f3);
    var d2 = zlibSync(r2, { level: l3 });
    return t3.__addimage__.arrayBufferToBinaryString(d2);
  }, i2 = function(t4, e, r2, n3) {
    for (var i3, a3, o3, s3 = t4.length / e, c3 = new Uint8Array(t4.length + s3), u3 = l2(), h3 = 0; h3 < s3; h3 += 1) {
      if (o3 = h3 * e, i3 = t4.subarray(o3, o3 + e), n3) c3.set(n3(i3, r2, a3), o3 + h3);
      else {
        for (var d2, p2 = u3.length, g2 = []; d2 < p2; d2 += 1) g2[d2] = u3[d2](i3, r2, a3);
        var m2 = f2(g2.concat());
        c3.set(g2[m2], o3 + h3);
      }
      a3 = i3;
    }
    return c3;
  }, a2 = function(t4) {
    var e = Array.apply([], t4);
    return e.unshift(0), e;
  }, o2 = function(t4, e) {
    var r2, n3 = [], i3 = t4.length;
    n3[0] = 1;
    for (var a3 = 0; a3 < i3; a3 += 1) r2 = t4[a3 - e] || 0, n3[a3 + 1] = t4[a3] - r2 + 256 & 255;
    return n3;
  }, s2 = function(t4, e, r2) {
    var n3, i3 = [], a3 = t4.length;
    i3[0] = 2;
    for (var o3 = 0; o3 < a3; o3 += 1) n3 = r2 && r2[o3] || 0, i3[o3 + 1] = t4[o3] - n3 + 256 & 255;
    return i3;
  }, c2 = function(t4, e, r2) {
    var n3, i3, a3 = [], o3 = t4.length;
    a3[0] = 3;
    for (var s3 = 0; s3 < o3; s3 += 1) n3 = t4[s3 - e] || 0, i3 = r2 && r2[s3] || 0, a3[s3 + 1] = t4[s3] + 256 - (n3 + i3 >>> 1) & 255;
    return a3;
  }, u2 = function(t4, e, r2) {
    var n3, i3, a3, o3, s3 = [], c3 = t4.length;
    s3[0] = 4;
    for (var u3 = 0; u3 < c3; u3 += 1) n3 = t4[u3 - e] || 0, i3 = r2 && r2[u3] || 0, a3 = r2 && r2[u3 - e] || 0, o3 = h2(n3, i3, a3), s3[u3 + 1] = t4[u3] - o3 + 256 & 255;
    return s3;
  }, h2 = function(t4, e, r2) {
    if (t4 === e && e === r2) return t4;
    var n3 = Math.abs(e - r2), i3 = Math.abs(t4 - r2), a3 = Math.abs(t4 + e - r2 - r2);
    return n3 <= i3 && n3 <= a3 ? t4 : i3 <= a3 ? e : r2;
  }, l2 = function() {
    return [a2, o2, s2, c2, u2];
  }, f2 = function(t4) {
    var e = t4.map(function(t5) {
      return t5.reduce(function(t6, e2) {
        return t6 + Math.abs(e2);
      }, 0);
    });
    return e.indexOf(Math.min.apply(null, e));
  };
  t3.processPNG = function(e, i3, a3, o3) {
    var s3, c3, u3, h3, l3, f3, d2, p2, g2, m2, v2, b2, y2, w2, N2, L2 = this.decode.FLATE_DECODE, A2 = "";
    if (this.__addimage__.isArrayBuffer(e) && (e = new Uint8Array(e)), this.__addimage__.isArrayBufferView(e)) {
      if (e = (u3 = new Kt(e)).imgData, c3 = u3.bits, s3 = u3.colorSpace, l3 = u3.colors, -1 !== [4, 6].indexOf(u3.colorType)) {
        if (8 === u3.bits) {
          g2 = (p2 = 32 == u3.pixelBitlength ? new Uint32Array(u3.decodePixels().buffer) : 16 == u3.pixelBitlength ? new Uint16Array(u3.decodePixels().buffer) : new Uint8Array(u3.decodePixels().buffer)).length, v2 = new Uint8Array(g2 * u3.colors), m2 = new Uint8Array(g2);
          var x2, S2 = u3.pixelBitlength - u3.bits;
          for (w2 = 0, N2 = 0; w2 < g2; w2++) {
            for (y2 = p2[w2], x2 = 0; x2 < S2; ) v2[N2++] = y2 >>> x2 & 255, x2 += u3.bits;
            m2[w2] = y2 >>> x2 & 255;
          }
        }
        if (16 === u3.bits) {
          g2 = (p2 = new Uint32Array(u3.decodePixels().buffer)).length, v2 = new Uint8Array(g2 * (32 / u3.pixelBitlength) * u3.colors), m2 = new Uint8Array(g2 * (32 / u3.pixelBitlength)), b2 = u3.colors > 1, w2 = 0, N2 = 0;
          for (var _2 = 0; w2 < g2; ) y2 = p2[w2++], v2[N2++] = y2 >>> 0 & 255, b2 && (v2[N2++] = y2 >>> 16 & 255, y2 = p2[w2++], v2[N2++] = y2 >>> 0 & 255), m2[_2++] = y2 >>> 16 & 255;
          c3 = 8;
        }
        o3 !== t3.image_compression.NONE && r() ? (e = n2(v2, u3.width * u3.colors, u3.colors, o3), d2 = n2(m2, u3.width, 1, o3)) : (e = v2, d2 = m2, L2 = void 0);
      }
      if (3 === u3.colorType && (s3 = this.color_spaces.INDEXED, f3 = u3.palette, u3.transparency.indexed)) {
        var P2 = u3.transparency.indexed, k2 = 0;
        for (w2 = 0, g2 = P2.length; w2 < g2; ++w2) k2 += P2[w2];
        if ((k2 /= 255) === g2 - 1 && -1 !== P2.indexOf(0)) h3 = [P2.indexOf(0)];
        else if (k2 !== g2) {
          for (p2 = u3.decodePixels(), m2 = new Uint8Array(p2.length), w2 = 0, g2 = p2.length; w2 < g2; w2++) m2[w2] = P2[p2[w2]];
          d2 = n2(m2, u3.width, 1);
        }
      }
      var I2 = function(e2) {
        var r2;
        switch (e2) {
          case t3.image_compression.FAST:
            r2 = 11;
            break;
          case t3.image_compression.MEDIUM:
            r2 = 13;
            break;
          case t3.image_compression.SLOW:
            r2 = 14;
            break;
          default:
            r2 = 12;
        }
        return r2;
      }(o3);
      return L2 === this.decode.FLATE_DECODE && (A2 = "/Predictor " + I2 + " "), A2 += "/Colors " + l3 + " /BitsPerComponent " + c3 + " /Columns " + u3.width, (this.__addimage__.isArrayBuffer(e) || this.__addimage__.isArrayBufferView(e)) && (e = this.__addimage__.arrayBufferToBinaryString(e)), (d2 && this.__addimage__.isArrayBuffer(d2) || this.__addimage__.isArrayBufferView(d2)) && (d2 = this.__addimage__.arrayBufferToBinaryString(d2)), { alias: a3, data: e, index: i3, filter: L2, decodeParameters: A2, transparency: h3, palette: f3, sMask: d2, predictor: I2, width: u3.width, height: u3.height, bitsPerComponent: c3, colorSpace: s3 };
    }
  };
}(E.API), function(t3) {
  t3.processGIF89A = function(e, r, n2, i2) {
    var a2 = new Zt(e), o2 = a2.width, s2 = a2.height, c2 = [];
    a2.decodeAndBlitFrameRGBA(0, c2);
    var u2 = { data: c2, width: o2, height: s2 }, h2 = new Qt(100).encode(u2, 100);
    return t3.processJPEG.call(this, h2, r, n2, i2);
  }, t3.processGIF87A = t3.processGIF89A;
}(E.API), te.prototype.parseHeader = function() {
  if (this.fileSize = this.datav.getUint32(this.pos, true), this.pos += 4, this.reserved = this.datav.getUint32(this.pos, true), this.pos += 4, this.offset = this.datav.getUint32(this.pos, true), this.pos += 4, this.headerSize = this.datav.getUint32(this.pos, true), this.pos += 4, this.width = this.datav.getUint32(this.pos, true), this.pos += 4, this.height = this.datav.getInt32(this.pos, true), this.pos += 4, this.planes = this.datav.getUint16(this.pos, true), this.pos += 2, this.bitPP = this.datav.getUint16(this.pos, true), this.pos += 2, this.compress = this.datav.getUint32(this.pos, true), this.pos += 4, this.rawSize = this.datav.getUint32(this.pos, true), this.pos += 4, this.hr = this.datav.getUint32(this.pos, true), this.pos += 4, this.vr = this.datav.getUint32(this.pos, true), this.pos += 4, this.colors = this.datav.getUint32(this.pos, true), this.pos += 4, this.importantColors = this.datav.getUint32(this.pos, true), this.pos += 4, 16 === this.bitPP && this.is_with_alpha && (this.bitPP = 15), this.bitPP < 15) {
    var t3 = 0 === this.colors ? 1 << this.bitPP : this.colors;
    this.palette = new Array(t3);
    for (var e = 0; e < t3; e++) {
      var r = this.datav.getUint8(this.pos++, true), n2 = this.datav.getUint8(this.pos++, true), i2 = this.datav.getUint8(this.pos++, true), a2 = this.datav.getUint8(this.pos++, true);
      this.palette[e] = { red: i2, green: n2, blue: r, quad: a2 };
    }
  }
  this.height < 0 && (this.height *= -1, this.bottom_up = false);
}, te.prototype.parseBGR = function() {
  this.pos = this.offset;
  try {
    var t3 = "bit" + this.bitPP, e = this.width * this.height * 4;
    this.data = new Uint8Array(e), this[t3]();
  } catch (t4) {
    a.log("bit decode error:" + t4);
  }
}, te.prototype.bit1 = function() {
  var t3, e = Math.ceil(this.width / 8), r = e % 4;
  for (t3 = this.height - 1; t3 >= 0; t3--) {
    for (var n2 = this.bottom_up ? t3 : this.height - 1 - t3, i2 = 0; i2 < e; i2++) for (var a2 = this.datav.getUint8(this.pos++, true), o2 = n2 * this.width * 4 + 8 * i2 * 4, s2 = 0; s2 < 8 && 8 * i2 + s2 < this.width; s2++) {
      var c2 = this.palette[a2 >> 7 - s2 & 1];
      this.data[o2 + 4 * s2] = c2.blue, this.data[o2 + 4 * s2 + 1] = c2.green, this.data[o2 + 4 * s2 + 2] = c2.red, this.data[o2 + 4 * s2 + 3] = 255;
    }
    0 !== r && (this.pos += 4 - r);
  }
}, te.prototype.bit4 = function() {
  for (var t3 = Math.ceil(this.width / 2), e = t3 % 4, r = this.height - 1; r >= 0; r--) {
    for (var n2 = this.bottom_up ? r : this.height - 1 - r, i2 = 0; i2 < t3; i2++) {
      var a2 = this.datav.getUint8(this.pos++, true), o2 = n2 * this.width * 4 + 2 * i2 * 4, s2 = a2 >> 4, c2 = 15 & a2, u2 = this.palette[s2];
      if (this.data[o2] = u2.blue, this.data[o2 + 1] = u2.green, this.data[o2 + 2] = u2.red, this.data[o2 + 3] = 255, 2 * i2 + 1 >= this.width) break;
      u2 = this.palette[c2], this.data[o2 + 4] = u2.blue, this.data[o2 + 4 + 1] = u2.green, this.data[o2 + 4 + 2] = u2.red, this.data[o2 + 4 + 3] = 255;
    }
    0 !== e && (this.pos += 4 - e);
  }
}, te.prototype.bit8 = function() {
  for (var t3 = this.width % 4, e = this.height - 1; e >= 0; e--) {
    for (var r = this.bottom_up ? e : this.height - 1 - e, n2 = 0; n2 < this.width; n2++) {
      var i2 = this.datav.getUint8(this.pos++, true), a2 = r * this.width * 4 + 4 * n2;
      if (i2 < this.palette.length) {
        var o2 = this.palette[i2];
        this.data[a2] = o2.red, this.data[a2 + 1] = o2.green, this.data[a2 + 2] = o2.blue, this.data[a2 + 3] = 255;
      } else this.data[a2] = 255, this.data[a2 + 1] = 255, this.data[a2 + 2] = 255, this.data[a2 + 3] = 255;
    }
    0 !== t3 && (this.pos += 4 - t3);
  }
}, te.prototype.bit15 = function() {
  for (var t3 = this.width % 3, e = parseInt("11111", 2), r = this.height - 1; r >= 0; r--) {
    for (var n2 = this.bottom_up ? r : this.height - 1 - r, i2 = 0; i2 < this.width; i2++) {
      var a2 = this.datav.getUint16(this.pos, true);
      this.pos += 2;
      var o2 = (a2 & e) / e * 255 | 0, s2 = (a2 >> 5 & e) / e * 255 | 0, c2 = (a2 >> 10 & e) / e * 255 | 0, u2 = a2 >> 15 ? 255 : 0, h2 = n2 * this.width * 4 + 4 * i2;
      this.data[h2] = c2, this.data[h2 + 1] = s2, this.data[h2 + 2] = o2, this.data[h2 + 3] = u2;
    }
    this.pos += t3;
  }
}, te.prototype.bit16 = function() {
  for (var t3 = this.width % 3, e = parseInt("11111", 2), r = parseInt("111111", 2), n2 = this.height - 1; n2 >= 0; n2--) {
    for (var i2 = this.bottom_up ? n2 : this.height - 1 - n2, a2 = 0; a2 < this.width; a2++) {
      var o2 = this.datav.getUint16(this.pos, true);
      this.pos += 2;
      var s2 = (o2 & e) / e * 255 | 0, c2 = (o2 >> 5 & r) / r * 255 | 0, u2 = (o2 >> 11) / e * 255 | 0, h2 = i2 * this.width * 4 + 4 * a2;
      this.data[h2] = u2, this.data[h2 + 1] = c2, this.data[h2 + 2] = s2, this.data[h2 + 3] = 255;
    }
    this.pos += t3;
  }
}, te.prototype.bit24 = function() {
  for (var t3 = this.height - 1; t3 >= 0; t3--) {
    for (var e = this.bottom_up ? t3 : this.height - 1 - t3, r = 0; r < this.width; r++) {
      var n2 = this.datav.getUint8(this.pos++, true), i2 = this.datav.getUint8(this.pos++, true), a2 = this.datav.getUint8(this.pos++, true), o2 = e * this.width * 4 + 4 * r;
      this.data[o2] = a2, this.data[o2 + 1] = i2, this.data[o2 + 2] = n2, this.data[o2 + 3] = 255;
    }
    this.pos += this.width % 4;
  }
}, te.prototype.bit32 = function() {
  for (var t3 = this.height - 1; t3 >= 0; t3--) for (var e = this.bottom_up ? t3 : this.height - 1 - t3, r = 0; r < this.width; r++) {
    var n2 = this.datav.getUint8(this.pos++, true), i2 = this.datav.getUint8(this.pos++, true), a2 = this.datav.getUint8(this.pos++, true), o2 = this.datav.getUint8(this.pos++, true), s2 = e * this.width * 4 + 4 * r;
    this.data[s2] = a2, this.data[s2 + 1] = i2, this.data[s2 + 2] = n2, this.data[s2 + 3] = o2;
  }
}, te.prototype.getData = function() {
  return this.data;
}, /**
 * @license
 * Copyright (c) 2018 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  t3.processBMP = function(e, r, n2, i2) {
    var a2 = new te(e, false), o2 = a2.width, s2 = a2.height, c2 = { data: a2.getData(), width: o2, height: s2 }, u2 = new Qt(100).encode(c2, 100);
    return t3.processJPEG.call(this, u2, r, n2, i2);
  };
}(E.API), ee.prototype.getData = function() {
  return this.data;
}, /**
 * @license
 * Copyright (c) 2019 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  t3.processWEBP = function(e, r, n2, i2) {
    var a2 = new ee(e), o2 = a2.width, s2 = a2.height, c2 = { data: a2.getData(), width: o2, height: s2 }, u2 = new Qt(100).encode(c2, 100);
    return t3.processJPEG.call(this, u2, r, n2, i2);
  };
}(E.API), E.API.processRGBA = function(t3, e, r) {
  for (var n2 = t3.data, i2 = n2.length, a2 = new Uint8Array(i2 / 4 * 3), o2 = new Uint8Array(i2 / 4), s2 = 0, c2 = 0, u2 = 0; u2 < i2; u2 += 4) {
    var h2 = n2[u2], l2 = n2[u2 + 1], f2 = n2[u2 + 2], d2 = n2[u2 + 3];
    a2[s2++] = h2, a2[s2++] = l2, a2[s2++] = f2, o2[c2++] = d2;
  }
  var p2 = this.__addimage__.arrayBufferToBinaryString(a2);
  return { alpha: this.__addimage__.arrayBufferToBinaryString(o2), data: p2, index: e, alias: r, colorSpace: "DeviceRGB", bitsPerComponent: 8, width: t3.width, height: t3.height };
}, E.API.setLanguage = function(t3) {
  return void 0 === this.internal.languageSettings && (this.internal.languageSettings = {}, this.internal.languageSettings.isSubscribed = false), void 0 !== { af: "Afrikaans", sq: "Albanian", ar: "Arabic (Standard)", "ar-DZ": "Arabic (Algeria)", "ar-BH": "Arabic (Bahrain)", "ar-EG": "Arabic (Egypt)", "ar-IQ": "Arabic (Iraq)", "ar-JO": "Arabic (Jordan)", "ar-KW": "Arabic (Kuwait)", "ar-LB": "Arabic (Lebanon)", "ar-LY": "Arabic (Libya)", "ar-MA": "Arabic (Morocco)", "ar-OM": "Arabic (Oman)", "ar-QA": "Arabic (Qatar)", "ar-SA": "Arabic (Saudi Arabia)", "ar-SY": "Arabic (Syria)", "ar-TN": "Arabic (Tunisia)", "ar-AE": "Arabic (U.A.E.)", "ar-YE": "Arabic (Yemen)", an: "Aragonese", hy: "Armenian", as: "Assamese", ast: "Asturian", az: "Azerbaijani", eu: "Basque", be: "Belarusian", bn: "Bengali", bs: "Bosnian", br: "Breton", bg: "Bulgarian", my: "Burmese", ca: "Catalan", ch: "Chamorro", ce: "Chechen", zh: "Chinese", "zh-HK": "Chinese (Hong Kong)", "zh-CN": "Chinese (PRC)", "zh-SG": "Chinese (Singapore)", "zh-TW": "Chinese (Taiwan)", cv: "Chuvash", co: "Corsican", cr: "Cree", hr: "Croatian", cs: "Czech", da: "Danish", nl: "Dutch (Standard)", "nl-BE": "Dutch (Belgian)", en: "English", "en-AU": "English (Australia)", "en-BZ": "English (Belize)", "en-CA": "English (Canada)", "en-IE": "English (Ireland)", "en-JM": "English (Jamaica)", "en-NZ": "English (New Zealand)", "en-PH": "English (Philippines)", "en-ZA": "English (South Africa)", "en-TT": "English (Trinidad & Tobago)", "en-GB": "English (United Kingdom)", "en-US": "English (United States)", "en-ZW": "English (Zimbabwe)", eo: "Esperanto", et: "Estonian", fo: "Faeroese", fj: "Fijian", fi: "Finnish", fr: "French (Standard)", "fr-BE": "French (Belgium)", "fr-CA": "French (Canada)", "fr-FR": "French (France)", "fr-LU": "French (Luxembourg)", "fr-MC": "French (Monaco)", "fr-CH": "French (Switzerland)", fy: "Frisian", fur: "Friulian", gd: "Gaelic (Scots)", "gd-IE": "Gaelic (Irish)", gl: "Galacian", ka: "Georgian", de: "German (Standard)", "de-AT": "German (Austria)", "de-DE": "German (Germany)", "de-LI": "German (Liechtenstein)", "de-LU": "German (Luxembourg)", "de-CH": "German (Switzerland)", el: "Greek", gu: "Gujurati", ht: "Haitian", he: "Hebrew", hi: "Hindi", hu: "Hungarian", is: "Icelandic", id: "Indonesian", iu: "Inuktitut", ga: "Irish", it: "Italian (Standard)", "it-CH": "Italian (Switzerland)", ja: "Japanese", kn: "Kannada", ks: "Kashmiri", kk: "Kazakh", km: "Khmer", ky: "Kirghiz", tlh: "Klingon", ko: "Korean", "ko-KP": "Korean (North Korea)", "ko-KR": "Korean (South Korea)", la: "Latin", lv: "Latvian", lt: "Lithuanian", lb: "Luxembourgish", mk: "North Macedonia", ms: "Malay", ml: "Malayalam", mt: "Maltese", mi: "Maori", mr: "Marathi", mo: "Moldavian", nv: "Navajo", ng: "Ndonga", ne: "Nepali", no: "Norwegian", nb: "Norwegian (Bokmal)", nn: "Norwegian (Nynorsk)", oc: "Occitan", or: "Oriya", om: "Oromo", fa: "Persian", "fa-IR": "Persian/Iran", pl: "Polish", pt: "Portuguese", "pt-BR": "Portuguese (Brazil)", pa: "Punjabi", "pa-IN": "Punjabi (India)", "pa-PK": "Punjabi (Pakistan)", qu: "Quechua", rm: "Rhaeto-Romanic", ro: "Romanian", "ro-MO": "Romanian (Moldavia)", ru: "Russian", "ru-MO": "Russian (Moldavia)", sz: "Sami (Lappish)", sg: "Sango", sa: "Sanskrit", sc: "Sardinian", sd: "Sindhi", si: "Singhalese", sr: "Serbian", sk: "Slovak", sl: "Slovenian", so: "Somani", sb: "Sorbian", es: "Spanish", "es-AR": "Spanish (Argentina)", "es-BO": "Spanish (Bolivia)", "es-CL": "Spanish (Chile)", "es-CO": "Spanish (Colombia)", "es-CR": "Spanish (Costa Rica)", "es-DO": "Spanish (Dominican Republic)", "es-EC": "Spanish (Ecuador)", "es-SV": "Spanish (El Salvador)", "es-GT": "Spanish (Guatemala)", "es-HN": "Spanish (Honduras)", "es-MX": "Spanish (Mexico)", "es-NI": "Spanish (Nicaragua)", "es-PA": "Spanish (Panama)", "es-PY": "Spanish (Paraguay)", "es-PE": "Spanish (Peru)", "es-PR": "Spanish (Puerto Rico)", "es-ES": "Spanish (Spain)", "es-UY": "Spanish (Uruguay)", "es-VE": "Spanish (Venezuela)", sx: "Sutu", sw: "Swahili", sv: "Swedish", "sv-FI": "Swedish (Finland)", "sv-SV": "Swedish (Sweden)", ta: "Tamil", tt: "Tatar", te: "Teluga", th: "Thai", tig: "Tigre", ts: "Tsonga", tn: "Tswana", tr: "Turkish", tk: "Turkmen", uk: "Ukrainian", hsb: "Upper Sorbian", ur: "Urdu", ve: "Venda", vi: "Vietnamese", vo: "Volapuk", wa: "Walloon", cy: "Welsh", xh: "Xhosa", ji: "Yiddish", zu: "Zulu" }[t3] && (this.internal.languageSettings.languageCode = t3, false === this.internal.languageSettings.isSubscribed && (this.internal.events.subscribe("putCatalog", function() {
    this.internal.write("/Lang (" + this.internal.languageSettings.languageCode + ")");
  }), this.internal.languageSettings.isSubscribed = true)), this;
}, Vt = E.API, Gt = Vt.getCharWidthsArray = function(e, r) {
  var n2, i2, a2 = (r = r || {}).font || this.internal.getFont(), o2 = r.fontSize || this.internal.getFontSize(), s2 = r.charSpace || this.internal.getCharSpace(), c2 = r.widths ? r.widths : a2.metadata.Unicode.widths, u2 = c2.fof ? c2.fof : 1, h2 = r.kerning ? r.kerning : a2.metadata.Unicode.kerning, l2 = h2.fof ? h2.fof : 1, f2 = false !== r.doKerning, d2 = 0, p2 = e.length, g2 = 0, m2 = c2[0] || u2, v2 = [];
  for (n2 = 0; n2 < p2; n2++) i2 = e.charCodeAt(n2), "function" == typeof a2.metadata.widthOfString ? v2.push((a2.metadata.widthOfGlyph(a2.metadata.characterToGlyph(i2)) + s2 * (1e3 / o2) || 0) / 1e3) : (d2 = f2 && "object" === t(h2[i2]) && !isNaN(parseInt(h2[i2][g2], 10)) ? h2[i2][g2] / l2 : 0, v2.push((c2[i2] || m2) / u2 + d2)), g2 = i2;
  return v2;
}, Yt = Vt.getStringUnitWidth = function(t3, e) {
  var r = (e = e || {}).fontSize || this.internal.getFontSize(), n2 = e.font || this.internal.getFont(), i2 = e.charSpace || this.internal.getCharSpace();
  return Vt.processArabic && (t3 = Vt.processArabic(t3)), "function" == typeof n2.metadata.widthOfString ? n2.metadata.widthOfString(t3, r, i2) / r : Gt.apply(this, arguments).reduce(function(t4, e2) {
    return t4 + e2;
  }, 0);
}, Jt = function(t3, e, r, n2) {
  for (var i2 = [], a2 = 0, o2 = t3.length, s2 = 0; a2 !== o2 && s2 + e[a2] < r; ) s2 += e[a2], a2++;
  i2.push(t3.slice(0, a2));
  var c2 = a2;
  for (s2 = 0; a2 !== o2; ) s2 + e[a2] > n2 && (i2.push(t3.slice(c2, a2)), s2 = 0, c2 = a2), s2 += e[a2], a2++;
  return c2 !== a2 && i2.push(t3.slice(c2, a2)), i2;
}, Xt = function(t3, e, r) {
  r || (r = {});
  var n2, i2, a2, o2, s2, c2, u2, h2 = [], l2 = [h2], f2 = r.textIndent || 0, d2 = 0, p2 = 0, g2 = t3.split(" "), m2 = Gt.apply(this, [" ", r])[0];
  if (c2 = -1 === r.lineIndent ? g2[0].length + 2 : r.lineIndent || 0) {
    var v2 = Array(c2).join(" "), b2 = [];
    g2.map(function(t4) {
      (t4 = t4.split(/\s*\n/)).length > 1 ? b2 = b2.concat(t4.map(function(t5, e2) {
        return (e2 && t5.length ? "\n" : "") + t5;
      })) : b2.push(t4[0]);
    }), g2 = b2, c2 = Yt.apply(this, [v2, r]);
  }
  for (a2 = 0, o2 = g2.length; a2 < o2; a2++) {
    var y2 = 0;
    if (n2 = g2[a2], c2 && "\n" == n2[0] && (n2 = n2.substr(1), y2 = 1), f2 + d2 + (p2 = (i2 = Gt.apply(this, [n2, r])).reduce(function(t4, e2) {
      return t4 + e2;
    }, 0)) > e || y2) {
      if (p2 > e) {
        for (s2 = Jt.apply(this, [n2, i2, e - (f2 + d2), e]), h2.push(s2.shift()), h2 = [s2.pop()]; s2.length; ) l2.push([s2.shift()]);
        p2 = i2.slice(n2.length - (h2[0] ? h2[0].length : 0)).reduce(function(t4, e2) {
          return t4 + e2;
        }, 0);
      } else h2 = [n2];
      l2.push(h2), f2 = p2 + c2, d2 = m2;
    } else h2.push(n2), f2 += d2 + p2, d2 = m2;
  }
  return u2 = c2 ? function(t4, e2) {
    return (e2 ? v2 : "") + t4.join(" ");
  } : function(t4) {
    return t4.join(" ");
  }, l2.map(u2);
}, Vt.splitTextToSize = function(t3, e, r) {
  var n2, i2 = (r = r || {}).fontSize || this.internal.getFontSize(), a2 = (function(t4) {
    if (t4.widths && t4.kerning) return { widths: t4.widths, kerning: t4.kerning };
    var e2 = this.internal.getFont(t4.fontName, t4.fontStyle);
    return e2.metadata.Unicode ? { widths: e2.metadata.Unicode.widths || { 0: 1 }, kerning: e2.metadata.Unicode.kerning || {} } : { font: e2.metadata, fontSize: this.internal.getFontSize(), charSpace: this.internal.getCharSpace() };
  }).call(this, r);
  n2 = Array.isArray(t3) ? t3 : String(t3).split(/\r?\n/);
  var o2 = 1 * this.internal.scaleFactor * e / i2;
  a2.textIndent = r.textIndent ? 1 * r.textIndent * this.internal.scaleFactor / i2 : 0, a2.lineIndent = r.lineIndent;
  var s2, c2, u2 = [];
  for (s2 = 0, c2 = n2.length; s2 < c2; s2++) u2 = u2.concat(Xt.apply(this, [n2[s2], o2, a2]));
  return u2;
}, function(e) {
  e.__fontmetrics__ = e.__fontmetrics__ || {};
  for (var r = "klmnopqrstuvwxyz", n2 = {}, i2 = {}, a2 = 0; a2 < r.length; a2++) n2[r[a2]] = "0123456789abcdef"[a2], i2["0123456789abcdef"[a2]] = r[a2];
  var o2 = function(t3) {
    return "0x" + parseInt(t3, 10).toString(16);
  }, s2 = e.__fontmetrics__.compress = function(e2) {
    var r2, n3, a3, c3, u3 = ["{"];
    for (var h3 in e2) {
      if (r2 = e2[h3], isNaN(parseInt(h3, 10)) ? n3 = "'" + h3 + "'" : (h3 = parseInt(h3, 10), n3 = (n3 = o2(h3).slice(2)).slice(0, -1) + i2[n3.slice(-1)]), "number" == typeof r2) r2 < 0 ? (a3 = o2(r2).slice(3), c3 = "-") : (a3 = o2(r2).slice(2), c3 = ""), a3 = c3 + a3.slice(0, -1) + i2[a3.slice(-1)];
      else {
        if ("object" !== t(r2)) throw new Error("Don't know what to do with value type " + t(r2) + ".");
        a3 = s2(r2);
      }
      u3.push(n3 + a3);
    }
    return u3.push("}"), u3.join("");
  }, c2 = e.__fontmetrics__.uncompress = function(t3) {
    if ("string" != typeof t3) throw new Error("Invalid argument passed to uncompress.");
    for (var e2, r2, i3, a3, o3 = {}, s3 = 1, c3 = o3, u3 = [], h3 = "", l3 = "", f2 = t3.length - 1, d2 = 1; d2 < f2; d2 += 1) "'" == (a3 = t3[d2]) ? e2 ? (i3 = e2.join(""), e2 = void 0) : e2 = [] : e2 ? e2.push(a3) : "{" == a3 ? (u3.push([c3, i3]), c3 = {}, i3 = void 0) : "}" == a3 ? ((r2 = u3.pop())[0][r2[1]] = c3, i3 = void 0, c3 = r2[0]) : "-" == a3 ? s3 = -1 : void 0 === i3 ? n2.hasOwnProperty(a3) ? (h3 += n2[a3], i3 = parseInt(h3, 16) * s3, s3 = 1, h3 = "") : h3 += a3 : n2.hasOwnProperty(a3) ? (l3 += n2[a3], c3[i3] = parseInt(l3, 16) * s3, s3 = 1, i3 = void 0, l3 = "") : l3 += a3;
    return o3;
  }, u2 = { codePages: ["WinAnsiEncoding"], WinAnsiEncoding: c2("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}") }, h2 = { Unicode: { Courier: u2, "Courier-Bold": u2, "Courier-BoldOblique": u2, "Courier-Oblique": u2, Helvetica: u2, "Helvetica-Bold": u2, "Helvetica-BoldOblique": u2, "Helvetica-Oblique": u2, "Times-Roman": u2, "Times-Bold": u2, "Times-BoldItalic": u2, "Times-Italic": u2 } }, l2 = { Unicode: { "Courier-Oblique": c2("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"), "Times-BoldItalic": c2("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"), "Helvetica-Bold": c2("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"), Courier: c2("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"), "Courier-BoldOblique": c2("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"), "Times-Bold": c2("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"), Symbol: c2("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}"), Helvetica: c2("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"), "Helvetica-BoldOblique": c2("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"), ZapfDingbats: c2("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}"), "Courier-Bold": c2("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"), "Times-Italic": c2("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"), "Times-Roman": c2("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"), "Helvetica-Oblique": c2("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}") } };
  e.events.push(["addFont", function(t3) {
    var e2 = t3.font, r2 = l2.Unicode[e2.postScriptName];
    r2 && (e2.metadata.Unicode = {}, e2.metadata.Unicode.widths = r2.widths, e2.metadata.Unicode.kerning = r2.kerning);
    var n3 = h2.Unicode[e2.postScriptName];
    n3 && (e2.metadata.Unicode.encoding = n3, e2.encoding = n3.codePages[0]);
  }]);
}(E.API), /**
 * @license
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = function(t4) {
    for (var e2 = t4.length, r = new Uint8Array(e2), n2 = 0; n2 < e2; n2++) r[n2] = t4.charCodeAt(n2);
    return r;
  };
  t3.API.events.push(["addFont", function(r) {
    var n2 = void 0, i2 = r.font, a2 = r.instance;
    if (!i2.isStandardFont) {
      if (void 0 === a2) throw new Error("Font does not exist in vFS, import fonts or remove declaration doc.addFont('" + i2.postScriptName + "').");
      if ("string" != typeof (n2 = false === a2.existsFileInVFS(i2.postScriptName) ? a2.loadFile(i2.postScriptName) : a2.getFileFromVFS(i2.postScriptName))) throw new Error("Font is not stored as string-data in vFS, import fonts or remove declaration doc.addFont('" + i2.postScriptName + "').");
      !function(r2, n3) {
        n3 = /^\x00\x01\x00\x00/.test(n3) ? e(n3) : e(u(n3)), r2.metadata = t3.API.TTFFont.open(n3), r2.metadata.Unicode = r2.metadata.Unicode || { encoding: {}, kerning: {}, widths: [] }, r2.metadata.glyIdsUsed = [0];
      }(i2, n2);
    }
  }]);
}(E), /** @license
 * Copyright (c) 2012 Willow Systems Corporation, https://github.com/willowsystems
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */
function(t3) {
  function e() {
    return (n.canvg ? Promise.resolve(n.canvg) : Promise.resolve().then(() => require("./index.es-nSz-hN91.js"))).catch(function(t4) {
      return Promise.reject(new Error("Could not load canvg: " + t4));
    }).then(function(t4) {
      return t4.default ? t4.default : t4;
    });
  }
  E.API.addSvgAsImage = function(t4, r, n2, i2, o2, s2, c2, u2) {
    if (isNaN(r) || isNaN(n2)) throw a.error("jsPDF.addSvgAsImage: Invalid coordinates", arguments), new Error("Invalid coordinates passed to jsPDF.addSvgAsImage");
    if (isNaN(i2) || isNaN(o2)) throw a.error("jsPDF.addSvgAsImage: Invalid measurements", arguments), new Error("Invalid measurements (width and/or height) passed to jsPDF.addSvgAsImage");
    var h2 = document.createElement("canvas");
    h2.width = i2, h2.height = o2;
    var l2 = h2.getContext("2d");
    l2.fillStyle = "#fff", l2.fillRect(0, 0, h2.width, h2.height);
    var f2 = { ignoreMouse: true, ignoreAnimation: true, ignoreDimensions: true }, d2 = this;
    return e().then(function(e2) {
      return e2.fromString(l2, t4, f2);
    }, function() {
      return Promise.reject(new Error("Could not load canvg."));
    }).then(function(t5) {
      return t5.render(f2);
    }).then(function() {
      d2.addImage(h2.toDataURL("image/jpeg", 1), r, n2, i2, o2, c2, u2);
    });
  };
}(), E.API.putTotalPages = function(t3) {
  var e, r = 0;
  parseInt(this.internal.getFont().id.substr(1), 10) < 15 ? (e = new RegExp(t3, "g"), r = this.internal.getNumberOfPages()) : (e = new RegExp(this.pdfEscape16(t3, this.internal.getFont()), "g"), r = this.pdfEscape16(this.internal.getNumberOfPages() + "", this.internal.getFont()));
  for (var n2 = 1; n2 <= this.internal.getNumberOfPages(); n2++) for (var i2 = 0; i2 < this.internal.pages[n2].length; i2++) this.internal.pages[n2][i2] = this.internal.pages[n2][i2].replace(e, r);
  return this;
}, E.API.viewerPreferences = function(e, r) {
  var n2;
  e = e || {}, r = r || false;
  var i2, a2, o2, s2 = { HideToolbar: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.3 }, HideMenubar: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.3 }, HideWindowUI: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.3 }, FitWindow: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.3 }, CenterWindow: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.3 }, DisplayDocTitle: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.4 }, NonFullScreenPageMode: { defaultValue: "UseNone", value: "UseNone", type: "name", explicitSet: false, valueSet: ["UseNone", "UseOutlines", "UseThumbs", "UseOC"], pdfVersion: 1.3 }, Direction: { defaultValue: "L2R", value: "L2R", type: "name", explicitSet: false, valueSet: ["L2R", "R2L"], pdfVersion: 1.3 }, ViewArea: { defaultValue: "CropBox", value: "CropBox", type: "name", explicitSet: false, valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"], pdfVersion: 1.4 }, ViewClip: { defaultValue: "CropBox", value: "CropBox", type: "name", explicitSet: false, valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"], pdfVersion: 1.4 }, PrintArea: { defaultValue: "CropBox", value: "CropBox", type: "name", explicitSet: false, valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"], pdfVersion: 1.4 }, PrintClip: { defaultValue: "CropBox", value: "CropBox", type: "name", explicitSet: false, valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"], pdfVersion: 1.4 }, PrintScaling: { defaultValue: "AppDefault", value: "AppDefault", type: "name", explicitSet: false, valueSet: ["AppDefault", "None"], pdfVersion: 1.6 }, Duplex: { defaultValue: "", value: "none", type: "name", explicitSet: false, valueSet: ["Simplex", "DuplexFlipShortEdge", "DuplexFlipLongEdge", "none"], pdfVersion: 1.7 }, PickTrayByPDFSize: { defaultValue: false, value: false, type: "boolean", explicitSet: false, valueSet: [true, false], pdfVersion: 1.7 }, PrintPageRange: { defaultValue: "", value: "", type: "array", explicitSet: false, valueSet: null, pdfVersion: 1.7 }, NumCopies: { defaultValue: 1, value: 1, type: "integer", explicitSet: false, valueSet: null, pdfVersion: 1.7 } }, c2 = Object.keys(s2), u2 = [], h2 = 0, l2 = 0, f2 = 0;
  function d2(t3, e2) {
    var r2, n3 = false;
    for (r2 = 0; r2 < t3.length; r2 += 1) t3[r2] === e2 && (n3 = true);
    return n3;
  }
  if (void 0 === this.internal.viewerpreferences && (this.internal.viewerpreferences = {}, this.internal.viewerpreferences.configuration = JSON.parse(JSON.stringify(s2)), this.internal.viewerpreferences.isSubscribed = false), n2 = this.internal.viewerpreferences.configuration, "reset" === e || true === r) {
    var p2 = c2.length;
    for (f2 = 0; f2 < p2; f2 += 1) n2[c2[f2]].value = n2[c2[f2]].defaultValue, n2[c2[f2]].explicitSet = false;
  }
  if ("object" === t(e)) {
    for (a2 in e) if (o2 = e[a2], d2(c2, a2) && void 0 !== o2) {
      if ("boolean" === n2[a2].type && "boolean" == typeof o2) n2[a2].value = o2;
      else if ("name" === n2[a2].type && d2(n2[a2].valueSet, o2)) n2[a2].value = o2;
      else if ("integer" === n2[a2].type && Number.isInteger(o2)) n2[a2].value = o2;
      else if ("array" === n2[a2].type) {
        for (h2 = 0; h2 < o2.length; h2 += 1) if (i2 = true, 1 === o2[h2].length && "number" == typeof o2[h2][0]) u2.push(String(o2[h2] - 1));
        else if (o2[h2].length > 1) {
          for (l2 = 0; l2 < o2[h2].length; l2 += 1) "number" != typeof o2[h2][l2] && (i2 = false);
          true === i2 && u2.push([o2[h2][0] - 1, o2[h2][1] - 1].join(" "));
        }
        n2[a2].value = "[" + u2.join(" ") + "]";
      } else n2[a2].value = n2[a2].defaultValue;
      n2[a2].explicitSet = true;
    }
  }
  return false === this.internal.viewerpreferences.isSubscribed && (this.internal.events.subscribe("putCatalog", function() {
    var t3, e2 = [];
    for (t3 in n2) true === n2[t3].explicitSet && ("name" === n2[t3].type ? e2.push("/" + t3 + " /" + n2[t3].value) : e2.push("/" + t3 + " " + n2[t3].value));
    0 !== e2.length && this.internal.write("/ViewerPreferences\n<<\n" + e2.join("\n") + "\n>>");
  }), this.internal.viewerpreferences.isSubscribed = true), this.internal.viewerpreferences.configuration = n2, this;
}, /** ====================================================================
 * @license
 * jsPDF XMP metadata plugin
 * Copyright (c) 2016 Jussi Utunen, u-jussi@suomi24.fi
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */
function(t3) {
  var e = function() {
    var t4 = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:jspdf="' + this.internal.__metadata__.namespaceuri + '"><jspdf:metadata>', e2 = unescape(encodeURIComponent('<x:xmpmeta xmlns:x="adobe:ns:meta/">')), r2 = unescape(encodeURIComponent(t4)), n2 = unescape(encodeURIComponent(this.internal.__metadata__.metadata)), i2 = unescape(encodeURIComponent("</jspdf:metadata></rdf:Description></rdf:RDF>")), a2 = unescape(encodeURIComponent("</x:xmpmeta>")), o2 = r2.length + n2.length + i2.length + e2.length + a2.length;
    this.internal.__metadata__.metadata_object_number = this.internal.newObject(), this.internal.write("<< /Type /Metadata /Subtype /XML /Length " + o2 + " >>"), this.internal.write("stream"), this.internal.write(e2 + r2 + n2 + i2 + a2), this.internal.write("endstream"), this.internal.write("endobj");
  }, r = function() {
    this.internal.__metadata__.metadata_object_number && this.internal.write("/Metadata " + this.internal.__metadata__.metadata_object_number + " 0 R");
  };
  t3.addMetadata = function(t4, n2) {
    return void 0 === this.internal.__metadata__ && (this.internal.__metadata__ = { metadata: t4, namespaceuri: n2 || "http://jspdf.default.namespaceuri/" }, this.internal.events.subscribe("putCatalog", r), this.internal.events.subscribe("postPutResources", e)), this;
  };
}(E.API), function(t3) {
  var e = t3.API, r = e.pdfEscape16 = function(t4, e2) {
    for (var r2, n3 = e2.metadata.Unicode.widths, i3 = ["", "0", "00", "000", "0000"], a2 = [""], o2 = 0, s2 = t4.length; o2 < s2; ++o2) {
      if (r2 = e2.metadata.characterToGlyph(t4.charCodeAt(o2)), e2.metadata.glyIdsUsed.push(r2), e2.metadata.toUnicode[r2] = t4.charCodeAt(o2), -1 == n3.indexOf(r2) && (n3.push(r2), n3.push([parseInt(e2.metadata.widthOfGlyph(r2), 10)])), "0" == r2) return a2.join("");
      r2 = r2.toString(16), a2.push(i3[4 - r2.length], r2);
    }
    return a2.join("");
  }, n2 = function(t4) {
    var e2, r2, n3, i3, a2, o2, s2;
    for (a2 = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><ffff>\nendcodespacerange", n3 = [], o2 = 0, s2 = (r2 = Object.keys(t4).sort(function(t5, e3) {
      return t5 - e3;
    })).length; o2 < s2; o2++) e2 = r2[o2], n3.length >= 100 && (a2 += "\n" + n3.length + " beginbfchar\n" + n3.join("\n") + "\nendbfchar", n3 = []), void 0 !== t4[e2] && null !== t4[e2] && "function" == typeof t4[e2].toString && (i3 = ("0000" + t4[e2].toString(16)).slice(-4), e2 = ("0000" + (+e2).toString(16)).slice(-4), n3.push("<" + e2 + "><" + i3 + ">"));
    return n3.length && (a2 += "\n" + n3.length + " beginbfchar\n" + n3.join("\n") + "\nendbfchar\n"), a2 += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend";
  };
  e.events.push(["putFont", function(e2) {
    !function(e3) {
      var r2 = e3.font, i3 = e3.out, a2 = e3.newObject, o2 = e3.putStream;
      if (r2.metadata instanceof t3.API.TTFFont && "Identity-H" === r2.encoding) {
        for (var s2 = r2.metadata.Unicode.widths, c2 = r2.metadata.subset.encode(r2.metadata.glyIdsUsed, 1), u2 = "", h2 = 0; h2 < c2.length; h2++) u2 += String.fromCharCode(c2[h2]);
        var l2 = a2();
        o2({ data: u2, addLength1: true, objectId: l2 }), i3("endobj");
        var f2 = a2();
        o2({ data: n2(r2.metadata.toUnicode), addLength1: true, objectId: f2 }), i3("endobj");
        var d2 = a2();
        i3("<<"), i3("/Type /FontDescriptor"), i3("/FontName /" + F(r2.fontName)), i3("/FontFile2 " + l2 + " 0 R"), i3("/FontBBox " + t3.API.PDFObject.convert(r2.metadata.bbox)), i3("/Flags " + r2.metadata.flags), i3("/StemV " + r2.metadata.stemV), i3("/ItalicAngle " + r2.metadata.italicAngle), i3("/Ascent " + r2.metadata.ascender), i3("/Descent " + r2.metadata.decender), i3("/CapHeight " + r2.metadata.capHeight), i3(">>"), i3("endobj");
        var p2 = a2();
        i3("<<"), i3("/Type /Font"), i3("/BaseFont /" + F(r2.fontName)), i3("/FontDescriptor " + d2 + " 0 R"), i3("/W " + t3.API.PDFObject.convert(s2)), i3("/CIDToGIDMap /Identity"), i3("/DW 1000"), i3("/Subtype /CIDFontType2"), i3("/CIDSystemInfo"), i3("<<"), i3("/Supplement 0"), i3("/Registry (Adobe)"), i3("/Ordering (" + r2.encoding + ")"), i3(">>"), i3(">>"), i3("endobj"), r2.objectNumber = a2(), i3("<<"), i3("/Type /Font"), i3("/Subtype /Type0"), i3("/ToUnicode " + f2 + " 0 R"), i3("/BaseFont /" + F(r2.fontName)), i3("/Encoding /" + r2.encoding), i3("/DescendantFonts [" + p2 + " 0 R]"), i3(">>"), i3("endobj"), r2.isAlreadyPutted = true;
      }
    }(e2);
  }]);
  e.events.push(["putFont", function(e2) {
    !function(e3) {
      var r2 = e3.font, i3 = e3.out, a2 = e3.newObject, o2 = e3.putStream;
      if (r2.metadata instanceof t3.API.TTFFont && "WinAnsiEncoding" === r2.encoding) {
        for (var s2 = r2.metadata.rawData, c2 = "", u2 = 0; u2 < s2.length; u2++) c2 += String.fromCharCode(s2[u2]);
        var h2 = a2();
        o2({ data: c2, addLength1: true, objectId: h2 }), i3("endobj");
        var l2 = a2();
        o2({ data: n2(r2.metadata.toUnicode), addLength1: true, objectId: l2 }), i3("endobj");
        var f2 = a2();
        i3("<<"), i3("/Descent " + r2.metadata.decender), i3("/CapHeight " + r2.metadata.capHeight), i3("/StemV " + r2.metadata.stemV), i3("/Type /FontDescriptor"), i3("/FontFile2 " + h2 + " 0 R"), i3("/Flags 96"), i3("/FontBBox " + t3.API.PDFObject.convert(r2.metadata.bbox)), i3("/FontName /" + F(r2.fontName)), i3("/ItalicAngle " + r2.metadata.italicAngle), i3("/Ascent " + r2.metadata.ascender), i3(">>"), i3("endobj"), r2.objectNumber = a2();
        for (var d2 = 0; d2 < r2.metadata.hmtx.widths.length; d2++) r2.metadata.hmtx.widths[d2] = parseInt(r2.metadata.hmtx.widths[d2] * (1e3 / r2.metadata.head.unitsPerEm));
        i3("<</Subtype/TrueType/Type/Font/ToUnicode " + l2 + " 0 R/BaseFont/" + F(r2.fontName) + "/FontDescriptor " + f2 + " 0 R/Encoding/" + r2.encoding + " /FirstChar 29 /LastChar 255 /Widths " + t3.API.PDFObject.convert(r2.metadata.hmtx.widths) + ">>"), i3("endobj"), r2.isAlreadyPutted = true;
      }
    }(e2);
  }]);
  var i2 = function(t4) {
    var e2, n3 = t4.text || "", i3 = t4.x, a2 = t4.y, o2 = t4.options || {}, s2 = t4.mutex || {}, c2 = s2.pdfEscape, u2 = s2.activeFontKey, h2 = s2.fonts, l2 = u2, f2 = "", d2 = 0, p2 = "", g2 = h2[l2].encoding;
    if ("Identity-H" !== h2[l2].encoding) return { text: n3, x: i3, y: a2, options: o2, mutex: s2 };
    for (p2 = n3, l2 = u2, Array.isArray(n3) && (p2 = n3[0]), d2 = 0; d2 < p2.length; d2 += 1) h2[l2].metadata.hasOwnProperty("cmap") && (e2 = h2[l2].metadata.cmap.unicode.codeMap[p2[d2].charCodeAt(0)]), e2 || p2[d2].charCodeAt(0) < 256 && h2[l2].metadata.hasOwnProperty("Unicode") ? f2 += p2[d2] : f2 += "";
    var m2 = "";
    return parseInt(l2.slice(1)) < 14 || "WinAnsiEncoding" === g2 ? m2 = c2(f2, l2).split("").map(function(t5) {
      return t5.charCodeAt(0).toString(16);
    }).join("") : "Identity-H" === g2 && (m2 = r(f2, h2[l2])), s2.isHex = true, { text: m2, x: i3, y: a2, options: o2, mutex: s2 };
  };
  e.events.push(["postProcessText", function(t4) {
    var e2 = t4.text || "", r2 = [], n3 = { text: e2, x: t4.x, y: t4.y, options: t4.options, mutex: t4.mutex };
    if (Array.isArray(e2)) {
      var a2 = 0;
      for (a2 = 0; a2 < e2.length; a2 += 1) Array.isArray(e2[a2]) && 3 === e2[a2].length ? r2.push([i2(Object.assign({}, n3, { text: e2[a2][0] })).text, e2[a2][1], e2[a2][2]]) : r2.push(i2(Object.assign({}, n3, { text: e2[a2] })).text);
      t4.text = r2;
    } else t4.text = i2(Object.assign({}, n3, { text: e2 })).text;
  }]);
}(E), /**
 * @license
 * jsPDF virtual FileSystem functionality
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
function(t3) {
  var e = function() {
    return void 0 === this.internal.vFS && (this.internal.vFS = {}), true;
  };
  t3.existsFileInVFS = function(t4) {
    return e.call(this), void 0 !== this.internal.vFS[t4];
  }, t3.addFileToVFS = function(t4, r) {
    return e.call(this), this.internal.vFS[t4] = r, this;
  }, t3.getFileFromVFS = function(t4) {
    return e.call(this), void 0 !== this.internal.vFS[t4] ? this.internal.vFS[t4] : null;
  };
}(E.API), /**
 * @license
 * Unicode Bidi Engine based on the work of Alex Shensis (@asthensis)
 * MIT License
 */
function(t3) {
  t3.__bidiEngine__ = t3.prototype.__bidiEngine__ = function(t4) {
    var r2, n2, i2, a2, o2, s2, c2, u2 = e, h2 = [[0, 3, 0, 1, 0, 0, 0], [0, 3, 0, 1, 2, 2, 0], [0, 3, 0, 17, 2, 0, 1], [0, 3, 5, 5, 4, 1, 0], [0, 3, 21, 21, 4, 0, 1], [0, 3, 5, 5, 4, 2, 0]], l2 = [[2, 0, 1, 1, 0, 1, 0], [2, 0, 1, 1, 0, 2, 0], [2, 0, 2, 1, 3, 2, 0], [2, 0, 2, 33, 3, 1, 1]], f2 = { L: 0, R: 1, EN: 2, AN: 3, N: 4, B: 5, S: 6 }, d2 = { 0: 0, 5: 1, 6: 2, 7: 3, 32: 4, 251: 5, 254: 6, 255: 7 }, p2 = ["(", ")", "(", "<", ">", "<", "[", "]", "[", "{", "}", "{", "«", "»", "«", "‹", "›", "‹", "⁅", "⁆", "⁅", "⁽", "⁾", "⁽", "₍", "₎", "₍", "≤", "≥", "≤", "〈", "〉", "〈", "﹙", "﹚", "﹙", "﹛", "﹜", "﹛", "﹝", "﹞", "﹝", "﹤", "﹥", "﹤"], g2 = new RegExp(/^([1-4|9]|1[0-9]|2[0-9]|3[0168]|4[04589]|5[012]|7[78]|159|16[0-9]|17[0-2]|21[569]|22[03489]|250)$/), m2 = false, v2 = 0;
    this.__bidiEngine__ = {};
    var b2 = function(t5) {
      var e2 = t5.charCodeAt(), r3 = e2 >> 8, n3 = d2[r3];
      return void 0 !== n3 ? u2[256 * n3 + (255 & e2)] : 252 === r3 || 253 === r3 ? "AL" : g2.test(r3) ? "L" : 8 === r3 ? "R" : "N";
    }, y2 = function(t5) {
      for (var e2, r3 = 0; r3 < t5.length; r3++) {
        if ("L" === (e2 = b2(t5.charAt(r3)))) return false;
        if ("R" === e2) return true;
      }
      return false;
    }, w2 = function(t5, e2, o3, s3) {
      var c3, u3, h3, l3, f3 = e2[s3];
      switch (f3) {
        case "L":
        case "R":
          m2 = false;
          break;
        case "N":
        case "AN":
          break;
        case "EN":
          m2 && (f3 = "AN");
          break;
        case "AL":
          m2 = true, f3 = "R";
          break;
        case "WS":
          f3 = "N";
          break;
        case "CS":
          s3 < 1 || s3 + 1 >= e2.length || "EN" !== (c3 = o3[s3 - 1]) && "AN" !== c3 || "EN" !== (u3 = e2[s3 + 1]) && "AN" !== u3 ? f3 = "N" : m2 && (u3 = "AN"), f3 = u3 === c3 ? u3 : "N";
          break;
        case "ES":
          f3 = "EN" === (c3 = s3 > 0 ? o3[s3 - 1] : "B") && s3 + 1 < e2.length && "EN" === e2[s3 + 1] ? "EN" : "N";
          break;
        case "ET":
          if (s3 > 0 && "EN" === o3[s3 - 1]) {
            f3 = "EN";
            break;
          }
          if (m2) {
            f3 = "N";
            break;
          }
          for (h3 = s3 + 1, l3 = e2.length; h3 < l3 && "ET" === e2[h3]; ) h3++;
          f3 = h3 < l3 && "EN" === e2[h3] ? "EN" : "N";
          break;
        case "NSM":
          if (i2 && !a2) {
            for (l3 = e2.length, h3 = s3 + 1; h3 < l3 && "NSM" === e2[h3]; ) h3++;
            if (h3 < l3) {
              var d3 = t5[s3], p3 = d3 >= 1425 && d3 <= 2303 || 64286 === d3;
              if (c3 = e2[h3], p3 && ("R" === c3 || "AL" === c3)) {
                f3 = "R";
                break;
              }
            }
          }
          f3 = s3 < 1 || "B" === (c3 = e2[s3 - 1]) ? "N" : o3[s3 - 1];
          break;
        case "B":
          m2 = false, r2 = true, f3 = v2;
          break;
        case "S":
          n2 = true, f3 = "N";
          break;
        case "LRE":
        case "RLE":
        case "LRO":
        case "RLO":
        case "PDF":
          m2 = false;
          break;
        case "BN":
          f3 = "N";
      }
      return f3;
    }, N2 = function(t5, e2, r3) {
      var n3 = t5.split("");
      return r3 && L2(n3, r3, { hiLevel: v2 }), n3.reverse(), e2 && e2.reverse(), n3.join("");
    }, L2 = function(t5, e2, i3) {
      var a3, o3, s3, c3, u3, d3 = -1, p3 = t5.length, g3 = 0, y3 = [], N3 = v2 ? l2 : h2, L3 = [];
      for (m2 = false, r2 = false, n2 = false, o3 = 0; o3 < p3; o3++) L3[o3] = b2(t5[o3]);
      for (s3 = 0; s3 < p3; s3++) {
        if (u3 = g3, y3[s3] = w2(t5, L3, y3, s3), a3 = 240 & (g3 = N3[u3][f2[y3[s3]]]), g3 &= 15, e2[s3] = c3 = N3[g3][5], a3 > 0) if (16 === a3) {
          for (o3 = d3; o3 < s3; o3++) e2[o3] = 1;
          d3 = -1;
        } else d3 = -1;
        if (N3[g3][6]) -1 === d3 && (d3 = s3);
        else if (d3 > -1) {
          for (o3 = d3; o3 < s3; o3++) e2[o3] = c3;
          d3 = -1;
        }
        "B" === L3[s3] && (e2[s3] = 0), i3.hiLevel |= c3;
      }
      n2 && function(t6, e3, r3) {
        for (var n3 = 0; n3 < r3; n3++) if ("S" === t6[n3]) {
          e3[n3] = v2;
          for (var i4 = n3 - 1; i4 >= 0 && "WS" === t6[i4]; i4--) e3[i4] = v2;
        }
      }(L3, e2, p3);
    }, A2 = function(t5, e2, n3, i3, a3) {
      if (!(a3.hiLevel < t5)) {
        if (1 === t5 && 1 === v2 && !r2) return e2.reverse(), void (n3 && n3.reverse());
        for (var o3, s3, c3, u3, h3 = e2.length, l3 = 0; l3 < h3; ) {
          if (i3[l3] >= t5) {
            for (c3 = l3 + 1; c3 < h3 && i3[c3] >= t5; ) c3++;
            for (u3 = l3, s3 = c3 - 1; u3 < s3; u3++, s3--) o3 = e2[u3], e2[u3] = e2[s3], e2[s3] = o3, n3 && (o3 = n3[u3], n3[u3] = n3[s3], n3[s3] = o3);
            l3 = c3;
          }
          l3++;
        }
      }
    }, x2 = function(t5, e2, r3) {
      var n3 = t5.split(""), i3 = { hiLevel: v2 };
      return r3 || (r3 = []), L2(n3, r3, i3), function(t6, e3, r4) {
        if (0 !== r4.hiLevel && c2) for (var n4, i4 = 0; i4 < t6.length; i4++) 1 === e3[i4] && (n4 = p2.indexOf(t6[i4])) >= 0 && (t6[i4] = p2[n4 + 1]);
      }(n3, r3, i3), A2(2, n3, e2, r3, i3), A2(1, n3, e2, r3, i3), n3.join("");
    };
    return this.__bidiEngine__.doBidiReorder = function(t5, e2, r3) {
      if (function(t6, e3) {
        if (e3) for (var r4 = 0; r4 < t6.length; r4++) e3[r4] = r4;
        void 0 === a2 && (a2 = y2(t6)), void 0 === s2 && (s2 = y2(t6));
      }(t5, e2), i2 || !o2 || s2) if (i2 && o2 && a2 ^ s2) v2 = a2 ? 1 : 0, t5 = N2(t5, e2, r3);
      else if (!i2 && o2 && s2) v2 = a2 ? 1 : 0, t5 = x2(t5, e2, r3), t5 = N2(t5, e2);
      else if (!i2 || a2 || o2 || s2) {
        if (i2 && !o2 && a2 ^ s2) t5 = N2(t5, e2), a2 ? (v2 = 0, t5 = x2(t5, e2, r3)) : (v2 = 1, t5 = x2(t5, e2, r3), t5 = N2(t5, e2));
        else if (i2 && a2 && !o2 && s2) v2 = 1, t5 = x2(t5, e2, r3), t5 = N2(t5, e2);
        else if (!i2 && !o2 && a2 ^ s2) {
          var n3 = c2;
          a2 ? (v2 = 1, t5 = x2(t5, e2, r3), v2 = 0, c2 = false, t5 = x2(t5, e2, r3), c2 = n3) : (v2 = 0, t5 = x2(t5, e2, r3), t5 = N2(t5, e2), v2 = 1, c2 = false, t5 = x2(t5, e2, r3), c2 = n3, t5 = N2(t5, e2));
        }
      } else v2 = 0, t5 = x2(t5, e2, r3);
      else v2 = a2 ? 1 : 0, t5 = x2(t5, e2, r3);
      return t5;
    }, this.__bidiEngine__.setOptions = function(t5) {
      t5 && (i2 = t5.isInputVisual, o2 = t5.isOutputVisual, a2 = t5.isInputRtl, s2 = t5.isOutputRtl, c2 = t5.isSymmetricSwapping);
    }, this.__bidiEngine__.setOptions(t4), this.__bidiEngine__;
  };
  var e = ["BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "S", "B", "S", "WS", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "B", "B", "B", "S", "WS", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "BN", "BN", "BN", "BN", "BN", "BN", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "CS", "N", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "L", "N", "N", "BN", "N", "N", "ET", "ET", "EN", "EN", "N", "L", "N", "N", "N", "EN", "L", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "N", "N", "N", "N", "N", "ET", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "NSM", "R", "NSM", "NSM", "R", "NSM", "NSM", "R", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AN", "AN", "AN", "AN", "AN", "AN", "N", "N", "AL", "ET", "ET", "AL", "CS", "AL", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "ET", "AN", "AN", "AL", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "NSM", "NSM", "N", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "R", "N", "N", "N", "N", "R", "N", "N", "N", "N", "N", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "BN", "BN", "BN", "L", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "B", "LRE", "RLE", "PDF", "LRO", "RLO", "CS", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "BN", "BN", "BN", "BN", "BN", "N", "LRI", "RLI", "FSI", "PDI", "BN", "BN", "BN", "BN", "BN", "BN", "EN", "L", "N", "N", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "L", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "R", "NSM", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "ES", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "R", "R", "R", "R", "R", "N", "R", "N", "R", "R", "N", "R", "R", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "CS", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "ET", "N", "N", "ES", "ES", "N", "N", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "BN", "N", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "N", "N", "N", "ET", "ET", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N"], r = new t3.__bidiEngine__({ isInputVisual: true });
  t3.API.events.push(["postProcessText", function(t4) {
    var e2 = t4.text, n2 = (t4.x, t4.y, t4.options || {}), i2 = (t4.mutex, n2.lang, []);
    if (n2.isInputVisual = "boolean" != typeof n2.isInputVisual || n2.isInputVisual, r.setOptions(n2), "[object Array]" === Object.prototype.toString.call(e2)) {
      var a2 = 0;
      for (i2 = [], a2 = 0; a2 < e2.length; a2 += 1) "[object Array]" === Object.prototype.toString.call(e2[a2]) ? i2.push([r.doBidiReorder(e2[a2][0]), e2[a2][1], e2[a2][2]]) : i2.push([r.doBidiReorder(e2[a2])]);
      t4.text = i2;
    } else t4.text = r.doBidiReorder(e2);
    r.setOptions({ isInputVisual: true });
  }]);
}(E), E.API.TTFFont = function() {
  function t3(t4) {
    var e;
    if (this.rawData = t4, e = this.contents = new ne(t4), this.contents.pos = 4, "ttcf" === e.readString(4)) throw new Error("TTCF not supported.");
    e.pos = 0, this.parse(), this.subset = new Le(this), this.registerTTF();
  }
  return t3.open = function(e) {
    return new t3(e);
  }, t3.prototype.parse = function() {
    return this.directory = new ie(this.contents), this.head = new se(this), this.name = new pe(this), this.cmap = new ue(this), this.toUnicode = {}, this.hhea = new he(this), this.maxp = new ge(this), this.hmtx = new me(this), this.post = new fe(this), this.os2 = new le(this), this.loca = new Ne(this), this.glyf = new be(this), this.ascender = this.os2.exists && this.os2.ascender || this.hhea.ascender, this.decender = this.os2.exists && this.os2.decender || this.hhea.decender, this.lineGap = this.os2.exists && this.os2.lineGap || this.hhea.lineGap, this.bbox = [this.head.xMin, this.head.yMin, this.head.xMax, this.head.yMax];
  }, t3.prototype.registerTTF = function() {
    var t4, e, r, n2, i2;
    if (this.scaleFactor = 1e3 / this.head.unitsPerEm, this.bbox = (function() {
      var e2, r2, n3, i3;
      for (i3 = [], e2 = 0, r2 = (n3 = this.bbox).length; e2 < r2; e2++) t4 = n3[e2], i3.push(Math.round(t4 * this.scaleFactor));
      return i3;
    }).call(this), this.stemV = 0, this.post.exists ? (r = 255 & (n2 = this.post.italic_angle), 0 != (32768 & (e = n2 >> 16)) && (e = -(1 + (65535 ^ e))), this.italicAngle = +(e + "." + r)) : this.italicAngle = 0, this.ascender = Math.round(this.ascender * this.scaleFactor), this.decender = Math.round(this.decender * this.scaleFactor), this.lineGap = Math.round(this.lineGap * this.scaleFactor), this.capHeight = this.os2.exists && this.os2.capHeight || this.ascender, this.xHeight = this.os2.exists && this.os2.xHeight || 0, this.familyClass = (this.os2.exists && this.os2.familyClass || 0) >> 8, this.isSerif = 1 === (i2 = this.familyClass) || 2 === i2 || 3 === i2 || 4 === i2 || 5 === i2 || 7 === i2, this.isScript = 10 === this.familyClass, this.flags = 0, this.post.isFixedPitch && (this.flags |= 1), this.isSerif && (this.flags |= 2), this.isScript && (this.flags |= 8), 0 !== this.italicAngle && (this.flags |= 64), this.flags |= 32, !this.cmap.unicode) throw new Error("No unicode cmap for font");
  }, t3.prototype.characterToGlyph = function(t4) {
    var e;
    return (null != (e = this.cmap.unicode) ? e.codeMap[t4] : void 0) || 0;
  }, t3.prototype.widthOfGlyph = function(t4) {
    var e;
    return e = 1e3 / this.head.unitsPerEm, this.hmtx.forGlyph(t4).advance * e;
  }, t3.prototype.widthOfString = function(t4, e, r) {
    var n2, i2, a2, o2;
    for (a2 = 0, i2 = 0, o2 = (t4 = "" + t4).length; 0 <= o2 ? i2 < o2 : i2 > o2; i2 = 0 <= o2 ? ++i2 : --i2) n2 = t4.charCodeAt(i2), a2 += this.widthOfGlyph(this.characterToGlyph(n2)) + r * (1e3 / e) || 0;
    return a2 * (e / 1e3);
  }, t3.prototype.lineHeight = function(t4, e) {
    var r;
    return null == e && (e = false), r = e ? this.lineGap : 0, (this.ascender + r - this.decender) / 1e3 * t4;
  }, t3;
}();
var re, ne = function() {
  function t3(t4) {
    this.data = null != t4 ? t4 : [], this.pos = 0, this.length = this.data.length;
  }
  return t3.prototype.readByte = function() {
    return this.data[this.pos++];
  }, t3.prototype.writeByte = function(t4) {
    return this.data[this.pos++] = t4;
  }, t3.prototype.readUInt32 = function() {
    return 16777216 * this.readByte() + (this.readByte() << 16) + (this.readByte() << 8) + this.readByte();
  }, t3.prototype.writeUInt32 = function(t4) {
    return this.writeByte(t4 >>> 24 & 255), this.writeByte(t4 >> 16 & 255), this.writeByte(t4 >> 8 & 255), this.writeByte(255 & t4);
  }, t3.prototype.readInt32 = function() {
    var t4;
    return (t4 = this.readUInt32()) >= 2147483648 ? t4 - 4294967296 : t4;
  }, t3.prototype.writeInt32 = function(t4) {
    return t4 < 0 && (t4 += 4294967296), this.writeUInt32(t4);
  }, t3.prototype.readUInt16 = function() {
    return this.readByte() << 8 | this.readByte();
  }, t3.prototype.writeUInt16 = function(t4) {
    return this.writeByte(t4 >> 8 & 255), this.writeByte(255 & t4);
  }, t3.prototype.readInt16 = function() {
    var t4;
    return (t4 = this.readUInt16()) >= 32768 ? t4 - 65536 : t4;
  }, t3.prototype.writeInt16 = function(t4) {
    return t4 < 0 && (t4 += 65536), this.writeUInt16(t4);
  }, t3.prototype.readString = function(t4) {
    var e, r;
    for (r = [], e = 0; 0 <= t4 ? e < t4 : e > t4; e = 0 <= t4 ? ++e : --e) r[e] = String.fromCharCode(this.readByte());
    return r.join("");
  }, t3.prototype.writeString = function(t4) {
    var e, r, n2;
    for (n2 = [], e = 0, r = t4.length; 0 <= r ? e < r : e > r; e = 0 <= r ? ++e : --e) n2.push(this.writeByte(t4.charCodeAt(e)));
    return n2;
  }, t3.prototype.readShort = function() {
    return this.readInt16();
  }, t3.prototype.writeShort = function(t4) {
    return this.writeInt16(t4);
  }, t3.prototype.readLongLong = function() {
    var t4, e, r, n2, i2, a2, o2, s2;
    return t4 = this.readByte(), e = this.readByte(), r = this.readByte(), n2 = this.readByte(), i2 = this.readByte(), a2 = this.readByte(), o2 = this.readByte(), s2 = this.readByte(), 128 & t4 ? -1 * (72057594037927940 * (255 ^ t4) + 281474976710656 * (255 ^ e) + 1099511627776 * (255 ^ r) + 4294967296 * (255 ^ n2) + 16777216 * (255 ^ i2) + 65536 * (255 ^ a2) + 256 * (255 ^ o2) + (255 ^ s2) + 1) : 72057594037927940 * t4 + 281474976710656 * e + 1099511627776 * r + 4294967296 * n2 + 16777216 * i2 + 65536 * a2 + 256 * o2 + s2;
  }, t3.prototype.writeLongLong = function(t4) {
    var e, r;
    return e = Math.floor(t4 / 4294967296), r = 4294967295 & t4, this.writeByte(e >> 24 & 255), this.writeByte(e >> 16 & 255), this.writeByte(e >> 8 & 255), this.writeByte(255 & e), this.writeByte(r >> 24 & 255), this.writeByte(r >> 16 & 255), this.writeByte(r >> 8 & 255), this.writeByte(255 & r);
  }, t3.prototype.readInt = function() {
    return this.readInt32();
  }, t3.prototype.writeInt = function(t4) {
    return this.writeInt32(t4);
  }, t3.prototype.read = function(t4) {
    var e, r;
    for (e = [], r = 0; 0 <= t4 ? r < t4 : r > t4; r = 0 <= t4 ? ++r : --r) e.push(this.readByte());
    return e;
  }, t3.prototype.write = function(t4) {
    var e, r, n2, i2;
    for (i2 = [], r = 0, n2 = t4.length; r < n2; r++) e = t4[r], i2.push(this.writeByte(e));
    return i2;
  }, t3;
}(), ie = function() {
  var t3;
  function e(t4) {
    var e2, r, n2;
    for (this.scalarType = t4.readInt(), this.tableCount = t4.readShort(), this.searchRange = t4.readShort(), this.entrySelector = t4.readShort(), this.rangeShift = t4.readShort(), this.tables = {}, r = 0, n2 = this.tableCount; 0 <= n2 ? r < n2 : r > n2; r = 0 <= n2 ? ++r : --r) e2 = { tag: t4.readString(4), checksum: t4.readInt(), offset: t4.readInt(), length: t4.readInt() }, this.tables[e2.tag] = e2;
  }
  return e.prototype.encode = function(e2) {
    var r, n2, i2, a2, o2, s2, c2, u2, h2, l2, f2, d2, p2;
    for (p2 in f2 = Object.keys(e2).length, s2 = Math.log(2), h2 = 16 * Math.floor(Math.log(f2) / s2), a2 = Math.floor(h2 / s2), u2 = 16 * f2 - h2, (n2 = new ne()).writeInt(this.scalarType), n2.writeShort(f2), n2.writeShort(h2), n2.writeShort(a2), n2.writeShort(u2), i2 = 16 * f2, c2 = n2.pos + i2, o2 = null, d2 = [], e2) for (l2 = e2[p2], n2.writeString(p2), n2.writeInt(t3(l2)), n2.writeInt(c2), n2.writeInt(l2.length), d2 = d2.concat(l2), "head" === p2 && (o2 = c2), c2 += l2.length; c2 % 4; ) d2.push(0), c2++;
    return n2.write(d2), r = 2981146554 - t3(n2.data), n2.pos = o2 + 8, n2.writeUInt32(r), n2.data;
  }, t3 = function(t4) {
    var e2, r, n2, i2;
    for (t4 = ve.call(t4); t4.length % 4; ) t4.push(0);
    for (n2 = new ne(t4), r = 0, e2 = 0, i2 = t4.length; e2 < i2; e2 = e2 += 4) r += n2.readUInt32();
    return 4294967295 & r;
  }, e;
}(), ae = {}.hasOwnProperty, oe = function(t3, e) {
  for (var r in e) ae.call(e, r) && (t3[r] = e[r]);
  function n2() {
    this.constructor = t3;
  }
  return n2.prototype = e.prototype, t3.prototype = new n2(), t3.__super__ = e.prototype, t3;
};
re = function() {
  function t3(t4) {
    var e;
    this.file = t4, e = this.file.directory.tables[this.tag], this.exists = !!e, e && (this.offset = e.offset, this.length = e.length, this.parse(this.file.contents));
  }
  return t3.prototype.parse = function() {
  }, t3.prototype.encode = function() {
  }, t3.prototype.raw = function() {
    return this.exists ? (this.file.contents.pos = this.offset, this.file.contents.read(this.length)) : null;
  }, t3;
}();
var se = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "head", e.prototype.parse = function(t4) {
    return t4.pos = this.offset, this.version = t4.readInt(), this.revision = t4.readInt(), this.checkSumAdjustment = t4.readInt(), this.magicNumber = t4.readInt(), this.flags = t4.readShort(), this.unitsPerEm = t4.readShort(), this.created = t4.readLongLong(), this.modified = t4.readLongLong(), this.xMin = t4.readShort(), this.yMin = t4.readShort(), this.xMax = t4.readShort(), this.yMax = t4.readShort(), this.macStyle = t4.readShort(), this.lowestRecPPEM = t4.readShort(), this.fontDirectionHint = t4.readShort(), this.indexToLocFormat = t4.readShort(), this.glyphDataFormat = t4.readShort();
  }, e.prototype.encode = function(t4) {
    var e2;
    return (e2 = new ne()).writeInt(this.version), e2.writeInt(this.revision), e2.writeInt(this.checkSumAdjustment), e2.writeInt(this.magicNumber), e2.writeShort(this.flags), e2.writeShort(this.unitsPerEm), e2.writeLongLong(this.created), e2.writeLongLong(this.modified), e2.writeShort(this.xMin), e2.writeShort(this.yMin), e2.writeShort(this.xMax), e2.writeShort(this.yMax), e2.writeShort(this.macStyle), e2.writeShort(this.lowestRecPPEM), e2.writeShort(this.fontDirectionHint), e2.writeShort(t4), e2.writeShort(this.glyphDataFormat), e2.data;
  }, e;
}(), ce = function() {
  function t3(t4, e) {
    var r, n2, i2, a2, o2, s2, c2, u2, h2, l2, f2, d2, p2, g2, m2, v2, b2;
    switch (this.platformID = t4.readUInt16(), this.encodingID = t4.readShort(), this.offset = e + t4.readInt(), h2 = t4.pos, t4.pos = this.offset, this.format = t4.readUInt16(), this.length = t4.readUInt16(), this.language = t4.readUInt16(), this.isUnicode = 3 === this.platformID && 1 === this.encodingID && 4 === this.format || 0 === this.platformID && 4 === this.format, this.codeMap = {}, this.format) {
      case 0:
        for (s2 = 0; s2 < 256; ++s2) this.codeMap[s2] = t4.readByte();
        break;
      case 4:
        for (f2 = t4.readUInt16(), l2 = f2 / 2, t4.pos += 6, i2 = function() {
          var e2, r2;
          for (r2 = [], s2 = e2 = 0; 0 <= l2 ? e2 < l2 : e2 > l2; s2 = 0 <= l2 ? ++e2 : --e2) r2.push(t4.readUInt16());
          return r2;
        }(), t4.pos += 2, p2 = function() {
          var e2, r2;
          for (r2 = [], s2 = e2 = 0; 0 <= l2 ? e2 < l2 : e2 > l2; s2 = 0 <= l2 ? ++e2 : --e2) r2.push(t4.readUInt16());
          return r2;
        }(), c2 = function() {
          var e2, r2;
          for (r2 = [], s2 = e2 = 0; 0 <= l2 ? e2 < l2 : e2 > l2; s2 = 0 <= l2 ? ++e2 : --e2) r2.push(t4.readUInt16());
          return r2;
        }(), u2 = function() {
          var e2, r2;
          for (r2 = [], s2 = e2 = 0; 0 <= l2 ? e2 < l2 : e2 > l2; s2 = 0 <= l2 ? ++e2 : --e2) r2.push(t4.readUInt16());
          return r2;
        }(), n2 = (this.length - t4.pos + this.offset) / 2, o2 = function() {
          var e2, r2;
          for (r2 = [], s2 = e2 = 0; 0 <= n2 ? e2 < n2 : e2 > n2; s2 = 0 <= n2 ? ++e2 : --e2) r2.push(t4.readUInt16());
          return r2;
        }(), s2 = m2 = 0, b2 = i2.length; m2 < b2; s2 = ++m2) for (g2 = i2[s2], r = v2 = d2 = p2[s2]; d2 <= g2 ? v2 <= g2 : v2 >= g2; r = d2 <= g2 ? ++v2 : --v2) 0 === u2[s2] ? a2 = r + c2[s2] : 0 !== (a2 = o2[u2[s2] / 2 + (r - d2) - (l2 - s2)] || 0) && (a2 += c2[s2]), this.codeMap[r] = 65535 & a2;
    }
    t4.pos = h2;
  }
  return t3.encode = function(t4, e) {
    var r, n2, i2, a2, o2, s2, c2, u2, h2, l2, f2, d2, p2, g2, m2, v2, b2, y2, w2, N2, L2, A2, x2, S2, _2, P2, k2, I2, F2, C2, j2, O2, B2, M2, E2, q2, D2, R2, T2, U2, z2, H2, W2, V2, G2, Y2;
    switch (I2 = new ne(), a2 = Object.keys(t4).sort(function(t5, e2) {
      return t5 - e2;
    }), e) {
      case "macroman":
        for (p2 = 0, g2 = function() {
          var t5 = [];
          for (d2 = 0; d2 < 256; ++d2) t5.push(0);
          return t5;
        }(), v2 = { 0: 0 }, i2 = {}, F2 = 0, B2 = a2.length; F2 < B2; F2++) null == v2[W2 = t4[n2 = a2[F2]]] && (v2[W2] = ++p2), i2[n2] = { old: t4[n2], new: v2[t4[n2]] }, g2[n2] = v2[t4[n2]];
        return I2.writeUInt16(1), I2.writeUInt16(0), I2.writeUInt32(12), I2.writeUInt16(0), I2.writeUInt16(262), I2.writeUInt16(0), I2.write(g2), { charMap: i2, subtable: I2.data, maxGlyphID: p2 + 1 };
      case "unicode":
        for (P2 = [], h2 = [], b2 = 0, v2 = {}, r = {}, m2 = c2 = null, C2 = 0, M2 = a2.length; C2 < M2; C2++) null == v2[w2 = t4[n2 = a2[C2]]] && (v2[w2] = ++b2), r[n2] = { old: w2, new: v2[w2] }, o2 = v2[w2] - n2, null != m2 && o2 === c2 || (m2 && h2.push(m2), P2.push(n2), c2 = o2), m2 = n2;
        for (m2 && h2.push(m2), h2.push(65535), P2.push(65535), S2 = 2 * (x2 = P2.length), A2 = 2 * Math.pow(Math.log(x2) / Math.LN2, 2), l2 = Math.log(A2 / 2) / Math.LN2, L2 = 2 * x2 - A2, s2 = [], N2 = [], f2 = [], d2 = j2 = 0, E2 = P2.length; j2 < E2; d2 = ++j2) {
          if (_2 = P2[d2], u2 = h2[d2], 65535 === _2) {
            s2.push(0), N2.push(0);
            break;
          }
          if (_2 - (k2 = r[_2].new) >= 32768) for (s2.push(0), N2.push(2 * (f2.length + x2 - d2)), n2 = O2 = _2; _2 <= u2 ? O2 <= u2 : O2 >= u2; n2 = _2 <= u2 ? ++O2 : --O2) f2.push(r[n2].new);
          else s2.push(k2 - _2), N2.push(0);
        }
        for (I2.writeUInt16(3), I2.writeUInt16(1), I2.writeUInt32(12), I2.writeUInt16(4), I2.writeUInt16(16 + 8 * x2 + 2 * f2.length), I2.writeUInt16(0), I2.writeUInt16(S2), I2.writeUInt16(A2), I2.writeUInt16(l2), I2.writeUInt16(L2), z2 = 0, q2 = h2.length; z2 < q2; z2++) n2 = h2[z2], I2.writeUInt16(n2);
        for (I2.writeUInt16(0), H2 = 0, D2 = P2.length; H2 < D2; H2++) n2 = P2[H2], I2.writeUInt16(n2);
        for (V2 = 0, R2 = s2.length; V2 < R2; V2++) o2 = s2[V2], I2.writeUInt16(o2);
        for (G2 = 0, T2 = N2.length; G2 < T2; G2++) y2 = N2[G2], I2.writeUInt16(y2);
        for (Y2 = 0, U2 = f2.length; Y2 < U2; Y2++) p2 = f2[Y2], I2.writeUInt16(p2);
        return { charMap: r, subtable: I2.data, maxGlyphID: b2 + 1 };
    }
  }, t3;
}(), ue = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "cmap", e.prototype.parse = function(t4) {
    var e2, r, n2;
    for (t4.pos = this.offset, this.version = t4.readUInt16(), n2 = t4.readUInt16(), this.tables = [], this.unicode = null, r = 0; 0 <= n2 ? r < n2 : r > n2; r = 0 <= n2 ? ++r : --r) e2 = new ce(t4, this.offset), this.tables.push(e2), e2.isUnicode && null == this.unicode && (this.unicode = e2);
    return true;
  }, e.encode = function(t4, e2) {
    var r, n2;
    return null == e2 && (e2 = "macroman"), r = ce.encode(t4, e2), (n2 = new ne()).writeUInt16(0), n2.writeUInt16(1), r.table = n2.data.concat(r.subtable), r;
  }, e;
}(), he = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "hhea", e.prototype.parse = function(t4) {
    return t4.pos = this.offset, this.version = t4.readInt(), this.ascender = t4.readShort(), this.decender = t4.readShort(), this.lineGap = t4.readShort(), this.advanceWidthMax = t4.readShort(), this.minLeftSideBearing = t4.readShort(), this.minRightSideBearing = t4.readShort(), this.xMaxExtent = t4.readShort(), this.caretSlopeRise = t4.readShort(), this.caretSlopeRun = t4.readShort(), this.caretOffset = t4.readShort(), t4.pos += 8, this.metricDataFormat = t4.readShort(), this.numberOfMetrics = t4.readUInt16();
  }, e;
}(), le = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "OS/2", e.prototype.parse = function(t4) {
    if (t4.pos = this.offset, this.version = t4.readUInt16(), this.averageCharWidth = t4.readShort(), this.weightClass = t4.readUInt16(), this.widthClass = t4.readUInt16(), this.type = t4.readShort(), this.ySubscriptXSize = t4.readShort(), this.ySubscriptYSize = t4.readShort(), this.ySubscriptXOffset = t4.readShort(), this.ySubscriptYOffset = t4.readShort(), this.ySuperscriptXSize = t4.readShort(), this.ySuperscriptYSize = t4.readShort(), this.ySuperscriptXOffset = t4.readShort(), this.ySuperscriptYOffset = t4.readShort(), this.yStrikeoutSize = t4.readShort(), this.yStrikeoutPosition = t4.readShort(), this.familyClass = t4.readShort(), this.panose = function() {
      var e2, r;
      for (r = [], e2 = 0; e2 < 10; ++e2) r.push(t4.readByte());
      return r;
    }(), this.charRange = function() {
      var e2, r;
      for (r = [], e2 = 0; e2 < 4; ++e2) r.push(t4.readInt());
      return r;
    }(), this.vendorID = t4.readString(4), this.selection = t4.readShort(), this.firstCharIndex = t4.readShort(), this.lastCharIndex = t4.readShort(), this.version > 0 && (this.ascent = t4.readShort(), this.descent = t4.readShort(), this.lineGap = t4.readShort(), this.winAscent = t4.readShort(), this.winDescent = t4.readShort(), this.codePageRange = function() {
      var e2, r;
      for (r = [], e2 = 0; e2 < 2; e2 = ++e2) r.push(t4.readInt());
      return r;
    }(), this.version > 1)) return this.xHeight = t4.readShort(), this.capHeight = t4.readShort(), this.defaultChar = t4.readShort(), this.breakChar = t4.readShort(), this.maxContext = t4.readShort();
  }, e;
}(), fe = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "post", e.prototype.parse = function(t4) {
    var e2, r, n2;
    switch (t4.pos = this.offset, this.format = t4.readInt(), this.italicAngle = t4.readInt(), this.underlinePosition = t4.readShort(), this.underlineThickness = t4.readShort(), this.isFixedPitch = t4.readInt(), this.minMemType42 = t4.readInt(), this.maxMemType42 = t4.readInt(), this.minMemType1 = t4.readInt(), this.maxMemType1 = t4.readInt(), this.format) {
      case 65536:
        break;
      case 131072:
        var i2;
        for (r = t4.readUInt16(), this.glyphNameIndex = [], i2 = 0; 0 <= r ? i2 < r : i2 > r; i2 = 0 <= r ? ++i2 : --i2) this.glyphNameIndex.push(t4.readUInt16());
        for (this.names = [], n2 = []; t4.pos < this.offset + this.length; ) e2 = t4.readByte(), n2.push(this.names.push(t4.readString(e2)));
        return n2;
      case 151552:
        return r = t4.readUInt16(), this.offsets = t4.read(r);
      case 196608:
        break;
      case 262144:
        return this.map = (function() {
          var e3, r2, n3;
          for (n3 = [], i2 = e3 = 0, r2 = this.file.maxp.numGlyphs; 0 <= r2 ? e3 < r2 : e3 > r2; i2 = 0 <= r2 ? ++e3 : --e3) n3.push(t4.readUInt32());
          return n3;
        }).call(this);
    }
  }, e;
}(), de = function(t3, e) {
  this.raw = t3, this.length = t3.length, this.platformID = e.platformID, this.encodingID = e.encodingID, this.languageID = e.languageID;
}, pe = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "name", e.prototype.parse = function(t4) {
    var e2, r, n2, i2, a2, o2, s2, c2, u2, h2, l2;
    for (t4.pos = this.offset, t4.readShort(), e2 = t4.readShort(), o2 = t4.readShort(), r = [], i2 = 0; 0 <= e2 ? i2 < e2 : i2 > e2; i2 = 0 <= e2 ? ++i2 : --i2) r.push({ platformID: t4.readShort(), encodingID: t4.readShort(), languageID: t4.readShort(), nameID: t4.readShort(), length: t4.readShort(), offset: this.offset + o2 + t4.readShort() });
    for (s2 = {}, i2 = u2 = 0, h2 = r.length; u2 < h2; i2 = ++u2) n2 = r[i2], t4.pos = n2.offset, c2 = t4.readString(n2.length), a2 = new de(c2, n2), null == s2[l2 = n2.nameID] && (s2[l2] = []), s2[n2.nameID].push(a2);
    this.strings = s2, this.copyright = s2[0], this.fontFamily = s2[1], this.fontSubfamily = s2[2], this.uniqueSubfamily = s2[3], this.fontName = s2[4], this.version = s2[5];
    try {
      this.postscriptName = s2[6][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "");
    } catch (t5) {
      this.postscriptName = s2[4][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "");
    }
    return this.trademark = s2[7], this.manufacturer = s2[8], this.designer = s2[9], this.description = s2[10], this.vendorUrl = s2[11], this.designerUrl = s2[12], this.license = s2[13], this.licenseUrl = s2[14], this.preferredFamily = s2[15], this.preferredSubfamily = s2[17], this.compatibleFull = s2[18], this.sampleText = s2[19];
  }, e;
}(), ge = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "maxp", e.prototype.parse = function(t4) {
    return t4.pos = this.offset, this.version = t4.readInt(), this.numGlyphs = t4.readUInt16(), this.maxPoints = t4.readUInt16(), this.maxContours = t4.readUInt16(), this.maxCompositePoints = t4.readUInt16(), this.maxComponentContours = t4.readUInt16(), this.maxZones = t4.readUInt16(), this.maxTwilightPoints = t4.readUInt16(), this.maxStorage = t4.readUInt16(), this.maxFunctionDefs = t4.readUInt16(), this.maxInstructionDefs = t4.readUInt16(), this.maxStackElements = t4.readUInt16(), this.maxSizeOfInstructions = t4.readUInt16(), this.maxComponentElements = t4.readUInt16(), this.maxComponentDepth = t4.readUInt16();
  }, e;
}(), me = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "hmtx", e.prototype.parse = function(t4) {
    var e2, r, n2, i2, a2, o2, s2;
    for (t4.pos = this.offset, this.metrics = [], e2 = 0, o2 = this.file.hhea.numberOfMetrics; 0 <= o2 ? e2 < o2 : e2 > o2; e2 = 0 <= o2 ? ++e2 : --e2) this.metrics.push({ advance: t4.readUInt16(), lsb: t4.readInt16() });
    for (n2 = this.file.maxp.numGlyphs - this.file.hhea.numberOfMetrics, this.leftSideBearings = function() {
      var r2, i3;
      for (i3 = [], e2 = r2 = 0; 0 <= n2 ? r2 < n2 : r2 > n2; e2 = 0 <= n2 ? ++r2 : --r2) i3.push(t4.readInt16());
      return i3;
    }(), this.widths = (function() {
      var t5, e3, r2, n3;
      for (n3 = [], t5 = 0, e3 = (r2 = this.metrics).length; t5 < e3; t5++) i2 = r2[t5], n3.push(i2.advance);
      return n3;
    }).call(this), r = this.widths[this.widths.length - 1], s2 = [], e2 = a2 = 0; 0 <= n2 ? a2 < n2 : a2 > n2; e2 = 0 <= n2 ? ++a2 : --a2) s2.push(this.widths.push(r));
    return s2;
  }, e.prototype.forGlyph = function(t4) {
    return t4 in this.metrics ? this.metrics[t4] : { advance: this.metrics[this.metrics.length - 1].advance, lsb: this.leftSideBearings[t4 - this.metrics.length] };
  }, e;
}(), ve = [].slice, be = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "glyf", e.prototype.parse = function() {
    return this.cache = {};
  }, e.prototype.glyphFor = function(t4) {
    var e2, r, n2, i2, a2, o2, s2, c2, u2, h2;
    return t4 in this.cache ? this.cache[t4] : (i2 = this.file.loca, e2 = this.file.contents, r = i2.indexOf(t4), 0 === (n2 = i2.lengthOf(t4)) ? this.cache[t4] = null : (e2.pos = this.offset + r, a2 = (o2 = new ne(e2.read(n2))).readShort(), c2 = o2.readShort(), h2 = o2.readShort(), s2 = o2.readShort(), u2 = o2.readShort(), this.cache[t4] = -1 === a2 ? new we(o2, c2, h2, s2, u2) : new ye(o2, a2, c2, h2, s2, u2), this.cache[t4]));
  }, e.prototype.encode = function(t4, e2, r) {
    var n2, i2, a2, o2, s2;
    for (a2 = [], i2 = [], o2 = 0, s2 = e2.length; o2 < s2; o2++) n2 = t4[e2[o2]], i2.push(a2.length), n2 && (a2 = a2.concat(n2.encode(r)));
    return i2.push(a2.length), { table: a2, offsets: i2 };
  }, e;
}(), ye = function() {
  function t3(t4, e, r, n2, i2, a2) {
    this.raw = t4, this.numberOfContours = e, this.xMin = r, this.yMin = n2, this.xMax = i2, this.yMax = a2, this.compound = false;
  }
  return t3.prototype.encode = function() {
    return this.raw.data;
  }, t3;
}(), we = function() {
  function t3(t4, e, r, n2, i2) {
    var a2, o2;
    for (this.raw = t4, this.xMin = e, this.yMin = r, this.xMax = n2, this.yMax = i2, this.compound = true, this.glyphIDs = [], this.glyphOffsets = [], a2 = this.raw; o2 = a2.readShort(), this.glyphOffsets.push(a2.pos), this.glyphIDs.push(a2.readUInt16()), 32 & o2; ) a2.pos += 1 & o2 ? 4 : 2, 128 & o2 ? a2.pos += 8 : 64 & o2 ? a2.pos += 4 : 8 & o2 && (a2.pos += 2);
  }
  return t3.prototype.encode = function() {
    var t4, e, r;
    for (e = new ne(ve.call(this.raw.data)), t4 = 0, r = this.glyphIDs.length; t4 < r; ++t4) e.pos = this.glyphOffsets[t4];
    return e.data;
  }, t3;
}(), Ne = function(t3) {
  function e() {
    return e.__super__.constructor.apply(this, arguments);
  }
  return oe(e, re), e.prototype.tag = "loca", e.prototype.parse = function(t4) {
    var e2, r;
    return t4.pos = this.offset, e2 = this.file.head.indexToLocFormat, this.offsets = 0 === e2 ? (function() {
      var e3, n2;
      for (n2 = [], r = 0, e3 = this.length; r < e3; r += 2) n2.push(2 * t4.readUInt16());
      return n2;
    }).call(this) : (function() {
      var e3, n2;
      for (n2 = [], r = 0, e3 = this.length; r < e3; r += 4) n2.push(t4.readUInt32());
      return n2;
    }).call(this);
  }, e.prototype.indexOf = function(t4) {
    return this.offsets[t4];
  }, e.prototype.lengthOf = function(t4) {
    return this.offsets[t4 + 1] - this.offsets[t4];
  }, e.prototype.encode = function(t4, e2) {
    for (var r = new Uint32Array(this.offsets.length), n2 = 0, i2 = 0, a2 = 0; a2 < r.length; ++a2) if (r[a2] = n2, i2 < e2.length && e2[i2] == a2) {
      ++i2, r[a2] = n2;
      var o2 = this.offsets[a2], s2 = this.offsets[a2 + 1] - o2;
      s2 > 0 && (n2 += s2);
    }
    for (var c2 = new Array(4 * r.length), u2 = 0; u2 < r.length; ++u2) c2[4 * u2 + 3] = 255 & r[u2], c2[4 * u2 + 2] = (65280 & r[u2]) >> 8, c2[4 * u2 + 1] = (16711680 & r[u2]) >> 16, c2[4 * u2] = (4278190080 & r[u2]) >> 24;
    return c2;
  }, e;
}(), Le = function() {
  function t3(t4) {
    this.font = t4, this.subset = {}, this.unicodes = {}, this.next = 33;
  }
  return t3.prototype.generateCmap = function() {
    var t4, e, r, n2, i2;
    for (e in n2 = this.font.cmap.tables[0].codeMap, t4 = {}, i2 = this.subset) r = i2[e], t4[e] = n2[r];
    return t4;
  }, t3.prototype.glyphsFor = function(t4) {
    var e, r, n2, i2, a2, o2, s2;
    for (n2 = {}, a2 = 0, o2 = t4.length; a2 < o2; a2++) n2[i2 = t4[a2]] = this.font.glyf.glyphFor(i2);
    for (i2 in e = [], n2) (null != (r = n2[i2]) ? r.compound : void 0) && e.push.apply(e, r.glyphIDs);
    if (e.length > 0) for (i2 in s2 = this.glyphsFor(e)) r = s2[i2], n2[i2] = r;
    return n2;
  }, t3.prototype.encode = function(t4, e) {
    var r, n2, i2, a2, o2, s2, c2, u2, h2, l2, f2, d2, p2, g2, m2;
    for (n2 in r = ue.encode(this.generateCmap(), "unicode"), a2 = this.glyphsFor(t4), f2 = { 0: 0 }, m2 = r.charMap) f2[(s2 = m2[n2]).old] = s2.new;
    for (d2 in l2 = r.maxGlyphID, a2) d2 in f2 || (f2[d2] = l2++);
    return u2 = function(t5) {
      var e2, r2;
      for (e2 in r2 = {}, t5) r2[t5[e2]] = e2;
      return r2;
    }(f2), h2 = Object.keys(u2).sort(function(t5, e2) {
      return t5 - e2;
    }), p2 = function() {
      var t5, e2, r2;
      for (r2 = [], t5 = 0, e2 = h2.length; t5 < e2; t5++) o2 = h2[t5], r2.push(u2[o2]);
      return r2;
    }(), i2 = this.font.glyf.encode(a2, p2, f2), c2 = this.font.loca.encode(i2.offsets, p2), g2 = { cmap: this.font.cmap.raw(), glyf: i2.table, loca: c2, hmtx: this.font.hmtx.raw(), hhea: this.font.hhea.raw(), maxp: this.font.maxp.raw(), post: this.font.post.raw(), name: this.font.name.raw(), head: this.font.head.encode(e) }, this.font.os2.exists && (g2["OS/2"] = this.font.os2.raw()), this.font.directory.encode(g2);
  }, t3;
}();
E.API.PDFObject = function() {
  var t3;
  function e() {
  }
  return t3 = function(t4, e2) {
    return (Array(e2 + 1).join("0") + t4).slice(-e2);
  }, e.convert = function(r) {
    var n2, i2, a2, o2;
    if (Array.isArray(r)) return "[" + function() {
      var t4, i3, a3;
      for (a3 = [], t4 = 0, i3 = r.length; t4 < i3; t4++) n2 = r[t4], a3.push(e.convert(n2));
      return a3;
    }().join(" ") + "]";
    if ("string" == typeof r) return "/" + r;
    if (null != r ? r.isString : void 0) return "(" + r + ")";
    if (r instanceof Date) return "(D:" + t3(r.getUTCFullYear(), 4) + t3(r.getUTCMonth(), 2) + t3(r.getUTCDate(), 2) + t3(r.getUTCHours(), 2) + t3(r.getUTCMinutes(), 2) + t3(r.getUTCSeconds(), 2) + "Z)";
    if ("[object Object]" === {}.toString.call(r)) {
      for (i2 in a2 = ["<<"], r) o2 = r[i2], a2.push("/" + i2 + " " + e.convert(o2));
      return a2.push(">>"), a2.join("\n");
    }
    return "" + r;
  }, e;
}();
class PDFExportService {
  async exportSummary(documentName, summary, options) {
    try {
      const doc = new E();
      doc.setProperties({
        title: (options == null ? void 0 : options.title) || `Summary - ${documentName}`,
        author: (options == null ? void 0 : options.author) || "bynetna by peaklight.ai",
        subject: (options == null ? void 0 : options.subject) || "Document Summary"
      });
      try {
        const logoPath = path$1.join(__dirname, "assets", "peaklight-logo.png");
        const logoData = fs$1.readFileSync(logoPath).toString("base64");
        doc.addImage(`data:image/png;base64,${logoData}`, "PNG", 150, 10, 40, 10);
      } catch (error) {
        console.log("Logo not found, skipping...");
      }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Document Summary", 20, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Document: ${documentName}`, 20, 30);
      doc.setFontSize(10);
      doc.text(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, 20, 36);
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(summary, 170);
      doc.text(splitText, 20, 50);
      const pageCount = doc.getNumberOfPages();
      for (let i2 = 1; i2 <= pageCount; i2++) {
        doc.setPage(i2);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i2} of ${pageCount} • powered by peaklight.ai`,
          20,
          doc.internal.pageSize.height - 10
        );
      }
      const arrayBuffer = doc.output("arraybuffer");
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }
  async exportChat(documentName, messages, options) {
    try {
      const doc = new E();
      doc.setProperties({
        title: (options == null ? void 0 : options.title) || `Chat - ${documentName}`,
        author: (options == null ? void 0 : options.author) || "bynetna by peaklight.ai",
        subject: (options == null ? void 0 : options.subject) || "Document Chat"
      });
      try {
        const logoPath = path$1.join(__dirname, "assets", "peaklight-logo.png");
        const logoData = fs$1.readFileSync(logoPath).toString("base64");
        doc.addImage(`data:image/png;base64,${logoData}`, "PNG", 150, 10, 40, 10);
      } catch (error) {
        console.log("Logo not found, skipping...");
      }
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Document Chat", 20, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Document: ${documentName}`, 20, 30);
      let yPosition = 50;
      for (const message of messages) {
        if (yPosition > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        if (message.role === "user") {
          doc.setTextColor(0, 102, 204);
        } else {
          doc.setTextColor(139, 0, 139);
        }
        doc.text(message.role === "user" ? "You:" : "AI:", 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(128, 128, 128);
        doc.text(
          message.timestamp.toLocaleTimeString(),
          180,
          yPosition,
          { align: "right" }
        );
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const splitText = doc.splitTextToSize(message.content, 170);
        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 5 + 10;
      }
      const pageCount = doc.getNumberOfPages();
      for (let i2 = 1; i2 <= pageCount; i2++) {
        doc.setPage(i2);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i2} of ${pageCount} • powered by peaklight.ai`,
          20,
          doc.internal.pageSize.height - 10
        );
      }
      const arrayBuffer = doc.output("arraybuffer");
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error("Error exporting chat PDF:", error);
      throw new Error(`Failed to export chat PDF: ${error.message}`);
    }
  }
}
const pdfExportService = new PDFExportService();
let mainWindow = null;
const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#ffffff"
  });
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
  const isDev = process.env.NODE_ENV !== "production";
  console.log("[Main] Environment:", {
    VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
    NODE_ENV: process.env.NODE_ENV,
    isDev,
    devServerUrl
  });
  if (isDev) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path$1.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("dialog:openFile", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Documents", extensions: ["pdf", "docx", "doc", "txt", "md"] },
      { name: "PDF Files", extensions: ["pdf"] },
      { name: "Word Documents", extensions: ["docx", "doc"] },
      { name: "Text Files", extensions: ["txt", "md"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const fileBuffer = await fs$2.readFile(filePath);
    const fileName = path$1.basename(filePath);
    const fileExtension = path$1.extname(filePath);
    return {
      filePath,
      fileName,
      fileExtension,
      buffer: Array.from(fileBuffer)
      // Convert Buffer to array for IPC
    };
  }
  return null;
});
electron.ipcMain.handle("dialog:saveFile", async (_2, defaultName) => {
  const result = await electron.dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: "PDF Files", extensions: ["pdf"] }
    ]
  });
  if (!result.canceled && result.filePath) {
    return result.filePath;
  }
  return null;
});
electron.ipcMain.handle("fs:writeFile", async (_2, filePath, data) => {
  await fs$2.writeFile(filePath, Buffer.from(data));
  return true;
});
electron.ipcMain.handle("app:getPath", (_2, name) => {
  return electron.app.getPath(name);
});
electron.ipcMain.handle("document:parse", async (_2, buffer, fileName) => {
  try {
    const uint8Buffer = new Uint8Array(buffer);
    const result = await documentService.parseDocument(uint8Buffer, fileName);
    return { text: result.text };
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
});
electron.ipcMain.handle("llm:summarize", async (_2, text) => {
  try {
    const summary = await llmService.summarize(text);
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
});
electron.ipcMain.handle("pdf:exportSummary", async (_2, documentName, summary) => {
  try {
    const pdfData = await pdfExportService.exportSummary(documentName, summary);
    return Array.from(pdfData);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
});
exports._typeofExports = _typeofExports;
exports.commonjsGlobal = commonjsGlobal;
exports.getDefaultExportFromCjs = getDefaultExportFromCjs;
