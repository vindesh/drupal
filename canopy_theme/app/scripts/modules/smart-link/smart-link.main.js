'use strict';

const $ = require('jquery');
const helper = require('../info/helper');
const helper_cookie = require('../info/helper-cookie');
const log = helper.SettingLogLevel();
const logFormat_debug = 'smart-link.main.js: {0}:: {1}';
const format = require('string-format');
const COOKIE_NAME = 'U20K20G';

/**
 * During the mouse click event, the ecid and eqid values from the U20K20G
 * cookie are appended onto any href that points to the kronos.com domain
 */
const init = function () {
  log.debug('smart-link.main.js init (start)');
  document.addEventListener('click', (e) => {
    log.debug('smart-link.main.js click (start)');
    try {
      if (typeof e.target !== 'undefined') {
        log.debug(logFormat_debug.format('e.target', e.target));
        let linkElement = getLinkElement(e.target);
        log.debug(logFormat_debug.format('linkElement', linkElement));
        if (linkElement === null) {
          return;
        }
        if(linkElement.href.includes('kronos.com') || linkElement.href.includes('ultimatesoftware.com')) {
          log.debug('linkElement contains kronos.com (process)');
          let ukg_cookie = helper_cookie.getCookie(COOKIE_NAME); // grab the 'U20K20G' cookie from the browser
          ukg_cookie = atob(ukg_cookie); // decode the base64 cookie data
          ukg_cookie = JSON.parse(ukg_cookie); // reconstitute the ukg_cookie object
          let ukg_cookie_ecid = ukg_cookie.ecid; // get ecid value from U20K20G cookie
          let ukg_cookie_eqid = ukg_cookie.eqid; // get eqid value from U20K20G cookie
          log.debug(logFormat_debug.format('ukg_cookie_ecid', ukg_cookie_ecid));
          log.debug(logFormat_debug.format('ukg_cookie_eqid', ukg_cookie_eqid));
          let link_update = linkElement.href;
          log.debug(logFormat_debug.format('link_update (original)', link_update));
          link_update = helper.updateQueryString(link_update, 'ecid', ukg_cookie_ecid); // update href with ecid query string
          link_update = helper.updateQueryString(link_update, 'eqid', ukg_cookie_eqid); // update href with eqid query string
          log.debug(logFormat_debug.format('link_update (processed)', link_update));
          linkElement.href = link_update; // apply link_update value to the targeted href
        } else {
          log.debug('linkElement does not contain kronos.com (bypass)');
        }
      }
    } catch (e) {
      console.log("smart-link(exception): " + e.message);
    }
    log.debug('smart-link.main.js click (complete)');
  });
  log.debug('smart-link.main.js init (complete)');
}

/**
 * Returns the element which contains the anchor tag
 */
const getLinkElement = function (el) {
  if (el.tagName === 'A' && el.href) {
    return el;
  } else if (el.parentElement) {
    return getLinkElement(el.parentElement);
  } else {
    return null;
  }
}

module.exports = {
  init
};
