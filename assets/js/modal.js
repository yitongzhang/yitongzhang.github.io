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
    console.log('scrolling')
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
      toggleScroll(false);
      scaleAndPositionFig(fig);
      styleOpenFig(fig);
      changeCursor(fig);
    }
  }

  function closeModal(){
    showBackground(false);
    toggleScroll(true);
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

  function toggleScroll(bool){

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
      }));
    } catch(e) {}

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }
    
    if(bool){
      document.documentElement.style.overflow ="visible";
      // enableScroll()
      console.log('enable')

    }else{
      document.documentElement.style.overflow ="hidden";
      // disableScroll()
      console.log('disable')
      
    }
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