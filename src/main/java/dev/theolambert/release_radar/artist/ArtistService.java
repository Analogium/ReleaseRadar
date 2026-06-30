package dev.theolambert.release_radar.artist;

import dev.theolambert.release_radar.artist.dto.ArtistRequest;
import dev.theolambert.release_radar.artist.dto.ArtistSearchResult;
import dev.theolambert.release_radar.musicbrainz.MusicBrainzClient;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final MusicBrainzClient musicBrainzClient;

    public List<Artist> getFollowedArtists(UUID userId) {
        return userRepository.findFollowedArtistsByUserId(userId);
    }

    @Transactional
    public Artist followArtist(UUID userId, ArtistRequest request) {
        Artist artist = artistRepository.findByMbid(request.mbid()).orElseGet(() -> {
            Artist a = new Artist();
            a.setMbid(request.mbid());
            a.setName(request.name());
            return artistRepository.save(a);
        });

        User user = userRepository.findById(userId).orElseThrow();
        user.getFollowedArtists().add(artist);

        return artist;
    }

    @Transactional
    public void unfollowArtist(UUID userId, UUID artistId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.getFollowedArtists().removeIf(a -> a.getId().equals(artistId));
    }

    public List<ArtistSearchResult> searchArtists(String query) {
        return musicBrainzClient.searchArtists(query).stream()
                .map(ArtistSearchResult::from)
                .toList();
    }
}
