package com.nido.nido_backend.topics;

import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.shared.util.TopicsTree;
import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.spaces.SpaceService;
import com.nido.nido_backend.topics.dto.TopicRequest;
import com.nido.nido_backend.topics.dto.TopicResponse;
import com.nido.nido_backend.topics.dto.UpdateParentRequest;
import com.nido.nido_backend.topics.dto.UpdateTopicRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;

@Service
public class TopicService {

    private static final int MAX_ANCESTRY_DEPTH = 256;

    private final TopicRepository topicRepository;
    private final SpaceService spaceService;

    public TopicService(TopicRepository topicRepository, SpaceService spaceService) {
        this.topicRepository = topicRepository;
        this.spaceService = spaceService;
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> get(UUID spaceId, String userId) {
        SpaceEntity spaceEntity = spaceService.getOwnedBy(spaceId, UUID.fromString(userId));

        List<TopicEntity> topics = topicRepository.getBySpaceId(spaceEntity.getSpaceId());

        return TopicsTree.createTopicsTree(TopicResponse.toList(topics));
    }

    @Transactional
    public TopicEntity createTopic(TopicRequest request, String userId) {
        UUID userIdConverted = UUID.fromString(userId);
        UUID spaceIdConverted = UUID.fromString(request.spaceId());

        SpaceEntity space = spaceService.getOwnedBy(spaceIdConverted, userIdConverted);

        TopicEntity parentTopic = null;

        boolean nameTaken;
        String conflictMessage;

        if (request.parentTopicId() != null) {
            parentTopic = getTopic(
                    UUID.fromString(request.parentTopicId()),
                    space.getSpaceId(),
                    "Parent topic was not found");

            nameTaken = topicRepository.existsChildByNameAndParentTopicId(request.name(), parentTopic.getTopicId());
            conflictMessage = "A sub-topic with the name '%s' already exists in topic '%s'"
                        .formatted(request.name(), parentTopic.getName());
        }
        else {
            nameTaken = topicRepository.existsRootByNameAndSpaceId(request.name(), spaceIdConverted);
            conflictMessage = "A topic with the name '%s' already exists"
                        .formatted(request.name());
        }

        if (nameTaken) throw new RecordAlreadyExists(conflictMessage);

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

        boolean nameTaken;
        String conflictMessage;

        if (topicHasParent) {
            TopicEntity newParent = requireTopic(
                    UUID.fromString(request.newParentId()),
                    spaceIdConverted,
                    "The specified parent topic was not found in the specified space");

            nameTaken = topicRepository.existsChildByNameAndParentTopicId(topicName, newParent.getTopicId());
            conflictMessage = "A sub-topic with the name '%s' already exists in topic '%s'"
                        .formatted(topicName, newParent.getName());

            assertNotDescendant(entity.getTopicId(), newParent.getTopicId(), spaceIdConverted);
        }
        else {
            nameTaken = topicRepository.existsRootByNameAndSpaceId(topicName, spaceIdConverted);
            conflictMessage = "A topic with the name '%s' already exists".formatted(topicName);
        }

        if (nameTaken) throw new RecordAlreadyExists(conflictMessage);

        entity.setParentTopicId(topicHasParent ? UUID.fromString(request.newParentId()) : null);
        topicRepository.save(entity);
    }

    @Transactional
    public void softDelete(UUID topicId, String userId) {
        if (topicRepository.getByIdAndUserId(topicId, UUID.fromString(userId)).isEmpty())
            throw new NoSuchElementException("The specified topic was not found with the specified user");

        topicRepository.softDeleteSubtree(topicId);
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
            boolean nameTaken;
            String conflictMessage;

            if (topicHasParent) {
                TopicEntity parent = requireTopic(
                        topicEntity.getParentTopicId(),
                        topicEntity.getSpaceId(),
                        "The specified parent topic was not found in the specified space");

                nameTaken = topicRepository.existsChildByNameAndParentTopicId(topicName, parent.getTopicId());
                conflictMessage = "A topic with the name '%s' already exists in topic '%s'"
                        .formatted(topicName, parent.getName());
            } else {
                nameTaken = topicRepository.existsRootByNameAndSpaceId(topicName, topicEntity.getSpaceId());
                conflictMessage = "A topic with the name '%s' already exists".formatted(topicName);
            }

            if (nameTaken) throw new RecordAlreadyExists(conflictMessage);
        }

        topicEntity.setName(request.name());
        topicEntity.setColor(request.color());

        return TopicResponse.from(topicEntity);
    }
}
