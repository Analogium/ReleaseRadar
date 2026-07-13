package dev.theolambert.release_radar.me.dto;

import jakarta.validation.constraints.NotBlank;

/** Suppression de compte (droit à l'effacement) : confirmée par le mot de passe actuel. */
public record DeleteAccountRequest(
        @NotBlank String currentPassword
) {}
