(function ($, Drupal, drupalSettings) {
  'use strict';
    $( document ).ready(function(event) {
      var isFieldEmpty = true;
      var param = [];
      var url='';
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
        var maxItems = 3;
        var yearClass = '.yearItem-0'
        $("#enrollmentTypeGraphData "+yearClass+ " .enrollment-type-row.gender-All.race-All .enrollment-type-name").each(function(i, ele) {
          var sector = $(this).text();
          totalData.push({name: sector, data:[] })
          sectors.push(sector)
          return i < maxItems;
        });
          
        var d1 = [];
        var et1 = [];
        var d2 = [];
        var et2 = [];
        var d3 = [];
        var et3 = [];
        var d4 = [];
        var et4 = [];
        var d5 = [];
        var et5 = [];
        var syear = '';
        var schoolYear = [];
        $("#enrollmentTypeGraphData " + ele).each(function (i, value) {
          if($(this).parents(".yearItem-0").length){ 
            syear = parseInt($.trim($(this).parents(".yearItem-0").find(".enrollment-type-school-year").text()));
            syear = syear + '-'+ (syear+1);     
            et1 = $.trim($(this).parents(".yearItem-0").find(".enrollment-type-name").text());
            var graduatedCount1 = $.trim($(this).parents(".yearItem-0").find('.enrollment-type-graduated-count').text());
            var enrolledCount1 = $.trim($(this).parents(".yearItem-0").find('.enrollment-type-enrolled-count').text());
            var itemVal1 = $.trim($(this).parents(".yearItem-0").find(countEle).text());
            if (graduatedCount1 == -1 || enrolledCount1 == -1 || itemVal1 == '' || itemVal1 == null) {
              itemVal1 = null;
            }else {
              itemVal1 = parseFloat(itemVal1);
            }        
            if(d1.length <5){
              var dr1 = {
                name: 'drilldownRace',
                drillDownName: et1,
                id: et1,
                drillDownID: syear,
                y: itemVal1,
                drilldown: true
              };
              d1.push(dr1);
            }
            if($.inArray(et1, sectors) != -1){
              var dr11 = {
                name: et1,
                id: et1,
                drillDownID: syear,
                y: itemVal1,
              };
              drillDownData.push(dr11);
            }
            if(schoolYear.indexOf(syear) == -1){ 
              schoolYear.push(syear);
            }
          }

          if($(this).parents(".yearItem-1").length){
            syear = parseInt($.trim($(this).parents(".yearItem-1").find(".enrollment-type-school-year").text()));
            syear = syear + '-'+ (syear+1);
            et2 = $.trim($(this).parents(".yearItem-1").find(".enrollment-type-name").text());
            var graduatedCount2 = $.trim($(this).parents(".yearItem-1").find('.enrollment-type-graduated-count').text());
            var enrolledCount2 = $.trim($(this).parents(".yearItem-1").find('.enrollment-type-enrolled-count').text());
            var itemVal2 = $.trim($(this).parents(".yearItem-1").find(countEle).text());
            if (graduatedCount2 == -1 || enrolledCount2 == -1 || itemVal2 == '') {
              itemVal2 = null;
            }else {
              itemVal2 = parseFloat(itemVal2);
            }               
            if(d2.length <5){
              var dr2 = {
                name: 'drilldownRace',
                drillDownName: et2,
                id: et2,
                drillDownID: syear,
                y: itemVal2,
                drilldown: true
              };
              d2.push(dr2);
            }
            if(drillDownData.length < 10){
              var dr22 = {
                name: et2,
                id: et2,
                drillDownID: syear,
                y:  itemVal2,
              };
              drillDownData.push(dr22);
            }
            if(schoolYear.indexOf(syear) == -1){  
              schoolYear.push(syear);
            }
          }

          if($(this).parents(".yearItem-2").length){
            syear = parseInt($.trim($(this).parents(".yearItem-2").find(".enrollment-type-school-year").text()));
            syear = syear + '-'+ (syear+1); 
            et3 = $.trim($(this).parents(".yearItem-2").find(".enrollment-type-name").text());
            var graduatedCount3 = $.trim($(this).parents(".yearItem-2").find('.enrollment-type-graduated-count').text());
            var enrolledCount3 = $.trim($(this).parents(".yearItem-2").find('.enrollment-type-enrolled-count').text());
            var itemVal3 = $.trim($(this).parents(".yearItem-2").find(countEle).text());
            if (graduatedCount3 == -1 || enrolledCount3 == -1 || itemVal3 == '') {
              itemVal3 = null;
            }else {
              itemVal3 = parseFloat(itemVal3);
            }               
            if(d3.length <5){
              var dr3 = {
                name: 'drilldownRace',
                drillDownName: et3,
                id:et3,
                drillDownID: syear,
                y: itemVal3,
                drilldown: true
              };
              d3.push(dr3);
            }

            if(drillDownData.length < 15){
              var dr13 = {
                name: et3,
                id: et3,
                drillDownID: syear,
                y:  parseFloat(itemVal3),
               
              };
              drillDownData.push(dr13);
            }
            if(schoolYear.indexOf(syear) == -1){  
              schoolYear.push(syear);
            }
          }

          if($(this).parents(".yearItem-3").length){
            syear = parseInt($.trim($(this).parents(".yearItem-3").find(".enrollment-type-school-year").text()));
            syear = syear + '-'+ (syear+1);
            et4 = $.trim($(this).parents(".yearItem-3").find(".enrollment-type-name").text());
            var graduatedCount4 = $.trim($(this).parents(".yearItem-3").find('.enrollment-type-graduated-count').text());
            var enrolledCount4 = $.trim($(this).parents(".yearItem-3").find('.enrollment-type-enrolled-count').text());
            var itemVal4 = $.trim($(this).parents(".yearItem-3").find(countEle).text());
            if (graduatedCount4 == -1 || enrolledCount4 == -1 || itemVal4 == '') {
              itemVal4 = null;
            }else {
              itemVal4 = parseFloat(itemVal4);
            }               
            if(d4.length <5){
              var dr4 = {
                name: 'drilldownRace',
                drillDownName: et4,
                id: et4,
                drillDownID: syear,
                y: itemVal4,
                drilldown: true
              };
              d4.push(dr4);
            }

            if(drillDownData.length < 20){
              var dr14 = {
                name: et4,
                id: et4,
                drillDownID: syear,
                y: parseFloat(itemVal4),
              };
              drillDownData.push(dr14);
            }
            if(schoolYear.indexOf(syear) == -1){  
              schoolYear.push(syear);
            }
          }

          if($(this).parents(".yearItem-4").length){
            syear = parseInt($.trim($(this).parents(".yearItem-4").find(".enrollment-type-school-year").text()));
            syear = syear + '-'+ (syear+1);
            et5 = $.trim($(this).parents(".yearItem-4").find(".enrollment-type-name").text());
            var graduatedCount5 = $.trim($(this).parents(".yearItem-4").find('.enrollment-type-graduated-count').text());
            var enrolledCount5 = $.trim($(this).parents(".yearItem-4").find('.enrollment-type-enrolled-count').text());
            var itemVal5 = $.trim($(this).parents(".yearItem-4").find(countEle).text());
            
            if (graduatedCount5 == -1 || enrolledCount5 == -1 || itemVal5 == '') {
              itemVal5 = null;
            }else {
              itemVal5 = parseFloat(itemVal5);
            }               
            if(d5.length <5){
              var dr5 = {
                name: 'drilldownRace',
                drillDownName: et5,
                id: et5,
                drillDownID: syear,
                y: itemVal5,
                drilldown: true
              };
              d5.push(dr5);
            }

            if(drillDownData.length < 25){
              var dr15 = {
                name: et5,
                id: et5,
                drillDownID: syear,
                y: parseFloat(itemVal5),
              };
              drillDownData.push(dr15);
            }
            if(schoolYear.indexOf(syear) == -1){  
              schoolYear.push(syear);
            }
          }

        });
        if(d1 != ''){
          totalData.forEach((row, key) => {
            if(d1[key] != null)
              totalData[key].data.push(d1[key]);
            else
            totalData[key].data.push(null);  
          });
          
        }
        if(d2 != ''){
          totalData.forEach((row, key) => {
            if(d2[key] != null)
              totalData[key].data.push(d2[key]);
            else
            totalData[key].data.push(null);  
          });
        }
        if(d3 != ''){
          totalData.forEach((row, key) => {
            if(d3[key] != null)
              totalData[key].data.push(d3[key]);
            else
            totalData[key].data.push(null);  
          });
        }
        if(d4 != ''){
          totalData.forEach((row, key) => {
            if(d4[key] != null)
              totalData[key].data.push(d4[key]);
            else
            totalData[key].data.push(null);  
          });
        }
        if(d5 != ''){
          totalData.forEach((row, key) => {
            if(d5[key] != null)
              totalData[key].data.push(d5[key]);
            else
            totalData[key].data.push(null);  
          });
        }
        return {
          dataPoints: totalData,
          legends: schoolYear,
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
        if ($("#entrollmentTypeGraphData").children().length > 0) {
        $(".graph-container").css({ display: "block" });
      }
      /* Generate gender-all and race-all data */

      var studentEnrolledDataMultiSearch = new generateJsonData(
        ".enrollment-type-list .gender-All.race-All",
        ".enrollment-type-enrolled span",
        "drilldownRace"
      );

      /* Generate Drilldown Data */
      function generateDrilldownData(countEle) {
        var parentClass = ".enrollment-type-list";
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
        "#enrolledTypeGraph",
        generateDrilldownData(".enrollment-type-enrolled span")
      );

      /* Filters */
      function filterDrilldownData(chart, dataType) {
        var genders = ["Male", "Female"];
        var races = ["Asian", "Black", "White", "Other"];
        var a = chart.series;
        if (dataType == 'race') {
            Highcharts.each(a, function(p, i) {
                if (p.userOptions.name == genders[0] || p.userOptions.name == genders[1]) {
                  p.hide(); 
                } else {
                  p.show();
                }

            });
        }

        if (dataType == 'gender') {
            Highcharts.each(a, function(p, i) {
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
        $(".enrollmentFilters ._toggleDrilldown").on('change', function() {
            isCustomDrillDown = false;
            var dataType = $(this).attr("name");
            var chartID = parseInt($(this).attr("id"));
            var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
            $(".enrollmentFilters ._toggleDrilldown").prop('checked', false);
            $(".enrollmentFilters ._toggleDrilldown").prop('disabled', false);
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
            /*
            if (chartID == 0) {
              Highcharts.charts[1].drillUp();
            }*/

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

      function renderEntrollmentTypeGraph(chartData, eleID, drillDownData) {
          var chartPoints = [];
          if(chartData.dataPoints){
            chartPoints = chartData.dataPoints.reverse();
          }
          var mainCat=[];
          var dataType = 'gender';
          $(eleID).highcharts({
            chart: {
              type: 'bar',
              lang: {
                noData: "No data to display",
                loading: "Loading...",
              },
              events: {
                drilldown: function(e) {
                  var containerId = this.container.id;
                  var drilldowns = [];
                  var chart = this;
                  var series = [];
                  var categories=[];
                  isDrilledup = false;

                  if(mainCat.length >0)
                  this.xAxis[0].categories = mainCat;
                  else
                  mainCat = this.xAxis[0].categories; 

                  $("#" + containerId)
                      .parents(".graph-container")
                      .find(".graph-container__sorting")
                      .show();
                  this.options.legend["enabled"] = true;
                  $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                  if(isCustomDrillDown) { 
                    $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                    $(".enrollmentFilters ._toggleDrilldown").first().prop('checked', false);
                    $(".enrollmentFilters ._toggleDrilldown").first().prop('disabled', false);
                    $(".enrollmentFilters ._toggleDrilldown").first().prop('checked', true);
                    $(".enrollmentFilters ._toggleDrilldown").first().prop('disabled', true);
                    $(".graph-container__filters-dropdown").hide();
                    $(".enrollmentFilters ._toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown').show();
                    $(".enrollmentFilters ._toggleDrilldown").first().parents('.graph-container__filters').find('.graph-container__filters-dropdown input').prop('checked', true);
                  }
                  
                  if (!e.seriesOptions) {
                    //chart.setTitle({ text: e.point.options.drillDownID + ' Cohort' });
                    chart.setTitle({ text: '' });
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
                          if(categories.indexOf(value.name) == -1 )
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
                  this.xAxis[0].categories = mainCat;
                    var containerId = this.container.id;
                    var filterEle = $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown");
                      isDrilledup = true;
                      isCustomDrillDown = true;
                      dataType = 'gender';
                      filterEle.hide();
                      this.options.plotOptions.series["stacking"] = 'normal';
                      $("#" + containerId).parents(".graph-container").find(".graph-container__sorting.enrollmentFilters ._toggleDrilldown").each(function() {
                        $(this).prop('checked', false);
                          $(this).prop('disabled', false);
                      });
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
              },
              tickInterval: 10,
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
               pointFormatter: function() {
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
            series: chartPoints,
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
      /*@end of drupal behaviors.... */
    })
})(jQuery, Drupal, drupalSettings);
