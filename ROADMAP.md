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
- `GET /api/releases` *(auth)* → `[{ id, mbid, title, type, releaseDate, artistId, artistName, role }]` (`role` ∈ `PRIMARY` | `COLLABORATION` | `FEATURING`)
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

---

### Étape 11 — Collaborations & featurings ✅

Objectif : au-delà des sorties « solo », récupérer et **catégoriser** les
implications de l'artiste : collaborations (co-crédité) et featurings (« feat. »).
Choix retenus : classification **au niveau de la sortie** (artist-credit, sans
appels supplémentaires) et présentation en **onglets** (Solo / Collaborations / Featurings).

#### 11.1 — Backend : modèle & classification ✅

- [x] Enum `ArtistRole` : `PRIMARY` (solo / sa sortie), `COLLABORATION` (co-crédité « & »), `FEATURING` (crédité après « feat. »)
- [x] `Release.artistRole` + migration V3 : colonne `artist_role` ; unicité `mbid` → **`(artist_id, mbid)`** (une ligne par artiste/sortie → les sorties partagées apparaissent chez chaque artiste avec son rôle)
- [x] `MusicBrainzClient` : `inc=release-groups+artist-credits` ; DTO `MbArtistCredit { joinphrase, artist }`
- [x] `MusicBrainzSyncService` : classification depuis l'artist-credit (position + join phrase) ; dédup par `(artist, mbid)` au lieu de `mbid` global ; **4 tests de classification** ajoutés (10 tests au total)
- [x] `ReleaseResponse.role` exposé par `GET /api/releases`

#### 11.2 — Frontend : onglets par rôle ✅

- [x] Type `Release.role` + helpers `roles.ts` (`filterReleasesByRole`, `dedupeByMbid`) + composant `RoleFilterTabs` (Tout / Solo / Collaborations / Featurings, compteurs, masque les rôles vides)
- [x] **Détail artiste** : onglets au-dessus de la discographie
- [x] **Library** : onglets globaux filtrant les sorties de chaque artiste (masque les artistes sans sortie dans la catégorie active)
- [x] **Dashboard** : dédup par `mbid` (une collab entre 2 artistes suivis n'apparaît qu'une fois) + badge de rôle (`Collab` / `Feat.`) sur les cartes non-solo
- [x] Tests helpers `roles` (28 tests frontend au total)

> **Limite connue** : les featurings où l'artiste n'apparaît **que sur une piste**
> (pas dans le crédit de la sortie) ne sont pas capturés — cela nécessiterait
> d'interroger les *recordings* (beaucoup plus d'appels MusicBrainz).

---

### Étape 12 — Mise en production (AWS) ✅

En ligne sur **[releaseradarapp.com](https://releaseradarapp.com)** (VM EC2 t3.micro, Amazon Linux 2023).

#### 12.1 — Durcissement pré-prod ✅

- [x] Profil Spring `prod` (`application-prod.properties`) : logs `WARN`, pas de `show-sql`, pas de fuite d'erreur (`server.error.include-*=never`), `forward-headers-strategy=framework` (derrière proxy TLS)
- [x] Logs sécurité `DEBUG` → `WARN` par défaut (secure by default, même hors profil prod)
- [x] En-têtes de sécurité nginx : `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `server_tokens off`
- [x] Secrets 100 % par variables d'environnement (échec au démarrage si absent, `:?`) — rien en dur
- [x] Cap mot de passe `@Size(max=72)` (troncature BCrypt)
- [x] Surface réduite : `docker-compose.prod.yml` **sans Adminer**, DB + API + frontend **non exposés** (réseau interne), seul Caddy écoute (80/443)
- [x] Contraintes RAM (1 Go) : `mem_limit` app + heap JVM bornée (`-XX:MaxRAMPercentage=55`) + swapfile 2 Go

#### 12.2 — Infra & déploiement ✅

- [x] **Caddy** reverse proxy + **HTTPS auto Let's Encrypt** (challenge TLS-ALPN) → règle le besoin TLS sans ALB payant
- [x] `.env.prod.example` (modèle de secrets) + `scripts/ec2-setup.sh` (Docker + Compose + **buildx** + swap) + runbook **`DEPLOY-AWS.md`**
- [x] AWS : EC2 t3.micro, security group (SSH restreint / 80 / 443), Elastic IP `13.38.152.188`, utilisateur **IAM + MFA** (plus de root), **budget d'alerte** (zero-spend + 5 $)
- [x] Domaine `releaseradarapp.com` (Namecheap) → enregistrement A vers l'Elastic IP
- [ ] *(pense-bête)* committer le patch buildx de `ec2-setup.sh` ; sauvegardes DB automatisées (cron, cf. runbook §11)

---

## 🔲 À venir

### Étape 13 — Durcissement sécurité (post-lancement)

- [x] **Rate-limiting anti-brute-force** sur `/api/auth/*` — **Bucket4j** côté app : token bucket par IP (10 req/min, configurable via `ratelimit.auth.*`), buckets en mémoire évincés par Caffeine, IP réelle via `X-Forwarded-For`, réponse **429 + Retry-After**. Filtre `AuthRateLimitFilter` + `RateLimitingService`, testés (unitaire + intégration MockMvc)
- [ ] **Refresh tokens** + access token de courte durée → permet la **révocation** (aujourd'hui le JWT vit 24 h et n'est pas révocable côté serveur)
- [x] **Vérification d'email** à l'inscription — compte créé **désactivé** (`users.enabled`), login bloqué (`DisabledException` → 403) tant que le lien (token 24 h, table `email_verification_tokens`) n'est pas confirmé. Endpoints `POST /api/auth/verify-email` + `/resend-verification` (réponse uniforme anti-énumération). Front : écran « check your email », page `/verify-email`, renvoi depuis login. Testé back (intégration) + front
- [ ] *(optionnel)* atténuer l'**énumération de comptes** (réponse uniforme register/login)
- [ ] *(optionnel)* 2FA (TOTP)

### Étape 14 — Gestion du compte & conformité RGPD

Objectif : donner à l'utilisateur le contrôle de son compte et de ses données, et
mettre le service en conformité (RGPD).

#### 14.1 — Backend : endpoints « self-service »

- [ ] `PATCH /api/me` — **modifier ses infos** : changer d'email (avec re-vérification), changer de mot de passe (exige le mot de passe actuel)
- [ ] `DELETE /api/me` — **droit à l'effacement** (art. 17 RGPD) : supprime le compte + ses abonnements + données perso (cascade), avec confirmation
- [ ] `GET /api/me/export` — **droit d'accès / portabilité** (art. 15/20) : export des données perso en JSON
- [ ] Enregistrer le **consentement CGU** (date + version acceptée) à l'inscription

#### 14.2 — Frontend : page « Paramètres du compte »

- [ ] Écran regroupant : changer email / mot de passe, export de mes données, **supprimer mon compte** (double confirmation)
- [ ] Relier la case « J'accepte les CGU » (déjà présente à l'inscription) à la vraie page CGU

#### 14.3 — Pages légales & mentions

- [ ] **CGU** (Conditions Générales d'Utilisation)
- [ ] **Politique de confidentialité** (données collectées : email + artistes suivis ; finalité : notifications ; sous-traitants : Brevo pour l'email, AWS pour l'hébergement ; durée de conservation ; droits RGPD)
- [ ] **Mentions légales** (éditeur, hébergeur, contact)
- [ ] Liens vers ces pages dans le footer + à l'inscription
- [ ] Cookies : le JWT est en `localStorage` (fonctionnel, pas de tracking) → **bandeau cookies non requis** en l'état ; à réévaluer si ajout d'analytics/outils tiers

### Étape 15 — Pipeline CI/CD (GitHub Actions) — ✅ en service

Objectif : automatiser tests → build → déploiement, et **sortir la compilation de la VM**
(compiler sur la t3.micro à 1 Go est lent et fragile → on build dans le CI, la VM ne fait que *pull* les images).

Implémenté dans [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).
Config manuelle (secrets, IAM, visibilité des images) documentée dans [`DEPLOY-AWS.md`](DEPLOY-AWS.md) §13.

#### 15.1 — Intégration continue (CI)

- [x] Workflow **sur PR et push** : backend `./mvnw -B verify` (JUnit + Testcontainers), frontend `npm run check` + `npm test`
- [x] Cache Maven (`~/.m2`) et npm pour accélérer (via `setup-java`/`setup-node`)
- [ ] *(optionnel)* scan de vulnérabilités : `Trivy` sur les images, **Dependabot** pour les dépendances

#### 15.2 — Build & publication des images

- [x] Build des images Docker (backend + frontend) dans le CI, taggées par **SHA de commit** (+ `latest`)
- [x] Push vers **GHCR** (`ghcr.io`, gratuit pour un repo public) via `GITHUB_TOKEN` — plus besoin de builder sur la VM
- [x] `docker-compose.prod.yml` : passé de `build:` à `image: ghcr.io/analogium/releaseradar-*:${IMAGE_TAG:-latest}`
- [x] *(manuel, une fois)* les deux paquets GHCR rendus **publics** (sinon la VM ne peut pas les tirer) — cf. runbook §13.a

#### 15.3 — Déploiement continu (CD)

- [x] Job **sur push `master`** : SSH à l'EC2 → `docker compose pull` + `up -d` (zéro rebuild sur la VM), tag pinné = SHA
- [x] **Accès CD sécurisé** : le job ouvre le port 22 pour l'IP du runner via un utilisateur IAM restreint, puis **referme la règle** (`if: always()`) — le SSH reste fermé au public
- [x] *(manuel, une fois)* **secrets GitHub** (`AWS_*`, `EC2_*`) + utilisateur IAM `github-actions-deployer` créés — cf. runbook §13.b/c
- [ ] *(optionnel)* **health check** post-déploiement (`curl -f https://releaseradarapp.com`) + rollback sur l'image précédente si échec
- [ ] *(optionnel)* environnement de **staging** séparé avant la prod

### Étape 16 — SEO & découvrabilité

Contexte : l'app est un **SPA** (rendu côté client) → HTML quasi vide au premier chargement,
donc SEO faible par défaut. La majorité des pages est derrière login (non indexable) : le SEO
cible surtout les **pages publiques** (accueil/landing, login/register, pages légales).

#### 16.1 — Bases techniques

- [ ] Balises **meta par page** : `title`, `meta description` uniques (via `react-helmet-async` ou équivalent)
- [ ] **Open Graph** + **Twitter Cards** (titre, description, image de partage) pour un rendu propre sur réseaux sociaux/messageries
- [ ] `lang="fr"` sur `<html>`, URLs **canoniques**, favicon déjà présent
- [ ] **`robots.txt`** (autoriser le public, interdire les routes privées) + **`sitemap.xml`** des pages publiques
- [ ] **JSON-LD** (`Organization` / `WebApplication`) pour les rich results

#### 16.2 — Contenu & accessibilité (bon pour SEO *et* a11y)

- [ ] HTML sémantique (un seul `<h1>` par page, hiérarchie de titres cohérente)
- [ ] `alt` descriptifs sur les pochettes (Cover Art) et images
- [ ] Une vraie **page d'accueil / landing publique** (pitch produit) = principale surface indexable

#### 16.3 — Performance (Core Web Vitals)

- [ ] Audit **Lighthouse** (perf, SEO, a11y, best practices) et corrections
- [ ] Lazy-loading des images, code-splitting des routes, compression (déjà `zstd/gzip` via Caddy)
- [ ] *(si SEO critique)* envisager le **prerendering** des pages publiques (SSG) — une migration SSR complète (Next/Remix) serait lourde et peu justifiée vu que le cœur applicatif est privé
