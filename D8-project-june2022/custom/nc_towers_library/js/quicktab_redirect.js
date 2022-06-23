 (function ($, Drupal,drupalSettings) {
   Drupal.behaviors.quicktabredirectBehavior = {
       attach: function (context, settings) {

      	//                  Save history
//=====================================================//
//$(document).ready(function(){
 $(window).on('popstate', function(event) {

  window.location.reload();
});

  $('.quicktabs-loaded',context).once("quicktabredirectBehavior").on("click",function(e){

  	e.preventDefault();
  	if(!($(this).parent().hasClass('active'))){
  		var region = getUrlVars()["region"];
  		//if (!region) {
  			window.history.pushState({}, "Title", e.target.pathname);
  		//}

  	}
  });
         // Get query string values from URL
         function getUrlVars() {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++) {
               hash = hashes[i].split('=');
               vars.push(hash[0]);
               vars[hash[0]] = hash[1];
            }
            return vars;
         }
      	function quicktabRedirect(urlConst,options){
		      $(context).find(".quicktabs-tabs").once(urlConst).each(function() {
		        //let urlParam = location.search.substring(1);
		        var currentUrl = window.location.href;
		        var currentUrlArr = currentUrl.split('/');
		        var page = currentUrlArr[currentUrlArr.length - 1].split("?");
		        var urlParam = urlConst + page[0];
		        //console.log(page);

		        if (urlParam) {
		          var myParam = JSON.parse('{"' + urlParam.replace(/&/g, '","').replace(/=/, '":"') + '"}', function(key, value) {
		            return key === "" ? value : decodeURIComponent(value)
		          });
		          // if (browserCheck) {
		          //   if (myParam['quicktabs-find_a_career'] == 'interest-profiler') {
		          //     window.location.href = '/find-career/mini-interest-profiler';
		          //   }
		          // }

		          $.each(myParam, function(key, val) {
		            if (key.match(/^quicktabs-/)) {
		              var myList = $('#' + key + " .item-list ul li");
		              var myValIndex = options[val]
		              if (myList && myList.length > myValIndex && myValIndex >= 0) {
		                $.each(myList, function(i) {
		                  if (myValIndex == i) {
		                    $(myList[i]).addClass("active");
		                  } else {
		                    $(myList[i]).removeClass("active");
		                  }
		                });
		              }
		              var mytabs = $('#' + key + " .quicktabs-main");
		              if (mytabs[0]) {
		                var tab = Array.prototype.slice.call(mytabs[0].children);
		                if (tab.length > myValIndex && myValIndex >= 0) {
		                  $.each(tab, function(j) {
		                    if (myValIndex == j) {
		                      $(tab[j]).removeClass("quicktabs-hide");
		                    } else {
		                      $(tab[j]).addClass("quicktabs-hide");
		                    }
		                  });
		                }
		              }
		            }
		          });
		        }
		      });
		}

    var findCareer = {
        "reality-check": 0,
        "interest-finder": 1,
        "mini-interest-finder": 2,
        "career-cluster-match": 3,
        "be-your-own-boss": 4,
        "skill-matcher": 5,
        "work-value-sorter": 6
      };
      var findConst = 'quicktabs-find_a_career=';
      quicktabRedirect(findConst,findCareer);

      var careerTree = {
        "start-planning":0,
        "next-step":1,
        "first-step":2,
        "what-can-i-do-with-my-education":3
      };

      var treeConst = 'quicktabs-career_tree=';
      quicktabRedirect(treeConst,careerTree);

      var trainingEducation = {
        "prepare-for-college":1,
        "find-college-programs":0,
        "prepare-for-training":2,
        "private-training-providers":3,
        "navigator-0":4,
      };

      var educationConst = 'quicktabs-training_and_education=';
      quicktabRedirect(educationConst,trainingEducation);

      var lookNewJob = {
        "tips-and-tools": 0,
        "search-for-a-job": 1,
        "find-a-career-advisor": 2,
        "workers-with-disabilities": 3,
        "apprenticeship": 4,
      };
      var jobConst = 'quicktabs-look_for_a_new_job=';
      quicktabRedirect(jobConst,lookNewJob);

      var VocationalCenters = {
        "vocational-rehabilitation-locations":0,
        "services-for-the-blind":1
      };
      var vocationConst = 'quicktabs-vocational_and_blind_centers=';
      quicktabRedirect(vocationConst,VocationalCenters);

      var CovidBanner = {
      'real-time-job-information':0,
      'covid-19-information':1,
      'low-contact-occupations':2
    }
  	var covidBannerConst = 'quicktabs-covid_19_and_career_resources=';
    quicktabRedirect(covidBannerConst,CovidBanner);

    var aboutUS = {
      'governance-committee':0,
      'advisory-board':1,
      'methodology':2
    }
    var aboutUSConst = 'quicktabs-about_us=';
    quicktabRedirect(aboutUSConst,aboutUS);

    var variousTopics = {
      'apprenticeship-nc':0,
      'university-career-centers':1,
      'cfnc':2
    }
    var variousTopicsConst = 'quicktabs-various_topics=';
    quicktabRedirect(variousTopicsConst,variousTopics);

    var educatorResource = {
      'by-topic':0,
      'by-grade':1,
      'about-the-lesson-plans':2
    }
    var educatorResourceConst = 'quicktabs-educator_resources=';
    quicktabRedirect(educatorResourceConst,educatorResource);

    var prepareJobSearch = {
      'jobvscareer': 0,
      'startjobsearch': 1,
      'findjobs': 2,
      'jobssocialmedia': 3,
      'reference': 4
    }
    var prepareJobSearchConst = 'quicktabs-prepare_for_your_job_search_qt=';
    quicktabRedirect(prepareJobSearchConst, prepareJobSearch);

    var putYourBestFoot = {
      'applicationsresumes': 0,
      'impressinterview': 1,
      'coverletter': 2,
      'reference': 3
    }
    var putYourBestFootConst = 'quicktabs-put_your_best_foot_forward_=';
    quicktabRedirect(putYourBestFootConst, putYourBestFoot);

    var firstTimeJobSeekers = {
      'firstresume': 0,
      'firstcoverletter': 1,
      'firstreference': 2,
      'impressinterview': 3
    }
    var firstTimeJobSeekersConst = 'quicktabs-first_time_job_seekers_=';
    quicktabRedirect(firstTimeJobSeekersConst, firstTimeJobSeekers);


  //});
   }
 };
})(jQuery, Drupal,drupalSettings);
