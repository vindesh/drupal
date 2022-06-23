(function ($, Drupal, drupalSettings) {
  'use strict';
  $(document).ready(function (event) {
    var urlParam = parseQueryStringToDictionaryET(window.location.search);
    /* Parse QueryString using String Splitting */
    function parseQueryStringToDictionaryET(queryString) {
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

    var dataRows = [];
    function generateJsonData(ele, countEle, drillDownName, dataFlag) {
      var schoolPrograms = [];
      var drillDownData = [];
      for (let ikey = 0; ikey < 5; ikey++) {
        $("#employmentSectorGraphData .employmentSector-" + ikey + " " + ele).each(function (i) {
          var itemVal = $(this).find(countEle).text().trim();
          var schoolProgramName = $(this).find(".employment-sector-school").text().trim() + " / " + $(this).find(".employment-sector-program").text().trim();
          var schoolProgramDegree = schoolProgramName + " / " + $(this).find(".employment-sector-degree").text().trim();
          var employmentSector = $(this).find(".employment-sector-name").text().trim();
          if (itemVal == -1 || itemVal == '' || itemVal == null) {
            itemVal = null;
          } else {
            itemVal = parseInt(itemVal);
          }
          schoolPrograms[ikey] = schoolProgramName;
          if (dataFlag && i < 5 && ele == '.employment-sector-list .gender-All.race-All') {
            var itemObj = {
              name: 'drilldownRace',
              drillDownName: schoolProgramName,
              id: employmentSector,
              drillDownID: schoolProgramDegree,
              y: itemVal,
              drilldown: true
            };

            var tempArray = [];
            for (i = 0; i < ikey; i++) {
              tempArray.push(null);
            };
            tempArray.push(itemObj);
            dataRows.push({
              name: employmentSector,
              category: schoolProgramDegree,
              data: tempArray
            });
          } // All-All case...

          var agency_category_flag = false;
          dataRows.forEach((row, key) => {
            if (row.name == employmentSector && row.category == schoolProgramDegree) {
              agency_category_flag = true;
              return;
            }
          });

          if (agency_category_flag) {
            drillDownData.push({
              name: employmentSector,
              id: employmentSector,
              drillDownID: schoolProgramDegree,
              y: itemVal,
            });
          }
        });
      } //End of for loop
      return {
        dataPoints: dataRows,
        legends: schoolPrograms,
        drillDownData: drillDownData,
      };
    }

    // Toggle Graph and Table View
    $(".graph-view-action",)

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

    $(".table-view-action",)

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
          .find(".graph-container__sorting")
          .hide();
      });
    if ($("#employmentSectorGraphData").children().length > 0) {
      $(".graph-container").css({ display: "block" });
      var studentEnrolledDataEmpSector = new generateJsonData(
        ".employment-sector-list .gender-All.race-All",
        //".students-count-list .gender-All.race-All .employment-sector-enrolled span",
        ".employment-sector-enrolled span",
        "drilldownRace",
        1
      );

      /* Generate Drilldown Data */
      function generateDrilldownData(countEle) {
        var parentClass = ".employment-sector-list";
        var drillDownData = [];
        var dataLabels = ['All', 'Asian', 'Black', 'White', 'Other', 'Male', 'Female'];
        var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
        var i;
        for (i = 0; i < drillDownCombination.length; i++) {
          var data = new generateJsonData(
            parentClass + " " + drillDownCombination[i],
            countEle,
            "drilldownRace",
            0
          );
          var obj = { [dataLabels[i]]: data.drillDownData };
          drillDownData.push(obj);
        }
        return drillDownData;
      }

      /* Enrolled */
      renderEmploymentSectorGraph(
        studentEnrolledDataEmpSector,
        "#employmentSectorGraph",
        generateDrilldownData(".employment-sector-enrolled span")
      );
    }
    /* Filters */
    function filterDrilldownData(chart, dataType) {
      var genders = ["Male", "Female"];
      var races = ["Asian", "Black", "White", "Other"];
      var a = chart.series;
      if (dataType == 'race') {
        Highcharts.each(a, function (p, i) {
          if (p.userOptions.name == genders[0] || p.userOptions.name == genders[1]) {
            p.hide();
          } else {
            p.show();
          }
        });
      }

      if (dataType == 'gender') {
        Highcharts.each(a, function (p, i) {
          if (p.userOptions.name == races[0] || p.userOptions.name == races[1] || p.userOptions.name == races[2] || p.userOptions.name == races[3]) {
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
      $(".empBySector .toggleDrilldown").off('change');
      $(".empBySector .toggleDrilldown").on('change', function () {
        isCustomDrillDown = false;
        var dataType = $(this).attr("name");
        var chartID = parseInt($(this).attr("id"));
        var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
        $(".empBySector .toggleDrilldown").prop('checked', false);
        $(".empBySector .toggleDrilldown").prop('disabled', false);
        $(this).prop('checked', true);
        $(this).prop('disabled', true);
        $(".graph-container__filters-dropdown").hide(0, function () {
          toggleCheckbox(el, false);
        });
        $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show(0, function () {
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

    function toggleCheckbox(el, val) {
      el.each(function () {
        $(this).prop('checked', val);
      })
    }

    function renderEmploymentSectorGraph(chartData, eleID, drillDownData) {
      var mainCat = [];
      var dataType = 'gender';
      $(eleID).highcharts({
        chart: {
          type: 'bar',
          lang: {
            noData: "No data to display",
            loading: "Loading...",
          },
          events: {
            load: function (event) {
              toggleGraph(this);
            },
            drilldown: function (e) {
              var containerId = this.container.id;
              var drilldowns = [];
              var chart = this;
              var series = [];
              var categories = [];
              isDrilledup = false;

              if (mainCat.length > 0)
                this.xAxis[0].categories = mainCat;
              else
                mainCat = this.xAxis[0].categories;

              $("#" + containerId)
                .parents(".graph-container")
                .find(".graph-container__sorting")
                .show();
              this.options.legend["enabled"] = true;
              if (isCustomDrillDown) {
                $('.graph-container').find(".graph-container__filters-dropdown").hide();
                $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                $(chart.renderTo).closest('.graph-container').find(".graph-container__filters-dropdown").first().show();
                $(chart.renderTo).closest('.graph-container').find(".graph-container__filters").first().find(".graph-container__filters-dropdown input").prop('checked', true);
                $(chart.renderTo).closest('.graph-container').find(".toggleDrilldown").first().prop('checked', true);
              }
              if (!e.seriesOptions) {
                chart.setTitle({ text: e.point.options.drillDownName });

                function drillDownCategories(data) {
                  categories = [];
                  var j = 0;
                  for(j; j<data[0]['All'].length; j++) {
                    if (data[0]['All'][j].drillDownID == $.trim(e.point.options.drillDownID)) {
                      categories.push(data[0]['All'][j].name);
                    }
                  }
                  chart.xAxis[0].categories = categories;
                }

                function renderDrillDownSeriesData(data, type) {
                  var i;

                  var maxItems = 5
                  var colors = ['#4472c4', '#ed7d31', '#b6b6b6', '#70ad47', '#264478', '#ed7d31', '#b6b6b6']
                  if (type == 'race') {
                    var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                  } else {
                    var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                  }



                  for (i = 0; i < data.length; i++) {
                    var data1 = data[i][labels[i]];
                    var data2 = [];
                    data2[i] = [];
                    data2[i][labels[i]] = [];
                    $.each(data1, function (key, value) {
                      // if (categories.indexOf(value.name) == -1)
                        // categories.push(value.name);
                      if(data2[i][labels[i]].length < 5) {
                        if (value.drillDownID == $.trim(e.point.options.drillDownID)) {
                          // categories.push(value.name);
                          data2[i][labels[i]].push(value);
                        }
                      }
                    });
                    var obj = {
                      drilldownRace: {
                        id: labels[i],
                        name: labels[i],
                        data: data2[i][labels[i]],
                        color: colors[i],
                      },
                    }
                    drilldowns.push(obj);
                  }

                  renderDrillDownSeries();
                  addDrilldownSeries();
                  chart.applyDrilldown();

                  // console.log(drilldowns, '===>>>>> drilldowns')

                  return drilldowns;
                }

                drillDownCategories(drillDownData);



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
            drillup: function (e) {
              this.xAxis[0].categories = mainCat;
              var containerId = this.container.id;
              var filterEle = $("#" + containerId).closest(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown");
              isDrilledup = true;
              isCustomDrillDown = true;
              dataType = 'gender';

              filterEle.hide();

              $("#" + containerId).closest(".graph-container").find(".empBySector .toggleDrilldown").each(function () {
                $(this).prop('checked', false);
                $(this).prop('disabled', false);
              });
              this.options.legend["enabled"] = false;
              this.setTitle({ text: '' });
            },
          },
        },
        yAxis: {
          title: {
            text: ''
          },
          labels: {
            format: '{value}',
            enabled: true,
          },
        },
        xAxis: {
          type: "category",
          categories: chartData.legends,
        },
        title: {
          text: "",
        },
        legend: { enabled: false },
        plotOptions: {
          series: {
            stacking: 'normal',
            events: {
              legendItemClick: function () {
                return false;
              }
            },
          }
        },
        tooltip: {
          useHTML: true,
          pointFormatter: function () {
            if (this.hasOwnProperty("drilldown")) {
              return "<div class='tooltip1'><b>" + this.id + "<b>, " + this.options.y + "</b></div>";
            } else {
              return "<div class='tooltip1'><b>" + this.category + ", " + this.series.name + "<b>, " + this.options.y + "</b></div>";
            }
          }
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
        function (chart) {
          $(".empBySector .graph-container__filters-dropdown ul li input").each(
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
  })
})(jQuery, Drupal, drupalSettings);
