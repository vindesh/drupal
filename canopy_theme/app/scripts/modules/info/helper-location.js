'use strict';

const GOOGLE_API_KEY = 'AIzaSyCOvtG_Tu680AgGOJbiA2i1xxW4jzyTIok';
const REFERRER_HOSTNAME = getReferrerHostname();
const axios = require('axios'); // https://github.com/axios/axios


/**
 * Returns TRUE if the hostname of the referrer contains kronos.ca, kronos.com, kronos.in, kronos.co.uk , or kronos.com.au, otherwise FALSE is returned.
 * @returns {boolean}
 */
const englishLanguageKronosReferrer = function () {
  let referrerHostname = getReferrerHostname();
  return referrerHostname.includes('kronos.ca') || referrerHostname.includes('kronos.in') || referrerHostname.includes('kronos.co.uk') || referrerHostname.includes('kronos.com');
}

/**
 * Returns TRUE if the referrer is from bing, google, or yahoo
 * @returns {boolean}
 */
const isNaturalSearchReferral = function () {
  let naturalSearchHostNames = ['google.com', 'yahoo.com', 'bing.com'];
  let referrerHostname = getReferrerHostname();
  for (let i = 0; i < naturalSearchHostNames.length; i++) {
    if (referrerHostname.indexOf(naturalSearchHostNames[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the language associated with the referrer, otherwise 'en' is returned as the default.
 * @returns {string}
 * getReferrerLanguage
 */
const getReferrerLanguage = function () {
  let site_lang = '';
  if (REFERRER_HOSTNAME.includes('kronos.ca') || REFERRER_HOSTNAME.includes('kronos.in') || REFERRER_HOSTNAME.includes('kronos.co.uk') || REFERRER_HOSTNAME.includes('kronos.com')) {
    switch (REFERRER_HOSTNAME) {
      case "www.kronos.ca":
        site_lang = 'en-ca';
        break;
      case "www.kronos.in":
        site_lang = 'en-in';
        break;
      case "www.kronos.com.au":
        site_lang = 'en-au';
        break;
      case "www.kronos.co.uk":
        site_lang = 'en-gb';
        break;
      default:
        site_lang = 'en'; // default language
        break;
    }
  }
  return site_lang;
}

/**
 * Returns lowercase ALPHA-2 country code based upon the preferred language of the users browser.
 * If the navigator object is null or unavailable, we default to the 'en' language.
 * https://phrase.com/blog/posts/detecting-browser-language-preference-with-javascript/
 */
const getNavigatorCountryCode = function () {
  let nav_lang = '';
  if (navigator) {
    if (navigator.language) {
      if (navigator.language.length > 2) {
        nav_lang = navigator.language.substr(3, 2); // en-CA, en-GB, hi-IN, en-AU, en-US
      } else {
        nav_lang = navigator.language.substr(0, 2) // en
      }
    } else {
      nav_lang = 'en';
    }
  } else {
    nav_lang = 'en';
  }
  return nav_lang.toLowerCase();
}

/**
 * Returns lowercase registry_country_code value from the Demandbase object
 * @param ms - The intervals (in milliseconds) on how often to execute the code.
 * @param max_tries - The maximum number of check attempts (Default: 20)
 * @returns {Promise<String>}
 *
 * English language codes returned by Demandbase.IP.CompanyProfile.registry_country_code
 * US, CA, AU, GB, IN
 *
 * getDemandbaseCountryCode(100) - Checks for Demandbase object every 100 milliseconds 20 times.
 * getDemandbaseCountryCode(100, 5) - Checks for Demandbase object every 100 milliseconds 5 times.
 */
const getDemandbaseCountryCode = (ms, max_tries = 20) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      let dbIpCp = typeof window.Demandbase === 'undefined' ? null : window.Demandbase.IP.CompanyProfile;
      if (typeof dbIpCp === 'object' && dbIpCp !== null && dbIpCp.registry_country_code !== '') {
        clearInterval(interval);
        resolve(dbIpCp.registry_country_code.toLowerCase());
      } else if (max_tries <= 1) {
        clearInterval(interval);
        reject(new Error('Demandbase.IP.CompanyProfile.country not available!'));
      }
      max_tries--;
    }, ms);
  });
}

/**
 * Returns the latitude and longitude based upon the users location which includes ip address consideration.
 * @returns {Promise<String>}
 */
const getLatitudeAndLongitudeByIP = () => {
  return new Promise((resolve, reject) => {
    let req_url = 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + GOOGLE_API_KEY;
    let data = {considerIp: 'true'};
    let timeout = {timeout: 2000};
    axios.post(req_url, data, timeout).then(function (response) {
      resolve(response);
    }).catch(function (error) {
      reject(error);
    });
  });
};

/**
 * Returns lowercase ALPHA-2 country code based upon the passed in latitude and longitude parameter values.
 *
 * @param {string} whatLatitude - The latitude value
 * @param {string} whatLongitude - The longitude value
 * @returns {Promise<String>}
 *
 * latlng=42.618060799999995,-71.3457664 - Lowell, MA - long_name: United States, short_name:US
 * latlng=51.733833, -0.052848 - Chestnut, UK - long_name: United Kingdom, short_name: GB
 * latlng=46.878968,-71.217888 - Quebec City, Canada - long_name: Canada, short_name: CA
 * latlng=15.835196,78.027299 - Kurnool, Andhra Pradesh, India - long_name: India, short_name: IN
 * latlng=-34.456182,149.469855 - Crookwell NSW, Australia - long_name: Australia, short_name: AU
 *
 * https://maps.googleapis.com/maps/api/geocode/json?latlng=-34.456182,149.469855&key=AIzaSyCOvtG_Tu680AgGOJbiA2i1xxW4jzyTIok
 *
 */
const getCountryCodeByLatitudeAndLongitude = (whatLatitude, whatLongitude) => {
  return new Promise((resolve, reject) => {
    let base_url = 'https://maps.googleapis.com/maps/api/geocode/json?';
    let lat_lng = whatLatitude + ',' + whatLongitude;
    let request_url = base_url + '&latlng=' + lat_lng + '&key=' + GOOGLE_API_KEY;
    let timeout = {timeout: 2000};
    let country_code = '';
    axios.get(request_url, timeout).then(function (response) {
      if (!response.data.error_message) {
        let address_components = response.data.results[0].address_components;
        for (let i = 0; i < address_components.length; i++) {
          let addressType = address_components[i].types[0];
          if (addressType === 'country') {
            country_code = address_components[i].short_name;
          }
        }
        resolve(country_code.toLowerCase());
      } else {
        reject(response.data.error_message);
      }
    }).catch(function (error) {
      reject(error);
    });
  });
};

/**
 * Returns the referrer hostname
 * @returns {string}
 */
function getReferrerHostname() {
  let el = document.createElement('a');
  el.href = document.referrer;
  return el.hostname;
}

module.exports = {
  GOOGLE_API_KEY,
  REFERRER_HOSTNAME,
  getReferrerHostname,
  englishLanguageKronosReferrer,
  isNaturalSearchReferral,
  getReferrerLanguage,
  getNavigatorCountryCode,
  getDemandbaseCountryCode,
  getLatitudeAndLongitudeByIP,
  getCountryCodeByLatitudeAndLongitude
};
