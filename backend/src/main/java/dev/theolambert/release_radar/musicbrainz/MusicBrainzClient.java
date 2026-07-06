package dev.theolambert.release_radar.musicbrainz;

import dev.theolambert.release_radar.musicbrainz.dto.MbArtist;
import dev.theolambert.release_radar.musicbrainz.dto.MbArtistSearchResponse;
import dev.theolambert.release_radar.musicbrainz.dto.MbRelease;
import dev.theolambert.release_radar.musicbrainz.dto.MbReleaseSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Component
public class MusicBrainzClient {

    private static final String BASE_URL = "https://musicbrainz.org/ws/2";
    private static final String USER_AGENT = "Release-Radar/1.0 (lambertheo@gmail.com)";

    private final RestClient restClient;

    public MusicBrainzClient() {
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("User-Agent", USER_AGENT)
                .build();
    }

    public List<MbArtist> searchArtists(String query) {
        MbArtistSearchResponse response = restClient.get()
                .uri("/artist?query={q}&fmt=json&limit=10", query)
                .retrieve()
                .body(MbArtistSearchResponse.class);
        return response != null && response.artists() != null ? response.artists() : List.of();
    }

    public List<MbRelease> getReleasesByArtist(String mbid) {
        MbReleaseSearchResponse response = restClient.get()
                .uri("/release?artist={mbid}&fmt=json&limit=100&inc=release-groups+artist-credits", mbid)
                .retrieve()
                .body(MbReleaseSearchResponse.class);
        return response != null && response.releases() != null ? response.releases() : List.of();
    }
}
