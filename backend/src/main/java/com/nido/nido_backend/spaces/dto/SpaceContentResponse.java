package com.nido.nido_backend.spaces.dto;

import com.nido.nido_backend.note.dto.NoteTreeResponse;
import com.nido.nido_backend.topic.dto.TopicResponse;

import java.util.List;

public record SpaceContentResponse(List<TopicResponse> topics, List<NoteTreeResponse> notes) {
}
