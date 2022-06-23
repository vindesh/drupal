(function ($, Drupal, drupalSettings) {
  'use strict';
  //Drupal.behaviors.studentMultiSearchBehavior = {
    //attach: function (context, settings) {
    $( document ).ready(function() {   
      var isFieldEmpty = true;
      var param = [];
      var url=''
      $("#multiple_main_outcomes_search").once("studentMultiSearchBehavior").on("click", function (event) {
        event.preventDefault();
        let schoolType = $("#edit-school-type-multi").val();
        let school = [];
        let programStudy = [];
        let degree = [];
        let schoolYear = $("#edit-school-year-multi").val();


        let flag = false;
        $('.homepage_error_message').hide();
        (schoolYear == 'Select')?flag = true:'';
        (schoolType == 'Select')?flag = true:'';

        var field_count = 0;
        jQuery('input[name^=school]').each(function(i){
          field_count = (field_count==0)? '' : field_count;
          if(jQuery(this).val() != ''){
            param.push( 'school_type'+field_count+'='+ encodeURIComponent( schoolType ) );
            param.push( 'school_year'+field_count+'='+ encodeURIComponent( schoolYear ) );
            param.push( 'school'+field_count+'='+ encodeURIComponent(jQuery(this).val() ) );
            field_count++;
          }
        });
        field_count = 0;
        jQuery('input[name^=program_study]').each(function(i){
          field_count = (field_count==0)? '' : field_count;
          if(jQuery(this).val() != ''){
            param.push( 'program_study'+ field_count +'='+ encodeURIComponent(jQuery(this).val() ) );
            field_count++;
          }
        });
        field_count = 0;
        jQuery('select[name^=degree]').each(function(i){
          field_count = (field_count==0)? '' : field_count;
          if(jQuery(this).val() != '' && jQuery(this).val() != null){
            param.push( 'degree'+ field_count +'='+ encodeURIComponent(jQuery(this).val() ) );
            field_count++;
          }
        });

        $.map( param, function( item, index ) {
            url += '&'+item;
        });

        var arg = "?" + url;
        var dict = {};

        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/" + window.location.pathname + arg;
        window.location.href = refresh;

      });

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
        * After page load get parameeter from URL and assign value to fields
        *
        */
      /*School year load on page load...*/
      var urlParam = parseQueryStringToDictionarySG(window.location.search);
      var school_year = decodeURIComponent(urlParam["school_year"]);

      multiSearchSchoolYear(school_year);

      var school_type = decodeURIComponent(urlParam["school_type"]);
      multiSearchSchoolType(school_type);

      //  Form Validation
      searchFormValidation();

      // Search form Validation
      function enableSubmitBtn(isFieldEmpty) {
          if (isFieldEmpty) {
          $('.search-program-form-action .submit-btn').attr('disabled', 'disabled').addClass('btn-disabled');
        } else {
          $('.search-program-form-action .submit-btn').removeAttr('disabled', 'disabled').removeClass('btn-disabled');
        }
      }
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

      var agency = [school_type];
      for (let i = 1; i <= 4; i++) {
        if( decodeURIComponent(urlParam["school_type"+i]) !== 'undefined'){
          agency.push(decodeURIComponent(urlParam["school_type"+i]));
        }
      };

      if(urlParam){
        multiSearchSchool(school_type);
        jQuery.map( agency, function( item, index ) {
          let id='';
          id = (index === 0)?'':index;

          let school = decodeURIComponent(urlParam["school"+id]);
          let program_study = decodeURIComponent(urlParam["program_study"+id]);
          let degree = decodeURIComponent(urlParam["degree"+id]);

          if(school_type !== 'undefined' && school !== 'undefined'){
            multiSearchSchool(school_type, school, index);
          }
          if(school !== 'undefined' && program_study !== 'undefined'){
            multiSearchProgramType(school, program_study, $('#edit-program-study-'+index) );
          }

          if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined'){
            multiSearchDegree(program_study,degree, school, $('#edit-degree-'+index));
          }
        });
      }

      /* Multi Search */
      function toggleAddButton(visibleEle) {
        if(visibleEle < 4) {
          $(".search-program-add-search").attr('disabled', false).removeClass("btn-disabled");
        }
        else {
          $(".search-program-add-search").attr('disabled', true).addClass("btn-disabled");
        }
      }

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

      $("#edit-school-type-multi").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
        e.preventDefault();
        var searchValue = $(this).val();
        clearField('school');
        clearField('program_study');
        clearField('degree', 'select');
        multiSearchSchool(searchValue);
      })));
      $("input[name^=school]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
        e.preventDefault();
        var searchValue = $(this).val();
        let currentEleRef = $(this).parents('.search-program-form').find('input[name^=program_study]');
        currentEleRef.val('')
        multiSearchProgramType(searchValue, '', currentEleRef);
      })));

      $("input[name^=program_study]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
        var searchValue = $(this).val();
        var school = $(this).parents('.search-program-form').find('input[name^=school]').val();
        var currentEleRef = $(this).parents('.search-program-form').find('select[name^=degree]');

        multiSearchDegree(searchValue,'',school, currentEleRef);
      })));

      function multiSearchSchoolType(school_type){
          if(typeof school_type == 'undefined' || school_type == ''){
              school_type = '';
          }
          let searchUrl = "/api-main-outcomes/school-type";
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
      function multiSearchSchool(searchTerm, school, eleID) {
        if (typeof school == "undefined" || school == "") {
          school = "";
        }

        $.ajax({
          method: "POST",
          url:
            "/api-main-outcomes/school?searchTerm=" +
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
              schoolAutoComplete( $(this), data );
                if(school){
                  $(this).val(school);
                  $(this).attr("searchTerm",school);
                }
              });
          }else{

            schoolAutoComplete( $('#edit-school-'+eleID), data );
            $('#edit-school-'+eleID).val(school);
            $('#edit-school-'+eleID).attr("searchTerm",school);
          }
          },
        });
      }

      function schoolAutoComplete(object, data){

        object.autocomplete({
          source: data,
          minLength: 1,
          select: function (event, ui) {
            multiSearchProgramType(ui.item.value, '', object.next());
            object.attr("searchTerm", ui.item.value);
            object.next().click();
          },
        });

      }

      function multiSearchProgramType(searchTerm, programStudy, currentEleRef) {
        if (typeof programStudy == "undefined" || programStudy == "") {
          programStudy = "";
        }

        $.ajax({
          method: "POST",
          url:
            "/api-main-outcomes/program-study?searchTerm=" +
            encodeURIComponent(searchTerm),
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
                multiSearchDegree(ui.item.value, "", searchTerm, degreeRef);
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

      function multiSearchDegree(searchTerm, degree, school, currentEleRef){
        if(typeof degree == 'undefined' || degree == ''){
          degree='';
        }

        $.ajax({
          method: "POST",
          url: "/api-main-outcomes/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school),
          success: function (data) {
            (currentEleRef)?currentEleRef.empty():$('select[name^=degree]').empty();
            data.forEach(function (item,index){
              currentEleRef.append('<option value="'+item+'" >'+item+'</option>');
            })
            if(degree)  currentEleRef.val(degree);
          }
        });
      }

      function clearField(fieldName, fieldType ){
        if( typeof fieldType === 'undefined'){
          fieldType='input';
        }
      	$(fieldType+'[name^='+fieldName+']').each(function(){
      		$(this).empty();$(this).val('');
      	});
      }

      function multiSearchSchoolYear(year){
        if(typeof year == 'undefined' || year == ''){
            year='';
        }
        $.ajax({
          method: "POST",
          url: "/api-main-outcomes/school-year",
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
      /* Parse QueryString using String Splitting */
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

        /*
        ** GRAPH - Rendering
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
              y1 = urlParam['school'];
              y12 = urlParam['program_study'];
              y12 = urlParam['program_study'];
              y13 = urlParam['degree'];

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
              y2 = urlParam['school1'];
              y22 = urlParam['program_study1'];
              y23 = urlParam['degree1'];
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
              y3 = urlParam['school2'];
              y33 = urlParam['program_study2'];
              y34 = urlParam['degree2'];

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
              y4 = urlParam['school3'];
              y44 = urlParam['program_study3'];
              y45 = urlParam['degree3'];

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
              y5 = urlParam['school4'];
              y55 = urlParam['program_study4'];
              y56 = urlParam['degree4'];

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

        // Toggle Graph and Table View
        $(".graph-view-action")
        .once("studentSearchBehavior")
        .on("click", function () {
          $(this)
            .parents(".graph-container")
            .find(".graph-view-container")
            .show();
          $(this)
            .parents(".graph-container")
            .find(".table-view-container")
            .hide();
        });

        $(".table-view-action")
        .once("studentSearchBehavior")
        .on("click", function () {
          $(this)
            .parents(".graph-container")
            .find(".graph-view-container")
            .hide();
          $(this)
            .parents(".graph-container")
            .find(".table-view-container")
            .show();
          $(this)
            .parents(".graph-container")
            .find(".graph-container__sorting .graph-container__filters-dropdown")
            .hide();
          $(this)
            .parents(".graph-container")
            .find(".graph-container__sorting .enrolledOutcomes .toggleDrilldown").prop('checked', false);
          $(this)
            .parents(".graph-container")
            .find(".graph-container__sorting .enrolledOutcomes .toggleDrilldown").prop('disabled', false);
        });

        if ($("#outcomesGraphData").children().length > 0) {
          $(".graph-container").css({ display: "block" });
        }
        /* Generate gender-all and race-all data */

        var studentEnrolledDataMultiSearch = new generateJsonData(
          ".main-outcomes-list .gender-All.race-All",
          ".main-outcomes-enrolled span",
          "drilldownRace"
        );

        /* Generate Drilldown Data */
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

        /* Enrolled */
        renderGraph(
          studentEnrolledDataMultiSearch,
          "#studentsEnrolledGraphMultiSearch",
          generateDrilldownData(".main-outcomes-enrolled span")
        );


        /* Filters */
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

        function toggleCheckbox(el, val) {
          el.each(function() {
              $(this).prop('checked', val);
          })
        }

        var isDrilledup = true;
        var isCustomDrillDown = true;
        function toggleGraph(chart) {
          $(".enrolledOutcomes .toggleDrilldown").on('change', function() {
              isCustomDrillDown = false;
              var dataType = $(this).attr("name");
              var chartID = parseInt($(this).attr("id"));
              var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
              $(".enrolledOutcomes .toggleDrilldown").prop('checked', false);
              $(".enrolledOutcomes .toggleDrilldown").prop('disabled', false);
              $(this).prop('checked', true);
              $(this).prop('disabled', true);
              $(".graph-container__filters-dropdown").hide(0, function() {
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

        function renderGraph(chartData, eleID, drillDownData) {
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
                  },
                  drilldown: function(e) {

                    var containerId = this.container.id;
                    var drilldowns = [];
                    var chart = this;
                    var series = [];
                    isDrilledup = false;

                    $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                    if(isCustomDrillDown) {
                      $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                      $(".enrolledOutcomes .toggleDrilldown").first().prop('checked', false);
                      $(".enrolledOutcomes .toggleDrilldown").first().prop('disabled', false);
                      $(".enrolledOutcomes .toggleDrilldown").first().prop('checked', true);
                      $(".enrolledOutcomes .toggleDrilldown").first().prop('disabled', true);
                      $(".graph-container__filters-dropdown").hide();
                      $(".enrolledOutcomes .toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                      $(".enrolledOutcomes .toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
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
                      toggleGraph(chart);
                      renderDrillDownSeriesData(drillDownData, dataType);
                      filterDrilldownData(chart, dataType);
                    }
                  },
                  drillup: function(e) {
                      var containerId = this.container.id;
                      var filterEle = $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown");
                        isDrilledup = true;
                        isCustomDrillDown = true;
                        dataType = 'gender';

                        filterEle.hide();

                        $("#" + containerId).parents(".graph-container").find(".enrolledOutcomes .toggleDrilldown").each(function() {
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
          $(".graph-container__filters-dropdown ul li input").each(
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
          "/enrollment-outcomes";
        window.location.href = refresh;
      });
      $("#singleYear").click(function(event) {
        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/multiple-enrollment-outcomes";
        window.location.href = refresh;
      });

      /*@end of drupal behaviors.... */
    })
   // },
  //};
})(jQuery, Drupal, drupalSettings);
