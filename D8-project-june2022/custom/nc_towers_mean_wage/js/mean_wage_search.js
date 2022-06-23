(function ($, Drupal, drupalSettings) {
  //Drupal.behaviors.mainOutcomesSearchBehavior = {
    //attach: function (context, settings) {
    var isFieldEmpty = true;
      $( document ).ready(function() {
        jQuery('#multipleYears').click();

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
              y1 = parseInt($.trim($(this).parents(".yearItem-0").find(".main-outcomes-school-year").text()));
              y12 = y1+1;


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
              y2 = parseInt($.trim($(this).parents(".yearItem-1").find(".main-outcomes-school-year").text()));
              y22 = y2+1;
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
              y3 = parseInt($.trim($(this).parents(".yearItem-2").find(".main-outcomes-school-year").text()));
              y33 = y3+1;
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
              y4 = parseInt($.trim($(this).parents(".yearItem-3").find(".main-outcomes-school-year").text()));
              y44 = y4+1;
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
              y5 = parseInt($.trim($(this).parents(".yearItem-4").find(".main-outcomes-school-year").text()));
              y55 = y5+1;
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

        var urlParam = parseQueryStringToDictionaryMO(window.location.search);
        var school_type = decodeURIComponent(urlParam["school_type"]);
        searchSchoolType(school_type);

         //School year load on page load...
        var school_year = decodeURIComponent(urlParam["school_year"]);
        searchSchoolYear(school_year);

        //  Form Validation
        searchFormValidation();

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
            generateDrilldownData(".main-outcomes-enrolled span")
          );

        }

        $("#main_outcomes_restart").on("click", function () {
          let refresh =
            window.location.protocol +
            "//" +
            window.location.host +
            "/" +
            window.location.pathname;
          window.location.href = refresh;
        });

        if(urlParam){
          let school = decodeURIComponent(urlParam["school"]);
          let program_study = decodeURIComponent(urlParam["program_study"]);
          let degree = decodeURIComponent(urlParam["degree"]);

          $("#edit-school").empty();
          $("#edit-program-study").empty();
          $("#edit-degree").empty();
          $("#edit-school-year").empty();

          if(school_type !== 'undefined' && school !== 'undefined'){
            searchSchool(school_type,school);
            $("#edit-school").val(school);
          }
          if(school !== 'undefined' && program_study !== 'undefined'){
            searchProgramType(school,program_study);
            $("#edit-program-study").val(program_study);
          }
          if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined'){
            searchDegree(program_study,degree, school);
            $("#edit-degree").val(degree);
          }
        }

        $("#edit-school-type").on("change",($.debounce(500, function(e) {
          var searchValue = $(this).val();
          $("#edit-school").empty();
          $("#edit-program-study").empty();
          $("#edit-degree").empty();
          $("#edit-year").empty();
          searchSchool(searchValue);
        })));

        //$("#main_outcomes_search").on("click", function (event) {
        $("#main_outcomes_search").once("studentMultiSearchBehavior").on("click", function (event) {
          event.preventDefault();
          let schoolType = $("#edit-school-type").val();
          let school = $("#edit-school").val();
          let programStudy = $("#edit-program-study").val();
          let degree = $("#edit-degree").val();
          let schoolYear = $("#edit-school-year").val();

          var arg = "?";
          var dict = {};
          arg +=
            "school_type=" +
            encodeURIComponent(schoolType) +
            "&" +
            "school=" +
            encodeURIComponent(school) +
            "&program_study=" +
            encodeURIComponent(programStudy) +
            "&degree=" +
            encodeURIComponent(degree) +
            "&school_year=" +
            encodeURIComponent(schoolYear);
          let refresh =
            window.location.protocol +
            "//" +
            window.location.host +
            "/" +
            window.location.pathname +
            arg;
          window.location.href = refresh;
        });

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
            if($(this).val() == '' || $(this).val() == undefined ||
              $(this).val() == 'Please Select' || fieldVal.val() == 'Please Select' ||
              fieldVal.val() == 'Select' || fieldVal.val() == '' || fieldVal.val() == undefined) {
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


        var isDrilledup = true;
        var isCustomDrillDown = true;
        function toggleGraph(chart) {
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


              if (isDrilledup) {
                  chart.series[0].points[0].doDrilldown();
              }
              
              if (chartID == 0) {
                Highcharts.charts[window.config.chartContext].drillUp();
              }

              if (chartID == 1) {
                Highcharts.charts[0].drillUp();
              }

              filterDrilldownData(chart, dataType);
          });
        }

        function toggleCheckbox(el, val) {
          el.each(function() {
              $(this).prop('checked', val);
          })
        }

        // render graph
        function renderStudentGraph(chartData, eleID, drillDownData) {
          var dataType = 'gender';
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
                  thousandsSep: ','
                },
                events: {
                  load: function(event) {
                    toggleGraph(this);
                  },
                  drilldown: function (e) {
                    var containerId = this.container.id;
                    var drilldowns = [];
                    var chart = this;
                    var series = [];
                    isDrilledup = false;

                    $("#" + containerId)
                        .parents(".graph-container")
                        .find(".graph-container__sorting")
                        .show();

                    $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                    if(isCustomDrillDown) {
                      $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                      $(".toggleDrilldown").first().prop('checked', false);
                      $(".toggleDrilldown").first().prop('disabled', false);
                      $(".toggleDrilldown").first().prop('checked', true);
                      $(".toggleDrilldown").first().prop('disabled', true);
                      $(".graph-container__filters-dropdown").hide();
                      $(".toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                      $(".toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                    }

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

                      // drillUpChart();
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

                        $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").each(function() {
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
                  //format: '{value}%',
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
                pointFormat: '<b>{point.series.name} <b><br>${point.y:,.0f}',
              },
              title: {
                text: '',
              },
              legend: {
                enabled: true,
              },
              // plotOptions: {
              //   series: {
              //     borderWidth: 0,
              //     dataLabels: {
              //       enabled: true,
              //     },
              //     events: {
              //       legendItemClick: function() {
              //         return false;
              //       }
              //     },
              //   },
              // },
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
            },
            function (chart) {
              $(".graph-container__filters-dropdown ul li input").each(
                function () {
                  $(this).on('change', function () {
                    var id = $(this).attr("id");
                    series = chart.get(id);
                    if (series = chart.get(id)) {
                      series.setVisible(!series.visible);
                    }
                  });

                }
              );
            }
          );
        }

        function searchSchoolType(school_type){
          if(typeof school_type == 'undefined' || school_type == ''){
            school_type = '';
          }
          let searchUrl = "/api-main-outcomes/school-type";
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

        function searchSchool(searchTerm, school) {
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
              $("#edit-school").empty();
              $("#edit-school").autocomplete({
                source: data,
                minLength: 1,
                select: function (event, ui) {
                  searchProgramType(ui.item.value);
                  $("#edit-school").attr("searchTerm", ui.item.value);
                },
              });
            },
          });
        }

        function searchProgramType(searchTerm, programStudy) {
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
              $("#edit-program-study").empty();
              $("#edit-program-study").autocomplete({
                source: data,
                minLength: 1,
                select: function (event, ui) {
                  searchDegree(ui.item.value, "", searchTerm);
                  $("#edit-program-study").attr("searchTerm", ui.item.value);
                },
              });
              // $('#edit-program-study').autocomplete("search");
            },
          });
        }

        function searchDegree(searchTerm, degree, school){
          if(typeof degree == 'undefined' || degree == ''){
            degree='';
          }

          $.ajax({
            method: "POST",
            url: "/api-main-outcomes/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school),
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

        function searchSchoolYear(year){
          if(typeof year == 'undefined' || year == ''){
            year='';
          }

          $.ajax({
            method: "POST",
            url: "/api-main-outcomes/school-year",
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

        /* Parse QueryString using String Splitting */
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
         * Click on radio button: redirect to specify path.
         */
        $("#singleYear").click(function(event) {
          let refresh = window.location.protocol +
            "//" + window.location.host +
            "/programs-wages";
          window.location.href = refresh;
        });
      })
    //},
  //x};
})(jQuery, Drupal, drupalSettings);
