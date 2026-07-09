package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.auth.dto.AuthResponse;
import dev.theolambert.release_radar.auth.dto.LoginRequest;
import dev.theolambert.release_radar.auth.dto.LogoutRequest;
import dev.theolambert.release_radar.auth.dto.MessageResponse;
import dev.theolambert.release_radar.auth.dto.RefreshRequest;
import dev.theolambert.release_radar.auth.dto.RegisterRequest;
import dev.theolambert.release_radar.auth.dto.ResendVerificationRequest;
import dev.theolambert.release_radar.auth.dto.VerifyEmailRequest;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());
        return ResponseEntity.ok(new MessageResponse("Email verified. You can now log in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resend(request.email());
        // Réponse uniforme, qu'un compte non vérifié existe ou non (anti-énumération).
        return ResponseEntity.ok(new MessageResponse(
                "If an unverified account exists for this address, a new confirmation link has been sent."));
    }
}
