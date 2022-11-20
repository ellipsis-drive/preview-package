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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"EllipsisPreview\": () => (/* binding */ EllipsisPreview)\n/* harmony export */ });\nconst API = \"https://api.ellipsis-drive.com/v3/\";\n\nlet apiCall = (path, body, user, cb) => {\n  return;\n};\n\nclass EllipsisPreview {\n  computeRatio = (extent) =>\n    (extent.xMax - extent.xMin) / (extent.yMax - extent.yMin);\n\n  getNewExtent = (goalAspectRatio, extent) => {\n    const currentAspectRatio = computeRatio(extent);\n    if (goalAspectRatio > currentAspectRatio) {\n      const widthToAdd =\n        ((extent.xMax - extent.xMin) * (goalAspectRatio - currentAspectRatio)) /\n        (2 * currentAspectRatio);\n      return {\n        xMin: extent.xMin - widthToAdd,\n        yMin: extent.yMin,\n        xMax: extent.xMax + widthToAdd,\n        yMax: extent.yMax,\n      };\n    } else {\n      const heightToAdd =\n        ((extent.yMax - extent.yMin) * (currentAspectRatio - goalAspectRatio)) /\n        (2 * goalAspectRatio);\n\n      return {\n        xMin: extent.xMin,\n        yMin: extent.yMin - heightToAdd,\n        xMax: extent.xMax,\n        yMax: extent.yMax + heightToAdd,\n      };\n    }\n  };\n\n  getBaseMapPng = ({ extent, height, width }) => {\n    const newExtent = getNewExtent(\n      width / height,\n      getReprojectedExtent(extent)\n    );\n\n    return `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${\n      newExtent.xMin\n    },${newExtent.yMin},${newExtent.xMax},${\n      newExtent.yMax\n    }&SRS=EPSG%3A3857&WIDTH=${width}&HEIGHT=${Number(\n      height / 1\n    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true`;\n  };\n\n  getEllipsisMapPng = ({\n    mapId,\n    extent,\n    timestampId,\n    layerId,\n    width,\n    height,\n    token,\n  }) => {\n    url = `/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${extent}&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;\n    if (token) {\n      url += `&token=${token}`;\n    }\n\n    return url;\n  };\n\n  defaultSettings = {\n    loggedIn: false,\n    div: null,\n    token: null,\n  };\n\n  settings = {};\n\n  constructor(options = {}) {\n    this.settings = { ...this.defaultSettings, ...options };\n\n    if (!(\"div\" in options)) {\n      console.warn(\"EllipsisPreview: no div is provided!\");\n      return;\n    }\n\n    if (\"token\" in options) {\n      this.settings.token = options.token;\n      this.settings.loggedIn = true;\n    } else {\n      // find out if there's a token for us in the url\n      const queryString = window.location.search;\n      const urlParams = new URLSearchParams(queryString);\n      if (urlParams.has(\"token\")) {\n        this.settings.token = urlParams.get(\"token\");\n        this.settings.loggedIn = true;\n      }\n    }\n    this.render();\n  }\n\n  render = () => {\n    this.settings.div.innerHTML = \"<p> test </p>\";\n  };\n}\n\n\n\n\n//# sourceURL=webpack://ellipsis-preview/./src/lib/index.js?");

/***/ }),

/***/ "./src/test/index.js":
/*!***************************!*\
  !*** ./src/test/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib */ \"./src/lib/index.js\");\n\n\nlet cb = (layer) => {\n  console.log(\"Clicked on layer:\");\n  console.log(layer);\n};\n\nlet div = document.getElementById(\"test\");\n\nlet options = {\n  div: div,\n  cb: cb,\n  searchIncludeFolders: true,\n  showVector: true,\n  showRaster: true,\n  allowExpandMaps: true,\n};\n\nlet myDrive = new _lib__WEBPACK_IMPORTED_MODULE_0__.EllipsisPreview(options);\n\n\n//# sourceURL=webpack://ellipsis-preview/./src/test/index.js?");

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