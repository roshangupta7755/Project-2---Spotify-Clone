console.log("GitHub Pages Fixed JS    ");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

/* ================= UTIL ================= */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ================= SONGS ================= */
async function getSongs(folder) {
    currFolder = folder;

    // ✅ RELATIVE PATH (GitHub Pages safe)
    let res = await fetch(`${folder}/songs.json`);
    songs = await res.json();

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li data-song="${song}">
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>Roshan</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.dataset.song);
        });
    });

    return songs;
}

/* ================= PLAYER ================= */
function playMusic(track, pause = false) {
    if (!track) return;

    // ✅ RELATIVE PATH
    currentSong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

/* ================= ALBUMS ================= */
async function displayAlbums() {
    // ⚠️ ONLY folders that actually exist
    const albums = ["ncs"];
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const folder of albums) {
        let res = await fetch(`song/${folder}/info.json`);
        let info = await res.json();

        cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                </svg>
            </div>
            <img src="song/${folder}/cover.jpg">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        </div>`;
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async e => {
            songs = await getSongs(`song/${e.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

/* ================= MAIN ================= */
async function main() {
    await getSongs("song/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") location.reload();
    });
}

main();
