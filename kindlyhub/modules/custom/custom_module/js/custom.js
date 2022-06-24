


(function ($) {
  setValForApproveDonation = function()
  {
    var ch_list = [];

  //    alert('hi');
      jQuery("input[type=checkbox]:checked").each(function(){
        ch_list.push(jQuery(this).closest('td').next().html());
      });

      //jQuery("edit-submit--2").attr('textContent', 'Please wait, Loading.....');

      console.log(ch_list);
      if(ch_list.length == 0)
      {
        alert("Please select donation records to bulk approve");
        return false;
      }
      else
      {
        jQuery("#approveButtonDiv").html('<h3>Please wait, Loading...</h3>');
      }

      var base_url =  window.location.origin;
      var url = base_url + '/';
        //alert(url);
        $.ajax({
          url: url+"sessinkind",
          method: "GET",
          data: {
            nodes : JSON.stringify(ch_list)
          },
          headers: {
            "Content-Type": "application/hal+json"
          },
          //data: 'lid='+lid,
          success: function(data, status, xhr) {
            //    alert(data);
                 window.location.href='/node/add/bulk_sign_update?destination=node/8077';

               }
           });
           //alert('hi2');
          return false;

  }



  Drupal.behaviors.checkboxesSync = {
    attach: function (context, settings) {
      // Uses a cookie to pass which checkbox was hit.
      // We then use that in the Ajax Response Subscriber.

    }
  };


  /**
   * Pull Agency Hourly rate for community partner
   * 'Other' text field get agency rate.
   *
   **/

  Drupal.behaviors.agencyHourlyRate = {
    attach: function (context, settings) {
      jQuery("#edit-field-community-partner-activity-select").on('change',function(){
         if(jQuery(this).val() == 'select_or_other'){
            var base_url =  window.location.origin;
            var url = base_url + '/';
            //var data ='';
            // jQuery.getJSON( url+"agencyrate", function( data ) {
            //   jQuery('#edit-field-community-partner-activity-other').val(data);
            // });
            $.ajax({
              url: url+"communityPartnerRate",
              method: "GET",
              data: {
                'value1' : true,
              },
              headers: {
                "Content-Type": "application/hal+json"
              },
              success: function(data, status, xhr) {
                  if (status == 'success') {
                    jQuery('#edit-field-community-partner-activity-other').val(data);
                  }
                }
            });
         }
      });

    }
  };




  jQuery(document).ready(function(){



  jQuery('#edit-field-hourly-rate-0-value').attr('readonly', 'readonly');
  jQuery('#edit-field-community-partner-activity-other').attr('size', '20');
  jQuery('#edit-field-community-partner-activity-other').attr('readonly', 'readonly');

  var pathname = window.location.pathname;
  var sURLVariables = pathname.split('/');

  //console.log(sURLVariables);
  if(sURLVariables[5]){
    var val = sURLVariables[5].split("?");
  }

  if(sURLVariables[1] == 'node' && sURLVariables[2] == 'add' && val[0]== 'in_kind_donation'){
    jQuery('#edit-flag-pending').prop( "checked", true );
  }

  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8075'){
    jQuery('#my-profile-tab').addClass('active');
  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8076'){
    jQuery('#reports-tab').addClass('active');
    jQuery('#reports-tab-chart').addClass('active');
  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8077'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-don').addClass('active');

  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8078'){
    jQuery('#reports-tab').addClass('active');
    jQuery('#in-kind-report').addClass('active');
    jQuery("[for=edit-field-date-of-activity-value-max]").hide();

  }
  if(sURLVariables[1] == 'report' ){
    jQuery('#reports-tab').addClass('active');
    jQuery('#reports-tab-audit').addClass('active');
  }
  if(sURLVariables[1] == 'grants' ){ //console.log('grants tabs active...');
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-grant').addClass('active');
  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8621'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-stu').addClass('active');

  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8622'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-fam').addClass('active');

  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8623'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-staf').addClass('active');

  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8624'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-clas').addClass('active');

  }
  if(sURLVariables[1] == 'node' && sURLVariables[2] == '8625'){
    jQuery('#my-dash-tab').addClass('active');
    jQuery('#manage-loc').addClass('active');

  }
   if(sURLVariables[1] == 'node' && sURLVariables[2] == '345'){
     jQuery('.alert-danger').hide();

  }

  // exposed filter value change location on click class change ---------------------------------
  if(sURLVariables[1] == "user-dashboard"){

    Drupal.behaviors.viren = {
      attach: function (context, settings) {
        jQuery('[name = field_location_reference_target_id]').change(function(){
        var location1 = this.value;
        getclassroom(location1);

    });

    var loc = jQuery('[name=field_location_reference_target_id]').val();
      if(loc == ""){
          jQuery('.form-item-field-classroom-reference-target-id-1').hide();
          }else{
            jQuery('.form-item-field-classroom-reference-target-id-1').show();
          }

      $('[name=field_location_reference_target_id]').change(function(){
        var location = this.value;
         getlocation(location);
         if(location == ""){
          jQuery('.form-item-field-classroom-reference-target-id-1').hide();
          }else{
            jQuery('.form-item-field-classroom-reference-target-id-1').show();
          }
      });



    }
  };


}

// millage field default 0.00 value -----------------------------------------------------------------
if(sURLVariables[1] == 'node' && sURLVariables[2] == 'add' && sURLVariables[3]== 'in_kind_donation'){
jQuery('#edit-field-doctor-visit-mileage-0-value').val('0.000');
jQuery('#edit-field-date-of-activity-0-value-date').datepicker();
alert('habsk');
}

if(sURLVariables[1] == 'user' && sURLVariables[2] == 'family_member'){
jQuery('#edit-role-change-wrapper').hide();
}

if(sURLVariables[1] == 'user' && sURLVariables[2] == 'staffmember'){
jQuery('#edit-role-change-wrapper').remove();
}

if(sURLVariables[1] == 'user' && sURLVariables[2] == 'location-manager'){
jQuery('#edit-role-change-wrapper').remove();
}

if(sURLVariables[1] == 'user' && sURLVariables[2] == 'Agency-admin'){
jQuery('#edit-role-change-wrapper').remove();
}

if(sURLVariables[1] == 'user' && sURLVariables[2] == 'agency-manager'){
jQuery('#edit-role-change-wrapper').remove();
}

if(sURLVariables[1] == 'User' && sURLVariables[2] == 'community_partner'){
jQuery('#edit-role-change--wrapper').remove();
}

// hourly rate field change on click of community partner activity ----------------------------------
jQuery("#edit-field-community-partner-activity").change(function(){
  var val = jQuery(this).val();
gettexonomy(val);
});


//-----------------------------------------------------------------------------------------
// var date =jQuery("#date-signature").text();
// jQuery('#date-of-sign').text(date);
// jQuery('#date-signature').hide();

//destination of same tab---------------------------------------------------------------------

var path = jQuery(location).attr('href');
var decode =decodeURIComponent(path);
var alrets =decode.replace('=', "");
var first =alrets.split('/')
var query = first[3].split('?');
var querystring=window.location.search;


if(query[0] == "user-dashboard" && querystring !="" ){
  jQuery('.quicktabs-loaded').removeClass('active');
  // jQuery('#quicktabs-tabpage-sidebar_quick_tabs-0').removeClass('active in');
  jQuery('#quicktabs-tabpage-sidebar_quick_tabs-1').removeClass('active in');
  jQuery('a[href="#'+query[1]+'"]').parent().addClass('active');
  jQuery('#'+query[1]).addClass('active in');
  //jQuery('#'+query[1]).removeAttr("style");

}

//-------------------------------------------------------------------------------------------------


// quick tabs hide according to user role ----------------------------------------------------------
setTimeout(function() {
  if(drupalSettings.custom_module.CustomModule)
  {
var isadmin = drupalSettings.custom_module.CustomModule.isadmin;
  }


if(isadmin == 7){
jQuery('[href="/quicktabs/nojs/my_dashboard/0"]').closest('li').hide();
jQuery('[href="#quicktabs-tabpage-sidebar_quick_tabs-4"]').closest('li').hide();
jQuery('[href="#quicktabs-tabpage-sidebar_quick_tabs-0"]').hide();
jQuery('.alert-danger').hide();
jQuery('#ui-id-3').hide();
}
}, 1000);

// Coupon code using ubercart------------------------------------------------------------------------
var coupenid = getUrlParameter('coupon');
if(coupenid == 'R9HSA'){
  jQuery(".uc-product-node .product-attributes .form-item-attributes-1").css('display','block'); 
  jQuery('select[name^="attributes[1]"] option:selected').attr("selected",null);
  jQuery('select[name^="attributes[1]"] option[value=2]').attr("selected","selected");
  jQuery('#edit-attributes-1').children('option[value="1"]').css('display','none');
}else{
    jQuery(".uc-product-node .product-attributes .form-item-attributes-1").css('display','block'); 
    jQuery('#edit-attributes-1').val("1");
    jQuery('#edit-attributes-1').children('option[value="2"]').css('display','none');
}
  jQuery('#edit-attributes-1').attr('readonly', true);
  var text = jQuery("#edit-attributes-1").find("option:selected").text();
  var strArray = text.split('+');
  var val = strArray[1];
  jQuery(".uc-product-189").html(val);  
  jQuery('#edit-cc-number').removeAttr("disabled");

    
// //Custom Coupon Code----------------------------------------------------------------------------------
// var currentURL = window.location.href;
// var result = currentURL.split('/');
// var retcoo = jQuery.cookie("cookieData");

// var oredr_id = jQuery.cookie("cookieData1");
// var retcoo = jQuery.cookie("cookieData"+oredr_id);
// var res = retcoo.split('&');
// var id = res[0];
// var id2 = res[1];
// if((result[3] == "cart" && result[4] == "checkout")){
// if (retcoo != undefined){
// jQuery('.disform-div').hide();
// jQuery(".line-item-subtotal").append( "<p class = 'shalini' id ='edit-remove'><a href = ''><span class='glyphicon glyphicon-remove '>Remove</span></a></p>");
// jQuery('#edit-remove').click(function(event) {
// getInfo(id,id2,oredr_id);
// alert('coupon removed');
// });
// }
// }


// Custom pay by strip payment functionality--------------------------------------------------------
function explode(){
jQuery('#edit-details').hide();
jQuery('#edit-submit-2').hide();
jQuery('#edit-payment-method-pay-by-credit-card').click(function(){
jQuery('#edit-details').show();
jQuery('#edit-submit-2').hide();
jQuery('#edit-submit').show();
});
jQuery('#edit-payment-method-paypal').click(function(){
jQuery('#edit-details').hide();
jQuery('#edit-submit-2').show();
jQuery('#edit-submit').hide();

});
}
setTimeout(explode, 2000);

/// Custom js for Stripe card valiation
'use strict';
  Drupal.behaviors.uc_stripe = {
    attach: function (context) {
var submitButton = jQuery('.paytm-payment-form #edit-submit');
var cc_container = $('.payment-details-stripe-gateway');
var cc_num = cc_container.find(':input[data-drupal-selector*="edit-cc-number"]');
var cc_cvv = cc_container.find(':input[id*="edit-cc-cvv"]');
var apikey ="";
if(drupalSettings.uc_stripe) {
 apikey = drupalSettings.uc_stripe.publishable_key;
 Stripe.setPublishableKey(apikey);
}
//alert(apikey);
 // eslint-disable-line no-undef
$("[name='stripe_token']").val('default');
$('span#stripe-nojs-warning').parent().hide();
submitButton.attr('disabled', false).removeClass('is-disabled');
cc_num.removeAttr('name').removeAttr('disabled');
cc_cvv.removeAttr('name').removeAttr('disabled');
$('#edit-cc-number').removeClass('form-disabled');
var cc_val_val = cc_num.val();
if (cc_val_val && cc_val_val.indexOf('Last 4')) {
        cc_num.val('');
      }

submitButton.click(function (e) {
  //alert('HII');
  cc_container = $('.payment-details-stripe-gateway');
  cc_num = cc_container.find(':input[id*="edit-cc-number"]');
  cc_cvv = cc_container.find(':input[id*="edit-cc-cvv"]');

var tokenField = $("#edit-panes-payment-details-stripe-token");
  if (!cc_container.length || !tokenField.length || tokenField.val().indexOf('tok_') === 0) {
  return true;
  }
  if (tokenField.val() === 'requested') {
     return false; // Prevent any submit processing until token is received
  }
    tokenField.val('requested');
try {

      Stripe.createToken({ // eslint-disable-line no-undef
        number: cc_num.val(),
        cvc: cc_cvv.val(),
        exp_month: $(':input[name="cc_exp_month"]').val(),
        exp_year: $(':input[name="cc_exp_year"]').val(),
  }, function (status, response) {

  if (response.error) {

    // Show the errors on the form
    $('.uc-stripe-messages')
      .removeClass('hidden')
      .text(response.error.message);
    $('#edit-stripe-messages').val(response.error.message);

    // Make the fields visible again for retry
    cc_num
      .css('visibility', 'visible')
      .val('')
      .attr('name', 'cc_number');
    cc_cvv
      .css('visibility', 'visible')
      .val('')
      .attr('name', 'cc_cvv');


    // Turn off the throbber
    $('.ubercart-throbber').remove();
    // Remove the bogus copy of the submit button added in uc_cart.js ucSubmitOrderThrobber
    submitButton.next().remove();
    // And show the hidden original button which has the behavior attached to it.
    submitButton.show();

    //tokenField.val('default'); // Make sure token field set back to default

  } else {
    // token contains id, last4, and card type
    var token = response.id;
    alert(token);
    // Insert the token into the form so it gets submitted to the server
    tokenField.val(token);

    // Since we're now submitting, make sure that uc_credit doesn't
    // find values it objects to; after "fixing" set the name back on the
    // form element.
    cc_num
      .css('visibility', 'hidden')
      .val('555555555555' + response.card.last4)
      .attr('name', 'cc_number');
    cc_cvv
      .css('visibility', 'hidden')
      .val('999')
      .attr('name', 'cc_cvv');

    // now actually submit to Drupal. The only "real" things going
    // are the token and the expiration date.
    submitButton.click();
  }

});
} catch (e) {
$('.uc-stripe-messages')
  .removeClass('hidden')
  .text(e.message);
$('#edit-stripe-messages').val(e.message);
}

// Prevent processing until we get the token back
return false;
}); 
}
};
//--------------------------------------------------------------------------------------
// hide link functionality...------------------------------------------------------------
setTimeout(function () {
 jQuery('a[href].no-link').each(function () {
      var href = this.href;

      jQuery(this).removeAttr('href').css('cursor', 'pointer').click(function () {
          if (href.toLowerCase().indexOf("#") >= 0) {

          } else {
              window.open(href, '_blank');
          }
      });
  });
}, 500);
//------------------------------------------------------------------------------------
jQuery('.actions-suffix a').each(function() {
jQuery(this).attr( '/register-account');
    });
//----------------------------------------------------------------------------------
jQuery('#edit-panes-billing-zone').change(function(){ 
  var selected = jQuery("select#edit-panes-billing-zone option").filter(":selected").val();
  var myarray = [];
   myarray.push("AZ","CA", "HI" , "NV");
    if( jQuery.inArray(selected, myarray) == -1 ) {      
       jQuery('#myModal').show();

    }
  }); 

});

function getInfo( id ,id2,oredr_id) {
var base_url =  window.location.origin;
var url = base_url + '/';
  $.ajax({
          url: url+"checktotal",
          method: "GET",
          data: {
        'value1': id,
        'value2': oredr_id,
        'value3': id2
    },
          headers: {
            "Content-Type": "application/hal+json"
          },
          //data: 'lid='+lid,
             success: function(data, status, xhr) {

              if(data != "false"){
                jQuery.removeCookie('cookieData'+oredr_id);
                jQuery.removeCookie("cookieData1");
                jQuery('.disform-div').show();

              }
            }
        });
}

function gettexonomy(val) {
var base_url =  window.location.origin;
var url = base_url + '/';
  $.ajax({
          url: url+"checktexo",
          method: "GET",
          data: {
        'value1': val,
    },
          headers: {
            "Content-Type": "application/hal+json"
          },
             success: function(data, status, xhr) {
       if(data != "false"){
      jQuery('#edit-field-hourly-rate-0-value').val(data);

              }
            }
        });
}
function getclassroom(location1){
var base_url =  window.location.origin;
var url = base_url + '/';
  $.ajax({
          url: url+"getlocation",
          method: "GET",
          data: {
        'value1': location1,
    },
          headers: {
            "Content-Type": "application/hal+json"
          },
             success: function(data, status, xhr) {
   jQuery('[name=field_classroom_reference_target_id]').empty();
   if(data != "false"){
        //jQuery('[name=field_classroom_reference_target_id_1]').empty();
        // jQuery('[name=field_classroom_reference_target_id_1]').trigger("chosen:updated");


      var data = data.opt;
     // alert(data);
      $("[name=field_classroom_reference_target_id]").append("<option value >--Show All--</option>").attr("selected","selected");

      for (var j = 0; j < data.length; j++){
      jQuery('[name=field_classroom_reference_target_id]').append("<option value=" +data[j].nid+ ">" +data[j].name+ "</option>");
      // jQuery('select[name^="field_classroom_reference_target_id_1"] option[value]').attr("selected","selected");
      // jQuery('[name=field_classroom_reference_target_id_1]').trigger("chosen:updated");
                }

             }
          }

     });
  }
function getlocation(location) {
var base_url =  window.location.origin;
var url = base_url + '/';
  $.ajax({
          url: url+"getlocation",
          method: "GET",
          data: {
        'value1': location,
    },
          headers: {
            "Content-Type": "application/hal+json"
          },
             success: function(data, status, xhr) {
   jQuery('[name=field_classroom_reference_target_id_1]').empty();
   if(data != "false"){
        //jQuery('[name=field_classroom_reference_target_id_1]').empty();
        // jQuery('[name=field_classroom_reference_target_id_1]').trigger("chosen:updated");
       
   
      var data = data.opt;
      $("[name=field_classroom_reference_target_id_1]").append("<option value >--Show All--</option>").attr("selected","selected");

      for (var j = 0; j < data.length; j++){       
      jQuery('[name=field_classroom_reference_target_id_1]').append("<option value=" +data[j].nid+ ">" +data[j].name+ "</option>");
      // jQuery('select[name^="field_classroom_reference_target_id_1"] option[value]').attr("selected","selected");
      // jQuery('[name=field_classroom_reference_target_id_1]').trigger("chosen:updated");
                }

             }
          }
        
     });

}

})(jQuery); 

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('?'),
    sParameterName,
    i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
    return false;
};


function openCity(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}
