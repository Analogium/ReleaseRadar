package dev.theolambert.release_radar.admin.dto;

import dev.theolambert.release_radar.user.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {}
