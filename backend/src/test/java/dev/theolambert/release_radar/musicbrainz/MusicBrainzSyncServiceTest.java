package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.artist.Artist;
import dev.theolambert.release_radar.artist.ArtistRepository;
import dev.theolambert.release_radar.email.EmailService;
import dev.theolambert.release_radar.musicbrainz.dto.MbArtist;
import dev.theolambert.release_radar.musicbrainz.dto.MbArtistCredit;
import dev.theolambert.release_radar.musicbrainz.dto.MbRelease;
import dev.theolambert.release_radar.musicbrainz.dto.MbReleaseGroup;
import dev.theolambert.release_radar.release.ArtistRole;
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

    private static final String ARTIST_MBID = "artist-mbid";

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
        a.setMbid(ARTIST_MBID);
        a.setName("Test Artist");
        a.setLastSyncedAt(lastSyncedAt);
        return a;
    }

    private MbArtistCredit credit(String artistId, String joinphrase) {
        return new MbArtistCredit(joinphrase, new MbArtist(artistId, "Name " + artistId, null, null));
    }

    /** Sortie solo de l'artiste testé (crédit à un seul artiste). */
    private MbRelease mbRelease(String id, String date, String primaryType) {
        return new MbRelease(id, "Some Title", date, new MbReleaseGroup(primaryType),
                List.of(credit(ARTIST_MBID, "")));
    }

    private MbRelease mbReleaseWithCredit(String id, List<MbArtistCredit> credit) {
        return new MbRelease(id, "Some Title", LocalDate.now().toString(),
                new MbReleaseGroup("Single"), credit);
    }

    private Release capturedRelease() {
        ArgumentCaptor<Release> captor = ArgumentCaptor.forClass(Release.class);
        verify(releaseRepository).save(captor.capture());
        return captor.getValue();
    }

    private void stubSaveAndNotExisting() {
        when(releaseRepository.existsByArtistIdAndMbid(any(), any())).thenReturn(false);
        when(releaseRepository.save(any(Release.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void firstSyncPersistsReleasesButReturnsNothingToNotify() {
        Artist artist = artist(null); // never synced before
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        stubSaveAndNotExisting();

        List<Release> toNotify = syncService.syncArtistReleases(artist);

        assertThat(toNotify).isEmpty();
        assertThat(artist.getLastSyncedAt()).isNotNull();
        verify(releaseRepository).save(any(Release.class));
        verify(artistRepository).save(artist);
    }

    @Test
    void subsequentSyncNotifiesRecentReleases() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        stubSaveAndNotExisting();

        List<Release> toNotify = syncService.syncArtistReleases(artist);

        assertThat(toNotify).hasSize(1);
        assertThat(toNotify.get(0).getMbid()).isEqualTo("mb1");
    }

    @Test
    void subsequentSyncSkipsReleasesOlderThan30Days() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", "2000-01-01", "Album")));
        stubSaveAndNotExisting();

        assertThat(syncService.syncArtistReleases(artist)).isEmpty();
    }

    @Test
    void skipsReleasesAlreadyStoredForThisArtist() {
        Artist artist = artist(LocalDateTime.now().minusDays(1));
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        when(releaseRepository.existsByArtistIdAndMbid(artist.getId(), "mb1")).thenReturn(true);

        assertThat(syncService.syncArtistReleases(artist)).isEmpty();
        verify(releaseRepository, never()).save(any());
    }

    @Test
    void mapsPrimaryTypeAndParsesPartialDate() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", "2024-05", "Single")));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        Release saved = capturedRelease();
        assertThat(saved.getType()).isEqualTo(ReleaseType.SINGLE);
        assertThat(saved.getReleaseDate()).isEqualTo(LocalDate.of(2024, 5, 1));
        assertThat(saved.getArtist()).isSameAs(artist);
    }

    @Test
    void defaultsToOtherTypeWhenReleaseGroupMissing() {
        Artist artist = artist(null);
        MbRelease noGroup = new MbRelease("mb1", "Some Title", "2024", null,
                List.of(credit(ARTIST_MBID, "")));
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID)).thenReturn(List.of(noGroup));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        Release saved = capturedRelease();
        assertThat(saved.getType()).isEqualTo(ReleaseType.OTHER);
        assertThat(saved.getReleaseDate()).isEqualTo(LocalDate.of(2024, 1, 1));
    }

    @Test
    void classifiesSoloReleaseAsPrimary() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbRelease("mb1", LocalDate.now().toString(), "Album")));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        assertThat(capturedRelease().getArtistRole()).isEqualTo(ArtistRole.PRIMARY);
    }

    @Test
    void classifiesCoCreditAsCollaboration() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbReleaseWithCredit("mb1",
                        List.of(credit(ARTIST_MBID, " & "), credit("other", "")))));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        assertThat(capturedRelease().getArtistRole()).isEqualTo(ArtistRole.COLLABORATION);
    }

    @Test
    void classifiesGuestAppearanceAsFeaturing() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbReleaseWithCredit("mb1",
                        List.of(credit("other", " feat. "), credit(ARTIST_MBID, "")))));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        assertThat(capturedRelease().getArtistRole()).isEqualTo(ArtistRole.FEATURING);
    }

    @Test
    void classifiesOwnReleaseWithGuestAsPrimary() {
        Artist artist = artist(null);
        when(musicBrainzClient.getReleasesByArtist(ARTIST_MBID))
                .thenReturn(List.of(mbReleaseWithCredit("mb1",
                        List.of(credit(ARTIST_MBID, " feat. "), credit("other", "")))));
        stubSaveAndNotExisting();

        syncService.syncArtistReleases(artist);

        assertThat(capturedRelease().getArtistRole()).isEqualTo(ArtistRole.PRIMARY);
    }
}
