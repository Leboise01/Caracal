/* Page d'accueil : prochaine activité + souvenirs récents */

function parseDay(label) {
  const m = label.match(/(\d{1,2})/);
  return m ? parseInt(m[1], 10) : 1;
}

function getProchaineActivite() {
  const today = new Date();
  const year = today.getFullYear();
  const todayMs = new Date(today).setHours(0, 0, 0, 0);

  const liste = CALENDRIER.map((a) => {
    const yr = a.monthIndex >= 8 ? year : year + (today.getMonth() >= 8 ? 1 : 0);
    return { activity: a, when: new Date(yr, a.monthIndex, parseDay(a.dateLabel)) };
  }).sort((x, y) => x.when - y.when);

  return liste.find((a) => a.when.getTime() >= todayMs)?.activity ?? null;
}

function slug(titre) {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function chargerPhotos() {
  return typeof PHOTOS !== "undefined" ? PHOTOS : [];
}

function afficherProchaineActivite() {
  const el = document.getElementById("next-activity");
  if (!el) return;

  const next = getProchaineActivite();
  if (!next) {
    el.innerHTML = "";
    return;
  }

  const target = (() => {
    const today = new Date();
    const yr = next.monthIndex >= 8 ? today.getFullYear() : today.getFullYear() + (today.getMonth() >= 8 ? 1 : 0);
    return new Date(yr, next.monthIndex, parseDay(next.dateLabel));
  })();

  const jours = Math.max(0, Math.floor((target - Date.now()) / 86400000));
  const libelleJours = jours <= 1 ? "jour" : "jours";

  el.innerHTML = `
    <div class="next-card">
      <div class="next-card-glow"></div>
      <div class="next-card-inner">
        <div>
          <div class="label" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Prochaine activité
          </div>
          <h3>${next.title}</h3>
          <div class="next-card-meta">
            <strong>${next.dateLabel}</strong> · ${TYPE_LABEL[next.type]}
          </div>
        </div>
        <div class="countdown">
          <div>
            <div class="countdown-num">${jours}</div>
            <div class="countdown-label">${libelleJours}</div>
          </div>
          <a href="calendrier.html" class="btn-outline next-cal-link">Calendrier →</a>
        </div>
      </div>
    </div>
  `;
}

function afficherSouvenirsRecents(albums) {
  const el = document.getElementById("recent-galleries");
  if (!el) return;

  el.innerHTML = albums.slice(0, 3).map((a) => `
    <a href="photos.html#${a.id}" class="gallery-card">
      <img src="${a.cover}" alt="${a.title}" loading="lazy" />
      <div class="overlay"></div>
      <div class="info">
        <div class="count">${a.images.length} photos</div>
        <h3>${a.title}</h3>
      </div>
    </a>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  afficherProchaineActivite();
  const raw = chargerPhotos();
  const albums = raw
    .filter((c) => c.images.length > 0)
    .map((c) => ({
      id: slug(c.title),
      title: c.title,
      cover: c.images[0],
      images: c.images,
    }));
  afficherSouvenirsRecents(albums);
});
