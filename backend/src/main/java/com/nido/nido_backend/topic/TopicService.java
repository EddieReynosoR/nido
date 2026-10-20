package com.nido.nido_backend.topic;

import com.nido.nido_backend.note.NoteService;
import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.spaces.SpaceService;
import com.nido.nido_backend.topic.dto.TopicRequest;
import com.nido.nido_backend.topic.dto.TopicResponse;
import com.nido.nido_backend.topic.dto.UpdateParentRequest;
import com.nido.nido_backend.topic.dto.UpdateTopicRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class TopicService {

    private static final int MAX_ANCESTRY_DEPTH = 256;

    private final TopicRepository topicRepository;
    private final SpaceService spaceService;
    private final NoteService noteService;

    public TopicService(TopicRepository topicRepository, SpaceService spaceService, NoteService noteService) {
        this.topicRepository = topicRepository;
        this.spaceService = spaceService;
        this.noteService = noteService;
    }

    @Transactional
    public TopicEntity createTopic(TopicRequest request, String userId) {
        UUID userIdConverted = UUID.fromString(userId);
        UUID spaceIdConverted = UUID.fromString(request.spaceId());

        SpaceEntity space = spaceService.getOwnedBy(spaceIdConverted, userIdConverted);

        TopicEntity parentTopic = null;

        int topicCount;

        if (request.parentTopicId() != null) {
            parentTopic = getTopic(
                    UUID.fromString(request.parentTopicId()),
                    space.getSpaceId(),
                    "Parent topic was not found");

            topicCount = topicRepository.countChildByNameAndParentTopicId(request.name(), parentTopic.getTopicId());
        }
        else
            topicCount = topicRepository.countRootByNameAndSpaceId(request.name(), spaceIdConverted);

        if (topicCount > 0) request = request.withName("%s (%s)".formatted(request.name(), topicCount + 1));

        TopicEntity entity = request.toEntity(space.getSpaceId(), parentTopic != null ? parentTopic.getTopicId() : null);
        topicRepository.save(entity);

        return entity;
    }

    @Transactional(readOnly = true)
    public TopicEntity getTopic(UUID topicId, UUID spaceId, String message) {
        return requireTopic(topicId, spaceId, message);
    }

    public TopicEntity requireTopic(UUID topicId, UUID spaceId, String message) {
        return topicRepository.findByTopicIdAndSpaceId(topicId, spaceId)
                .orElseThrow(() -> new NoSuchElementException(message));
    }

    @Transactional
    public void updateParentTopic(UpdateParentRequest request, String userId) {
        if (Objects.equals(request.topicId(), request.newParentId()))
            throw new IllegalArgumentException("Recursive reparenting is not valid");

        UUID spaceIdConverted = UUID.fromString(request.spaceId());
        var _ = spaceService.getOwnedBy(spaceIdConverted, UUID.fromString(userId));

        TopicEntity entity = requireTopic(
                UUID.fromString(request.topicId()),
                spaceIdConverted,
                "The specified topic was not found in the specified space");

        boolean topicHasParent = request.newParentId() != null && !request.newParentId().isEmpty();
        String topicName = entity.getName();

        int topicCount;

        if (topicHasParent) {
            TopicEntity newParent = requireTopic(
                    UUID.fromString(request.newParentId()),
                    spaceIdConverted,
                    "The specified parent topic was not found in the specified space");

            topicCount = topicRepository.countChildByNameAndParentTopicId(topicName, newParent.getTopicId());

            assertNotDescendant(entity.getTopicId(), newParent.getTopicId(), spaceIdConverted);
        }
        else
            topicCount = topicRepository.countRootByNameAndSpaceId(topicName, spaceIdConverted);

        if (topicCount > 0) request = request.withName("%s (%s)".formatted(entity.getName(), topicCount + 1));

        entity.setParentTopicId(topicHasParent ? UUID.fromString(request.newParentId()) : null);
        topicRepository.save(entity);
    }

    @Transactional
    public void softDelete(UUID topicId, String userId) {
        if (topicRepository.getByIdAndUserId(topicId, UUID.fromString(userId)).isEmpty())
            throw new NoSuchElementException("The specified topic was not found with the specified user");

        List<UUID> topicIds = topicRepository.findActiveSubtreeIds(topicId);

        if (topicIds.isEmpty()) return;

        Instant deletedAt = Instant.now();
        topicRepository.softDeleteByIds(topicIds, deletedAt);
        noteService.softDeleteByTopics(topicIds);
    }

    private void assertNotDescendant(UUID topicId, UUID newParentId, UUID spaceId) {
        if (topicRepository.isAncestorOrSelf(topicId, newParentId, spaceId, MAX_ANCESTRY_DEPTH))
            throw new IllegalArgumentException(
                    "A topic cannot be moved into itself or into one of its own sub-topics");
    }

    @Transactional
    public TopicResponse updateTopic(UpdateTopicRequest request, String userId) {
        TopicEntity topicEntity = topicRepository.getByIdAndUserId(request.topicId(), UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("The specified topic was not found with the specified user"));

        boolean topicHasParent = topicEntity.getParentTopicId() != null;
        String topicName = request.name();

        if (!topicName.equalsIgnoreCase(topicEntity.getName())) {
            int topicCount;

            if (topicHasParent) {
                TopicEntity parent = requireTopic(
                        topicEntity.getParentTopicId(),
                        topicEntity.getSpaceId(),
                        "The specified parent topic was not found in the specified space");

                topicCount = topicRepository.countChildByNameAndParentTopicId(topicName, parent.getTopicId());
            } else
                topicCount = topicRepository.countRootByNameAndSpaceId(topicName, topicEntity.getSpaceId());

            if (topicCount > 0) request = request.withName("%s (%s)".formatted(request.name(), topicCount + 1));
        }

        topicEntity.setName(request.name());
        topicEntity.setColor(request.color());

        return TopicResponse.from(topicEntity);
    }
}
