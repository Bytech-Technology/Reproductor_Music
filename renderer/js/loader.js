import { getEl } from "./dom.js";

export function showLoader() {
  const loader = getEl("loader");
  if (loader) loader.style.display = "flex";
}

export function hideLoader() {
  const loader = getEl("loader");
  if (!loader) return;
  loader.classList.add("loader-exit");
  setTimeout(() => { loader.style.display = "none"; }, 2200);
}
