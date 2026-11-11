package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.*;
import com.nido.nido_backend.note.exception.NoteVersionConflictException;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import com.nido.nido_backend.shared.util.UniqueNames;
import com.nido.nido_backend.spaces.SpaceRepository;
import com.nido.nido_backend.topic.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private static final int MAX_TITLE_LENGTH = 150;

    private final NoteRepository noteRepository;
    private final NoteContentMapper noteContentMapper;
    private final TopicRepository topicRepository;
    private final SpaceRepository spaceRepository;

    public NoteService(NoteRepository noteRepository, NoteContentMapper noteContentMapper, TopicRepository topicRepository, SpaceRepository spaceRepository) {
        this.noteRepository = noteRepository;
        this.noteContentMapper = noteContentMapper;
        this.topicRepository = topicRepository;
        this.spaceRepository = spaceRepository;
    }

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, String userId) {
        spaceRepository.findBySpaceIdAndUserIdAndDeletedAtIsNull(request.spaceId(), UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Space not found"));

        if (request.isIntro() && request.topicId() == null)
            throw new IllegalArgumentException("An intro note must belong to a topic");

        NoteEntity entity = new NoteEntity();
        if (request.topicId() != null) {
            topicRepository.findByTopicIdAndSpaceId(request.topicId(), request.spaceId())
                    .orElseThrow(() -> new NoSuchElementException("The specified topic is not part of the specified space"));

            entity.setTopicId(request.topicId());
        }

        entity.setTitle(!request.isIntro() ?
                resolveUniqueTitle(request.title(), request.spaceId(), request.topicId(), null) :
                request.title());
        entity.setContent(noteContentMapper.toJsonString(request.content()));
        entity.setSpaceId(request.spaceId());
        entity.setIntro(request.isIntro());

        noteRepository.save(entity);
        return NoteResponse.from(entity, request.content());
    }

    private String resolveUniqueTitle(String name, UUID spaceId, UUID topicId, UUID noteId) {
        return UniqueNames.resolve(name, MAX_TITLE_LENGTH, prefix -> topicId == null
                ? noteRepository.findRootTitlesStartingWith(prefix, spaceId, noteId)
                : noteRepository.findByTopicTitlesStartingWith(prefix, spaceId, topicId, noteId));
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

    @Transactional
    public void softDeleteByTopics(List<UUID> topicIds) {
        var deletedAt = Instant.now();
        noteRepository.softDeleteByTopicIds(topicIds, deletedAt);
    }

    @Transactional(readOnly = true)
    public Map<UUID, UUID> getIntroNotes(List<UUID> topicIds) {
        return noteRepository.findIntroNotesByTopicIds(topicIds).stream()
                .collect(Collectors.toMap(TopicNoteIdDto::topicId, TopicNoteIdDto::noteId));
    }

    @Transactional(readOnly = true)
    public GetNotesResponse getNotesFromSpace(UUID spaceId) {
        var notes = noteRepository.findNotesBySpaceId(spaceId);

        List<NoteTreeResponse> notesInRoot = notes
                .stream().filter(n -> n.getTopicId() == null)
                .map(NoteTreeResponse::from)
                .toList();

        Map<UUID, List<NoteTreeResponse>> notesInTopic = notes
                .stream().filter(n -> n.getTopicId() != null)
                .collect(Collectors.groupingBy(
                        NoteEntity::getTopicId,
                        Collectors.mapping(NoteTreeResponse::from, Collectors.toList())));

        return new GetNotesResponse(notesInRoot, notesInTopic);
    }

    @Transactional
    public RenameNoteResponse renameNote(UUID noteId, RenameNoteRequest request, String userId) {
        var note = noteRepository.getByIdAndUserId(noteId, UUID.fromString(userId))
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        if (!Objects.equals(note.getVersion(), request.version()))
            throw new NoteVersionConflictException(note.getVersion(), note.getUpdatedAt());

        if (note.isIntro())
            throw new IllegalArgumentException("An intro note can be only renamed by its topic");

        note.setTitle(resolveUniqueTitle(request.title(), note.getSpaceId(), note.getTopicId(), noteId));
        noteRepository.saveAndFlush(note);

        return new RenameNoteResponse(note.getTitle(), note.getVersion(), note.getUpdatedAt());
    }

    @Transactional
    public MoveNoteResponse moveNote(UUID noteId, MoveNoteRequest request, String userId) {
        UUID userIdConverted = UUID.fromString(userId);
        var topic = topicRepository.getByIdAndUserId(request.topicId(), userIdConverted)
                .orElseThrow(() -> new NoSuchElementException("Topic not found"));

        var note = noteRepository.getByIdAndUserId(noteId, userIdConverted)
                .orElseThrow(() -> new NoSuchElementException("Note not found"));

        if (note.getTopicId() == request.topicId())
            throw new IllegalArgumentException("Cannot assign the same topic value");

        UUID topicId = topic.getTopicId();
        note.setTitle(resolveUniqueTitle(note.getTitle(), note.getSpaceId(), topicId, note.getNoteId()));
        note.setTopicId(topicId);
        noteRepository.saveAndFlush(note);

        return new MoveNoteResponse(note.getTitle(), note.getVersion());
    }
}
