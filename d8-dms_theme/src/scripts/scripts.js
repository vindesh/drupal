(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.dms = {
    attach: function (context, settings) {

      if (typeof context['location'] !== 'undefined') {

        // // Toggle
        // $('.js-toggle .menu__title, .js-toggle .language__title').click(function() {
        //   $('.js-toggle').find('.open').removeClass('open').siblings('.menu__list, ul.links').slideToggle();
        // });

        // Generic scroll-to
        $('.scroll-to').click(function(e) {
          e.preventDefault();
          var goTo = $(this).attr('data-scroll');
          $('html,body').animate({
            scrollTop: $('#' + goTo).offset().top
          }, 1000);
        });

        // Countdown
        // $('#countdown-timer').countdown('2018/11/21', function(event) {
        //   $(this).html(event.strftime('%-D'));
        // });
        $('#countdown-timer').countdown($('#countdown-timer').attr('data-clock'), function(event) {
          $(this).text(event.strftime('%-D'));
        });

        // Creation body field links => open in new window
        $('.project__content .field--name-body a').attr('target','_blank');

        // // Clipboard
        // var clipboard = new ClipboardJS('.btn--clipboard');
        // clipboard.on('success', function(e) {
        //   $('.clipboard-copied').fadeIn();
        //   e.clearSelection();
        // });

        // User menu authenticated
        $('.user-menu-authenticated .menu__title').click(function() {
          $(this).toggleClass('open').siblings('.menu__list').slideToggle(250);
        });

        // Product supplies (this is so wrong on so many levels..)
        $('.pattern__supplies.hl a').removeAttr('type length title target').attr('href','#product-modal').attr('rel','modal:open');

        // Language switcher
        $(document).ready(function() {
          var activeLanguage = $('.language-switcher ul.links a.is-active').text();
          if(activeLanguage == '') { var activeLanguage = 'en' }
          $('.language__title').text(activeLanguage);
          $('.language__title').click(function() {
            $(this).toggleClass('open').siblings('ul.links').slideToggle(250);
          });
        });

        // Stores Related To Fabric
        $('.view-stores-related-to-fabric .views-row-tab:first').addClass('active');
        $('.view-stores-related-to-fabric .views-row-group:first').addClass('active');
        $('.view-stores-related-to-fabric .views-row-tab').click(function() {
          var tabIndex = $(this).index();
          $('.view-stores-related-to-fabric .views-row-tab, .view-stores-related-to-fabric .views-row-group').removeClass('active');
          $(this).addClass('active');
          $('.view-stores-related-to-fabric .views-row-group').eq(tabIndex).addClass('active');
        });

        // Mobile menu
        $('.js-mm-toggle').click(function(e) {
          $('body').toggleClass('mm-open');
          e.preventDefault();
        });

        // Tracking
        $('a[href^="mailto:"]').addClass('gtm-mail');
        $('a[href^="tel:"]').addClass('gtm-phone');

      }

    }
  };

})(jQuery, Drupal, this, this.document);
