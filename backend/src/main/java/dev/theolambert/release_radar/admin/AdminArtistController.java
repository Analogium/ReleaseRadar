package dev.theolambert.release_radar.admin;

import dev.theolambert.release_radar.artist.ArtistRepository;
import dev.theolambert.release_radar.artist.dto.ArtistResponse;
import dev.theolambert.release_radar.musicbrainz.MusicBrainzSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/artists")
@RequiredArgsConstructor
public class AdminArtistController {

    private final ArtistRepository artistRepository;
    private final MusicBrainzSyncService syncService;

    @GetMapping
    public List<ArtistResponse> listArtists() {
        return artistRepository.findAll().stream()
                .map(ArtistResponse::from)
                .toList();
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<String> syncArtist(@PathVariable UUID id) {
        syncService.syncSingleArtist(id);
        return ResponseEntity.ok("Sync complete");
    }
}
