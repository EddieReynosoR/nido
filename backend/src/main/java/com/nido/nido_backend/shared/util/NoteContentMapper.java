package com.nido.nido_backend.shared.util;

import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class NoteContentMapper {
    private final ObjectMapper objectMapper;

    public NoteContentMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String toJsonString(JsonNode content) {
        if (content == null || !content.isArray())
            throw new IllegalArgumentException("The content of the note must be a list of blocks");

        return objectMapper.writeValueAsString(content);
    }

    public JsonNode toJsonNode(String content) {
        if (content == null)
            throw new IllegalStateException("The note doesn't have content");

        return objectMapper.readTree(content);
    }
}
