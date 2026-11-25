document.addEventListener('DOMContentLoaded', () => {
  var allFigures = document.querySelectorAll('figure');
  var modalBackground = document.querySelector('.modalBackground');
  
  // listeners---------------
  allFigures.forEach(fig => {
    fig.addEventListener('click', event => {
      toggleModalState(fig)
    })
  });
  modalBackground.addEventListener('click', event => {
    closeModal()
  })
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {closeModal()}
  });

  document.addEventListener('scroll', function(e) {
    closeModal()
  });


  // closing and opening------
  function toggleModalState(fig){
    if(isModalAlreadyOpen(fig)){
      closeModal(fig)
    }else{
      openModal(fig)
    }
  }

  // closing and opening------

  function openModal(fig){
    var modalCurrentlyOpen = isModalAlreadyOpen(fig);
    if(!modalCurrentlyOpen){
      showBackground(true);
      scaleAndPositionFig(fig);
      styleOpenFig(fig);
      changeCursor(fig);
    }
  }

  function closeModal(){
    showBackground(false);
    allFigures.forEach(fig => {
      resetFig(fig);
    });
  }


  // utilities-----------------
  function isModalAlreadyOpen(fig){
    if(fig.style.transform=="" || fig.style.transform=="scale(1)"){
      return false
    }else{
      return true
    }
  }

  function getScaleFactor(fig){
    var screenWidth = getWidth()
    var figWidth = fig.offsetWidth
    var desiredScale = 0.8*screenWidth/figWidth
    if( desiredScale< 1){desiredScale = 1}
    return desiredScale
  }

  function scaleAndPositionFig(fig){
    var desiredScale = getScaleFactor(fig)
    fig.style.transform = "scale(" +desiredScale+ ")";
    fig.style.zIndex = "100";
    var figFromTop = fig.getBoundingClientRect().top;
    var figHeight = fig.offsetHeight;
    var screenHeight = getHeight();
    var centeredFigFromTop = (screenHeight - figHeight)/2;
    var adjustmentNeeded = centeredFigFromTop - figFromTop;
    fig.style.top = adjustmentNeeded + "px";
  }

  function styleOpenFig(fig){
    var figCaption = fig.querySelector('figcaption');
    var desiredScale = getScaleFactor(fig)
    figCaption.style.transform = "scale(" + 1/desiredScale + ")";
  }

  function resetFig(fig){
    var figCaption = fig.querySelector('figcaption');
    fig.style.transform = "scale(1)";
    fig.style.zIndex = "1";
    fig.style.top = "0px";
    figCaption.style.transform = "scale(1)";
    document.styleSheets[0].addRule('figure:hover', 'cursor: zoom-in');
  }

  function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }
  function getHeight() {
    var e = window, a = 'inner';
    if ( !( 'innerWidth' in window ) ){
      a = 'client';
      e = document.documentElement || document.body;
    }
    return e[ a+'Height' ]
  }

  function showBackground(bool){
    if(bool){
      modalBackground.style.transition ="visibility 0ms, opacity 300ms";
      modalBackground.style.opacity ="1";
      modalBackground.style.visibility ="visible";
    }else{
      modalBackground.style.transition =null;
      modalBackground.style.opacity =null;
      modalBackground.style.visibility = null;
    }
  }
  function changeCursor(fig){
    document.styleSheets[0].addRule('figure:hover', 'cursor: zoom-out');
  }
})