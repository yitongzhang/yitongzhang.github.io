$( document ).ready(function() {
	var width = $(window).width()
	var	margin = 5-0.191*width;

    $(".alternate").prepend("<hr class='noteLine'>");

});


$( window ).resize(function() {
	var width = $(window).width()
	var	margin = 5-0.191*width;
});
