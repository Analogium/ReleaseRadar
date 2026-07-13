package dev.theolambert.release_radar.auth;

import dev.theolambert.release_radar.AbstractIntegrationTest;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Capacité de rate-limiting relevée : ce test enchaîne plusieurs appels /api/auth/** depuis la même IP.
@AutoConfigureMockMvc
@TestPropertySource(properties = "ratelimit.auth.capacity=1000")
class EmailVerificationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    // L'envoi réel d'email est remplacé par un mock (pas de SMTP en test).
    @MockitoBean
    private dev.theolambert.release_radar.email.EmailService emailService;

    private String body(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"password123\"}";
    }

    private String registerBody(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"password123\",\"acceptTerms\":true}";
    }

    private void register(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated());
    }

    private String tokenFor(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return tokenRepository.findByUser(user).orElseThrow().getToken();
    }

    @Test
    void registerCreatesDisabledUserWithoutTokenAndSendsEmail() throws Exception {
        String email = "new-user@example.com";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.token").doesNotExist());

        assertThat(userRepository.findByEmail(email).orElseThrow().isEnabled()).isFalse();
        verify(emailService).sendVerificationEmail(eq(email), anyString());
    }

    @Test
    void loginBeforeVerificationIsForbidden() throws Exception {
        String email = "unverified@example.com";
        register(email);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(email)))
                .andExpect(status().isForbidden());
    }

    @Test
    void verifyEnablesAccountThenLoginSucceeds() throws Exception {
        String email = "verify-me@example.com";
        register(email);

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + tokenFor(email) + "\"}"))
                .andExpect(status().isOk());

        assertThat(userRepository.findByEmail(email).orElseThrow().isEnabled()).isTrue();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void invalidTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"does-not-exist\"}"))
                .andExpect(status().isBadRequest());
    }
}
