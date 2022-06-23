(function ($, Drupal, drupalSettings) {
  'use strict';
  $(document ).ready(function(event) {

    /**
     * Chart Config
     */

    var config = {
      groupClass: 'employmentSector-0',
      afterYear: 1,
      chartContext: (Highcharts.chartCount == 2) ? 1 : 0,
      dataType: 'gender',
    }

    /**
     * Click Handler - Toggle Graph and Table View
     */
    $(".graph-view-action1").on("click", function () {
      $(".graph-view-container1").show();
      $(".table-view-container1").hide();
      $(".graph-container__sorting.2ndchart").show();
    });

    $(".table-view-action1").on("click", function () {
      $(".graph-view-container1").hide();
      $(".table-view-container1").show();
      $(".graph-container__sorting.2ndchart").hide();
    });



    /**
     * [drilldownTableData description]
     * @param  {[type]} gender  [Array of 'All', 'Male', 'Female']
     * @param  {[type]} race    [Array of "All", "Asian", "Black", "White", "Other"]
     * @param  {String} afterYear [description]
     * @param  {String} school  [Array of School]
     * @param  {String} program [Array of Program]
     * @param  {String} degree  [Array of Degree]
     * @return {[type]}         [Return filter data on table according to search param]
     */
    function drilldownTableData(gender, race, afterYear='', school='', program='', degree=''){
      var filterTableData, tableID;
      tableID = '#enrollmentTypeTable';

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
            {
                rows: afterYear,
                column: 6
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
            }
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

      filterTableData.buttons( 0, null ).containers().appendTo( '#empSectorTableExportButton' );

    }
    /**
     * Variable define and Init drilldownTableData
     */
    var gender = ['All', 'Male', 'Female'];
    var race = ["All", "Asian", "Black", "White", "Other"];
    var filterAfterYear = $("#afterYearFilter").find(":selected").val();
    drilldownTableData([gender[0]], [race[0]], [filterAfterYear]);
    /* End of drilldownTableData */




    /**
     * Method - Get Group Class
     */
    function getGroupClasses() {
      var container = $("#employmentSectorGraphData");
      var groupClasses = [];
      var index = 0;
      container.find(".view-grouping").each(function(i) {
          var className = $(this).attr('data-empclass');
          var empindex = $(this).attr('data-index');
          // groupClasses.push({ empindex: className });
          groupClasses[empindex] = className;

      });

      return groupClasses;
    } 

  /**
   * Get all sector from views result
   */
  function getSectorList() {
      var container = $("#employmentSectorGraphData");
      var sector = [];
      container.find(".view-grouping").each(function() {
          var className = $(this).attr('data-empclass');
          container.find("." + className + " .sector-item").each(function(i) {
              //if (sector.length < 5) {
                  var sectorName = $(this).attr('data-sector');
                  if (sector.indexOf(sectorName) == -1) {
                      sector.push(sectorName);
                  }
              //}
          });
      });
      return sector;
  }

  /**s
   * Generate Chart Legends
   */
  function chartLegends() {
    var container = $("#employmentSectorGraphData");
    var legends = [];
    container.find(".view-grouping").each(function() {
      var legend = $(this).attr('data-group');
      var empindex = parseInt($(this).attr('data-index'));
      var legendArr = legend.split("/");
      legends[empindex] = legendArr[0]+'/'+legendArr[1];
      //legends[empindex] = legend;
    });

    return legends;
  }


  /**
   * After Year Filter - OnChange Handler
   */
  function afterYearFilter(chart) {
      var selectEle = $("#afterYearFilter");
      var groupClass = getGroupClasses();
      selectEle.on("change", function() {
          var groupIndex = parseInt($(this).find(":selected").attr("data-groupIndex"));
          var afterYear = parseInt($(this).val());

          config.groupClass = groupClass[groupIndex];
          config.afterYear = afterYear;

          config.chartContext++;
          isCustomDrillDown = true;
          isDrilledup = true;
          isDrilledDown = false;
          config.dataType = 'gender';

          if (chart) {
              chart.destroy();
              chart = null;
              selectEle.off("change");
              $(".employmentSectorMultiSearchGraphContainer .toggleDrilldown").off("change");
              $(".empBySector .graph-container__filters-dropdown ul li input").off("change");
              hideGenderRacefilters();

              chart = renderEnrolledTypeGraph(
                  genrateHighLevelData(config.afterYear),
                  "#employmentSectorGraph",
                  generateDrilldownData(".employment-sector-enrolled span", config.afterYear)
              );
          }


      });
  }

  /**
   * Generate High Level Data
   */
  function genrateHighLevelData(afterYear) {
      var groupClasses = getGroupClasses();
      var ikey = 0;
      var data = [];
      var groupData = [];
      var sectors = getSectorList();
      var agency = [];
      for (ikey; ikey < groupClasses.length; ikey++) {
          var j = 0;
          for (j; j < sectors.length; j++) {
              var group = $("#employmentSectorGraphData ." + groupClasses[ikey] + " " + '.sector-item.' + sectors[j] + " " + ".after-year[data-afteryear=" + afterYear + "]");
              var genderRaceAll = ".gender-All.race-All";
              if (group.length > 0) {
                  $.each(group, function(i) {
                      if ($(this).find(genderRaceAll).length > 0) {
                          var name = $(this).find(genderRaceAll + " .employment-sector-name").text().trim();
                          var count = $(this).find(genderRaceAll + " .employment-sector-enrolled span").text().trim();
                          var schoolYear = $(this).find(genderRaceAll + " .employment-sector-school-year").text().trim();
                          var searchCombination = $(this).find(genderRaceAll +" .employment-search-combination span").text().trim();

                          if (agency.indexOf(searchCombination) == -1) {
                              agency.push(searchCombination);
                          }
                          var k = 0;
                          var objItem = [];
                          for (k; k < ikey; k++) {
                              objItem.push(null);
                          }
                          var obj = {
                              // name: 'drilldownRace',
                              drillDownName: searchCombination,
                              id: name,
                              drillDownID: searchCombination,
                              y: parseInt(count),
                              drilldown: true
                          }
                          objItem.push(obj);
                          data.push(obj);

                      }
                  });
              }
          }
      }


      /**
       *  Categories Group Data
       */
      var result = [];
      $.each(data, function(i, val) {
          var flag = true;
          result.forEach((row, key) => {
              if (result.length > 0 && row.name == val.id) {
                  if (result[key].data.length == (agency.indexOf(val.drillDownID))) {
                      result[key].data.push(val);
                  } else {
                      var total = agency.indexOf(val.drillDownID) - result[key].data.length;
                      var j = 0;
                      for (j; j < total; j++) {
                          result[key].data.push(null);
                      }
                      result[key].data.push(val);
                  }
                  flag = false;
              }
          });
          if (flag) {
              result.push({
                  name: val.id,
                  drillDownID: val.drillDownID,
                  data: [val]
              });
          }
      });

      return {
          dataPoints: result,
          legends: chartLegends(),
      };
  }

  /**
   * Generate DrilldownData
   */
  function generateDrillDownSeries(ele, countEle, afterYear) {
      var drillDownData = [];
      var groupClasses = getGroupClasses();
      var ikey = 0;
      var sectors = getSectorList();
      for (ikey; ikey < groupClasses.length; ikey++) {
          var j = 0;
          for (j; j < sectors.length; j++) {
              $("#employmentSectorGraphData ." + groupClasses[ikey] + " " + '.sector-item.' + sectors[j] + " " + ".after-year[data-afteryear=" + afterYear + "]" + " " + ele).each(function(i) {
                  var name = $(this).find(".employment-sector-name").text().trim();
                  var itemVal = $(this).find(countEle).text().trim();
                  var scholYear = $(this).find(".employment-sector-school-year").text().trim();
                  var searchCombination = $(this).find(".employment-search-combination span").text().trim();
                  if (itemVal == -1 || itemVal == '' || itemVal == null) {
                      itemVal = null;
                  } else {
                      itemVal = parseInt(itemVal);
                  }
                  drillDownData.push({
                      name: name,
                      id: searchCombination,
                      drillDownID: searchCombination,
                      y: itemVal,
                  });

                  // return i < maxItems;
              });
          }
      }

      return {
          drillDownData: drillDownData,
      };
  }

  /**
   * Display Graph If Data Exists in Container
   */
  if ($("#employmentSectorGraphData").children().length > 0) {
      $("#employmentSectorGraphData").next(".graph-container").css({ display: "block" });

      /* Graph Init. */
      renderEnrolledTypeGraph(
          genrateHighLevelData(config.afterYear),
          "#employmentSectorGraph",
          generateDrilldownData(".employment-sector-enrolled span", config.afterYear)
      );
  }

   /*
   * * Generate Drilldown Data
   */
  function generateDrilldownData(countEle, afterYear) {
      var parentClass = ".employment-sector-list";
      var drillDownData = [];
      var dataLabels = ['All', 'Asian', 'Black', 'White', 'Other', 'Male', 'Female'];
      var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
      var i;
      for (i = 0; i < drillDownCombination.length; i++) {
          var data = new generateDrillDownSeries(
              parentClass + " " + drillDownCombination[i],
              countEle,
              afterYear
          );
          var obj = {
              [dataLabels[i]]: data.drillDownData
          };
          drillDownData.push(obj);
      }
      return drillDownData;
  }

  /**
   * Method - Filter Race and Gender Data
   */
  function filterDrilldownData(chart) {
      var genders = ["Male", "Female"];
      var races = ["Asian", "Black", "White", "Other"];
      var a = chart.series;
      if (config.dataType == 'race') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.name == genders[0] || p.userOptions.name == genders[1]) {
                  p.hide();
              } else {
                  p.show();
              }
          });
      }

      if (config.dataType == 'gender') {
          Highcharts.each(a, function(p, i) {
              if (p.userOptions.name == races[0] || p.userOptions.name == races[1] || p.userOptions.name == races[2] || p.userOptions.name == races[3]) {
                  p.hide();
              } else {
                  p.show();
              }
          });
      }
  }

  /**
   * Method - High Level Filter - Toggle Graph on the basis of Race/Gender
   */
  var isDrilledup = true;
  var isCustomDrillDown = true;
  var isDrilledDown = false;

  function toggleGraph(chart) {
      $(".empBySector .toggleDrilldown").off('change');
      $(".empBySector .toggleDrilldown").on('change', function() {
          isCustomDrillDown = false;
          var dataType = $(this).attr("name");
          var chartID = parseInt($(this).attr("id"));
          var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
          $(".empBySector .toggleDrilldown").prop('checked', false);
          $(".empBySector .toggleDrilldown").prop('disabled', false);
          $(this).prop('checked', true);
          $(this).prop('disabled', true);
          $(".graph-container__filters-dropdown").hide(0, function() {
              toggleCheckbox(el, false);
          });
          $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show(0, function() {
              toggleCheckbox(el, true);
          });
          config.dataType = dataType;
          if (isDrilledDown) {
              filterDrilldownData(chart);
          }
          if (isDrilledup) {
              Highcharts.charts[config.chartContext].series[0].points[0].doDrilldown();
          }
      });
  }

  /**
   * Hide Gender and Race Filter - If Drilledup
   */
  function hideGenderRacefilters() {
      $(".empBySector").find(".graph-container__filters-dropdown").hide();
      $(".empBySector").find(".toggleDrilldown").each(function() {
          $(this).prop("checked", false);
          $(this).prop("disabled", false);
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
   * Initial Filters
   */
  function initialFilters() {
      $(".empBySector .graph-container__filters-dropdown ul li input").each(
          function() {
              $(this).on('change', function() {
                  var id = $(this).attr("id");
                  var series = Highcharts.charts[config.chartContext].get(id);
                  if (series) {
                      series.setVisible(!series.visible);
                  }
              });
          }
      );
  }

  /**
   * Method - Render Graph
   */
  function renderEnrolledTypeGraph(chartData, eleID, drillDownData) {
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
                  load: function(event) {
                      afterYearFilter(this);
                      toggleGraph(this);
                      initialFilters();
                  },
                  drilldown: function(e) {
                      var containerId = this.container.id;
                      var drilldowns = [];
                      var chart = this;
                      var series = [];
                      var categories = [];
                      isDrilledup = false;
                      // Set Drilldown tickinterval on x-axis label values
                      chart.yAxis[0].options.tickInterval = 10;

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

                          var pointNameArr = e.point.options.drillDownName.split("/");
                          var pointName = pointNameArr[0]+'/'+pointNameArr[1]
                          chart.setTitle({ text: pointName });

                          function drillDownCategories(data) {
                              categories = [];
                              var j = 0;
                              for (j; j < data[0]['All'].length; j++) {
                                  if (data[0]['All'][j].drillDownID == $.trim(e.point.options.drillDownID) && (categories.indexOf(data[0]['All'][j].name) == -1)) {
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
                                  $.each(data1, function(key, value) {
                                      //if (data2[i][labels[i]].length < maxItems) {
                                          if (value.drillDownID == $.trim(e.point.options.drillDownID)) {
                                              data2[i][labels[i]].push(value);
                                          }
                                      //}
                                  });
                                  var obj = {
                                      [e.point.name]: {
                                          id: labels[i],
                                          name: labels[i],
                                          data: data2[i][labels[i]],
                                          color: colors[i],
                                      }
                                  };
                                  drilldowns.push(obj);
                              }

                              renderDrillDownSeries();
                              addDrilldownSeries();
                              chart.applyDrilldown();


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
                                  if (chart && Highcharts.charts[i]) {
                                      if (chart.renderTo.id !== Highcharts.charts[i].renderTo.id) {
                                          Highcharts.charts[i].drillUp();
                                      }
                                  }
                              }
                          }
                          drillUpChart();
                          // toggleGraph(chart);
                          renderDrillDownSeriesData(drillDownData, dataType);
                          filterDrilldownData(chart, dataType);
                          isDrilledDown = true;
                      }
                  },
                  drillup: function(e) {
                      this.xAxis[0].categories = mainCat;
                      var containerId = this.container.id;
                      var filterEle = $("#" + containerId).closest(".graph-container").find(".empBySector .graph-container__filters-dropdown");
                      isDrilledup = true;
                      isCustomDrillDown = true;
                      isDrilledDown = false;
                      config.dataType = "gender";

                      filterEle.hide();

                      $("#" + containerId).closest(".graph-container").find(".empBySector .toggleDrilldown").each(function() {
                          $(this).prop('checked', false);
                          $(this).prop('disabled', false);
                      });
                      this.options.legend["enabled"] = true;
                      this.setTitle({ text: '' });
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
                  //format: "${value}",
                  enabled: true,
                  tickLength: 10,
              },
          },
          xAxis: {
              type: "category",
              categories: chartData.legends,
          },
          title: {
              text: "",
          },
          legend: {
              enabled: true,
              reversed: true,
          },
          plotOptions: {
              series: {
                  stacking: 'normal',
                  events: {
                      legendItemClick: function() {
                          return false;
                      }
                  },
              }
          },
          tooltip: {
              useHTML: true,
              //pointFormat: '<b>{point.drillDownName} <b>, {point.y:,.0f}',
              pointFormatter: function() {
                  if (this.hasOwnProperty("drilldown")) {
                      return "<div class='tooltip1'><b>" + this.id + "<b>, " + Highcharts.numberFormat(this.options.y, 0, ",") + "</b></div>";
                  } else {
                      return "<div class='tooltip1'><b>" + this.category + ": " + this.series.name + "<b> - " + Highcharts.numberFormat(this.options.y, 0, ",") + "</b></div>";
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
      });
  }

  /**
   * Update ChartContext After All Chart init.
   */
  if (config) {
      config.chartContext = (Highcharts.chartCount == 2) ? 1 : 0;
  }
  });
})(jQuery, Drupal, drupalSettings);
