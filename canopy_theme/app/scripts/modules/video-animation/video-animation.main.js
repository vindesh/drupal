'use strict';

const $ = require('jquery');
const media = document.getElementById('logo-animation');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();

module.exports = class VideoAnimation {
  constructor($el) {
    this.$el = $el;
    let that = this;
    media.addEventListener('ended', () => {
      log.debug('media ended, time to swap');
      that.SwapEndImage(that);
    }, false);
    $(document).ready(function () {
      $('#graphic-banner').fadeIn('fast');
    });
  }

  SwapEndImage(that) {
    // Idea is to toggle the visibility of video element and Image Element
    // The image container: .logo-animation-static-container
    let $staticContainer = that.$el.find('.logo-animation-static-container');
    if ($staticContainer) {
      // get current window size, if it's smaller than 640px
      let windowWidth = $(window).width();
      log.debug('found the logo container, current window size: ' + windowWidth + 'px');
      log.debug('toggle static container on');
      // $('#logo-animation').addClass('fadeOut');
      $('#logo-animation').fadeOut(500, function () {
        log.debug('logo animation fadeout complete, remove uk-hidden class');
        $staticContainer.removeClass('uk-hidden');
        log.debug('add fadeIn class');
        $staticContainer.addClass('fadeIn');
        log.debug('empty the media');
        media.outerHTML = "";
      });
      log.debug('toggle static container on');
      // Time to remove the video object
    }
    else {
      log.debug('cannot find the logo animation static container');
    }
  }
};
