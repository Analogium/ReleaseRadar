package dev.theolambert.release_radar.user;

import dev.theolambert.release_radar.artist.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("SELECT a FROM User u JOIN u.followedArtists a WHERE u.id = :id")
    List<Artist> findFollowedArtistsByUserId(@Param("id") UUID id);
}
