'use strict';

const Cookies = require('js-cookie'); // https://github.com/js-cookie/js-cookie


/**
 * Returns the domain where the cookie will reside
 * NOTE: 11/06/2020 - trying to set cookie with localhost domain fails on Chrome browser
 * NOTE: https://bugs.chromium.org/p/chromium/issues/detail?id=56211
 * NOTE: Solution is to set cookie domain to '' when running from localhost and let
 * NOTE: the browser supply the cookie domain.
 */
const getCookieDomain = function () {
  let domain = '';
  let host = window.location.hostname.toLowerCase();
  if (host.indexOf('localhost') > -1) {
    domain = '';
  } else if (host.indexOf('acquia-sites') > -1) {
    domain = '.acquia-sites.com';
  } else if (host.indexOf('www.') > -1) {
    domain = host.replace('www', '');
  } else {
    domain = '.' + host;
  }
  return domain;
}

/**
 * Returns true when running from a www kronos, ukg, nl.kronosglobal.be, or fr.kronos.ca domain
 */
const useSecureCookie = function () {
  let host = window.location.hostname.toLowerCase();
  let isSecure = false;
  if (host.indexOf('www.') > -1 || host.indexOf('nl.kronosglobal.be') > -1 || host.indexOf('fr.kronos.ca') > -1) {
    isSecure = true;
  }
  return isSecure;
}

/**
 * Returns TRUE if the whatCookieName cookie exists
 * @param whatCookieName
 * @returns {boolean}
 */
const cookieExists = function (whatCookieName) {
  return !!Cookies.get(whatCookieName);
}

/**
 * Gets the value of the whatCookieName cookie
 * @param whatCookieName
 * @returns {*}
 */
const getCookie = function (whatCookieName) {
  return Cookies.get(whatCookieName);
}

/**
 * Sets the value of the whatCookieName cookie to whatCookieValue using whatCookieOptions
 * @param whatCookieName
 * @param whatCookieValue
 * @param whatCookieOptions
 */
const setCookie = function (whatCookieName, whatCookieValue, whatCookieOptions) {
  Cookies.set(whatCookieName, whatCookieValue, whatCookieOptions);
}

module.exports = {
  getCookieDomain,
  useSecureCookie,
  cookieExists,
  getCookie,
  setCookie
};
