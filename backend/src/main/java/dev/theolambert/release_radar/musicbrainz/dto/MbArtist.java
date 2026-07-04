package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MbArtist(
        String id,
        String name,
        Integer score,
        String disambiguation
) {}
