import { formatDuration } from "./dom.js";

export function initTimer(audio, minuteContent) {
  if (!audio || !minuteContent) return;

  // al cargar duración total
  audio.addEventListener("loadedmetadata", () => {
    minuteContent.textContent = `0:00 / ${formatDuration(audio.duration)}`;
  });

  // mientras reproduce
  audio.addEventListener("timeupdate", () => {
    if (isNaN(audio.duration)) return;
    const current = formatDuration(audio.currentTime);
    const total = formatDuration(audio.duration);
    minuteContent.textContent = `${current} / ${total}`;
  });
}
