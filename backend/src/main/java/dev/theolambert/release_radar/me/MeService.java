package dev.theolambert.release_radar.me;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.auth.EmailVerificationService;
import dev.theolambert.release_radar.auth.RefreshTokenRepository;
import dev.theolambert.release_radar.me.dto.AccountExport;
import dev.theolambert.release_radar.me.dto.DeleteAccountRequest;
import dev.theolambert.release_radar.me.dto.MeResponse;
import dev.theolambert.release_radar.me.dto.UpdateEmailRequest;
import dev.theolambert.release_radar.me.dto.UpdatePasswordRequest;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Fonctionnalités « self-service » du compte (RGPD) : consultation, modification
 * d'email/mot de passe, export des données personnelles et droit à l'effacement.
 */
@Service
@RequiredArgsConstructor
public class MeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public MeResponse getProfile(UUID userId) {
        return MeResponse.from(load(userId));
    }

    @Transactional(readOnly = true)
    public AccountExport export(UUID userId) {
        User user = load(userId);
        List<Artist> followed = userRepository.findFollowedArtistsByUserId(userId);
        return AccountExport.of(user, followed);
    }

    /**
     * Change l'adresse email : désactive le compte, révoque les sessions et envoie
     * un nouveau lien de vérification à la nouvelle adresse.
     */
    @Transactional
    public void changeEmail(UUID userId, UpdateEmailRequest request) {
        User user = load(userId);
        verifyPassword(user, request.currentPassword());

        String newEmail = request.newEmail().trim();
        if (newEmail.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("This is already your email address.");
        }
        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new IllegalArgumentException("This email address is not available.");
        }

        user.setEmail(newEmail);
        user.setEnabled(false);
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);
        emailVerificationService.sendVerification(user);
    }

    @Transactional
    public void changePassword(UUID userId, UpdatePasswordRequest request) {
        User user = load(userId);
        verifyPassword(user, request.currentPassword());

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("The new password must be different from the current one.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Révoque les autres sessions : un changement de mot de passe les invalide.
        refreshTokenRepository.deleteByUser(user);
    }

    /** Droit à l'effacement : supprime le compte et, en cascade, ses données liées. */
    @Transactional
    public void deleteAccount(UUID userId, DeleteAccountRequest request) {
        User user = load(userId);
        verifyPassword(user, request.currentPassword());
        userRepository.delete(user);
    }

    private User load(UUID userId) {
        return userRepository.findById(userId).orElseThrow();
    }

    /**
     * Un mot de passe erroné renvoie 400 (et non 401) : ces endpoints sont déjà
     * authentifiés, un 401 déclencherait à tort le rafraîchissement de session côté front.
     */
    private void verifyPassword(User user, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
    }
}
