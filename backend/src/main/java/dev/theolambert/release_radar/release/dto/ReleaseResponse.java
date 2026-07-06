package dev.theolambert.release_radar.release.dto;

import dev.theolambert.release_radar.release.ArtistRole;
import dev.theolambert.release_radar.release.Release;
import dev.theolambert.release_radar.release.ReleaseType;

import java.time.LocalDate;
import java.util.UUID;

public record ReleaseResponse(UUID id, String mbid, String title, ReleaseType type, LocalDate releaseDate, UUID artistId, String artistName, ArtistRole role) {
    public static ReleaseResponse from(Release release) {
        return new ReleaseResponse(
                release.getId(),
                release.getMbid(),
                release.getTitle(),
                release.getType(),
                release.getReleaseDate(),
                release.getArtist().getId(),
                release.getArtist().getName(),
                release.getArtistRole()
        );
    }
}
