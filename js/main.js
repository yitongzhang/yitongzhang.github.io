$(window).scroll(function() {
  var scrollPosition = $( "html" ).scrollTop();
  if (scrollPosition == 0) {
  	$( "nav" ).removeClass( 'sticky' )
  }
  else	{
  	$( "nav" ).addClass( 'sticky' )
  }

});

$("#workNavLi").find('a').click(function(e) {
    e.preventDefault();
    var section = $(this).attr("href");
    $("html, body").animate({
        scrollTop: $(section).offset().top - 50
    });
});

$("#goWork").find('a').click(function(e) {
    e.preventDefault();
    var section = $(this).attr("href");
    $("html, body").animate({
        scrollTop: $(section).offset().top - 50
    });
});