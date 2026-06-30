package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MbRelease(
        String id,
        String title,
        String date,
        @JsonProperty("release-group") MbReleaseGroup releaseGroup
) {}
