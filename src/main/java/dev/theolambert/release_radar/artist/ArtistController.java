package dev.theolambert.release_radar.artist;

import dev.theolambert.release_radar.artist.dto.ArtistRequest;
import dev.theolambert.release_radar.artist.dto.ArtistResponse;
import dev.theolambert.release_radar.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

    @GetMapping
    public List<ArtistResponse> getFollowedArtists(@AuthenticationPrincipal User user) {
        return artistService.getFollowedArtists(user.getId()).stream()
                .map(ArtistResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ArtistResponse> followArtist(@AuthenticationPrincipal User user,
                                                        @RequestBody ArtistRequest request) {
        Artist artist = artistService.followArtist(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ArtistResponse.from(artist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unfollowArtist(@AuthenticationPrincipal User user,
                                                @PathVariable UUID id) {
        artistService.unfollowArtist(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
