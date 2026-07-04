CREATE TABLE IF NOT EXISTS users (
    id          UUID         PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS artists (
    id              UUID         PRIMARY KEY,
    mbid            VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    last_synced_at  TIMESTAMP(6),
    created_at      TIMESTAMP(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS releases (
    id           UUID         PRIMARY KEY,
    mbid         VARCHAR(255) NOT NULL UNIQUE,
    title        VARCHAR(255) NOT NULL,
    type         VARCHAR(255) NOT NULL,
    release_date DATE,
    artist_id    UUID         NOT NULL REFERENCES artists(id),
    created_at   TIMESTAMP(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
    user_id   UUID NOT NULL REFERENCES users(id),
    artist_id UUID NOT NULL REFERENCES artists(id),
    PRIMARY KEY (user_id, artist_id)
);
