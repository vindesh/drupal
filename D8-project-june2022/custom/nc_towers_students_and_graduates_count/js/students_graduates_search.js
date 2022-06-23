(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.studentSearchBehavior = {
    attach: function (context, settings) {
      var isFieldEmpty = true;
      window.config = {
        dataType: 'gender',
    };
      /*function getUrlVars()
      {
          var vars = {};
          var parts = window.location.href.replace(
              /[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                  vars[key] = value;
              }
          );
          return vars;

      }*/
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

      function generateJsonData(ele, countEle, drillDownName) {
        // console.log($("#studentGraphData " + ele), '===> ele')
        var data = [];
        var yearsArr = [];
        var drillDownData = [];

        var params = new URL(document.location).searchParams;
        var selectedYear = params.get("school_year");
        var year = selectedYear;
        var startYear = "";
        // var yearsArr = getDatesArr(".students-count-list .students-count-row");
        // var i;

        $("#studentGraphData " + ele).each(function (i) {
          var item;
          var itemVal = parseInt($(this).find(countEle).text());
          if (itemVal == -1) {
            item = null;
          } else {
            item = itemVal;
          }

          var itemObj = {
            y: item,
            drilldownName: drillDownName,
            drilldown: true,
          };
          var y = $(this).find(".students-count-year a").text();
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

      // $(document).ready(function() {

      // if (window.location.search) {
      //   searchSchoolType();
      // }
      var urlParam = parseQueryStringToDictionarySG(window.location.search);
      var school_type = decodeURIComponent(urlParam["school_type"]);
      searchSchoolType(school_type);

       //School year load on page load...
       var school_year = decodeURIComponent(urlParam["school_year"]);
       searchSchoolYear(school_year);

      //  Form Validation
      searchFormValidation();

      // Toggle Graph and Table View
      $(".graph-view-action", context)
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

      $(".table-view-action", context)
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

        // DrillDown - Students Graduated - Race Data
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


        // Render Chart
        renderStudentGraph(
          studentEnrolledData,
          "#studentsEnrolledGraph",
          drillDownEnrolledRaceData
        );
        renderStudentGraph(
          studentGraduatedData,
          "#studentsGraduatesGraph",
          drillDownGraduatedRaceData
        );
      }

      $("#students_graduates_restart").on("click", function () {
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
          // $("#edit-school").attr("searchTerm",school);
        }
        if(school !== 'undefined' && program_study !== 'undefined'){
          searchProgramType(school,program_study);

          $("#edit-program-study").val(program_study);
          // $("#edit-program-study").attr("searchTerm",program_study);
        }
        if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined'){
          searchDegree(program_study,degree, school);

          $("#edit-degree").val(degree);
        }
      }

      /*$(".view-filters").hide();
        var url = new URL(window.location.href);
        var c = url.searchParams.get("major_search");
        if(c){
          $("#major-search-edit").val(c);
        }*/

        $("#edit-school-type",context).once("studentSearchBehavior").on("change",($.debounce(500, function(e) {
          var searchValue = $(this).val();
          //var searchValue = $.trim($(this).find('option:selected').text());
          $('input[name^=school]').each(function(){
            console.log('school field empty:'+$(this).val());
            $(this).empty();
          });
          console.log('control school type');
          $("#edit-school").empty();
          $("#edit-program-study").empty();
          $("#edit-degree").empty();
          $("#edit-year").empty();
          searchSchool(searchValue);
        })));
        $("#edit-degree",context).once("studentSearchBehavior").on("change",($.debounce(500, function(e) {
          var searchValue = $(this).val();
          console.log('control degree');
          //$("#edit-year").empty();
          //searchSchoolYear(searchValue);
        })));
        /*$("#edit-school",context).once("studentSearchBehavior").on("keyup",($.debounce(500, function(e) {
          var searchValue = $(this).val();
          console.log('control type1');
          //searchDegree(searchValue);
       	})));
        $("#edit-program-study",context).once("studentSearchBehavior").on("keyup",($.debounce(500, function(e) {
          var searchValue = $(this).val();
          console.log('control type2');
          //searchDegree(searchValue);
        })));*/

      $("#students_graduates_search").on("click", function () {
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

      function drillUpChart(chart) {
        var i;
        if (chart) {
          for (i = 0; i < Highcharts.charts.length; i++) {
            Highcharts.charts[i].drillUp();
          }
        }
      }

      /* Graph - Filters */
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

    function toggleCheckbox(el, val) {
      el.each(function() {
          $(this).prop('checked', val);
      })
    }

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

      // render graph
      function renderStudentGraph(chartData, eleID, drillDownData) {
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

                  if (!e.seriesOptions) {
                    function renderDrillDownSeriesData(data, type) {
                      var i;
                      if(type == 'race') {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                      } else {
                        var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
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
                console.log(school_type, '====> school_type111')
                $("#edit-school-type").val(school_type);
              }
            }
        });
      }

      function searchSchool(searchTerm, school) {
        console.log("searchSchool");
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
            // $("#edit-program-study").empty();
            // $("#edit-degree").empty();
            // $("#edit-year").empty();
            $("#edit-school").autocomplete({
              source: data,
              minLength: 1,
              select: function (event, ui) {
                console.log("searchProgramType1");
                console.log(ui.item.value);
                searchProgramType(ui.item.value);
                $("#edit-school").attr("searchTerm", ui.item.value);
              },
            });
            // $('#edit-school').autocomplete("search");
          },
        });
      }

      function searchProgramType(searchTerm, programStudy) {
        console.log("searchProgramType");
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
            $("#edit-program-study").empty();
            // $("#edit-degree").empty();
            // $("#edit-year").empty();
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
        console.log('searchDegree' + searchTerm);
          if(typeof degree == 'undefined' || degree == ''){
            degree='';
          }

          $.ajax({
            method: "POST",
            url: "/students-graduates-count/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school),
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
        console.log('searchSchoolYear');
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

      /* Parse QueryString using String Splitting */
      function parseQueryStringToDictionarySG(queryString) {
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
      // });
    },
  };
})(jQuery, Drupal, drupalSettings);
