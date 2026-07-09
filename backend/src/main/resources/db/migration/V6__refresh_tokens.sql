-- Refresh tokens (opaques, stockés hachés) : permettent de renouveler l'access
-- token JWT court et d'être révoqués côté serveur (logout, compromission).
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         UUID         PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
