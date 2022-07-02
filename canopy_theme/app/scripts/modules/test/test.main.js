'use strict';

const $ = require('jquery');
const UIkit = require('uikit');
const enquire = require('enquire.js');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'link-image.main.js: Function Name: {0}, {1}::{2}';
const format = require('string-format');

module.exports = class linkImage {
  constructor($el) {
    log.debug(logFormat_debug.format('Test', 'init: ', ''));
    this.$el = $el;
    let that = this;
    log.debug('link-image JS module..... starts');
    console.log('TEST...******link-image JS module..... starts******');
console.log(that.$el);
    let $cta = that.$el.closest('.coh-component > .uk-card').find('div.uk-card-footer a.uk-button').eq(0);

    console.log($cta.attr('title'));
    console.log($cta);

  }

};
