package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.auth.dto.AuthResponse;
import dev.theolambert.release_radar.auth.dto.LoginRequest;
import dev.theolambert.release_radar.auth.dto.MessageResponse;
import dev.theolambert.release_radar.auth.dto.RegisterRequest;
import dev.theolambert.release_radar.security.JwtService;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailVerificationService;

    /**
     * Crée un compte <em>désactivé</em> et envoie un email de vérification.
     * Aucun JWT n'est délivré ici : l'utilisateur doit confirmer son email pour se connecter.
     * Transactionnel : si l'envoi de l'email échoue, la création du compte est annulée.
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(false);
        userRepository.save(user);

        emailVerificationService.sendVerification(user);
        return new MessageResponse("Account created. Check your email to confirm your address.");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user));
    }
}
