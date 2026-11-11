/* ============================================================
   CALENDRIER — Modifier les dates ici
   monthIndex : 0=janv, 1=fév, … 8=sept, 9=oct, 10=nov, 11=déc
   type : camp | weekend-troupe | weekend-patrouille | sortie | rentree | pelerinage | autre
   optional: true pour afficher le badge « Optionnel »
   ============================================================ */

const CALENDRIER = [
  { id: "we-hp-oct", title: "Week-end HP", dateLabel: "3 – 4 octobre", monthIndex: 9, type: "weekend-patrouille" },
  { id: "sortie-pat-oct", title: "Sortie de patrouille", dateLabel: "Samedi 17 octobre", monthIndex: 9, type: "sortie" },

  { id: "we-pat-nov", title: "Week-end de patrouille", dateLabel: "7 – 8 novembre", monthIndex: 10, type: "weekend-patrouille" },
  { id: "we-troupe-nov", title: "Week-end de Troupe", dateLabel: "28 – 29 novembre", monthIndex: 10, type: "weekend-troupe" },

  { id: "we-pat-dec", title: "Week-end de patrouille", dateLabel: "12 – 13 décembre", monthIndex: 11, type: "weekend-patrouille" },

  { id: "we-hp-neige-jan", title: "Week-end HP – Neige", dateLabel: "16 – 17 janvier", monthIndex: 0, type: "weekend-patrouille" },
  { id: "we-pat-jan", title: "Week-end de patrouille", dateLabel: "30 – 31 janvier", monthIndex: 0, type: "weekend-patrouille" },

  { id: "sortie-pat-fev", title: "Sortie de patrouille", dateLabel: "Dimanche 7 février", monthIndex: 1, type: "sortie" },
  { id: "camp-hiver", title: "Camp d'hiver", dateLabel: "Date à définir", monthIndex: 1, type: "camp" },

  { id: "we-troupe-mars", title: "Week-end de Troupe", dateLabel: "6 – 7 mars", monthIndex: 2, type: "weekend-troupe" },
  { id: "sortie-pat-mars", title: "Sortie de patrouille", dateLabel: "Dimanche 21 mars", monthIndex: 2, type: "sortie" },

  { id: "messe-interscout-avr", title: "Messe interscoute", dateLabel: "Dimanche 4 avril", monthIndex: 3, type: "autre" },
  { id: "camp-paques", title: "Camp de Pâques", dateLabel: "À prévoir entre le 10 et le 16 avril", monthIndex: 3, type: "camp" },

  { id: "sortie-pat-mai", title: "Sortie de patrouille", dateLabel: "Dimanche 2 mai", monthIndex: 4, type: "sortie" },
  { id: "we-troupe-mai", title: "Week-end de Troupe", dateLabel: "29 – 30 mai", monthIndex: 4, type: "weekend-troupe" },

  { id: "we-pat-juin", title: "Week-end de patrouille", dateLabel: "5 – 6 juin", monthIndex: 5, type: "weekend-patrouille" },
  { id: "we-hp-sp-juin", title: "Week-end HP + SP – Sommet avec un GHM", dateLabel: "19 – 20 juin", monthIndex: 5, type: "weekend-patrouille" },

  { id: "camp-ete-2027", title: "Camp d'été 2027", dateLabel: "Dates à préciser", monthIndex: 6, type: "camp" },
];

const TYPE_LABEL = {
  camp: "Camp",
  "weekend-troupe": "Week-end troupe",
  "weekend-patrouille": "Week-end patrouille",
  sortie: "Sortie",
  rentree: "Rentrée",
  pelerinage: "Pèlerinage",
  autre: "Activité",
};

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/* Ordre année scoute : septembre → août */
const ORDRE_MOIS_SCOUT = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7];
