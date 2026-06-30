package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.email.EmailService;
import dev.theolambert.release_radar.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SyncController {

    private final MusicBrainzSyncService syncService;
    private final EmailService emailService;

    @PostMapping("/sync")
    public ResponseEntity<String> triggerSync() {
        syncService.syncReleases();
        return ResponseEntity.ok("Sync complete");
    }

    @PostMapping("/test-email")
    public ResponseEntity<String> testEmail(@AuthenticationPrincipal User user) {
        emailService.sendTestEmail(user.getEmail());
        return ResponseEntity.ok("Test email sent to " + user.getEmail());
    }
}
