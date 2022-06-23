(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.studentSearchBehavior = {
    attach: function (context, settings) {

      /**
       * Filter/Drilldown on student data table
       * @param {*} gender 
       * @param {*} race 
       * @param {*} isStudentEnrolled 
       */  
      function filterStudentTableData(gender, race, isStudentEnrolled, year=''){
        var studentEnrolledTable, tableID;
        if(isStudentEnrolled){
          tableID = '#student-enrolled-search-data-export .student-enrolled-table table';
        }else{
          tableID = '#student-graduate-search-data-export .student-enrolled-table table';
        }
        var preSelectRows = [
          {
              rows: year,
              column: 0
          },
          {
              rows: gender,
              column: 1
          },
          {
              rows: race,
              column: 2
          }
        ];
        
        if ( $.fn.dataTable.isDataTable( tableID ) ) {
          studentEnrolledTable = $(tableID).DataTable( {
                destroy: true,
                paging: false,
                ordering:  true,
                info: false,
                dom: 'lrtip',
                buttons: ['csv', 'excel'],
                searchPanes: {
                    preSelect: preSelectRows,
                },
          });
        }else{
          studentEnrolledTable = $(tableID).DataTable( {
              paging: false,
              searchPane: false,
              ordering:  true,
              info: false,
              dom: 'lrtip',
              buttons: ['csv', 'excel'],
              searchPanes: {
                  preSelect: preSelectRows,
              },
          });
        }    
        if(isStudentEnrolled)  
          studentEnrolledTable.buttons( 0, null ).containers().appendTo( '#student-enrolled-search-data-export .search-data-export-button' );
        else
          studentEnrolledTable.buttons( 0, null ).containers().appendTo( '#student-graduate-search-data-export .search-data-export-button' );
      }
      /**
       * Variable define and Init filterStudentTableData
       */
      var gender = ['All', 'Male', 'Female'];
      var race = ["All", "Asian", "Black", "White", "Other"];
      filterStudentTableData([gender[0]], [race[0]], true);
      filterStudentTableData([gender[0]], [race[0]], false); 
      /* end of filterStudentTableData */


      /** Init. Display Loader On Page Load*/
      $('.chart-tabs-container .nc-tab-item:not(.isDisabled)').on("click", function (event) {
        event.preventDefault();
        showLoader();
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
      
      /**
     * Global Var - To Check if Field is Empty
     */
      var isFieldEmpty = true;
      window.config = {
        dataType: 'gender',
      };

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
          // $("#edit-school").attr("searchTerm",school);
        }
        if(school !== 'undefined' && program_study !== 'undefined' && school_type !== 'undefined'){
          searchProgramType(school,program_study,school_type);

          $("#edit-program-study").val(program_study);
          // $("#edit-program-study").attr("searchTerm",program_study);
        }
        if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined' && school_type !== 'undefined'){
          searchDegree(program_study,degree, school,school_type);

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
       * Search - Start Over - Click Handler
       */
      $("#students_graduates_restart").on("click", function () {
        let refresh =
          window.location.protocol +
          "//" +
          window.location.host +
          "/" +
          window.location.pathname;
        window.location.href = refresh;
      });

      /**
       * Search - Click Handler
       */

      $("#students_graduates_search").on("click", function (event) {
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
       * Multi-Search - Page Redirection
       */
      $("#multipleYears").click(function(event) {
        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/students-graduates-search";
        window.location.href = refresh;
      });

      /**
       * Single Search - Page Redirection 
       */
      $("#singleYear").click(function(event) {
        let refresh = window.location.protocol +
          "//" + window.location.host +
          "/multiple-students-graduates-search";
        window.location.href = refresh;
      });

      /**
       * Method - Get Dates
       */
      function getDatesArr(ele) {
        var data = [];
        var years = [];
        $("#studentGraphData " + ele).each(function (i) {
          var year = $(this).find(".students-count-year a").html();
          data.push(parseInt(year));
        });
        $.each(data, function (i, el) {
          if ($.inArray(el, years) === -1) years.push(el);
        });
        return years;
      }

      /**
       * Method - Generate JSON Data for Graph
       */
      function generateJsonData(ele, countEle, drillDownName) {
        var data = [];
        var yearsArr = [];
        var drillDownData = [];        
        $("#studentGraphData " + ele).each(function (i) {
          var item;
          var itemVal = parseInt($(this).find(countEle).text());
          if (itemVal == -1) {
            item = null;
          } else {
            item = itemVal;
          }
          var y = $(this).find(".students-count-year a").text();
          var itemObj = {
            y: item,
            drilldownName: drillDownName,
            drilldown: true,
            year: y
          };
          
          data.push(itemObj);
          yearsArr.push(y);
          drillDownData.push(item);
        });
        return {
          dataPoints: data,
          years: yearsArr,
          drillDownData: drillDownData,
        };
      }

      /**
       * Init. Form Validaton
       */
      searchFormValidation();

      /**
     * Toggle Graph and Table View - Click Handler
     */
      $(".graph-view-action", context).once("studentSearchBehavior").on("click", function () {
        $(this).parents(".graph-container").find(".graph-view-container").show();
        $(this).parents(".graph-container").find(".table-view-container").hide();
      });

      $(".table-view-action", context).once("studentSearchBehavior").on("click", function () {
        $(this).parents(".graph-container").find(".graph-view-container").hide();
        $(this).parents(".graph-container").find(".table-view-container").show();
        /*$(this).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown").hide();
        $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('checked', false);
        $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('disabled', false);*/
      });

      /**
      * Init. Generate JSON Data
      */
      if ($("#studentGraphData").children().length > 0) {
        $(".graph-container").css({ display: "block" });

        // Generate - Gender All and Race All - Data
        var studentEnrolledData = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );

        var studentGraduatedData = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-graduated span",
          "drilldownRace"
        );

        // DrillDown - Students Enrolled - Race Data
        var enrolledRaceAll = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledRaceAsian = new generateJsonData(
          ".students-count-list .gender-All.race-Asian",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledRaceBlack = new generateJsonData(
          ".students-count-list .gender-All.race-Black",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledRaceWhite = new generateJsonData(
          ".students-count-list .gender-All.race-White",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledRaceOther = new generateJsonData(
          ".students-count-list .gender-All.race-Other",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledGenderMaleRaceAll = new generateJsonData(
          ".students-count-list .gender-Male.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var enrolledGenderFemaleRaceAll = new generateJsonData(
          ".students-count-list .gender-Female.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );

        var drillDownEnrolledRaceData = [
            { All: enrolledRaceAll.drillDownData },
            { Asian: enrolledRaceAsian.drillDownData },
            { Black: enrolledRaceBlack.drillDownData },
            { White: enrolledRaceWhite.drillDownData },
            { Other: enrolledRaceOther.drillDownData },
            { Male: enrolledGenderMaleRaceAll.drillDownData },
            { Female: enrolledGenderFemaleRaceAll.drillDownData },
        ];

      /**
       * DrillDown - Students Graduated - Race Data
       */
        var graduatedRaceAll = new generateJsonData(
          ".students-count-list .gender-All.race-All",
          ".students-count-graduated span",
          "drilldownRace"
        );
        var graduatedRaceAsian = new generateJsonData(
          ".students-count-list .gender-All.race-Asian",
          ".students-count-graduated span",
          "drilldownRace"
        );
        var graduatedRaceBlack = new generateJsonData(
          ".students-count-list .gender-All.race-Black",
          ".students-count-graduated span",
          "drilldownRace"
        );
        var graduatedRaceWhite = new generateJsonData(
          ".students-count-list .gender-All.race-White",
          ".students-count-graduated span",
          "drilldownRace"
        );
        var graduatedRaceOther = new generateJsonData(
          ".students-count-list .gender-All.race-Other",
          ".students-count-graduated span",
          "drilldownRace"
        );
        var graduatedGenderMaleRaceAll = new generateJsonData(
          ".students-count-list .gender-Male.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );
        var graduatedGenderFemaleRaceAll = new generateJsonData(
          ".students-count-list .gender-Female.race-All",
          ".students-count-enrolled span",
          "drilldownRace"
        );

        var drillDownGraduatedRaceData = [
            { All: graduatedRaceAll.drillDownData },
            { Asian: graduatedRaceAsian.drillDownData },
            { Black: graduatedRaceBlack.drillDownData },
            { White: graduatedRaceWhite.drillDownData },
            { Other: graduatedRaceOther.drillDownData },
            { Male: graduatedGenderMaleRaceAll.drillDownData },
            { Female: graduatedGenderFemaleRaceAll.drillDownData },
        ];


      /**
       * Init. renderStudentGraph Method
       */
        renderStudentGraph(
          studentEnrolledData,
          "#studentsEnrolledGraph",
          drillDownEnrolledRaceData,
          true
        );
        renderStudentGraph(
          studentGraduatedData,
          "#studentsGraduatesGraph",
          drillDownGraduatedRaceData,
          false
        );
      }

      /**
       * School Type - OnChange Handler
       */
      $("#edit-school-type",context).once("studentSearchBehavior").on("change",($.debounce(500, function(e) {
        var searchValue = $(this).val();
        $('input[name^=school]').each(function(){
          $(this).empty();
        });
        $("#edit-school").empty();
        $("#edit-program-study").empty();
        $("#edit-degree").empty();
        $("#edit-year").empty();
        searchSchool(searchValue);
      })));

      /**
       * Degree - OnChange Handler
       */
      $("#edit-degree",context).once("studentSearchBehavior").on("change",($.debounce(500, function(e) {
        var searchValue = $(this).val();
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
       * Method - Check isFormfieldEmpty
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
       * Method - Form Validation
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
       * Method - DrillUp Chart
       */
      function drillUpChart(chart) {
        var i;
        if (chart) {
          for (i = 0; i < Highcharts.charts.length; i++) {
            Highcharts.charts[i].drillUp();
          }
        }
      }

      /**
       * Method - Drilldown - Filter Race and Gender Data
       */
      function filterDrilldownData(chart) {
        var genders = ["Male", "Female"];
        var races = ["Asian", "Black", "White", "Other"];
        var a = chart.series;
        if (window.config.dataType == 'race') {
            Highcharts.each(a, function(p, i) {
                if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                    p.hide();
                } else {
                    p.show();
                }

            });
        }

        if (window.config.dataType == 'gender') {
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
     * Method - Toggle Checkboxes
     */
    function toggleCheckbox(el, val) {
      el.each(function() {
          $(this).prop('checked', val);
      })
    }

    /**
     * Method - Toggle Race and Gender Graph - OnChange Handler
     */
    var isDrilledup = true;
    var isCustomDrillDown = true;
    var isDrilledDown = false;
    function toggleGraph(chart) {
      $(".toggleDrilldown").off("change");
      $(".toggleDrilldown").on('change', function() {
        isCustomDrillDown = false;
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
        
        
        drillUpChart(chart);
        window.config.dataType = dataType;
        if (isDrilledDown) {
          filterDrilldownData(chart);
        }

        if (chartID == 0) {
          if (isDrilledup) {
            Highcharts.charts[0].series[0].points[0].doDrilldown();
          }
        }

        if (chartID == 1) {
          if (isDrilledup) {
            Highcharts.charts[1].series[0].points[0].doDrilldown();
          }
        }
      });
    }

    /**
     * Page Scroll 
     */
    function pageScroll(isStudentEnrolledGraph) {
      if(isStudentEnrolledGraph) {
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
      function renderStudentGraph(chartData, eleID, drillDownData, isStudentEnrolledGraph) {
        Highcharts.setOptions({
          lang: {
            noData: "No data to display",
            loading: "Loading...",
            thousandsSep: ','
          },
        });
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
                  pageScroll(isStudentEnrolledGraph);
                },
                drilldown: function (e) {
                  var containerId = this.container.id;
                  var drilldowns = [];
                  var chart = this;
                  var series = [];
                  isDrilledup = false;
                  var elementIndex = window.config.dataType == 'gender' ? 0 : 1;
                  if (isCustomDrillDown) {
                    $('.graph-container').find(".graph-container__filters-dropdown").hide();
                    $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                    $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                    $(chart.renderTo).parents('.graph-container').find(".graph-container__filters-dropdown").eq(elementIndex).show();
                    $(chart.renderTo).parents('.graph-container').find(".graph-container__filters").eq(elementIndex).find(".graph-container__filters-dropdown input").prop('checked', true);
                    $(chart.renderTo).parents('.graph-container').find(".toggleDrilldown").eq(elementIndex).prop('checked', true);
                  }

                  //filterStudentTableData(gender, [race[0]], isStudentEnrolledGraph);//Gender - filter

                  if (!e.seriesOptions) {
                    //var selectedYear = e.point.options.year;
                    //chart.setTitle({ text: selectedYear });
                    function renderDrillDownSeriesData(data, type) {
                      var i;
                      if(type == 'race') {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                        filterStudentTableData([gender[0]], race, isStudentEnrolledGraph);//Race - filter
                      } else {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                        if(type == 'gender')
                          filterStudentTableData(gender, [race[0]], isStudentEnrolledGraph);//Gender - filter
                      }

                      for(i=0; i < data.length; i++) {
                        var obj = {
                          drilldownRace: {
                            id: labels[i],
                            name: labels[i],
                            color: Highcharts.getOptions().colors[i],
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
                      for(i=0; i < drilldowns.length; i++) {
                        series.push(drilldowns[i][e.point.drilldownName]);
                      }
                     return series;
                    }

                    function addDrilldownSeries() {
                      var i;
                      for(i=0; i < drilldowns.length; i++) {
                        chart.addSingleSeriesAsDrilldown(e.point, series[i]);
                      }
                    }


                    drillUpChart(chart);
                    toggleGraph(chart);
                    renderDrillDownSeriesData(drillDownData, window.config.dataType);
                    filterDrilldownData(chart);
                    isDrilledDown = true;
                  }
                },

                drillup: function (e) {
                  var containerId = this.container.id;
                  var filterEle = $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown");
                  isDrilledup = true;
                  isDrilledDown = false;
                  isCustomDrillDown = true;
                  // window.config.dataType = "gender";
                  filterEle.hide();
                  $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").each(function() {
                    $(this).prop('checked', false);
                    $(this).prop('disabled', false);
                  });
                  filterStudentTableData([gender[0]], [race[0]], isStudentEnrolledGraph);
                },
              },
            },
            yAxis: {
              title: {
                  text: ''
              },
              labels: {
                formatter: function () {
                  return Highcharts.numberFormat(this.value, 0, ",");
                },
                enabled: true,
              },
            },
            xAxis: {
              type: "category",
              labels: {
                useHTML: true,
              },
              categories: chartData.years,
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

            series: [
              {
                name: "Gender All and Race All Data",
                data: chartData.dataPoints,
              },
            ],
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
            $(".graph-container__filters-dropdown ul li input").each(
              function () {
                $(this).on('change', function () {
                  var id = $(this).attr("id");
                  var series = chart.get(id);
                  if (series = chart.get(id)) {
                    series.setVisible(!series.visible);
                    //}
                    /**
                     * Table data sort according to chart drilldonw
                     */
                    //var year = series.chart.title.textStr;
                    var type = $(this).parents(".graph-container__filters").find(".toggleDrilldown").attr("name");
                    if(type == 'gender'){
                      var genderFilter = gender;
                      (genderFilter.indexOf(id) == -1) ? genderFilter.push(id) : genderFilter.splice($.inArray(id, genderFilter), 1);
                      if(genderFilter.length==0) genderFilter = ['none'];
                      filterStudentTableData(genderFilter, [race[0]], isStudentEnrolledGraph);//Gender filter
                    }else{
                      var raceFilter = race;
                      (raceFilter.indexOf(id) == -1) ? raceFilter.push(id) : raceFilter.splice($.inArray(id, raceFilter), 1);
                      if(raceFilter.length==0) raceFilter = ['none'];
                      filterStudentTableData([gender[0]], raceFilter, isStudentEnrolledGraph);////Race filter
                    }
                  }
                  
                });
              }
            );
          }
        );
      }

      /***
       *  Method - Search School Type
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
            $("#edit-program-study").empty();
            
            $("#edit-program-study").autocomplete({
              source: data,
              minLength: 1,
              select: function (event, ui) {
                searchDegree(ui.item.value, "", searchTerm, schoolType);
                $("#edit-program-study").attr("searchTerm", ui.item.value);
              },
            });
          },
        });
      }


      /**
       * Method - Search Degree
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
    },
  };
})(jQuery, Drupal, drupalSettings);
