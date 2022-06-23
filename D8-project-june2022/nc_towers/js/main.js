/**
 * @file
 * Global utilities.
 *
 */
(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.mainJS = {
    attach: function (context, settings) {
      var $itemSelector = $('.chart-tabs-container .nc-tab-item', context);
      if($itemSelector.length > 0){
        var ncQueryParams = window.location.search;
        $itemSelector.find("a.nc-tab-link").parent().removeClass('active');
        $itemSelector.find("a[href='"+window.location.pathname+"']").parent().addClass('active');
        if(ncQueryParams != '' && (ncQueryParams.indexOf('degree') || ncQueryParams.indexOf('program_study') || ncQueryParams.indexOf('school') || ncQueryParams.indexOf('school_type')|| ncQueryParams.indexOf('school_year'))){
          $itemSelector.find("a.nc-tab-link").parent().removeClass('isDisabled');
          $itemSelector.find("a[href='"+window.location.pathname+"']").parent().addClass('isDisabled');
          $('.chart-tabs-container a.nc-tab-link', context).click(function(e){
            e.preventDefault();
            if(!$(this).parent().hasClass('active')){
              window.location.href = $(this).attr('href')+ncQueryParams;
            }
          })
        }
      }

      var btn = $('.page-backto-top');
      $(window).scroll(function() {
        if ($(window).scrollTop() > 200) {
          btn.addClass('show');
        } else {
          btn.removeClass('show');
        }
      });

      btn.on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop:0}, '300');
      });
    }
  };

})(jQuery, Drupal);
