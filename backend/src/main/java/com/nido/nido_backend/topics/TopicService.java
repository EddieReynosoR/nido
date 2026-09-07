package com.nido.nido_backend.topics;

import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.shared.util.TopicsTree;
import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.spaces.SpaceService;
import com.nido.nido_backend.topics.dto.TopicRequest;
import com.nido.nido_backend.topics.dto.TopicResponse;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class TopicService {

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

        if (request.parentTopicId() != null) {
            parentTopic = getByIdAndSpaceId(UUID.fromString(request.parentTopicId()), space.getSpaceId())
                    .orElseThrow(() -> new NoSuchElementException("Parent topic was not found"));

            if (topicRepository.existsByNameAndParentTopicId(request.name(), parentTopic.getTopicId()))
                throw new RecordAlreadyExists("A sub-topic with the title '%s' already exists in topic '%s'"
                        .formatted(request.name(), parentTopic.getName()));
        }
        else {
            if (topicRepository.existsByNameAndSpaceId(request.name(), spaceIdConverted))
                throw new RecordAlreadyExists("A topic with the name '%s' already exists"
                        .formatted(request.name()));
        }

        TopicEntity entity = request.toEntity(space, parentTopic != null ? parentTopic.getTopicId() : null);
        topicRepository.save(entity);

        return entity;
    }

    @Transactional(readOnly = true)
    public Optional<TopicEntity> getByIdAndSpaceId(UUID topicId, UUID spaceId) {
        return topicRepository.getByIdAndSpaceId(topicId, spaceId);
    }
}
