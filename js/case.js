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

    var h1count = 1;
    var h2count = 1;
	$("h1, h2").each(function(fancyTitle) {
		if ($(this).is("h1")) {
	    	$(this).before("<hr class='titleLine'>");
	    	$(this).before("<div class='titleCount'>"+ h1count +"</div>");
	    	h2count = 1;
	    	h1count++;
	    }
	    else{
	    	$(this).before("<hr class='smallTitleLine'>");
	    	$(this).before("<div class='titleCount'>"+ (h1count-1) +"."+h2count + "</div>");
	    	h2count++;

	    }
	});

	
    
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
