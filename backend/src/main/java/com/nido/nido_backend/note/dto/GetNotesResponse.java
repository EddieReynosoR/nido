package com.nido.nido_backend.note.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record GetNotesResponse(List<NoteTreeResponse> withoutTopic, Map<UUID, List<NoteTreeResponse>> withTopic) {
}
