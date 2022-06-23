(function ($, Drupal, drupalSettings) {
  'use strict';
  $( document ).ready(function() {

    /**
     * Filter/Drilldown on student data table
     * @param {*} gender 
     * @param {*} race 
     * @param {*} isStudentEnrolled 
     */  
    function filterStudentTableData(gender, race, isStudentEnrolled, school='', program='', degree=''){
      var studentEnrolledTable, tableID;
      if(isStudentEnrolled){
        tableID = '#student-enrolled-search-data-export .student-enrolled-table table';
      }else{
        tableID = '#student-graduate-search-data-export .student-enrolled-table table';
      }
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
        }
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
        },
        {
          searchPanes: {
            show: true
          },
          targets: [5]
        }
      ];
      if ( $.fn.dataTable.isDataTable( tableID ) ) {
        studentEnrolledTable = $(tableID).DataTable( {
            destroy: true,
            paging: false,
            searchPane: true,
            ordering:  true,
            info: false,
            dom: 'lrtip',
            buttons: ['csv', 'excel'],
            searchPanes: {
                preSelect: preSelectRows,
            },
            columnDefs: columns,
        });
      }else{
        studentEnrolledTable = $(tableID).DataTable( {
          paging: false,
          searchPane: true,
          ordering:  true,
          info: false,
          dom: 'lrtip',
          buttons: ['csv', 'excel'],
          searchPanes: {
              preSelect: preSelectRows,
          },
          columnDefs: columns,

        });
      }    
      if(isStudentEnrolled)  
        studentEnrolledTable.buttons( 0, null ).containers().appendTo( '#student-enrolled-search-data-export .search-data-export-button' );
      else
        studentEnrolledTable.buttons( 0, null ).containers().appendTo( '#student-graduate-search-data-export .search-data-export-button' );
    }
    /**
     * Variable define and Init filterStudentTableData
     */
    var gender = ['All', 'Male', 'Female'];
    var race = ["All", "Asian", "Black", "White", "Other"];
    filterStudentTableData([gender[0]], [race[0]], true);
    filterStudentTableData([gender[0]], [race[0]], false); 
    /* end of filterStudentTableData */


    /** Init. Display Loader On Page Load*/
    $('.chart-tabs-container .nc-tab-item:not(.isDisabled)').on("click", function (event) {
      event.preventDefault();
      showLoader();
    });

   /**
   * Global Var - To Check if Field is Empty
   */
    var chartLegends = [];
    window.graphConfig = {
      dataType: 'gender',
    };
    /**
   * Get URL's Param and Pass to the Search Fields
   */
    var urlParam = parseQueryStringToDictionarySG(window.location.search);
    var urlParamArr = [];
    if(urlParam['param']){
      urlParamArr = urlParam['param'].split("|");
    }
    var school_year = decodeURIComponent(urlParamArr[4]);
    multiSearchSchoolYear(school_year);

    var school_type = decodeURIComponent(urlParamArr[0]);
    multiSearchSchoolType(school_type);
    var agency = [school_type];
    for (let i = 1; i <= 4; i++) {
      if( decodeURIComponent(urlParam["param"+i]) !== 'undefined'){
        var urlParamArr1 = urlParam["param"+i].split("|");
        agency.push(decodeURIComponent(urlParamArr1[0]));
      }
    };
 
  if(urlParam){
    var urlParamArr2 = [];
    multiSearchSchool(school_type);
    jQuery.map( agency, function( item, index ) {
      let id='';
      id = (index === 0)?'':index;
      if(urlParam["param"+id]){
        urlParamArr2 = urlParam["param"+id].split("|");
      }
      let school = decodeURIComponent(urlParamArr2[1]);
      let program_study = decodeURIComponent(urlParamArr2[2]);
      let degree = decodeURIComponent(urlParamArr2[3]);
      if(school_type !== 'undefined' && school !== 'undefined'){
        multiSearchSchool(school_type, school, index);
      }
      if(school !== 'undefined' && program_study !== 'undefined'){
        multiSearchProgramType(school, program_study, $('#edit-program-study-'+index), school_type);
      }
      if(school !== 'undefined' && program_study !== 'undefined' && degree !== 'undefined'){
        multiSearchDegree(program_study,degree, school, $('#edit-degree-'+index), school_type);
      }
    });
  }

  /**
   * Method - Param Concat
   */
    function paramConcat(count, school, year, rowIndex){
    var param = '';
    var paramNumber = '';
    $('.filter'+rowIndex+'.search-program-form .field-container .form-control').each(function(){
      if($(this).val()){ 
      param+='|'+encodeURIComponent($(this).val())
      }
    })
    if(param){
      if(count != 1){
        paramNumber = count -1;
      }
      return 'param'+paramNumber+"="+encodeURIComponent(school)+param+"|"+encodeURIComponent(year);
    } else{
      return false;
    }
  }

  /**
   * Search - Start Over - Click Handler
   */
  $("#students_graduates_restart").on("click", function () {
    let refresh =
      window.location.protocol +
      "//" +
      window.location.host +
      "/" +
      window.location.pathname;
    window.location.href = refresh;
  });

  /**
   * Search - Click Handler
   */
  $("#multi_students_graduates_search").once("studentMultiSearchBehavior").on("click", function (event) {
    event.preventDefault();

    /**Init. Display Loader*/
    showLoader();

    let schoolType = $("#edit-school-type-multi").val();
    let schoolYear = $("#edit-school-year-multi").val();

    var url=''
    let flag = false;
    $('.homepage_error_message').hide();
    (schoolYear == 'Select')?flag = true:'';
    (schoolType == 'Select')?flag = true:'';
      
    $('.filter-group:visible').each(function(a){
      var rowIndex = parseInt($(this).attr('data-index'));
      var i = a+1;
      var filterParams = paramConcat(i, schoolType, schoolYear, rowIndex)
      if(filterParams != false) {
        if(i == 1){
          url += filterParams
        }else{
          url += '&'+filterParams;
        }
      }
    });
    var arg = "?" + url;
    var dict = {};
    let refresh = window.location.protocol +
      "//" + window.location.host +
      "/" + window.location.pathname + arg;
    window.location.href = refresh;
  });
 
  /**
   * Metho - Enable/Disable Add Button
   */
  function toggleAddButton(visibleEle) {
    if(visibleEle < 4) {
      $(".search-program-add-search").attr('disabled', false).removeClass("btn-disabled");
    }
    else {
      $(".search-program-add-search").attr('disabled', true).addClass("btn-disabled");
    }
  }

  /**
   * Add Program 
   */
  if($(".search-program-add-search").length > 0) {
    var searchField = $(".multisearch-form");
    var index = 0;
    var idIndex = 0;
    var ids = [];
    var rowRemoved = true;

    /*Shown search row according to get param from URL*/
    $(".multisearch-form").each(function(ind, el) {
      if (index < agency.length-1) {
        if(rowRemoved) {
          $(searchField[index]).css({'display': 'flex'});
          index++;
        }else {
          $(searchField[ids[idIndex]]).css({'display': 'flex'});
          idIndex++;
        }
        /* toggle add button*/
        var visibleEle = $(".multisearch-form:visible").length;
        toggleAddButton(visibleEle);
      }
    });

    $(".search-program-add-search").on("click", function () {
      if(rowRemoved) {
        $(searchField[index]).css({'display': 'flex'});
        index++;
      }else {
        $(searchField[ids[idIndex]]).css({'display': 'flex'});
        idIndex++;
      }
      /* toggle add button*/
      var visibleEle = $(".multisearch-form:visible").length;
      toggleAddButton(visibleEle);
    });

    $(".remove-search-fields").on("click", function () {
      $(this).parent(".multisearch-form").css({'display': 'none'});
      ids = [];
      $(".multisearch-form:hidden").each(function(e, i){
        var id = $(this).find('.remove-search-fields').attr('data-row');
        $(this).find('input').val('');
        $(this).find('select').empty();
        ids.push(parseInt(id));
      });
      rowRemoved = false;
      idIndex = 0;
      /* toggle add button */
      var visibleEle = $(".multisearch-form:visible").length;
      toggleAddButton(visibleEle);
    });
  }

  /**
   * Search School Type - OnChange Handler
   */
  $("#edit-school-type-multi").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
    e.preventDefault();
    var searchValue = $(this).val();
    clearField('school');
    clearField('program_study');
    clearField('degree', 'select');
    multiSearchSchool(searchValue);
  })));

  /***
   * Search School - OnChange Handler
   */
  $("input[name^=school]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
    e.preventDefault();
    var searchValue = $(this).val();
    let currentEleRef = $(this).parents('.search-program-form').find('input[name^=program_study]');
    currentEleRef.val('');
    let currentschoolType = $('#edit-school-type-multi').val();
    multiSearchProgramType(searchValue, '', currentEleRef, currentschoolType);
  })));

  /**
   * Search Program - OnChange Handler
   */
  $("input[name^=program_study]").once("studentMultiSearchBehavior").on("change",($.debounce(500, function(e) {
    var searchValue = $(this).val();
    var school = $(this).parents('.search-program-form').find('input[name^=school]').val();
    var currentEleRef = $(this).parents('.search-program-form').find('select[name^=degree]');
    let currentschoolType = $('#edit-school-type-multi').val();
    multiSearchDegree(searchValue,'',school, currentEleRef, currentschoolType);
  })));
  
  /**
   * Method - Search School Type
   */
  function multiSearchSchoolType(school_type){
      if(typeof school_type == 'undefined' || school_type == ''){
          school_type = '';
      }
      let searchUrl = "/students-graduates-count/school-type";
      //let searchUrl = "/api-main-outcomes/school-type";
      $.ajax({
        method: "POST",
        url: searchUrl,
        success: function (data) {
          $("#edit-school-type-multi").empty().append('<option value="Select">Please Select</option>');
          data.forEach(function (item,index){
            $("#edit-school-type-multi").append('<option value="'+item+'" >'+item+'</option>');
          })
          if(school_type !== 'undefined') {
            $("#edit-school-type-multi").val(school_type);
          }
        }
    });
  }

  /**
   * Method - Search School
   */
  function multiSearchSchool(searchTerm, school, eleID) {
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
        if(typeof eleID === 'undefined' || eleID === ''){
          $('input[name^=school]').each(function(){
            $(this).next('input[name^=program_study]').empty();
            schoolAutoComplete( $(this), data, searchTerm );
              /*$(this).autocomplete({
                source: data,
                minLength: 1,
                select: function (event, ui) {
                  console.log("multi-searchProgramType1");
                  console.log(ui.item.value);
                  multiSearchProgramType(ui.item.value);
                  $(this).attr("searchTerm", ui.item.value);
                },
              });*/
              if(school){
                $(this).val(school);
                $(this).attr("searchTerm",school);
              }
            });
        }else{
          schoolAutoComplete( $('#edit-school-'+eleID), data,searchTerm );
          $('#edit-school-'+eleID).val(school);
          $('#edit-school-'+eleID).attr("searchTerm",school);
        }
        },
      });
  }

  /**
   * Method - School Auto Complete
   */
  function schoolAutoComplete(object, data,schoolType){
    object.autocomplete({
      source: data,
      minLength: 1,
      select: function (event, ui) {
        multiSearchProgramType(ui.item.value, '', object.next(), schoolType);
        object.attr("searchTerm", ui.item.value);
        object.next().click();
      },
    });
  }

  /**
   * Method - Search Program Type
   */
  function multiSearchProgramType(searchTerm, programStudy, currentEleRef, schoolType) {
    if (typeof programStudy == "undefined" || programStudy == "") {
      programStudy = "";
    }

    $.ajax({
      method: "POST",
      url:
        "/students-graduates-count/program-study?searchTerm=" +
        encodeURIComponent(searchTerm)+"&schoolType=" +
        encodeURIComponent(schoolType),
      success: function (data) {
        var data = $.map(data, function (value, key) {
          value = value.replace(/&amp;/g, "&");
          return {
            label: value,
            value: value,
          };
        });

        let degreeRef = currentEleRef.parents('.search-program-form').find('input[name^=degree]');
        degreeRef.empty();
        currentEleRef.autocomplete({
          source: data,
          minLength: 1,
          select: function (event, ui) {
            multiSearchDegree(ui.item.value, "", searchTerm, degreeRef, schoolType);
            currentEleRef.attr("searchTerm", ui.item.value);
          },
          close: function(event, ui) {
            event.preventDefault();
            currentEleRef.change();
          }
        });
        currentEleRef.val(programStudy)
      },
    });
  }

  /**
   * Method - Search Degree
   */
  function multiSearchDegree(searchTerm, degree, school, currentEleRef, schoolType){
    if(typeof degree == 'undefined' || degree == ''){
      degree='';
    }

    $.ajax({
      method: "POST",
      url: "/students-graduates-count/degree?searchTerm="+ encodeURIComponent(searchTerm) +"&school="+ encodeURIComponent(school) +"&schoolType="+ encodeURIComponent(schoolType),
      success: function (data) {
        (currentEleRef)?currentEleRef.empty():$('select[name^=degree]').empty();
        data.forEach(function (item,index){
          currentEleRef.append('<option value="'+item+'" >'+item+'</option>');
        })
        if(degree)  currentEleRef.val(degree);
      }
    });
  }

  /**
   * Method - Clear Fields
   */
  function clearField(fieldName, fieldType ){
    if( typeof fieldType === 'undefined'){
      fieldType='input';
    }
    $(fieldType+'[name^='+fieldName+']').each(function(){
      $(this).empty();$(this).val('');
    });
  }

  /**
   * Method - Search Year
   */
  function multiSearchSchoolYear(year){
    if(typeof year == 'undefined' || year == ''){
        year='';
    }
    $.ajax({
      method: "POST",
      url: "/students-graduates-count/school-year",
      success: function (data) {
        $("#edit-school-year-multi").empty().append('<option value="Select">Please Select</option>');
        data.forEach(function (item,index){
          $("#edit-school-year-multi").append('<option value="'+item+'" >'+item+'</option>');
        })
        if(year !== 'undefined') {
          jQuery("#edit-school-year-multi").val(year);
        }
      }
    });
  }

  /**
   * Method - Parse QueryString using String Splitting
   */
  function parseQueryStringToDictionarySG(queryString) {
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

  /**
   * Toggle Graph and Table View
   */
  $(".graph-view-action").once("studentSearchBehavior").on("click", function () {
    $(this).parents(".graph-container").find(".graph-view-container").show();
    $(this).parents(".graph-container").find(".table-view-container").hide();
  });

  $(".table-view-action").once("studentSearchBehavior").on("click", function () {
    $(this).parents(".graph-container").find(".graph-view-container").hide();
    $(this).parents(".graph-container").find(".table-view-container").show();
    /*$(this).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown").hide();
    $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('checked', false);
    $(this).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").prop('disabled', false);*/
  });

  /**
   * Method - Generate JSON Data
   */
  function generateJsonData(ele, countEle, drillDownName) {
    var data = [];
    var drillDownData = [];
    $("#studentGraphData " + ele).each(function (i) { 
      if(ele == ".students-count-list .gender-All.race-All"){  
        var school = $(this).find(".students-count-campus").text();
        var program_study = $(this).find(".students-count-program").text();
        var degree = $(this).find(".students-count-degree").text();
        var chartLegendItem = (school+ ' - ' + program_study + ' - ' + degree)
        if (chartLegends.indexOf(chartLegendItem) === -1) { // search by id
          chartLegends.push(chartLegendItem);
        }  
      }
      var item;
      var itemVal = $(this).find(countEle).text();
      if (itemVal == -1 || itemVal == '') {
        item = null;
      } else {
        item = parseInt(itemVal);
      }
      var itemObj = {
        color: '#4472c4',
        name: chartLegends[i],
        data: [{
          name: "drilldownRace", drilldown: true, x: i, y: item
        }]
      }
      data.push(itemObj);
      drillDownData.push(item);
    });
    return {
      dataPoints: data,
      legends: chartLegends,
      drillDownData: drillDownData,
    };
  }

  /**
   * Check if Data exist
   */
  if ($("#studentGraphData").children().length > 0) {
    $(".graph-container").css({ display: "block" });
    /* Generate gender-all and race-all data */
    var studentEnrolledDataMultiSearch = new generateJsonData(
      ".students-count-list .gender-All.race-All",
      //".students-count-list .gender-All.race-All .students-count-enrolled span",
      ".students-count-enrolled span",
      "drilldownRace"
    );

    var studentGraduatedDataMultiSearch = new generateJsonData(
      ".students-count-list .gender-All.race-All",
      //".students-count-list .gender-All.race-All .students-count-graduated span",
      ".students-count-graduated span",
      "drilldownRace"
    );

    /* Generate Drilldown Data */
    function generateDrilldownData(countEle) {
      var parentClass = ".students-count-list";
      var drillDownData = [];
      var dataLabels = ['All','Asian','Black','White','Other','Male','Female'];
      var drillDownCombination = ['.gender-All.race-All', '.gender-All.race-Asian', '.gender-All.race-Black', '.gender-All.race-White', '.gender-All.race-Other', '.gender-Male.race-All', '.gender-Female.race-All']
      var i;
      for (i = 0; i<drillDownCombination.length; i++ ) {
        var data = new generateJsonData(
          parentClass + " " + drillDownCombination[i],
          //parentClass + " " + drillDownCombination[i] + " " + countEle,
          countEle,
          "drilldownRace"
        );
        var obj = {[dataLabels[i]]: data.drillDownData};
        drillDownData.push(obj);
      }
      return drillDownData;
    }


    /* Graph Init */

    /* Enrolled */
    renderGraph(
      studentEnrolledDataMultiSearch,
      "#studentsEnrolledGraphMultiSearch",
      generateDrilldownData(".students-count-enrolled span"),
      true
    );

    /* Graduated */
    renderGraph(
      studentGraduatedDataMultiSearch,
      "#studentsGraduatesGraphMultiSearch",
      generateDrilldownData(".students-count-graduated span"),
      false
    );
  }

   /**
   * Method - DrillUp Chart
   */
  function drillUpChart(chart) {
    var i;
    if (chart) {
      for (i = 0; i < Highcharts.charts.length; i++) {
        Highcharts.charts[i].drillUp();
      }
    }
  }

  /**
   * Method - Filter Race and Gender Data
   */
   function filterDrilldownData(chart) {
    var genders = ["Male", "Female"];
    var races = ["Asian", "Black", "White", "Other"];
    var a = chart.series;
    if (window.graphConfig.dataType == 'race') {
        Highcharts.each(a, function(p, i) {
            if (p.userOptions.id == genders[0] || p.userOptions.id == genders[1]) {
                p.hide();
            } else {
                p.show();
            }

        });
    }

    if (window.graphConfig.dataType == 'gender') {
        Highcharts.each(a, function(p, i) {
            if (p.userOptions.id == races[0] || p.userOptions.id == races[1] || p.userOptions.id == races[2] || p.userOptions.id == races[3]) {
                p.hide();
            } else {
                p.show();
            }

        });
    }
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
   * Race and Gender - Click Handler
   */
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
      window.graphConfig.dataType = dataType;
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

  /**
   * Page Scroll
   */
   function pageScroll(isStudentGraduatedGraph) {
    if(isStudentGraduatedGraph) {
      setTimeout(function() {
        $('html, body').animate({
        scrollTop: $(".chart-tabs-container").offset().top - 20
        }, 800);
      }, 600);
    }
  }

  /**
   * Method - Render Graph
   */
  function renderGraph(chartData, eleID, drillDownData, isStudentGraduatedGraph) {
    var dataType = 'gender';
    var schoolProgramDegree = '';
    Highcharts.setOptions({
      lang: {
        noData: "No data to display",
        loading: "Loading...",
        thousandsSep: ','
      },
    });
    $(eleID).highcharts({
      chart: {
          type: 'column',
          lang: {
              noData: "No data to display",
              loading: "Loading...",
          },
          events: {
              load: function(event) {
                toggleGraph(this);
                pageScroll(isStudentGraduatedGraph);
              },
              drilldown: function(e) {
                  var containerId = this.container.id;
                  var drilldowns = [];
                  var chart = this;
                  var series = [];
                  isDrilledup = false;
                  this.options.legend["enabled"] = true;
                  var elementIndex = window.graphConfig.dataType == 'gender' ? 0 : 1;
                  if (isCustomDrillDown) {
                    $('.graph-container').find(".graph-container__filters-dropdown").hide();
                    $('.graph-container').find(".graph-container__filters-dropdown input").prop('checked', false);
                    $(".toggleDrilldown").prop('checked', false).prop('disabled', false);
                    $(chart.renderTo).parents('.graph-container').find(".graph-container__filters-dropdown").eq(elementIndex).show();
                    $(chart.renderTo).parents('.graph-container').find(".graph-container__filters").eq(elementIndex).find(".graph-container__filters-dropdown input").prop('checked', true);
                    $(chart.renderTo).parents('.graph-container').find(".toggleDrilldown").eq(elementIndex).prop('checked', true);
                  }

                  if (!e.seriesOptions) {
                    schoolProgramDegree = e.point.category.split(' - ');
                    //chart.setTitle({ text: e.point.category });

                      function renderDrillDownSeriesData(data, type) {
                          var i;
                          var colors = ['#4472c4', '#ed7d31', '#b6b6b6', '#70ad47', '#264478', '#ed7d31', '#b6b6b6']
                          if (type == 'race') {
                              var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                              filterStudentTableData([gender[0]], race, isStudentGraduatedGraph);//, [schoolProgramDegree[0]], [schoolProgramDegree[1]], [schoolProgramDegree[2]]);//Race - filter
                            } else {
                              var labels = ["All", "Asian", "Black", "White", "Other", "Male", "Female"];
                              if(type == 'gender')
                                filterStudentTableData(gender, [race[0]], isStudentGraduatedGraph);//, [schoolProgramDegree[0]], [schoolProgramDegree[1]], [schoolProgramDegree[2]]);//Gender - filter
                            }

                          for (i = 0; i < data.length; i++) {
                            var obj = {
                              drilldownRace: {
                                id: labels[i],
                                name: labels[i],
                                color: colors[i],
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
                    toggleGraph(chart);
                    renderDrillDownSeriesData(drillDownData, window.graphConfig.dataType);
                    filterDrilldownData(chart);
                    isDrilledDown = true;
                  }
              },

              drillup: function(e) {
                this.options.legend["enabled"] = false;
                var containerId = this.container.id;
                var filterEle = $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .graph-container__filters-dropdown");
                isDrilledup = true;
                isDrilledDown = false;
                isCustomDrillDown = true;
                // window.graphConfig.dataType = "gender";
                filterEle.hide();
                $("#" + containerId).parents(".graph-container").find(".graph-container__sorting .toggleDrilldown").each(function() {
                  $(this).prop('checked', false);
                  $(this).prop('disabled', false);
                });
                filterStudentTableData([gender[0]], [race[0]], isStudentGraduatedGraph);//Filter - G-All, R-All
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
            enabled: true,
          },
      },
      xAxis: {
          type: "category",
          categories: chartData.legends,
          margin: 15,
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
          enabled: false,
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
  function(chart) {
      $(".graph-container__filters-dropdown ul li input").each(
          function() {
            $(this).on('change', function() {
              var id = $(this).attr("id");
              var series = chart.get(id);
              if (series = chart.get(id)) {
                series.setVisible(!series.visible);
                //}
                /**
                 * Table data sort according to chart drilldonw
                 */
                //var schoolProgramDegree = series.chart.title.textStr.split(' - ');
                var type = $(this).parents(".graph-container__filters").find(".toggleDrilldown").attr("name");
                if(type == 'gender'){
                  var genderFilter = gender;
                  (genderFilter.indexOf(id) == -1) ? genderFilter.push(id) : genderFilter.splice($.inArray(id, genderFilter), 1);
                  if(genderFilter.length==0) genderFilter = ['none'];
                  filterStudentTableData(genderFilter, [race[0]], isStudentGraduatedGraph);//, [schoolProgramDegree[0]], [schoolProgramDegree[1]], [schoolProgramDegree[2]]);//Gender filter
                }else{
                  var raceFilter = race;
                  (raceFilter.indexOf(id) == -1) ? raceFilter.push(id) : raceFilter.splice($.inArray(id, raceFilter), 1);
                  if(raceFilter.length==0) raceFilter = ['none'];
                  console.log(id, );console.log(raceFilter );
                  filterStudentTableData([gender[0]], raceFilter, isStudentGraduatedGraph);//, [schoolProgramDegree[0]], [schoolProgramDegree[1]], [schoolProgramDegree[2]]);//Race filter
                }
              }  
            });

          }
      );
  });
  }

  /**
   * Page Redirections - Radio Button OnChange Handler
   */
    $("#multipleYears").click(function(event) {
      let refresh = window.location.protocol +
      "//" + window.location.host +
      "/students-graduates-search";
      window.location.href = refresh;
    });
    $("#singleYear").click(function(event) {
      let refresh = window.location.protocol +
      "//" + window.location.host +
      "/multiple-students-graduates-search";
      window.location.href = refresh;
    });
  });

   $(window).on("load", function() {
     setTimeout(hideLoader, 700);
   });

   /**
    * Display Loader
    */
    function showLoader() {
     var container = $(document.body);
     var loaderHTML = '<div class="ajax-loader-container"><div class="loader"></div><div class="loader-text">Searching through millions of records, just for you!</div></div>';
     container.append(loaderHTML);
   }

   /**
    * Hide Loader
    */
   function hideLoader() {
     $(".ajax-loader-container").remove();
   }
})(jQuery, Drupal, drupalSettings);
