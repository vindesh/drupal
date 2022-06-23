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

    function getGroupClasses() {
      var container = $("#entrollmentTypeGraphData");
      var groupClasses = [];
      container.find(".view-grouping").each(function() {
        var className = $(this).attr('data-empclass');
        groupClasses.push(className);
      });
      return groupClasses;
    }

    /**
     * Generate Chart Legends
     */
    function chartLegends() {
      var container = $("#entrollmentTypeGraphData");
      var legends = [];
      container.find(".view-grouping").each(function() {
        var legend = $(this).attr('data-year');
        var result = legend.split("/");
        legends.push(result[0]+'/'+result[1]);
      });
      return legends;
    }

    /**
     * 
     * Generate High Level Data
     */
    function genrateHighLevelData() {
      var groupClasses = getGroupClasses();
      var ikey = 0;
      var data = [];
      var groupData = [];
      var sectors = ["Below-Bachelors", "Graduate", "Bachelors", "Non-credit"];
      var agency = [];
      for (ikey; ikey < groupClasses.length; ikey++) {
        var j = 0;
        for (j; j< sectors.length; j++) {
          var group = $("#entrollmentTypeGraphData ."+groupClasses[ikey] + " " + '.sector-item.'+sectors[j]);
          var genderRaceAll = ".gender-All.race-All";
          if(group.length > 0) {
            $.each(group, function(i) {  
              if ($(this).find(genderRaceAll).length > 0) {
                var name = $(this).find(genderRaceAll+" .enrollment-type-name").text().trim();
                var count = $(this).find(genderRaceAll+" .enrollment-type-enrolled span").text().trim();
                var schoolProgramName = $(this).find(genderRaceAll+" .enrollment-type-agency").text().trim() + "/" + 
                                        $(this).find(genderRaceAll+" .enrollment-type-program").text().trim();
                var searchCombination = $(this).find(genderRaceAll+" .enrollment-search-combination span").text().trim();
                if(agency.indexOf(searchCombination) == -1)
                  agency.push(searchCombination);
                var k=0;
                var objItem=[];
                for(k; k< ikey; k++){
                  objItem.push(null);
                }
                var obj = {
                  name: 'drilldownRace',
                  drillDownName: schoolProgramName,
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
        result.forEach((row, key)=>{ 
          if(result.length > 0 && row.name == val.id ) { 
            if( result[key].data.length == (agency.indexOf(val.drillDownID) ) ) {        
              result[key].data.push(val);
            }else{
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
        if(flag){
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
    function generateDrillDownSeries(ele, countEle, drillDownName, dataFlag) {
      var drillDownData = [];
      var groupClasses = getGroupClasses();
      var ikey = 0;
      for (ikey; ikey < groupClasses.length; ikey++) {
        $("#entrollmentTypeGraphData ." + groupClasses[ikey] + " " + ele).each(function (i) {
          var itemVal = $(this).find(countEle).text().trim();
          var schoolProgramName = $(this).find(".enrollment-type-agency").text().trim() + "/" + $(this).find(".enrollment-type-program").text().trim();
          var schoolProgramDegree = schoolProgramName + "/" + $(this).find(".enrollment-type-degree").text().trim();
          var employmentSector = $(this).find(".enrollment-type-name").text().trim();
          if (itemVal == -1 || itemVal == '' || itemVal == null) {
            itemVal = null;
          } else {
            itemVal = parseInt(itemVal);
          }
          drillDownData.push({
            name: employmentSector,
            id: employmentSector,
            drillDownID: schoolProgramDegree,
            y: itemVal,
          });
        });
      } //End of for loop
      return {
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
    if ($("#entrollmentTypeGraphData").children().length > 0) {
      $(".graph-container").css({ display: "block" });
      
      /* Generate Drilldown Data */
      function generateDrilldownData(countEle) {
        var parentClass = ".enrollment-type-list";
        var drillDownData = [];
        var dataLabels = ['All', 'Asian', 'Black', 'White', 'Other', 'Male', 'Female'];
        var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
        var i;
        for (i = 0; i < drillDownCombination.length; i++) {
          var data = new generateDrillDownSeries(
            parentClass + " " + drillDownCombination[i],
            countEle,
            "drilldownRace"
          );
          var obj = { [dataLabels[i]]: data.drillDownData };
          drillDownData.push(obj);
        }
        
        return drillDownData;
      }

      /* Enrolled */
      renderEnrolledTypeGraph(
        genrateHighLevelData(),
        "#enrolledTypeGraph",
        generateDrilldownData(".enrollment-type-enrolled span")
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
      $(".enrolledByType .toggleDrilldown").off('change');
      $(".enrolledByType .toggleDrilldown").on('change', function () {
        isCustomDrillDown = false;
        var dataType = $(this).attr("name");
        var chartID = parseInt($(this).attr("id"));
        var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
        $(".enrolledByType .toggleDrilldown").prop('checked', false);
        $(".enrolledByType .toggleDrilldown").prop('disabled', false);
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
                chart.setTitle({ text: e.point.options.drillDownName });

                function drillDownCategories(data) {
                  categories = [];
                  var j = 0;
                  for(j; j<data[0]['All'].length; j++) {
                    if (data[0]['All'][j].drillDownID == $.trim(e.point.options.drillDownID) && (categories.indexOf(data[0]['All'][j].name) == -1 )) {
                      categories.push(data[0]['All'][j].name);
                    }
                  }
                  chart.xAxis[0].categories = categories;
                }

                function renderDrillDownSeriesData(data, type) {
                  var i;
                  var maxItems = 4
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
                      if(data2[i][labels[i]].length < maxItems) { 
                        if (value.drillDownID == $.trim(e.point.options.drillDownID)) {
                          data2[i][labels[i]].push(value);
                        }
                      }
                    });
                    var obj = {drilldownRace:{
                      id: labels[i],
                      name: labels[i],
                      data: data2[i][labels[i]],
                      color: colors[i],
                    }}
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

              $("#" + containerId).closest(".graph-container").find(".enrolledByType .toggleDrilldown").each(function () {
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
            format: '{value}%',
            enabled: true,
            tickLength:10,
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
              return "<div class='tooltip1'><b>" + this.id + "<b>, " + this.options.y + "%</b></div>";
            } else {
              return "<div class='tooltip1'><b>" + this.category + ", " + this.series.name + "<b>, " + this.options.y + "%</b></div>";
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
          $(".enrolledByType .graph-container__filters-dropdown ul li input").each(
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