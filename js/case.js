$( document ).ready(function() {
	var width = $(window).width()
	var	margin = 5-0.191*width;

	if ($(window).width() > 760){
	    $(".alternate:odd").css("float","left");
	    $(".alternate:odd").css("clear","left");
	    $(".alternate:odd").css("margin-left",margin+"px");
	    $(".alternate:odd").css("margin-right","0px");
	    console.log("window is big!")

	}
	else{
		console.log("window is small!")
	}



    $(".alternate").prepend("<hr class='noteLine'>");
});


$( window ).resize(function() {
	var width = $(window).width()
	var	margin = 5-0.191*width;

	if ($(window).width() > 760){
	    $(".alternate:odd").css("float","left");
	    $(".alternate:odd").css("clear","left");
	    $(".alternate:odd").css("margin-left",margin+"px");
	    $(".alternate:odd").css("margin-right","0px");
	    console.log("window is big!")

	}
	else{
		console.log("window is small!")
	}
});
