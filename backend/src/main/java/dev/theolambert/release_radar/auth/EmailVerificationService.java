package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.email.EmailService;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/** Création, envoi et validation des jetons de vérification d'email. */
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final Duration TOKEN_TTL = Duration.ofHours(24);

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Génère un nouveau jeton pour l'utilisateur (en remplaçant un éventuel précédent)
     * et lui envoie le lien de confirmation. Transactionnel : si l'envoi échoue,
     * le jeton n'est pas conservé.
     */
    @Transactional
    public void sendVerification(User user) {
        tokenRepository.deleteByUser(user);
        String token = UUID.randomUUID().toString();
        tokenRepository.save(new EmailVerificationToken(token, user, LocalDateTime.now().plus(TOKEN_TTL)));

        String link = baseUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), link);
    }

    /** Active le compte associé au jeton, puis consomme le jeton. */
    @Transactional
    public void verify(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification link"));

        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Invalid or expired verification link");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
    }

    /**
     * Renvoie un lien de vérification. Volontairement silencieux (pas d'exception,
     * réponse identique côté appelant) pour ne pas révéler si l'email existe ou non.
     */
    @Transactional
    public void resend(String email) {
        userRepository.findByEmail(email)
                .filter(user -> !user.isEnabled())
                .ifPresent(this::sendVerification);
    }
}
