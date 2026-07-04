package dev.theolambert.release_radar.artist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArtistRepository extends JpaRepository<Artist, UUID> {
    Optional<Artist> findByMbid(String mbid);

    @Query("SELECT DISTINCT a FROM User u JOIN u.followedArtists a")
    List<Artist> findAllFollowed();
}
