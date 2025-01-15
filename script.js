console.log("I am Back");

let currentSong = new Audio();
let songs = [];
const folder = "Songs"; // Define the folder name here

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    try {
        const response = await fetch(`${folder}/`);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const links = doc.getElementsByTagName("a");
        songs = Array.from(links)
            .map(link => link.href)
            .filter(href => href.endsWith(".mp3"))
            .map(href => decodeURIComponent(href.split(`${folder}/`).pop()));

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

const playMusic = (track, pause=false) => {
    if (!track) {
        console.warn("No track specified for playback.");
        return;
    }
    currentSong.src = `${folder}/${track}`;
    if(!pause){

        currentSong.play().catch(err => console.error("Error playing track:", err));
        console.log(`Playing: ${currentSong.src}`);
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    const playButton = document.querySelector("#play");
    if (playButton) playButton.src = "./SVG/pause.svg";
};

async function main() {
    songs = await getSongs();
    if (!songs || songs.length === 0) {
        console.warn("No songs found in the specified folder.");
        return;
    }

    console.log("Fetched songs:", songs);

    const songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songs.forEach(song => {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="./SVG/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ").substring(0, 24)}</div>
                    <div>Song Artist</div>
                </div>
                <div class="playnow">
                    <div>Play Now</div>
                    <img src="./SVG/play.svg" class="invert">
                </div>
            </li>`;
    });

    Array.from(songUL.getElementsByTagName("li")).forEach((liElement, index) => {
        liElement.addEventListener("click", () => playMusic(songs[index]));
    });

    const play = document.querySelector("#play");
    const prev = document.querySelector("#prev");
    const next = document.querySelector("#next");
    
    //Event listener for Previous next and and play button
    play.addEventListener("click", () => {
        console.log("play clicked")
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./SVG/pause.svg";
        } else {
            currentSong.pause();
            play.src = "./SVG/play.svg";
        }
    });


    prev.addEventListener("click", () => {
        currentSong.pause();
        play.src="./SVG/play.svg"
        console.log("previous clicked")
        // console.log(currentSong.src.split("/").slice(-1));
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        console.log(songs,index)
        if ((index-1)  >= 0) {
            playMusic(songs[index -1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        play.src="./SVG/play.svg"
        console.log("next clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        console.log(songs,index)
        if ((index +1) < songs.length){
            playMusic(songs[index + 1]);
        }
    });
    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //Adding an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //Event Listener for controlling the Volume
    const volumeControl = document.querySelector("#volcontrol");
    const volumeIcon = document.querySelector("#volume-1");

    volumeControl.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        volumeIcon.src = currentSong.volume > 0 ? "./SVG/volume.svg" : "./SVG/mute.svg";
    });

    volumeIcon.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            volumeIcon.src = "./SVG/mute.svg";
            currentSong.volume = 0;
            volumeControl.value = 0;
        } else {
            volumeIcon.src = "./SVG/volume.svg";
            currentSong.volume = 0.1;
            volumeControl.value = 10;
        }
    });
}

main();
