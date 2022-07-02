(function($, Drupal, drupalSettings) {

	var initialized;
	


	function init() {
		if (!initialized) {
			initialized = true;
			//autocomplete your creation page ---------------------------

			if ( $('body').hasClass('node-id-376') ){

				$('#block-projectpatterns').hide();

				$('#edit-query').focusout(function(){
					if($('#edit-query').val().length == 0){
						$('#block-projectpatterns ul li input:checked').click();
					}
				})
				$(document).on('click','#removebtn',function () {
					$('#block-projectpatterns ul li input:checked').click();
				})
				
				$('#views-exposed-form-projects-block-1').submit(function (e) { 
					e.preventDefault();
				});
				$('#edit-submit-projects').hide();
				
				var data = [];
				$('#block-projectpatterns ul li label span').each(function (indx, ele) {
					data.push({
						data: $(this).parent().attr('for'),
						value: $(this).text(),
					}); 
				});
				$('#block-projectpatterns ul li input:checked').each(function (indx, ele) {
					$('#edit-query').val($(this).next().find('span').text());
				});
				if ($('#edit-query').val().length != 0) {
					$('#edit-query').prop('disabled', true);
					$('#edit-query').parent().after('<button id="removebtn">Remove</button>')
				}

				var selected = $('#edit-query').val();
				

				$('#edit-query').devbridgeAutocomplete({
					lookup: data,
					showNoSuggestionNotice: true,
					noSuggestionNotice: 'Not found',
					minChars: 1,
					onSelect: function (suggestion) {
						
						if (selected != $('#edit-query').val()) {
							selected = suggestion.value;
							$.each(data, function (indexInArray, valueOfElement) {
								if (valueOfElement.data === suggestion.data) {
									$('#' + valueOfElement.data).click();
								}
							}); 
						}
						
					},
				});


			}

			//-----------------------------------------------------------
			//-------------- countdown timer ----------------------------
			function makeTimer(time) {	
				var endTime = new Date(time);			
					endTime = (Date.parse(endTime) / 1000);

					var now = new Date();
					now = (Date.parse(now) / 1000);

					var timeLeft = endTime - now;

					if(timeLeft > 0){

					var days = Math.floor(timeLeft / 86400); 
					var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
					var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
					var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
		  
					if (hours < "10") { hours = "0" + hours; }
					if (minutes < "10") { minutes = "0" + minutes; }
					if (seconds < "10") { seconds = "0" + seconds; }

					$("#days").empty();
					$("#days").append(appendSpan(days));
					$("#hours").empty();
					$("#hours").append(appendSpan(hours));
					$("#minutes").empty();
					$("#minutes").append(appendSpan(minutes));
					$("#seconds").empty();
					$("#seconds").append(appendSpan(seconds));
					}else{
						$("#timer").empty();
						$("#timer").html("<div>Completed!</div>");
						clearInterval(x);
					}	

			}
			appendSpan("100");
			function appendSpan(integer){
				integer = integer.toString();
				var output = $("<div></div>");
			    var characters = integer.split("");
			    $.each(characters, function (i, el) {
			        output.append("<span>" + el + "</span");
			    });
			    return output;
			}

			var time = $("#timer").attr("data");
			var x = setInterval(function() { makeTimer(time); }, 1000);
			//-------------------------------------------------------------
		}
	}

	Drupal.behaviors.custom = {
		attach: function() {
			$(document).ready(function(){	
				init();
			});
		}
	};
	document.addEventListener('DOMContentLoaded', function(){
					if (window.hideYTActivated) return; 
					let onYouTubeIframeAPIReadyCallbacks=[];
					for (let playerWrap of document.querySelectorAll(".hytPlayerWrap")){
						let playerFrame=playerWrap.querySelector("iframe");
						let tag=document.createElement('script');
						tag.src="https://www.youtube.com/iframe_api";
						let firstScriptTag=document.getElementsByTagName('script')[0]; firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
						let onPlayerStateChange=function(event){
							if (event.data==YT.PlayerState.ENDED){
								playerWrap.classList.add("ended");
								player.seekTo(0);
								player.playVideo();
							}else if (event.data==YT.PlayerState.PAUSED){
								playerWrap.classList.add("paused");
							}else if (event.data==YT.PlayerState.PLAYING){
								playerWrap.classList.remove("ended");
								playerWrap.classList.remove("paused");
							}};
						let player;
						onYouTubeIframeAPIReadyCallbacks.push(function(){
							player=new YT.Player(playerFrame,{
								events:{
									'onStateChange': onPlayerStateChange}
								});
						});
						playerWrap.addEventListener("click", function(){
							let playerState=player.getPlayerState();
							if (playerState==YT.PlayerState.ENDED){
								player.seekTo(0);
								player.playVideo();
							}else if (playerState==YT.PlayerState.PAUSED){
								player.playVideo();
							}});
					}window.onYouTubeIframeAPIReady=function(){
						for (let callback of onYouTubeIframeAPIReadyCallbacks){
							callback();
						}
					};
					window.hideYTActivated=true;
				});

}(jQuery, Drupal, drupalSettings));
