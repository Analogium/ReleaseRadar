package dev.theolambert.release_radar.artist.dto;

import jakarta.validation.constraints.NotBlank;

public record ArtistRequest(@NotBlank String mbid, @NotBlank String name) {}
