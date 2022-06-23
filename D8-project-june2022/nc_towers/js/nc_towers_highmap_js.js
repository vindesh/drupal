(function ($, Drupal, drupalSettings) {
Drupal.behaviors.highmapBehavior = {
  attach: function (context, settings) {

/*************************************County-Map***************************************************/
      let data = Countydata;
         // Create the chart
      let map = $('#map_county').html();
      //console.log(map);
      if (map) {
        result = new Array();
        /*$.each(JSON.parse(data), function(i, item) {
          response = [item.county_code, item.county_index];
          result.push(response);
        });*/


        Highcharts.mapChart('map_county', {
          chart: {
            map: 'countries/us/us-nc-all',
            backgroundColor:'rgba(255, 255, 255, 0.0)',
            'height':400,
            'width':900,
          },

          title: {
            text: null
          },

          credits: {
            enabled: false
          },

          exporting: {
            enabled: false
          },

          mapNavigation: {
            enabled: true,
            buttons: {
              zoomIn: {
                onclick: function () { this.mapZoom(0.1); }
              },
              zoomOut: {
                onclick: function () { this.mapZoom(10); }
              }
            },
          },
                    tooltip: {
                formatter: function() {
                        return this.point.name;
                }
              },


          series: [{
            data: data,
            color: '#F2F7FF',
            name: '',
            allowPointSelect: true,
            cursor: 'pointer',
            states: {
              hover: {
                color: '#384D93'
              },
              select:{
                color:"#384D93"
              },
            },
            dataLabels: {
              enabled: true,
              format: '{point.name}'
            }
          }],

          plotOptions: {
            series: {
              point: {
                events: {
                  click: function() {
                    //get clicked county here alert(this.name);
                    //var name = $("#edit-name").val();
                    //window.location.href = 'find-career?name='+name+'&region='+this.name;
                    window.location.href = window.location.origin+'/find-career/reality-check?region='+this.name;
                  }
                }
              }
            }
          }
        });
}

/***********************************Region-Map*****************************************************/
    setTimeout(function(){
    let AreaMap = $('#map_area').html();
    //console.log(AreaMap);
    if(AreaMap){
      // Regions data to be used by map
      let geoArea = Areadata;

      let map_area =  Highcharts.mapChart('map_area', {
              chart: {
                  height: 360,
                  map: 'MapArea',
                    events: {
                      load: function () {
                        // Will be used to link to dropdown selector
                        /*for (var i = 0; i < this.series[0].data.length; i++) {
                          if (this.series[0].data[i].name == 'Greenville') {
                            //I've got the map element to highlight...
                            //..but how I can do change its color?

                            //before I was using this method, selecting directly, but now
                            //I don't want to select it, only change its color.
                            this.series[0].data[i].select(true,false);
                            break;
                          }
                        }*/
                    }
                }
              },

              title: {
                  text: null
              },

              mapNavigation: {
                enabled: true,
                buttons: {
                  zoomIn: {
                    onclick: function () { this.mapZoom(0.1); }
                  },
                  zoomOut: {
                    onclick: function () { this.mapZoom(10); }
                  }
                },
              },

              credits: {
                enabled: false
              },

              tooltip: {
                formatter: function() {
                        return this.point.name;
                }
              },

              series: [{
                  showInLegend:false,
                  data: geoArea,
                  keys: ['NAME', 'value','color'],
                  joinBy: 'NAME',
                  name: 'Region',
                  allowPointSelect: true,
                  cursor: 'pointer',
                  states: {
                      hover: {
                        color: '#384D93'
                      },
                      select:{
                        color:"#384D93"
                      }
                    },
                  dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                  }}],
              plotOptions: {
                series: {
                  point: {
                    events: {
                      click: function()
                      {
                        //console.log(this.properties.id);

                        var geo_location_code = this.properties.GEO_CODE;
                        var geo_location_val = this.properties.NAME;
                        //console.log("geo===>"+geo_location_code+"==val"+geo_location_val);
                        $('#location-current-value').text(geo_location_val);
                        if(geo_location_code){
                        if ($('.filter-map-main-job-search').length > 0) {
                          $('.job_search_save').show();
                          var  highchartvalue= 'highcharts-name-';
                          var res = geo_location_val.toLowerCase();
                          var result_space_highchart = res.replace(' ','-');
                          //console.log(highchartvalue+result_space_highchart);
                          $('.highcharts-point').css({ fill: "rgb(242,247,255)" });
                          $('.'+highchartvalue+result_space_highchart).css({ fill: "#384D93" });
                        }

                          $("input[name=area-dropdown-geo][value='"+geo_location_val+"']").prop("checked",true);
                          if ($("#edit-field-area-region-target-id-search-job-county-11").filter(function() { return $(this).val(); }).length > 0) {
                              $('input[name="edit-field-area-region-target-id-search-job-county-11"]').val(geo_location_code);
                          }else{
                              var filterHtml2='<input type="hidden" data-drupal-selector="edit-field-area-region-target-id-search-job-county-11" name="edit-field-area-region-target-id-search-job-county-11" id="edit-field-area-region-target-id-search-job-county-11" size="8" class="" value='+geo_location_code+'>';
                              $('.js-form-item-field-area-region-target-id-1').unbind().prepend(filterHtml2);
                          }
                        }
                        //var SOC = jQuery('input[name=edit-field-area-region-target-id-search-job-11]').val();
                        var SOC = jQuery('#views-exposed-form-occupation-profile-block-16 #edit-search-occupation-title').val();
                        var Area_Name = jQuery('input[name=edit-field-area-region-target-id-search-job-county-11]').val();
                        if(typeof Area_Name == 'undefined' || Area_Name == 'undefined') {
                            Area_Name = undefined;
                        }
                        if(typeof SOC == 'undefined' || SOC == 'undefined' || SOC == ''){
                            SOC = undefined;
                        }
                        if(jQuery('#views-exposed-form-occupation-profile-block-16 #edit-search-occupation-title').length>0){
                          $(document).trigger("click");
                        }else{
                          var vars = window.location.href.split('//');
                          var parameter = vars[1].split('/');
                          if(parameter[2]){
                          window.location.href = 'http://'+parameter[0]+'/'+parameter[1]+'/'+parameter[2]+'/'+this.properties.id;
                          }                         
                        }
                        // if(typeof SOC != 'undefined') {
                        //   if(typeof Area_Name != 'undefined') {
                        //     //$('.current-job-listings-search .js-form-submit').show();
                        //     $('.job_search_save').show();
                        //   } else {
                        //     //$('.current-job-listings-search .js-form-submit').hide();
                        //     $('.job_search_save').hide();
                        //   }
                        // } else {
                        //   //$('.current-job-listings-search .js-form-submit').hide();
                        //   $('.job_search_save').hide();
                        // }

/*                          if(typeof SOC != 'undefined' || Area_Name !== '') {
                            if (typeof Area_Name === 'undefined' || typeof SOC === 'undefined') {
                                $('.current-job-listings-search .js-form-submit').hide();
                                }else{
                                $('.current-job-listings-search .js-form-submit').show();
                            }
                           }
*/                      
                        $('.map-filter-selction input').remove();
                        $('.area-default  input').remove();
                        $('.regions input').remove();
                        var filterHtml= '<input type="hidden" data-drupal-selector="edit-field-area-target-id-1" id="edit-field-area-target-id-1" name="field_area_target_id_1" value='+this.properties.id+'>';
                        $('.'+this.properties.id+ '-area').unbind().prepend(filterHtml);
                        //console.log(this.index);
                      }
                    }
                  }
                }
              }
        });
    }
   },100);


    /**********************/


    /******************END********/
    /*************************************Range Area***************************************************/

//     var urlParams = new URLSearchParams(window.location.search);
//     $.getJSON(urlParams, function(data) {
//     //data is the JSON string
//     console.log(data);

// });
//     var parts = window.location.search.substr(1);
//     console.log(parts); // true
//     var xmlHttp = new XMLHttpRequest();
// console.log(xmlHttp); // "edit"

// console.log(urlParams.toString()); // "?post=1234&action=edit"

$( function() {
    var locationString =  window.location.search;
    var search_params = decodeURIComponent(locationString);
    var defaultMini = 0;
    var defaultMax = 240000;
    var vars = search_params.split('&');
      for (var i=0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if(pair[0] =='field_est_annual_wage_medium_value[min]'){
        defaultMini =  pair[1];
        }

        if(pair[0] =='field_est_annual_wage_medium_value[max]'){
        defaultMax =  pair[1];
        }
      }
      if($( "#slider-range" ).length>0){
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 240000,
      step: 10000,
      values: [ defaultMini, defaultMax ],
      create: function() {

        const lowerBound = 0, upperBound = 240000;
        const lowerBound1 = defaultMini;
        const upperBound1 = defaultMax;
        $( "#amount-min" ).val( "$" + nFormatter(0));
        $( "#amount-max" ).val( "$" + nFormatter(240000));
        $( "#amount-min-head" ).val( "$" + nFormatter(defaultMini));
        $( "#amount-max-head" ).val( "$" + nFormatter(defaultMax));
        var normalY = function normalY(x, mean, stdDev) {
          return Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) * 100000;
        };

        var getMean = function getMean(lowerBound, upperBound) {
          return (upperBound + lowerBound) / 2;
        }; // distance between mean and each bound of a 95% confidence interval
        // is 2 stdDeviation, so distance between the bounds is 4


        var getStdDeviation = function getStdDeviation(lowerBound, upperBound) {
          return (upperBound - lowerBound) / 4;
        };

        var generatePoints = function generatePoints(lowerBound, upperBound) {
          var stdDev = getStdDeviation(lowerBound, upperBound);
          var min = lowerBound; //- 2 * stdDev;

          var max = upperBound; //+ 2 * stdDev;

          var unit = (max - min) / 100;
          return _.range(min, max, unit);
        };

        let mean = getMean(lowerBound, upperBound);
        let stdDev = getStdDeviation(lowerBound, upperBound);
        let points = generatePoints(lowerBound, upperBound);

        var seriesData = points.map(function (x) {
          return {
            x: x,
            y: normalY(x, mean, stdDev)
          };
        });

        Highcharts.chart('container-range', {
          chart: {
            type: 'area',
            height: 160
          },
          title: {
            text: 'NC Towers',
            y: 800
          },
          credits: {
            enabled: false
          },
          xAxis: {
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            labels: {
              enabled: false
            },
            minorTickLength: 0,
            tickLength: 0
          },
          yAxis: {
            labels: {
              enabled: false
            },
            gridLineWidth: 0,
            title: ''
          },
          tooltip: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          point: {
            backgroundColor: 'white'
          },
          series: [{
            data: seriesData
          }],
          plotOptions: {
            area: {
              animation: false,
              //enableMouseTracking: false,
              color: 'rgb(56, 77, 147)',
              fillColor: 'rgba(107, 208, 253, 0.5)',
              pointSize: 20,
              zoneAxis: 'x',
              zones: [{
                //fillColor gets the inside of the graph, color would change the lines
                fillColor: 'rgba(213, 242, 255)',
                // everything below this value has this style applied to it
                value: lowerBound1
              }, {
                value: upperBound1
              }, {
                fillColor: 'rgba(213, 242, 255)'
              }]
            }
          }
        });
      },
      slide: function( event, ui ) {
        $( "#amount-min" ).val( "$" + nFormatter(ui.values[ 0 ]));
        $( "#amount-max" ).val( "$" + nFormatter(ui.values[ 1 ]));
        $( "#amount-min-head" ).val( "$" + nFormatter(ui.values[ 0 ]));
        $( "#amount-max-head" ).val( "$" + nFormatter(ui.values[ 1 ]));
        const lowerBound = 0, upperBound = 240000;
        const lowerBound1 = ui.values[ 0 ];
        const upperBound1 = ui.values[ 1 ];


        var normalY = function normalY(x, mean, stdDev) {
          return Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) * 100000;
        };

        var getMean = function getMean(lowerBound, upperBound) {
          return (upperBound + lowerBound) / 2;
        }; // distance between mean and each bound of a 95% confidence interval
        // is 2 stdDeviation, so distance between the bounds is 4


        var getStdDeviation = function getStdDeviation(lowerBound, upperBound) {
          return (upperBound - lowerBound) / 4;
        };

        var generatePoints = function generatePoints(lowerBound, upperBound) {
          var stdDev = getStdDeviation(lowerBound, upperBound);
          var min = lowerBound; //- 2 * stdDev;

          var max = upperBound; //+ 2 * stdDev;

          var unit = (max - min) / 100;
          return _.range(min, max, unit);
        };
        $('.wage-max-default  input').remove();
        $('.wage-min-default  input').remove();
        $('.wage-min  input').remove();
        $('.wage-max  input').remove();
        var filterHtml='<input type="hidden" data-drupal-selector="edit-field-est-annual-wage-medium-value-min" id="edit-field-est-annual-wage-medium-value-min" name="field_est_annual_wage_medium_value[min]" size="30" maxlength="128" class=""  value='+lowerBound1+'>';

        $('.wage-min').unbind().prepend(filterHtml);

        var maxfilterHtml='<input type="hidden" data-drupal-selector="edit-field-est-annual-wage-medium-value-max" id="edit-field-est-annual-wage-medium-value-max" name="field_est_annual_wage_medium_value[max]" size="30" maxlength="128" class=""  value='+upperBound1+'>';

        $('.wage-max').unbind().prepend(maxfilterHtml);


        let mean = getMean(lowerBound, upperBound);
        let stdDev = getStdDeviation(lowerBound, upperBound);
        let points = generatePoints(lowerBound, upperBound);


        var seriesData = points.map(function (x) {
          return {
            x: x,
            y: normalY(x, mean, stdDev)
          };
        });
        Highcharts.chart('container-range', {
          chart: {
            type: 'area',
            height: 160
          },
          title: {
            text: 'NC Towers',
            y: 800
          },
          credits: {
            enabled: false
          },
          xAxis: {
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            labels: {
              enabled: false
            },
            minorTickLength: 0,
            tickLength: 0
          },
          yAxis: {
            labels: {
              enabled: false
            },
            gridLineWidth: 0,
            title: ''
          },
          tooltip: {
            enabled: false
          },
          legend: {
            enabled: false
          },
          point: {
            backgroundColor: 'white'
          },
          series: [{
            data: seriesData
          }],
          plotOptions: {
            area: {
              animation: false,
              //enableMouseTracking: false,
              color: 'rgb(56, 77, 147)',
              fillColor: 'rgba(107, 208, 253, 0.5)',
              pointSize: 20,
              zoneAxis: 'x',
              zones: [{
                //fillColor gets the inside of the graph, color would change the lines
                fillColor: 'rgba(213, 242, 255)',
                // everything below this value has this style applied to it
                value: lowerBound1
              }, {
                value: upperBound1
              }, {
                fillColor: 'rgba(213, 242, 255)'
              }]
            }
          }
        });      }
            });
                    //$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
           }        //  " - $" + $( "#slider-range" ).slider( "values", 1 ) );
          });
        //NC Towers
      function nFormatter(num) {
           if (num >= 1000000000) {
              return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
           }
           if (num >= 1000000) {
              return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
           }
           if (num >= 1000) {
              return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
           }
           return num;
      }

    /*************************************End Range Area***************************************************/
   

    /*************************************MAP Close***************************************************/
    /* jQuery('.map-area-tool-close.close').click(function(){
        jQuery('.dropdown-filter-map').parents('.filter-map-main-job-search').removeClass('open');
        jQuery('.dropdown-filter-map').parents('.filter-map-main').removeClass('open');
    });*/
    jQuery('.close_btn').on('click',function(){
        jQuery('.dropdown-filter-map').parents('.filter-map-main-job-search').removeClass('open');
        jQuery('.dropdown-filter-map').parents('.filter-map-main').removeClass('open');
    });
    /*************************************End MAP Close***************************************************/




  }
};
})(jQuery, Drupal, drupalSettings);
