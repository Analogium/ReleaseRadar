package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Cycle de vie des refresh tokens : création à la connexion, rotation à chaque
 * renouvellement (l'ancien est supprimé → un token ne sert qu'une fois), révocation
 * à la déconnexion.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.refresh-token.expiration-days:7}")
    private long expirationDays;

    /** Renvoie le refresh token en clair (le seul moment où il existe hors du client). */
    @Transactional
    public String create(User user) {
        String rawToken = generateRawToken();
        refreshTokenRepository.save(
                new RefreshToken(hash(rawToken), user, LocalDateTime.now().plusDays(expirationDays)));
        return rawToken;
    }

    /**
     * Valide un refresh token, le consomme (rotation) et en émet un nouveau.
     *
     * @throws InvalidRefreshTokenException si le token est inconnu ou expiré
     */
    @Transactional
    public RefreshResult rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(InvalidRefreshTokenException::new);

        User user = existing.getUser();
        refreshTokenRepository.delete(existing);

        if (existing.isExpired()) {
            throw new InvalidRefreshTokenException();
        }

        return new RefreshResult(user, create(user));
    }

    /** Révoque un refresh token (déconnexion). Silencieux si le token n'existe pas. */
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(refreshTokenRepository::delete);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return BASE64_URL.encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    /** Résultat d'une rotation : l'utilisateur (pour émettre le JWT) et le nouveau refresh token. */
    public record RefreshResult(User user, String refreshToken) {}
}
