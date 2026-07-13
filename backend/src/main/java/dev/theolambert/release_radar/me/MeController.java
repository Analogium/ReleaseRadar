package dev.theolambert.release_radar.me;

import dev.theolambert.release_radar.auth.dto.MessageResponse;
import dev.theolambert.release_radar.me.dto.AccountExport;
import dev.theolambert.release_radar.me.dto.DeleteAccountRequest;
import dev.theolambert.release_radar.me.dto.MeResponse;
import dev.theolambert.release_radar.me.dto.UpdateEmailRequest;
import dev.theolambert.release_radar.me.dto.UpdatePasswordRequest;
import dev.theolambert.release_radar.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Gestion du compte par l'utilisateur lui-même (RGPD). Tout est scellé sur le principal connecté. */
@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final MeService meService;

    @GetMapping
    public MeResponse getProfile(@AuthenticationPrincipal User user) {
        return meService.getProfile(user.getId());
    }

    /** Export des données personnelles en JSON (droit d'accès / portabilité). */
    @GetMapping("/export")
    public ResponseEntity<AccountExport> export(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"release-radar-export.json\"")
                .body(meService.export(user.getId()));
    }

    @PatchMapping("/email")
    public ResponseEntity<MessageResponse> changeEmail(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody UpdateEmailRequest request) {
        meService.changeEmail(user.getId(), request);
        return ResponseEntity.ok(new MessageResponse(
                "Email updated. Check your new address to confirm it before logging in again."));
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal User user,
                                               @Valid @RequestBody UpdatePasswordRequest request) {
        meService.changePassword(user.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody DeleteAccountRequest request) {
        meService.deleteAccount(user.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
