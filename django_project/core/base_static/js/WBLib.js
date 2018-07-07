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
var DashboardFilter = function DashboardFilter(_ref) {
    var _this = this;

    var filterKeys = _ref.filterKeys;

    _classCallCheck(this, DashboardFilter);

    this.getActiveFilters = function () {
        return _this.filterKeys.reduce(function (acc, val) {
            if (_this.filters[val].size > 0) {
                acc[val] = Array.from(_this.filters[val]);
            }
            return acc;
        }, {});
    };

    this.addToFilter = function (filterName, filterValue) {
        return _this.filters[filterName] && _this.filters[filterName].add(filterValue);
    };

    this.removeFromFilter = function (filterName, filterValue) {
        return _this.filters[filterName] && _this.filters[filterName].delete(filterValue);
    };

    this.resetFilter = function (filterName) {
        return _this.filters[filterName] && _this.filters[filterName].clear();
    };

    this.resetFilters = function () {
        Object.keys(_this.filters).forEach(function (filterName) {
            return _this.resetFilter(filterName);
        });
    };

    this.filterKeys = filterKeys;

    this.filters = this.filterKeys.reduce(function (acc, val) {
        acc[val] = new Set([]);
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
exports.tooltips = exports.DashboardFilter = undefined;

var _dashboardFilter = __webpack_require__(/*! ./dashboard.filter.js */ "./src/dashboard.filter.js");

var _dashboardFilter2 = _interopRequireDefault(_dashboardFilter);

var _wb = __webpack_require__(/*! ./wb.templates */ "./src/wb.templates.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// export {base, barChartHorizontal, DashBoardFilter};
// import base from './base.js';
// import {barChartHorizontal} from './chart.horizontalbar.js';
exports.DashboardFilter = _dashboardFilter2.default;
exports.tooltips = _wb.tooltips;

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


// CHART TOOLTIP RENDER FUNCTIONS

var tooltips = {
    tabiya: function tabiya(d) {
        return "<div class=\"tooltip-content\">\n            <span>Count: " + d.cnt + "</span>\n            <span>Beneficiaries:  " + d.beneficiaries + "</span>\n        </div>";
    },
    fencing: function fencing(d) {
        return "<div class=\"tooltip-content\">\n            <span>Count: " + d.cnt + "</span>\n        </div>";
    },
    fundedBy: function fundedBy(d) {
        return "<div class=\"tooltip-content\">\n            <span>Count: " + d.cnt + "</span>\n        </div>";
    },
    waterCommitee: function waterCommitee(d) {
        return "<div class=\"tooltip-content\">\n            <span>Count: " + d.cnt + "</span>\n        </div>";
    },
    rangeChart: function rangeChart(d) {
        return "<div class=\"tooltip-content\">\n            <span>Count: " + d.cnt + " </span>\n            <span>Min: " + d.min + " </span>\n            <span>Max: " + d.max + " </span>\n        </div>";
    }
};
exports.default = { tooltips: tooltips };
module.exports = exports["default"];

/***/ })

/******/ });
});
//# sourceMappingURL=WBLib.js.map