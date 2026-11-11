/* Menu mobile + année dans le pied de page */
document.getElementById("menu-btn")?.addEventListener("click", () => {
  document.getElementById("nav-mobile")?.classList.toggle("open");
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.addEventListener("contextmenu", (event) => {
  if (event.target.matches?.(".photo-thumb img, .photo-grid img, #lightbox-img, .gallery-card img")) {
    event.preventDefault();
  }
});
