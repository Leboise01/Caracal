/* Affiche le calendrier (page calendrier.html) — données dans data/calendrier.js */

const ICONS = {
  camp: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
  "weekend-troupe": '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  "weekend-patrouille": '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  sortie: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l4-8 4 4 4-10 4 14"/></svg>',
  rentree: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8H4l4.9 3.6-1.9 5.8L12 14.6l5 3.6-1.9-5.8L20 8.8h-6.1z"/></svg>',
  pelerinage: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3v6l-3-4-3 4V2H6l3 20h6z"/></svg>',
  autre: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
};

function renderTimeline() {
  const el = document.getElementById("timeline");
  if (!el) return;

  const grouped = ORDRE_MOIS_SCOUT
    .map((m) => ({
      monthIndex: m,
      monthName: MOIS[m],
      items: CALENDRIER.filter((c) => c.monthIndex === m),
    }))
    .filter((g) => g.items.length > 0);

  el.innerHTML = grouped
    .map(
      (group) => `
    <div class="timeline-month">
      <div class="month-header">
        <div class="month-name-desktop">${group.monthName}</div>
        <div class="month-name-mobile">${group.monthName.slice(0, 3).toUpperCase()}</div>
      </div>
      <ul class="timeline-events">
        ${group.items
          .map(
            (item) => `
          <li class="timeline-event">
            <div class="timeline-dot"></div>
            <article class="event-card">
              <div class="event-card-inner">
                <div class="event-icon">${ICONS[item.type] || ICONS.autre}</div>
                <div>
                  <div class="event-meta">
                    <span class="event-date">${item.dateLabel}</span>
                    <span class="event-type">${TYPE_LABEL[item.type]}</span>
                    ${item.optional ? '<span class="event-optional">Optionnel</span>' : ""}
                  </div>
                  <h3 class="event-title">${item.title}</h3>
                </div>
              </div>
            </article>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", renderTimeline);
