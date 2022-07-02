'use strict';
var $ = require('jquery');
module.exports = {
  init: function () {
    $('[data-module]').each((i, v) => {
      let name = $(v).data('module');
      if(name){
        var module = this.modules[name]($(v));
      }
    });
  },
  modules: {
    filterToggle: require('./filters/filter-toggle.load'),
    formCallback: require('./forms/callback.load'),
    info: require('./info/info.load'),
    navbar: require('./navbar/navbar.load'),
    linkImage: require('./link-image/link-image.load'),
    //linkImage: require('./test/test.load'),
    newsroomFilters: require('./filters/filter-newsroom.load'),
    SectionToggles: require('./section-toggles/section-toggles.load'),
    videoAnimation: require('./video-animation/video-animation.load'),
  }
};
