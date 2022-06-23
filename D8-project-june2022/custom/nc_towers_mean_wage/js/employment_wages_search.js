(function ($, Drupal, drupalSettings) {

    $(document).ready(function () {
        $(".graph-view-action1",)
        
        .on("click", function () {
          $(this)
            .parents(".graph-container")
            .find(".graph-view-container1")
            .show();
          $(this)
            .parents(".graph-container")
            .find(".table-view-container1")
            .hide();
          $(this)
            .parents(".graph-container")
            .find(".graph-container__sorting.2ndchart")
            .show();
        });

      $(".table-view-action1",)
        
        .on("click", function () {
          $(this)
            .parents(".graph-container")
            .find(".graph-view-container1")
            .hide();
          $(this)
            .parents(".graph-container")
            .find(".table-view-container1")
            .show();
          $(this)
            .parents(".graph-container")
            .find(".graph-container__sorting.2ndchart")
            .hide();
        });
        if ($("#employmentWagesGraphData").children().length > 0) {
          $(".graph-container").css({ display: "block" });
      
          /**
           *** New logic
           */
      
          window.config = {
            chartContext: 1,
            yearIndex: 0,
          };
          /**
           * Get Years
           */
          var selectDropdownYears = [];
      
          function getYears() {
            var container = $("#employmentWagesGraphData");
      
            container.find(".view-grouping").each(function () {
              var year = $(this).attr("data-year");
              selectDropdownYears.push(parseInt(year));
            });
            // years.sort(function(a, b){return a-b});
            // return selectDropdownYears
          }
      
          getYears();
      
          /**
           *  Year Index
           */
          function getYearIndex() {
            var container = $("#employmentWagesGraphData");
            var yearIndex = [];
            container.find(".view-grouping").each(function () {
              var index = $(this).attr("data-yearindex");
              yearIndex.push(parseInt(index));
            });
            // years.sort(function(a, b){return a-b});
      
            return yearIndex;
          }
      
          /***
           * Get Top Ranked Year By Wages
           */
          function getTopRankedYearByWages() {
            var rankedYear = $("#employmentWagesGraphData .view-grouping")
              .first()
              .attr("data-year");
            return parseInt(rankedYear);
          }
      
          /**
           * Get Top 5 Sectors
           */
          function getTopFiveSectors(yearClass) {
            var sectors = [];
            var sectorsList = [];
            var maxItems = 4;
            $(
              "#employmentWagesGraphData .view-grouping." +
                yearClass +
                " .sector-item"
            ).each(function (i, ele) {
              var sector = $(this).attr("data-sector");
              sectors.push(sector);
              return i < maxItems;
            });
      
            for (var i = 0; i < sectors.length; i++) {
              var str = sectors[i];
              var newStr = str.replace(/-/g, " ");
              sectorsList.push(newStr);
            }
      
            // console.log(arr1, '> arr1')
            return sectorsList;
          }
      
          function getYearClasses() {
            var classes = [];
            var container = $("#employmentWagesGraphData .view-grouping");
            container.each(function () {
              var className = $(this).attr("data-yearclass");
              classes.push(className);
            });
      
            return classes;
          }
      
          function createDataSet(yearClass, year, genderAllRaceAllClass) {
            var sectors = getTopFiveSectors(yearClass);
            // console.log(sectors, '==> sectors')
            var afterYearSeries = [];
            $.each(sectors, function (i, ele) {
              var g = [];
              // console.log(i, v, '==>> rahul')
              var grouppedData = $(
                "#employmentWagesGraphData " +
                  "." +
                  yearClass +
                  " " +
                  genderAllRaceAllClass +
                  ele
              );
              $.each(grouppedData, function (i, innerEle) {
                var point = $(innerEle).find(".employment-wages span").text();
                var itemObj = {
                  y: parseInt(point),
                  name: "drilldownRaceGender",
                  drilldown: true,
                };
                g.push(itemObj);
              });
              // var obj = {data: g, id: year, sector: sectors[i]};
              var obj = { data: g, name: sectors[i], id: year, sector: sectors[i] };
              afterYearSeries.push(obj);
              // console.log(afterYearSeries, '==> grouppedData');
            });
            return afterYearSeries;
          }
          var finalDataSet = [];
      
          function generateAfterYearData() {
            var yearsClasses = getYearClasses();
            var years = selectDropdownYears;
            var genderAllRaceAllClass =
              ".employment-wages-row.gender-All.race-All.sector-";
            $.each(yearsClasses, function (i) {
              var data = createDataSet(
                yearsClasses[i],
                years[i],
                genderAllRaceAllClass
              );
              var obj = {
                year: years[i],
                // id: years[i],
                sectors: getTopFiveSectors(yearsClasses[i]),
                data: data,
                drillDownData: [],
              };
              finalDataSet.push(obj);
            });
      
            // console.log(finalDataSet, '===> finalDataSet');
            return finalDataSet;
          }
      
          function createDataSetForDrillDown(yearClass, year, genderAllRaceAllClass) {
            var sectors = getTopFiveSectors(yearClass);
            // console.log(sectors, '==> sectors')
            var afterYearSeries = [];
            $.each(sectors, function (i, ele) {
              var g = [];
              var point;
              // console.log(i, v, '==>> rahul')
              var grouppedData = $(
                "#employmentWagesGraphData " +
                  "." +
                  yearClass +
                  " " +
                  genderAllRaceAllClass +
                  ele
              ).first();
              $.each(grouppedData, function (i, innerEle) {
                point = $(innerEle).find(".employment-wages span").text();
                /* var itemObj = {
                                  y: parseInt(point),
                                  name: "drilldownRace",
                                  drilldown: true,
                          }; */
                g.push(parseInt(point));
              });
              // var obj = {data: g, id: year, sector: sectors[i]};
              // var obj = { y: parseInt(point), sector: sectors[i] };
              // afterYearSeries.push(obj);
              afterYearSeries.push(parseInt(point));
              // console.log(afterYearSeries, '==> grouppedData');
            });
            return afterYearSeries;
          }
      
          function drillDownDataNew(yearIndex) {
            var yearsClasses = getYearClasses();
            // console.log(yearsClasses, 'yearsClasses')
            var years = selectDropdownYears;
            // var yearIndex = 0;
            var drillDownDataSet = [];
            var dataLabels = [
              "All",
              "Asian",
              "Black",
              "White",
              "Other",
              "Male",
              "Female",
            ];
            var drillDownCombination = [
              ".gender-All.race-All.sector-",
              ".gender-All.race-Asian.sector-",
              ".gender-All.race-Black.sector-",
              ".gender-All.race-White.sector-",
              ".gender-All.race-Other.sector-",
              ".gender-Male.race-All.sector-",
              ".gender-Female.race-All.sector-",
            ];
      
            var j;
            // $.each([yearsClasses[0]], function(i) {
      
            var group = [];
            for (j = 0; j < drillDownCombination.length; j++) {
              var data = createDataSetForDrillDown(
                yearsClasses[yearIndex],
                years[yearIndex],
                drillDownCombination[j]
              );
      
              var obj = {
                year: years[yearIndex],
                id: dataLabels[j],
                name: dataLabels[j],
                [dataLabels[j]]: data,
              };
              group.push(obj);
            }
      
            // console.log(group, '===> drillDownDataSet');
            return group;
          }
      
          /**
           * After year change handler
           */
      
          function afterYearChangeHandler(chart) {
            $("#employmentWagesAfterYearFilter").on("change", function () {
              var id = parseInt($(this).find(":selected").attr("data-id"));
              $(".graph-container__graph-view .loader-overlay").addClass("active");
              toggleAfterYearSeries(id, chart);
            });
          }
      
          /**
           * Toogle After-Year Series
           */
          function toggleAfterYearSeries(id, chart) {
            // var a = chart.series;
            var a = Highcharts.charts[config.chartContext].series;
            Highcharts.each(a, function (p, i) {
              // var b = p.data[0].series;
              Highcharts.each(a, function (q, index) {
                if (index == id) {
                  q.show();
                } else {
                  q.hide();
                }
              });
            });
          }
      
          /**
           * Render Years Options
           */
          function addSelectOptions() {
            var years = selectDropdownYears;
            var selectEle = $("#employmentWagesYearFilter");
            for (i = 0; i < years.length; i++) {
              // console.log(years[i], '==>years[i]')
              if (!isNaN(years[i])) {
                selectEle.append(
                  "<option data-id=" + i + ">" + years[i] + "</option>"
                );
              }
            }
          }
          addSelectOptions();
      
          /**
           *  Default Filters - hide on year change
           */
          function hideDefaultFilters() {
            $(".employmentWagesGraphContainer .graph-container__filters input").each(
              function () {
                $(this).prop("checked", false);
                $(this).prop("disabled", false);
              }
            );
      
            $(
              ".employmentWagesGraphContainer .graph-container__filters-dropdown"
            ).each(function () {
              $(this).hide();
            });
      
            $("#employmentWagesAfterYearFilter").removeAttr("disabled");
          }
      
          /**
           * Years Filters
           */
      
          function yearsFilter(chart) {
            finalDataSet = [];
            var selectEle = $("#employmentWagesYearFilter");
            var previous;
            var chartData = generateAfterYearData();
            selectEle
              .on("focus", function () {
                previous = parseInt(this.value);
              })
              .change(function () {
                var legendIndex = parseInt($(this).find(":selected").attr("data-id"));
                config.chartContext++;
                config.yearIndex = legendIndex;
                isCustomDrillDown = true;
                if (chart) {
                  chart.destroy();
                  chart = null;
      
                  // console.log(chart, '==>chart')
                  selectEle.off("change");
                  $("#employmentWagesAfterYearFilter").off("change");
      
                  // finalDataSet = [];
                  chart = renderEmploymentWagesGraph(
                    chartData,
                    legendIndex,
                    "#employmentWagesGraph",
                    drillDownDataNew(config.yearIndex)
                  );
      
                  $("#employmentWagesAfterYearFilter").val(
                    $("#employmentWagesAfterYearFilter option:first").val()
                  );
                  hideDefaultFilters();
                }
                previous = parseInt(this.value);
              });
          }
      
          /**
           * Drilldown Chart
           */
          function generateDrillDownchartData(className) {
            // var sectors = getTopFiveSectors('yearItem-0');
            var i = 1;
            var arr = [];
            for (i; i < 6; i++) {
              var container = $(
                "#employmentWagesGraphData .view-grouping.yearItem-0 .sector-item:nth-child(" +
                  i +
                  ")"
              ).find(".employment-wages-row" + className);
              var wages = container.find(".employment-wages span").text();
              arr.push(parseInt(wages));
            }
            return arr;
          }
      
          function generateDrillDownCombinations() {
            var dataLabels = [
              "All",
              "Asian",
              "Black",
              "White",
              "Other",
              "Male",
              "Female",
            ];
            var drillDownCombination = [
              ".gender-All.race-All",
              ".gender-All.race-Asian",
              ".gender-All.race-Black",
              ".gender-All.race-White",
              ".gender-All.race-Other",
              ".gender-Male.race-All",
              ".gender-Female.race-All",
            ];
      
            var j;
            var group = [];
            for (j = 0; j < drillDownCombination.length; j++) {
              var data = generateDrillDownchartData(drillDownCombination[j]);
      
              var obj = {
                [dataLabels[j]]: data,
              };
              group.push(obj);
            }
      
            return group;
          }
      
          /**
           * Highlevel Chart
           */
          function generateHighLevelData() {
            var i = 1;
            var highLevelSeries = [];
            for (i; i < 6; i++) {
              var container = $(
                "#employmentWagesGraphData .view-grouping.yearItem-0 .sector-item:nth-child(" +
                  i +
                  ")"
              ).find(".employment-wages-row.gender-All.race-All");
              var wages = container.find(".employment-wages span").text();
              var name = container.find(".employment-wages-sector").first().text();
              var sectorName = name.replace(/-/g, " ");
              var year = container.find(".employment-wages-school-year").text();
              var obj = {
                y: parseInt(wages),
                name: sectorName,
                // name: "drilldownRaceGender",
                id: sectorName,
                year: year,
                drilldown: true,
              };
              highLevelSeries.push(obj);
            }
            console.log(highLevelSeries, "=> highLevelSeries");
      
            return highLevelSeries;
          }
      
          /**
           * Init Chart on Page Load
           */
      
          renderEmploymentWagesGraph(
            generateHighLevelData(),
            0,
            "#employmentWagesGraph",
            generateDrillDownCombinations()
          );
        }
      
        /**
         * Remove All Change Handler from checkboxes.
         */
      
        function removeChangeHandlerFromFilters() {
          $(
            ".employmentWagesGraphContainer .graph-container__filters-dropdown ul li input"
          ).each(function () {
            $(this).off("change");
          });
        }
      
        /**
         * Init Race and Gender Filters
         */
      
        function initialFilters() {
          $(
            ".employmentWagesGraphContainer .graph-container__filters-dropdown ul li input"
          ).each(function () {
            $(this).on("change", function () {
              var id = $(this).attr("id");
              // console.log(id, 'id')
              var series = Highcharts.charts[config.chartContext].get(id);
              // console.log(series, '==> series')
              if (series) {
                series.setVisible(!series.visible);
              }
            });
          });
        }
      
        /**
         * Render Chart
         */
        function renderEmploymentWagesGraph(
          chartData,
          dataIndex,
          eleID,
          drillDownData
        ) {
          var dataType = "gender";
      
          Highcharts.setOptions({
            lang: {
              noData: "No data to display",
              loading: "Loading...",
              thousandsSep: ",",
            },
          });
          $(eleID).highcharts({
            chart: {
              type: "bar",
              lang: {
                noData: "No data to display",
                loading: "Loading...",
              },
              events: {
                load: function (event) {
                  toggleGraph(this);
                  // yearsFilter(this);
                  // afterYearChangeHandler(this);
                  // toggleAfterYearSeries(0, this);
                  initialFilters();
                },
                drilldown: function (e) {
                  var containerId = this.container.id;
                  this.options.plotOptions.series["stacking"] = false;
                  this.options.legend["enabled"] = true;
                  var drilldowns = [];
                  var chart = this;
                  var series = [];
                  isDrilledup = false;
                  $("#employmentWagesAfterYearFilter").attr("disabled", true);
      
                  $(this)
                    .parents(".graph-container__filters")
                    .find(".graph-container__filters-dropdown")
                    .show();
                  if (isCustomDrillDown) {
                    $(this)
                      .parents(".graph-container__filters")
                      .find(".graph-container__filters-dropdown input")
                      .prop("checked", true);
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .prop("checked", false);
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .prop("disabled", false);
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .prop("checked", true);
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .prop("disabled", true);
                    $(
                      ".employmentWagesGraphContainer .graph-container__filters-dropdown"
                    ).hide();
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .parents(".graph-container__filters")
                      .find(".graph-container__filters-dropdown")
                      .show();
                    $(".employmentWagesGraphContainer .toggleDrilldown")
                      .first()
                      .parents(".graph-container__filters")
                      .find(".graph-container__filters-dropdown input")
                      .prop("checked", true);
                  }
      
                  // console.log(e.point.name, '=> sectorName')
      
                  if (!e.seriesOptions) {
                    function renderDrillDownSeriesData(data, type) {
                      // console.log(data, '==> drilldown data')
                      var i;
                      if (type == "race") {
                        var labels = [
                          "All",
                          "Asian",
                          "Black",
                          "White",
                          "Other",
                          "Male",
                          "Female",
                        ];
                      } else {
                        var labels = [
                          "All",
                          "Asian",
                          "Black",
                          "White",
                          "Other",
                          "Male",
                          "Female",
                        ];
                      }
      
                      var legendsList = getTopFiveSectors("yearItem-0");
                      console.log(legendsList, " =>legendsList");
      
                      console.log(data, "=> data");
      
                      for (i = 0; i < data.length; i++) {
                        var obj = {
                          [e.point.name]: {
                            id: labels[i],
                            name: labels[i],
                            color: Highcharts.getOptions().colors[i],
                            data: data[i][labels[i]],
                          },
                        };
      
                        drilldowns.push(obj);
                      }
      
                      renderDrillDownSeries();
                      addDrilldownSeries();
                      chart.applyDrilldown();
      
                      // console.log(drilldowns, '===> drilldowns')
                      // console.log(series, '===> series')
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
      
                    toggleGraph(chart);
                    renderDrillDownSeriesData(drillDownData, dataType);
                    filterDrilldownData(chart, dataType);
      
                    removeChangeHandlerFromFilters();
                    initialFilters();
                    // drillUpChart();
                  }
                },
      
                drillup: function (e) {
                  var containerId = this.container.id;
                  var filterEle = $("#" + containerId)
                    .parents(".graph-container")
                    .find(
                      ".graph-container__sorting .graph-container__filters-dropdown"
                    );
                  isDrilledup = true;
                  isCustomDrillDown = true;
                  dataType = "gender";
                  filterEle.hide();
                  this.options.plotOptions.series["stacking"] = "normal";
                  this.options.legend["enabled"] = false;
                  $("#employmentWagesAfterYearFilter").removeAttr("disabled");
                  $("#" + containerId)
                    .parents(".graph-container")
                    .find(".graph-container__sorting .toggleDrilldown")
                    .each(function () {
                      $(this).prop("checked", false);
                      $(this).prop("disabled", false);
                    });
                },
              },
            },
            yAxis: {
              title: {
                text: "",
              },
              labels: {
                format: "${value}",
                enabled: true,
              },
            },
            xAxis: {
              type: "category",
              labels: {
                useHTML: true,
              },
              categories: getTopFiveSectors("yearItem-0"),
            },
            tooltip: {
              useHTML: true,
              headerFormat: "",
              backgroundColor: "#ffffff",
              followPointer: true,
              followTouchMove: true,
              // pointFormat: '<b>{point.series.name} <b><br>${point.y:,.0f}',
              pointFormatter: function () {
                if (this.hasOwnProperty("drilldown")) {
                  return "<b>" + this.name + "<b><br>$" + Highcharts.numberFormat(this.options.y, 0, ",") + "</b>";
                } else {
                  return ("<b>" + this.category + " - " + this.series.name + "<b><br>$" + Highcharts.numberFormat(this.options.y, 0, ",") + "</b>");
                }
              },
            },
            title: {
              text: "",
            },
            legend: {
              enabled: false,
            },
            plotOptions: {
              series: {
                stacking: "normal",
                borderWidth: 0,
                dataLabels: {
                  enabled: false,
                },
                events: {
                  legendItemClick: function () {
                    return false;
                  },
                },
              },
            },
            // series: chartData[dataIndex].data,
            series: [{ data: chartData }],
            drilldown: {
              breadcrumbs: {
                format: "< Back",
                buttonTheme: {
                  fill: "#f7f7f7",
                  padding: 8,
                  stroke: "#cccccc",
                  "stroke-width": 1,
                },
                floating: false,
                position: {
                  align: "left",
                },
                showFullPath: false,
              },
            },
          });
        }
      
        /**
         * Custom Drilldown Filters
         */
        function filterDrilldownData(chart, dataType) {
          var genders = ["Male", "Female"];
          var races = ["Asian", "Black", "White", "Other"];
          var a = Highcharts.charts[config.chartContext].series;
          if (dataType == "race") {
            Highcharts.each(a, function (p, i) {
              if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                p.hide();
              } else {
                p.show();
              }
            });
          }
      
          if (dataType == "gender") {
            Highcharts.each(a, function (p, i) {
              if (
                p.userOptions.id == races[0] ||
                p.userOptions.id == races[1] ||
                p.userOptions.id == races[2] ||
                p.userOptions.id == races[3]
              ) {
                p.hide();
              } else {
                p.show();
              }
            });
          }
        }
      
        /**
         * Toggle Race and Gender Checkboxes
         */
        function toggleCheckbox(el, val) {
          el.each(function () {
            $(this).prop("checked", val);
          });
        }
      
        var isDrilledup = true;
        var isCustomDrillDown = true;
      
        function toggleGraph(chart) {
          $(".toggleDrilldown").on("change", function () {
            isCustomDrillDown = false;
            var dataType = $(this).attr("name");
            var chartID = parseInt($(this).attr("id"));
            var el = $(this)
              .parents(".graph-container__filters")
              .find(".graph-container__filters-dropdown input");
            $(".toggleDrilldown").prop("checked", false);
            $(".toggleDrilldown").prop("disabled", false);
            $(this).prop("checked", true);
            $(this).prop("disabled", true);
            $(".graph-container__filters-dropdown").hide(0, function () {
              toggleCheckbox(el, false);
            });
            $(this)
              .parents(".graph-container__filters")
              .find(".graph-container__filters-dropdown")
              .show(0, function () {
                toggleCheckbox(el, true);
              });
      
            if (isDrilledup) {
              // chart.series[0].points[0].doDrilldown();
              Highcharts.charts[
                config.chartContext
              ].series[0].points[0].doDrilldown();
            }
      
            if (chartID == 0) {
              Highcharts.charts[config.chartContext].drillUp();
            }
      
            if (chartID == 1) {
              Highcharts.charts[0].drillUp();
            }
      
            filterDrilldownData(chart, dataType);
          });
        }
      });


})(jQuery, Drupal, drupalSettings);
