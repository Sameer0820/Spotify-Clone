const keyValuePair = {};
let currentSong = new Audio();
let clickedElement;
let songs;
let laststate = 50;

async function getSongs(folder) {
  let a = await fetch(`/songs/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      song = element.text.split(" - ");
      songs.push(song[0]);
      keyValuePair[song[0]] = element.href;
    }
  }
  return songs;
}

const playMusic = (track, info, state) => {
  currentSong.src = track;
  if (state === "play") currentSong.play();
  document.querySelector(".songinfo").innerHTML = info;
  document.querySelector(".songtime1").innerHTML = "00:00";
  document.querySelector(".songtime2").innerHTML = "00:00";
};

function secondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const switchPlayPause = (musicstate) => {
  if (musicstate === "play")
    clickedElement.querySelector("img:nth-child(2)").src = "img/play.svg";
  else clickedElement.querySelector("img:nth-child(2)").src = "img/pause.svg";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      document.querySelector(".cardContainer").innerHTML =
        document.querySelector(".cardContainer").innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <img src="img/playButton.svg" alt="play" />
              </div>
              <img
                src= "/songs/${folder}/cover.jpg" alt=""
              />
              <h4>${response.title}</h4>
              <p>${response.description}</p>
            </div>`;
    }
  }
}

async function main() {
  await displayAlbums();
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      document.getElementById("play").src = "img/play.svg";
      document.querySelector(".circle").style.left = "-5px";
      songs = await getSongs(`${item.currentTarget.dataset.folder}`);
      playMusic(keyValuePair[songs[0]], songs[0], "pause");
      let ul = document.querySelector(".songlist ul");
      ul.innerHTML = "";
      for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
                    <div class="song">
                          <img class="invert" src="img/music.svg" alt="" />
                          <div class="info">
                            <div>${song}</div>
                            <div>Sameer</div>
                          </div>
                        </div>
                        <img class="invert" src="img/play.svg" alt="" />`;
        ul.appendChild(li);
        clickedElement = document.querySelector(".songlist ul li");
      }
      Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
      ).forEach((e) => {
        e.addEventListener("click", (element) => {
          const info = e
            .querySelector(".info")
            .querySelector("div").textContent;
          if (currentSong.src != keyValuePair[info]) {
            switchPlayPause("play");
            playMusic(keyValuePair[info], info, "play");
            e.querySelector("img:nth-child(2)").src = "img/pause.svg";
            document.getElementById("play").src = "img/pause.svg";
          } else if (currentSong.paused) {
            currentSong.play();
            e.querySelector("img:nth-child(2)").src = "img/pause.svg";
            document.getElementById("play").src = "img/pause.svg";
          } else {
            currentSong.pause();
            e.querySelector("img:nth-child(2)").src = "img/play.svg";
            document.getElementById("play").src = "img/play.svg";
          }
          clickedElement = element.currentTarget;
        });
      });
    });
  });

  document.getElementById("play").addEventListener("click", () => {
    if (songs != null) {
      if (currentSong.paused) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
        switchPlayPause("pause");
      } else {
        currentSong.pause();
        document.getElementById("play").src = "img/play.svg";
        switchPlayPause("play");
      }
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime1").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}`;
    document.querySelector(".songtime2").innerHTML = `${secondsToMinutes(
      currentSong.duration
    )}`;
    const percentagePosition =
      (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector(
      ".circle"
    ).style.left = `calc(${percentagePosition}% - 5px)`;
    let len = document.querySelector(".seekbar").offsetWidth;
    let colorlen = (percentagePosition / 100) * len;
    let revcolorlen = 1 - colorlen;
    if (isNaN(colorlen)) {
      colorlen = 0;
      revcolorlen = 0;
    }
    document.querySelector(
      ".seekbar"
    ).style.backgroundImage = `linear-gradient(to right, white ${colorlen}px, black ${
      revcolorlen * len
    }px`;
    if (currentSong.currentTime === currentSong.duration) {
      switchPlayPause("play");
      document.getElementById("play").src = "img/play.svg";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    if (songs != null) {
      let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = per + "%";
      currentSong.currentTime = (currentSong.duration * per) / 100;
    }
  });

  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-100%";
  });

  previous.addEventListener("click", () => {
    if (songs != null) {
      let filename = currentSong.src.split("/").pop();
      let basename = filename.replace(".mp3", "");
      let songname = basename.split("-")[0];
      let decodedsong = decodeURIComponent(songname).trim();
      let index = songs.indexOf(decodedsong);
      if (index > 0) {
        playMusic(keyValuePair[songs[index - 1]], songs[index - 1], "play");
        document.getElementById("play").src = "img/pause.svg";
        switchPlayPause("play");
        clickedElement = document.querySelector(
          `.songlist ul li:nth-child(${index})`
        );
        switchPlayPause("pause");
      }
    }
  });

  next.addEventListener("click", () => {
    if (songs != null) {
      let filename = currentSong.src.split("/").pop();
      let basename = filename.replace(".mp3", "");
      let songname = basename.split("-")[0];
      let decodedsong = decodeURIComponent(songname).trim();
      let index = songs.indexOf(decodedsong);
      if (index < songs.length - 1) {
        playMusic(keyValuePair[songs[index + 1]], songs[index + 1], "play");
        document.getElementById("play").src = "img/pause.svg";
        switchPlayPause("play");
        clickedElement = document.querySelector(
          `.songlist ul li:nth-child(${index + 2})`
        );
        switchPlayPause("pause");
      }
    }
  });

  let vol = document.querySelector(".volume img");

  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      laststate = e.target.value;
      currentSong.volume = parseInt(e.target.value) / 100;
      if (e.target.value == 0) {
        vol.src = "img/volumeoff.svg";
      } else if (e.target.value <= 50) {
        vol.src = "img/volumelow.svg";
      } else {
        vol.src = "img/volume.svg";
      }
    });

  vol.addEventListener("click", (e) => {
    if (e.target.src.includes("img/volumeoff.svg")) {
      document.querySelector(".volume").getElementsByTagName("input")[0].value =
        laststate;
      currentSong.volume = parseInt(laststate) / 100;
      if (laststate <= 50)
        e.target.src = e.target.src.replace("img/volumeoff.svg", "img/volumelow.svg");
      else e.target.src = e.target.src.replace("img/volumeoff.svg", "img/volume.svg");
    } else if (e.target.src.includes("img/volumelow.svg")) {
      e.target.src = e.target.src.replace("img/volumelow.svg", "img/volumeoff.svg");
      currentSong.volume = 0;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/volume.svg", "img/volumeoff.svg");
      currentSong.volume = 0;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;
    }
  });
}

main();
