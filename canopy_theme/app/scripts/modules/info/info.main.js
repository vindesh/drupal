'use strict';

var $ = require('jquery');
module.exports = class info{
  constructor($el) {
    this.$el = $el;
    var that = this;

    var data = {}, key;
    var options = this.$el[0].getAttribute('data-info');
    if (options[0] === '{') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        console.warn(`Invalid JSON.`);
        options = {};
      }
    }
    for (key in options || {}) {
      if (options[key] !== '') {
        data[key] = options[key];
      }
    }
    return data;
  }
};