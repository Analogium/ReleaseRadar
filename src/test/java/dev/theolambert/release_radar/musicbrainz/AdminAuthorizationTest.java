package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AdminAuthorizationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MusicBrainzSyncService syncService;

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(post("/api/admin/sync"))
                .andExpect(status().is4xxClientError());
        verify(syncService, never()).syncReleases();
    }

    @Test
    @WithMockUser(roles = "USER")
    void regularUserIsForbidden() throws Exception {
        mockMvc.perform(post("/api/admin/sync"))
                .andExpect(status().isForbidden());
        verify(syncService, never()).syncReleases();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminIsAllowed() throws Exception {
        mockMvc.perform(post("/api/admin/sync"))
                .andExpect(status().isOk());
        verify(syncService).syncReleases();
    }
}
