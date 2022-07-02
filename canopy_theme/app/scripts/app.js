'use strict';

require("babel-polyfill");
require('pictureFill');
var moduleRegistry = require('./modules/');
moduleRegistry.init();
let tracking = require('./modules/tracking/tracking.main');
let smart_button = require('./modules/smart-button/smart-button.main');
let smart_link = require('./modules/smart-link/smart-link.main');
let link_image = require('./modules/link-image/link-image.main');
//let test = require('./modules/test/test.main');
tracking.init();
smart_button.init();
smart_link.init();
//link_image.init();
$(document).ready(function () {
  // Binds the submit handler to the #requestNew form
  let $searchForms = ['#ukg-searchform-desktop', '#ukg-searchform'];
  $.each($searchForms, (i, v) => {
    let $submitBtn = $(v).find("a[type='submit']");
    if ($submitBtn.length) {
      $submitBtn.click(function (e) {
        $(v).submit(); // calls the submit handler
        e.preventDefault();  // Prevents the default behavior of the link
      });
    }
  })
});
if (typeof Drupal !== 'undefined') {
  Drupal.behaviors.searchSubmit = {
    attach: function (context, settings) {
      let $searchForms = ['#ukg-searchform-desktop', '#ukg-searchform'];
      $.each($searchForms, (i, v) => {
        $(v).submit(function (event) {
          const $searchInput = $(v).find('[type=text]');
          console.log($searchInput);
          if ($searchInput.length) {
            let searchtext = $.trim($searchInput.val());
            event.preventDefault();
            if (searchtext !== '') {
              //************** IE does not support window.stop() ************
              if ('execCommand' in document) {
                document.execCommand('Stop');
              } else {
                //************** for other browsers ***********
                window.stop();
              }
              window.location = '/search/node?keys=' + searchtext.toLowerCase();
            }
          }
        });
      });
    }
  };
}
