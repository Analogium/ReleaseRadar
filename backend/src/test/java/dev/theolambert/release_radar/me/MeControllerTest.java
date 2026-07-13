package dev.theolambert.release_radar.me;

import com.jayway.jsonpath.JsonPath;
import dev.theolambert.release_radar.AbstractIntegrationTest;
import dev.theolambert.release_radar.email.EmailService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Capacité de rate-limiting relevée : ces tests enchaînent plusieurs appels /api/auth/**.
@AutoConfigureMockMvc
@TestPropertySource(properties = "ratelimit.auth.capacity=1000")
class MeControllerTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private EmailService emailService;

    private String registerBody(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"password123\",\"acceptTerms\":true}";
    }

    private String credentials(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    /** Inscrit un compte, l'active, se connecte et renvoie l'access token. */
    private String registerEnableAndLogin(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setEnabled(true);
        userRepository.save(user);

        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(email, "password123")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.token");
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    @Test
    void getProfileReturnsAccountInfo() throws Exception {
        String token = registerEnableAndLogin("me-profile@example.com");

        mockMvc.perform(get("/api/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me-profile@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.cguVersion").exists());
    }

    @Test
    void unauthenticatedProfileIsRejected() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exportReturnsPersonalDataAsJsonAttachment() throws Exception {
        String token = registerEnableAndLogin("me-export@example.com");

        mockMvc.perform(get("/api/me/export").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me-export@example.com"))
                .andExpect(jsonPath("$.followedArtists").isArray());
    }

    @Test
    void changePasswordRejectsWrongCurrentPasswordThenSucceeds() throws Exception {
        String email = "me-pw@example.com";
        String token = registerEnableAndLogin(email);

        // Mauvais mot de passe actuel → 400 (et non 401, pour ne pas déclencher un refresh côté front).
        mockMvc.perform(patch("/api/me/password").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrongpass1\",\"newPassword\":\"newpassword456\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/me/password").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\",\"newPassword\":\"newpassword456\"}"))
                .andExpect(status().isNoContent());

        // Le nouveau mot de passe permet de se connecter.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(email, "newpassword456")))
                .andExpect(status().isOk());
    }

    @Test
    void changeEmailDisablesAccountAndSendsVerificationToNewAddress() throws Exception {
        String oldEmail = "me-oldmail@example.com";
        String newEmail = "me-newmail@example.com";
        String token = registerEnableAndLogin(oldEmail);

        mockMvc.perform(patch("/api/me/email").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newEmail\":\"" + newEmail + "\",\"currentPassword\":\"password123\"}"))
                .andExpect(status().isOk());

        User updated = userRepository.findByEmail(newEmail).orElseThrow();
        assertThat(updated.isEnabled()).isFalse();
        assertThat(userRepository.findByEmail(oldEmail)).isEmpty();
        verify(emailService).sendVerificationEmail(eq(newEmail), anyString());
    }

    @Test
    void changeEmailRejectsAddressAlreadyInUse() throws Exception {
        registerEnableAndLogin("me-taken@example.com");
        String token = registerEnableAndLogin("me-mover@example.com");

        mockMvc.perform(patch("/api/me/email").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newEmail\":\"me-taken@example.com\",\"currentPassword\":\"password123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteAccountRejectsWrongPasswordThenRemovesUser() throws Exception {
        String email = "me-delete@example.com";
        String token = registerEnableAndLogin(email);

        mockMvc.perform(delete("/api/me").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrongpass1\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/me").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\"}"))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }
}
