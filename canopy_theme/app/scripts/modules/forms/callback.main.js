'use strict';
/**
 * The module is created to handle form post back client side actions
 * Author: Aaron Ding
 * Date:   Nov-04-2020
 *
 * Scenarios:
 * When user visits/redirects to a thank you page (with this module enabled)
 *    The form object should be hidden
 *    The thank you section should be visible
 *
 *
 */
const $ = require('jquery');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'FormCallBack: Function Name: {0}, {1}::{2}';
const UIkit = require('uikit');
const format = require('string-format');

module.exports = class FormCallBack {
  constructor($el) {
    log.debug('FormCallBack starts');
    this.$el = $el;
    let that = this;
    $(document).ready(() => {
      // first we need to toggle the thank you page
      that.processFormActions();
    });
    let $scrollEl = $('.ukg-content-body .uk-button[uk-scroll]');
    if ($scrollEl.length > 0){
      log.debug(logFormat_debug.format('scroll element exist', 'registering the autofocus event'));
      UIkit.util.on($scrollEl, 'scrolled', () => {
        that.postScrollActions();
      });
    }
  }

  processFormActions() {
    let that = this;
    let actions = that.getAllFormActions();
    if (actions.length > 0) {
      $.each(actions, (i, v) => {
        that.processAction(v);
      });
    }
  }

  processAction(action) {
    let that = this;
    switch (action) {
      case 'toggleResponseContainer':
        that.toggleThankyouContainer();
        break;
      case 'scrollToSidebar':
        that.scrollToSidebar();
        break;
      case 'toggleBlockContainer':
        break;
      case 'downloadAsset':
        break;
    }
  }

  toggleThankyouContainer() {
    log.debug(logFormat_debug.format('toggleThankyouContainer', 'starts'));
    let that = this;
    let $formResponseContainer = that.$el;
    let $aside = that.$el.closest('aside');
    let $formContainer = $('.ukg-card-form', $aside);
    log.debug(logFormat_debug.format('toggleThankyouContainer', 'hiding form'));
    $formContainer.attr('hidden', '');
    log.debug(logFormat_debug.format('toggleThankyouContainer', 'displaying thank you container'));
    $formResponseContainer.removeAttr('hidden');
  }

  scrollToSidebar() {
    log.debug(logFormat_debug.format('scrollToSidebar', 'starts'));
    let that = this;
    let $aside = that.$el.closest('aside');
    let $scrollEl = $('.ukg-content-body .uk-button[uk-scroll]');
    log.debug(logFormat_debug.format('scrollToSidebar', 'initiating $scrollEl'));
    let $scroll = UIkit.scroll($scrollEl);
    log.debug($scrollEl);
    $scroll.scrollTo($aside);
  }

  postScrollActions() {
    log.debug(logFormat_debug.format('postScrollActions', 'starts'));
    let that = this;
    let $scrollEl = $('.ukg-content-body .uk-button[uk-scroll]');
    let $aside = that.$el.closest('aside');
    let $formContainer = $('.ukg-card-form', $aside);
    log.debug(logFormat_debug.format('check if scroll element exist', $scrollEl.length, $scrollEl.is(":visible")));
    if ($scrollEl.length > 0 && $scrollEl.is(":visible")) {
      // Element is on screen and visible, means after scrolling we need to autofocus the first field.
      // Get the first visible form field.
      let $firstVisibleField = $('.uk-input:visible', $formContainer).first();
      if ($firstVisibleField.length > 0) {
        $firstVisibleField.focus();
        log.debug(logFormat_debug.format('postScrollActions', 'focus on the first visible form element'));
      }
    }
  }

  getAllFormActions() {
    let that = this;
    // Provide plugins for all the scenarios of different form actions
    // It can be display thank you messages, we look for the rq parameter
    //  and the value can either be 1 (display self content)
    //  or it can be a block id, in turn we will render a block in the thank you page.
    let _formActions = [];
    let _requestCallback = helper.GetQueryStringParameterByName('rq');
    if (_requestCallback) {
      let renderId = parseInt(_requestCallback);
      if (renderId === 1) {
        _formActions.push('toggleResponseContainer');
      } else {
        _formActions.push('toggleBlockContainer');
      }
      // Check if the page has Scroll and it's visible
      let $scrollEl = $('.ukg-content-body .uk-button[uk-scroll]');
      log.debug(logFormat_debug.format('check if scroll element exist', $scrollEl.length, $scrollEl.is(":visible")));
      if ($scrollEl.length > 0 && $scrollEl.is(":visible")) {
        // Element is on screen and visible, means it's for mobile and we need to scroll it down
        _formActions.push('scrollToSidebar');
      }
    }
    // It can be download, which we look for download asset component
    return _formActions;
  }
};
