package dev.theolambert.release_radar.admin.dto;

import dev.theolambert.release_radar.user.Role;
import dev.theolambert.release_radar.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        Role role,
        int followedCount,
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFollowedArtists().size(),
                user.getCreatedAt()
        );
    }
}
