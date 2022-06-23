(function ($, Drupal, drupalSettings) {
  'use strict';
  $(document).ready(function() {
    if ($("#employmentWagesGraphData").children().length > 0) {
        $(".graph-container").css({ display: "block" });

        /**
         *** New logic
         */

        window.config = {
            chartContext: (Highcharts.chartCount == 2) ? 1 : 0,
            yearIndex: 0,
            groupClass: '',
            sectorCount: 0,
            dataType: 'gender',
        };

        /**
         * Get First Search Group Class - To Display The Data on Initial Load
         */
        function getFirstGroupClass() {
            var container = $("#employmentWagesGraphData .view-grouping").first();
            var groupClass = $(container).attr('data-yearclass');
            window.config.groupClass = groupClass;
        }
        getFirstGroupClass();


        /**
         * Get Years
         */
        var selectDropdownYears = [];

        function getYears() {
            var container = $("#employmentWagesGraphData");

            container.find(".view-grouping").each(function() {
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
            container.find(".view-grouping").each(function() {
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
            ).each(function(i, ele) {
                var sector = $(this).attr("data-sector");
                sectors.push(sector);
                return i < maxItems;
            });

            for (var i = 0; i < sectors.length; i++) {
                var str = sectors[i];
                var newStr = str.replace(/-/g, " ");
                sectorsList.push(newStr);
            }

            return sectorsList;
        }

        function getYearClasses() {
            var classes = [];
            var container = $("#employmentWagesGraphData .view-grouping");
            container.each(function() {
                var className = $(this).attr("data-yearclass");
                classes.push(className);
            });

            return classes;
        }

        /**
         * After year change handler
         */

        function afterYearChangeHandler(chart) {
            $("#employmentWagesAfterYearFilter").on("change", function() {
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
            Highcharts.each(a, function(p, i) {
                // var b = p.data[0].series;
                Highcharts.each(a, function(q, index) {
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
                if (!isNaN(years[i])) {
                    selectEle.append(
                        "<option data-id=" + i + ">" + years[i] + "</option>"
                    );
                }
            }
        }

        /**
         *  Default Filters - hide on year change
         */
        function hideDefaultFilters() {
            $(".employmentWagesMultiSearchGraphContainer .graph-container__filters input").each(
                function() {
                    $(this).prop("checked", false);
                    $(this).prop("disabled", false);
                }
            );

            $(
                ".employmentWagesMultiSearchGraphContainer .graph-container__filters-dropdown"
            ).each(function() {
                $(this).hide();
            });

            $("#employmentWagesAfterYearFilter").removeAttr("disabled");
        }

        /**
         * Get Sector Count
         */
        function getSectorCount(groupClass) {
            var count = 0;
            var elementsCount = $("#employmentWagesGraphData .view-grouping." + groupClass + " .sector-item").length;
            count = (elementsCount >= 5) ? 6 : elementsCount + 1;
            window.config.sectorCount = count;
        }
        getSectorCount(window.config.groupClass);


        /**
         * Drilldown Chart
         */
        function generateDrillDownchartData(groupClass, className) {
            // var sectors = getTopFiveSectors('yearItem-0');
            var i = 1;
            var arr = [];
            for (i; i < config.sectorCount; i++) {
                var container = $(
                    "#employmentWagesGraphData .view-grouping." + groupClass + " .sector-item:nth-child(" +
                    i +
                    ")"
                ).find(".employment-wages-row" + className);
                var wages = container.find(".employment-wages span").text();
                arr.push(parseInt(wages));
            }
            return arr;
        }

        function generateDrillDownCombinations(groupClass) {
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
                var data = generateDrillDownchartData(groupClass, drillDownCombination[j]);

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
        function generateHighLevelData(searchGroup) {
            var i = 1;
            var highLevelSeries = [];
            for (i; i < config.sectorCount; i++) {
                var container = $(
                    "#employmentWagesGraphData .view-grouping." + searchGroup + " .sector-item:nth-child(" +
                    i +
                    ")"
                ).find(".employment-wages-row.gender-All.race-All");
                var wages = container.find(".employment-wages span").text().trim();
                var name = container.find(".employment-wages-sector").first().text().trim();
                var sectorName = name.replace(/-/g, " ");
                var year = container.find(".employment-wages-school-year").text();
                var obj = {
                    y: parseInt(wages),
                    name: sectorName,
                    // name: "drilldownRaceGender",
                    id: sectorName,
                    year: year.trim(),
                    drilldown: true,
                };
                highLevelSeries.push(obj);
            }

            // return highLevelSeries;
            return {
                series: highLevelSeries,
                sectors: getTopFiveSectors(searchGroup),
            }
        }

        /**
         * Add Multi-Search Values to the Select Menu
         */
        function renderFilterValues() {
            var selectEle = $("#meanWagesMultiSearchFilter");
            var searchGroups = $("#employmentWagesGraphData .view-grouping");
            var groupClass = '';
            var searchCombination = '';
            var i = 0;
            for (i; i < searchGroups.length; i++) {
                groupClass = $(searchGroups[i]).attr('data-yearclass');
                searchCombination = $(searchGroups[i]).attr('data-year');
                selectEle.append(
                    "<option data-groupclass=" + groupClass + ">" + searchCombination + "</option>"
                );
            }
        }
        renderFilterValues();

        /**
         * Program Filters - Click Handler
         */
        function programFilterClickHandler(chart) {
            var selectEle = $("#meanWagesMultiSearchFilter");
            var groupClass = '';
            selectEle.on("change", function() {
                var groupClass = $(this).find(":selected").attr("data-groupclass");
                window.config.groupClass = groupClass;

                window.config.chartContext++;
                isCustomDrillDown = true;
                isDrilledup = true;
                isDrilledDown = false;
                window.config.dataType = 'gender';
                getSectorCount(window.config.groupClass);
                if (chart) {
                    chart.destroy();
                    chart = null;

                    selectEle.off("change");
                    $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown").off("change");
                    hideGenderRacefilters();

                    chart = renderEmploymentWagesGraph(
                        generateHighLevelData(window.config.groupClass),
                        "#employmentWagesGraph",
                        generateDrillDownCombinations(window.config.groupClass)
                    );
                    // hideDefaultFilters();
                }

            });

        }

        /**
         * Init Chart on Page Load
         */

        renderEmploymentWagesGraph(
            generateHighLevelData(window.config.groupClass),
            "#employmentWagesGraph",
            generateDrillDownCombinations(window.config.groupClass)
        );


        /**
         * Remove All Change Handler from checkboxes.
         */

        function removeChangeHandlerFromFilters() {
            $(
                ".employmentWagesMultiSearchGraphContainer .graph-container__filters-dropdown ul li input"
            ).each(function() {
                $(this).off("change");
            });
        }

        /**
         * Hide Gender and Race Filter - If Drilledup
         */
        function hideGenderRacefilters() {
            $(".employmentWagesMultiSearchGraphContainer").find(".graph-container__sorting .graph-container__filters-dropdown").hide();
            $(".employmentWagesMultiSearchGraphContainer").find(".graph-container__sorting .toggleDrilldown").each(function() {
                $(this).prop("checked", false);
                $(this).prop("disabled", false);
            });
        }

        /**
         * Init Race and Gender Filters
         */

        function initialFilters() {
            $(
                ".employmentWagesMultiSearchGraphContainer .graph-container__filters-dropdown ul li input"
            ).each(function() {
                $(this).on("change", function() {
                    var id = $(this).attr("id");
                    var series = Highcharts.charts[config.chartContext].get(id);
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
            eleID,
            drillDownData
        ) {

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
                        load: function(event) {
                            programFilterClickHandler(this);
                            toggleGraph(this);
                            // yearsFilter(this);
                            // afterYearChangeHandler(this);
                            // toggleAfterYearSeries(0, this);
                            initialFilters();
                        },
                        drilldown: function(e) {
                            var containerId = this.container.id;
                            this.options.plotOptions.series["stacking"] = false;
                            this.options.legend["enabled"] = true;
                            var drilldowns = [];
                            var chart = this;
                            var series = [];
                            isDrilledup = false;

                            $(this)
                                .parents(".graph-container__filters")
                                .find(".graph-container__filters-dropdown")
                                .show();
                            if (isCustomDrillDown) {
                                $(this)
                                    .parents(".graph-container__filters")
                                    .find(".graph-container__filters-dropdown input")
                                    .prop("checked", true);
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .prop("checked", false);
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .prop("disabled", false);
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .prop("checked", true);
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .prop("disabled", true);
                                $(
                                    ".employmentWagesMultiSearchGraphContainer .graph-container__filters-dropdown"
                                ).hide();
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .parents(".graph-container__filters")
                                    .find(".graph-container__filters-dropdown")
                                    .show();
                                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown")
                                    .first()
                                    .parents(".graph-container__filters")
                                    .find(".graph-container__filters-dropdown input")
                                    .prop("checked", true);
                            }


                            if (!e.seriesOptions) {
                                function renderDrillDownSeriesData(data, type) {
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
                                        if (chart && Highcharts.charts[i]) {
                                            if (chart.renderTo.id !== Highcharts.charts[i].renderTo.id) {
                                                Highcharts.charts[i].drillUp();
                                            }
                                        }
                                    }
                                }
                                drillUpChart();
                                renderDrillDownSeriesData(drillDownData, window.config.dataType);
                                filterDrilldownData(chart);
                                removeChangeHandlerFromFilters();
                                initialFilters();

                                isDrilledDown = true;

                            }
                        },

                        drillup: function(e) {
                            isDrilledup = true;
                            isDrilledDown = false;
                            isCustomDrillDown = true;
                            window.config.dataType = "gender";

                            this.options.plotOptions.series["stacking"] = "normal";
                            this.options.legend["enabled"] = false;
                            hideGenderRacefilters();
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
                    categories: chartData.sectors,
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: "",
                    backgroundColor: "#ffffff",
                    followPointer: true,
                    followTouchMove: true,
                    // pointFormat: '<b>{point.series.name} <b><br>${point.y:,.0f}',
                    pointFormatter: function() {
                        if (this.hasOwnProperty("drilldown")) {
                            return "<b>" + this.name + "<b><br>$" + Highcharts.numberFormat(this.options.y, 0, ",") + "</b>";
                        } else {
                            return (
                                "<b>" +
                                this.category +
                                " : " +
                                this.series.name +
                                "<b><br>$" +
                                Highcharts.numberFormat(this.options.y, 0, ",") +
                                "</b>"
                            );
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
                            legendItemClick: function() {
                                return false;
                            },
                        },
                    },
                },
                // series: chartData[dataIndex].data,
                series: [{ data: chartData.series }],
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
        function filterDrilldownData(chart) {
            var genders = ["Male", "Female"];
            var races = ["Asian", "Black", "White", "Other"];
            // var a = Highcharts.charts[config.chartContext].series;
            var a = chart.series;
            if (window.config.dataType == "race") {
                Highcharts.each(a, function(p, i) {
                    if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                        p.hide();
                    } else {
                        p.show();
                    }
                });
            }

            if (window.config.dataType == "gender") {
                Highcharts.each(a, function(p, i) {
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
            el.each(function() {
                $(this).prop("checked", val);
            });
        }


        var isCustomDrillDown = true;
        var isDrilledup = true;
        var isDrilledDown = false;

        function toggleGraph(chart) {
            $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown").off("change");
            $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown").on("change", function() {
                isCustomDrillDown = false;

                var dataType = $(this).attr("name");
                var chartID = parseInt($(this).attr("id"));
                var el = $(this)
                    .parents(".graph-container__filters")
                    .find(".graph-container__filters-dropdown input");
                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown").prop("checked", false);
                $(".employmentWagesMultiSearchGraphContainer .toggleDrilldown").prop("disabled", false);
                $(this).prop("checked", true);
                $(this).prop("disabled", true);
                $(".employmentWagesMultiSearchGraphContainer .graph-container__filters-dropdown").hide(0, function() {
                    toggleCheckbox(el, false);
                });
                $(this)
                    .parents(".graph-container__filters")
                    .find(".graph-container__filters-dropdown")
                    .show(0, function() {
                        toggleCheckbox(el, true);
                    });
                window.config.dataType = dataType;

                if (isDrilledDown) {
                    filterDrilldownData(chart);
                }

                if (isDrilledup) {
                    // chart.series[0].points[0].doDrilldown();
                    Highcharts.charts[
                        config.chartContext
                    ].series[0].points[0].doDrilldown();
                }

                /*if (chartID == 0) {
                		 Highcharts.charts[config.chartContext].drillUp();
                 }

                 if (chartID == 1) {
                		 Highcharts.charts[0].drillUp();
                 }*/



            });
        }
        /**
         * Update ChartContext After All Chart init.
         */
        window.config.chartContext = (Highcharts.chartCount == 2) ? 1 : 0;
    }
  });
})(jQuery, Drupal, drupalSettings);
