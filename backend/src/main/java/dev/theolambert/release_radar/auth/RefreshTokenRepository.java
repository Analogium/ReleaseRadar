package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** Révoque toutes les sessions d'un utilisateur (changement de mot de passe / d'email). */
    void deleteByUser(User user);
}
