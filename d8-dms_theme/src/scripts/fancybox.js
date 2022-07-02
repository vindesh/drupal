(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.fancybox = {
    attach: function (context, settings) {

      if (typeof context['location'] !== 'undefined') {

        // http://fancyapps.com/fancybox/3/docs/

        // Project
        // $('#gallery a').fancybox({
        //   buttons: [
        //     'zoom',
        //     'fullScreen',
        //     'thumbs',
        //     'close'
        //   ]
        // });
        // $('.gallery-link').click(function(e){
        //   e.preventDefault();
        //   $('.gallery a:first').click();
        // });
        $('.project__images--slider a').attr('data-fancybox','gallery');
        $('.project__images--slider a').fancybox({
          transitionEffect: 'slide',
          buttons: [
            'zoom',
            'fullScreen',
            'thumbs',
            'close'
          ]
        });
        $('.pattern__images--slider a').attr('data-fancybox','gallery');
        $('.pattern__images--slider a').fancybox({
          transitionEffect: 'slide',
          buttons: [
            'zoom',
            'fullScreen',
            'thumbs',
            'close'
          ]
        });

        // Comment
        var $commentImages = $('.comment__content--images a');
        $commentImages.on('click', function() {
          $.fancybox.open($commentImages, {
            buttons: [
              'zoom',
              'fullScreen',
              'thumbs',
              'close'
            ]
          }, $commentImages.index(this));
          return false;
        });

      }

    }
  };

})(jQuery, Drupal, this, this.document);
