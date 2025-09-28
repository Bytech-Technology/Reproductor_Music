// storage.js
/**
 * Manejo de almacenamiento local de albums y library
 */

let albums = JSON.parse(localStorage.getItem("albums")) || {};
let library = JSON.parse(localStorage.getItem("library")) || {};

export function getAlbums() {
  return albums;
}

export function getLibrary() {
  return library;
}

export function setAlbums(newAlbums) {
  albums = newAlbums;
}

export function setLibrary(newLibrary) {
  library = newLibrary;
}

/**
 * Guarda los datos en localStorage
 */
export function saveData() {
  try {
    localStorage.setItem("albums", JSON.stringify(albums));
    localStorage.setItem("library", JSON.stringify(library));
    console.log("[DEBUG] saveData -> albums, library guardados");
  } catch (err) {
    console.error("[DEBUG] error guardando localStorage:", err);
  }
}
