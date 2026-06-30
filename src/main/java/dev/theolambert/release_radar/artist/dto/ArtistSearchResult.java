package dev.theolambert.release_radar.artist.dto;

import dev.theolambert.release_radar.musicbrainz.dto.MbArtist;

public record ArtistSearchResult(String mbid, String name, String disambiguation) {
    public static ArtistSearchResult from(MbArtist a) {
        return new ArtistSearchResult(a.id(), a.name(), a.disambiguation());
    }
}
