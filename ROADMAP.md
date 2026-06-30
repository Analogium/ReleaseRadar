# Release Radar — Roadmap

## Stack
- **Backend** : Java 21 + Spring Boot 4.0 (Maven) — `dev.theolambert/release-radar`
- **Frontend** : React + TypeScript (à venir)
- **Base de données** : PostgreSQL 17 (Docker)
- **Auth** : Spring Security 7 + JWT (jjwt 0.12)

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
- [ ] Dépendance `spring-boot-starter-mail` + config SMTP (`application.properties`)
- [ ] `EmailService` — envoi d'un email par JavaMail
- [ ] Template d'email (nouvelle sortie détectée)
- [ ] Détection des vraies nouvelles sorties avant notification :
  - Ajouter `lastSyncedAt` (`LocalDateTime`) sur l'entité `Artist` — mis à jour après chaque sync réussi
  - Ne notifier que les releases dont la `releaseDate` est postérieure au `lastSyncedAt` de l'artiste **(Option B)**
  - Garde-fou : ignorer les releases sans date ou avec `releaseDate` > 30 jours dans le futur **(Option A)**
- [ ] Brancher `emailService.notifySubscribers(artist, newReleases)` dans `MusicBrainzSyncService`

### Étape 9 — Améliorations backend
- [ ] Validation des requêtes (`spring-boot-starter-validation`, `@Valid`, `@NotBlank`…)
- [ ] Gestion globale des erreurs (`@ControllerAdvice`)
- [ ] Migrer vers Flyway + `ddl-auto=validate` (schéma versionné)
- [x] Endpoint `GET /api/artists/search?q=` — recherche via MusicBrainz *(fait en étape 7)*
- [ ] Sécuriser le `jwt.secret` via variable d'environnement (ne pas laisser en clair)

### Étape 10 — Frontend React + TypeScript
- [ ] Setup Vite + React + TypeScript
- [ ] Pages : Login, Register, Dashboard (artistes suivis + releases récentes)
- [ ] Recherche et ajout d'artiste via MusicBrainz
- [ ] Gestion du token JWT (stockage, refresh, logout)
- [ ] Intégration dans `docker-compose.yml` (service `frontend`)
