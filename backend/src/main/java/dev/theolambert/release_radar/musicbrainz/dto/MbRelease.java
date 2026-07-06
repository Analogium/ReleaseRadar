package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MbRelease(
        String id,
        String title,
        String date,
        @JsonProperty("release-group") MbReleaseGroup releaseGroup,
        @JsonProperty("artist-credit") List<MbArtistCredit> artistCredit
) {}
