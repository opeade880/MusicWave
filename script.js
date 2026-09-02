import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ==========================================
// MUSICWAVE - COMPLETE MUSIC PLAYER
// ==========================================


// ==========================================
// PLAYER ELEMENTS
// ==========================================

const audio = new Audio();

const playButtons = document.querySelectorAll(".play-btn");

const playerTitle = document.querySelector("#player-title");
const playerArtist = document.querySelector("#player-artist");
const playerCover = document.querySelector("#player-cover");

const playPauseButton = document.querySelector("#play-pause-btn");
const prevButton = document.querySelector("#prev-btn");
const nextButton = document.querySelector("#next-btn");

const progressBar = document.querySelector("#progress-bar");
const currentTimeDisplay = document.querySelector("#current-time");
const durationDisplay = document.querySelector("#duration");

const volumeSlider = document.querySelector("#volume-slider");


// ==========================================
// SEARCH ELEMENTS
// ==========================================

const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-btn");
const searchForm = document.querySelector("#search-form");
const searchResults = document.querySelector("#search-results");


// ==========================================
// PLAYLIST ELEMENT
// ==========================================

const playlistList = document.querySelector("#playlist-list");
const favouritesList =
    document.querySelector("#favourites-list");

// ==========================================
// LOCAL MUSIC LIBRARY
// ==========================================

const songs = [
    {
        title: "Back 2 U",
        artist: "Seyi Vibez",
        file: "./music/Seyi-Vibez-BACK-2-U.mp3",
        cover: "./images/cover1.jpg"
    },

    {
        title: "Diamond or Gold",
        artist: "Tml Vibez",
        file: "./music/Tml-Vibez-Diamond-or-Gold.mp3",
        cover: "./images/cover2.jpg"
    },

    {
        title: "Dantata",
        artist: "Zinoleesky",
        file: "./music/Zinoleesky-Dantata.mp3",
        cover: "./images/cover3.jpg"
    }
];


// ==========================================
// PLAYER STATE
// ==========================================

let currentSong = 0;

let isApiPreview = false;


// ==========================================
// PLAY LOCAL SONG
// ==========================================

function playSong(index) {

    currentSong = index;

    isApiPreview = false;

    const song = songs[currentSong];

    audio.src = song.file;

    playerTitle.textContent = song.title;

    playerArtist.textContent = song.artist;

    playerCover.src = song.cover;

    audio.play();

    playPauseButton.textContent = "⏸";
}


// ==========================================
// LOCAL SONG PLAY BUTTONS
// ==========================================

playButtons.forEach((button, index) => {

    button.addEventListener("click", () => {

        playSong(index);

    });

});


// ==========================================
// PLAY / PAUSE
// ==========================================

playPauseButton.addEventListener("click", () => {

    if (!audio.src) {

        playSong(currentSong);

        return;
    }

    if (audio.paused) {

        audio.play();

        playPauseButton.textContent = "⏸";

    } else {

        audio.pause();

        playPauseButton.textContent = "▶";
    }

});


// ==========================================
// NEXT SONG
// ==========================================

nextButton.addEventListener("click", () => {

    if (isApiPreview) {

        playSong(0);

        return;
    }

    currentSong++;

    if (currentSong >= songs.length) {

        currentSong = 0;
    }

    playSong(currentSong);

});


// ==========================================
// PREVIOUS SONG
// ==========================================

prevButton.addEventListener("click", () => {

    if (isApiPreview) {

        playSong(0);

        return;
    }

    currentSong--;

    if (currentSong < 0) {

        currentSong = songs.length - 1;
    }

    playSong(currentSong);

});


// ==========================================
// VOLUME
// ==========================================

audio.volume = volumeSlider.value / 100;

volumeSlider.addEventListener("input", () => {

    audio.volume = volumeSlider.value / 100;

});


// ==========================================
// SONG PROGRESS
// ==========================================

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    const progress =
        (audio.currentTime / audio.duration) * 100;

    progressBar.value = progress;

    currentTimeDisplay.textContent =
        formatTime(audio.currentTime);

});


// ==========================================
// SONG DURATION
// ==========================================

audio.addEventListener("loadedmetadata", () => {

    durationDisplay.textContent =
        formatTime(audio.duration);

});


// ==========================================
// MOVE THROUGH SONG
// ==========================================

progressBar.addEventListener("input", () => {

    if (!audio.duration) return;

    audio.currentTime =
        (progressBar.value / 100) * audio.duration;

});


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    if (isNaN(seconds)) {

        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;

}


// ==========================================
// AUTOMATICALLY PLAY NEXT LOCAL SONG
// ==========================================

audio.addEventListener("ended", () => {

    if (isApiPreview) {

        playPauseButton.textContent = "▶";

        return;
    }

    currentSong++;

    if (currentSong >= songs.length) {

        currentSong = 0;
    }

    playSong(currentSong);

});


// ==========================================
// SEARCH MUSIC API
// ==========================================

async function searchMusicApi(searchTerm) {

    const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
        throw new Error("Music search request failed.");
    }

    const data = await response.json();

    return data.data.slice(0, 12).map((song) => ({
        trackName: song.title,
        artistName: song.artist.name,
        previewUrl: song.preview,
        artworkUrl100: song.album.cover_medium
    }));
}

async function searchMusic() {

    const searchTerm =
        searchInput.value.trim();

    if (searchTerm === "") {

        alert("Please enter a song or artist name!");

        return;
    }

    searchResults.innerHTML =
        "<p>Searching for music... 🎵</p>";

    try {

        const songsFound = await searchMusicApi(searchTerm);

        if (songsFound.length === 0) {

            searchResults.innerHTML =
                "<p>No songs found. Try another search!</p>";

            return;
        }

        searchResults.innerHTML = "";

        songsFound.forEach((song) => {

            const previewUrl =
                song.previewUrl || "";

            searchResults.innerHTML += `

                <div class="music-card">

                    <img
                        src="${song.artworkUrl100}"
                        alt="${song.trackName}"
                        class="search-cover"
                    >

                    <h3>${song.trackName}</h3>

                    <p>${song.artistName}</p>


                    <button
                        class="preview-btn"

                        data-preview="${previewUrl}"

                        data-title="${song.trackName}"

                        data-artist="${song.artistName}"

                        data-cover="${song.artworkUrl100}"
                    >
                        ▶ Preview
                    </button>


                    <button
                        class="favorite-btn"

                        data-title="${song.trackName}"

                        data-artist="${song.artistName}"
                    >
                        ♡ Favourite
                    </button>


                    <button
                        class="playlist-btn"

                        data-title="${song.trackName}"

                        data-artist="${song.artistName}"

                        data-preview="${previewUrl}"

                        data-cover="${song.artworkUrl100}"
                    >
                        ➕ Add to Playlist
                    </button>

                </div>

            `;

        });

    } catch (error) {

        console.error("Search error:", error);

        searchResults.innerHTML =
            "<p>Something went wrong. Please try again.</p>";

    }

}


// ==========================================
// SEARCH BUTTON
// ==========================================

searchResults.addEventListener("click", (event) => {

    if (!event.target.classList.contains("preview-btn")) {
        return;
    }

    const previewUrl = event.target.dataset.preview;

    if (!previewUrl) {
        alert("No preview is available for this song.");
        return;
    }

    audio.src = previewUrl;
    isApiPreview = true;

    playerTitle.textContent = event.target.dataset.title;
    playerArtist.textContent = event.target.dataset.artist;
    playerCover.src = event.target.dataset.cover;

    audio.play().catch((error) => {
        console.error("Preview playback error:", error);
    });

    playPauseButton.textContent = "⏸";

});

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();
    searchMusic();

});


// ==========================================
// SEARCH WITH ENTER
// ==========================================

// ==========================================
// FAVOURITES - FIRESTORE
// ==========================================

searchResults.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("favorite-btn")) {
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        alert("Please login to save favourites.");
        return;
    }

    const title = event.target.dataset.title;
    const artist = event.target.dataset.artist;

    try {

        const favouritesRef = collection(
            db,
            "users",
            user.uid,
            "favourites"
        );

        const existingSongs = await getDocs(favouritesRef);

        const alreadySaved = existingSongs.docs.some((song) => {

            const data = song.data();

            return (
                data.title === title &&
                data.artist === artist
            );

        });

        if (alreadySaved) {

            alert("This song is already in your favourites ❤️");

            return;
        }

        await addDoc(favouritesRef, {
            title: title,
            artist: artist
        });

        event.target.textContent = "❤️ Saved";

        alert("Added to favourites ❤️");

    } catch (error) {

        console.error("Error saving favourite:", error);

        alert("Could not save favourite.");

    }

});

// ==========================================
// LOAD FAVOURITES FROM FIRESTORE
// ==========================================

async function loadFavourites() {

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    try {

        const favouritesRef = collection(
            db,
            "users",
            user.uid,
            "favourites"
        );

        const snapshot = await getDocs(favouritesRef);

        favouritesList.innerHTML = "";

        if (snapshot.empty) {

            favouritesList.innerHTML =
                "<p>Your favourite songs will appear here ❤️</p>";

            return;
        }

        snapshot.forEach((document) => {

            const song = document.data();

            favouritesList.innerHTML += `
                
                <div class="music-card">

                    <h3>${song.title}</h3>

                    <p>${song.artist}</p>

                    <button
                        class="remove-favorite-btn"
                        data-id="${document.id}"
                    >
                        🗑 Remove
                    </button>

                </div>
            `;

        });

    } catch (error) {

        console.error(
            "Error loading favourites:",
            error
        );

    }

}

favouritesList.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("remove-favorite-btn")) {
        return;
    }

    const user = auth.currentUser;
    const favouriteId = event.target.dataset.id;

    if (!user || !favouriteId) {
        return;
    }

    try {

        await deleteDoc(doc(
            db,
            "users",
            user.uid,
            "favourites",
            favouriteId
        ));

        await loadFavourites();

    } catch (error) {

        console.error("Error removing favourite:", error);

        alert("Could not remove favourite.");

    }

});

// ==========================================
// LOAD FAVOURITES WHEN USER LOGS IN
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadFavourites();

    } else {

        favouritesList.innerHTML =
            "<p>Please log in to see your favourites ❤️</p>";

    }

});


// ==========================================
// PLAYLIST
// ==========================================

let playlist =
    JSON.parse(localStorage.getItem("playlist")) || [];


// ==========================================
// ADD SONG TO PLAYLIST
// ==========================================

searchResults.addEventListener("click", (event) => {

    if (
        !event.target.classList.contains(
            "playlist-btn"
        )
    ) {

        return;
    }


    const title =
        event.target.dataset.title;

    const artist =
        event.target.dataset.artist;

    const preview =
        event.target.dataset.preview;

    const cover =
        event.target.dataset.cover;


    const playlistSong = {

        title: title,

        artist: artist,

        preview: preview,

        cover: cover

    };


    const alreadyAdded =
        playlist.some((song) =>

            song.title === title &&
            song.artist === artist

        );


    if (alreadyAdded) {

        alert(
            "This song is already in your playlist 🎶"
        );

        return;
    }


    playlist.push(playlistSong);


    localStorage.setItem(
        "playlist",
        JSON.stringify(playlist)
    );


    event.target.textContent =
        "✅ Added";


    displayPlaylist();

});


// ==========================================
// DISPLAY PLAYLIST
// ==========================================

function displayPlaylist() {

    playlist =
        JSON.parse(localStorage.getItem("playlist")) || [];


    if (playlist.length === 0) {

        playlistList.innerHTML =
            "<p>Your playlist is empty. Add some music! 🎵</p>";

        return;
    }


    playlistList.innerHTML = "";


    playlist.forEach((song, index) => {

        playlistList.innerHTML += `

            <div class="music-card">

                <img
                    src="${song.cover || "./images/cover1.jpg"}"

                    alt="${song.title}"

                    class="album-cover"
                >

                <h3>${song.title}</h3>

                <p>${song.artist}</p>


                <button
                    class="playlist-preview-btn"

                    data-index="${index}"
                >
                    ▶ Preview
                </button>


                <button
                    class="remove-playlist-btn"

                    data-index="${index}"
                >
                    ❌ Remove
                </button>

            </div>

        `;

    });

}


// ==========================================
// PLAYLIST BUTTONS
// ==========================================

playlistList.addEventListener("click", (event) => {

    const index =
        event.target.dataset.index;


    // PLAY PLAYLIST SONG
    if (
        event.target.classList.contains(
            "playlist-preview-btn"
        )
    ) {

        const song =
            playlist[index];


        if (!song.preview) {

            alert(
                "This song does not have a preview available."
            );

            return;
        }


        audio.src =
            song.preview;

        isApiPreview = true;


        playerTitle.textContent =
            song.title;

        playerArtist.textContent =
            song.artist;

        playerCover.src =
            song.cover || "./images/cover1.jpg";


        audio.play();

        playPauseButton.textContent =
            "⏸";

    }


    // REMOVE PLAYLIST SONG
    if (
        event.target.classList.contains(
            "remove-playlist-btn"
        )
    ) {

        playlist.splice(index, 1);


        localStorage.setItem(
            "playlist",
            JSON.stringify(playlist)
        );


        displayPlaylist();

    }

});


// ==========================================
// LOAD SAVED DATA
// ==========================================

loadFavourites();

displayPlaylist();