package com.nido.nido_backend.topics;

import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
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

    @Transactional
    public List<TopicResponse> get(UUID spaceId, String userId) {
        SpaceEntity spaceEntity = spaceService.getOwnedBy(spaceId, UUID.fromString(userId));
        if (spaceEntity == null)
            throw new NoSuchElementException("Space was not found");

        List<TopicEntity> topics = topicRepository.getBySpaceId(spaceId);
        return TopicResponse.toList(topics);
    }

    @Transactional
    public TopicEntity createTopic(TopicRequest request, String userId) {
        UUID userIdConverted = UUID.fromString(userId);
        if (topicRepository.existsByNameAndUserId(request.name(), userIdConverted))
            throw new RecordAlreadyExists("Topic name already exists");

        SpaceEntity space = spaceService.getOwnedBy(UUID.fromString(request.spaceId()), userIdConverted);
        TopicEntity parentTopic = null;

        if (request.parentTopicId() != null)
            parentTopic = getOwnedBy(UUID.fromString(request.parentTopicId()), userIdConverted, space.getSpaceId())
                    .orElseThrow(() -> new NoSuchElementException("Parent topic was not found"));

        TopicEntity entity = request.toEntity(space, parentTopic);
        topicRepository.save(entity);

        return entity;
    }

    @Transactional(readOnly = true)
    public Optional<TopicEntity> getOwnedBy(UUID topicId, UUID userId, UUID spaceId) {
        return topicRepository.getByIdAndUserIdAndSpaceId(topicId, userId, spaceId);
    }
}
