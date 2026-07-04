package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.auth.dto.AuthResponse;
import dev.theolambert.release_radar.auth.dto.LoginRequest;
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

    @InjectMocks
    private AuthService authService;

    @Test
    void registerHashesPasswordSavesUserAndReturnsToken() {
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(new RegisterRequest("a@b.com", "secret123"));

        assertThat(response.token()).isEqualTo("jwt-token");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("a@b.com");
        assertThat(saved.getPassword()).isEqualTo("hashed");
        // New accounts must never be created with elevated privileges.
        assertThat(saved.getRole()).isEqualTo(Role.USER);
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
