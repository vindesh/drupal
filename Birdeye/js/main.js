(function ($) {
	
	$(window).on("load",function(){
		/*$('html').addClass('page-load-complete');*/
			
		/** Sticky Header **/
		var stickyOffset = $("#navbar").outerHeight();
		$(".main-container").css("padding-top", stickyOffset);
		
		var Scroll;
		function StickyHeader(){		
			Scroll = $(window).scrollTop();
			
			if (Scroll >= stickyOffset)
				$("body").addClass('sticked');
			else
				$("body").removeClass('sticked');
		}
		StickyHeader();
		$(window).scroll(function(){
			StickyHeader();
		});

		// Check if Slick Slideshow has images
		if ($(".slick img").length > 0){ $(".slick").addClass("has-img");}
		
		//change nolink into span
		$(".navbar-nav > li > a[href='']").each(function(){
			$(this).attr("href","javascript:void(0)");
			$(this).addClass("nolink");
		});
	});		
	
}(jQuery));


