(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("WBLib", [], factory);
	else if(typeof exports === 'object')
		exports["WBLib"] = factory();
	else
		root["WBLib"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/lodash/_Hash.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"),
    hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"),
    hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"),
    hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"),
    hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ "./node_modules/lodash/_ListCache.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"),
    listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"),
    listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"),
    listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"),
    listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ "./node_modules/lodash/_Map.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ "./node_modules/lodash/_MapCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"),
    mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"),
    mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"),
    mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"),
    mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "./node_modules/lodash/_arrayMap.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_arrayMap.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "./node_modules/lodash/_assocIndexOf.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ "./node_modules/lodash/_baseGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;


/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "./node_modules/lodash/_baseIsNative.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "./node_modules/lodash/_baseToString.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseToString.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "./node_modules/lodash/_castPath.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_castPath.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    stringToPath = __webpack_require__(/*! ./_stringToPath */ "./node_modules/lodash/_stringToPath.js"),
    toString = __webpack_require__(/*! ./toString */ "./node_modules/lodash/toString.js");

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;


/***/ }),

/***/ "./node_modules/lodash/_coreJsData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash/_getMapData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ "./node_modules/lodash/_getNative.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "./node_modules/lodash/_getValue.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "./node_modules/lodash/_hashClear.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ "./node_modules/lodash/_hashDelete.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ "./node_modules/lodash/_hashGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ "./node_modules/lodash/_hashHas.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ "./node_modules/lodash/_hashSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ "./node_modules/lodash/_isKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_isKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;


/***/ }),

/***/ "./node_modules/lodash/_isKeyable.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ "./node_modules/lodash/_isMasked.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "./node_modules/lodash/_listCacheClear.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_listCacheDelete.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_listCacheGet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_listCacheHas.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_listCacheSet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheClear.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"),
    ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheDelete.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheGet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ "./node_modules/lodash/_mapCacheSet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ "./node_modules/lodash/_memoizeCapped.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_memoizeCapped.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoize = __webpack_require__(/*! ./memoize */ "./node_modules/lodash/memoize.js");

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;


/***/ }),

/***/ "./node_modules/lodash/_nativeCreate.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "./node_modules/lodash/_stringToPath.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_stringToPath.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoizeCapped = __webpack_require__(/*! ./_memoizeCapped */ "./node_modules/lodash/_memoizeCapped.js");

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;


/***/ }),

/***/ "./node_modules/lodash/_toKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_toKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;


/***/ }),

/***/ "./node_modules/lodash/_toSource.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "./node_modules/lodash/eq.js":
/*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "./node_modules/lodash/get.js":
/*!************************************!*\
  !*** ./node_modules/lodash/get.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js");

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;


/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "./node_modules/lodash/isFunction.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "./node_modules/lodash/isSymbol.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isSymbol.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),

/***/ "./node_modules/lodash/memoize.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/memoize.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;


/***/ }),

/***/ "./node_modules/lodash/toString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toString.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/api.js":
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// WB api endpoint calls - move all ax calls here to have them on same place

// !!! Do not combine ax endpoints into 1 dynamic ax call
// these calls should "document" WB endpoints
// eventually refactor when all calls are in one place


function getCookie(name) {
    if (!document.cookie) {
        return null;
    }

    var cookies = document.cookie.split(';').map(function (c) {
        return c.trim();
    }).filter(function (c) {
        return c.startsWith(name + '=');
    });

    if (cookies.length === 0) {
        return null;
    }

    return decodeURIComponent(cookies[0].split('=')[1]);
}

// isText - used to distingusish between returned html (in forms) and json data
var _post = function _post(_ref) {
    var url = _ref.url,
        data = _ref.data,
        errorCb = _ref.errorCb,
        successCb = _ref.successCb,
        _ref$isText = _ref.isText,
        isText = _ref$isText === undefined ? false : _ref$isText;


    return fetch(url, {
        method: 'POST', // or 'PUT'
        body: data, // data can be `string` or {object}
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(function (res) {
        return isText ? res.text() : res.json();
    }).catch(function (error) {
        return errorCb(error);
    }).then(function (response) {
        return successCb(response);
    });
};

var _get = function _get(_ref2) {
    var url = _ref2.url,
        data = _ref2.data,
        errorCb = _ref2.errorCb,
        successCb = _ref2.successCb,
        _ref2$isText = _ref2.isText,
        isText = _ref2$isText === undefined ? false : _ref2$isText;


    return fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(function (res) {
        return isText ? res.text() : res.json();
    }).catch(function (error) {
        return errorCb(error);
    }).then(function (response) {
        return successCb(response);
    });
};

/**
 * Filter dashboard data based on filters
 *
 * data: {coord: [-180, -90, 180, 90], tabyia: 'some_name'},
 *
 * @param data
 * @param successCb
 */
function axFilterDashboardData(_ref3, options) {
    var data = _ref3.data;

    var req = {
        url: '/data/',
        data: data,
        successCb: function successCb(resp) {
            WB.controller.updateDashboards(resp, options);
        },
        errorCb: function errorCb() {
            return WB.notif.options({
                message: 'Could not Fetch Dashboard data.',
                type: 'danger'
            }).show();
        }
    };

    _post(req);
}

/**
 * Fetch changeset for feature
 * - RETURNS HTML
 * - on row click on Feature by uuid page
 *
 * @param featureUUID
 * @param changesetId
 * @param successCb
 */
function axGetFeatureChangesetByUUID(_ref4) {
    var featureUUID = _ref4.featureUUID,
        changesetId = _ref4.changesetId,
        successCb = _ref4.successCb;

    if (!featureUUID || !changesetId) {
        throw new Error('Feature UUID or changeset id not provided.');
    }

    _get({
        url: '/feature-by-uuid/' + featureUUID + '/' + changesetId + '/',
        isText: true,
        successCb: successCb || function (data) {
            WB.historytable.showModalForm(data);
        },
        errorCb: function errorCb(e) {
            console.log(e);
            WB.notif.options({
                message: 'Could not Fetch Change Sets',
                type: 'danger'
            }).show();
        }
    });
}

// isText - used to distingusish between returned html (in forms) and json data
var _postForm = function _postForm(_ref5) {
    var url = _ref5.url,
        data = _ref5.data,
        errorCb = _ref5.errorCb,
        successCb = _ref5.successCb,
        _ref5$isText = _ref5.isText,
        isText = _ref5$isText === undefined ? false : _ref5$isText;


    return fetch(url, {
        method: 'POST', // or 'PUT'
        body: new FormData(data), // data can be `string` or {object}
        headers: {
            "Accept": "application/json",
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            'X-CSRFToken': getCookie('csrftoken') // django stuff
        },
        credentials: 'include' // django stuff
    }).then(function (res) {
        return isText ? res.text() : res.json();
    }).catch(function (error) {
        return errorCb(error);
    }).then(function (response) {
        return successCb(response);
    });
};

/**
 * Update Feature
 * - on Feature update form update submit
 * - backend returns HTML
 * @param featureUUID
 * @param data
 * @param successCb
 */
function axUpdateFeature(_ref6) {
    var data = _ref6.data,
        successCb = _ref6.successCb,
        errorCb = _ref6.errorCb;

    _postForm({
        url: '/update-feature/' + data._feature_uuid,
        data: data,
        isText: true,
        successCb: successCb || function (resp) {
            console.log('success', resp);
            // show modal and do not close
            WB.loadingModal.show();

            WB.notif.options({
                message: 'Water Point Successfully Updated.',
                type: 'success'
            }).show();

            // TODO: this is a simple way of 'refreshing' data after a successful data update
            //      window.location.reload(true);
        },
        errorCb: errorCb || function (request) {

            console.log('errot', request);
            WB.notif.options({
                message: 'Could not Update Water Point',
                type: 'danger'
            }).show();

            /**
             * Django returns form as a string with error fields on submit error
             *
             * Remove old form
             * Append new form (django response)
             * Init accordion on new form
             * Init the form, Enable form
             */
            WB.FeatureForm.replaceFormMarkup(request.responseText);
            WB.FeatureForm.enableForm(true);
            WB.FeatureForm.showUpdateButton(true);
        }
    });
}

function axGetMapData(_ref7) {
    var data = _ref7.data,
        successCb = _ref7.successCb,
        errorCb = _ref7.errorCb;

    var req = {
        url: '/dashboard-mapdata/',
        data: data,
        successCb: successCb || function (data) {
            WB.controller.map.markerData(data).clearLayer(true).renderMarkers({
                iconIdentifierKey: 'functioning'
            });
        },
        errorCb: errorCb || function (request, error) {
            WB.notif.options({
                message: 'Could not Fetch Map Data',
                type: 'danger'
            }).show();
        }
    };

    _post(req);
}

/**
 * Endpoint to filter attribute options and fills returned options
 *
 * @param query
 * @param name
 * @param selectizeCb
 */
function axFilterAttributeOption(query, name, selectizeCb) {
    _get({
        url: '/attributes/filter/options?attributeOptionsSearchString=' + query + '&attributeKey=' + name,
        errorCb: function errorCb() {
            selectizeCb();
        },
        successCb: function successCb(response) {
            selectizeCb(response.attribute_options);
        }
    });
}

var api = {
    getCookie: getCookie,
    axGetMapData: axGetMapData,
    axUpdateFeature: axUpdateFeature,
    axGetFeatureChangesetByUUID: axGetFeatureChangesetByUUID,
    axFilterDashboardData: axFilterDashboardData,
    axFilterAttributeOption: axFilterAttributeOption
};

exports.default = api;
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/Charts/beneficiaries.js":
/*!************************************************!*\
  !*** ./src/components/Charts/beneficiaries.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// ===================================================
// HELPER FUNCTIONS
// ===================================================


/* beneficiaries: {
        sum: '-',
        min: '-',
        max: '-',
        avg: '-'
    },...*/
var DEFAULT_INFO_VALUE = {
    sum: '-',
    min: '-',
    max: '-',
    avg: '-'
};
/**
 * Beneficiaries statistics charts
 *
 * Statistic item is identified by key and has a Label
 * @type {{initKeys: Info.initKeys, setInfo: Info.setInfo, get: (function(*): *)}}
 */
var Info = {
    initKeys: function initKeys(infoKeys) {
        var _this = this;

        this.infoKeys = infoKeys;

        infoKeys.forEach(function (item) {
            _this[item.key] = DEFAULT_INFO_VALUE;
        });
    },
    setInfo: function setInfo(data, keys) {
        var _this2 = this;

        var dataCnt = (data || []).length;

        _.forEach(keys, function (key) {
            var sum = _.sumBy(data, key) || '-';

            _this2[key] = {
                sum: sum,
                min: _.get(_.minBy(data, key), key, '-'),
                max: _.get(_.maxBy(data, key), key, '-'),
                avg: Math.round(sum / dataCnt) || '-'
            };
        });
    },
    get: function get(key) {
        return this[key];
    }
};

var _renderInfoItem = function _renderInfoItem(item) {
    return '<li>\n    <span>' + item[0] + '</span>\n    <span>' + item[1] + '</span>\n</li>';
};

function _createInfoRow(label, opts) {
    var min = opts.min,
        max = opts.max,
        avg = opts.avg,
        sum = opts.sum;


    var otherInfo = '<ul>' + [['min:', min], ['max:', max], ['avg:', avg]].map(_renderInfoItem).join('') + '</ul>';

    return '<div class="info-row">\n            <div class="info-row-label">' + label + '</div>\n            <div class="info-statistics">\n                <div class="main-nmbr">' + sum + '</div>\n                <div class="other-nmbr">' + otherInfo + '</div>\n            </div>\n        </div>';
}

var _createUpdateChartFn = function _createUpdateChartFn(parent) {
    return function () {
        parent.innerHTML = '';

        Info.infoKeys.forEach(function (item) {
            parent.innerHTML += _createInfoRow(item.label, Info.get(item.key));
        });
    };
};

// ===================================================
// Chart
// ===================================================

Info.initKeys([{
    key: 'beneficiaries',
    label: 'Beneficiaries'
}, {
    key: 'cnt',
    label: 'Count'
}]);

var infoWrapper = void 0;
var _updateChartFn = void 0;

function chart(parentDom) {

    infoWrapper = document.createElement('div');

    infoWrapper.setAttribute('class', 'wb-beneficiaries-chart');

    parentDom.appendChild(infoWrapper);

    _updateChartFn = _createUpdateChartFn(infoWrapper);

    _updateChartFn();
}

chart.resetActive = function (data) {};

// BENEFICIARIES CHART DATA GETTER / SETTER
chart.data = function (data) {
    if (!arguments.length) {
        return Info.infoKeys.map(function (item) {
            return Info.get(item.key);
        });
    }

    Info.setInfo(data, ['beneficiaries', 'cnt']);

    if (typeof _updateChartFn === 'function') {
        _updateChartFn();
    }

    return chart;
};

function chartInit(parentDom) {
    chart(parentDom);
    return chart;
}

exports.default = chartInit;
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/datatable/index.js":
/*!*******************************************!*\
  !*** ./src/components/datatable/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Jquery datatable wrapper
 *
 * @param domId
 * @param options
 * @returns {TableReport}
 * @constructor
 */

var TableReport = function TableReport(domId, options) {
    _classCallCheck(this, TableReport);

    _initialiseProps.call(this);

    this.dataTableOpts = options.dataTable;

    this.modalOpts = options.modalOpts;

    this.tableDomObj = null;

    this.reportTable = null;

    this.selectedRow = {};

    this.init(domId);
}

/** TODO handle callbacks
 * Open and set content to modal
 *
 * data - html string
 * @param data
 */

/**
 * Set dom, init datatable and add events
 * @param domId
 */
;

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.showModalForm = function (data) {
        var templ = WBLib.templates.getFormTemplate(data, _this.modalOpts.title);
        var content = $(templ);

        WB.modal._setContent(content);
        WB.modal._show();

        if (_this.modalOpts.modalOnOpenCb && _this.modalOpts.modalOnOpenCb instanceof Function) {
            _this.modalOpts.modalOnOpenCb({
                modalObj: content
            });
        }
    };

    this.init = function (domId) {
        _this.tableDomObj = document.getElementById(domId);
        _this.reportTable = $(_this.tableDomObj).DataTable(_this.dataTableOpts);
        _this.addTableEvents();
    };

    this.redraw = function (newData) {
        newData = newData || [];
        _this.reportTable.clear();
        _this.reportTable.rows.add(newData);
        _this.reportTable.draw();
    };

    this.addTableEvents = function () {
        var self = _this;

        // enable table row click event
        if (_this.dataTableOpts.rowClickCb && _this.dataTableOpts.rowClickCb instanceof Function) {
            $(_this.tableDomObj.tBodies[0]).on('click', 'tr', function () {

                self.selectedRow = self.reportTable.row(this).data();

                self.dataTableOpts.rowClickCb(self.selectedRow, self);
            });
        }
    };
};

exports.default = TableReport;
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/form/index.js":
/*!**************************************!*\
  !*** ./src/components/form/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = __webpack_require__(/*! ./utils */ "./src/components/form/utils.js");

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
    utils: utils
};
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/form/utils.js":
/*!**************************************!*\
  !*** ./src/components/form/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Reduce form to key (field name) - value pairs from field names
 *
 * @param fieldNames   - array of field names to pick from form
 * @param form         - form dom object
 * @returns {*}
 */
var getFormFieldValues = exports.getFormFieldValues = function getFormFieldValues(fieldNames, form) {
    var fields = form.elements;

    return _.reduce(fieldNames, function (acc, name) {
        if (fields[name]) {
            acc[name] = fields[name].value;
        }
        return acc;
    }, {});
};

/**
 * "Parse" form to get all form fields (will include all valid HTML fields - form.elements)
 * - returns object with key/val field pairs
 * - field name represents the key, val is the dom obj
 *
 * @param form         - form dom object
 * @returns {object}
 */
var getFormFields = exports.getFormFields = function getFormFields(form) {
    return _.reduce(form.elements, function (acc, field, i) {
        if (field.name) {
            acc[field.name] = field;
        }
        return acc;
    }, {});
};

/**
 * Set form field value from a key/val pair
 * - key represents the field name, val the value
 * - the field name must exist in this.formFields
 *
 * @param fieldData    - array of key (field name )/ value pairs
 * @param form         - form dom object
 */
var setFormFieldValues = exports.setFormFieldValues = function setFormFieldValues(fieldData, form) {
    var fields = form.elements;

    _.forEach(fieldData, function (fieldName) {
        if (fields[fieldName]) {
            fields[fieldName].value = fieldData[fieldName];
        }
    });
};

/***/ }),

/***/ "./src/components/map/WbMap.js":
/*!*************************************!*\
  !*** ./src/components/map/WbMap.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = wbMap;

var _get3 = __webpack_require__(/*! lodash/get */ "./node_modules/lodash/get.js");

var _get4 = _interopRequireDefault(_get3);

var _mapUtils = __webpack_require__(/*! ./mapUtils */ "./src/components/map/mapUtils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Do not import leaflet ... use from global


// const DEFAULT_CONF = {
//        // mapId,
//         initialMapView: [14.3, 38.3],
//         leafletConf: {
//             zoom: 6
//         },
//
//         activeLayerName: 'MapBox',
//         tileLayerDef: TILELAYER_DEFINITIONS,
//
//         // layers which will be available in the map control ordered by its array position
//         enabledLayers: [
//             "bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"
//         ],
//         markerData: [],
//         markerRenderFn: null,
//         mapOnMoveEndFn: null,
//         initMarkersOnLoad: false,
//         init: false,
//
//
//         mapSearch: null
//     };


function wbMap(conf) {
    var options = conf || {};

    var mapId = conf.mapId,
        _conf$initialMapView = conf.initialMapView,
        initialMapView = _conf$initialMapView === undefined ? [14.3, 38.3] : _conf$initialMapView,
        _conf$leafletConf = conf.leafletConf,
        leafletConf = _conf$leafletConf === undefined ? {
        zoom: 6
    } : _conf$leafletConf,
        _conf$activeLayerName = conf.activeLayerName,
        activeLayerName = _conf$activeLayerName === undefined ? 'MapBox' : _conf$activeLayerName,
        _conf$tileLayerDef = conf.tileLayerDef,
        tileLayerDef = _conf$tileLayerDef === undefined ? TILELAYER_DEFINITIONS : _conf$tileLayerDef,
        _conf$enabledLayers = conf.enabledLayers,
        enabledLayers = _conf$enabledLayers === undefined ? ["bingLayer", "googleSatLayer", "mapbox", "osmLayer", "googleLayer"] : _conf$enabledLayers,
        _conf$markerData = conf.markerData,
        markerData = _conf$markerData === undefined ? [] : _conf$markerData,
        _conf$markerRenderFn = conf.markerRenderFn,
        markerRenderFn = _conf$markerRenderFn === undefined ? null : _conf$markerRenderFn,
        _conf$mapOnMoveEndFn = conf.mapOnMoveEndFn,
        mapOnMoveEndFn = _conf$mapOnMoveEndFn === undefined ? null : _conf$mapOnMoveEndFn,
        _conf$initMarkersOnLo = conf.initMarkersOnLoad,
        initMarkersOnLoad = _conf$initMarkersOnLo === undefined ? false : _conf$initMarkersOnLo,
        _conf$init = conf.init,
        init = _conf$init === undefined ? false : _conf$init,
        mapSearch = conf.mapSearch;


    var _markerData = markerData.slice(0);
    var _markerLayer = void 0;
    var _searchField = void 0;
    var _leafletMap = null;

    var _layerConf = (0, _mapUtils.initTileLayers)(tileLayerDef, enabledLayers);

    if ((0, _get4.default)(_layerConf, activeLayerName)) {
        leafletConf = Object.assign({}, leafletConf, {
            layers: _layerConf[activeLayerName]
        });
    }

    function _map() {

        // INIT LEAFLET INSTANCE

        _leafletMap = L.map(mapId, leafletConf).setView(initialMapView, leafletConf.zoom);

        // ADD TILE LAYERS TO MAP INSTANCE / CONTROLS

        L.control.layers(_layerConf).addTo(_leafletMap);

        // ADD WB MARKER LAYER TO MAP INSTANCE

        _markerLayer = (0, _mapUtils.initMarkerLayer)(true, _markerLayer, _leafletMap);

        // RENDER MARKERS ON MAP

        if (initMarkersOnLoad === true && (_markerData || []).length > 0) {
            (0, _mapUtils.addMarkersToMap)({
                options: options,
                markerRenderFn: markerRenderFn,
                markerData: _markerData,
                markerLayer: _markerLayer,
                leafletMap: _leafletMap
            });
        }

        // ADD MAP ON MOVE END CALLBACK

        if (mapOnMoveEndFn && mapOnMoveEndFn instanceof Function) {
            _leafletMap.on('moveend', function () {
                mapOnMoveEndFn(this);
            });
        }

        // ENABLE MAP SEARCH

        if (mapSearch && mapSearch.enabled === true) {

            (0, _mapUtils.selectizeSearch)({
                parentId: mapSearch.parentId || 'geo-search-wrap',
                urlFnc: buildSearchQueryString,
                leafletMap: _leafletMap
            });
        }
    }

    // marker data getter / setter
    _map.markerData = function (data) {
        if (!arguments.length) {
            return _markerData;
        }
        _markerData = data;

        return _map;
    };

    // leaflet map instance getter
    _map.leafletMap = function () {
        return _leafletMap;
    };

    // leaflet marker layergetter
    _map.markerLayer = function () {
        return _markerLayer;
    };

    // create /  clear map markers layer
    _map.clearLayer = function (clearLayer) {
        _markerLayer = (0, _mapUtils.initMarkerLayer)(clearLayer, _markerLayer, _leafletMap);

        return _map;
    };

    /**
     * render markers based on marker data
     * calls set markerRenderer function with marker data and options as arguments
     *
     * @param options any custom data provided at init
     * @returns {_map}
     */
    _map.renderMarkers = function (options) {

        (0, _mapUtils.addMarkersToMap)({
            options: options,
            markerRenderFn: markerRenderFn,
            markerData: _markerData,
            markerLayer: _markerLayer,
            leafletMap: _leafletMap
        });
        return _map;
    };

    _map.getMapBounds = function () {
        var bounds = _leafletMap.getBounds();

        return [bounds.getWest(), bounds.getNorth(), bounds.getEast(), bounds.getSouth()];
    };

    // Clear map search drop down
    _map.clearSearchField = function () {
        _searchField && _searchField[0].selectize.clear();

        return _map;
    };

    // TODO move somwhere, decide default search layer
    function buildSearchQueryString(query) {
        var _get2 = (0, _get4.default)(tileLayerDef, 'mapbox', {}),
            token = _get2.token,
            searchApi = _get2.searchApi;

        var queryString = query.trim().replace(' ', '+') + ('.json?access_token=' + token);

        return '' + searchApi + queryString;
    }

    if (init === true) {
        _map();
    }
    return _map;
}
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/map/index.js":
/*!*************************************!*\
  !*** ./src/components/map/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mapUtils = __webpack_require__(/*! ./mapUtils */ "./src/components/map/mapUtils.js");

var _WbMap = __webpack_require__(/*! ./WbMap */ "./src/components/map/WbMap.js");

var _WbMap2 = _interopRequireDefault(_WbMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = { wbMap: _WbMap2.default, createDashBoardMarker: _mapUtils.createDashBoardMarker, createFeatureByUUidMarker: _mapUtils.createFeatureByUUidMarker };
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/map/mapUtils.js":
/*!****************************************!*\
  !*** ./src/components/map/mapUtils.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initTileLayers = initTileLayers;
exports.initMarkerLayer = initMarkerLayer;
exports.selectizeSearch = selectizeSearch;
exports.addMarkersToMap = addMarkersToMap;
exports.initMapMarker = initMapMarker;
exports.createFeatureByUUidMarker = createFeatureByUUidMarker;
exports.createDashBoardMarker = createDashBoardMarker;
// TODO - handle / refactor  globals at some point
// leaflet global - L is included in page includes
// general idea is to use those globals from the global scope and to not include in build process


/**
 * Init Map Tile layers from tile configuration
 *
 * will initialise layer instances, handling default leaflet layers and bing plugin layer
 *
 * @param layerOpts
 * @param enabledLayerNames
 * @returns {{layerLabel: L.tileLayer}}
 */
function initTileLayers(layerOpts, enabledLayerNames) {

    return (enabledLayerNames || []).reduce(function (acc, layerName) {
        var _layerOpts$layerName = layerOpts[layerName],
            initType = _layerOpts$layerName.initType,
            label = _layerOpts$layerName.label,
            mapOpts = _layerOpts$layerName.mapOpts,
            key = _layerOpts$layerName.key;


        if (!initType || initType === 'default') {
            acc[label] = L.tileLayer(mapOpts.url, mapOpts.options);
        } else if (initType === 'custom') {
            // currently only bing layer here
            acc[label] = L.tileLayer.bing(key);
        } else {
            console.log('Could not initialize map layers.');
        }

        return acc;
    }, {});
}

/**
 *
 * @param clearLayer
 * @param markerLayer
 * @param leafletMap
 */
function initMarkerLayer(clearLayer, markerLayer, leafletMap) {

    // HANDLE EXISTING LAYER - CLEAR / ADD LAYER TO MAP

    if (markerLayer) {

        clearLayer === true && markerLayer.clearLayers();

        leafletMap && !leafletMap.hasLayer(markerLayer) && markerLayer.addTo(leafletMap);

        return markerLayer;
    }

    // CREATE AND ADD NEW LAYER TO MAP

    if (leafletMap) {
        var newMarkerLayer = L.layerGroup([]);

        newMarkerLayer.addTo(leafletMap);

        return newMarkerLayer;
    }
}

// todo refactor - es6
function selectizeSearch(options) {
    var _options$parentId = options.parentId,
        parentId = _options$parentId === undefined ? 'geo-search-wrap' : _options$parentId,
        urlFnc = options.urlFnc,
        leafletMap = options.leafletMap;


    var searchResults = [];

    var searchParent = $('#' + parentId || '#geo-search-wrap');

    var field = $('<select name="search"></select>');

    searchParent.append(field);

    return field.selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        valueField: 'id',
        labelField: 'place_name',
        searchField: ['place_name'],
        options: [],
        items: null,
        create: false,

        load: function load(query, callback) {
            if (!query) {
                return callback();
            }
            $.ajax({
                url: urlFnc(query),
                type: 'GET',
                dataType: 'json',
                error: function error() {
                    callback();
                },
                success: function success(response) {
                    // response format is bound to api...
                    searchResults = response.features;

                    callback(searchResults);
                }
            });

            return true;
        },
        onChange: function onChange(id) {
            if (!id) {
                return false;
            }
            // TODO review behaviour when none selected
            var result = _.find(searchResults, function (place) {
                return place.id === id;
            });

            if (result === undefined) {
                return false;
            }

            if (result.bbox !== undefined) {
                leafletMap.fitBounds(L.latLngBounds(L.latLng(result.bbox[1], result.bbox[0]), // southWest
                L.latLng(result.bbox[3], result.bbox[2]) // northEast
                ));
            } else {
                leafletMap.setView([result.center[1], result.center[0]], 18);
            }

            return true;
        }
    });
}

/**
 * Render markers using markerRenderFn with markerData and options as arguments on leaflet
 * map instance
 * Zoom to last marker
 *
 * @param options
 * @param markerData
 * @param markerRenderFn
 * @param markerLayer
 * @param leafletMap
 */
function addMarkersToMap(_ref) {
    var options = _ref.options,
        markerData = _ref.markerData,
        markerRenderFn = _ref.markerRenderFn,
        markerLayer = _ref.markerLayer,
        leafletMap = _ref.leafletMap;


    if (markerData instanceof Array && markerData.length > 0) {
        var marker = void 0;

        _.forEach(markerData, function (data) {
            marker = markerRenderFn({
                markerData: data,
                options: options
            });
            marker.addTo(markerLayer);
        });

        //if (markerData[markerData.length - 1].zoomToMarker === true && marker) {
        if (marker && marker.zoomToMarker === true) {
            leafletMap.fitBounds(L.latLngBounds([marker.getLatLng()]), { maxZoom: 12 });
        }
    } else {
        WB.notif.options({
            message: 'No Data found',
            type: 'warning'
        }).show();
    }
}

/**
 * Init "default" wb map marker
 * @param conf
 * @returns {*}
 */
function initMapMarker(_ref2) {
    var geometry = _ref2.geometry,
        draggable = _ref2.draggable,
        riseOnHover = _ref2.riseOnHover,
        icon = _ref2.icon,
        markerClass = _ref2.markerClass,
        popupContent = _ref2.popupContent,
        dragend = _ref2.dragend,
        onClick = _ref2.onClick;


    var marker = L.marker(geometry, {
        draggable: draggable === true,
        riseOnHover: riseOnHover === true,
        icon: icon || L.divIcon({
            className: 'map-marker ' + (markerClass || ''),
            iconSize: [32, 32],
            html: '<i class="fa fa-fw fa-map-marker"></i>'
        })
    });

    if (popupContent) {
        marker.bindPopup(popupContent);
    }

    if (dragend instanceof Function) {
        marker.on('dragend', dragend);
    }

    if (onClick instanceof Function) {
        marker.on('click', onClick);
    }
    return marker;
}

/**
 * Create feature by uuid map marker
 *
 * Updates features form lat, lon on dragend
 */
function createFeatureByUUidMarker(conf) {

    var opts = conf.markerData;

    return initMapMarker({
        draggable: opts.draggable === true,
        geometry: opts.geometry,
        popupContent: (opts.data || {})._feature_uuid || '',
        dragend: function dragend(e) {
            var coord = this.getLatLng();
            var coordDecimals = 7;
            WBLib.form.utils.setFormFieldValues({
                latitude: parseFloat(coord.lat).toFixed(coordDecimals),
                longitude: parseFloat(coord.lng).toFixed(coordDecimals)
            }, WB.FeatureForm.formDomObj);
        }
    });
}

// MAP FNCS - used in wb.map.js

/**
 * Create Markers on Dashboard page map
 * Markers are colored based on functioning group
 *
 * iconIdentifierKey
 *  - represents the marker data key which holds the group (yes, no, unknown) used for marker coloring on dashboard page
 *  - the marker key will be appended to marker class
 * @param opts
 * @returns {*}
 */
function createDashBoardMarker(conf) {
    var markerData = conf.markerData,
        options = conf.options;

    // yield is a reserved word... will fail if taken

    var woreda = markerData.woreda,
        tabiya = markerData.tabiya,
        kushet = markerData.kushet,
        static_water_level = markerData.static_water_level,
        feature_uuid = markerData.feature_uuid,
        name = markerData.name,
        count = markerData.count,
        lat = markerData.lat,
        lng = markerData.lng,
        unique_id = markerData.unique_id;


    var coords = L.latLng(lat, lng);

    if (count !== undefined) {

        var clusterIcon = L.divIcon({
            className: 'marker-icon',
            html: '<span><b>' + WBLib.utils.humanize.humanize(count) + '</b></span>',
            iconAnchor: [24, 59],
            iconSize: [48, 59]

        });

        return initMapMarker({
            draggable: false,
            icon: clusterIcon,
            geometry: coords,
            riseOnHover: true,
            onClick: function onClick(e) {
                // TODO: hacky, but seems to work, on click zoom to the center point
                this._map.fitBounds(L.latLngBounds([this.getLatLng()]), {
                    maxZoom: this._map.getZoom() + 1
                });
            }
        });
    }

    var popupContent = '<a target="_blank" href="/feature-by-uuid/' + feature_uuid + '">\n    ' + name + '</a><br/>\n        UID: ' + unique_id + '</a><br/>\n        W: ' + woreda + '<br/>\n        T: ' + tabiya + '<br/>\n        K: ' + kushet + '<br/>\n        YLD: ' + markerData.yield + '<br/>\n        SWL: ' + static_water_level;

    return initMapMarker({
        draggable: false,
        geometry: coords,
        markerClass: _.get(markerData, options.iconIdentifierKey, '').toLowerCase(),
        popupContent: popupContent
    });
}

/***/ }),

/***/ "./src/components/pagination/PaginationState.js":
/*!******************************************************!*\
  !*** ./src/components/pagination/PaginationState.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = PaginationState;
function PaginationState(_ref) {
    var itemsCnt = _ref.itemsCnt,
        chartKey = _ref.chartKey,
        parentId = _ref.parentId,
        _ref$itemsPerPage = _ref.itemsPerPage,
        itemsPerPage = _ref$itemsPerPage === undefined ? 10 : _ref$itemsPerPage;


    return {
        // current page
        currentPage: 1,
        // items per page
        itemsPerPage: itemsPerPage,
        // pagination items count - data length
        itemsCnt: itemsCnt,
        // pagination pages count
        pageCnt: Math.ceil(itemsCnt / itemsPerPage),
        // Get next page number, can be null or negative
        next: function next() {
            return this.currentPage + 1;
        },
        // Get previous page number, can be null or negative
        previous: function previous() {
            return this.currentPage - 1;
        },
        // Calculate first pagination data index
        firstIndex: function firstIndex() {
            return this.currentPage * this.itemsPerPage - this.itemsPerPage;
        },
        // Calculate last pagination data index
        lastIndex: function lastIndex() {
            return this.currentPage * this.itemsPerPage;
        },
        // get current state for current page
        getPage: function getPage() {
            return {
                firstIndex: this.firstIndex(),
                lastIndex: this.lastIndex(),
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage,
                pageCnt: this.pageCnt
            };
        },
        setPage: function setPage(newPage) {
            if (1 <= newPage && newPage <= this.pageCnt) {
                this.currentPage = newPage;
                return true;
            }
            return false;
        },
        // calculate page count based on items per page and data length
        calcPageCount: function calcPageCount() {
            this.pageCnt = Math.ceil(this.itemsCnt / this.itemsPerPage);
        },
        // set pagination options - data length, current pagen
        setOptions: function setOptions(_ref2) {
            var itemsCnt = _ref2.itemsCnt,
                currentPage = _ref2.currentPage;


            if (itemsCnt !== undefined) {

                this.itemsCnt = itemsCnt;
                this.currentPage = currentPage;

                this.calcPageCount();

                return true;
            }
            return false;
        }
    };
}
module.exports = exports["default"];

/***/ }),

/***/ "./src/components/pagination/index.js":
/*!********************************************!*\
  !*** ./src/components/pagination/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pagination = __webpack_require__(/*! ./pagination */ "./src/components/pagination/pagination.js");

var _pagination2 = _interopRequireDefault(_pagination);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _pagination2.default;
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/pagination/pagination.js":
/*!*************************************************!*\
  !*** ./src/components/pagination/pagination.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = pagination;

var _PaginationState = __webpack_require__(/*! ./PaginationState */ "./src/components/pagination/PaginationState.js");

var _PaginationState2 = _interopRequireDefault(_PaginationState);

var _utils = __webpack_require__(/*! ./utils */ "./src/components/pagination/utils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Data Pagination Handler
 * Handles indexes, counts and pagination block render
 * @param itemsCnt
 * @param chartKey
 * @param parentId
 * @param itemsPerPage
 * @param callback
 * @returns {{
 *    nextPage: (function(): *),
 *    previousPage: (function(): *),
 *    getPage: (
 *        function(): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})
 *    ),
 *    setOptions: (
 *        function(*=): (*|{firstIndex, lastIndex, currentPage, itemsPerPage, pageCnt})
 *    ),
 *    renderDom: renderDom}
 * }
 */
function pagination(_ref) {
    var itemsCnt = _ref.itemsCnt,
        chartKey = _ref.chartKey,
        parentId = _ref.parentId,
        _ref$itemsPerPage = _ref.itemsPerPage,
        itemsPerPage = _ref$itemsPerPage === undefined ? 10 : _ref$itemsPerPage,
        callback = _ref.callback;


    // parent dom object, pagination dom block will be appended to parent
    var _parent = void 0;

    // init state handler
    var state = (0, _PaginationState2.default)({ itemsCnt: itemsCnt, chartKey: chartKey, parentId: parentId, itemsPerPage: itemsPerPage });

    // Set current page, returns current page if new page outside bounds
    var _setPage = function _setPage(newPage) {
        return state.setPage(newPage) ? state.getPage() : _samePage();
    };

    // Add samePage: true to getPage result
    var _samePage = function _samePage() {
        return Object.assign({}, state.getPage(), { samePage: true });
    };

    // Check if next page exists
    var _nextPageExist = function _nextPageExist() {
        return state.next() <= state.pageCnt && state.next() >= 1;
    };

    // Check if previous page exists
    var _previousPageExist = function _previousPageExist() {
        return 1 <= state.previous() && state.previous() <= state.currentPage && state.previous() <= state.pageCnt;
    };

    // Go to next page
    var _nextPage = function _nextPage() {
        return _nextPageExist() ? _setPage(state.next()) : _samePage();
    };

    // Go to previous page
    var _previousPage = function _previousPage() {
        return _previousPageExist() ? _setPage(state.previous()) : _samePage();
    };

    // DOM

    // update current page number in pagination buttons block
    var _updatePageNumber = function _updatePageNumber() {
        return _parent.querySelector('.page-nmbr').innerHTML = state.currentPage + '/' + state.pageCnt;
    };

    function renderDom() {

        // create pagination buttons block

        var _paginationBlock = (0, _utils._paginationBlockRenderFn)();

        // Add pagination buttons to dom

        _parent = document.getElementById(parentId);
        _parent.appendChild(_paginationBlock);
        _updatePageNumber();
        // Add button click events

        var buttons = _paginationBlock.querySelectorAll('[data-pagination-button]');
        var buttonsCnt = (buttons || []).length;

        if (!(callback instanceof Function) || buttonsCnt < 1) {
            return;
        }

        var page = void 0,
            i = 0;

        // Add next / previous pagination button events

        for (i; i < buttonsCnt; i += 1) {
            buttons[i].addEventListener('click', function () {
                page = this.dataset.paginationButton === 'next' ? _nextPage() : _previousPage();

                if (page.samePage === true) {
                    return;
                }
                _updatePageNumber();

                callback.apply(null, [chartKey, page]);
            });
        }
    }

    return {
        nextPage: _nextPage,
        previousPage: _previousPage,
        getPage: function getPage() {
            return state.getPage();
        },
        setOptions: function setOptions(options) {
            state.setOptions(options);

            _updatePageNumber();

            return state.getPage();
        },
        renderDom: renderDom
    };
}
module.exports = exports['default'];

/***/ }),

/***/ "./src/components/pagination/utils.js":
/*!********************************************!*\
  !*** ./src/components/pagination/utils.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Pagination html render function
 * Renders previous and next buttons, adds page info
 * @returns {HTMLDivElement}
 * @private
 */
var _paginationBlockRenderFn = exports._paginationBlockRenderFn = function _paginationBlockRenderFn() {
    var _paginationBlock = document.createElement('div');

    _paginationBlock.setAttribute('class', 'wb-pagination-block');

    _paginationBlock.innerHTML = '<div>\n        <button data-pagination-button="previous" class="btn btn-chart-pag btn-xs">\n            <i class="fa fa-chevron-left" aria-hidden="true"></i>\n        </button>\n        <button data-pagination-button="next" class="btn btn-chart-pag btn-xs">\n            <i class="fa fa-chevron-right" aria-hidden="true"></i>\n        </button>\n        <div class="page-nmbr"></div>\n    </div>';

    return _paginationBlock;
};

/***/ }),

/***/ "./src/components/selectize/index.js":
/*!*******************************************!*\
  !*** ./src/components/selectize/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _api = __webpack_require__(/*! ../../api */ "./src/api.js");

var api = _interopRequireWildcard(_api);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// using jQuery - $ from globals - window document scope

// selectize options render function
var _optionRenderFunction = function _optionRenderFunction(_ref) {
    var option = _ref.option;
    return '<div><span class="place">' + option + '</span></div>';
};

// create attribute options fetch function for user select input change
var _createOptionLoadFn = function _createOptionLoadFn(name) {
    return function (query, callback) {
        return !query ? callback() : api.axFilterAttributeOption(query, name, callback);
    };
};

/**
 * Initialize selectize on formField
 * Attach filter attribute options callback on user input
 * Renders options in field (from callback)
 * @param formField
 */
function selectizeFormDropDown(formField) {

    var name = formField.name;

    if (!name) {
        console.log('No Name found on input feald');
        return;
    }

    var _optionLoad = _createOptionLoadFn(name);

    formField.disabled = false;

    return $(formField).selectize({
        placeholder: 'Begin typing to search',
        plugins: ["clear_button"],
        multiSelect: false,
        valueField: 'option',
        labelField: 'option',
        searchField: ['option'],
        maxItems: 1,
        create: false,
        render: {
            option: _optionRenderFunction
        },
        load: _optionLoad,
        onChange: function onChange(id) {
            return !id === true;
        }
    });
}

/**
 * Selectize all parent child fields identified by selector
 *
 * @param parent
 * @param selector
 */
var selectizeWbFormDropDowns = function selectizeWbFormDropDowns(parent) {
    var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '[wb-selectize="field-for-selectize"]';
    return _.forEach(parent.querySelectorAll(selector), function (field) {
        return selectizeFormDropDown(field);
    });
};

/**
 * Toggle parents child selectized fields enabled / disabled state
 * @param parent
 * @param enableField
 * @param fieldSelector
 */
function toggleSelectizeEnabled(parent, enableField) {
    var fieldSelector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '[wb-selectize="field-for-selectize"]';


    var selectized = void 0;

    // selectize js method to be called
    var methodName = enableField === true ? 'enable' : 'disable';

    _.forEach(parent.querySelectorAll(fieldSelector), function (field) {
        selectized = $(field)[0].selectize;

        if (selectized && selectized[methodName] instanceof Function) {
            selectized[methodName]();
        }
    });
}

exports.default = {
    selectizeFormDropDown: selectizeFormDropDown,
    selectizeWbFormDropDowns: selectizeWbFormDropDowns,
    toggleSelectizeEnabled: toggleSelectizeEnabled
};
module.exports = exports['default'];

/***/ }),

/***/ "./src/dashboard.filter.js":
/*!*********************************!*\
  !*** ./src/dashboard.filter.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple filter handler
 *
 * - filter - set of unique values identified by filter key
 * - filterKeys - array of field keys representing table column names,  ["tabiya", "woreda"]
 *
 * Example:
 *   var f = new WBLib.DashBoardFilter({filterKeys: ["tabiya", "woreda"]});
 *   f.addToFilter('tabyija', 'sample_value');
 *   f.getActiveFilters();
 *   f.resetFilter('tabyija');
 *   f.resetFilters();
 *
 * @param options
 */
var DashboardFilter = function DashboardFilter(filterKeys) {
    var _this = this;

    _classCallCheck(this, DashboardFilter);

    this.getActiveFilters = function () {

        //Object.keys(this.filters).forEach();
        return _this.filterKeys.reduce(function (acc, val) {
            var filter = _this.filters[val.filterKey];

            if (filter && filter.state.size > 0) {
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    dataKey: val.dataKey,
                    filterKey: val.filterKey
                };
            }
            return acc;
        }, {});
    };

    this.getEmptyFilters = function () {

        return _this.filterKeys.reduce(function (acc, val) {
            var filter = _this.filters[val.filterKey];

            if (filter && filter.state.size === 0) {
                acc[val.filterKey] = {
                    state: Array.from(filter.state),
                    dataKey: val.dataKey,
                    filterKey: val.filterKey
                };
            }
            return acc;
        }, {});
    };

    this.addToFilter = function (filterName, filterValue) {
        return _this.filters[filterName] && _this.filters[filterName].state.add(filterValue);
    };

    this.removeFromFilter = function (filterName, filterValue) {
        return _this.filters[filterName] && _this.filters[filterName].state.delete(filterValue);
    };

    this.resetFilter = function (filterName) {
        return _this.filters[filterName] && _this.filters[filterName].state.clear();
    };

    this.resetFilters = function () {
        Object.keys(_this.filters).forEach(function (filterName) {
            return _this.resetFilter(filterName);
        });
    };

    this.filterKeys = filterKeys;
    // filter i data key
    this.filters = this.filterKeys.reduce(function (acc, val) {
        acc[val.filterKey] = {
            state: new Set([]),
            dataKey: val.dataKey,
            filterKey: val.filterKey
        };
        return acc;
    }, {});
};

exports.default = DashboardFilter;
module.exports = exports["default"];

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectizeUtils = exports.Pagination = exports.BeneficiariesChart = exports.WbMap = exports.api = exports.utils = exports.templates = exports.DashboardFilter = exports.form = exports.WbDataTable = undefined;

var _dashboardFilter = __webpack_require__(/*! ./dashboard.filter.js */ "./src/dashboard.filter.js");

var _dashboardFilter2 = _interopRequireDefault(_dashboardFilter);

var _wb = __webpack_require__(/*! ./wb.templates */ "./src/wb.templates.js");

var _wb2 = _interopRequireDefault(_wb);

var _utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var _utils2 = _interopRequireDefault(_utils);

var _map = __webpack_require__(/*! ./components/map */ "./src/components/map/index.js");

var WbMap = _interopRequireWildcard(_map);

var _beneficiaries = __webpack_require__(/*! ./components/Charts/beneficiaries */ "./src/components/Charts/beneficiaries.js");

var _beneficiaries2 = _interopRequireDefault(_beneficiaries);

var _api = __webpack_require__(/*! ./api */ "./src/api.js");

var _api2 = _interopRequireDefault(_api);

var _pagination = __webpack_require__(/*! ./components/pagination */ "./src/components/pagination/index.js");

var _pagination2 = _interopRequireDefault(_pagination);

var _selectize = __webpack_require__(/*! ./components/selectize */ "./src/components/selectize/index.js");

var _selectize2 = _interopRequireDefault(_selectize);

var _form = __webpack_require__(/*! ./components/form */ "./src/components/form/index.js");

var _form2 = _interopRequireDefault(_form);

var _datatable = __webpack_require__(/*! ./components/datatable */ "./src/components/datatable/index.js");

var _datatable2 = _interopRequireDefault(_datatable);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {
//     createDashBoardMarker,
//     createFeatureByUUidMarker
// } from "./components/map/mapUtils";
// import wbMap from "./components/map/WbMap";
// export {base, barChartHorizontal, DashBoardFilter};
// import base from './base.js';
// import {barChartHorizontal} from './chart.horizontalbar.js';
exports.WbDataTable = _datatable2.default;
exports.form = _form2.default;
exports.DashboardFilter = _dashboardFilter2.default;
exports.templates = _wb2.default;
exports.utils = _utils2.default;
exports.api = _api2.default;
exports.WbMap = WbMap;
exports.BeneficiariesChart = _beneficiaries2.default;
exports.Pagination = _pagination2.default;
exports.selectizeUtils = _selectize2.default;
// {wbMap, createDashBoardMarker, createFeatureByUUidMarker}

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
// using lodash - _ form global / document scope

function _getCookieByName(name) {
    var cook = document.cookie;

    if (!cook) {
        // throw new Error('No cookies found');
        return false;
    }

    var cookies = cook.split(';');
    var cookiesCnt = cookies.length;
    var i = 0;
    var cookie = void 0;
    var nameLength = name.length + 1;

    for (i; i < cookiesCnt; i += 1) {

        cookie = _.trim(cookies[i]);

        // TODO refactore logic
        if (cookie.substring(0, nameLength) === name + '=') {
            // cookie starts with
            return decodeURIComponent(cookie.substring(nameLength));
        }
    }
}

/**
 * Remove blacklisted property values from object
 * Defaults to null, undefined and empty string
 *
 * @param flatObj
 * @param blacklist
 * @returns {*} new object
 * @private
 */
var _removeBlacklistedPropsFromObject = function _removeBlacklistedPropsFromObject(_ref) {
    var flatObj = _ref.flatObj,
        _ref$blacklist = _ref.blacklist,
        blacklist = _ref$blacklist === undefined ? [undefined, '', null] : _ref$blacklist;
    return _.reduce(flatObj, function (acc, val, key) {
        if (blacklist.indexOf(val) === -1) {
            acc[key] = val;
        }
        return acc;
    }, {});
};

// https://github.com/mischat/js-humanize
var _humanize = {
    humanize: function humanize(value) {
        var mag = this.magnitude(value);

        if (mag <= 3) return value;

        if (mag > 3 && mag <= 6) {
            return value.toString().substr(0, mag - 3) + "K";
        }

        if (mag > 6 && mag <= 9) {
            return value.toString().substr(0, mag - 6) + "M";
        }

        if (mag > 9 && mag <= 12) {
            return value.toString().substr(0, mag - 9) + "B";
        }

        if (mag > 12 && mag <= 15) {
            return value.toString().substr(0, mag - 12) + "T";
        }

        return value;
    },

    magnitude: function magnitude(value) {
        var mag = 0;

        while (value > 1) {
            mag++;
            value = value / 10;
        }

        return mag;
    }
};

var initAccordion = function initAccordion(_ref2) {
    var selector = _ref2.selector,
        opts = _ref2.opts;

    var accordion = $(selector);
    accordion.accordion(opts);

    return accordion;
};

/**
 * Table row click callback used on dashboards and table reports page
 *
 * Opens feature by uuid page based on clicked row UUID
 */
function tableRowClickHandlerFn(_ref3) {
    var feature_uuid = _ref3.feature_uuid;

    if (!feature_uuid) {
        throw new Error('No Row UUID found');
    }

    var win = window.open('/feature-by-uuid/' + feature_uuid, '_blank');

    win.focus();
}

/**
 * Data table timestamp column render function
 * @returns {*|string}
 */
var timestampColumnRenderer = function timestampColumnRenderer(data, type, row, meta) {
    return moment(data, DEFAULT_TIMESTAMP_IN_FORMAT).format(DEFAULT_TIMESTAMP_OUT_FORMAT);
};

var utils = {
    removeBlacklistedPropsFromObject: _removeBlacklistedPropsFromObject,
    getCookieByName: _getCookieByName,
    humanize: _humanize,
    initAccordion: initAccordion,
    tableRowClickHandlerFn: tableRowClickHandlerFn,
    timestampColumnRenderer: timestampColumnRenderer
};

exports.default = utils;
module.exports = exports['default'];

/***/ }),

/***/ "./src/wb.templates.js":
/*!*****************************!*\
  !*** ./src/wb.templates.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var getFormTemplate = function getFormTemplate(data) {
    var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return '<div class="panel panel-primary">\n      <div class="panel-heading panel-heading-without-padding">\n        <h4> ' + title + '\n          <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n            <span aria-hidden="true">&times;</span>\n          </button>\n      </h4>\n    </div>\n    <div class="panel-body" >\n      ' + data + '\n    </div>\n  </div>\n';
};

var getOverlayTemplate = function getOverlayTemplate() {
    return '\n<div id="wb-overlay" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">\n    <div class="wb-overlay-spinner">\n        <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>\n        <span class="sr-only">Loading...</span>\n    </div>\n</div>';
};

// CHART TOOLTIP RENDER FUNCTIONS

var tooltips = {
    tabiya: function tabiya(d) {
        return '<div class="tooltip-content">\n            <span>Count: ' + d.cnt + '</span>\n            <span>Beneficiaries:  ' + d.beneficiaries + '</span>\n        </div>';
    },
    fencing: function fencing(d) {
        return '<div class="tooltip-content">\n            <span>Count: ' + d.cnt + '</span>\n        </div>';
    },
    fundedBy: function fundedBy(d) {
        return '<div class="tooltip-content">\n            <span>Count: ' + d.cnt + '</span>\n        </div>';
    },
    waterCommitee: function waterCommitee(d) {
        return '<div class="tooltip-content">\n            <span>Count: ' + d.cnt + '</span>\n        </div>';
    },
    rangeChart: function rangeChart(d) {
        return '<div class="tooltip-content">\n            <span>Count: ' + d.cnt + ' </span>\n            <span>Min: ' + d.min + ' </span>\n            <span>Max: ' + d.max + ' </span>\n        </div>';
    }
};

exports.default = {
    tooltips: tooltips,
    getFormTemplate: getFormTemplate,
    getOverlayTemplate: getOverlayTemplate
};
module.exports = exports['default'];

/***/ })

/******/ });
});
//# sourceMappingURL=WBLib.js.map