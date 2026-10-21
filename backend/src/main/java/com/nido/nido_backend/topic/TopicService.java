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

        if (request.parentTopicId() != null) {
            parentTopic = getTopic(
                    UUID.fromString(request.parentTopicId()),
                    space.getSpaceId(),
                    "Parent topic was not found");
        }

        request = request.withName(resolveUniqueName(
                request.name(),
                spaceIdConverted,
                parentTopic != null ? parentTopic.getTopicId() : null,
                null));

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
        UUID newParentId = null;

        if (topicHasParent) {
            TopicEntity newParent = requireTopic(
                    UUID.fromString(request.newParentId()),
                    spaceIdConverted,
                    "The specified parent topic was not found in the specified space");

            assertNotDescendant(entity.getTopicId(), newParent.getTopicId(), spaceIdConverted);
            newParentId = newParent.getTopicId();
        }

        entity.setName(resolveUniqueName(entity.getName(), spaceIdConverted, newParentId, entity.getTopicId()));
        entity.setParentTopicId(newParentId);
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

    private String resolveUniqueName(String name, UUID spaceId, UUID parentTopicId, UUID excludeTopicId) {
        List<String> siblings = parentTopicId != null
                ? topicRepository.findChildNamesStartingWith(name, parentTopicId, excludeTopicId)
                : topicRepository.findRootNamesStartingWith(name, spaceId, excludeTopicId);

        Set<String> taken = new HashSet<>();
        for (String sibling : siblings) taken.add(sibling.toLowerCase(Locale.ROOT));

        if (!taken.contains(name.toLowerCase(Locale.ROOT))) return name;

        int suffix = 2;
        while (taken.contains("%s (%d)".formatted(name, suffix).toLowerCase(Locale.ROOT))) suffix++;

        return "%s (%d)".formatted(name, suffix);
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

        if (!request.name().equalsIgnoreCase(topicEntity.getName())) {
            if (topicEntity.getParentTopicId() != null)
                requireTopic(
                        topicEntity.getParentTopicId(),
                        topicEntity.getSpaceId(),
                        "The specified parent topic was not found in the specified space");

            request = request.withName(resolveUniqueName(
                    request.name(),
                    topicEntity.getSpaceId(),
                    topicEntity.getParentTopicId(),
                    topicEntity.getTopicId()));
        }

        topicEntity.setName(request.name());
        topicEntity.setColor(request.color());

        return TopicResponse.from(topicEntity);
    }
}
