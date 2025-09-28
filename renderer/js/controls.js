import { getEl } from "./dom.js";
import { play, pause, next, prev, toggleShuffle, toggleRepeat } from "./player.js";

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

    if (repeatBtn) repeatBtn.classList.add("active");

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
            shuffleBtn.classList.toggle("active", state.isShuffle);
            if (repeatBtn) repeatBtn.classList.toggle("active", state.isRepeat);
        };
    }

    // Repeat
    if (repeatBtn) {
        repeatBtn.onclick = () => {
            const state = toggleRepeat();
            repeatBtn.classList.toggle("active", state.isRepeat);
            if (shuffleBtn) shuffleBtn.classList.toggle("active", state.isShuffle);
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
