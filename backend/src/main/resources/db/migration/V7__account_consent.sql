-- Consentement CGU/confidentialité enregistré à l'inscription (RGPD : preuve du consentement).
-- Nullable : les comptes créés avant cette fonctionnalité n'ont pas de trace explicite.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS cgu_accepted_at TIMESTAMP(6);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS cgu_version VARCHAR(50);
