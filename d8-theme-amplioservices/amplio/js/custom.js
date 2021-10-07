jQuery(document).ready(function() {
    //Homepage slider

    jQuery('.home-slider').slick({
        arrows: true,
        dots: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 4000,
        prevArrow: '<span class="prev"><img src="/themes/amplio/images/prev-arrow.png"></span>',
        nextArrow: '<span class="next"><img src="/themes/amplio/images/next-arrow.png"></span>'
    })
});