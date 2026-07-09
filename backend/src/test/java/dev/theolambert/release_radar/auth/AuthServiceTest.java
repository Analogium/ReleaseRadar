package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.auth.dto.AuthResponse;
import dev.theolambert.release_radar.auth.dto.LoginRequest;
import dev.theolambert.release_radar.auth.dto.MessageResponse;
import dev.theolambert.release_radar.auth.dto.RegisterRequest;
import dev.theolambert.release_radar.security.JwtService;
import dev.theolambert.release_radar.user.Role;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerHashesPasswordSavesDisabledUserAndSendsVerification() {
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");

        MessageResponse response = authService.register(new RegisterRequest("a@b.com", "secret123"));

        assertThat(response.message()).isNotBlank();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("a@b.com");
        assertThat(saved.getPassword()).isEqualTo("hashed");
        // New accounts must never be created with elevated privileges.
        assertThat(saved.getRole()).isEqualTo(Role.USER);
        // ...and must stay disabled until the email is verified.
        assertThat(saved.isEnabled()).isFalse();
        verify(emailVerificationService).sendVerification(saved);
    }

    @Test
    void loginAuthenticatesThenReturnsToken() {
        User user = new User();
        user.setEmail("a@b.com");
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("a@b.com", "pw"));

        assertThat(response.token()).isEqualTo("jwt-token");
        verify(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
