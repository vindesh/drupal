'use strict';

const $ = require('jquery');
const UIkit = require('uikit');
const enquire = require('enquire.js');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'nvabar: Function Name: {0}, {1}::{2}';
const format = require('string-format');

module.exports = class mobileNavBar {
  constructor($el) {
    log.debug('navbar starts');
    this.$el = $el;
    let that = this;
    // get accordion target
    let $toggle = $('.ukg-navbar-mobile .uk-navbar-toggle');
    let widthTarget = $toggle.data('widthTarget') ? $toggle.data('widthTarget') : 959;
    enquire.register('screen and (min-width:' + widthTarget + 'px)', {
      match: () => {
        log.debug('switching from small to medium, reset the navbar');
        if ($('#ukg-nav-mobile').attr('aria-hidden') === 'false') {
          that.ResetNavBar();
        }
        log.debug('switching from small to medium, reset the search-form');
        if ($('#ukg-searchform').attr('aria-hidden') === 'false') {
          that.ResetSearchForm();
        }
        // also need to move language container from outside of header container to header-right
      }
    });
    UIkit.util.on('#ukg-nav-mobile', 'show', function () {
      // do something
      log.debug('mobile nav toggled on');
      $toggle.removeClass('icon-hamburger').addClass('icon-close');
    });
    UIkit.util.on('#ukg-nav-mobile', 'hide', function () {
      // do something
      log.debug('mobile nav toggled off');
      $toggle.removeClass('icon-close').addClass('icon-hamburger');
    });
  }

  ResetNavBar() {
    // Why do we need to reset the navbar,
    // when the navitems are opened while window is resized to a different
    // style
    // We need to resize the menu bar so it does not showing duplicated menu
    // items This includes the following scenarios: A. When transit from mobile
    // nav to large tablet nav: 1. Toggle the submenus OFF 2. Hide the mobile
    // menu 3. Display the desktop menu B. When large tablet nav transit to
    // mobile nav Do nothing.
    let that = this;

    UIkit.toggle('.ukg-navbar-mobile .uk-navbar-toggle').toggle()
  }
  ResetSearchForm() {
    UIkit.toggle('.uk-navbar-toggle.icon-magnifying').toggle()
  }
};
