package dev.theolambert.release_radar.artist.dto;

import dev.theolambert.release_radar.artist.Artist;

import java.util.UUID;

public record ArtistResponse(UUID id, String mbid, String name) {
    public static ArtistResponse from(Artist artist) {
        return new ArtistResponse(artist.getId(), artist.getMbid(), artist.getName());
    }
}
