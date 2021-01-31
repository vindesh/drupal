(function (jQuery) {
  jQuery('#profile-service-providers-add-form').submit(function () {
    jQuery('.validate').each(function () {
      if (jQuery(this).val()) {

      }
    });
    return false;
  });

  jQuery('#reservation-date').dateDropper();

  jQuery('#map_full_width_one').gmap3({
    map: {
      options: {
        zoom: 12,
        center: [22.6719215, 75.8388847],
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        mapTypeId: "style1",
        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, "style1"]
        },
        navigationControl: true,
        scrollwheel: false,
        streetViewControl: true
      }
    },
    marker: {
      latLng: [22.6719215, 75.8388847],
      options: {animation: google.maps.Animation.BOUNCE, icon: '/cotfoo/docroot/images/geotag.png'}
    },
    styledmaptype: {
      id: "style1",
      options: {
        name: "Style 1"
      },
    }
  });


  /*---- Homepage meals Slide ---*/
  jQuery('.recom-meals-slide').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 1
        }
      }
    ]
  });

  // loader for ajax
//  jQuery(document).ajaxStart(function () {
//    jQuery('body').addClass('spinnerOn');
//  });
//  jQuery(document).ajaxSuccess(function () {
//    jQuery('body').removeClass('spinnerOn');
//  });

  /*---- Bottom To Top Scroll Script ---*/
  jQuery(window).on('scroll', function () {
    var height = jQuery(window).scrollTop();
    if (height > 100) {
      jQuery('#back2Top').fadeIn();
    } else {
      jQuery('#back2Top').fadeOut();
    }
  });

  // remove alert message
  setTimeout(function () {
    jQuery('div.highlighted .alert').fadeOut();
  }, 20000);

  jQuery("#back2Top").on('click', function (event) {
    event.preventDefault();
    jQuery("html, body").animate({scrollTop: 0}, "slow");
    return false;
  });

  jQuery("[href='#howitworks']").click(function () {
    jQuery('html, body').animate({
      scrollTop: jQuery("#howitworks").offset().top - 100
    }, 500);
  });
  //dashboard form fields
  jQuery('#edit-profession, #edit-ethnicity, #edit-area-of-interest, #edit-amenities, #edit-field-max-guest').select2({search: true, searchText: 'Enter here.'});
  jQuery('#edit-preferred-cuisines').select2({search: true, searchText: 'search here..', placeholder: 'Preferred cuisines'});
  jQuery('#edit-languages').select2({search: true, searchText: 'Search here..', placeholder: 'Languages you speak'});
  jQuery('#edit-speciality-cuisines').select2({search: true, searchText: 'Search here..', placeholder: 'Speciality cuisines'});
  jQuery('#edit-id-type').select2({search: true, searchText: 'Search here..', placeholder: 'Id type'});
  jQuery('#edit-field-cuisine').select2({search: true, searchText: 'Search here..', placeholder: 'Cuisine type'});
  jQuery('#edit-field-category').select2({search: true, searchText: 'Search here..', placeholder: 'Category'});
  jQuery('#edit-field-present-at').select2({search: true, searchText: 'Search here..', placeholder: 'Meal type'});
  jQuery('#edit-area-of-interests').select2({search: true, searchText: 'Search here..', placeholder: 'Area of interests'});

  //Start of Tawk.to Script keep it always at end of the file
  var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
  (function () {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/5ace322a4b401e45400e8b02/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  })();
  // End of Tawk.to Script 

  function openRightMenu() {
    document.getElementById("rightMenu").style.display = "block";
  }
  function closeRightMenu() {
    document.getElementById("rightMenu").style.display = "none";
  }
  if (jQuery(window).width() < 767) {
    jQuery(".slide-filter").addClass('sidenav');
    jQuery('.slide-filter').attr('id', 'slide_filters');
    jQuery("#filterYourSearch").show();
    jQuery("#filterCloseBtn").show();
  }
  function openNav() {
    document.getElementById("slide_filters").style.width = "100%";
  }

  function closeNav() {
    document.getElementById("slide_filters").style.width = "0";
  }
  jQuery('#edit-profile-pic-remove-button').addClass('btn theme-btn');

//  listing page
  jQuery('#edit-host').select2({search: true, searchText: 'Search here..', placeholder: 'Select Host'});
  jQuery('#edit-meal-type').select2({search: true, searchText: 'Search here..', placeholder: 'Choose Meal Type'});
  jQuery('#edit-cuisine').select2({search: true, searchText: 'Search here..', placeholder: 'Choose Cuisine'});
  jQuery('#edit-interest').select2({search: true, searchText: 'Search here..', placeholder: 'Area Of intrests'});



})(jQuery)