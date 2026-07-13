package dev.theolambert.release_radar.me.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Changement de mot de passe (exige le mot de passe actuel). */
public record UpdatePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters") String newPassword
) {}
