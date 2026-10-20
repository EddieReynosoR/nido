package com.nido.nido_backend.spaces;

import com.nido.nido_backend.note.NoteService;
import com.nido.nido_backend.shared.exception.NoRowsAffectedException;
import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.shared.util.TopicsTree;
import com.nido.nido_backend.spaces.dto.SpaceContentResponse;
import com.nido.nido_backend.spaces.dto.SpaceResponse;
import com.nido.nido_backend.topic.TopicEntity;
import com.nido.nido_backend.topic.TopicRepository;
import com.nido.nido_backend.topic.TopicService;
import com.nido.nido_backend.topic.dto.TopicResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class SpaceService {
    private final SpaceRepository spaceRepository;
    private final TopicRepository topicRepository;
    private final NoteService noteService;

    public SpaceService(SpaceRepository spaceRepository, TopicRepository topicRepository, NoteService noteService) {
        this.spaceRepository = spaceRepository;
        this.topicRepository = topicRepository;
        this.noteService = noteService;
    }

    @Transactional
    public SpaceResponse createSpace(String name, String ownerId) {
        String normalized = name == null ? null : name.trim();
        UUID ownerIdConverted = UUID.fromString(ownerId);

        if (spaceRepository.existsByUserIdAndNameAndDeletedAtIsNull(ownerIdConverted, normalized))
            throw new RecordAlreadyExists("A space with that name already exists");

        SpaceEntity entity = new SpaceEntity();
        entity.setName(normalized);
        entity.setUserId(ownerIdConverted);

        return SpaceResponse.from(spaceRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public Page<SpaceResponse> getSpaces(String ownerId, Pageable pageable) {
        return spaceRepository.findByUserIdAndDeletedAtIsNull(UUID.fromString(ownerId), pageable)
                .map(SpaceResponse::from);
    }

    @Transactional
    public void deleteSpace(UUID spaceId, UUID userId) {
        if (!spaceRepository.existsByUserIdAndSpaceIdAndDeletedAtIsNull(userId, spaceId))
            throw new NoSuchElementException("Space not found");

        int deleted = spaceRepository.softDeleteBySpaceId(spaceId, Instant.now());

        if (deleted == 0)
            throw new NoRowsAffectedException("No spaces were deleted");
    }

    @Transactional
    public SpaceResponse updateSpace(UUID spaceId, UUID userId, String name) {
        Optional<SpaceEntity> entity = spaceRepository.findBySpaceIdAndUserIdAndDeletedAtIsNull(spaceId, userId);

        if (entity.isEmpty())
            throw new NoSuchElementException("Space not found");

        String nameTrimmed = name.trim();
        SpaceEntity spaceEntity = entity.get();

        if (spaceRepository.existsByUserIdAndNameAndDeletedAtIsNull(userId, nameTrimmed))
            throw new RecordAlreadyExists("A space with that name already exists");

        spaceEntity.setName(nameTrimmed);

        return SpaceResponse.from(spaceEntity);
    }

    @Transactional(readOnly = true)
    public SpaceEntity getOwnedBy(UUID spaceId, UUID userId) {
        return spaceRepository.findBySpaceIdAndUserIdAndDeletedAtIsNull(spaceId, userId)
                .orElseThrow(() -> new NoSuchElementException("Space not found"));
    }

    @Transactional(readOnly = true)
    public SpaceContentResponse getContent(UUID spaceId, String userId) {
        getOwnedBy(spaceId, UUID.fromString(userId));
        List<TopicEntity> topics = topicRepository.getBySpaceId(spaceId);
        var notes = noteService.getNotesFromSpace(spaceId);
        var notesInRoot = notes.withoutTopic();
        var notesInTopic = notes.withTopic();

        if (topics.isEmpty()) return new SpaceContentResponse(new ArrayList<>(), notesInRoot);

        List<TopicResponse> responseList = TopicResponse.toList(topics);
        List<UUID> topicIds = topics.stream()
                .map(TopicEntity::getTopicId)
                .toList();

        Map<UUID, UUID> introNotes = noteService.getIntroNotes(topicIds);

        var result = responseList.stream()
                .map(t -> t.withIntroNote(introNotes.get(t.topicId())))
                .map(t -> t.withNotes(notesInTopic.getOrDefault(t.topicId(), new ArrayList<>())))
                .toList();

        return new SpaceContentResponse(TopicsTree.createTopicsTree(result), notesInRoot);
    }
}
