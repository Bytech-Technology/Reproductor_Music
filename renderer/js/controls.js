import { getEl } from "./dom.js";
import { play, pause, next, prev, toggleShuffle, toggleRepeat, getState } from "./player.js";

let playBtn, pauseBtn;

/**
 * Inicializa los controles de reproducción (play, pause, next, prev, shuffle, repeat).
 * @param {HTMLAudioElement} audio - Elemento <audio>.
 */
export function initControls(audio) {
    playBtn = getEl('play-btn');
    pauseBtn = getEl('pause-btn');
    const nextBtn = getEl('next-btn');
    const prevBtn = getEl('prev-btn');
    const shuffleBtn = getEl('shuffle');
    const repeatBtn = getEl('repeat');

    const { isShuffle, isRepeat } = getState();
    if (shuffleBtn) shuffleBtn.classList.toggle("active", isShuffle);
    if (repeatBtn) repeatBtn.classList.toggle("active", isRepeat);

    // Play/Pause
    if (playBtn) playBtn.onclick = () => play();
    if (pauseBtn) pauseBtn.onclick = () => pause();

    // Next/Prev
    if (nextBtn) nextBtn.onclick = () => next();
    if (prevBtn) prevBtn.onclick = () => prev();

    // Shuffle
    if (shuffleBtn) {
        shuffleBtn.onclick = () => {
            const state = toggleShuffle();
            repeatBtn.classList.remove("active");
            shuffleBtn.classList.remove("active");
            if (state.isRepeat) repeatBtn.classList.add("active");
            if (state.isShuffle) shuffleBtn.classList.add("active");
        };
    }

    // Repeat
    if (repeatBtn) {
        repeatBtn.onclick = () => {
            const state = toggleRepeat();
            repeatBtn.classList.remove("active");
            shuffleBtn.classList.remove("active");
            if (state.isRepeat) repeatBtn.classList.add("active");
            if (state.isShuffle) shuffleBtn.classList.add("active");
        };
    }
}

/**
 * Cambia los íconos de play/pause según estado.
 * @param {boolean} isPlaying
 */
export function togglePlayPause(isPlaying) {
    if (playBtn) playBtn.style.display = isPlaying ? "none" : "inline-block";
    if (pauseBtn) pauseBtn.style.display = isPlaying ? "inline-block" : "none";
}
