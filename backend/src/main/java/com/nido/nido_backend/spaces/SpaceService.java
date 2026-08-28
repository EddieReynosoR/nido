package com.nido.nido_backend.spaces;

import com.nido.nido_backend.shared.exception.NoRowsAffectedException;
import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class SpaceService {
    private final SpaceRepository spaceRepository;

    public SpaceService(SpaceRepository spaceRepository) {
        this.spaceRepository = spaceRepository;
    }

    @Transactional
    public SpaceResponse createSpace(String name, String ownerId) {
        String normalized = name == null ? null : name.trim();
        UUID ownerIdConverted = UUID.fromString(ownerId);

        if (spaceRepository.existsByUserIdAndName(ownerIdConverted, normalized))
            throw new RecordAlreadyExists("A space with that name already exists");

        SpaceEntity entity = new SpaceEntity();
        entity.setName(normalized);
        entity.setUserId(ownerIdConverted);

        return SpaceResponse.from(spaceRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public Page<SpaceResponse> getSpaces(String ownerId, Pageable pageable) {
        return spaceRepository.findByUserId(UUID.fromString(ownerId), pageable)
                .map(SpaceResponse::from);
    }

    @Transactional
    public void deleteSpace(UUID spaceId, UUID userId) {
        if (!spaceRepository.existsBySpaceIdAndUserId(spaceId, userId))
            throw new NoSuchElementException("Space not found");

        int deleted = spaceRepository.deleteBySpaceId(spaceId);

        if (deleted == 0)
            throw new NoRowsAffectedException("No spaces were deleted");
    }

    @Transactional
    public SpaceResponse updateSpace(UUID spaceId, UUID userId, String name) {
        Optional<SpaceEntity> entity = spaceRepository.findBySpaceIdAndUserId(spaceId, userId);

        if (entity.isEmpty())
            throw new NoSuchElementException("Space not found");

        String nameTrimmed = name.trim();
        SpaceEntity spaceEntity = entity.get();

        if (spaceRepository.existsByUserIdAndName(userId, nameTrimmed))
            throw new RecordAlreadyExists("A space with that name already exists");

        spaceEntity.setName(nameTrimmed);

        return SpaceResponse.from(spaceEntity);
    }
}
