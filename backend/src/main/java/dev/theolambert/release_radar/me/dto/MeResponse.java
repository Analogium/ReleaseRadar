package dev.theolambert.release_radar.me.dto;

import dev.theolambert.release_radar.user.Role;
import dev.theolambert.release_radar.user.User;

import java.time.LocalDateTime;

/** Profil du compte connecté — GET /api/me. */
public record MeResponse(
        String email,
        Role role,
        boolean emailVerified,
        LocalDateTime createdAt,
        String cguVersion,
        LocalDateTime cguAcceptedAt
) {
    public static MeResponse from(User user) {
        return new MeResponse(
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getCguVersion(),
                user.getCguAcceptedAt()
        );
    }
}
