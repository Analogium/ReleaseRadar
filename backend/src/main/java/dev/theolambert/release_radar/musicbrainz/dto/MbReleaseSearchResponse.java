package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MbReleaseSearchResponse(
        List<MbRelease> releases,
        @JsonProperty("release-count") Integer releaseCount
) {}
