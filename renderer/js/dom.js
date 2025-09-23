// dom.js
/**
 * Helpers DOM pequeños reutilizables
 */

export function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[DEBUG] Elemento con id "${id}" NO encontrado`);
  return el;
}

export function formatDuration(seconds) {
  const totalSeconds = Math.floor(seconds || 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}