package dev.theolambert.release_radar.release;

import dev.theolambert.release_radar.release.dto.ReleaseResponse;
import dev.theolambert.release_radar.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;

    @GetMapping
    public List<ReleaseResponse> getReleasesForFollowedArtists(@AuthenticationPrincipal User user) {
        return releaseService.getReleasesForUser(user.getId()).stream()
                .map(ReleaseResponse::from)
                .toList();
    }
}
