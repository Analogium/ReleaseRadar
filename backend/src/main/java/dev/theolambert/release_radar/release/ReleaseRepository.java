package dev.theolambert.release_radar.release;

import dev.theolambert.release_radar.artist.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ReleaseRepository extends JpaRepository<Release, UUID> {
    List<Release> findByArtistInOrderByReleaseDateDesc(Collection<Artist> artists);
    boolean existsByMbid(String mbid);
}
