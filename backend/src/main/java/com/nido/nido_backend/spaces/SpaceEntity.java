package com.nido.nido_backend.spaces;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "Space")
@Table(name = "spaces")
public class SpaceEntity {
    @Id
    @Column(name = "space_id", nullable = false, insertable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID spaceId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public UUID getSpaceId() {
        return spaceId;
    }

    public void setSpaceId(UUID spaceId) {
        this.spaceId = spaceId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getDeletedAt() { return deletedAt; }

    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}
