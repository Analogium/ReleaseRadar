package dev.theolambert.release_radar.me.dto;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.user.Role;
import dev.theolambert.release_radar.user.User;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Export des données personnelles (RGPD art. 15/20 — droit d'accès et portabilité).
 * Contient toutes les données personnelles détenues sur l'utilisateur.
 */
public record AccountExport(
        String email,
        Role role,
        LocalDateTime createdAt,
        String cguVersion,
        LocalDateTime cguAcceptedAt,
        List<FollowedArtist> followedArtists
) {
    public record FollowedArtist(String mbid, String name) {}

    public static AccountExport of(User user, List<Artist> followedArtists) {
        List<FollowedArtist> artists = followedArtists.stream()
                .map(a -> new FollowedArtist(a.getMbid(), a.getName()))
                .toList();
        return new AccountExport(
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getCguVersion(),
                user.getCguAcceptedAt(),
                artists
        );
    }
}
