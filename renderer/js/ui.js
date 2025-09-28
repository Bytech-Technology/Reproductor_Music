// ui.js
import { formatDuration } from "./dom.js";

/**
 * Renderiza la lista de canciones en el contenedor
 */
export function renderSongs(list, listContainer, showAddCallback, loadSong) {
  if (!listContainer) {
    console.error("[DEBUG] renderSongs: listContainer no existe");
    return;
  }

  listContainer.innerHTML = "";
  list.forEach((song, index) => {
    const item = document.createElement("div");
    item.classList.add("song-item");

    // Cover
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");
    const img = document.createElement("img");
    img.src = song.cover || "";
    img.alt = "Cover";
    img.width = 60;
    img.loading = "lazy";
    imgContainer.appendChild(img);

    // Info
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");
    const parts = song.title.split(" - ");
    const autorText = parts.length >= 2 ? parts[0].trim() : "desconocido";
    const titleText =
      parts.length >= 2 ? parts.slice(1).join(" - ").trim() : song.title.trim();

    const title = document.createElement("div");
    title.classList.add("song-title");
    title.textContent = titleText.toLowerCase();

    const autor = document.createElement("div");
    autor.classList.add("song-autor");
    autor.textContent = autorText.toLowerCase();

    const duration = document.createElement("div");
    duration.classList.add("song-duration");
    duration.textContent = formatDuration(song.duration);

    infoContainer.appendChild(title);
    infoContainer.appendChild(autor);
    infoContainer.appendChild(duration);

    // Actions
    const actionsContainer = document.createElement("div");
    actionsContainer.classList.add("actions-container");
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕";
    addBtn.onclick = (e) => {
      e.stopPropagation();
      showAddCallback(song);
    };

    actionsContainer.appendChild(addBtn);

    // Ensamblar
    item.appendChild(imgContainer);
    item.appendChild(infoContainer);
    item.appendChild(actionsContainer);

    // Al clickear toda la fila
    item.onclick = () => loadSong(index);

    listContainer.appendChild(item);
  });

  console.log("[DEBUG] renderSongs finalizado. items renderizados:", list.length);
}

/**
 * Reengancha handlers luego de reinyectar HTML cacheado
 */
export function attachHandlersToList(listContainer, currentSongs, loadSong, showAddCallback) {
  const items = listContainer.querySelectorAll(".song-item");
  items.forEach((item, idx) => {
    item.onclick = () => loadSong(idx);

    const addBtn = item.querySelector(".actions-container button");
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.stopPropagation();
        showAddCallback(currentSongs[idx]);
      };
    }
  });
}
