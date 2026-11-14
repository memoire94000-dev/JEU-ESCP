# L’Arène Memorall

Quatre jeux, quatre niveaux, en solo ou en compétition en direct par QR code.

## Défi DSCG (`/dscg`)

Troisième édition hébergée par le même serveur : trois jeux pour réviser le DSCG (UE1 Gestion juridique, fiscale et sociale, UE2 Finance), chacun en quatre niveaux, en solo ou en compétition en direct.

- Adresse : `/dscg/` (lien direct d'un salon : `/dscg/#1234`).
- Page : `public/dscg/index.html`, autonome (polices et bibliothèques intégrées).
- Serveur : `src/dscg.js`. Routes `/dscg/api/…` et `/dscg/ws/<code>`, une salle `DscgSalon` par code de salon, records dans `DscgRecords`. Seul l'animateur pilote son salon, chaque joueur ne modifie que son propre score ; les salons inactifs s'effacent au bout de 24 heures.
