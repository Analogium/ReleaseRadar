package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.artist.ArtistRepository;
import dev.theolambert.release_radar.email.EmailService;
import dev.theolambert.release_radar.musicbrainz.dto.MbRelease;
import dev.theolambert.release_radar.release.Release;
import dev.theolambert.release_radar.release.ReleaseRepository;
import dev.theolambert.release_radar.release.ReleaseType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MusicBrainzSyncService {

    private final ArtistRepository artistRepository;
    private final ReleaseRepository releaseRepository;
    private final MusicBrainzClient musicBrainzClient;
    private final EmailService emailService;

    @Scheduled(fixedDelay = 86400000L, initialDelay = 60000L)
    public void syncReleases() {
        List<Artist> artists = artistRepository.findAllFollowed();
        log.info("Starting release sync for {} followed artists", artists.size());

        for (Artist artist : artists) {
            try {
                List<Release> toNotify = syncArtistReleases(artist);
                emailService.notifySubscribers(artist, toNotify);
                Thread.sleep(1100L); // MusicBrainz rate limit: 1 req/s
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Release sync interrupted");
                break;
            } catch (Exception e) {
                log.error("Failed to sync releases for {}: {}", artist.getName(), e.getMessage());
            }
        }

        log.info("Release sync complete");
    }

    /** Synchronisation à la demande d'un seul artiste (déclenchée depuis l'espace admin). */
    public void syncSingleArtist(UUID artistId) {
        Artist artist = artistRepository.findById(artistId).orElseThrow();
        log.info("Manual release sync for artist {}", artist.getName());
        List<Release> toNotify = syncArtistReleases(artist);
        emailService.notifySubscribers(artist, toNotify);
    }

    @Transactional
    public List<Release> syncArtistReleases(Artist artist) {
        boolean isFirstSync = artist.getLastSyncedAt() == null;
        LocalDateTime syncTime = LocalDateTime.now();
        List<MbRelease> mbReleases = musicBrainzClient.getReleasesByArtist(artist.getMbid());
        List<Release> newReleases = new ArrayList<>();

        for (MbRelease mbRelease : mbReleases) {
            if (!releaseRepository.existsByMbid(mbRelease.id())) {
                Release release = new Release();
                release.setMbid(mbRelease.id());
                release.setTitle(mbRelease.title());
                release.setType(mapReleaseType(mbRelease));
                release.setReleaseDate(parseDate(mbRelease.date()));
                release.setArtist(artist);
                newReleases.add(releaseRepository.save(release));
            }
        }

        if (!newReleases.isEmpty()) {
            log.info("Saved {} new release(s) for {}", newReleases.size(), artist.getName());
        }

        artist.setLastSyncedAt(syncTime);
        artistRepository.save(artist);

        // On first sync we persist everything but don't notify (historical data)
        // On subsequent syncs we notify releases from the last 30 days (Option A+B)
        if (isFirstSync) {
            return List.of();
        }
        return newReleases.stream()
                .filter(r -> r.getReleaseDate() != null)
                .filter(r -> r.getReleaseDate().isAfter(LocalDate.now().minusDays(30)))
                .toList();
    }

    private ReleaseType mapReleaseType(MbRelease release) {
        if (release.releaseGroup() == null || release.releaseGroup().primaryType() == null) {
            return ReleaseType.OTHER;
        }
        return switch (release.releaseGroup().primaryType()) {
            case "Album" -> ReleaseType.ALBUM;
            case "Single" -> ReleaseType.SINGLE;
            case "EP" -> ReleaseType.EP;
            case "Compilation" -> ReleaseType.COMPILATION;
            case "Live" -> ReleaseType.LIVE;
            default -> ReleaseType.OTHER;
        };
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return switch (date.length()) {
                case 10 -> LocalDate.parse(date);
                case 7 -> LocalDate.parse(date + "-01");
                case 4 -> LocalDate.parse(date + "-01-01");
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }
}
