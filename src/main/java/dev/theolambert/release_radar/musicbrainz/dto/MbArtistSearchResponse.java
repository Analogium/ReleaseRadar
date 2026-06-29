package dev.theolambert.release_radar.musicbrainz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MbArtistSearchResponse(List<MbArtist> artists) {}
