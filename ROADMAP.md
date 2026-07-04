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
- `GET /api/releases` *(auth)* → `[{ id, mbid, title, type, releaseDate, artistName }]`
- `POST /api/admin/sync` *(ADMIN)* → `200` — déclenchement manuel de la sync
- `POST /api/admin/test-email` *(auth)* → `200`

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

#### 10.4 — Dashboard (Home / New releases)

- [ ] Section « Latest Releases » depuis `GET /api/releases` (badge NEW si < 30 jours)
- [ ] Section « Artists You Follow » depuis `GET /api/artists`
- [ ] États vides (aucun artiste suivi → CTA « Follow Artists »)

#### 10.5 — Discovery (recherche MusicBrainz)

- [ ] Barre de recherche → `GET /api/artists/search?q=` (debounce)
- [ ] Liste de résultats avec bouton **Follow / Following** (`POST` / `DELETE /api/artists`)
- [ ] Synchro de l'état « following » avec la liste des artistes suivis

#### 10.6 — Library / détail artiste

- [ ] **Library** : artistes suivis + leurs sorties, unfollow
- [ ] **Artist detail** : header artiste + discographie (sorties de l'artiste), bouton Follow/Following

#### 10.7 — Admin (rôle ADMIN)

- [ ] Bouton « Sync now » (`POST /api/admin/sync`) visible uniquement si rôle ADMIN
- [ ] (option) « Send test email » (`POST /api/admin/test-email`)

#### 10.8 — Intégration & finitions

- [ ] Gestion des erreurs API (toasts) + états de chargement (skeletons)
- [ ] Responsive desktop / mobile
- [x] `Dockerfile` frontend (build Vite → Nginx) + service `frontend` dans `docker-compose.yml` *(fait après 10.1)*
- [x] Pas de CORS backend : Nginx proxifie `/api` vers `app:8080` (même origine) — stack testée bout-en-bout via `localhost:3000`
