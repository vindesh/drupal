(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[3],{

/***/ "./app/scripts/modules/info/info.main.js":
/*!***********************************************!*\
  !*** ./app/scripts/modules/info/info.main.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar $ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n\nmodule.exports = function info($el) {\n  _classCallCheck(this, info);\n\n  this.$el = $el;\n  var that = this;\n  var data = {},\n      key;\n  var options = this.$el[0].getAttribute('data-info');\n\n  if (options[0] === '{') {\n    try {\n      options = JSON.parse(options);\n    } catch (e) {\n      console.warn(\"Invalid JSON.\");\n      options = {};\n    }\n  }\n\n  for (key in options || {}) {\n    if (options[key] !== '') {\n      data[key] = options[key];\n    }\n  }\n\n  return data;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvc2NyaXB0cy9tb2R1bGVzL2luZm8vaW5mby5tYWluLmpzPzI2ZTUiXSwibmFtZXMiOlsiJCIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiJGVsIiwidGhhdCIsImRhdGEiLCJrZXkiLCJvcHRpb25zIiwiZ2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwiZSIsImNvbnNvbGUiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiQUFBYTs7OztBQUViLElBQUlBLENBQUMsR0FBR0MsbUJBQU8sQ0FBQyxvREFBRCxDQUFmOztBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FDRSxjQUFZQyxHQUFaLEVBQWlCO0FBQUE7O0FBQ2YsT0FBS0EsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsTUFBSUMsSUFBSSxHQUFHLElBQVg7QUFFQSxNQUFJQyxJQUFJLEdBQUcsRUFBWDtBQUFBLE1BQWVDLEdBQWY7QUFDQSxNQUFJQyxPQUFPLEdBQUcsS0FBS0osR0FBTCxDQUFTLENBQVQsRUFBWUssWUFBWixDQUF5QixXQUF6QixDQUFkOztBQUNBLE1BQUlELE9BQU8sQ0FBQyxDQUFELENBQVAsS0FBZSxHQUFuQixFQUF3QjtBQUN0QixRQUFJO0FBQ0ZBLGFBQU8sR0FBR0UsSUFBSSxDQUFDQyxLQUFMLENBQVdILE9BQVgsQ0FBVjtBQUNELEtBRkQsQ0FFRSxPQUFPSSxDQUFQLEVBQVU7QUFDVkMsYUFBTyxDQUFDQyxJQUFSO0FBQ0FOLGFBQU8sR0FBRyxFQUFWO0FBQ0Q7QUFDRjs7QUFDRCxPQUFLRCxHQUFMLElBQVlDLE9BQU8sSUFBSSxFQUF2QixFQUEyQjtBQUN6QixRQUFJQSxPQUFPLENBQUNELEdBQUQsQ0FBUCxLQUFpQixFQUFyQixFQUF5QjtBQUN2QkQsVUFBSSxDQUFDQyxHQUFELENBQUosR0FBWUMsT0FBTyxDQUFDRCxHQUFELENBQW5CO0FBQ0Q7QUFDRjs7QUFDRCxTQUFPRCxJQUFQO0FBQ0QsQ0FyQkgiLCJmaWxlIjoiLi9hcHAvc2NyaXB0cy9tb2R1bGVzL2luZm8vaW5mby5tYWluLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBpbmZve1xuICBjb25zdHJ1Y3RvcigkZWwpIHtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgZGF0YSA9IHt9LCBrZXk7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLiRlbFswXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5mbycpO1xuICAgIGlmIChvcHRpb25zWzBdID09PSAneycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMgPSBKU09OLnBhcnNlKG9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgSlNPTi5gKTtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGtleSBpbiBvcHRpb25zIHx8IHt9KSB7XG4gICAgICBpZiAob3B0aW9uc1trZXldICE9PSAnJykge1xuICAgICAgICBkYXRhW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG59OyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./app/scripts/modules/info/info.main.js\n");

/***/ })

}]);