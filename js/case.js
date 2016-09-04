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


	$("h1").each(function(fancyTitle) {
		var count = 1;
	    $(this).before("<hr class='titleLine'>");
	    $(this).before("<div class='titleCount'>"+ ++fancyTitle +"</div>");
	});

	$("h2").before("<hr class='smallTitleLine'>");

    

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
