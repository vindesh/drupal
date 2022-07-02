'use strict';

const $ = require('jquery');
const UIkit = require('uikit');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'filterToggle: Function Name: {0}, {1}::{2}';
const format = require('string-format');

module.exports = class filterToggle {
  constructor($el) {
    log.debug(logFormat_debug.format('filterToggle', 'init: ', ''));
    this.$el = $el;
    let that = this;
    // get accordion target
    let $toggle = that.$el;
    let $toggleGroup = that.$el.closest('.ukg-filter-container').find('a[uk-toggle]').not(that.$el);
    let target = that.getToggleTarget($toggle);
    let $current_icon = $('span.ukg-toggle', $toggle);
    if (target) {
      // there's our target
      UIkit.util.on($(target), 'show', function () {
        // do something
        log.debug(logFormat_debug.format('filterToggle show', 'toggle shown: ', 'change chevron from down to up'));
        $current_icon.removeClass('icon-chevron-down').addClass('icon-chevron-up');
        // Remove all other toggles in this group
        if ($toggleGroup.length > 0) {
          // Found my cousins
          $.each($toggleGroup, (i, v) => {
            let _target = that.getToggleTarget($(v));
            if (_target) {
              that.ToggleOff($(v))
            }
          })
        }
      });
      UIkit.util.on($(target), 'hide', function () {
        // do something
        log.debug(logFormat_debug.format('filterToggle show', 'toggle hidden: ', 'change chevron from up to down'));
        $current_icon.removeClass('icon-chevron-up').addClass('icon-chevron-down');
      });
    }
  }

  getToggleTarget($toggle) {
    let target = '';
    let _target_attr = $toggle.attr('uk-toggle');
    if (_target_attr && _target_attr.startsWith("target:")) {
      let _target = _target_attr.split(":").pop().trim();
      if ($(_target).length > 0) {
        target = _target;
      }
    }
    return target;
  }

  ToggleOff($toggle) {
    if ($toggle) {
      let $icon = $('span.ukg-toggle', $toggle);
      if ($icon.hasClass('icon-chevron-up')) {
        // means this toggle is active, need to close
        UIkit.toggle($toggle).toggle();
        $icon.removeClass('icon-chevron-up').addClass('icon-chevron-down');
      }
    }
  }
};
