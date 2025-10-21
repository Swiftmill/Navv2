# HyperGX

HyperGX est un navigateur desktop construit avec Electron, Vite, React et TypeScript. Il s'inspire d'Opera GX et fonctionne entièrement en local : tous les paramètres, favoris, historiques et sessions sont stockés dans des fichiers JSON situés dans `%APPDATA%/HyperGX/` (ou l'équivalent Linux/macOS via `app.getPath('appData')`).

## Installation rapide

```bash
npm install
npm run dev
```

La première commande installe toutes les dépendances. La seconde lance Vite pour le renderer et le processus principal Electron avec rechargement automatique.

## Scripts disponibles

- `npm run dev` : démarre Vite et Electron en mode développement avec hot reload.
- `npm run build:ui` : build du renderer React via Vite.
- `npm run build` : build complet (main + preload + renderer) et packaging Windows via `electron-builder`.
- `npm run lint` : exécute ESLint sur le projet.
- `npm run typecheck` : vérifie les types TypeScript.
- `npm run format` : formatage Prettier.
- `npm run test` : exécute les tests unitaires (Vitest).

## Structure des dossiers

```
/app
  /main      # Processus principal Electron (fenêtres, IPC, sécurité)
  /preload   # APIs sécurisées exposées au renderer
  /renderer  # Interface React + Tailwind + shadcn/ui
/assets      # Icônes, thèmes, sons
/data        # Données JSON seed (favoris, paramètres, historique, sessions)
```

## Fonctionnalités majeures (v1)

- Gestion d'onglets (ouverture, duplication, fermeture, épinglage, restauration).
- Barre d'adresse intelligente avec suggestions (historique + favoris).
- Sidebar modulable : favoris, historique, téléchargements, extensions (placeholder).
- Player musique / fond vidéo pour la page d'accueil.
- Thèmes (clair/sombre), couleur d'accent personnalisée, fonds vidéo locaux.
- Contrôles style GX (limites CPU/RAM simulées).
- Raccourcis clavier populaires (Ctrl+T, Ctrl+W, etc.).
- Gestion des téléchargements côté local.
- Restauration de session automatique.
- Adblock intégré via `@cliqz/adblocker-electron` avec listes locales.
- Moteurs de recherche personnalisables et raccourcis `!g`, `!ddg`, etc.
- Page paramètres complète.

## Sécurité

- `nodeIntegration` désactivé.
- `contextIsolation` activé et preload minimal.
- `sandbox` actif.
- CSP stricte côté renderer.
- API preload avec white list d'IPC et typage strict.
- Filtrage des schémas d'URL autorisés.

## Packaging

Le packaging Windows se fait via `electron-builder` (portable `.exe` et installeur NSIS). L'auto-update est désactivé par défaut.

## Tests

Des tests unitaires illustrent la gestion atomique des fichiers JSON (`app/main/utils/__tests__/atomicFile.test.ts`).

## Licence

MIT
