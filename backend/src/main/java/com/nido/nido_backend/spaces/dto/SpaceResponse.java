package com.nido.nido_backend.spaces.dto;

import com.nido.nido_backend.spaces.SpaceEntity;

public record SpaceResponse(String name) {
    public static SpaceResponse from(SpaceEntity e) {
        return new SpaceResponse(e.getName());
    }
}
