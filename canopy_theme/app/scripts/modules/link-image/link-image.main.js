'use strict';

const $ = require('jquery');
const UIkit = require('uikit');
const enquire = require('enquire.js');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'link-image.main.js: Function Name: {0}, {1}::{2}';
const format = require('string-format');

/**
   *  linkImage function - Working
   *  1. When no image link is provided, we fetch the url from the first cta in the 
   *  component cta dropzone. We also use match the alt, title, from the cta as well.
   *  2. If no image link or cta, we remove the parent link container for image.
   */
module.exports = class linkImage {
  constructor($el) {
    log.debug(logFormat_debug.format('linkImage', 'init: ', ''));
    this.$el = $el;
    let that = this;
    // this.$el is object of div tag where data-module tag added.
    // get image object.
    let imgObj = this.$el.find("img");
    // get object of image anchor.
    let $linkimg = imgObj.parent('a');
    // get object of first CTA.
    let $cta = imgObj.closest('.uk-card').find('div.uk-card-footer a').eq(0);
    //case #1: anchor exist
    if($linkimg.length){ //console.log('case #1::'+$linkimg.attr('href'));
      let link_href = $linkimg.attr('href');
      var checkUrl = ["", "/", "#"];
      // checking anchor have valide url/path
      if( link_href.length <= 1 && checkUrl.includes(link_href)  ) {
        // CTA exist  
        if($cta.length){
          let cta_href = $cta.attr('href')
          if(cta_href){
            $linkimg.attr('href', $cta.attr('href'));
          }else{
            imgObj.unwrap();
          }
        }else{
          imgObj.unwrap();
        }
      } 
    }
    else if($cta.length){   //case #2: anchor does exist & CTA exist.
      let cta_href = $cta.attr('href'); 
      let val_link_title = $cta.attr('title');
      if(cta_href){  
        imgObj.wrap('<a href="'+cta_href+'" title="'+val_link_title+'"></a>');
      }
    }
  }

};
