(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.tinyslider = {
    attach: function (context, settings) {

      if (typeof context['location'] !== 'undefined') {

        // http://ganlanyuan.github.io/tiny-slider/tests/index.html

        if ($('.paragraph--type--image-gallery').length) {
          var slider = tns({
            container: '.field--name-field-images',
            controlsText: [
              "<span class='fa fa-angle-left carousel__btn'></span>",
              "<span class='fa fa-angle-right carousel__btn'></span>"
            ],
            autoWidth: true,
            autoHeight: true,
            loop: false,
            gutter: 10,
            mouseDrag: true,
            nav: false,
          });
        }

      }

    }
  };

})(jQuery, Drupal, this, this.document);
