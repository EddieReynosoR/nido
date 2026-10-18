package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.*;
import com.nido.nido_backend.note.exception.NoteVersionConflictException;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import com.nido.nido_backend.spaces.SpaceService;
import com.nido.nido_backend.topic.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteContentMapper noteContentMapper;
    private final TopicRepository topicRepository;
    private final SpaceService spaceService;

    public NoteService(NoteRepository noteRepository, NoteContentMapper noteContentMapper, TopicRepository topicRepository, SpaceService spaceService) {
        this.noteRepository = noteRepository;
        this.noteContentMapper = noteContentMapper;
        this.topicRepository = topicRepository;
        this.spaceService = spaceService;
    }

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, String userId) {
        spaceService.getOwnedBy(request.spaceId(), UUID.fromString(userId));

        NoteEntity entity = new NoteEntity();
        if (request.topicId() != null) {
            topicRepository.findByTopicIdAndSpaceId(request.topicId(), request.spaceId())
                    .orElseThrow(() -> new NoSuchElementException("The specified topic does is not part of the specified space"));

            entity.setTopicId(request.topicId());
        }

        entity.setTitle(request.title());
        entity.setContent(noteContentMapper.toJsonString(request.content()));
        entity.setSpaceId(request.spaceId());
        entity.setIntro(request.isIntro());

        noteRepository.save(entity);
        return NoteResponse.from(entity, request.content());
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(UUID noteId, String userId) {
        var entity = noteRepository.getByIdAndUserId(noteId, UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        return NoteResponse.from(entity, noteContentMapper.toJsonNode(entity.getContent()));
    }

    @Transactional
    public NoteContentResponse updateContent(UUID noteId, NoteContentRequest request, String userId) {
        var note = noteRepository.getByIdAndUserId(noteId, UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        if (!note.getVersion().equals(request.version()))
            throw new NoteVersionConflictException(note.getVersion(), note.getUpdatedAt());

        note.setContent(noteContentMapper.toJsonString(request.content()));

        noteRepository.saveAndFlush(note);
        return NoteContentResponse.from(note);
    }

    @Transactional
    public void softDelete(UUID noteId, String userId) {
        var note = noteRepository.getByIdAndUserId(noteId, UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        note.setDeletedAt(Instant.now());
    }
}
