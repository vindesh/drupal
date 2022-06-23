(function ($, Drupal, drupalSettings) {
  'use strict';
  //Drupal.behaviors.studentMultiSearchBehavior = {
    //attach: function (context, settings) {
    $( document ).ready(function(event) {
      var isFieldEmpty = true;
      var param = [];
      var url='';
      var urlParam = parseQueryStringToDictionaryET(window.location.search);
      window.config = {
        chartContext: (Highcharts.chartCount == 2) ? 1 : 0,
        dataType: 'gender',
      };
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
        var sectors = [];
        var maxItems = 4;
        var yearClass = '.yearItem-0'
        $("#employmentSectorGraphData "+yearClass+ " .level-1 .employment-sector-name").each(function(i, ele) {
          var sector = $(this).text();
          totalData.push({name: sector, data:[] })
          sectors.push(sector)
          return i < maxItems;
        });
        var afterYearsArr = [];

        var d1 = [];
        var y1 = '';
        var y12 = '';
        var et1 = [];
        var yearsArr = [];
        $("#employmentSectorGraphData " + ele).each(function (i, value) {
          
          if($(this).parents(yearClass).length){
            y1 = parseInt($.trim($(this).parents(yearClass).find(".employment-sector-school-year").text()));
            y12 = y1+1;    
            et1 = $.trim($(this).parents(yearClass).find(".employment-sector-name").text());
            
            var itemVal1 = $.trim($(this).parents(yearClass).find(countEle).text());
            if (itemVal1 == -1 || itemVal1 == '' || itemVal1 == null) {
              itemVal1 = null;
            }else {
              itemVal1 = parseFloat(itemVal1);
            }        
            if(d1.length <5){
              var dr1 = {
                name: 'drilldownRace',
                //name: y1+"/"+y12,
                drillDownName: et1,
                id: et1,
                drillDownID: y1+"-"+y12,
                y: itemVal1,
                drilldown: true
              };
              d1.push(dr1);
            }
            if($.inArray(et1, sectors) != -1){
              var dr11 = {
                name: et1,
                id: et1,
                drillDownID: y1+"-"+y12,
                y: itemVal1,
              };
              drillDownData.push(dr11);
            }
            if($.inArray(y1+"-"+y12, yearsArr) == -1){
              yearsArr.push(y1+"-"+y12);
            }
          }
          // return i < maxItems;
        });
        if(d1 != ''){
          totalData.forEach((row, key) => {
            if(d1[key] != null)
              totalData[key].data.push(d1[key]);
            else
            totalData[key].data.push(null);  
          });
        }
        return {
          dataPoints: totalData,
          legends: yearsArr,
          drillDownData: drillDownData,
        };
      }

      // Toggle Graph and Table View
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
        if ($("#employmentSectorGraphData").children().length > 0) {
        $(".graph-container").css({ display: "block" });
      }
      /* Generate gender-all and race-all data */

      var studentEnrolledDataMultiSearch = new generateJsonData(
        ".employment-sector-list .gender-All.race-All",
        ".employment-sector-enrolled span",
        "drilldownRace"
      );

      /* Generate Drilldown Data */
      function generateDrilldownData(countEle) {
        var parentClass = ".employment-sector-list";
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
      renderEntrollmentTypeGraph(
        studentEnrolledDataMultiSearch,
        "#employmentSectorGraph1",
        generateDrilldownData(".employment-sector-enrolled span")
      );

      /* Filters */
      function filterDrilldownData(chart) {
        var genders = ["Male", "Female"];
        var races = ["Asian", "Black", "White", "Other"];
        var a = chart.series;
        if (window.config.dataType == 'race') {
            Highcharts.each(a, function(p, i) {
                if (p.userOptions.name == genders[0] || p.userOptions.name == genders[1]) {
                  p.hide(); 
                } else {
                  p.show();
                }

            });
        }

        if (window.config.dataType == 'gender') {
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
         * Hide Gender and Race Filter - If Drilledup
         */
       function employmentHideGenderRacefilters() {
        $(".employment-sector-filter").find(".graph-container__filters-dropdown").hide();
        $(".employment-sector-filter").find(".graph-container__filters .toggleDrilldown").each(function() {
            $(this).prop("checked", false);
            $(this).prop("disabled", false);
        });
      }

      var isCustomDrillDown = true;
      var isDrilledup = true;
      var isDrilledDown = false;
      function toggleGraph(chart) {
        $(".employment-sector-filter .toggleDrilldown").off("change");
        $(".employment-sector-filter .toggleDrilldown").on('change', function() {
            isCustomDrillDown = false;
            var dataType = $(this).attr("name");
            var chartID = parseInt($(this).attr("id"));
            var el = $(this).closest('.graph-container__filters').find('.graph-container__filters-dropdown input');
            $(".employment-sector-filter .toggleDrilldown").prop('checked', false);
            $(".employment-sector-filter .toggleDrilldown").prop('disabled', false);
            $(this).prop('checked', true);
            $(this).prop('disabled', true);
            $(".employment-sector-filter .graph-container__filters-dropdown").hide(0, function() {
                toggleCheckbox(el, false);
            });
            $(this).closest('.graph-container__filters').find('.graph-container__filters-dropdown').show(0, function() {
                toggleCheckbox(el, true);
            });
            // drillUpChart(chart);
            window.config.dataType = dataType;
            if (isDrilledDown) {
              filterDrilldownData(chart);
            }

            if (isDrilledup) {
              Highcharts.charts[
                  config.chartContext
              ].series[0].points[0].doDrilldown();
            }
        });
      }

      function toggleCheckbox(el, val) {
        el.each(function() {
            $(this).prop('checked', val);
        })
      }

      function drillUpChart(chart) {
        var i;
        if (chart) {
          for (i = 0; i < Highcharts.charts.length; i++) {
            Highcharts.charts[i].drillUp();
          }
        }
      }

      function removeChangeHandlerFromFilters() {
        $(".employment-sector-filter .graph-container__filters-dropdown ul li input").each(function() {
          $(this).off("change");
        });
      }

      function initialFilters() {
        $(".employment-sector-filter .graph-container__filters-dropdown ul li input").each(function() {
          $(this).on("change", function() {
            var id = $(this).attr("id");
            var series = Highcharts.charts[config.chartContext].get(id);
            if (series) {
              series.setVisible(!series.visible);
            }
          });
        });
      }
    

      function renderEntrollmentTypeGraph(chartData, eleID, drillDownData) {
          var chartPoints = [];
          if(chartData.dataPoints){
            chartPoints = chartData.dataPoints.reverse();
          }
          var mainCat=[];
          Highcharts.setOptions({
            lang: {
                noData: "No data to display",
                loading: "Loading...",
                thousandsSep: ",",
            },
          });
          $(eleID).highcharts({
            chart: {
              type: 'bar',
              lang: {
                noData: "No data to display",
                loading: "Loading...",
              },
              events: {
                load: function(){
                  toggleGraph(this);
                  initialFilters();
                },
                drilldown: function(e) {
                  // var containerId = this.container.id;
                  var drilldowns = [];
                  var chart = this;
                  var series = [];
                  var categories=[];
                  isDrilledup = false;
                  this.options.legend["enabled"] = true; 
                  if(mainCat.length >0)
                  this.xAxis[0].categories = mainCat;
                  else
                  mainCat = this.xAxis[0].categories; 
                                 
                  if(isCustomDrillDown) {
                    $('.graph-container').find(".graph-container__filters-dropdown").hide();
                    $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                    $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                    $(chart.renderTo).closest('.graph-container').find(".graph-container__filters-dropdown").first().show();
                    $(chart.renderTo).closest('.graph-container').find(".graph-container__filters").first().find(".graph-container__filters-dropdown input").prop('checked', true);
                    $(chart.renderTo).closest('.graph-container').find(".toggleDrilldown").first().prop('checked', true);
                  }
                  
                  if (!e.seriesOptions) {
                    //chart.setTitle({ text: e.point.options.drillDownID });
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
                          
                          if(categories.indexOf(value.name) == -1)
                            categories.push(value.name);
                          if(value.drillDownID == $.trim(e.point.options.drillDownID) ) {
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
                   
                    //update drilldown category....
                    this.xAxis[0].categories = categories;

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
                    drillUpChart(chart);
                    renderDrillDownSeriesData(drillDownData, window.config.dataType);
                    filterDrilldownData(chart);
                    removeChangeHandlerFromFilters();
                    initialFilters();
                    isDrilledDown = true;
                  }
                },
                drillup: function(e) {
                  this.xAxis[0].categories = mainCat;
                  isDrilledup = true;
                  isDrilledDown = false;
                  isCustomDrillDown = true;
                  window.config.dataType = "gender";
                  this.setTitle({ text: '' });
                  employmentHideGenderRacefilters();
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
            legend: {
              enabled: true,
              reversed: true
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
            tooltip:{
              useHTML:true,
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
            series: chartPoints,
          });
      }
      /*@end of drupal behaviors.... */
      window.config.chartContext = (Highcharts.chartCount == 2) ? 1 : 0;
    })
   // },
  //};
})(jQuery, Drupal, drupalSettings);
