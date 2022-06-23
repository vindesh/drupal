(function ($, Drupal) {
  $(document).ready(function() {
    /*var $mainWraper = $('#edit-types');
    if($mainWraper.length){
      $('#report-form-wrapper').addClass('d-none');
      $mainWraper.change(function(){
        var selectedVal = $(this).val();
        if(selectedVal == ''){
          console.log('empty')
          //$('#report-form-wrapper').hide();
          $('#report-form-wrapper').addClass('d-none');
        }else{
          console.log('data')
          //$('#report-form-wrapper').show();
          $('#report-form-wrapper').removeClass('d-none');
        }
      })
    }*/
  })

  Drupal.behaviors.formBehavior = {
    attach: function (context, settings) {
      var $sortingEle = $('.sorting-btn', context);
      if($sortingEle.length){
        $('.sorting-btn:checked', context).parents('.sorting-wrap').next('.sorting-order-wrap').show();
        $sortingEle.once().change(function(){
          $sortingEle.prop('checked', false);
          $('.sorting-order-wrap', context).hide();
          $(this, context).parents('.sorting-wrap').next('.sorting-order-wrap').show();
          $(this, context).prop('checked', true);
        })
      }

      var $popupFields = $('#popup-wrapper', context);
      if($popupFields.length){
        $(".toggle-popup", context).click(function(){
          $popupFields.addClass('d-none')
          $(".popup-field-btn").mousedown();
        })

        $('.add-field-btn', context).click(function(e){
          e.preventDefault();
          var selectedVal = $('#edit-types', context).val();
          if(selectedVal == ''){
            $popupFields.addClass('d-none');
          }else{
            $popupFields.removeClass('d-none');
            $('html, body').animate({
              scrollTop: $("#data-set-wrapper").offset().top - 20
            }, 800);
          }
        })
      }

      $('#edit-actions-start-over', context).click(function(e){
        e.preventDefault();
        window.location.href = window.location.pathname
      })

      var searchParams = window.location.search
      if(searchParams != '' && !$("body").hasClass('report-animation')) {
        setTimeout(function() {
          $('html, body').animate({
            scrollTop: $(".run-report").offset().top - 20
          }, 800);
          $("body").addClass('report-animation');
        }, 600);
      }
    },
  };
})(jQuery, Drupal);
