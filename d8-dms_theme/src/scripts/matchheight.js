(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.matchheight = {
    attach: function (context, settings) {

      if (typeof context['location'] !== 'undefined') {

        // https://github.com/liabru/jquery-match-height
        $('.pattern__teaser--info, .project__teaser--info, .fabric__teaser').matchHeight();
        $('.countdown, .mailchimp').matchHeight();
        $('.geolocation').matchHeight();
        $('.view-stores-related-to-fabric .views-row').matchHeight();

        $(document).ajaxComplete(function() {
          $('.pattern__teaser--info, .project__teaser--info, .fabric__teaser').matchHeight();
          $('.geolocation').matchHeight();
        });

      }

    }
  };

})(jQuery, Drupal, this, this.document);
