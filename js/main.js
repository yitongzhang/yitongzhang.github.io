
var navDistance = $("nav").offset().top;

try{
	var oneDistance = $("#section1").offset().top;
	var twoDistance = $("#section2").offset().top;
	var threeDistance = $("#section3").offset().top;
	var fourDistance = $("#section4").offset().top;
	var fiveDistance = $("#section5").offset().top;
	var fiveDistance = $("#section6").offset().top;
}

catch(err) {
    console.log("fewer sections than expected")
}

$(window).scroll(function() {

if ($(this).scrollTop() > navDistance){  
    $('nav').addClass("sticky");
    console.log("added");
  }
  else{
    $('nav').removeClass("sticky");
    console.log("removed");
  }

try{
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