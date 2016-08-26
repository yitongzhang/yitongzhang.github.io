jQuery(document).ready(function($) {
	$('.my-slider').unslider();
});


var navDistance = $("nav").offset().top;

try{
	var oneDistance = $("#section1").offset().top-100;
	var twoDistance = $("#section2").offset().top-100;
	var threeDistance = $("#section3").offset().top-100;
	var fourDistance = $("#section4").offset().top-100;
	var fiveDistance = $("#section5").offset().top-100;
	var fiveDistance = $("#section6").offset().top-100;
}

catch(err) {
    console.log("fewer sections than expected")
}


$(window).scroll(function() {

if ($(this).scrollTop() > navDistance){  
    $('nav').addClass("sticky");

  }
  else{
    $('nav').removeClass("sticky");

  }

try{
	if ($(this).scrollTop() > navDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > oneDistance){  
		$('#section1Nav').css("background-color","yellow");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > twoDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","yellow");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > threeDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","yellow");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > fourDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","yellow");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > fiveDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","yellow");
		$('#section6Nav').css("background-color","white");
	}
	if ($(this).scrollTop() > sixDistance){  
		$('#section1Nav').css("background-color","white");
		$('#section2Nav').css("background-color","white");
		$('#section3Nav').css("background-color","white");
		$('#section4Nav').css("background-color","white");
		$('#section5Nav').css("background-color","white");
		$('#section6Nav').css("background-color","yellow");
	}
}

catch(err) {
    console.log("fewer sections than expected")
}



});