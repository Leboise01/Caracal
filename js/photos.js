/* Page photos : albums déroulants + lightbox — données dans data/photos.js */

const TYPE_LABEL_PHOTOS = {
  camp: "Camp",
  "weekend-troupe": "Weekend troupe",
  "weekend-patrouille": "Weekend patrouille",
  sortie: "Sortie",
  rentree: "Rentrée",
  pelerinage: "Pèlerinage",
  autre: "Activité",
};

function slug(titre) {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferType(titre) {
  const t = titre.toLowerCase();
  if (t.includes("camp")) return "camp";
  if ((t.includes("week-end") || t.includes("weekend")) && t.includes("troupe")) return "weekend-troupe";
  if ((t.includes("week-end") || t.includes("weekend")) && t.includes("patrouille")) return "weekend-patrouille";
  if (t.includes("sortie")) return "sortie";
  if (t.includes("rentr")) return "rentree";
  if (t.includes("pelerinage") || t.includes("pèlerinage")) return "pelerinage";
  return "autre";
}

const chevron = '<svg class="photo-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>';

let albums = [];
let albumOuvert = null;
let lightboxAlbumId = null;
let lightboxIndex = 0;
const zipEncoder = new TextEncoder();

const zipCrcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function calculerCRC32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = zipCrcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function creerArchiveZip(files) {
  const localFiles = [];
  const centralFiles = [];
  let localOffset = 0;

  for (const file of files) {
    const name = zipEncoder.encode(file.name);
    const crc = calculerCRC32(file.bytes);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.bytes.length, true);
    localView.setUint32(22, file.bytes.length, true);
    localView.setUint16(26, name.length, true);
    localHeader.set(name, 30);
    localFiles.push(localHeader, file.bytes);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.bytes.length, true);
    centralView.setUint32(24, file.bytes.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralFiles.push(centralHeader);
    localOffset += localHeader.length + file.bytes.length;
  }

  const centralSize = centralFiles.reduce((size, part) => size + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);

  return new Blob([...localFiles, ...centralFiles, endRecord], { type: "application/zip" });
}

function afficherPhotoLightbox() {
  const album = albums.find((a) => a.id === lightboxAlbumId);
  if (!album) return;

  document.getElementById("lightbox-img").src = album.images[lightboxIndex];
  document.getElementById("lightbox-img").alt = `${album.title} — photo ${lightboxIndex + 1}`;
  document.getElementById("lightbox-title").textContent = album.title;
}

function ouvrirLightbox(albumId, index) {
  lightboxAlbumId = albumId;
  lightboxIndex = index;
  afficherPhotoLightbox();
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function naviguerPhotoLightbox(delta) {
  const album = albums.find((a) => a.id === lightboxAlbumId);
  if (!album) return;

  lightboxIndex = (lightboxIndex + delta + album.images.length) % album.images.length;
  afficherPhotoLightbox();
}

async function telechargerPhotoCourante() {
  const album = albums.find((a) => a.id === lightboxAlbumId);
  const button = document.getElementById("lightbox-download");
  const status = document.getElementById("lightbox-download-status");
  if (!album || !button || !status) return;

  const src = album.images[lightboxIndex];
  button.disabled = true;
  status.textContent = "";

  try {
    const response = await fetch(src, { mode: "cors", redirect: "error" });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

    const blob = await response.blob();
    const fileName = new URL(src).pathname.split("/").pop() || "photo.jpg";
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    console.error("Téléchargement de la photo impossible", error);
    status.textContent = "Téléchargement impossible. Réessayez plus tard.";
  } finally {
    button.disabled = false;
  }
}

async function telechargerAlbum(albumId, button) {
  const album = albums.find((item) => item.id === albumId);
  const status = document.getElementById(`album-download-status-${albumId}`);
  if (!album || !button || !status) return;

  button.disabled = true;
  status.textContent = `Préparation de l’album (0/${album.images.length})…`;

  try {
    const files = [];
    for (let i = 0; i < album.images.length; i++) {
      const response = await fetch(album.images[i], { mode: "cors", redirect: "error" });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const url = new URL(album.images[i]);
      const baseName = decodeURIComponent(url.pathname.split("/").pop() || `photo-${i + 1}.jpg`)
        .replace(/[\\/:*?"<>|]/g, "-");
      files.push({
        name: `${String(i + 1).padStart(3, "0")}-${baseName}`,
        bytes: new Uint8Array(await response.arrayBuffer()),
      });
      status.textContent = `Préparation de l’album (${i + 1}/${album.images.length})…`;
    }

    const zip = creerArchiveZip(files);
    const objectUrl = URL.createObjectURL(zip);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${album.id || "album"}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    status.textContent = "Archive téléchargée.";
  } catch (error) {
    console.error(`Téléchargement de l’album « ${album.title} » impossible`, error);
    status.textContent = "Échec du téléchargement. Vérifiez votre connexion et réessayez.";
  } finally {
    button.disabled = false;
  }
}

function fermerLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
  lightboxAlbumId = null;
}

function afficherAlbums() {
  const el = document.getElementById("photo-list");
  if (!el) return;

  el.innerHTML = albums.map((a) => {
    const ouvert = albumOuvert === a.id;
    return `
      <article class="photo-item${ouvert ? " open" : ""}" id="${a.id}">
        <div class="photo-heading">
          <button class="photo-toggle" type="button" data-id="${a.id}" aria-expanded="${ouvert}">
            <div class="photo-thumb"><img src="${a.cover}" alt="" loading="lazy" /></div>
            <div class="photo-info">
              <div class="type">${TYPE_LABEL_PHOTOS[a.type]} · ${a.images.length} photos</div>
              <h2>${a.title}</h2>
            </div>
            ${chevron}
          </button>
          <button class="album-download" type="button" data-album="${a.id}">Télécharger l’album</button>
        </div>
        <div class="album-download-status" id="album-download-status-${a.id}" role="status" aria-live="polite"></div>
        ${ouvert ? `
          <div class="photo-grid-wrap">
            <div class="photo-grid">
              ${a.images.map((src, i) => `
                <button type="button" class="btn-photo" data-album="${a.id}" data-index="${i}">
                  <img src="${src}" alt="${a.title} — photo ${i + 1}" loading="lazy" />
                </button>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");

  el.querySelectorAll(".photo-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      albumOuvert = albumOuvert === id ? null : id;
      afficherAlbums();
    });
  });

  el.querySelectorAll(".btn-photo").forEach((btn) => {
    btn.addEventListener("click", () => ouvrirLightbox(btn.dataset.album, Number(btn.dataset.index)));
  });

  el.querySelectorAll(".album-download").forEach((btn) => {
    btn.addEventListener("click", () => telechargerAlbum(btn.dataset.album, btn));
  });
}

function init() {
  const raw = typeof PHOTOS !== "undefined" ? PHOTOS : [];
  albums = raw
    .filter((c) => c.images.length > 0)
    .map((c) => ({
      id: slug(c.title),
      title: c.title,
      type: inferType(c.title),
      cover: c.images[0],
      images: c.images,
    }));

  const hash = location.hash.replace("#", "");
  albumOuvert = albums.find((a) => a.id === hash)?.id ?? albums[0]?.id ?? null;

  afficherAlbums();

  if (hash) {
    setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") fermerLightbox();
  });
  document.getElementById("lightbox-close")?.addEventListener("click", fermerLightbox);
  document.getElementById("lightbox-previous")?.addEventListener("click", () => naviguerPhotoLightbox(-1));
  document.getElementById("lightbox-next")?.addEventListener("click", () => naviguerPhotoLightbox(1));
  document.getElementById("lightbox-download")?.addEventListener("click", telechargerPhotoCourante);
  document.querySelector(".lightbox-body")?.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerLightbox();
    if (!document.getElementById("lightbox").classList.contains("open")) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      naviguerPhotoLightbox(e.key === "ArrowLeft" ? -1 : 1);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
