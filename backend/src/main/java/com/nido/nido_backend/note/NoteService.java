package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.CreateNoteRequest;
import com.nido.nido_backend.note.dto.NoteResponse;
import com.nido.nido_backend.note.dto.TopicNoteIdDto;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteContentMapper noteContentMapper;

    public NoteService(NoteRepository noteRepository, NoteContentMapper noteContentMapper) {
        this.noteRepository = noteRepository;
        this.noteContentMapper = noteContentMapper;
    }

    public Map<UUID, UUID> getIntroNoteIdsByTopicIds(List<UUID> topicIds) {
        return noteRepository.findIntroNotesByTopicIds(topicIds).stream()
                .collect(Collectors.toMap(TopicNoteIdDto::topicId, TopicNoteIdDto::noteId));
    }

    public NoteResponse createNote(CreateNoteRequest request, String userId) {
        if (!noteRepository.existsActiveNoteOwnedByUser(request.topicId(), UUID.fromString(userId)))
            throw new NoSuchElementException("Topic not found");

        NoteEntity entity = new NoteEntity();
        entity.setTitle(request.title());
        entity.setContent(noteContentMapper.toJsonString(request.content()));
        entity.setTopicId(request.topicId());
        entity.setIntro(request.isIntro());

        noteRepository.save(entity);
        return NoteResponse.from(entity, noteContentMapper.toJsonNode(entity.getContent()));
    }
}
