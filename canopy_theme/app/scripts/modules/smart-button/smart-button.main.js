'use strict';

const $ = require('jquery');
const helper = require('../info/helper');
const helper_cookie = require('../info/helper-cookie');
const helper_location = require('../info/helper-location');
const log = helper.SettingLogLevel();
const logFormat_debug = 'smart-button.main.js: {0}, {1}::{2}';
const format = require('string-format');
const COOKIE_NAME = '__ukgloc';
const COOKIE_PATH = '/';
const COOKIE_SAME_SITE = 'Lax';
const COOKIE_SECURE = helper_cookie.useSecureCookie();
const COOKIE_DOMAIN = helper_cookie.getCookieDomain();
const COOKIE_EXISTS = helper_cookie.cookieExists(COOKIE_NAME);
const COOKIE_OPTIONS = {path: COOKIE_PATH, secure: COOKIE_SECURE, sameSite: COOKIE_SAME_SITE, domain: COOKIE_DOMAIN};
const COUNTRY_CODE_LANGUAGES = {'gb': 'en-gb', 'us': 'en', 'in': 'en-in', 'au': 'en-au', 'ca': 'en-ca'};

require('es6-promise').polyfill(); // https://github.com/stefanpenner/es6-promise
format.extend(String.prototype, {});


/**
 * Sets the href link value which points to the site specific language resource.
 * Order of precedence is as follows:
 * 1. Referrer
 * 2. Cookie
 * 3. Demandbase
 * 4. Geo-Location
 * 5. Navigator.Language
 * 6. English
 */
const init = function () {
  let referrer_language = helper_location.getReferrerLanguage(); // get the LCID (https://www.science.co.il/language/Locale-codes.php) value based upon the document.referrer hostname
  let ukg_cookie_value = helper_cookie.getCookie(COOKIE_NAME);
  let button_language = ukg_cookie_value;
  if (helper_location.englishLanguageKronosReferrer()) { // referrer is associated with a kronos english website (kronos.co.uk, kronos.in, kronos.ca, kronos.com, kronos.com.au)
    if (COOKIE_EXISTS) { // __ukgloc cookie exists
      if (referrer_language !== ukg_cookie_value) { // incoming referral domain language (referrer_language) trumps language value (ukg_cookie_value) stored in __ukgloc cookie
        helper_cookie.setCookie(COOKIE_NAME, referrer_language, COOKIE_OPTIONS) // update __ukgloc cookie with new value
        button_language = referrer_language;
      }
    } else { // __ukgloc cookie does not exist
      helper_cookie.setCookie(COOKIE_NAME, referrer_language, COOKIE_OPTIONS); // create the __ukgloc cookie using the document.referrer hostname language value (referrer_language)
      button_language = referrer_language;
    }
    setButtonLinkBasedOnLanguage(button_language);
  } else { // third party document.referrer OR ukg.com referrer
    if (!COOKIE_EXISTS) { // __ukgloc cookie does not exist
      getCountryCodeSetCookieAndButtonHrefs(); // get country code
    } else { // cookie already exists, grab the value and use it to set the hrefs of any UiKit Button Multi CTA component
      setButtonLinkBasedOnLanguage(ukg_cookie_value);
    }
  }
}

/**
 * Retrieves the country code value from one of the following locations:
 * 1. Demandbase.IP.CompanyProfile.registry_country_code
 * 2. Google Geo-Location
 * 3. navigator.language - en-CA, en-US, en-GB, hi-IN, en-AU
 * 4. english language
 * based on the country code the __ukgloc cookie value is updated with the
 * site language associated with the country code
 * then sets the button href links
 *
 */
const getCountryCodeSetCookieAndButtonHrefs = function () {
  let country_code = helper_location.getNavigatorCountryCode();
  let country_code_language = COUNTRY_CODE_LANGUAGES[country_code]; // get language of the country_code
  helper_location.getDemandbaseCountryCode(100) // Demandbase
    .then((result) => {
      country_code = result;
      country_code_language = COUNTRY_CODE_LANGUAGES[country_code]; // get language of country code
      helper_cookie.setCookie(COOKIE_NAME, country_code_language, COOKIE_OPTIONS); // write out the cookie value
      setButtonLinkBasedOnLanguage(country_code_language); // update the href links to point to the site specific resource
    })
    .catch(function (error) {
      helper_location.getLatitudeAndLongitudeByIP() // Demandbase failed, fallback to using Geo-Location (getLatitudeAndLongitudeByIP)
        .then((result) => {
          let lat = result.data.location.lat;
          let lng = result.data.location.lng;
          helper_location.getCountryCodeByLatitudeAndLongitude(lat, lng) // getLatitudeAndLongitudeByIP was successful, retrieve country code by lat/lng using Geo-Location (getCountryCodeByLatitudeAndLongitude)
            .then((result) => {
              country_code = result;
              country_code_language = COUNTRY_CODE_LANGUAGES[country_code]; // get language of country code
              helper_cookie.setCookie(COOKIE_NAME, country_code_language, COOKIE_OPTIONS); // write out the cookie value
              setButtonLinkBasedOnLanguage(country_code_language); // update the href links to point to the site specific resource
            })
            .catch(function () { // getCountryCodeByLatitudeAndLongitude failed, fallback to using navigator.language for country code and site language
              helper_cookie.setCookie(COOKIE_NAME, country_code_language, COOKIE_OPTIONS); // write out the cookie value
              setButtonLinkBasedOnLanguage(country_code_language); // update the href links to point to the site specific resource
            });
        })
        .catch(function () { // getLatitudeAndLongitudeByIP failed, fallback to using navigator.language for country code and site language
          helper_cookie.setCookie(COOKIE_NAME, country_code_language, COOKIE_OPTIONS); // write out the cookie value
          setButtonLinkBasedOnLanguage(country_code_language); // update the href links to point to the site specific resource
        });
    });
}

/**
 * Sets the href of all buttons based upon the passed in language
 * @param {string} whatLanguage The language value
 *
 */
const setButtonLinkBasedOnLanguage = function (whatLanguage) {
  let ukg_cookie = helper_cookie.getCookie('U20K20G');
  ukg_cookie = atob(ukg_cookie); // decode the base64 cookie data
  ukg_cookie = JSON.parse(ukg_cookie); // reconstitute the ukg_cookie object
  let ukg_cookie_ecid = ukg_cookie.ecid; // get ecid value from U20K20G cookie
  let ukg_cookie_eqid = ukg_cookie.eqid; // get eqid value from U20K20G cookie
  let elements = $('.ukg-alternate-links');
  if (elements.length) {
    for (let i = 0; i < elements.length; i++) {
      let elem = $(elements[i]);
      if (typeof elem.data(whatLanguage) !== 'undefined') {
        let data_url = elem.data(whatLanguage);
        data_url = helper.updateQueryString(data_url, 'ecid', ukg_cookie_ecid);
        data_url = helper.updateQueryString(data_url, 'eqid', ukg_cookie_eqid);
        elem.attr('href', data_url);
      }
    }
  }
}

module.exports = {
  init
};
