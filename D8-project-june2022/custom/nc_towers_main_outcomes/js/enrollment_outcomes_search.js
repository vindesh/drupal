(function ($, Drupal, drupalSettings) {
  $( document ).ready(function() {
    /**
     * Global Var - To Check if Field is Empty
     */
    var isFieldEmpty = true;

    /** Init. Display Loader On Page Load*/
    $('.chart-tabs-container .nc-tab-item:not(.isDisabled)').on("click", function (event) {
      event.preventDefault();
      showLoader();
    });

    /**
     * Get URL's Param and Pass to the Search Fields
     */
    var urlParam = parseQueryStringToDictionaryMO(window.location.search);
    var urlParamArr = [];
    if(urlParam['param']){
      urlParamArr = urlParam['param'].split("|");
    }
    var school_type = decodeURIComponent(urlParamArr[0]);
    searchSchoolType(school_type);
    var school_year = decodeURIComponent(urlParamArr[4]);
    searchSchoolYear(school_year);
    if(urlParam){
      var urlParamArr2 = [];
      if(urlParam["param"]){
        urlParamArr2 = urlParam["param"].split("|");
      }
      let school = decodeURIComponent(urlParamArr2[1]);
      let program_study = decodeURIComponent(urlParamArr2[2]);
      let degree = decodeURIComponent(urlParamArr2[3]);

      $("#edit-school").empty();
      $("#edit-program-study").empty();
      $("#edit-degree").empty();
      $("#edit-school-year").empty();

      if(school_type !== 'undefined' && school !== 'undefined'){
        searchSchool(school_type,school);
        $("#edit-school").val(school);
      }
      if(school !== 'undefined' && program_study !== 'undefined' && school_type !== 'undefined'){
        searchProgramType(school,program_study,school_type);
        $("#edit-program-study").val(program_study);
      }
      if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined' && school_type !== 'undefined'){
        searchDegree(program_study,degree,school,school_type);
        $("#edit-degree").val(degree);
      }
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
     * Search Click Handler
     */
      $("#main_outcomes_search").on("click", function (event) {
        event.preventDefault();
        /** Init. Display Loader */
        showLoader();

        let schoolType = $("#edit-school-type").val();
        let schoolYear = $("#edit-school-year").val();
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
        var dict = {};
        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/" + window.location.pathname + arg;
        window.location.href = refresh;
      });

    /**
     * Init. Form Validation
     */
    searchFormValidation();

    /**
     * Filter/Drilldown on student data table
     * @param {*} gender 
     * @param {*} race 
     * @param {*} isStudentEnrolled 
     */  
    function filterTableData(gender, race, isFirstTable, year=''){
      var filterTableData, tableID;
      tableID = '#filterTableData';
      if ( $.fn.dataTable.isDataTable( tableID ) ) {
        filterTableData = $(tableID).DataTable( {
              destroy: true,
              paging: false,
              ordering:  true,
              info: false,
              dom: 'lrtip',
              buttons: ['csv', 'excel'],
              searchPanes: {
                  preSelect: [
                      {
                        rows: gender,
                        column: 1
                      },
                      {
                        rows: race,
                        column: 2
                      },
                      {
                        rows: year,
                        column: 0
                      }
                  ]
              },
              columnDefs: [
                {
                  searchPanes: {
                    show: true
                  },
                  targets: [2]
                }
              ],
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
                preSelect: [
                    {
                        rows: gender,
                        column: 1
                    },
                    {
                        rows: race,
                        column: 2
                    },
                    {
                      rows: year,
                      column: 0
                    }
                ]
            },
            columnDefs: [
              {
                searchPanes: {
                  show: true
                },
                targets: [2]
              }
            ],
        });
      }    
      if(isFirstTable)  
        filterTableData.buttons( 0, null ).containers().appendTo( '.graph-container .table-view-container .search-data-export-button' );
      else
        filterTableData.buttons( 0, null ).containers().appendTo( '.graph-container .table-view-container .search-data-export-button' );
    }
    /**
     * Variable define and Init filterStudentTableData
     */
    var gender = ['All', 'Male', 'Female'];
    var race = ["All", "Asian", "Black", "White", "Other"];
    filterTableData([gender[0]], [race[0]], true);
    /* End of filterStudentTableData */


      /**
     * Generate JSON Data for Graph
     */
      function generateJsonData(ele, countEle, drillDownName) {
        var totalData = [];
        var afterYearsArr = [];
        var drillDownData = [];

        var d1 = [];
        var y1 = '';
        var y12 = '';
        var d2 = [];
        var y2 = '';
        var y22 = '';
        var d3 = [];
        var y3 = '';
        var y33 = '';
        var d4 = [];
        var y4 = '';
        var y44 = '';
        var d5 = [];
        var y5 = '';
        var y55 = '';

        var afterYearsArr = ['After 1 Year','After 2 Years','After 3 Years','After 4 Years','After 5 Years'];
        $("#outcomesGraphData " + ele).each(function (i) {
          if($(this).parents(".yearItem-0").length){
            var itemVal1 = $.trim($(this).parents(".yearItem-0").find(countEle).text());
            y12 = parseInt($.trim($(this).parents(".yearItem-0").find(".main-outcomes-school-year").text()));
            y1 = y12-1;


            if(itemVal1 != '' && d1.length <5){
              var dr1 = {
                name: 'drilldownRace',
                id: y1+"-"+y12+" Cohort",
                y: parseFloat(itemVal1),
                drilldown: true
              };
              d1.push(dr1);
            }


              var dr11 = {
                name: y1+"-"+y12+" Cohort",
                y: parseFloat(itemVal1),
              };
              drillDownData.push(dr11);

          }
          if($(this).parents(".yearItem-1").length){
            var itemVal2 = $.trim($(this).parents(".yearItem-1").find(countEle).text());
            y22 = parseInt($.trim($(this).parents(".yearItem-1").find(".main-outcomes-school-year").text()));
            y2 = y22-1;
            if(itemVal2 != '' && d2.length <5){
              var dr2 = {
                name: 'drilldownRace',
                id: y2+"-"+y22+" Cohort",
                y: parseFloat(itemVal2),
                drilldown: true,
              };
              d2.push(dr2);
            }


              var dr12 = {
                name: y2+"-"+y22+" Cohort",
                y: parseFloat(itemVal2),
              };
              drillDownData.push(dr12);

          }
          if($(this).parents(".yearItem-2").length){
            var itemVal3 = $.trim($(this).parents(".yearItem-2").find(countEle).text());
            y33 = parseInt($.trim($(this).parents(".yearItem-2").find(".main-outcomes-school-year").text()));
            y3 = y33-1;
            if(itemVal3 != '' && d3.length <5){
              var dr3 = {
                name: 'drilldownRace',
                id: y3+"-"+y33+" Cohort",
                y: parseFloat(itemVal3),
                drilldown: true,
              };
              d3.push(dr3);
            }


              var dr13 = {
                name: y3+"-"+y33+" Cohort",
                y: parseFloat(itemVal3),
              };
              drillDownData.push(dr13);

          }
          if($(this).parents(".yearItem-3").length){
            var itemVal4 = $.trim($(this).parents(".yearItem-3").find(countEle).text());
            y44 = parseInt($.trim($(this).parents(".yearItem-3").find(".main-outcomes-school-year").text()));
            y4 = y44-1;
            if(itemVal4 != '' && d4.length <5){
              var dr4 = {
                name: 'drilldownRace',
                id: y4+"-"+y44+" Cohort",
                y: parseFloat(itemVal4),
                drilldown: true,
              };
              d4.push(dr4);
            }


              var dr14 = {
                name: y4+"-"+y44+" Cohort",
                y: parseFloat(itemVal4),
              };
              drillDownData.push(dr14);

          }
          if($(this).parents(".yearItem-4").length){
            var itemVal5 = $.trim($(this).parents(".yearItem-4").find(countEle).text());
            y55 = parseInt($.trim($(this).parents(".yearItem-4").find(".main-outcomes-school-year").text()));
            y5 = y55-1;
            if(itemVal5 != '' && d5.length <5){
              var dr5 = {
                name: 'drilldownRace',
                id: y5+"-"+y55+" Cohort",
                y: parseFloat(itemVal5),
                drilldown: true,
              };
              d5.push(dr5);
            }

              var dr15 = {
                name: y5+"-"+y55+" Cohort",
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
            name: y1+"-"+y12+" Cohort",
            data: d1
          };
          totalData.push(dataObj1);
        }
        if(d2 != ''){
          var dataObj2 = {
            name: y2+"-"+y22+" Cohort",
            data: d2
          };
          totalData.push(dataObj2);
        }
        if(d3 != ''){
          var dataObj3 = {
            name: y3+"-"+y33+" Cohort",
            data: d3
          };
          totalData.push(dataObj3);
        }
        if(d4 != ''){
          var dataObj4 = {
            name: y4+"-"+y44+" Cohort",
            data: d4
          };
          totalData.push(dataObj4);
        }
        if(d5 != ''){
          var dataObj5 = {
            name: y5+"-"+y55+" Cohort",
            data: d5
          };
          totalData.push(dataObj5);
        }
        return {
          dataPoints: totalData,
          afterYears: afterYearsArr,
          drillDownData: drillDownData,
        };
      }

    /**
     * Toggle Graph and Table View
     */
    $(".graph-view-action").once("studentSearchBehavior").on("click", function () {
      $(this).parents(".graph-container").find(".graph-view-container").show();
      $(this).parents(".graph-container").find(".table-view-container").hide();
    });

    $(".table-view-action").once("studentSearchBehavior").on("click", function () {
      $(this).parents(".graph-container").find(".graph-view-container").hide();
      $(this).parents(".graph-container").find(".table-view-container").show();
      $(this).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown").hide();
      $(this).parents(".graph-container").find(".enrollmentChartFirst .toggleDrilldown").prop('checked', false);
      $(this).parents(".graph-container").find(".enrollmentChartFirst .toggleDrilldown").prop('disabled', false);
    });

    /**
     * Graph Init
     */
    if ($("#outcomesGraphData").children().length > 0) {
      $(".graph-container").css({ display: "block" });

      // Generate - Gender All and Race All - Data
      var studentEnrolledData = new generateJsonData(
        ".main-outcomes-list .gender-All.race-All",
        ".main-outcomes-enrolled span",
        "drilldownRace"
      );

      // DrillDown - Students Enrolled - Race Data
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

      // Render Chart
      renderStudentGraph(
        studentEnrolledData,
        "#outcomesEnrolledGraph",
        generateDrilldownData(".main-outcomes-enrolled span"),
        true
      );

    }

    /**
     * Search - Start Over
     */
    $("#main_outcomes_restart").on("click", function () {
      let refresh =
        window.location.protocol +
        "//" +
        window.location.host +
        "/" +
        window.location.pathname;
      window.location.href = refresh;
    });

    
    /**
     * OnChange Handler - School type
     */
    $("#edit-school-type").on("change",($.debounce(500, function(e) {
      var searchValue = $(this).val();
      $("#edit-school").empty();
      $("#edit-program-study").empty();
      $("#edit-degree").empty();
      $("#edit-year").empty();
      searchSchool(searchValue);
    })));

    /**
     * Method - Enable Submit Button
     */
    function enableSubmitBtn(isFieldEmpty) {
      if (isFieldEmpty) {
        $('.search-program-form-action .submit-btn').attr('disabled', 'disabled').addClass('btn-disabled');
      } else {
        $('.search-program-form-action .submit-btn').removeAttr('disabled', 'disabled').removeClass('btn-disabled');
      }
    }

    /**
     * Method - Check If Field is Empty
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
     * Graph - Filter Data
     */
    function filterDrilldownData(chart, dataType) { console.log(chart.title.textStr, '---chart');
      var genders = ["Male", "Female"];
      var races = ["Asian", "Black", "White", "Other"];
      var a = chart.series;
      var year = chart.title.textStr.split('-');
      if (dataType == 'race') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                  p.hide();
              } else {
                  p.show();
              }

          });

          filterTableData([gender[0]], race, false, year[0]);//Race - filter
      }

      if (dataType == 'gender') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.id == races[0] || p.userOptions.id == races[1] || p.userOptions.id == races[2] || p.userOptions.id == races[3]) {
                  p.hide();
              } else {
                  p.show();
              }

          });

          filterTableData(gender, [race[0]], true, year[0]);//Gender - filter
      }
    }


    /**
     * Toggle Gender and Race
     */
    var isDrilledup = true;
    var isCustomDrillDown = true;
    function toggleGraph(chart) {
      $(".enrollmentChartFirst .toggleDrilldown").off('change');
      $(".enrollmentChartFirst .toggleDrilldown").on('change', function() {
          isCustomDrillDown = false;
          var dataType = $(this).attr("name");
          var chartID = parseInt($(this).attr("id"));
          var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
          $(".enrollmentChartFirst .toggleDrilldown").prop('checked', false);
          $(".enrollmentChartFirst .toggleDrilldown").prop('disabled', false);
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
          
          filterDrilldownData(chart, dataType);
      });
    }

    /**
     * Method - Toggle Filter's Checkboxes
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
    function renderStudentGraph(chartData, eleID, drillDownData, isFirstGraph) {
      var dataType = 'gender';
      $(eleID).highcharts(
        {
          chart: {
            type: "line",
            lang: {
              noData: "No data to display",
              loading: "Loading...",
            },
            events: {
              load: function(event) {
                toggleGraph(this);
                pageScroll(isFirstGraph);
              },
              drilldown: function (e) {
                var containerId = this.container.id;
                var drilldowns = [];
                var chart = this;
                var series = [];
                isDrilledup = false;
                if(isCustomDrillDown) {
                  $('.graph-container').find(".graph-container__filters-dropdown").hide();
                  $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                  $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                  $(chart.renderTo).closest('.graph-container').find(".graph-container__filters-dropdown").first().show();
                  $(chart.renderTo).closest('.graph-container').find(".graph-container__filters").first().find(".graph-container__filters-dropdown input").prop('checked', true);
                  $(chart.renderTo).closest('.graph-container').find(".toggleDrilldown").first().prop('checked', true);
                }

                //filterTableData(gender, [race[0]], isFirstGraph);//Gender - filter

                if (!e.seriesOptions) {
                  chart.setTitle({ text: e.point.options.id });
                  function renderDrillDownSeriesData(data, type) {
                    var i;
                    var colors = ['#4472c4', '#ed7d31', '#b6b6b6', '#70ad47', '#264478', '#ed7d31', '#b6b6b6'];
                    if(type == 'race') {
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
                        if(value.name == $.trim(e.point.options.id)) {
                          dara2[i][labels[i]].push(value);
                        }
                      });
                      var obj = {
                        drilldownRace: {
                          id: labels[i],
                          //id: '2003-2004 Cohort',
                          name: labels[i],
                          data: dara2[i][labels[i]],
                          color: colors[i],

                          //data: [6,8],
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
                    for(i=0; i < drilldowns.length; i++) {
                      series.push(drilldowns[i][e.point.name]);
                    }
                    return series;
                  }

                  function addDrilldownSeries() {
                    var i;
                    for(i=0; i < drilldowns.length; i++) {
                      chart.addSingleSeriesAsDrilldown(e.point, series[i]);
                    }
                  }

                  function drillUpChart() {
                    var chartIDs = ["studentsEnrolledGraph", "studentsGraduatesGraph"];
                    var i;
                    for(i=0; i< Highcharts.charts.length; i++) {
                      if(chart.renderTo.id !== Highcharts.charts[i].renderTo.id) {
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
                  var filterEle = $("#" + containerId).closest(".graph-container").find(".enrollmentChartFirst .graph-container__filters-dropdown");
                  isDrilledup = true;
                  isCustomDrillDown = true;
                  dataType = 'gender';
                  filterEle.hide();
                  $("#" + containerId).closest(".graph-container").find(".enrollmentChartFirst .toggleDrilldown").each(function () {
  
                    $(this).prop('checked', false);
                        $(this).prop('disabled', false);
                    });
                  //this.options.legend["enabled"] = false;
                  this.setTitle({ text: '' });
                  filterTableData([gender[0]], [race[0]], isFirstGraph);//Filter - G-All, R-All
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
            labels: {
              useHTML: true,
            },
            categories: chartData.afterYears,
          },
          tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<b>{point.series.name} <b><br>{point.y}%',
          },
          title: {
            text: '',
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
          series: chartData.dataPoints,
          drilldown: {
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
            },
        },
        },
        function (chart) {
          $(".enrollmentChartFirst .graph-container__filters-dropdown ul li input").each(
            function () {
              $(this).on('change', function () {
                var id = $(this).attr("id");
                series = chart.get(id);
                if (series = chart.get(id)) {
                  series.setVisible(!series.visible);
                
                  /**
                   * Table data sort according to chart drilldonw
                   */
                  var type = $(this).parents(".graph-container__filters").find(".toggleDrilldown").attr("name");
                  if(type == 'gender'){
                    var genderFilter = gender;
                    (genderFilter.indexOf(id) == -1) ? genderFilter.push(id) : genderFilter.splice($.inArray(id, genderFilter), 1);
                    if(genderFilter.length==0) genderFilter = ['none'];
                    filterTableData(genderFilter, [race[0]], isFirstGraph);//Gender filter
                  }else{
                    var raceFilter = race;
                    (raceFilter.indexOf(id) == -1) ? raceFilter.push(id) : raceFilter.splice($.inArray(id, raceFilter), 1);
                    if(raceFilter.length==0) raceFilter = ['none'];
                    filterTableData([gender[0]], raceFilter, isFirstGraph);//Race filter
                  }
                }
              });

            }
          );
        }
      );
    }

    /**
     * Method - Search Type
     */
    function searchSchoolType(school_type){
      if(typeof school_type == 'undefined' || school_type == ''){
        school_type = '';
      }
      let searchUrl = "/students-graduates-count/school-type";
      $.ajax({
          method: "POST",
          url: searchUrl,
          success: function (data) {
            $("#edit-school-type").empty();
            $("#edit-school-type").append('<option value="Select" selected>Please Select</option>');
            data.forEach(function (item,index){
              $("#edit-school-type").append('<option value="'+item+'" >'+item+'</option>');
            })

            if(school_type !== 'undefined') {
              $("#edit-school-type").val(school_type);
            }
          }
      });
    }

    /**
     * Method - Search School
     */
    function searchSchool(searchTerm, school) {
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
          $("#edit-school").empty();
          $("#edit-school").autocomplete({
            source: data,
            minLength: 1,
            select: function (event, ui) {
              searchProgramType(ui.item.value, '', searchTerm);
              $("#edit-school").attr("searchTerm", ui.item.value);
            },
          });
        },
      });
    }

    /**
     * Method - Search Program Type
     */
    function searchProgramType(searchTerm, programStudy, schoolType) {
      if (typeof programStudy == "undefined" || programStudy == "") {
        programStudy = "";
      }

      $.ajax({
        method: "POST",
        url:
          "/students-graduates-count/program-study?searchTerm=" +
          encodeURIComponent(searchTerm)+"&schoolType="+ encodeURIComponent(schoolType),
        success: function (data) {
          var data = $.map(data, function (value, key) {
            value = value.replace(/&amp;/g, "&");
            return {
              label: value,
              value: value,
            };
          });
          $("#edit-program-study").empty();
          $("#edit-program-study").autocomplete({
            source: data,
            minLength: 1,
            select: function (event, ui) {
              searchDegree(ui.item.value, "", searchTerm, schoolType);
              $("#edit-program-study").attr("searchTerm", ui.item.value);
            },
          });
          // $('#edit-program-study').autocomplete("search");
        },
      });
    }

    /**
     * Method - Search Degre 
     */
    function searchDegree(searchTerm, degree, school, schoolType){
      if(typeof degree == 'undefined' || degree == ''){
        degree='';
      }

      $.ajax({
        method: "POST",
        url: "/students-graduates-count/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school)+"&schoolType="+ encodeURIComponent(schoolType),
        success: function (data) {
          $("#edit-degree").empty();
          data.forEach(function (item,index){
            $("#edit-degree").append('<option value="'+item+'" >'+item+'</option>');
          })
          isFieldEmpty = false;
          enableSubmitBtn(isFieldEmpty);
          if(degree)$("#edit-degree").val(degree);
        }
      });
    }

    /**
     * Method - Search School Year
     */
    function searchSchoolYear(year){
      if(typeof year == 'undefined' || year == ''){
        year='';
      }

      $.ajax({
        method: "POST",
        url: "/students-graduates-count/school-year",
        success: function (data) {
          $("#edit-school-year").empty();
          $("#edit-school-year").append('<option value="Select" selected>Please Select</option>');
          data.forEach(function (item,index){
            $("#edit-school-year").append('<option value="'+item+'" >'+item+'</option>');
          })
          if(year !== 'undefined') $("#edit-school-year").val(year);
        }
      });
    }

    /**
     * Method - Parse QueryString using String Splitting
     */
    function parseQueryStringToDictionaryMO(queryString) {
      var dictionary = {};

      // remove the '?' from the beginning of the
      // if it exists
      if (queryString.indexOf('?') === 0) {
        queryString = queryString.substr(1);
      }

      // Step 1: separate out each key/value pair
      var parts = queryString.split("&");
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        // Step 2: Split Key/Value pair
        var keyValuePair = p.split("=");
        // Step 3: Add Key/Value pair to Dictionary object
        if (
          keyValuePair[0] !== "" &&
          typeof keyValuePair[0] !== "undefined" &&
          keyValuePair[1] !== "" &&
          typeof keyValuePair[1] !== "undefined"
        ) {
          var key = keyValuePair[0];
          var value = keyValuePair[1].split("#");

          // decode URI encoded string
          value[0] = decodeURIComponent(value[0]);
          let val = value[0].replace(/\+/g, " ");

          dictionary[key] = val;
        }
      }

      // Step 4: Return Dictionary Object
      return dictionary;
    }

    /**
     * Click Handler for Single and Multisearch redirections
     */
    $("#multipleYears").click(function(event) {
      let refresh = window.location.protocol +
        "//" + window.location.host +
        "/enrollment-outcomes-search";
      window.location.href = refresh;
    });
    $("#singleYear").click(function(event) {
      let refresh = window.location.protocol +
        "//" + window.location.host +
        "/multiple-enrollment-outcomes-search";
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
