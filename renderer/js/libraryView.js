import { renderSongs, attachHandlersToList } from "./ui.js";
import { showAddToAlbumsModal } from "./albums.js";

/**
 * Inicializa las pestañas "Todas" y "Biblioteca".
 * @param {HTMLElement} tabAll 
 * @param {HTMLElement} tabLibrary 
 * @param {HTMLElement} listContainer 
 * @param {Array} songsList 
 * @param {Object} albums 
 * @param {Object} library 
 * @param {Object} state - Contiene currentAlbum y currentFilteredSongs
 * @param {Function} loadSong 
 * @param {HTMLElement} albumModal
 */
export function initTabs(tabAll, tabLibrary, listContainer, songsList, albums, library, state, loadSong, albumModal) {
  let cachedAllSongsHTML = null;
  state.currentFilteredSongs = songsList;

  if (tabAll) {
    tabAll.onclick = () => {
      tabAll.classList.add("active");
      if (tabLibrary) tabLibrary.classList.remove("active");

      state.currentFilteredSongs = songsList;

      if (!cachedAllSongsHTML) {
        renderSongs(
          songsList,
          listContainer,
          (song) => showAddToAlbumsModal(albumModal, albums, library, song, songsList, state.currentAlbum, listContainer, tabLibrary, loadSong),
          loadSong
        );
        cachedAllSongsHTML = listContainer.innerHTML;
      } else {
        listContainer.innerHTML = cachedAllSongsHTML;
        attachHandlersToList(
          listContainer,
          state.currentFilteredSongs,
          loadSong,
          (song) => showAddToAlbumsModal(albumModal, albums, library, song, songsList, state.currentAlbum, listContainer, tabLibrary, loadSong)
        );
      }
    };
  }

  if (tabLibrary) {
    tabLibrary.onclick = () => {
      tabLibrary.classList.add("active");
      if (tabAll) tabAll.classList.remove("active");
      listContainer.innerHTML = "";

      Object.keys(albums).forEach(albumName => {
        const albumItem = document.createElement("div");
        albumItem.classList.add("album-item");
        albumItem.innerHTML = `
          <div class="album-cover">${albumName.charAt(0).toUpperCase()}</div>
          <div class="album-info">
            <div class="album-title">${albumName}</div>
            <div class="album-count">${(library[albumName] || []).length} canciones</div>
          </div>
        `;

        albumItem.onclick = () => {
          state.currentAlbum = albumName;
          const ids = library[albumName] || [];
          const filtered = songsList.filter(song => ids.includes(song.id));
          state.currentFilteredSongs = filtered;

          renderSongs(
            filtered,
            listContainer,
            (song) => showAddToAlbumsModal(albumModal, albums, library, song, songsList, state.currentAlbum, listContainer, tabLibrary, loadSong),
            loadSong
          );

          const header = document.createElement("div");
          header.classList.add("album-header");
          header.innerHTML = `
            <button id="back-to-library">Volver</button>
            <h2>${albumName}</h2>
          `;
          listContainer.prepend(header);

          header.querySelector("#back-to-library").onclick = () => tabLibrary.click();
        };

        listContainer.appendChild(albumItem);
      });
    };
  }

  // Retorna la función para obtener la lista filtrada actual
  return () => state.currentFilteredSongs;
}
