package dev.theolambert.release_radar.security;

import dev.theolambert.release_radar.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Vérifie que le rate-limiting bloque les appels d'auth répétés depuis une même IP.
 * On abaisse la capacité à 3 via une propriété pour ne pas envoyer des dizaines de requêtes.
 */
@AutoConfigureMockMvc
@TestPropertySource(properties = "ratelimit.auth.capacity=3")
class AuthRateLimitFilterTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // Identifiants bidon : l'auth échouera, mais le filtre compte AVANT le contrôleur.
    private static final String BODY = "{\"email\":\"nobody@example.com\",\"password\":\"whatever123\"}";

    @Test
    void blocksAfterTooManyAuthAttempts() throws Exception {
        // capacity=3 → les 3 premières tentatives passent le filtre (elles échouent à
        // l'authentification, mais ne sont pas throttlées : le statut n'est pas 429).
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(BODY))
                    .andExpect(result ->
                            assertThat(result.getResponse().getStatus()).isNotEqualTo(429));
        }

        // La 4ᵉ est refusée par le rate-limiter, avec un en-tête Retry-After.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(BODY))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }
}
