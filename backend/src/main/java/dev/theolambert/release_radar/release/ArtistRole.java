package dev.theolambert.release_radar.release;

/** Rôle de l'artiste suivi dans une sortie, déduit de l'artist-credit MusicBrainz. */
public enum ArtistRole {
    /** Sortie solo, ou sortie de l'artiste avec un·e invité·e (« Artiste feat. X »). */
    PRIMARY,
    /** Co-crédité à parts égales (« Artiste & X », « Artiste x X »). */
    COLLABORATION,
    /** L'artiste est invité sur la sortie d'un·e autre (« X feat. Artiste »). */
    FEATURING
}
