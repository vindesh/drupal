'use strict';

const $ = require('jquery');
const UIkit = require('uikit');
const enquire = require('enquire.js');
const helper = require('../info/helper');
const log = helper.SettingLogLevel();
const logFormat_debug = 'link-image.main.js: Function Name: {0}, {1}::{2}';
const format = require('string-format');

module.exports = class linkImage {
  constructor($el) {
    log.debug(logFormat_debug.format('linkImage', 'init: ', ''));
    this.$el = $el;
    let that = this;
    
    let $linkimg = that.$el.parent('a');
    let $cta = that.$el.closest('.uk-card').find('div.uk-card-footer a').eq(0);
    //console.log($cta);
    //console.log($cta.length);
    if($linkimg.length){
      let link_href = $linkimg.attr('href');
        if(link_href == '' || link_href =='/' || link_href =='#' ){
          if($cta.length){
            let cta_href = $cta.attr('href')
            if(typeof cta_href != 'undefined' && cta_href.length){
              console.log('cta_href.length:true:' + cta_href.length);
              $linkimg.attr('href', $cta.attr('href'));
            }else{
              that.$el.unwrap();
            }
          }else{
            that.$el.unwrap();
          }
        } 
    }else if($cta.length){   
      let cta_href = $cta.attr('href'); 
      let val_link_title = $cta.attr('title');
      if(typeof cta_href != 'undefined' && cta_href.length){
        console.log('cta_href.length:false:' + cta_href.length);
        that.$el.wrap('<a href="'+cta_href+'" title="'+val_link_title+'"></a>');
      }
    }
  }

};
