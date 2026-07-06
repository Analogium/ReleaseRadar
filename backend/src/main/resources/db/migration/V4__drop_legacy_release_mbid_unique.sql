-- Une ancienne contrainte unique mono-colonne sur releases(mbid) — générée par
-- Hibernate à l'époque `ddl-auto=update` (nom aléatoire type « uk... ») — pouvait
-- subsister et défaire l'unicité par artiste introduite en V3. On supprime toute
-- contrainte unique portant uniquement sur `mbid` (la composite (artist_id, mbid) est conservée).
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'releases'
          AND nsp.nspname = 'public'
          AND con.contype = 'u'
          AND con.conkey = ARRAY[
              (SELECT attnum FROM pg_attribute
               WHERE attrelid = rel.oid AND attname = 'mbid')
          ]
    LOOP
        EXECUTE 'ALTER TABLE releases DROP CONSTRAINT ' || quote_ident(constraint_name);
    END LOOP;
END $$;
