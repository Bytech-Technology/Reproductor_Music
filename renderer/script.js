/**
 * script.js
 * Punto de entrada principal del reproductor de música.
 * - Carga lista de canciones desde la API de Electron.
 * - Inicializa visualizador, reproductor, tabs, álbumes, loader, controles y eventos.
 * - Administra el estado global del reproductor.
 */

import { getEl } from './js/dom.js';
import { renderSongs } from "./js/ui.js";
import { initTimer } from './js/timer.js';
import { initTabs } from './js/libraryView.js';
import { initVisualizer } from './js/visualizer.js';
import { hideLoader, showLoader } from './js/loader.js';
import { getAlbums, getLibrary } from './js/storage.js';
import { initTrayControls } from './js/trayControls.js';
import { initControls, togglePlayPause } from './js/controls.js';
import { showAddToAlbumsModal, initAlbumHandlers } from "./js/albums.js";
import { initPlayer, next, prev, setCurrentIndex } from './js/player.js';

console.log("[DEBUG] script.js cargado");

/**
 * Punto de entrada principal
 */
function initApp() {
    if (!window.api?.getMusicList) {
        console.error("[DEBUG] window.api.getMusicList NO está disponible");
        return;
    }

    window.api.getMusicList()
        .then(handleMusicList)
        .catch(err => console.error("[DEBUG] getMusicList REJECTED:", err));
}

/**
 * Maneja la lista de canciones obtenida de la API
 */
function handleMusicList(songs) {
    try {
        console.log("[DEBUG] getMusicList resolved. songs:", Array.isArray(songs) ? songs.length : songs);

        const dom = initDOMElements();
        if (!dom.listContainer) {
            console.error("[DEBUG] falta #music-list en el DOM");
            return;
        }

        const state = initState(songs);
        const { albums, library } = state;

        showLoader();
        initVisualizer(dom.audio);
        initPlayer(dom.audio, state.songsList, loadSong, togglePlayPause);
        initAlbumHandlers(dom.createAlbumBtn, dom.closeAlbumBtn, dom.albumModal, albums, library, null);

        renderSongs(
            state.songsList,
            dom.listContainer,
            (song) => showAddToAlbumsModal(dom.albumModal, albums, library, song, state.songsList, state.currentAlbum, dom.listContainer, dom.tabLibrary, loadSong),
            loadSong
        );

        const getCurrentFilteredSongs = initTabs(
            dom.tabAll, dom.tabLibrary, dom.listContainer,
            state.songsList, albums, library,
            state, loadSong, dom.albumModal
        );

        if (state.songsList.length > 0) loadSong(0, false);

        hideLoader();
        initControls(dom.audio);
        initTimer(dom.audio, dom.minuteContent);

        bindAudioEvents(dom.audio);
        initTrayControls(dom.audio, next, prev);

        console.log("[DEBUG] getMusicList handler finalizado correctamente");

        // Funciones internas accesibles
        function loadSong(index, autoPlay = true) {
            setCurrentIndex(index);
            state.currentFilteredSongs = getCurrentFilteredSongs();
            if (!isValidIndex(index, state.currentFilteredSongs)) return;

            state.currentIndex = index;
            highlightCurrentSong(dom.listContainer, dom.audio, state);

            const song = state.currentFilteredSongs[state.currentIndex];
            updateSongInfo(dom, song);
            updateTray(song, dom);
            updateBackground(dom.contentViews, song);

            if (dom.audio) {
                dom.audio.src = song.path;
                if (autoPlay) playAudio(dom.audio);
            }
        }
    } catch (err) {
        console.error("[DEBUG] Error dentro del handler getMusicList:", err);
    }
}

/** ==============================
 * Utilidades y helpers
 * ============================== */

/** Inicializa elementos del DOM */
function initDOMElements() {
    return {
        listContainer: document.getElementById('music-list'),
        audio: getEl("audio"),
        currentTitle: getEl('current-title'),
        currentAutor: getEl('current-title-autor'),
        contentViews: document.getElementsByClassName('music_background'),
        minuteContent: getEl('minute-music'),
        tabAll: getEl("tab-all"),
        tabLibrary: getEl("tab-library"),
        albumModal: getEl("album-modal"),
        createAlbumBtn: getEl("create-album"),
        closeAlbumBtn: getEl("close-album")
    };
}

/** Inicializa estado global */
function initState(songs) {
    const songsList = (Array.isArray(songs) ? songs : []).map((song, i) => ({
        ...song,
        id: song.id ?? i
    }));

    return {
        songsList,
        currentIndex: -1,
        currentAlbum: null,
        currentFilteredSongs: songsList,
        albums: getAlbums(),
        library: getLibrary()
    };
}

/** Valida índice dentro de lista */
function isValidIndex(index, list) {
    return index >= 0 && index < list.length;
}

/** Resalta canción actual */
function highlightCurrentSong(listContainer, audio, state) {
    if (!listContainer) return;

    const items = listContainer.querySelectorAll('.song-item');
    items.forEach((item, idx) => {
        const song = state.currentFilteredSongs[idx];
        const isPlaying = song?.id === state.currentFilteredSongs[state.currentIndex]?.id;
        item.classList.toggle('playing', isPlaying);
    });

    togglePlayPause(!audio.paused);
}

/** Actualiza info de canción en UI */
function updateSongInfo(dom, song) {
    const { currentAutor, currentTitle } = dom;
    const parts = song.title.split(" - ");

    if (parts.length >= 2) {
        if (currentAutor) currentAutor.textContent = parts[0].toLowerCase();
        if (currentTitle) currentTitle.textContent = parts.slice(1).join(" - ").toLowerCase();
    } else {
        if (currentAutor) currentAutor.textContent = "desconocido";
        if (currentTitle) currentTitle.textContent = song.title.toLowerCase();
    }
}

/** Actualiza info en tray de Electron */
function updateTray(song, dom) {
    const { currentAutor, currentTitle } = dom;
    const traySongTitle = `${currentAutor?.textContent ?? ""} - ${currentTitle?.textContent ?? ""}`;

    if (window.electronAPI?.updateCurrentSong) {
        window.electronAPI.updateCurrentSong(traySongTitle);
    }

    if (window.electronAPI?.updateCurrentCover) {
        window.electronAPI.updateCurrentCover(song.cover ?? null);
    }
}

/** Actualiza fondo dinámico */
function updateBackground(contentViews, song) {
    for (const view of contentViews) {
        if (song.cover) {
            view.style.backgroundImage = `url('${song.cover}')`;
            view.style.backgroundSize = '100% 100%';
        } else {
            view.style.backgroundImage = 'none';
            view.style.backgroundColor = '#181b2c';
        }
    }
}

/** Maneja reproducción segura */
function playAudio(audio) {
    audio.play().catch(err => console.warn("[DEBUG] audio.play() falló:", err));
}

/** Eventos de audio */
function bindAudioEvents(audio) {
    audio.addEventListener("ended", next);
    audio.addEventListener("play", () => togglePlayPause(true));
    audio.addEventListener("pause", () => togglePlayPause(false));
}

// Inicializar app
initApp();
