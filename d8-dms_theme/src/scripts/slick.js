(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.slick = {
    attach: function (context, settings) {

      if (typeof context['location'] !== 'undefined') {

        // See http://kenwheeler.github.io/slick/#settings
        $('.paragraph--type--image-gallery .field--name-field-images').slick({
          infinite: true,
          dots: true,
          slidesToShow: 1,
          centerMode: true,
          variableWidth: true,
          prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
        });

        $('.pattern__images--slider').slick({
          infinite: false,
          dots: false,
          slidesToShow: 1,
          prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
        });

        $('.project__images--slider .field--name-field-images').slick({
          infinite: false,
          dots: false,
          slidesToShow: 1,
          prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
        });

        $('.field--name-field-gallery-images').slick({
          infinite: true,
          dots: true,
          slidesToShow: 1,
          centerMode: true,
          variableWidth: true,
          prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
        });

        $('.fabric__documents .field--name-field-documents').slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: false,
          asNavFor: '.fabric__documents--nav .field--name-field-documents'
        });
        $('.fabric__documents--nav .field--name-field-documents').slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          asNavFor: '.fabric__documents .field--name-field-documents',
          arrows: false,
          dots: true,
          centerMode: true,
          focusOnSelect: true
        });

        $('.liked-projects .views-rows').slick({
          infinite: false,
          dots: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: '<button type="button" class="slick-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
        });

      }

    }
  };

})(jQuery, Drupal, this, this.document);
