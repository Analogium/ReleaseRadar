package dev.theolambert.release_radar.me.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Changement d'adresse email (exige le mot de passe actuel, déclenche une re-vérification). */
public record UpdateEmailRequest(
        @Email @NotBlank String newEmail,
        @NotBlank String currentPassword
) {}
