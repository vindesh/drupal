(function ($, Drupal, drupalSettings) {
  'use strict';
  var executed = false;
  //Drupal.behaviors.studentMultiSearchBehavior = {
    //attach: function (context, settings) {
  $( document ).ready(function() {
      var chartLegends = [];
      var param = [];
      var url='';

      $("#multi_students_graduates_search").once("studentMultiSearchBehavior").on("click", function (event) {
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

        jQuery.map( param, function( item, index ) {
            url += '&'+item;
        });


        var arg = "?" + url;
        var dict = {};

        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/" + window.location.pathname + arg;
        //console.log(refresh, '----form url');
        window.location.href = refresh;

      });
/**
  * After page load get parameeter from URL and assign value to fields
  *
  */

      /*School year load on page load...*/
      var urlParam = parseQueryStringToDictionarySG(window.location.search);
      // if (!executed) {
      //   executed = true;
        var school_year = decodeURIComponent(urlParam["school_year"]);
        multiSearchSchoolYear(school_year);
        var school_type = decodeURIComponent(urlParam["school_type"]);
        multiSearchSchoolType(school_type);


        var agency = [school_type];
        for (let i = 1; i <= 4; i++) {
          if( decodeURIComponent(urlParam["school_type"+i]) !== 'undefined'){
            agency.push(decodeURIComponent(urlParam["school_type"+i]));
          }
        };

        if(urlParam){

          //multiSearchSchool(school_type);
          jQuery.map( agency, function( item, index ) {
            let id='';
            id = (index === 0)?'':index;

            let school = decodeURIComponent(urlParam["school"+id]);
            let program_study = decodeURIComponent(urlParam["program_study"+id]);
            let degree = decodeURIComponent(urlParam["degree"+id]);

            var chartLegendItem = (school+ ' - ' + program_study + ' - ' + degree)
            chartLegends.push(chartLegendItem)

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
        }//end of if
      //}  //end of parent if




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
        let searchUrl = "/students-graduates-count/school-type";
        //let searchUrl = "/api-main-outcomes/school-type";
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
              schoolAutoComplete( $(this), data );
  	            /*$(this).autocomplete({
  	              source: data,
  	              minLength: 1,
  	              select: function (event, ui) {
  	                console.log("multi-searchProgramType1");
  	                console.log(ui.item.value);
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
            "/students-graduates-count/program-study?searchTerm=" +
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
          url: "/students-graduates-count/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school),
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
          .find(".graph-container__sorting .toggleDrilldown").prop('checked', false);
        $(this)
          .parents(".graph-container")
          .find(".graph-container__sorting .toggleDrilldown").prop('disabled', false);
      });

     function generateJsonData(ele, countEle, drillDownName) {
        var data = [];
        var drillDownData = [];

        var params = new URL(document.location).searchParams;
        var searchIndex = 0;

        // var chartLegends = ['School/Program 1', 'School/Program 2', 'School/Program 3', 'School/Program 4', 'School/Program 5'];
        $("#studentGraphData " + ele).each(function (i) {
          var item;
          /* var itemVal = parseInt($(this).find(countEle).text()); */
          //console.log(".multiSearch-"+i +' '+countEle);
          var itemVal = $(".multiSearch-"+i).find(countEle).text();
          //console.log(itemVal, 'itemValqq');
          //console.log($(".multiSearch-"+i).find(countEle).text(), 'item value');
          if (itemVal == -1 || itemVal == '') {
            item = null;
          } else {
            //console.log(itemVal, 'itemVal_2');
            item = parseInt(itemVal);
          }
          //console.log(item, 'itemValqqss');
          var itemObj = {
            color: '#4472c4',
            name: chartLegends[i],
            data: [{
              name: "drilldownRace", drilldown: true, x: i, y: item
            }]
          }
          data.push(itemObj);
          drillDownData.push(item);
        });
        //console.log(data, '-----data');
        //console.log(drillDownData, '-----drillDownData');
        return {
          dataPoints: data,
          legends: chartLegends,
          drillDownData: drillDownData,
        };
      }
      if ($("#studentGraphData").children().length > 0) {
        $(".graph-container").css({ display: "block" });
        /* Generate gender-all and race-all data */
        var studentEnrolledDataMultiSearch = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-list .gender-All.race-All .students-count-enrolled span",
          "drilldownRace"
        );

        var studentGraduatedDataMultiSearch = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-list .gender-All.race-All .students-count-graduated span",
          "drilldownRace"
        );

        /* Generate Drilldown Data */
        function generateDrilldownData(countEle) {
          var parentClass = ".students-count-list";
          var drillDownData = [];
          var dataLabels = ['All','Asian','Black','White','Other','Male','Female'];
          var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
          var i;
          for (i = 0; i<drillDownCombination.length; i++ ) {
            var data = new generateJsonData(
              parentClass + " " + drillDownCombination[i],
              parentClass + " " + drillDownCombination[i] + " " + countEle,
              "drilldownRace"
            );
            var obj = {[dataLabels[i]]: data.drillDownData};
            drillDownData.push(obj);
          }
          return drillDownData;
        }


        /* Graph Init */

        /* Enrolled */
        renderGraph(
          studentEnrolledDataMultiSearch,
          "#studentsEnrolledGraphMultiSearch",
          generateDrilldownData(".students-count-enrolled span")
        );

        /* Graduated */
        renderGraph(
          studentGraduatedDataMultiSearch,
          "#studentsGraduatesGraphMultiSearch",
          generateDrilldownData(".students-count-graduated span")
        );
      }

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
    function toggleGraph(chart) {
      $(".toggleDrilldown").on('change', function() {
          var dataType = $(this).attr("name");
          var chartID = parseInt($(this).attr("id"));
          var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
          $(".toggleDrilldown").prop('checked', false);
          $(".toggleDrilldown").prop('disabled', false);
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

          if (chartID == 0) {
            Highcharts.charts[1].drillUp();
          }

          if (chartID == 1) {
            Highcharts.charts[0].drillUp();
          }

          filterDrilldownData(chart, dataType);
      });
    }

      function renderGraph(chartData, eleID, drillDownData) {
        var dataType = 'gender';
        Highcharts.setOptions({
          lang: {
            noData: "No data to display",
            loading: "Loading...",
            thousandsSep: ','
          },
        });
        $(eleID).highcharts({
          chart: {
              type: 'column',
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
                      this.options.legend["enabled"] = true;
                      $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                      $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                      $(".toggleDrilldown").first().prop('checked', false);
                      $(".toggleDrilldown").first().prop('disabled', false);
                      $(".toggleDrilldown").first().prop('checked', true);
                      $(".toggleDrilldown").first().prop('disabled', true);
                      $(".graph-container__filters-dropdown").hide();
                      $(".toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                      $(".toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);



                      if (!e.seriesOptions) {

                          function renderDrillDownSeriesData(data, type) {
                              var i;
                              var colors = ['#4472c4', '#ed7d31', '#b6b6b6', '#70ad47', '#264478', '#ed7d31', '#b6b6b6']
                              if (type == 'race') {
                                  var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                              } else {
                                  var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                              }

                              for (i = 0; i < data.length; i++) {
                                var obj = {
                                  drilldownRace: {
                                    id: labels[i],
                                    name: labels[i],
                                    color: colors[i],
                                    data: data[i][labels[i]],
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
                        dataType = 'gender';

                        filterEle.hide();

                        $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").each(function() {
                            $(this).prop('checked', false);
                            $(this).prop('disabled', false);
                        });
                      this.options.legend["enabled"] = false;
                  },
              },

          },
          yAxis: {
              labels: {
                  enabled: true,
              },
          },
          xAxis: {
              type: "category",
              categories: chartData.legends,
              margin: 15,
          },
          tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<b>{point.series.name} <b><br>{point.y:,.0f}',
          },
          title: {
              text: "",
          },

          legend: {
              enabled: false,
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
          "/students-graduates-counts";
        window.location.href = refresh;
      });
      $("#singleYear").click(function(event) {
        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/multiple-students-graduates-counts";
        window.location.href = refresh;
      });

  });
/*@end of drupal behaviors.... */
   // },
  //};
})(jQuery, Drupal, drupalSettings);
