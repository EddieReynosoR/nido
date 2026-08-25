package com.nido.nido_backend.spaces.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSpaceRequest(@NotBlank @Size(max = 50) String name, @NotBlank String spaceId) {
}
