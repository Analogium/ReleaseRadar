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

## 🔲 À faire

### Étape 7 — Intégration MusicBrainz + Scheduler
- [ ] Client HTTP MusicBrainz (`RestClient` ou `WebClient`)
  - Recherche d'artiste par nom → retourne `mbid` + metadata
  - Récupération des releases d'un artiste par `mbid`
- [ ] `@Scheduled` polling périodique (ex. toutes les 24h)
  - Pour chaque artiste suivi (au moins 1 abonné), interroger MusicBrainz
  - Persister les nouvelles releases détectées
  - Déclencher les notifications email pour les abonnés concernés
- [ ] Respecter le rate limiting MusicBrainz (1 req/s, User-Agent obligatoire)

### Étape 8 — Notifications email
- [ ] Dépendance `spring-boot-starter-mail` + config SMTP (`application.properties`)
- [ ] `EmailService` — envoi d'un email par JavaMail
- [ ] Template d'email (nouvelle sortie détectée)
- [ ] Intégration dans le scheduler : email envoyé lors d'une nouvelle release

### Étape 9 — Améliorations backend
- [ ] Validation des requêtes (`spring-boot-starter-validation`, `@Valid`, `@NotBlank`…)
- [ ] Gestion globale des erreurs (`@ControllerAdvice`)
- [ ] Migrer vers Flyway + `ddl-auto=validate` (schéma versionné)
- [ ] Endpoint `GET /api/artists/search?q=` — recherche via MusicBrainz
- [ ] Sécuriser le `jwt.secret` via variable d'environnement (ne pas laisser en clair)

### Étape 10 — Frontend React + TypeScript
- [ ] Setup Vite + React + TypeScript
- [ ] Pages : Login, Register, Dashboard (artistes suivis + releases récentes)
- [ ] Recherche et ajout d'artiste via MusicBrainz
- [ ] Gestion du token JWT (stockage, refresh, logout)
- [ ] Intégration dans `docker-compose.yml` (service `frontend`)
