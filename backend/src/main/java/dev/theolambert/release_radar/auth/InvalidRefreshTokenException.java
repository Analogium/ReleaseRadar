package dev.theolambert.release_radar.auth;

/** Levée quand un refresh token est inconnu, expiré ou déjà consommé (rotation). */
public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Invalid or expired refresh token");
    }
}
