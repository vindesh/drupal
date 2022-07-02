'use strict';

const SITE_CAMPAIGN_IDS = JSON.parse('{ "de-de": { "ecid": "701610000005kMNAAY", "nsecid": "701610000005kPaAAI", "eqid": "818", "nseqid": "821" }, "en": { "ecid": "701610000005jmCAAQ", "nsecid": "701610000005jLXAAY", "eqid": "142", "nseqid": "121" }, "es-es": { "ecid": "701610000005kKRAAY", "nsecid": "701610000005kNXAAY", "eqid": "373", "nseqid": "383" }, "es-mx": { "ecid": "701610000005kJjAAI", "nsecid": "701610000005kKTAAY", "eqid": "365", "nseqid": "375" }, "fr-ca": { "ecid": "701610000005jmCAAQ", "nsecid": "701610000005jLXAAY", "eqid": "142", "nseqid": "121" }, "fr-fr": { "ecid": "701610000005kIzAAI", "nsecid": "701610000005kWiAAI", "eqid": "367", "nseqid": "377" }, "nl-nl": { "ecid": "701610000005kNVAAY", "nsecid": "701610000005kN3AAI", "eqid": "2105", "nseqid": "2210" } }');
const SITE_LANGUAGE = document.getElementsByTagName('html')[0].getAttribute('lang') ? document.getElementsByTagName('html')[0].getAttribute('lang').toLowerCase() : 'en';


/**
 * Returns the (Salesforce) campaign id associated with site language
 * @param whatSiteLanguage
 * @returns {*}
 */
const getEcid = function (whatSiteLanguage = SITE_LANGUAGE) {
  return typeof SITE_CAMPAIGN_IDS[whatSiteLanguage] !== 'undefined' ? SITE_CAMPAIGN_IDS[whatSiteLanguage]['ecid'] : null;
}

/**
 * Returns the (Eloqua) campaign id associated with site language
 * @param whatSiteLanguage
 * @returns {*}
 */
const getEqid = function (whatSiteLanguage = SITE_LANGUAGE) {
  return typeof SITE_CAMPAIGN_IDS[whatSiteLanguage] !== 'undefined' ? SITE_CAMPAIGN_IDS[whatSiteLanguage]['eqid'] : null;
}

/**
 * Returns the (Salesforce) natural search campaign id associated with site language
 * @param whatSiteLanguage
 * @returns {*}
 */
const getNaturalSearchEcid = function (whatSiteLanguage = SITE_LANGUAGE) {
  return typeof SITE_CAMPAIGN_IDS[whatSiteLanguage] !== 'undefined' ? SITE_CAMPAIGN_IDS[whatSiteLanguage]['nsecid'] : null;
}

/**
 * Returns the (Eloqua) natural search campaign id associated with site language
 * @param whatSiteLanguage
 * @returns {*}
 */
const getNaturalSearchEqid = function (whatSiteLanguage = SITE_LANGUAGE) {
  return typeof SITE_CAMPAIGN_IDS[whatSiteLanguage] !== 'undefined' ? SITE_CAMPAIGN_IDS[whatSiteLanguage]['nseqid'] : null;
}

module.exports = {
  SITE_CAMPAIGN_IDS,
  SITE_LANGUAGE,
  getEcid,
  getEqid,
  getNaturalSearchEcid,
  getNaturalSearchEqid
};
