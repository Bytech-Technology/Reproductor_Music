// player.js
/**
 * Módulo para manejar controles de reproducción de audio
 */

let audio = null;
let currentIndex = -1;
let songs = [];
let isShuffle = false;
let isRepeat = true;

let onLoadSong = null; // callback para cargar canción
let togglePlayPauseUI = null; // callback para actualizar UI

export function initPlayer(audioElement, songsList, loadSongFn, toggleUIFn) {
  audio = audioElement;
  songs = songsList;
  onLoadSong = loadSongFn;
  togglePlayPauseUI = toggleUIFn;

  // Estado inicial
  isShuffle = false;
  isRepeat = true;
}

export function play() {
  if (!audio) return;
  if (currentIndex === -1 && songs.length > 0) {
    onLoadSong(0); // primera canción
  } else {
    audio.play().catch(err => console.warn("[DEBUG] play error:", err));
    if (togglePlayPauseUI) togglePlayPauseUI(true);
  }
}

export function pause() {
  if (!audio) return;
  audio.pause();
  if (togglePlayPauseUI) togglePlayPauseUI(false);
}

export function next() {
  if (!audio || songs.length === 0) return;

  if (isShuffle) {
    const randomIndex = Math.floor(Math.random() * songs.length);
    onLoadSong(randomIndex);
  } else if (currentIndex + 1 < songs.length) {
    onLoadSong(currentIndex + 1);
  } else if (isRepeat) {
    onLoadSong(0);
  }
}

export function prev() {
  if (!audio || songs.length === 0) return;
  if (currentIndex - 1 >= 0) {
    onLoadSong(currentIndex - 1);
  }
}

export function toggleShuffle() {
  isShuffle = !isShuffle;
  if (isShuffle) isRepeat = false;
  return { isShuffle, isRepeat };
}

export function toggleRepeat() {
  isRepeat = !isRepeat;
  if (isRepeat) isShuffle = false;
  return { isShuffle, isRepeat };
}

/**
 * Actualiza el índice actual (lo debe llamar loadSong)
 */
export function setCurrentIndex(index) {
  currentIndex = index;
}

/**
 * Devuelve el índice actual
 */
export function getCurrentIndex() {
  return currentIndex;
}
