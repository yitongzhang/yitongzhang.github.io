function	hoverInDot(){
	var findThis = '.labels .'+this.className;
	console.log(findThis);
	$(findThis).css('opacity','1');
}

function	hoverOutDot(){
	var findThis = '.labels .'+this.className;
	console.log(findThis);
	$(findThis).css('opacity','0');
}

$( '.dots li' ).mouseenter( hoverInDot ).mouseleave( hoverOutDot );

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