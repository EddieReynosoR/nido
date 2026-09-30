package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.CreateNoteRequest;
import com.nido.nido_backend.note.dto.NoteResponse;
import com.nido.nido_backend.note.dto.TopicNoteIdDto;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import com.nido.nido_backend.topic.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteContentMapper noteContentMapper;
    private final TopicRepository topicRepository;

    public NoteService(NoteRepository noteRepository, NoteContentMapper noteContentMapper, TopicRepository topicRepository) {
        this.noteRepository = noteRepository;
        this.noteContentMapper = noteContentMapper;
        this.topicRepository = topicRepository;
    }

    public Map<UUID, UUID> getIntroNoteIdsByTopicIds(List<UUID> topicIds) {
        return noteRepository.findIntroNotesByTopicIds(topicIds).stream()
                .collect(Collectors.toMap(TopicNoteIdDto::topicId, TopicNoteIdDto::noteId));
    }

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, String userId) {
        topicRepository.getByIdAndUserId(request.topicId(), UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Topic not found"));

        NoteEntity entity = new NoteEntity();
        entity.setTitle(request.title());
        entity.setContent(noteContentMapper.toJsonString(request.content()));
        entity.setTopicId(request.topicId());
        entity.setIntro(request.isIntro());

        noteRepository.save(entity);
        return NoteResponse.from(entity, request.content());
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteByTopicId(UUID noteId, String userId) {
        var entity = noteRepository.getByIdAndUserId(noteId, UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        return NoteResponse.from(entity, noteContentMapper.toJsonNode(entity.getContent()));
    }
}
