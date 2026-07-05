# Release Radar — Roadmap

## Stack

- **Backend** (`backend/`) : Java 21 + Spring Boot 4.0 (Maven) — `dev.theolambert/release-radar`
- **Frontend** (`frontend/`) : React 19 + TypeScript + Vite + Tailwind v4
- **Base de données** : PostgreSQL 17 (Docker)
- **Auth** : Spring Security 7 + JWT (jjwt 0.12)

### Arborescence (monorepo)

```text
ReleaseRadar/
├── backend/            # Spring Boot (src, pom.xml, Dockerfile, mvnw, run-tests.sh)
├── frontend/           # React + Vite (Dockerfile → Nginx)
├── docker-compose.yml  # orchestre postgres + app + frontend
├── stitch_release_radar/  # maquettes & design system (DESIGN.md)
└── ROADMAP.md
```

---

## ✅ Fait

### Infrastructure
- [x] `docker-compose.yml` — PostgreSQL + app Spring Boot conteneurisés
- [x] `Dockerfile` multi-stage (build Maven → JRE 21)
- [x] `application.properties` — datasource, JPA (`ddl-auto=update`), JWT

### Entités JPA
- [x] `User` — id (UUID), email, password, followedArtists (`@ManyToMany`), implements `UserDetails`
- [x] `Artist` — id (UUID), mbid (MusicBrainz ID), name, releases, `equals/hashCode` sur id
- [x] `Release` — id (UUID), mbid, title, type (`ReleaseType`), releaseDate, artist (`@ManyToOne`)
- [x] `ReleaseType` — enum : ALBUM, SINGLE, EP, COMPILATION, LIVE, OTHER
- [x] Table de jointure `subscriptions` (User ↔ Artist via `@ManyToMany`)

### Auth JWT
- [x] `POST /api/auth/register` — crée un compte, retourne un token
- [x] `POST /api/auth/login` — retourne un token
- [x] `JwtService` — génération + validation (HS256)
- [x] `JwtAuthenticationFilter` — valide le Bearer token sur chaque requête
- [x] `SecurityConfig` — STATELESS, CSRF désactivé, `/api/auth/**` public

### API REST
- [x] `GET    /api/artists` — liste les artistes suivis
- [x] `POST   /api/artists` — suivre un artiste `{ mbid, name }`
- [x] `DELETE /api/artists/{id}` — ne plus suivre
- [x] `GET    /api/releases` — sorties des artistes suivis (triées par date desc)

---

## ✅ Fait (suite)

### Étape 7 — Intégration MusicBrainz + Scheduler

- [x] Client HTTP MusicBrainz (`MusicBrainzClient` via `RestClient`)
  - `GET /api/artists/search?q=` — recherche d'artiste par nom via MusicBrainz
  - Récupération des releases d'un artiste par `mbid` (`inc=release-groups` pour le type)
- [x] `@Scheduled` polling toutes les 24h (`initialDelay=60s`)
  - Pour chaque artiste suivi (`ArtistRepository.findAllFollowed()`), interroger MusicBrainz
  - Persister les nouvelles releases détectées (déduplication par `mbid`)
  - Point d'intégration email commenté : `// emailService.notifySubscribers(artist, newReleases)`
- [x] Rate limiting MusicBrainz : `Thread.sleep(1100ms)` entre chaque artiste
- [x] Parsing de date flexible : `YYYY-MM-DD`, `YYYY-MM`, `YYYY`
- [x] Mapping `ReleaseType` depuis `release-group.primary-type` MusicBrainz

---

## 🔲 À faire

### Étape 8 — Notifications email

- [x] Dépendance `spring-boot-starter-mail` + config SMTP via variables d'env (`MAIL_HOST/PORT/USERNAME/PASSWORD`)
- [x] `EmailService` — envoi HTML par `JavaMailSender`, un email par abonné
- [x] Template email HTML (titre, type, date de sortie par release)
- [x] Détection des vraies nouvelles sorties :
  - `lastSyncedAt` sur `Artist` — mis à jour après chaque sync réussi
  - Premier sync : on persiste tout mais on ne notifie pas (données historiques)
  - Syncs suivants : notification uniquement pour les releases des 30 derniers jours
- [x] `emailService.notifySubscribers(artist, newReleases)` branché dans `MusicBrainzSyncService`

### Étape 9 — Améliorations backend

- [x] Validation des requêtes (`spring-boot-starter-validation`, `@Valid`, `@NotBlank`, `@Email`, `@Size`)
- [x] Gestion globale des erreurs (`@RestControllerAdvice`) — 400 avec détail des champs, 404, 409, 500
- [x] Flyway + `ddl-auto=validate` — migration `V1__init.sql`, `baseline-on-migrate=true`
- [x] Endpoint `GET /api/artists/search?q=` — recherche via MusicBrainz *(fait en étape 7)*
- [x] `jwt.secret` sécurisé via `${JWT_SECRET}` (variable d'environnement, fallback dev en clair)

### Étape 10 — Frontend React + TypeScript

**Design** : maquettes Stitch dans [`stitch_release_radar/`](stitch_release_radar/) (voir
[`release_radar/DESIGN.md`](stitch_release_radar/release_radar/DESIGN.md)).
Design system repris tel quel : thème sombre « obsidian », accent gradient
violet→magenta (`#8B5CF6`→`#EC4899`), typo **Inter**, cartes glassmorphes, badges
`NEW / ALBUM / EP / SINGLE`, rythme 4px.

**Adaptation** : les maquettes dessinent une app de *streaming* (lecteur « Now Playing »,
boutons Play, compteurs d'écoutes, « Premium Member »). Release Radar est un **traqueur
de sorties** qui notifie par email — on garde le look, on retire tout ce qui n'a pas de
donnée côté backend (lecteur, play, plays/monthly listeners, premium).

**Contrat d'API consommé** (backend existant) :

- `POST /api/auth/register` `{ email, password }` → `201 { token }`
- `POST /api/auth/login` `{ email, password }` → `200 { token }`
- `GET /api/artists/search?q=` *(auth)* → `[{ mbid, name, disambiguation }]`
- `GET /api/artists` *(auth)* → artistes suivis `[{ id, mbid, name }]`
- `POST /api/artists` `{ mbid, name }` *(auth)* → `201` (follow)
- `DELETE /api/artists/{id}` *(auth)* → `204` (unfollow)
- `GET /api/releases` *(auth)* → `[{ id, mbid, title, type, releaseDate, artistId, artistName }]`
- `POST /api/admin/sync` *(ADMIN)* → `200` — sync globale manuelle
- `POST /api/admin/test-email` *(ADMIN)* → `200`
- `GET /api/admin/users` *(ADMIN)* → `[{ id, email, role, followedCount, createdAt }]`
- `PATCH /api/admin/users/{id}/role` `{ role }` *(ADMIN)* → `200` (change USER ⇄ ADMIN, hors soi-même)
- `DELETE /api/admin/users/{id}` *(ADMIN)* → `204` (hors soi-même)
- `GET /api/admin/artists` *(ADMIN)* → tous les artistes `[{ id, mbid, name }]`
- `POST /api/admin/artists/{id}/sync` *(ADMIN)* → `200` — sync d'un seul artiste
- Le JWT contient désormais un claim `role` (`USER` | `ADMIN`)

#### 10.1 — Setup & fondations ✅

- [x] Scaffold Vite + React + TypeScript dans `frontend/` (Vite 8, React 19, TS 6, Node 22 LTS)
- [x] Tailwind CSS v4 configuré avec les tokens du `DESIGN.md` (`@theme` dans `index.css`, typo Inter self-hosted, utilities `gradient-brand` / `text-gradient-brand`)
- [x] Client HTTP axios (`src/lib/api.ts`) : `baseURL` = `VITE_API_URL` ?? `/api`, injection `Bearer`, redirection `/login` sur 401
- [x] Utilitaires token JWT (`src/lib/token.ts`) : stockage localStorage, décodage, validation d'expiration
- [x] Routing `react-router` v7 : routes publiques (`/login`, `/register`) + `ProtectedRoute` (routes protégées)
- [x] Proxy Vite `/api` → `http://localhost:8080` (dev, évite CORS)
- [x] Qualité de code : **oxlint** (config enrichie) + **Prettier** (+ tri des classes Tailwind) + `.editorconfig` ; scripts `lint` / `lint:fix` / `format` / `typecheck` / `check` — `npm run check` : 0 warning / 0 erreur

#### 10.2 — Auth & session JWT ✅

- [x] `AuthContext` (`context.ts` + `AuthProvider.tsx` + `useAuth.ts`) — `login/register/logout`, user (email) décodé du JWT
- [x] Persistance du token (localStorage) + restauration synchrone au démarrage + expiration gérée (401 → purge + redirection via l'interceptor axios)
- [x] `ProtectedRoute` rebranché sur `useAuth` + `PublicOnlyRoute` (redirige les connectés hors de /login /register)
- [x] Écran **Login** (« Welcome Back ») câblé à `/api/auth/login` — champs email/password, toggle œil, gestion erreurs + loading
- [x] Écran **Register** (« Join the Radar ») câblé à `/api/auth/register` — confirm password + min 8 car. (miroir de la validation backend) + case CGU
- [x] Composants réutilisables : `AuthLayout`, `TextField`, `Button`, `Logo` ; icônes `lucide-react`
- [ ] *(reporté en 10.7)* rôle/`isAdmin` : le JWT ne contient pas le rôle → à ajouter (claim JWT ou endpoint `/me`) pour l'UI admin

#### 10.3 — Layout applicatif ✅

- [x] `AppLayout` (shell des routes protégées) : `Sidebar` + `Topbar` + `<Outlet/>`
- [x] `Sidebar` : logo, nav `Home` / `Discovery` / `Library` (`NavLink` actif), bloc user (email) + logout
- [x] `Topbar` : barre de recherche (→ `/discovery?q=`), avatar + icônes bell/settings
- [x] `ReleaseBadge` (couleur par type) + `ReleaseCard` (pochette, badge NEW < 30j, titre, artiste, date)
- [x] `CoverArt` : pochette via **Cover Art Archive** (`coverartarchive.org/release/{mbid}/front-250` — le mbid stocké est un *release*, pas un release-group) avec fallback tuile gradient
- [x] Pages placeholder `Discovery` / `Library` (routes câblées, contenu en 10.5 / 10.6)

#### 10.4 — Dashboard (Home / New releases) ✅

- [x] Section « Latest Releases » depuis `GET /api/releases` (grille de `ReleaseCard`, badge NEW si < 30 jours)
- [x] Section « Artists You Follow » depuis `GET /api/artists` (`ArtistCard`, rangée scrollable)
- [x] États vides (aucune sortie / aucun artiste → CTA « Follow Artists » vers `/discovery`)
- [x] Hook générique `useApi<T>` (`data / loading / error / reload`) + skeletons (`ReleaseCardSkeleton`) + `EmptyState` réutilisable (erreur avec bouton « Réessayer »)

#### 10.5 — Discovery (recherche MusicBrainz) ✅

- [x] Barre de recherche → `GET /api/artists/search?q=` (debounce 350 ms, min. 2 car., annulation des réponses obsolètes) ; requête synchronisée avec l'URL `?q=` (partageable, alignée sur la Topbar)
- [x] Liste de résultats (`ArtistResultRow`) avec bouton **Follow / Following** (`POST` / `DELETE /api/artists`), état pending par ligne
- [x] Synchro de l'état « following » via le hook `useFollowedArtists` (`followedId(mbid)` → id pour l'unfollow ; partagé avec la Library en 10.6)
- [x] États : requête trop courte, chargement (skeletons), erreur (« Réessayer »), aucun résultat

#### 10.6 — Library / détail artiste ✅

- [x] **Library** : artistes suivis (`LibraryArtistSection`) + leurs sorties en rangée scrollable, bouton « Ne plus suivre » (pending) ; états loading / erreur / vide (CTA Discovery)
- [x] **Artist detail** (`/library/:id`) : header (avatar, nom, bouton Follow/Following) + discographie ; artiste capturé localement pour rester affichable après un unfollow ; états introuvable / vide / loading
- [x] Jointure releases ↔ artiste **par `artistId`** — `ReleaseResponse` expose désormais `artistId` (en plus de `artistName`), jointure fiable côté front (Library + détail) *(dette de jointure par nom levée)*

#### 10.7 — Espace admin (rôle ADMIN) ✅

Objectif : un **espace d'administration** accessible uniquement aux comptes `ADMIN`,
permettant de **gérer les utilisateurs** et de **déclencher une synchronisation**
(globale ou pour un artiste précis).

##### Backend

- [x] Rôle exposé au frontend via un claim `role` dans le JWT (`JwtService`) — lève la dette notée en 10.2
- [x] Gestion des utilisateurs (endpoints `ADMIN`, `AdminUserController` + `AdminUserService`) :
  - `GET /api/admin/users` → `[{ id, email, role, followedCount, createdAt }]`
  - `PATCH /api/admin/users/{id}/role` `{ role }` → change USER ⇄ ADMIN
  - `DELETE /api/admin/users/{id}` → supprime un utilisateur
  - Gardes : un admin ne peut ni changer son propre rôle ni se supprimer (`400`)
- [x] Artistes & sync (`AdminArtistController`) :
  - `GET /api/admin/artists` → tous les artistes de la base
  - `POST /api/admin/artists/{id}/sync` → synchronise un seul artiste (`syncSingleArtist`)
  - (`POST /api/admin/sync` global + `POST /api/admin/test-email` existaient déjà)
- [x] `GlobalExceptionHandler` : `IllegalArgumentException` → `400 { error }`

##### Frontend — Espace admin

- [x] Détection du rôle (`useAuth` expose `isAdmin` depuis le claim JWT) ; lien « Admin » dans la Sidebar (si admin) et route `/admin` protégée par `AdminRoute` (redirige les non-admins)
- [x] **Gestion des utilisateurs** (`AdminUserRow`) : table (email, rôle, nb de suivis, date d'inscription), promotion/rétrogradation ADMIN, suppression (confirmation) ; actions désactivées sur son propre compte
- [x] **Synchronisation** : « Sync now » global + sync par artiste depuis la liste ; `AsyncActionButton` (spinner → ✓/✗), bannière d'erreur
- [x] « Send test email » (`POST /api/admin/test-email`)
- [x] **Bootstrap** du premier admin : promotion manuelle en base (`UPDATE users SET role='ADMIN'…`) via Adminer/psql

#### 10.8 — Intégration & finitions ✅

- [x] **Toasts** : système global (`ToastProvider` + `useToast` + `Toaster`, auto-dismiss 4 s, animation `toast-in`) ; succès/erreur câblés sur follow/unfollow (Discovery, Library, détail artiste) et sur toutes les actions admin (rôle, suppression, sync, test email)
- [x] **États de chargement** : skeletons harmonisés (Dashboard, Discovery, Library, détail artiste, Admin) via `ReleaseCardSkeleton` + placeholders dédiés
- [x] **Responsive** : nav mobile (`MobileNav` — hamburger + tiroir) puisque la Sidebar est `hidden md:flex` ; config de nav partagée (`nav.ts`) entre Sidebar et menu mobile ; grilles et paddings adaptatifs (`sm:`/`md:`/`lg:`)
- [x] `Dockerfile` frontend (build Vite → Nginx) + service `frontend` dans `docker-compose.yml` *(fait après 10.1)*
- [x] Pas de CORS backend : Nginx proxifie `/api` vers `app:8080` (même origine) — stack testée bout-en-bout via `localhost:3000`

#### 10.9 — Tests frontend ✅

- [x] **Vitest 4** + React Testing Library + jsdom + jest-dom ; setup `src/test/setup.ts`, scripts `test` / `test:watch`
- [x] Tests exclus de la build de prod (`tsconfig.app.json`) — Vitest gère sa propre transpilation, l'image Docker n'embarque pas le tooling de test
- [x] **25 tests** : utilitaires (`token`, `format`, `apiErrorMessage`), hook `useDebounce`, `AuthProvider`/`useAuth` (isAdmin depuis le claim JWT), `EmptyState`, interaction `ArtistResultRow` (follow/unfollow via `userEvent`)
