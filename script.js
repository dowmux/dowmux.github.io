var Player = function() {

  var ui = {
    holder: {
      holder: '.player__holder',
      flippedClass: 'player__holder--flipped'
    },
    cover: {
      cover: '.player__cover',
      errorClass: 'player__cover--error',
      openClass: 'player__cover--open'
    },
    list: {
      list: '.player__list',
      openClass: 'player__list--open'
    },
    tracks: {
      list: '.tracks__list',
      track: '.tracks__track',
      activeClass: 'tracks__track--active'
    },
    options: {
      random: '.options__btn--random',
      playlist: '.options__btn--playlist',
      activeClass: 'options__btn--active'
    },
    info: {
      title: '.player__title',
      artist: '.player__artist'
    },
    progressBarHolder: '.player__progressbar-holder',
    progressBar: '.player__progressbar',
    controls: {
      prev: '.controls__btn--prev',
      next: '.controls__btn--next',
      play: {
        playPause: '.controls__btn--play-pause',
        playIconClass: 'fa-play',
        pauseIconClass: 'fa-pause'
      }
    }
  };

  var songs = {};
  var song = new Audio();
  var songIndex = 0;
  var maxSongIndex = 0;
  var trackPositions = [];
  var songTimer = {};
  var history = [];
  var isPlaying = true;
  var isShuffle = true;

  var getRandomInt = function(min, max, exclude) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return (num === exclude) ? getRandomInt(min, max, exclude) : num;
  };

  $.fn.filterByData = function(prop, val) {
    return this.filter(
      function() {
        return $(this).data(prop) == val;
      }
    );
  };

  var growProgressbar = function(songCurrentTime) {
    $(ui.progressBar).css('width', songCurrentTime * 100 / song.duration + '%');
  };

  var switchPlayPause = function() {
    var removeClass = isPlaying ? ui.controls.play.playIconClass : ui.controls.play.pauseIconClass;
    var addClass = isPlaying ? ui.controls.play.pauseIconClass : ui.controls.play.playIconClass;
    $(ui.controls.play.playPause)
      .find('i')
      .addClass(addClass)
      .removeClass(removeClass);
  };

  var loadSongs = function(tracks) {
    songs = tracks;
    maxSongIndex = songs.length - 1;
    var trackList = '';
    for (var i = 0; i < songs.length; i++) {
      trackList += '<li data-index="' + i + '" class="tracks__track"><h3 class="tracks__title">' + songs[i].title + '</h3><h4 class="tracks__artist">' + songs[i].artist + '</h4></li>';
    }
    $(ui.tracks.list).html(trackList);
    $(ui.tracks.track).each(function() {
      trackPositions.push($(this).position().top);
    });
  }

  var setSong = function() {
    song.src = songs[songIndex].source;
    $(ui.cover.cover).css('background-image', 'url(' + songs[songIndex].cover + ')');
    $(ui.info.title).html(songs[songIndex].title);
    $(ui.info.artist).html(songs[songIndex].artist);
  };

  var scrub = function(percentageOfTheSong) {
    song.currentTime = percentageOfTheSong * song.duration / 100;
    play();
  };

  var play = function() {
    $(ui.cover.cover).removeClass(ui.cover.errorClass);
    $(ui.tracks.track)
      .removeClass(ui.tracks.activeClass)
      .filterByData('index', songIndex)
      .addClass(ui.tracks.activeClass);
    $(ui.list.list).animate({
      scrollTop: trackPositions[songIndex]
    }, 500);
    song.play();
    songTimer = setInterval(function() {
      growProgressbar(song.currentTime);
    }, 100);
    isPlaying = true;
    switchPlayPause();
  };

  var pause = function() {
    song.pause();
    clearInterval(songTimer);
    isPlaying = false;
    switchPlayPause();
  };

  var prev = function() {
    history.pop();
    if (history.length) {
      songIndex = history[history.length - 1];
    } else {
      songIndex = songIndex > 0 ? songIndex - 1 : maxSongIndex;
    }
    switchSong();
  };

  var next = function() {
    if (isShuffle) {
      songIndex = getRandomInt(0, maxSongIndex, songIndex);
    } else {
      songIndex = songIndex < maxSongIndex ? songIndex + 1 : 0;
    }
    switchSong();
  };

  var switchSong = function() {
    clearInterval(songTimer);
    growProgressbar(0);
    setSong();
    play();
    saveSongAsPlayed();
  };

  var saveSongAsPlayed = function() {
    if (history[history.length - 1] !== songIndex) {
      history.push(songIndex);
    }
  };

  $(ui.controls.play.playPause).on('click', function() {
    if (isPlaying) {
      pause();
      return;
    }
    play();
  });

  $(ui.controls.prev).on('click', function() {
    prev();
  });

  $(document).on('click', ui.tracks.track, function() {
    songIndex = $(this).data('index');
    switchSong();
  });

  $(ui.controls.next).on('click', function() {
    next();
  });

  $(ui.options.random).on('click', function() {
    $(this).toggleClass(ui.options.activeClass);
    isShuffle = !isShuffle;
  });

  $(ui.options.playlist).on('click', function() {
    $(ui.holder.holder).toggleClass(ui.holder.flippedClass);
  });

  $(ui.progressBarHolder).on('click', function(event) {
    scrub((event.pageX - $(this).offset().left) * 100 / $(this).width());
  });

  song.onended = function() {
    next();
  };

  song.onerror = function() {
    $(ui.cover.cover).addClass(ui.cover.errorClass);
  };

  return {
    init: function(tracks) {
      loadSongs(tracks);
      setSong();
    }
  }

}();


var tracks = [
{"title": "Jozels ","artist": " Uplifted (ft. Jon Hazel)","source": "https://alexa-soundcloud.now.sh/stream/745018153/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000669158029-78b5m8-t500x500.jpg"},{"title": "WATEVA ","artist": " So High","source": "https://alexa-soundcloud.now.sh/stream/723570073/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000647976586-99zrrr-t500x500.jpg"},{"title": "Pascal Junior ","artist": " No Lies","source": "https://alexa-soundcloud.now.sh/stream/716830078/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000641474593-vro6wf-t500x500.jpg"},{"title": "Dallerium & MKDN ","artist": " Still Love U","source": "https://alexa-soundcloud.now.sh/stream/715885348/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000640527415-xnxwyz-t500x500.jpg"},{"title": "Zak Joshua ","artist": " Figure It Out","source": "https://alexa-soundcloud.now.sh/stream/701594881/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000622090243-aiek62-t500x500.jpg"},{"title": "Kesh x GAB ft. NEVRMIND ","artist": " Someone You Loved","source": "https://alexa-soundcloud.now.sh/stream/695555554/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000612226426-1esfgi-t500x500.jpg"},{"title": "MT SOUL ","artist": " Teardrops","source": "https://alexa-soundcloud.now.sh/stream/680588315/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000597150590-pzqqj2-t500x500.jpg"},{"title": "T. Matthias ","artist": " Would I Lie To You","source": "https://alexa-soundcloud.now.sh/stream/660168113/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000576604439-t5tt6y-t500x500.jpg"},{"title": "AZ2A ","artist": " Rude Boy","source": "https://alexa-soundcloud.now.sh/stream/650151032/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000565578206-iqk1gh-t500x500.jpg"},{"title": "Luca Debonaire & The Giver ","artist": " Put The Work In","source": "https://alexa-soundcloud.now.sh/stream/647814834/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000562993815-a37ka3-t500x500.jpg"},{"title": "TRU Concept ft. Rhionn Maxwell ","artist": " Let Me Be","source": "https://alexa-soundcloud.now.sh/stream/647814273/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000562993401-uksljq-t500x500.jpg"},{"title": "Tom Novy ft. Michael Marshall ","artist": " Something Special","source": "https://alexa-soundcloud.now.sh/stream/612647403/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000527088924-p7myri-t500x500.jpg"},{"title": "Aleks Cameron ","artist": " Be With U","source": "https://alexa-soundcloud.now.sh/stream/597914601/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000512104524-2uiyuk-t500x500.jpg"},{"title": "Linier ft. Hayley May ","artist": " Wonder","source": "https://alexa-soundcloud.now.sh/stream/590571813/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000504512976-vh4m1i-t500x500.jpg"},{"title": "Dave Silcox ft. Takura ","artist": " Slow Dance (Kesh Remix)","source": "https://alexa-soundcloud.now.sh/stream/586422708/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000500408193-c1b9t9-t500x500.jpg"},{"title": "T. Matthias  ","artist": " Sunflower","source": "https://alexa-soundcloud.now.sh/stream/586421490/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000500407341-wbbypm-t500x500.jpg"},{"title": "Sam Robs & Kelvin Wood ","artist": " No Scrubs","source": "https://alexa-soundcloud.now.sh/stream/557495640/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000470416767-900euv-t500x500.jpg"},{"title": "JYYE ","artist": " Dream","source": "https://alexa-soundcloud.now.sh/stream/553485588/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000466653462-rjutlw-t500x500.jpg"},{"title": "Cureton ","artist": " Where You Belong","source": "https://alexa-soundcloud.now.sh/stream/503195751/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000409074111-re1nzt-t500x500.jpg"},{"title": "LUI?CKS ","artist": " First Last Kiss(JYYE Remix)","source": "https://alexa-soundcloud.now.sh/stream/499871061/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000405382071-8v4iyi-t500x500.jpg"},{"title": "Dave Silcox ","artist": " Slow Dance (ft. Takura)","source": "https://alexa-soundcloud.now.sh/stream/490028640/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000394014279-t1e4ny-t500x500.jpg"},{"title": "RA˜DY & Guy Gabriel ","artist": " Fair Shot","source": "https://alexa-soundcloud.now.sh/stream/484966224/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000388356270-nzw6q1-t500x500.jpg"},{"title": "WATEVA ft. Alia ","artist": " Amnesia","source": "https://alexa-soundcloud.now.sh/stream/477498579/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000380159955-aczlgj-t500x500.jpg"},{"title": "LUI?CKS ft. Kat Vinter  ","artist": " First Last Kiss (Calippo Remix)","source": "https://alexa-soundcloud.now.sh/stream/471631746/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000373843713-9izoe5-t500x500.jpg"},{"title": "CLEIN ","artist": " Give It To Me","source": "https://alexa-soundcloud.now.sh/stream/470257773/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000372397401-q32438-t500x500.jpg"},{"title": "Nathan Rux ","artist": " Back To You","source": "https://alexa-soundcloud.now.sh/stream/465039156/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000366590760-tp3fjh-t500x500.jpg"},{"title": "Dallerium, CEA & Ferington ","artist": " You & I","source": "https://alexa-soundcloud.now.sh/stream/455642445/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000358378719-3pj051-t500x500.jpg"},{"title": "Jerome Price ","artist": " Get Me There","source": "https://alexa-soundcloud.now.sh/stream/449056317/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000352645185-hwilo7-t500x500.jpg"},{"title": "Kyle Meehan X Delta Jack ","artist": " Needed You","source": "https://alexa-soundcloud.now.sh/stream/442638714/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000347003565-u52t24-t500x500.jpg"},{"title": "Halogen ","artist": " Time","source": "https://alexa-soundcloud.now.sh/stream/429196587/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000334773804-z7i3ju-t500x500.jpg"},{"title": "Delta Jack ","artist": " Broken Youth (feat. INA?S)","source": "https://alexa-soundcloud.now.sh/stream/422365455/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000330124839-hz6mw1-t500x500.jpg"},{"title": "Dallerium ","artist": " Stars","source": "https://alexa-soundcloud.now.sh/stream/406548654/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000309150999-5k58bu-t500x500.jpg"},{"title": "Dave Silcox ft. Little Nikki ","artist": " Tell Me","source": "https://alexa-soundcloud.now.sh/stream/400590996/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000303173136-rec94v-t500x500.jpg"},{"title": "Cureton ","artist": " Lovesick","source": "https://alexa-soundcloud.now.sh/stream/393486222/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000296405877-9til7n-t500x500.jpg"},{"title": "Ellis ","artist": " Fuschia","source": "https://alexa-soundcloud.now.sh/stream/386031239/stream?client_id=qWUPqUOvYPTG1SDjwXJCNm9gOwM3rNeP","cover": "https://i1.sndcdn.com/artworks-000287636159-nj32ri-t500x500.jpg"},];Player.init(tracks);