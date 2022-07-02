'use strict';

const $ = require('jquery');
const helper = require('../info/helper');
const helper_campaign = require('../info/helper-campaign');
const helper_cookie = require('../info/helper-cookie');
const helper_location = require('../info/helper-location');
const log = helper.SettingLogLevel();
const logFormat_debug = 'tracking.main.js: {0}, {1}::{2}';
const format = require('string-format');
const COOKIE_NAME = 'U20K20G';
const COOKIE_EXPIRES = 30;
const COOKIE_PATH = '/';
const COOKIE_SAME_SITE = 'Lax';
const DEFAULT_SITE_ECID = helper_campaign.getEcid();
const DEFAULT_SITE_EQID = helper_campaign.getEqid();
const DEFAULT_SITE_NSECID = helper_campaign.getNaturalSearchEcid();
const DEFAULT_SITE_NSEQID = helper_campaign.getNaturalSearchEqid();
const COOKIE_SECURE = helper_cookie.useSecureCookie();
const COOKIE_DOMAIN = helper_cookie.getCookieDomain();
const COOKIE_EXISTS = helper_cookie.cookieExists(COOKIE_NAME);
const NATURAL_SEARCH_REFERRAL = helper_location.isNaturalSearchReferral();
const QUERY_STRING_ECID = helper.GetQueryStringParameterByName('ecid');
const QUERY_STRING_EQID = helper.GetQueryStringParameterByName('eqid');
const DEFAULT_COOKIE = {ecid: '', eqid: ''};
const COOKIE_OPTIONS = {expires: COOKIE_EXPIRES, path: COOKIE_PATH, secure: COOKIE_SECURE, sameSite: COOKIE_SAME_SITE, domain: COOKIE_DOMAIN};

format.extend(String.prototype, {});

let ukg_cookie = helper_cookie.getCookie(COOKIE_NAME);


/**
 *
 */
const init = function () {

  // does the cookie already exist?
  if (!COOKIE_EXISTS) { // cookie doesn't exist
    ukg_cookie = DEFAULT_COOKIE; // create cookie object using empty ecid and eqid values
  } else { // cookie does exist
    ukg_cookie = atob(ukg_cookie); // decode the base64 cookie data
    ukg_cookie = JSON.parse(ukg_cookie); // reconstitute the ukg_cookie object
  }

  // is an ecid query string parameter being passed to the page?
  if (typeof QUERY_STRING_ECID !== 'undefined' && QUERY_STRING_ECID !== null && QUERY_STRING_ECID !== '') { // yes, ecid query string parameter was passed to the page
    ukg_cookie['ecid'] = QUERY_STRING_ECID; // store ecid query string value in the cookie
    $('input[name=ecid]').val(ukg_cookie['ecid']) // populate the hidden ecid input field on the page
  } else { // no ecid query string passed to page, does ecid value exist in cookie?
    if (typeof ukg_cookie['ecid'] !== 'undefined' && ukg_cookie['ecid'] !== null && ukg_cookie['ecid'] !== '') { // ecid value exists in cookie, send it to hidden ecid field
      $('input[name=ecid]').val(ukg_cookie['ecid']) // populate the hidden ecid input field on the page
    } else { // freshly created cookie with no ecid value, set the value now
      ukg_cookie['ecid'] = DEFAULT_SITE_ECID; // default ecid campaign
      $('input[name=ecid]').val(DEFAULT_SITE_ECID) // populate the hidden ecid input field on the page
    }
  }

  // is an eqid query string parameter being passed to the page?
  // NOTE: elqCampaignId === eqid
  if (typeof QUERY_STRING_EQID !== 'undefined' && QUERY_STRING_EQID !== null && QUERY_STRING_EQID !== '') { // yes, eqid query string parameter was passed to the page
    ukg_cookie['eqid'] = QUERY_STRING_EQID; // store eqid query string value in the cookie
    $('input[name=elqCampaignId]').val(ukg_cookie['eqid']) // populate the hidden eqid input field if it exists
  } else { // no eqid query string passed to page, does eqid value exist in cookie?
    if (typeof ukg_cookie['eqid'] !== 'undefined' && ukg_cookie['eqid'] !== null && ukg_cookie['eqid'] !== '') {  // eqid value exists in cookie, send it to hidden ecid field
      $('input[name=elqCampaignId]').val(ukg_cookie['eqid']) // populate the hidden eqid input field if it exists
    } else { // freshly created cookie with no eqid value, set the value now
      ukg_cookie['eqid'] = DEFAULT_SITE_EQID; // default eqid campaign
      $('input[name=elqCampaignId]').val(DEFAULT_SITE_EQID) // populate the hidden eqid input field on the page
    }
  }

  // is the user coming from one of the big three search engines?
  if (NATURAL_SEARCH_REFERRAL) { // a natural search referrer Trumps ecid/eqid query strings being passed to page
    ukg_cookie['ecid'] = DEFAULT_SITE_NSECID;
    $('input[name="ecid"]').val(DEFAULT_SITE_NSECID) // populate the hidden ecid input field if it exists
    ukg_cookie['eqid'] = DEFAULT_SITE_NSEQID;
    $('input[name="eqid"]').val(DEFAULT_SITE_NSEQID) // populate the hidden eqid input field if it exists
  }

  // convert cookie object into string representation
  ukg_cookie = JSON.stringify(ukg_cookie);

  // base64 encode the cookie string and save it to the users browser
  helper_cookie.setCookie(COOKIE_NAME, btoa(ukg_cookie), COOKIE_OPTIONS)

}

module.exports = {
  init
};
