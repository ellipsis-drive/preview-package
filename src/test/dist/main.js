/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/lib/index.js":
/*!**************************!*\
  !*** ./src/lib/index.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"EllipsisPreview\": () => (/* binding */ EllipsisPreview)\n/* harmony export */ });\nconst API = \"https://api.ellipsis-drive.com/v3/\";\r\n\r\nlet apiCall = (path, body, user, cb) => {\r\n  return;\r\n};\r\n\r\nclass EllipsisPreview {\r\n  computeRatio = (extent) =>\r\n    (extent.xMax - extent.xMin) / (extent.yMax - extent.yMin);\r\n\r\n  getNewExtent = (goalAspectRatio, extent) => {\r\n    const currentAspectRatio = computeRatio(extent);\r\n    if (goalAspectRatio > currentAspectRatio) {\r\n      const widthToAdd =\r\n        ((extent.xMax - extent.xMin) * (goalAspectRatio - currentAspectRatio)) /\r\n        (2 * currentAspectRatio);\r\n      return {\r\n        xMin: extent.xMin - widthToAdd,\r\n        yMin: extent.yMin,\r\n        xMax: extent.xMax + widthToAdd,\r\n        yMax: extent.yMax,\r\n      };\r\n    } else {\r\n      const heightToAdd =\r\n        ((extent.yMax - extent.yMin) * (currentAspectRatio - goalAspectRatio)) /\r\n        (2 * goalAspectRatio);\r\n\r\n      return {\r\n        xMin: extent.xMin,\r\n        yMin: extent.yMin - heightToAdd,\r\n        xMax: extent.xMax,\r\n        yMax: extent.yMax + heightToAdd,\r\n      };\r\n    }\r\n  };\r\n\r\n  getBaseMapPng = ({ extent, height, width }) => {\r\n    const newExtent = getNewExtent(\r\n      width / height,\r\n      getReprojectedExtent(extent)\r\n    );\r\n\r\n    return `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${\r\n      newExtent.xMin\r\n    },${newExtent.yMin},${newExtent.xMax},${\r\n      newExtent.yMax\r\n    }&SRS=EPSG%3A3857&WIDTH=${width}&HEIGHT=${Number(\r\n      height / 1\r\n    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true`;\r\n  };\r\n\r\n  getEllipsisMapPng = ({\r\n    mapId,\r\n    extent,\r\n    timestampId,\r\n    layerId,\r\n    width,\r\n    height,\r\n    token,\r\n  }) => {\r\n    url = `/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${extent}&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;\r\n    if (token) {\r\n      url += `&token=${token}`;\r\n    }\r\n\r\n    return url;\r\n  };\r\n\r\n  defaultSettings = {\r\n    div: null,\r\n    token: null,\r\n    pathId: null,\r\n  };\r\n\r\n  settings = {};\r\n\r\n  constructor(options = {}) {\r\n    this.settings = { ...this.defaultSettings, ...options };\r\n\r\n    if (!(\"div\" in options)) {\r\n      console.warn(\"EllipsisPreview: no div is provided!\");\r\n      return;\r\n    }\r\n\r\n    if (\"token\" in options) {\r\n      this.settings.token = options.token;\r\n      this.settings.loggedIn = true;\r\n    } else {\r\n      // find out if there's a token for us in the url\r\n      const queryString = window.location.search;\r\n      const urlParams = new URLSearchParams(queryString);\r\n      if (urlParams.has(\"token\")) {\r\n        this.settings.token = urlParams.get(\"token\");\r\n        this.settings.loggedIn = true;\r\n      }\r\n    }\r\n    this.render();\r\n  }\r\n\r\n  p = (str) => {\r\n    let elem = document.createElement(\"p\");\r\n    elem.innerText = str;\r\n    elem.classList.add(\"ellipsis-preview-p\");\r\n    elem.style.fontFamily = `\"Roboto Condensed\",\"Roboto\",\"Helvetica\",\"Lucida Sans Unicode\",\"sans-serif\"`;\r\n    return elem;\r\n  };\r\n\r\n\r\n  render = () => {\r\n\r\n    let div = document.createElement(\"div\");\r\n    let p = this.p(\"Ellipsis Preview\")\r\n    let pathId = this.p(this.settings.pathId);\r\n\r\n    div.appendChild(p)\r\n    div.appendChild(pathId);\r\n\r\n    this.settings.div.appendChild(div);\r\n  };\r\n}\r\n\r\n\r\n\n\n//# sourceURL=webpack://ellipsis-preview/./src/lib/index.js?");

/***/ }),

/***/ "./src/test/index.js":
/*!***************************!*\
  !*** ./src/test/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ \"./src/lib/index.js\");\n\r\n\r\nlet div = document.getElementById(\"test\");\r\n\r\nlet options = {\r\n  div: div,\r\n  pathId: \"0ec49fb8-f577-45de-8e4f-6243fdc62908\"\r\n};\r\n\r\nlet preview = new _lib__WEBPACK_IMPORTED_MODULE_0__.EllipsisPreview(options);\r\n\n\n//# sourceURL=webpack://ellipsis-preview/./src/test/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/test/index.js");
/******/ 	
/******/ })()
;