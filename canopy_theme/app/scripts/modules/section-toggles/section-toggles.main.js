'use strict';

const $ = require('jquery');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();

module.exports = class SectionToggles {
  constructor($el) {
    this.$el = $el;
    let that = this;
    $(document).ready(function () {
      log.debug('page loaded, fade in element');
      that.$el.fadeIn('fast');
    });
  }
};
