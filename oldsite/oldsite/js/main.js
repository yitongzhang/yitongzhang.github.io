$(window).scroll(function() {
if ($(this).scrollTop() > 1){  
    $('header h6').addClass("sticky");
    $('header h1').addClass("sticky");
    $('header').addClass("sticky");
  }
  else{
    $('header').removeClass("sticky");
    $('header h6').removeClass("sticky");
    $('header h1').removeClass("sticky");
  }
});