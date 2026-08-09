package com.nido.nido_backend.spaces;

import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class SpaceService {
    private final SpaceRepository spaceRepository;

    public SpaceService(SpaceRepository spaceRepository) {
        this.spaceRepository = spaceRepository;
    }

    @Transactional
    public SpaceResponse createSpace(String name, UUID ownerId) {
        String normalized = name == null ? null : name.trim();

        if (spaceRepository.existsByUserIdAndName(ownerId, name)) {
            throw new RecordAlreadyExists("A space with that name already exists");
        }

        SpaceEntity entity = new SpaceEntity();
        entity.setName(normalized);
        entity.setUserId(ownerId);

        return SpaceResponse.from(spaceRepository.save(entity));
    }
}
