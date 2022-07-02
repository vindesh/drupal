'use strict';
const log = require('loglevel');
const format = require('string-format');
const logFormat_debug = 'helper.js: {0}, {1}::{2}';

format.extend(String.prototype, {});

var dataLayer = window.dataLayer = window.dataLayer || [];


var SendGAEvent = function (whatEventCategory, whatEventAction, whatEventLabel, whatEventValue) {
  dataLayer.push({
    'event': 'GAEvent',
    'eventCategory': whatEventCategory,
    'eventAction': whatEventAction,
    'eventLabel': whatEventLabel,
    'eventValue': whatEventValue
  });
};

var SendGAVirtualPageView = function (whatVirtualPageUrl, whatVirtualPageTitle) {
  dataLayer.push({
    'event': 'GAVirtualPageview',
    'virtualPageUrl': whatVirtualPageUrl,
    'virtualPageTitle': whatVirtualPageTitle
  });
};

var GetQueryStringParameterByName = function (whatParameterName) {
  let match = RegExp('[?&]' + whatParameterName + '=([^&]*)').exec(window.location.search);
  let result = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  return result !== null ? result.trim() : null;
};

var SettingLogLevel = function () {
  var logging = log.noConflict();

  // Get Debug information from querystring
  var debug = GetQueryStringParameterByName("debug");
  if (debug) {
    var debugLvl = parseInt(debug);
    if (isNaN(debugLvl)) {
      debugLvl = 1;
    }
    logging.setLevel(debugLvl, false);
    logging.trace("kronos.site.initialization.js debug query string override = " + debugLvl);
  }
  else {
    logging.disableAll();
  }
  return logging;
};

var UpdateUrlParameter = function (url, key, value) {
  if (!url) {
    url = window.location.href;
  }
  var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
    hash;

  if (re.test(url)) {
    if (typeof value !== 'undefined' && value !== null) {
      return url.replace(re, '$1' + key + "=" + value + '$2$3');
    }
    else {
      hash = url.split('#');
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
        url += '#' + hash[1];
      }
      return url;
    }
  }
  else {
    if (typeof value !== 'undefined' && value !== null) {
      var separator = url.indexOf('?') !== -1 ? '&' : '?';
      hash = url.split('#');
      url = hash[0] + separator + key + '=' + value;
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
        url += '#' + hash[1];
      }
      return url;
    }
    else {
      return url;
    }
  }
};

/**
 * The functions to get entity data by UUID.
 * @category Events
 * @param {String} uuid the uuid for the entity.
 * @return {Promise} the status of the rest call.
 */
const getEntityDataByUuid = function (uuid) {
  const entityUrl = '/kronos/entity/uuid';
  return new Promise((resolve, reject) => {
    if (typeof (entityUrl) === 'undefined' || entityUrl === '') {
      reject(new Error('entityUrl is empty.'));
      log.debug('getEntityDataByUuid: entityUrl is Empty');
      return;
    }
    if (typeof (uuid) === 'undefined' || uuid === '') {
      reject(new Error('UUID is empty.'));
      log.debug('getEntityDataByUuid: UUID is Empty');
      return;
    }
    const xhr = new XMLHttpRequest();
    let url = entityUrl + '/' + uuid;
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 404) {
        reject(new Error(`“${url}” was not found.`));
        log.debug('getEntityDataByUuid: Failed getting status');
        return;
      }
      if (xhr.status === 403) {
        reject(new Error(`“${url}” is forbidden.`));
        log.debug('getEntityDataByUuid: Failed getting status');
        return;
      }
      try {
        const json = JSON.parse(xhr.responseText);
        resolve(json);
      }
      catch (error) {
        reject(error);
        log.debug('getEntityDataByUuid: Catch Error: There was an error fetching the entity data: ' + error);
      }
    };
    xhr.onerror = function () {
      const status = xhr.status ? ` (${xhr.status})` : '';
      reject(new Error(`There was an error fetching the entity data ${status}.`));
      log.debug('getEntityDataByUuid: OnError: There was an error fetching the entity data');
    };
    xhr.send();
  });
};

/**
 * Returns URL with appended key/value parameters
 * @param uri
 * @param key
 * @param value
 * @returns {string|*}
 */
const updateQueryString = function (uri, key, value) {
  let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  let separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  } else {
    return uri + separator + key + "=" + value;
  }
}

module.exports = {
  SendGAEvent,
  SendGAVirtualPageView,
  SettingLogLevel,
  UpdateUrlParameter,
  GetQueryStringParameterByName,
  getEntityDataByUuid,
  updateQueryString
};
