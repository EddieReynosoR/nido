package com.nido.nido_backend.topics;

import com.nido.nido_backend.shared.exception.RecordAlreadyExists;
import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.spaces.SpaceRepository;
import com.nido.nido_backend.spaces.SpaceService;
import com.nido.nido_backend.topics.dto.TopicRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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
    public TopicEntity createTopic(TopicRequest request, String userId) {
        UUID userIdConverted = UUID.fromString(userId);
        if (topicRepository.existsByNameAndUserId(request.name(), userIdConverted))
            throw new RecordAlreadyExists("Topic name already exists");

        SpaceEntity space = spaceService.getOwnedBy(request.spaceId(), userIdConverted);
        TopicEntity parentTopic = request.parentTopicId() != null ? getOwnedBy(request.parentTopicId(), userIdConverted) : null;

        TopicEntity entity = request.toEntity(space, parentTopic);
        topicRepository.save(entity);

        return entity;
    }

    @Transactional
    public TopicEntity getOwnedBy(UUID topicId, UUID userId) {
        return topicRepository.getByIdAndUserId(topicId, userId);
    }
}
