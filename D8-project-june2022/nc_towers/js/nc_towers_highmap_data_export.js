(function ($, Drupal, drupalSettings) {
    //Wages, Enrollment & Employment Outcomes
    var table = $('#search-data-export').DataTable( {
        autoWidth: false,
        paging: false,
        searching: false,
        ordering:  true,
        info: false,
        dom: 'Bfrtip',
        buttons: ['csv', 'excel']
    } );
    table.buttons( 0, null ).containers().appendTo( '.graph-container .table-view-container .search-data-export-button' );
    //Multi-search Enrollment 2nd Table
    var tableEmp = $('.table-view-container1 #search-data-export').DataTable( {
        autoWidth: false,
        paging: false,
        searching: false,
        ordering:  true,
        info: false,
        dom: 'Bfrtip',
        buttons: ['csv', 'excel']
    } );
    tableEmp.buttons( 0, null ).containers().appendTo( '.graph-container .table-view-container1 .search-data-export-button' );
    
})(jQuery, Drupal, drupalSettings);