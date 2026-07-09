package dev.theolambert.release_radar.auth.dto;

/** Jetons renvoyés à la connexion / au renouvellement : access token JWT + refresh token opaque. */
public record AuthResponse(String token, String refreshToken) {}
