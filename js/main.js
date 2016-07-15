$(window).scroll(function() {
if ($(this).scrollTop() > 50){  
    $('.hack').addClass("sticky");
    $('header h6').addClass("sticky");
    $('header h1').addClass("sticky");
    $('header').addClass("sticky");
  }
  else{
  	$('.hack').removeClass("sticky");
    $('header').removeClass("sticky");
    $('header h6').removeClass("sticky");
    $('header h1').removeClass("sticky");
  }
});