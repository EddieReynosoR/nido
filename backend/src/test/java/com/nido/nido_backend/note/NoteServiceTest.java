package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.RenameNoteRequest;
import com.nido.nido_backend.note.exception.NoteVersionConflictException;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import com.nido.nido_backend.spaces.SpaceRepository;
import com.nido.nido_backend.topic.TopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;
    @Mock
    private NoteContentMapper noteContentMapper;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private SpaceRepository spaceRepository;

    @InjectMocks
    private NoteService noteService;

    private final UUID userId = UUID.randomUUID();
    private final UUID spaceId = UUID.randomUUID();
    private final UUID topicId = UUID.randomUUID();

    private NoteEntity regularNote(String title) {
        var note = new NoteEntity();
        note.setNoteId(UUID.randomUUID());
        note.setTitle(title);
        note.setSpaceId(spaceId);
        note.setTopicId(topicId);
        note.setIntro(false);
        note.setVersion(1L);
        return note;
    }

    @Test
    void renamesARegularNoteToAFreeTitleAndReturnsTheNewTitle() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes", response.title());
        assertEquals(1L, response.version());
    }

    @Test
    void throwsAVersionConflictWhenTheSentVersionIsStale() {
        var note = regularNote("Old title");
        note.setVersion(3L);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));

        var conflict = assertThrows(NoteVersionConflictException.class, () ->
                noteService.renameNote(
                        note.getNoteId(), new RenameNoteRequest("Lecture notes", 2L, topicId), userId.toString()));

        assertEquals(3L, conflict.getCurrentVersion());
        assertEquals("Old title", note.getTitle());
    }

    @Test
    void addsTwoInParenthesesWhenAnotherNoteInTheSamePlaceHasThatTitleIgnoringCase() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("lecture NOTES"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes (2)", response.title());
    }
}
