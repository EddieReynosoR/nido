package com.nido.nido_backend.topics;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "Topic")
@Table(name = "topics")
public class TopicEntity {
    @Id
    @Column(name = "topic_id", nullable = false, insertable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID topicId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "space_id", nullable = false)
    private UUID spaceId;

    @Column(name = "parent_topic_id")
    private UUID parentTopicId;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() { return color; }

    public void setColor(String color) { this.color = color; }

    public UUID getSpaceId() {
        return spaceId;
    }

    public void setSpaceId(UUID spaceId) {
        this.spaceId = spaceId;
    }

    public UUID getParentTopicId() { return parentTopicId; }

    public void setParentTopicId(UUID parentTopicId) { this.parentTopicId = parentTopicId; }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getDeletedAt() { return deletedAt; }

    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}
