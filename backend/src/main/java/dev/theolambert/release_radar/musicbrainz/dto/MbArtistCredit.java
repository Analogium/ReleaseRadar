package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Une entrée de l'artist-credit d'une sortie MusicBrainz.
 * `joinphrase` suit l'entrée et la relie à la suivante (« & », « feat. », …).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MbArtistCredit(
        String joinphrase,
        MbArtist artist
) {}
