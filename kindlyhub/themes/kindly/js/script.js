jQuery(function () {
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
        triggerHook: 'onLeave',
        duration: "200%" 
    }
  });
  var slides = document.querySelectorAll(".section-wipes");
  for (var i=0; i<slides.length; i++) {
    new ScrollMagic.Scene({
        triggerElement: slides[i]
    })
    .setPin(slides[i], {pushFollowers: false})
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);
  }
});