// Improved Code for Music Player
console.log("I am Back");

let currentSong = new Audio();
let songs;
const folder = "Songs"; // Define the folder name here
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    const response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const links = Array.from(doc.getElementsByTagName("a"));
    songs = links
        .filter((link) => link.href.endsWith(".mp3"))
        .map((link) => decodeURIComponent(link.href.split(`/${folder}/`).pop()));

    console.log("Fetched songs:", songs);

    //Show all songs in the playlist

    const songUL = document.querySelector(".songsList ul");
    songUL.innerHTML = ""; // Clear previous entries

    songs.forEach((song) => {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="./SVG/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Song Artist</div>
                </div>
                <div class="playnow">
                    <div>Play Now</div>
                    <img src="./SVG/play.svg" class="invert">
                </div>
            </li>`;
    });
    // Evenlistener to each songs
    document.querySelector(".songsList").addEventListener("click", (e) => {
        const target = e.target.closest("li");
        if (target) {
            const track = target.querySelector(".info div").innerText.trim();
            playMusic(track);
        }
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    if (!track) {
        console.warn("No track specified for playback.");
        return;
    }

    // currentSong.src = `/${currFolder}/${track}`;
   const songUrl = `/${currFolder}/${encodeURIComponent(track)}`;
    console.log("Resolved URL:", songUrl);

    currentSong.src = songUrl;
    if (!pause) {
        currentSong.play().catch((err) => console.error("Error playing track:", err));

        console.log(`Playing: ${currentSong.src}`);
        console.log("Track to play:", track);
    }

    document.querySelector(".songinfo").innerText = decodeURIComponent(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    const playButton = document.querySelector("#play");
    if (playButton) playButton.src = "./SVG/pause.svg";
    currentSong.addEventListener("error", () => {
        console.error("Error playing the song. Check file path:", currentSong.src);
    });
    

};

// async function displayAlbums() {
// console.log("Displaying albums");
// const response = await fetch(`/Songs/`);
// const html = await response.text();

// const div = document.createElement("div");
// div.innerHTML = html;
// const anchors = div.getElementsByTagName("a");
// const cardContainer = document.querySelector("");
// cardContainer.innerHTML = ""; // Clear container

// Array.from(anchors).forEach(async (e) => {
//     if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
//         const folder = e.href.split("/").slice(-2)[0];
//         const metadataResponse = await fetch(`/songs/${folder}/info.json`);
//         const metadata = await metadataResponse.json();

//         cardContainer.innerHTML += `
//             <div data-folder="${folder}" class="card">
//                 <div class="play">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
//                     </svg>
//                 </div>
//                 <img src="/songs/${folder}/cover.jpg" alt="">
//                 <h2>${metadata.title}</h2>
//                 <p>${metadata.description}</p>
//             </div>`;
//     }
// });




async function main() {
    await getSongs("Songs/Arjit_Singh")
    playMusic(songs[0], true)
    // await displayAlbums();

    const play = document.querySelector("#play");
    const prev = document.querySelector("#prev");
    const next = document.querySelector("#next");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./SVG/pause.svg";
        } else {
            currentSong.pause();
            play.src = "./SVG/play.svg";
        }
    })
    //Evenlistener for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //Eventlistener for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    prev.addEventListener("click", () => {
        currentSong.pause()
        play.src="./SVG/play.svg"
        console.log("Previous clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        // console.log(index)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
     play.src="./SVG/play.svg"

        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        if ((index + 1) < songs.length) {
            console.log(index)

            playMusic(songs[index + 1])
        }
    })


    // Eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        console.log("i am working")
        document.querySelector(".left").style.left = "0";
    });
    //Listener for closing the hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
    
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("artist")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            const folder = item.currentTarget.dataset.folder;
            console.log("Fetching Songs from Folder:", folder);
            document.querySelectorAll(".artist").forEach((card) => card.classList.remove("active"));
            item.currentTarget.classList.add("active");
    
            if (!folder) {
                console.error("No folder found for this card.");
                return;
            }
    
            try {
                songs = await getSongs(folder);
                if (songs.length > 0) {
                    console.log("Songs fetched successfully:", songs);
                    playMusic(songs[0]);
                } else {
                    console.warn("No songs found in the folder:", folder);
                }
            } catch (err) {
                console.error("Error fetching songs:", err);
            }
        });
        
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

main()
