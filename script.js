$(document).ready(function() {
  
  var count = $('[class^="slide"]').size();
  var lastScrollTop = 0;
  var prev = count;
  var curr = 1;
  var now = 8;
  var next = 2;
  var finished = true;

  $('.slide' + curr).css("left","0");
  $('.slide' + curr).css("transform","scale(1)");
  $('.slide').on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
    if (finished) {
      finished = false;
      var delta = e.originalEvent.wheelDelta;
      console.log(delta);
      
      if (delta < 0) {
        $('[class^="slide"]').css("transition","all 0.5s ease, width 0s, height 0s");
        $('.slide' + curr).css("transform","scale(.8)");
        $('.slide' + curr).animate({
            step: function(now,fx) {
              $(this).css('transform',"scale(."+now+")");
            },
            duration:'slow'
        },'linear');
        $('.slide' + curr).css("z-index","20");
        $('.slide' + prev).css("z-index","10");
        $('[class^="slide"]').css("transition","0s");
        $('.slide' + next).css("left","100vw");
        setTimeout(function() {
          $('[class^="slide"]').css("transition","all .5s ease, width 0s, height 0s");
          $('.slide' + next).css("left","0");
          $('.slide' + next).css("transform","scale(1)");
          $('.slide' + prev).css("-moz-transform","scale(1)");
          $('.slide' + next).css("z-index","50");
        },400);
        setTimeout(function() {
          curr++;
          if (curr > count) curr = 1;
          next++;
          if (next > count) next = 1;
          prev++;
          if (prev > count) prev = 1;
        },900);
      } else if (delta > 0) {

        $('.slide' + curr).css("transition","all 0.5s ease, width 0s, height 0s");
        $('.slide' + curr).css("transform","scale(.8)");
        $('.slide' + curr).animate({
            step: function(now,fx) {
              $(this).css('transform',"scale(."+now+")");
            },
            duration:'slow'
        },'linear');
        $('.slide' + curr).css("z-index","20");
        $('.slide' + next).css("z-index","10");
        $('[class^="slide"]').css("transition","0s");
        $('.slide' + prev).css("left","-100vw");
        setTimeout(function() {
          
          $('[class^="slide"]').css("transition","all 0.5s ease, width 0s, height 0s");
          $('.slide' + prev).css("left","0");
          $('.slide' + prev).css("transform","scale(1)");
          $('.slide' + prev).css("-moz-transform","scale(1)");
          $('.slide' + prev).css("z-index","50");
        },400);
        setTimeout(function() {
          curr--;
          if (curr < 1) curr = count;
          next--;
          if (next < 1) next = count;
          prev--;
          if (prev < 1) prev = count;
        },900);
      }

      setTimeout(function() {
        finished = true;
      },1100);
    }
  });
});