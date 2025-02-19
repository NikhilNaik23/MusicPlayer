let currentSong = new Audio();
var songs;
let currFolder;
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

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let element = document.createElement("div");
    element.innerHTML = response;
    let as = element.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                <img src="Images/music.svg" class="invert" alt="">
                <div class="info">
                     <div>${song.replace("%20", " ")}</div>
                     <div>Random Artist</div>
                </div>
                <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="Images/play.svg" alt="">
                </div>
            </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.querySelector(".playNow").querySelector("img").addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/"+track)
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
        play.src = "Images/pause.svg";
    }
    console.log(currentSong);
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

    
}

async function displayAlbums() {
    let a =await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    console.log(div);
    let anchors = Array.from(div.querySelector("#files").getElementsByTagName("a"));
    let array = anchors;
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            

        if(e.href.includes("/songs")){
            let folder = e.href.split('/').slice(-1)[0];
            //Get meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true"
                                class="Svg-sc-ytk21e-0 bneLcE e-9541-icon" viewBox="0 0 24 24">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //Load the library 
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })

}

async function main() {

    //Get the list of all songs
    await getSongs("songs/Telugu");
    playMusic(songs[0], true);
    
    //Display all the albums
    displayAlbums();
    

    //Attach an event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Images/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "Images/play.svg";
        }
    })

    //Listen for timeupdate event
    let circle = document.querySelector(".circle");
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        const progress = (currentSong.currentTime / currentSong.duration) * 100;
        circle.style.left = `${progress}%`
    })


    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        var perc = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        circle.style.left = `${perc}%`
        var timestamp = (perc / 100) * currentSong.duration;
        currentSong.currentTime = timestamp;

    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous and next
    prev.addEventListener("click", () => {
        let i = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (i - 1 >= 0) {
            console.log(i);
            playMusic(songs[i - 1]);
        }

    })
    next.addEventListener("click", () => {
        let i = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if (i + 1 < songs.length) {
            playMusic(songs[i + 1]);
        }
    })

    //Add an event to volume bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "Images/noSound.svg";
        }
        else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "Images/volume.svg";
        }
    })

    //Add an event listener to volume icon
    var vol = document.querySelector(".volume").getElementsByTagName("img")[0];
    var volumeSlider = document.querySelector(".range").getElementsByTagName("input")[0];
    var num = parseFloat(currentSong.volume);
    vol.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            vol.src = "Images/noSound.svg";
            currentSong.volume = 0;
            volumeSlider.value = 0*100;
        }
        else {
            vol.src = "Images/Volume.svg";
            currentSong.volume = num;
            volumeSlider.value = num*100;
        }
    })

    
}
main();