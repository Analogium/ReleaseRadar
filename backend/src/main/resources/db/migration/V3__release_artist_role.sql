-- Rôle de l'artiste dans la sortie (solo / collaboration / featuring)
ALTER TABLE releases
    ADD COLUMN IF NOT EXISTS artist_role VARCHAR(50) NOT NULL DEFAULT 'PRIMARY';

-- On passe d'un mbid unique global à un mbid unique par artiste : une même sortie
-- partagée (« A feat. B ») peut ainsi exister pour chaque artiste suivi, avec son rôle.
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_mbid_key;
ALTER TABLE releases ADD CONSTRAINT releases_artist_mbid_key UNIQUE (artist_id, mbid);
