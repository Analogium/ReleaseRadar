package dev.theolambert.release_radar.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters") String password,
        // Consentement CGU/confidentialité obligatoire (RGPD) : doit valoir true.
        @NotNull(message = "You must accept the terms")
        @AssertTrue(message = "You must accept the terms") Boolean acceptTerms
) {}
