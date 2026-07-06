package dev.theolambert.release_radar.release;

import dev.theolambert.release_radar.artist.Artist;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "releases", uniqueConstraints =
        @UniqueConstraint(name = "releases_artist_mbid_key", columnNames = {"artist_id", "mbid"}))
@Getter
@Setter
@NoArgsConstructor
public class Release {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String mbid;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReleaseType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "artist_role", nullable = false)
    private ArtistRole artistRole = ArtistRole.PRIMARY;

    private LocalDate releaseDate;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
