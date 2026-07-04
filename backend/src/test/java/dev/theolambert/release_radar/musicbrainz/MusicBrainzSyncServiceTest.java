package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.artist.ArtistRepository;
import dev.theolambert.release_radar.email.EmailService;
import dev.theolambert.release_radar.musicbrainz.dto.MbRelease;
import dev.theolambert.release_radar.musicbrainz.dto.MbReleaseGroup;
import dev.theolambert.release_radar.release.Release;
import dev.theolambert.release_radar.release.ReleaseRepository;
import dev.theolambert.release_radar.release.ReleaseType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MusicBrainzSyncServiceTest {

    @Mock
    private ArtistRepository artistRepository;
    @Mock
    private ReleaseRepository releaseRepository;
    @Mock
    private MusicBrainzClient musicBrainzClient;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private MusicBrainzSyncService syncService;

    private Artist artist(LocalDateTime lastSyncedAt) {
        Artist a = new Artist();
        a.setId(UUID.randomUUID());
        a.setMbid("artist-mbid");
        a.setName("Test Artist");
        a.setLastSyncedAt(lastSyncedAt);
        return a;
    }

    private MbRelease mbRelease(String id, String date, String primaryType) {
        return new MbRelease(id, "Some Title", date, new MbReleaseGroup(primaryType));
    }

    @Test
    void firstSyncPersistsReleasesButReturnsNothingToNotify() {
        Artist artist = artist(null); // never synced before
        when(musicBrainzClient.getReleasesByArtist("artist-mbid"))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        when(releaseRepository.existsByMbid(any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));

        List<Release> toNotify = syncService.syncArtistReleases(artist);

        assertThat(toNotify).isEmpty();
        assertThat(artist.getLastSyncedAt()).isNotNull();
        verify(releaseRepository).save(any(Release.class));
        verify(artistRepository).save(artist);
    }

    @Test
    void subsequentSyncNotifiesRecentReleases() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist("artist-mbid"))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        when(releaseRepository.existsByMbid(any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));

        List<Release> toNotify = syncService.syncArtistReleases(artist);

        assertThat(toNotify).hasSize(1);
        assertThat(toNotify.get(0).getMbid()).isEqualTo("mb1");
    }

    @Test
    void subsequentSyncSkipsReleasesOlderThan30Days() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist("artist-mbid"))
                .thenReturn(List.of(mbRelease("mb1", "2000-01-01", "Album")));
        when(releaseRepository.existsByMbid(any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));

        assertThat(syncService.syncArtistReleases(artist)).isEmpty();
    }

    @Test
    void skipsReleasesAlreadyStored() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist("artist-mbid"))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        when(releaseRepository.existsByMbid("mb1")).thenReturn(true);

        assertThat(syncService.syncArtistReleases(artist)).isEmpty();
        verify(releaseRepository, never()).save(any());
    }

    @Test
    void mapsPrimaryTypeAndParsesPartialDate() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist("artist-mbid"))
                .thenReturn(List.of(mbRelease("mb1", "2024-05", "Single")));
        when(releaseRepository.existsByMbid(any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));

        syncService.syncArtistReleases(artist);

        ArgumentCaptor<Release> captor = ArgumentCaptor.forClass(Release.class);
        verify(releaseRepository).save(captor.capture());
        Release saved = captor.getValue();
        assertThat(saved.getType()).isEqualTo(ReleaseType.SINGLE);
        assertThat(saved.getReleaseDate()).isEqualTo(LocalDate.of(2024, 5, 1));
        assertThat(saved.getArtist()).isSameAs(artist);
    }

    @Test
    void defaultsToOtherTypeWhenReleaseGroupMissing() {
        Artist artist = artist(null);
        MbRelease noGroup = new MbRelease("mb1", "Some Title", "2024", null);
        when(musicBrainzClient.getReleasesByArtist("artist-mbid")).thenReturn(List.of(noGroup));
        when(releaseRepository.existsByMbid(any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));

        syncService.syncArtistReleases(artist);

        ArgumentCaptor<Release> captor = ArgumentCaptor.forClass(Release.class);
        verify(releaseRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(ReleaseType.OTHER);
        assertThat(captor.getValue().getReleaseDate()).isEqualTo(LocalDate.of(2024, 1, 1));
    }
}
