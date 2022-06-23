(function ($, Drupal, drupalSettings) {
  'use strict';
  $( document ).ready(function() {
    /** Init. Display Loader On Page Load*/
    $('.chart-tabs-container .nc-tab-item:not(.isDisabled)').on("click", function (event) {
      event.preventDefault();
      showLoader();
    });

    var isFieldEmpty = true;
    var param = [];
    var url=''
   
    /**
    * After page load get parameeter from URL and assign value to fields
    */
    var urlParam = parseQueryStringToDictionarySG(window.location.search);
    var urlParamArr = [];
    if(urlParam['param']){
      urlParamArr = urlParam['param'].split("|");
    }
    var school_year = decodeURIComponent(urlParamArr[4]);
    multiSearchSchoolYear(school_year);
    var school_type = decodeURIComponent(urlParamArr[0]);
    multiSearchSchoolType(school_type);

    var agency = [school_type];
    for (let i = 1; i <= 4; i++) {
      if( decodeURIComponent(urlParam["param"+i]) !== 'undefined'){
        var urlParamArr1 = urlParam["param"+i].split("|");
        agency.push(decodeURIComponent(urlParamArr1[0]));
      }
    };

    if(urlParam){
      var urlParamArr2 = [];
      multiSearchSchool(school_type);
      jQuery.map( agency, function( item, index ) {
        let id='';
        id = (index === 0)?'':index;
        if(urlParam["param"+id]){
          urlParamArr2 = urlParam["param"+id].split("|");
        }
        let school = decodeURIComponent(urlParamArr2[1]);
        let program_study = decodeURIComponent(urlParamArr2[2]);
        let degree = decodeURIComponent(urlParamArr2[3]);

        if(school_type !== 'undefined' && school !== 'undefined'){
          multiSearchSchool(school_type, school, index);
        }
        if(school !== 'undefined' && program_study !== 'undefined'){
          multiSearchProgramType(school, program_study, $('#edit-program-study-'+index),school_type );
        }

        if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined'){
          multiSearchDegree(program_study,degree, school, $('#edit-degree-'+index),school_type);
        }
      });
    }

    /**
     * Method - Param Concat
     */
    function paramConcat(count, school, year, rowIndex){
      var param = '';
      var paramNumber = '';
      $('.filter'+rowIndex+'.search-program-form .field-container .form-control').each(function(){
        if($(this).val()){ 
        param+='|'+encodeURIComponent($(this).val())
        }
      })
      if(param){
        if(count != 1){
          paramNumber = count -1;
        }
        return 'param'+paramNumber+"="+encodeURIComponent(school)+param+"|"+encodeURIComponent(year);
      } else{
        return false;
      }
    }

    /**
     * Search - Click Handler
     */
    $("#multiple_main_outcomes_search").once("studentMultiSearchBehavior").on("click", function (event) {
      event.preventDefault();

      /** Init. Display Loader*/
      showLoader();

      let schoolType = $("#edit-school-type-multi").val();
      let schoolYear = $("#edit-school-year-multi").val();
  
      var url=''
      let flag = false;
      $('.homepage_error_message').hide();
      (schoolYear == 'Select')?flag = true:'';
      (schoolType == 'Select')?flag = true:'';
        
      $('.filter-group:visible').each(function(a){
        var rowIndex = parseInt($(this).attr('data-index'));
        var i = a+1;
        var filterParams = paramConcat(i, schoolType, schoolYear, rowIndex)
        if(filterParams != false) {
          if(i == 1){
            url += filterParams
          }else{
            url += '&'+filterParams;
          }
        }
      });
      var arg = "?" + url;
      let refresh = window.location.protocol +
        "//" + window.location.host +
        "/" + window.location.pathname + arg;
      window.location.href = refresh;

    });

    /**
     * Search Start Over - Click Handler
     */
    $("#multiple_main_outcomes_restart").on("click", function () {
      let refresh =
        window.location.protocol +
        "//" +
        window.location.host +
        "/" +
        window.location.pathname;
      window.location.href = refresh;
    });

    /**
     * Init. Search Form Valdiation
     */
    searchFormValidation();
    

    /**
     * Method - Enable/Disable Submit Button
     */
    function enableSubmitBtn(isFieldEmpty) {
        if (isFieldEmpty) {
        $('.search-program-form-action .submit-btn').attr('disabled', 'disabled').addClass('btn-disabled');
      } else {
        $('.search-program-form-action .submit-btn').removeAttr('disabled', 'disabled').removeClass('btn-disabled');
      }
    }

    /**
     * Method - Check if form is Empty
     */
    function isFormfieldEmpty(fieldVal) {
      isFieldEmpty = false;
      $(".search-program-form .form-control").each(function() {
        // debugger
        if($(this).val() == '' || $(this).val() == undefined || $(this).val() == 'Please Select' || fieldVal.val() == 'Please Select' || fieldVal.val() == 'Select' || fieldVal.val() == '' || fieldVal.val() == undefined) {
          isFieldEmpty = true;
        }
      });
      enableSubmitBtn(isFieldEmpty);
    }

    /**
     * Method - Search Form Validation
     */
    function searchFormValidation() {
      $(".search-program-form .form-control").on('change', function() {
        var $that = $(this);
        isFormfieldEmpty($that);
      });

      $(".search-program-form input.form-control").on('keyup', function() {
        var $that = $(this);
        isFormfieldEmpty($that);
      });
    }

    /**
     * Method - Enable/Disable Add Button
     */
    function toggleAddButton(visibleEle) {
      if(visibleEle < 4) {
        $(".search-program-add-search").attr('disabled', false).removeClass("btn-disabled");
      }
      else {
        $(".search-program-add-search").attr('disabled', true).addClass("btn-disabled");
      }
    }

    /**
     * Add Form Fields Row
     */
    if($(".search-program-add-search").length > 0) {
      var searchField = $(".multisearch-form");
      var index = 0;
      var idIndex = 0;
      var ids = [];
      var rowRemoved = true;

      /*Shown search row according to get param from URL*/
      $(".multisearch-form").each(function(ind, el) {
        if (index < agency.length-1) {
          if(rowRemoved) {
            $(searchField[index]).css({'display': 'flex'});
            index++;
          }else {
            $(searchField[ids[idIndex]]).css({'display': 'flex'});
            idIndex++;
          }
          /* toggle add button*/
          var visibleEle = $(".multisearch-form:visible").length;
          toggleAddButton(visibleEle);
        }
      });

      $(".search-program-add-search").on("click", function () {
        if(rowRemoved) {
          $(searchField[index]).css({'display': 'flex'});
          index++;
        }else {
          $(searchField[ids[idIndex]]).css({'display': 'flex'});
          idIndex++;
        }
        /* toggle add button*/
        var visibleEle = $(".multisearch-form:visible").length;
        toggleAddButton(visibleEle);
      });

      $(".remove-search-fields").on("click", function () {
        $(this).parent(".multisearch-form").css({'display': 'none'});
        ids = [];
        $(".multisearch-form:hidden").each(function(e, i){
          var id = $(this).find('.remove-search-fields').attr('data-row');
          $(this).find('input').val('');
          $(this).find('select').empty();
          ids.push(parseInt(id));
        });
        rowRemoved = false;
        idIndex = 0;
        /* toggle add button */
        var visibleEle = $(".multisearch-form:visible").length;
        toggleAddButton(visibleEle);
      });
    }

    /**
     * School Type - OnChange Handler
     */
    $("#edit-school-type-multi").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
      e.preventDefault();
      var searchValue = $(this).val();
      clearField('school');
      clearField('program_study');
      clearField('degree', 'select');
      multiSearchSchool(searchValue);
    })));

    /**
     * School - OnChange Handler
     */
    $("input[name^=school]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
      e.preventDefault();
      var searchValue = $(this).val();
      let currentEleRef = $(this).parents('.search-program-form').find('input[name^=program_study]');
      currentEleRef.val('')
      let currentschoolType = $('#edit-school-type-multi').val();
      multiSearchProgramType(searchValue, '', currentEleRef, currentschoolType);
    })));

    /**
     * Program - OnChange Handler
     */
    $("input[name^=program_study]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
      var searchValue = $(this).val();
      var school = $(this).parents('.search-program-form').find('input[name^=school]').val();
      var currentEleRef = $(this).parents('.search-program-form').find('select[name^=degree]');
      let currentschoolType = $('#edit-school-type-multi').val();
      multiSearchDegree(searchValue,'',school, currentEleRef, currentschoolType);
    })));

    /**
     * Method - Search School Type
     */
    function multiSearchSchoolType(school_type){
        if(typeof school_type == 'undefined' || school_type == ''){
            school_type = '';
        }
        let searchUrl = "/students-graduates-count/school-type";
        $.ajax({
          method: "POST",
          url: searchUrl,
          success: function (data) {
            $("#edit-school-type-multi").empty().append('<option value="Select">Please Select</option>');
            data.forEach(function (item,index){
              $("#edit-school-type-multi").append('<option value="'+item+'" >'+item+'</option>');
            })
            if(school_type !== 'undefined') {
              $("#edit-school-type-multi").val(school_type);
            }
          }
      });
    }

    /**
     * Method - Search School
     */
    function multiSearchSchool(searchTerm, school, eleID) {
      if (typeof school == "undefined" || school == "") {
        school = "";
      }

      $.ajax({
        method: "POST",
        url:
          "/students-graduates-count/school?searchTerm=" +
          encodeURIComponent(searchTerm),
        success: function (data) {
          var data = $.map(data, function (value, key) {
            value = value.replace(/&amp;/g, "&");
            return {
              label: value,
              value: value,
            };
          });

        if(typeof eleID === 'undefined' || eleID === ''){

          $('input[name^=school]').each(function(){
            $(this).next('input[name^=program_study]').empty();
            schoolAutoComplete( $(this), data, searchTerm );
              /*$(this).autocomplete({
                source: data,
                minLength: 1,
                select: function (event, ui) {
                  multiSearchProgramType(ui.item.value);
                  $(this).attr("searchTerm", ui.item.value);
                },
              });*/
              if(school){
                $(this).val(school);
                $(this).attr("searchTerm",school);
              }
            });
        }else{

          schoolAutoComplete( $('#edit-school-'+eleID), data, searchTerm );
          $('#edit-school-'+eleID).val(school);
          $('#edit-school-'+eleID).attr("searchTerm",school);
        }
        },
      });
    }

    /**
     * Method - School Auto Complete
     */
    function schoolAutoComplete(object, data, schoolType) {
      object.autocomplete({
        source: data,
        minLength: 1,
        select: function (event, ui) {
          multiSearchProgramType(ui.item.value, '', object.next(), schoolType);
          object.attr("searchTerm", ui.item.value);
          object.next().click();
        },
      });

    }

    /**
     * Method - Search Program
     */
    function multiSearchProgramType(searchTerm, programStudy, currentEleRef, schoolType) {
      if (typeof programStudy == "undefined" || programStudy == "") {
        programStudy = "";
      }

      $.ajax({
        method: "POST",
        url:
          "/students-graduates-count/program-study?searchTerm=" +
          encodeURIComponent(searchTerm)+"&schoolType=" +
        encodeURIComponent(schoolType),
        success: function (data) {
          var data = $.map(data, function (value, key) {
            value = value.replace(/&amp;/g, "&");
            return {
              label: value,
              value: value,
            };
          });

          let degreeRef = currentEleRef.parents('.search-program-form').find('input[name^=degree]');
          degreeRef.empty();
          currentEleRef.autocomplete({
            source: data,
            minLength: 1,
            select: function (event, ui) {
              multiSearchDegree(ui.item.value, "", searchTerm, degreeRef, schoolType);
              currentEleRef.attr("searchTerm", ui.item.value);
            },
            close: function(event, ui) {
              event.preventDefault();
              currentEleRef.change();
            }
          });
          currentEleRef.val(programStudy)
        },
      });
    }

    /**
     * Method - Search Degree
     */
    function multiSearchDegree(searchTerm, degree, school, currentEleRef, schoolType) {
      if(typeof degree == 'undefined' || degree == ''){
        degree='';
      }

      $.ajax({
        method: "POST",
        url: "/students-graduates-count/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school) +"&schoolType="+ encodeURIComponent(schoolType),
        success: function (data) {
          (currentEleRef)?currentEleRef.empty():$('select[name^=degree]').empty();
          data.forEach(function (item,index){
            currentEleRef.append('<option value="'+item+'" >'+item+'</option>');
          })
          if(degree)  currentEleRef.val(degree);
        }
      });
    }

    /**
     * Method - Clear Form Fields
     */
    function clearField(fieldName, fieldType ){
      if( typeof fieldType === 'undefined'){
        fieldType='input';
      }
      $(fieldType+'[name^='+fieldName+']').each(function(){
        $(this).empty();$(this).val('');
      });
    }

    /**
     * Method - Search SChool Year
     */
    function multiSearchSchoolYear(year) {
      if(typeof year == 'undefined' || year == ''){
          year='';
      }
      $.ajax({
        method: "POST",
        url: "/students-graduates-count/school-year",
        success: function (data) {
          $("#edit-school-year-multi").empty().append('<option value="Select">Please Select</option>');
          data.forEach(function (item,index){
            $("#edit-school-year-multi").append('<option value="'+item+'" >'+item+'</option>');
          })
          if(year !== 'undefined') {
            jQuery("#edit-school-year-multi").val(year);
          }
        }
      });
    }

    /**
     * Parse QueryString using String Splitting
     */
    function parseQueryStringToDictionarySG(queryString) {
      var dictionary = {};

      /* remove the '?' from the beginning of the
      if it exists */
      if (queryString.indexOf('?') === 0) {
        queryString = queryString.substr(1);
      }

      /* Step 1: separate out each key/value pair */
      var parts = queryString.split("&");
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        /* Step 2: Split Key/Value pair */
        var keyValuePair = p.split("=");
        /* Step 3: Add Key/Value pair to Dictionary object */
        if (
          keyValuePair[0] !== "" &&
          typeof keyValuePair[0] !== "undefined" &&
          keyValuePair[1] !== "" &&
          typeof keyValuePair[1] !== "undefined"
        ) {
          var key = keyValuePair[0];
          var value = keyValuePair[1].split("#");

          /* decode URI encoded string */
          value[0] = decodeURIComponent(value[0]);
          let val = value[0].replace(/\+/g, " ");

          dictionary[key] = val;
        }
      }

      /* Step 4: Return Dictionary Object */
      return dictionary;
    }


    /**
     * [drilldownTableData description]
     * @param  {[type]} gender  [Array of 'All', 'Male', 'Female']
     * @param  {[type]} race    [Array of "All", "Asian", "Black", "White", "Other"]
     * @param  {String} school  [Array of School]
     * @param  {String} program [Array of Program]
     * @param  {String} degree  [Array of Degree]
     * @return {[type]}         [Return filter data on table according to search param]
     */
    function drilldownTableData(gender, race, school='', program='', degree=''){
      var filterTableData, tableID;
      tableID = '#filterTableData';
      var preSelectRows = [
          {
            rows: school,
            column: 1
          },
          {
            rows: program,
            column: 2
          },
          {
            rows: degree,
            column: 3
          },
          {
            rows: gender,
            column: 4
          },
          {
            rows: race,
            column: 5
          },
      ];
      var columns = [
        {
          searchPanes: {
            show: true
          },
          targets: [1]
        },
        {
          searchPanes: {
            show: true
          },
          targets: [2]
        },
        {
          searchPanes: {
            show: true
          },
          targets: [3]
        },
        {
          searchPanes: {
            show: true
          },
          targets: [4]
        },
        {
          searchPanes: {
            show: true
          },
          targets: [5]
        },

        ] ;

      if ( $.fn.dataTable.isDataTable( tableID ) ) {
        filterTableData = $(tableID).DataTable( {
              destroy: true,
              paging: false,
              ordering:  true,
              info: false,
              dom: 'lrtip',
              buttons: ['csv', 'excel'],
              searchPanes: {
                  preSelect: preSelectRows
              },
              columnDefs: columns,
        });
      }else{
        filterTableData = $(tableID).DataTable( {
            paging: false,
            searchPane: false,
            ordering:  true,
            info: false,
            dom: 'lrtip',
            buttons: ['csv', 'excel'],
            searchPanes: {
              preSelect: preSelectRows
            },
            columnDefs: columns,
        });
      }

      filterTableData.buttons( 0, null ).containers().appendTo( '#empTableExportButton' );

    }
    /**
     * Variable define and Init drilldownTableData
     */
    var gender = ['All', 'Male', 'Female'];
    var race = ["All", "Asian", "Black", "White", "Other"];
    drilldownTableData([gender[0]], [race[0]]);
    /* End of drilldownTableData */


    /*
    ** Method - GRAPH - Rendering
    */
    function generateJsonData(ele, countEle, drillDownName) {
      var data = [];
      var drillDownData = [];

      var params = new URL(document.location).searchParams;
      var searchIndex = 0;
      var itemVal2 = 0;

      var totalData = [];
      var afterYearsArr = [];

      var d1 = [];
      var y1 = '';
      var y12 = '';
      var y13 = '';
      var d2 = [];
      var y2 = '';
      var y22 = '';
      var y23 = '';
      var d3 = [];
      var y3 = '';
      var y33 = '';
      var y34 = '';
      var d4 = [];
      var y4 = '';
      var y44 = '';
      var y45 = '';
      var d5 = [];
      var y5 = '';
      var y55 = '';
      var y56 = '';

      var chartLegends = ['School/Program 1', 'School/Program 2', 'School/Program 3', 'School/Program 4', 'School/Program 5'];
      var afterYearsArr = ['After 1 Year','After 2 Years','After 3 Years','After 4 Years','After 5 Years'];
      $("#outcomesGraphData " + ele).each(function (i, value) {
        if($(this).parents(".multiSearch-0").length){
          y1 = $(this).find(".main-outcomes-school").text().trim() 
          y12 = $(this).find(".main-outcomes-program").text().trim();
          y13 = $(this).find(".main-outcomes-degree").text().trim();

          var graduatedCount1 = $.trim($(this).parents(".multiSearch-0").find('.main-outcomes-graduated-count').text());
          var enrolledCount1 = $.trim($(this).parents(".multiSearch-0").find('.main-outcomes-enrolled-count').text());
          var itemVal1 = $.trim($(this).parents(".multiSearch-0").find(countEle).text());
          if (graduatedCount1 == -1 || enrolledCount1 == -1 || itemVal1 == '') {
            itemVal1 = null;
          }else {
            itemVal1 = parseFloat(itemVal1);
          }
          if(d1.length <5){
            var dr1 = {
              name: 'drilldownRace',
              drillDownName: y1+"/"+y12,
              id: y1+"/"+y12+"/"+y13,
              y: itemVal1,
              drilldown: true
            };
            d1.push(dr1);
          }
          var dr11 = {
            name: y1+"/"+y12,
            id: y1+"/"+y12+"/"+y13,
            y: itemVal1,
          };
          drillDownData.push(dr11);

        }

        if($(this).parents(".multiSearch-1").length){
          y2 = $(this).find(".main-outcomes-school").text().trim() 
          y22 = $(this).find(".main-outcomes-program").text().trim();
          y23 = $(this).find(".main-outcomes-degree").text().trim();
          var graduatedCount2 = $.trim($(this).parents(".multiSearch-1").find('.main-outcomes-graduated-count').text());
          var enrolledCount2 = $.trim($(this).parents(".multiSearch-1").find('.main-outcomes-enrolled-count').text());
          var itemVal2 = $.trim($(this).parents(".multiSearch-1").find(countEle).text());
          if (graduatedCount2 == -1 || enrolledCount2 == -1 || itemVal2 == '') {
            itemVal2 = null;
          }else {
            itemVal2 = parseFloat(itemVal2);
          }
          if(d2.length <5){
            var dr2 = {
              name: 'drilldownRace',
              drillDownName: y2+"/"+y22,
              id: y2+"/"+y22+"/"+y23,
              y: itemVal2,
              drilldown: true
            };
            d2.push(dr2);
          }
          var dr22 = {
            name: y2+"/"+y22,
            id: y2+"/"+y22+"/"+y23,
            y: itemVal2,
          };
          drillDownData.push(dr22);
        }

        if($(this).parents(".multiSearch-2").length){
          y3 = $(this).find(".main-outcomes-school").text().trim() 
          y33 = $(this).find(".main-outcomes-program").text().trim();
          y34 = $(this).find(".main-outcomes-degree").text().trim();

          var graduatedCount3 = $.trim($(this).parents(".multiSearch-2").find('.main-outcomes-graduated-count').text());
          var enrolledCount3 = $.trim($(this).parents(".multiSearch-2").find('.main-outcomes-enrolled-count').text());
          var itemVal3 = $.trim($(this).parents(".multiSearch-2").find(countEle).text());
          if (graduatedCount3 == -1 || enrolledCount3 == -1 || itemVal3 == '') {
            itemVal3 = null;
          }else {
            itemVal3 = parseFloat(itemVal3);
          }
          if(d3.length <5){
            var dr3 = {
              name: 'drilldownRace',
              drillDownName: y3+"/"+y33,
              id: y3+"/"+y33+"/"+y34,
              y: itemVal3,
              drilldown: true
            };
            d3.push(dr3);
          }

          var dr13 = {
            name: y3+"/"+y33,
            id: y3+"/"+y33+"/"+y34,
            y: parseFloat(itemVal3),
          };
          drillDownData.push(dr13);
        }

        if($(this).parents(".multiSearch-3").length){
          y4 = $(this).find(".main-outcomes-school").text().trim() 
          y44 = $(this).find(".main-outcomes-program").text().trim();
          y45 = $(this).find(".main-outcomes-degree").text().trim();

          var graduatedCount4 = $.trim($(this).parents(".multiSearch-3").find('.main-outcomes-graduated-count').text());
          var enrolledCount4 = $.trim($(this).parents(".multiSearch-3").find('.main-outcomes-enrolled-count').text());
          var itemVal4 = $.trim($(this).parents(".multiSearch-3").find(countEle).text());
          if (graduatedCount4 == -1 || enrolledCount4 == -1 || itemVal4 == '') {
            itemVal4 = null;
          }else {
            itemVal4 = parseFloat(itemVal4);
          }
          if(d4.length <5){
            var dr4 = {
              name: 'drilldownRace',
              drillDownName: y4+"/"+y44,
              id: y4+"/"+y44+"/"+y45,
              y: itemVal4,
              drilldown: true
            };
            d4.push(dr4);
          }

          var dr14 = {
            name: y4+"-"+y44,
            id: y4+"/"+y44+"/"+y45,
            y: parseFloat(itemVal4),
          };
          drillDownData.push(dr14);
        }

        if($(this).parents(".multiSearch-4").length){
          y5 = $(this).find(".main-outcomes-school").text().trim() 
          y55 = $(this).find(".main-outcomes-program").text().trim();
          y56 = $(this).find(".main-outcomes-degree").text().trim();

          var graduatedCount5 = $.trim($(this).parents(".multiSearch-4").find('.main-outcomes-graduated-count').text());
          var enrolledCount5 = $.trim($(this).parents(".multiSearch-4").find('.main-outcomes-enrolled-count').text());
          var itemVal5 = $.trim($(this).parents(".multiSearch-4").find(countEle).text());
          if (graduatedCount5 == -1 || enrolledCount5 == -1 || itemVal5 == '') {
            itemVal5 = null;
          }else {
            itemVal5 = parseFloat(itemVal5);
          }
          if(d5.length <5){
            var dr5 = {
              name: 'drilldownRace',
              drillDownName: y5+"/"+y55,
              id: y5+"/"+y55+"/"+y56,
              y: itemVal5,
              drilldown: true
            };
            d5.push(dr5);
          }

          var dr15 = {
            name: y5+"-"+y55,
            id: y5+"/"+y55+"/"+y56,
            y: parseFloat(itemVal5),
          };
          drillDownData.push(dr15);
        }

        // var ay = $.trim($(this).find(".main-outcomes-after-year").text());
        // if(afterYearsArr.indexOf(ay) === -1) {
        //   afterYearsArr.push(ay);
        // }
      });
      if(d1 != ''){
        var dataObj1 = {
          name: y1+"/"+y12,
          data: d1
        };
        totalData.push(dataObj1);
      }
      if(d2 != ''){
        var dataObj2 = {
          name: y2+"/"+y22,
          data: d2
        };
        totalData.push(dataObj2);
      }
      if(d3 != ''){
        var dataObj3 = {
          name: y3+"/"+y33,
          data: d3
        };
        totalData.push(dataObj3);
      }
      if(d4 != ''){
        var dataObj4 = {
          name: y4+"/"+y44,
          data: d4
        };
        totalData.push(dataObj4);
      }
      if(d5 != ''){
        var dataObj5 = {
          name: y5+"/"+y55,
          data: d5
        };
        totalData.push(dataObj5);
      }

      return {
        dataPoints: totalData,
        legends: afterYearsArr,
        drillDownData: drillDownData,
      };
    }

    /**
     * Click Handler - Toggle Graph and Table View
     */
    $(".graph-view-action").once("studentSearchBehavior").on("click", function () {
      $(this).parents(".graph-container").find(".graph-view-container").show();
      $(this).parents(".graph-container").find(".table-view-container").hide();
    });

    $(".table-view-action").once("studentSearchBehavior").on("click", function () {
      $(this).parents(".graph-container").find(".graph-view-container").hide();
      $(this).parents(".graph-container").find(".table-view-container").show();
      $(this).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown").hide();
      $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('checked', false);
      $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('disabled', false);
    });

    /**
     * Method - Generate Drilldown Data
     */
    function generateDrilldownData(countEle) {
      var parentClass = ".main-outcomes-list";
      var drillDownData = [];
      var dataLabels = ['All','Asian','Black','White','Other','Male','Female'];
      var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
      var i;
      for (i = 0; i<drillDownCombination.length; i++ ) {
        var data = new generateJsonData(
          parentClass + " " + drillDownCombination[i],
          countEle,
          "drilldownRace"
        );
        var obj = {[dataLabels[i]]: data.drillDownData};
        drillDownData.push(obj);
      }
      return drillDownData;
    }

    /**
     * Check if data exists
     */
    if ($("#outcomesGraphData").children().length > 0) {
      $(".graph-container").css({ display: "block" });
      /* Generate gender-all and race-all data */
      var studentEnrolledDataMultiSearch = new generateJsonData(".main-outcomes-list .gender-All.race-All", ".main-outcomes-enrolled span", "drilldownRace");
      /* Init. Graph */
      renderGraph(studentEnrolledDataMultiSearch, "#studentsEnrolledGraphMultiSearch", generateDrilldownData(".main-outcomes-enrolled span"), true);
    }
 
    /**
     * Method - Filter Race and Gender Data
     */
    function filterDrilldownData(chart, dataType) {
      var genders = ["Male", "Female"];
      var races = ["Asian", "Black", "White", "Other"];
      var a = chart.series;
      if (dataType == 'race') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                  p.hide();
              } else {
                  p.show();
              }

          });
      }

      if (dataType == 'gender') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.id == races[0] || p.userOptions.id == races[1] || p.userOptions.id == races[2] || p.userOptions.id == races[3]) {
                  p.hide();
              } else {
                  p.show();
              }

          });
      }
    }

    /**
     * Method - Toogle Race and Gender Graph
     */
    var isDrilledup = true;
    var isCustomDrillDown = true;
    function toggleGraph(chart) {
      $(".employmentOutcomes-filters .toggleDrilldown").off('change');
      $(".employmentOutcomes-filters .toggleDrilldown").on('change', function() {
          isCustomDrillDown = false;
          var dataType = $(this).attr("name");
          var chartID = parseInt($(this).attr("id"));
          var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
          $(".employmentOutcomes-filters .toggleDrilldown").prop('checked', false);
          $(".employmentOutcomes-filters .toggleDrilldown").prop('disabled', false);
          $(this).prop('checked', true);
          $(this).prop('disabled', true);
          $(".employmentOutcomes-filters .graph-container__filters-dropdown").hide(0, function() {
              toggleCheckbox(el, false);
          });
          $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show(0, function() {
              toggleCheckbox(el, true);
          });

          if (isDrilledup) {
            chart.series[0].points[0].doDrilldown();
          }
          
          // if (chartID == 0) {
          //   Highcharts.charts[1].drillUp();
          // }

          // if (chartID == 1) {
          //   Highcharts.charts[0].drillUp();
          // }

          filterDrilldownData(chart, dataType);
      });
    }

    /**
     * Method - Toggle Checkboxes
     */
    function toggleCheckbox(el, val) {
      el.each(function() {
          $(this).prop('checked', val);
      })
    }

    /**
     * Page Scroll
     */
     function pageScroll(isFirstGraph) {
      if(isFirstGraph) {
        setTimeout(function() {
          $('html, body').animate({
          scrollTop: $(".chart-tabs-container").offset().top - 20
          }, 800);
        }, 600);
      }
    }

    /**
     * Method - Render Graph
     */
    function renderGraph(chartData, eleID, drillDownData, isFirstGraph) {
      var dataType = 'gender';
      $(eleID).highcharts({
        chart: {
          type: 'line',
          lang: {
            noData: "No data to display",
            loading: "Loading...",
          },
          events: {
              load: function(event) {
                toggleGraph(this);
                pageScroll(isFirstGraph);
              },
              drilldown: function(e) {
                var containerId = this.container.id;
                var drilldowns = [];
                var chart = this;
                var series = [];
                isDrilledup = false;
                this.options.legend["enabled"] = true;

                if(isCustomDrillDown) {
                  $('.graph-container').find(".graph-container__filters-dropdown").hide();
                  $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                  $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                  $(chart.renderTo).closest('.graph-container').find(".graph-container__filters-dropdown").first().show();
                  $(chart.renderTo).closest('.graph-container').find(".graph-container__filters").first().find(".graph-container__filters-dropdown input").prop('checked', true);
                  $(chart.renderTo).closest('.graph-container').find(".toggleDrilldown").first().prop('checked', true);
                }

                if (!e.seriesOptions) {
                  chart.setTitle({ text: e.point.options.drillDownName });
                  function renderDrillDownSeriesData(data, type) {
                    var i;
                    var colors = ['#4472c4', '#ed7d31', '#b6b6b6', '#70ad47', '#264478', '#ed7d31', '#b6b6b6']
                    if (type == 'race') {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                    } else {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                    }

                    var dara2 = [];
                    for(i=0; i < data.length; i++) {
                      var data1 = data[i][labels[i]];
                      dara2[i] = [];
                      dara2[i][labels[i]] = [];
                      $.each(data1, function(key,value) {
                        if(value.id == $.trim(e.point.options.id)) {
                          dara2[i][labels[i]].push(value);
                        }
                      });
                      var obj = {
                        drilldownRace: {
                          id: labels[i],
                          name: labels[i],
                          data: dara2[i][labels[i]],
                          color: colors[i],
                        },
                      }
                      drilldowns.push(obj);
                    }

                    renderDrillDownSeries();
                    addDrilldownSeries();
                    chart.applyDrilldown();

                    return drilldowns;
                  }

                  function renderDrillDownSeries() {
                      var i;
                      for (i = 0; i < drilldowns.length; i++) {
                        series.push(drilldowns[i][e.point.name]);
                      }

                      return series;
                  }

                  function addDrilldownSeries() {
                    var i;
                    for (i = 0; i < drilldowns.length; i++) {
                        chart.addSingleSeriesAsDrilldown(e.point, series[i]);
                    }
                  }

                  function drillUpChart() {
                      var i;
                      for (i = 0; i < Highcharts.charts.length; i++) {
                          if (chart.renderTo.id !== Highcharts.charts[i].renderTo.id) {
                              Highcharts.charts[i].drillUp();
                          }
                      }
                  }

                  drillUpChart();
                  // toggleGraph(chart);
                  renderDrillDownSeriesData(drillDownData, dataType);
                  filterDrilldownData(chart, dataType);
                }
              },
              drillup: function(e) {
                  var containerId = this.container.id;
                  var filterEle = $("#" + containerId).closest(".graph-container").find(".employmentOutcomes-filters .graph-container__filters-dropdown");
                    isDrilledup = true;
                    isCustomDrillDown = true;
                    dataType = 'gender';

                    filterEle.hide();

                    $("#" + containerId).closest(".graph-container").find(".employmentOutcomes-filters .toggleDrilldown").each(function() {
                        $(this).prop('checked', false);
                        $(this).prop('disabled', false);
                    });
                  //this.options.legend["enabled"] = false;
                  this.setTitle({ text: '' });
              },
          },
        },
        yAxis: {
          title: {
            text: ''
          },
          labels: {
            format: '{value}%',
            enabled: true,
          },
        },
        xAxis: {
          type: "category",
          categories: chartData.legends,
        },
        tooltip: {
          useHTML: true,
          headerFormat: '',
          pointFormat: '<b>{point.series.name} <b><br>{point.y}%',
        },
        title: {
          text: "",
        },

        legend: {
          enabled: true,
        },

        plotOptions: {
          column: {
            grouping: true,
            stacking: 'normal'
          },
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: false,
            },
            events: {
              legendItemClick: function() {
                return false;
              }
            },
          },
        },

        drilldown: {
          series: [],
          breadcrumbs: {
            format: '< Back',
            buttonTheme: {
              fill: '#f7f7f7',
              padding: 8,
              stroke: '#cccccc',
              'stroke-width': 1
            },
            floating: false,
            position: {
                align: 'left'
            },
            showFullPath: false
          }
        },

        series: chartData.dataPoints,

    },
    function(chart) {
      $(".employmentOutcomes-filters .graph-container__filters-dropdown ul li input").each(
        function() {
          $(this).on('change', function() {
            var id = $(this).attr("id");
            var series = chart.get(id);
            if (series = chart.get(id)) {
              series.setVisible(!series.visible);
            }
          });
        }
      );
    }
);
    }

    /**
     * Click on radio button: redirect to specify path.
     */
    $("#multipleYears").click(function(event) {
      let refresh = window.location.protocol +
        "//" + window.location.host +
        "/employment-outcomes-search";
      window.location.href = refresh;
    });
    $("#singleYear").click(function(event) {
      let refresh = window.location.protocol +
        "//" + window.location.host +
        "/multiple-employment-outcomes-search";
      window.location.href = refresh;
    });
  });

   $(window).on("load", function() {
     setTimeout(hideLoader, 700);
   });

   /**
    * Display Loader
    */
    function showLoader() {
     var container = $(document.body);
     var loaderHTML = '<div class="ajax-loader-container"><div class="loader"></div><div class="loader-text">Searching through millions of records, just for you!</div></div>';
     container.append(loaderHTML);
   }

   /**
    * Hide Loader
    */
   function hideLoader() {
     $(".ajax-loader-container").remove();
   }
})(jQuery, Drupal, drupalSettings);
