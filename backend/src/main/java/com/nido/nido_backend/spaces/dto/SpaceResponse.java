package com.nido.nido_backend.spaces.dto;

import com.nido.nido_backend.spaces.SpaceEntity;

import java.util.UUID;

public record SpaceResponse(UUID spaceId, String name) {
    public static SpaceResponse from(SpaceEntity e) {
        return new SpaceResponse(e.getSpaceId(), e.getName());
    }
}
