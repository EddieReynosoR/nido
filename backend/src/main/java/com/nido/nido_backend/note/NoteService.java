package com.nido.nido_backend.note;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public Map<UUID, UUID> getIntroNoteIdsByTopicIds(List<UUID> topicIds) {
        return noteRepository.findIntroNotesByTopicIds(topicIds).stream()
                .collect(Collectors.toMap(NoteEntity::getTopicId, NoteEntity::getNoteId));
    }
}
