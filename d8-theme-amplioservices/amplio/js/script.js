jQuery(document).ready(function() {

    //Dropdown on hover

    function mainDropdown() {

        if (jQuery(window).width() > 960) {

            jQuery('.main-nav [data-toggle="dropdown"]').bootstrapDropdownHover({

                clickBehavior: 'disable'

            });

        } else {

            jQuery('.main-nav [data-toggle="dropdown"]').bootstrapDropdownHover('destroy');

        }

    }



    jQuery(window).resize(mainDropdown);

    mainDropdown();

});