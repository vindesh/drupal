(function ($) {
	
	 jQuery(document).ready(function($){
              $('.owl-products').owlCarousel({
                loop: true,
                nav: true,
                responsive: {
                  0: {
                    items: 2
                  },
                  600: {
                    items: 3
                  },
                  1000: {
                    items: 3
                  }
                }
              })

              $('.banner-prod').owlCarousel({
                loop: true,
                nav: true,
                items: 1,
              })

      /* Footer social-media icon JS */
      $('.social-links ul li').each(function(i) {
        if ( i === 0 ) { $(this).addClass('face-ftr');  }
        if ( i === 1 ) { $(this).addClass('you-ftr');  }
        if ( i === 2 ) { $(this).addClass('twi-ftr');  }
        if ( i === 3 ) { $(this).addClass('insta-ftr');  }
        if ( i === 4 ) { $(this).addClass('enve-ftr');  }    
      });

  });
	
}(jQuery));


