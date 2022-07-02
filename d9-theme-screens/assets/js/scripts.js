

(function($) {
	"use strict";
	
		jQuery(document).ready(function($){
		
		/*START PRELOADER JS*/
		/*
		$(window).load(function() { 
			$('.status').fadeOut();
			$('.preloader').delay(350).fadeOut('slow'); 
		}); 
		*/
		/*END PRELOADER JS*/
		 $('#edit-captcha-response').placeholder = "Enter the characters shown in the image.";
		/*START MENU JS*/
			$('a[href*=#]').bind("click", function(e){
				var anchor = $(this);
				$('html, body').stop().animate({
					scrollTop: $(anchor.attr('href')).offset().top - 50
				}, 1500);
				e.preventDefault();
			});
/*
			$(window).scroll(function() {
			  if ($(this).scrollTop() > 100) {
				$('.menu-top').addClass('menu-shrink');
			  } else {
				$('.menu-top').removeClass('menu-shrink');
			  }
			});
			*/
			$(document).on('click','.navbar-collapse.in',function(e) {
			if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
				$(this).collapse('hide');
			}
		});
		/*END MENU JS*/

		/*START PROGRESS BAR JS*/
	    $('.progress-bar > span').each(function(){
			var $this = $(this);
			var width = $(this).data('percent');
			$this.css({
				'transition' : 'width 2s'
			});
			
			setTimeout(function() {
				$this.appear(function() {
						$this.css('width', width + '%');
				});
			}, 500);
		});
		/*END PROGRESS BAR JS*/

		/* START COUNTDOWN JS*/
		$('.counter_feature').bind('inview', function(event, visible, visiblePartX, visiblePartY) {
			if (visible) {
				$(this).find('.timer').each(function () {
					var $this = $(this);
					$({ Counter: 0 }).animate({ Counter: $this.text() }, {
						duration: 2000,
						easing: 'swing',
						step: function () {
							$this.text(Math.ceil(this.Counter));
						}
					});
				});
				$(this).unbind('inview');
			}
		});
		/* END COUNTDOWN JS */
		
		/* START PORTFOLIO JS */
		jQuery('.grid').mixitup({
		targetSelector: '.mix',
		});
		
		$('.image-popup').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			mainClass: 'mfp-img-mobile',
			image: {
				verticalFit: true
			}
		
		});
		/* END PORTFOLIO JS */
		
		
		/*START TESTIMONIAL CAROUSEL JS*/
		$('.carousel').carousel({
			interval:5000,
			pause:"false",
		});
		/*END TESTIMONIAL CAROUSEL JS*/
		
		/*START CONTACT MAP JS*/
		/*
		var contact = {"lat":"31.956873", "lon":"35.8818"}; //Change a map coordinate here!
		try {
			
			$('.map').gmap3({
				action: 'addMarker',
				latLng: [contact.lat, contact.lon],
				map:{
					center: [contact.lat, contact.lon],
					zoom: 15
					},
				},
				{action: 'setOptions', args:[{scrollwheel:false}]}
			);
		} catch(err) {

		}
		*/
	   /*END CONTACT MAP JS*/
	   
	  });
		
	/*START WOW ANIMATION JS*/
		new WOW().init();	
	/*END WOW ANIMATION JS*/
		
})(jQuery);

