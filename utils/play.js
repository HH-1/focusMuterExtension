switch (window.location.hostname){
  case "www.youtube.com":
    video = document.querySelector('video')
    if(video && video.paused){
      video.play()
    }
    break;
  case "www.deezer.com":
    var s = document.createElement('script');
    s.textContent = "(function(){dzPlayer.control.play();})();"
    document.head.appendChild(s)
    s.remove()
    break;
  case "soundcloud.com":
    var playButton = document.querySelector('.playControls__play');
    if(!playButton.classList.contains("playing")){
      playButton.click();
    }
    break;
}
