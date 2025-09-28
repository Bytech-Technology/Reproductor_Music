export function initTrayControls(audio, next, prev) {
  if (window.electronAPI && typeof window.electronAPI.onTrayControl === "function") {
    window.electronAPI.onTrayControl((action) => {
      console.log("[DEBUG] onTrayControl action:", action);
      if (!audio) return;
      if (action === "togglePlayPause") {
        if (audio.paused) audio.play().catch(err => console.warn("[DEBUG] play error", err));
        else audio.pause();
      } else if (action === "next") {
        next();
      } else if (action === "prev") {
        prev();
      }
    });
  } else {
    console.warn("[DEBUG] electronAPI.onTrayControl no disponible");
  }
}
