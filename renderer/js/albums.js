import { setAlbums, setLibrary, saveData } from "./storage.js";
import { renderSongs, attachHandlersToList } from "./ui.js";

// Muestra modal para crear un nuevo álbum
export function showCreateAlbumModal(albumModal, albums, library, pendingSongToAddRef) {
    if (!albumModal) { alert("Modal no encontrado"); return; }

    albumModal.innerHTML = `
        <div class="album-card">
            <h3>Crear nuevo álbum</h3>
            <input type="text" id="album-name" placeholder="Nombre del álbum">
            <div style="margin-top:1rem; display:flex; gap:.5rem; justify-content:center;">
                <button id="create-album">Crear</button>
                <button id="close-album">Cancelar</button>
            </div>
        </div>
    `;

    albumModal.classList.remove("hidden");

    const createBtnLocal = albumModal.querySelector("#create-album");
    const closeBtnLocal = albumModal.querySelector("#close-album");

    createBtnLocal.onclick = () => {
        const nameInput = albumModal.querySelector("#album-name");
        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) { alert("Ingrese un nombre de álbum"); return; }

        albums[name] = true;
        setAlbums(albums);

        library[name] = library[name] || [];
        if (pendingSongToAddRef.value) {
            if (!library[name].includes(pendingSongToAddRef.value.id)) {
                library[name].push(pendingSongToAddRef.value.id);
            }
            pendingSongToAddRef.value = null;
        }

        setLibrary(library);
        saveData();
        albumModal.classList.add("hidden");
    };

    closeBtnLocal.onclick = () => {
        albumModal.classList.add("hidden");
        pendingSongToAddRef.value = null;
    };
}

// Muestra modal para agregar una canción a uno o varios álbumes
export function showAddToAlbumsModal(
    albumModal, albums, library, song, songsList,
    currentAlbumRef, listContainer, tabLibrary, loadSong
) {
    if (!albumModal) { alert("Modal no encontrado"); return; }

    const albumNames = Object.keys(albums);
    if (albumNames.length === 0) {
        alert("Primero debes crear un álbum");
        return;
    }

    albumModal.innerHTML = `
        <div class="album-card fancy">
            <div class="album-card-header">
                <h3><img src="../assets/logo.png" class="icon" width="25" height="25"> Selecciona álbumes</h3>
                <p>Marca uno o varios álbumes para añadir la canción</p>
            </div>
            <div id="albums-checkboxes" class="album-checkbox-list">
                ${albumNames.map(name => `
                    <label class="album-option">
                        <input type="checkbox" value="${name}">
                        <span class="checkmark"></span>
                        <div class="album-option-content">
                            <div class="album-cover-small">${name.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="album-name">${name}</div>
                                <div class="album-count">${(library[name] || []).length} canciones</div>
                            </div>
                        </div>
                    </label>
                `).join("")}
            </div>
            <div class="album-actions">
                <button id="confirm-add" class="btn primary">Agregar</button>
                <button id="cancel-add" class="btn danger">Cancelar</button>
            </div>
        </div>
    `;

    albumModal.classList.remove("hidden");

    albumModal.querySelector("#confirm-add").onclick = () => {
        const checked = albumModal.querySelectorAll("#albums-checkboxes input:checked");
        if (checked.length === 0) {
            alert("Debes seleccionar al menos un álbum antes de agregar.");
            return;
        }

        checked.forEach(chk => {
            const chosen = chk.value;
            if (!library[chosen]) library[chosen] = [];
            if (!library[chosen].includes(song.id)) {
                library[chosen].push(song.id);
            }
        });

        saveData();
        albumModal.classList.add("hidden");
        alert("Agregado a los álbumes seleccionados");

        // refrescar si estamos en un álbum
        if (currentAlbumRef.value) {
            const ids = library[currentAlbumRef.value] || [];
            const filtered = songsList.filter(s => ids.includes(s.id));
            renderSongs(filtered, listContainer, showAddToAlbumsModal, loadSong);

            const header = document.createElement('div');
            header.classList.add('album-header');
            header.innerHTML = `
                <button id="back-to-library">Volver</button>
                <h2>${currentAlbumRef.value}</h2>
            `;
            listContainer.prepend(header);

            header.querySelector('#back-to-library').onclick = () => {
                tabLibrary.click();
            };

            attachHandlersToList(listContainer, filtered, loadSong, showAddToAlbumsModal);
        }
    };

    albumModal.querySelector("#cancel-add").onclick = () => {
        albumModal.classList.add("hidden");
    };
}

// Inicializa handlers de botones de álbum
export function initAlbumHandlers(createAlbumBtn, closeAlbumBtn, albumModal, albums, library, pendingSongToAddRef) {
    if (createAlbumBtn) {
        createAlbumBtn.onclick = () => showCreateAlbumModal(albumModal, albums, library, pendingSongToAddRef);
    }
    if (closeAlbumBtn) {
        closeAlbumBtn.onclick = () => {
            albumModal.classList.add("hidden");
            pendingSongToAddRef.value = null;
        };
    }
}
