package dev.theolambert.release_radar.release;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final UserRepository userRepository;

    public List<Release> getReleasesForUser(UUID userId) {
        List<Artist> followed = userRepository.findFollowedArtistsByUserId(userId);
        if (followed.isEmpty()) return List.of();
        return releaseRepository.findByArtistInOrderByReleaseDateDesc(followed);
    }
}
