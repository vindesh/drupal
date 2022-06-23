(function ($, Drupal, drupalSettings) {
  'use strict';
  $(document).ready(function(event) {

    /**
     * Config
     */

    var config = {
        groupClass: 'enrollmentType-0',
        afterYear: 1,
        chartContext: 1,
        dataType: 'gender',
    }

    /**
     * Toggle Table and Graph View - Click Handler
     */
    $(".graph-view-action1").on("click", function() {
        $(".graph-view-container1").show();
        $(".table-view-container1").hide();
        $(".graph-container__sorting.enrollmentFilters").show();
    });

    $(".table-view-action1").on("click", function() {
        $(".graph-view-container1").hide();
        $(".table-view-container1").show();
        $(".graph-container__sorting.enrollmentFilters").hide();
    });

    /**
     * Filter/Drilldown on student data table
     * @param {*} gender 
     * @param {*} race 
     * @param {*} isStudentEnrolled 
     */  
    function filterDrilldownTableData(gender, race, afterYear='', school='', program='', degree=''){ 
      var filterTableData, tableID;
      tableID = '#enrollmentTypeTable';
      
      var preSelectRows = [
            {
                rows: gender,
                column: 4
            },
            {
                rows: race,
                column: 5
            },
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
            //searchPanes: {
            searchPanes: {
                preSelect: preSelectRows
            },
            //},
            columnDefs: columns,
            
        });
      }    
    
      filterTableData.buttons( 0, null ).containers().appendTo( '#enrollmentTypeTableExportButton' );
      
    }
    /**
     * Variable define and Init filterStudentTableData
     */
    var gender = ['All', 'Male', 'Female'];
    var race = ["All", "Asian", "Black", "White", "Other"];
    var filterAfterYear = $("#afterYearFilter").find(":selected").val();
    filterDrilldownTableData([gender[0]], [race[0]], [filterAfterYear]);
    /* End of filterStudentTableData */


    /**
     * Method - Get Group Class
     */
    function getGroupClasses() {
        var container = $("#enrollmentTypeGraphData");
        var groupClasses = [];
        container.find(".view-grouping").each(function() {
            var className = $(this).attr('data-empclass');
            var empindex = $(this).attr('data-index');
            //groupClasses.push(className);
            groupClasses[empindex] = className;
        });

        return groupClasses;
    }

    /**
     * Get all sector from views result
     */
    function getSectorList() {
        var container = $("#enrollmentTypeGraphData");
        var sector = [];
        container.find(".view-grouping").each(function() {
            var className = $(this).attr('data-empclass');
            container.find("." + className + " .sector-item").each(function() {
                var sectorName = $(this).attr('data-sector');
                if (sector.indexOf(sectorName) == -1) {
                    sector.push(sectorName);
                }
            });

        });
        return sector;
    }

    /**
     * Generate Chart Legends
     */
    function chartLegends() {
        var container = $("#enrollmentTypeGraphData");
        var legends = [];
        container.find(".view-grouping").each(function() {
          var legend = $(this).attr('data-group');
          var empindex = $(this).attr('data-index');
          var legendArr = legend.split("/");
          //legends.push(legendArr[0]+'/'+legendArr[1]);
          //legends.push(legend);
          legends[empindex] = legendArr[0]+'/'+legendArr[1];
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

            // getSectorCount(window.config.groupClass);

            if (chart) {
                chart.destroy();
                chart = null;
                selectEle.off("change");
                $(".employmentTypeMultiSearchGraphContainer .toggleDrilldown").off("change");
                $(".enrolledByType .graph-container__filters-dropdown ul li input").off("change");
                hideGenderRacefilters();

                chart = renderEnrolledTypeGraph(
                    genrateHighLevelData(config.afterYear),
                    "#enrolledTypeGraph",
                    generateDrilldownData(".enrollment-type-enrolled span", config.afterYear)
                );
            }
            /**
             * Drilldown table filter on After year value changed
             */
            filterAfterYear = afterYear.toString();    
            filterDrilldownTableData([gender[0]], [race[0]], [filterAfterYear]);//Gender=All & Race=All - filter

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
                var group = $("#enrollmentTypeGraphData ." + groupClasses[ikey] + " " + '.sector-item.' + sectors[j] + " " + ".after-year[data-afteryear=" + afterYear + "]");
                var genderRaceAll = ".gender-All.race-All";
                if (group.length > 0) {
                    $.each(group, function(i) {
                        if ($(this).find(genderRaceAll).length > 0) {
                            var name = $(this).find(genderRaceAll + " .enrollment-type-name").text().trim();
                            var count = $(this).find(genderRaceAll + " .enrollment-type-enrolled span").text().trim();
                            var schoolYear = $(this).find(genderRaceAll + " .enrollment-type-school-year").text().trim();
                            var searchCombination = $(this).find(genderRaceAll + " .enrollment-search-combination span").text().trim();
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
        for (ikey; ikey < groupClasses.length; ikey++) {
            $("#enrollmentTypeGraphData ." + groupClasses[ikey] + " " + ".after-year[data-afteryear=" + afterYear + "]" + " " + ele).each(function(i) {
                var name = $(this).find(".enrollment-type-name").text().trim();
                var itemVal = $(this).find(countEle).text().trim();
                var scholYear = $(this).find(".enrollment-type-school-year").text().trim();
                var searchCombination = $(this).find(".enrollment-search-combination span").text().trim();

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
            });
        } //End of for loop
        return {
            drillDownData: drillDownData,
        };
    }

    /* *
      Generate Drilldown Data
    */
    function generateDrilldownData(countEle, afterYear) {
      var parentClass = ".enrollment-type-list";
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
     * Display Graph If Data Exists in Container
     */
    if ($("#enrollmentTypeGraphData").children().length > 0) {
        $("#enrollmentTypeGraphData").next(".graph-container").css({ display: "block" });
        

        /* Enrolled */
        renderEnrolledTypeGraph(
            genrateHighLevelData(config.afterYear),
            "#enrolledTypeGraph",
            generateDrilldownData(".enrollment-type-enrolled span", config.afterYear)
        );
    }

    /**
     * Method - Filter Race and Gender Data
     */
    function filterDrilldownData(chart) {
        var genders = ["Male", "Female"];
        var races = ["Asian", "Black", "White", "Other"];
        var a = chart.series;
        var schoolProgram = chart.title.textStr.split('/');
        if (config.dataType == 'race') {
            Highcharts.each(a, function(p, i) {
                if (p.userOptions.name == genders[0] || p.userOptions.name == genders[1]) {
                    p.hide();
                } else {
                    p.show();
                }
            });

            filterDrilldownTableData([gender[0]], race, [filterAfterYear], [schoolProgram[0]], [schoolProgram[1]], [schoolProgram[2]]);//Race - filter
        }

        if (config.dataType == 'gender') {
            Highcharts.each(a, function(p, i) {
                if (p.userOptions.name == races[0] || p.userOptions.name == races[1] || p.userOptions.name == races[2] || p.userOptions.name == races[3]) {
                    p.hide();
                } else {
                    p.show();
                }
            });

            filterDrilldownTableData(gender, [race[0]], [filterAfterYear], [schoolProgram[0]], [schoolProgram[1]], [schoolProgram[2]]);//Gender - filter
        }
    }

    /**
     * Method - High Level Filter - Toggle Graph on the basis of Race/Gender
     */
    var isDrilledup = true;
    var isCustomDrillDown = true;
    var isDrilledDown = false;

    function toggleGraph(chart) {
        $(".enrolledByType .toggleDrilldown").off('change');
        $(".enrolledByType .toggleDrilldown").on('change', function() {
            isCustomDrillDown = false;
            var dataType = $(this).attr("name");
            var chartID = parseInt($(this).attr("id"));
            var el = $(this).parents('.graph-container__filters').find('.graph-container__filters-dropdown input');
            $(".enrolledByType .toggleDrilldown").prop('checked', false);
            $(".enrolledByType .toggleDrilldown").prop('disabled', false);
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
        $(".enrolledByType").find(".graph-container__filters-dropdown").hide();
        $(".enrolledByType").find(".toggleDrilldown").each(function() {
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
        $(".enrolledByType .graph-container__filters-dropdown ul li input").each(
            function() {
                $(this).on('change', function() {
                    var id = $(this).attr("id");
                    var series = Highcharts.charts[config.chartContext].get(id);
                    if (series) {
                        series.setVisible(!series.visible);
                        var schoolProgram = series.chart.title.textStr.split('/');
                        /**
                         * Table data sort according to chart drilldonw
                         */
                        var type = $(this).parents(".graph-container__filters").find(".toggleDrilldown").attr("name");
                        if(type == 'gender'){
                            var genderFilter = gender;
                            (genderFilter.indexOf(id) == -1) ? genderFilter.push(id) : genderFilter.splice($.inArray(id, genderFilter), 1);
                            if(genderFilter.length==0) genderFilter = ['none'];
                            filterDrilldownTableData(genderFilter, [race[0]],[filterAfterYear], [schoolProgram[0]], [schoolProgram[1]], [schoolProgram[2]] );//Gender filter
                        }else{
                            var raceFilter = race;
                            (raceFilter.indexOf(id) == -1) ? raceFilter.push(id) : raceFilter.splice($.inArray(id, raceFilter), 1);
                            if(raceFilter.length==0) raceFilter = ['none'];
                            filterDrilldownTableData([gender[0]], raceFilter, [filterAfterYear], [schoolProgram[0]], [schoolProgram[1]], [schoolProgram[2]] );//Race filter
                        }
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
                          //var pointNameArr = e.point.options.drillDownName.split("/");
                          var pointName = e.point.options.drillDownName;
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
                                    $.each(data1, function(key, value) {
                                        if (data2[i][labels[i]].length < maxItems) {
                                            if (value.drillDownID == $.trim(e.point.options.drillDownID)) {
                                                data2[i][labels[i]].push(value);
                                            }
                                        }
                                    });
                                    var obj = {
                                        [e.point.name]: {
                                            id: labels[i],
                                            name: labels[i],
                                            data: data2[i][labels[i]],
                                            color: colors[i],
                                        }
                                    };

                                    // var obj = {
                                    //     [e.point.name]: {
                                    //         id: labels[i],
                                    //         name: labels[i],
                                    //         color: Highcharts.getOptions().colors[i],
                                    //         data: data[i][labels[i]],
                                    //     },
                                    // };

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
                        var filterEle = $("#" + containerId).closest(".graph-container").find(".enrolledByType .graph-container__filters-dropdown");
                        isDrilledup = true;
                        isCustomDrillDown = true;
                        isDrilledDown = false;
                        config.dataType = "gender";

                        filterEle.hide();

                        $("#" + containerId).closest(".graph-container").find(".enrolledByType .toggleDrilldown").each(function() {
                            $(this).prop('checked', false);
                            $(this).prop('disabled', false);
                        });
                        this.options.legend["enabled"] = true;
                        this.setTitle({ text: '' });

                        filterDrilldownTableData([gender[0]], [race[0]], [filterAfterYear]);//Gender=All & Race=All - filter
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
