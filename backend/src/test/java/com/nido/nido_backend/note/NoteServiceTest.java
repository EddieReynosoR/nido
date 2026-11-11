package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.MoveNoteRequest;
import com.nido.nido_backend.note.dto.RenameNoteRequest;
import com.nido.nido_backend.note.exception.NoteVersionConflictException;
import com.nido.nido_backend.shared.util.NoteContentMapper;
import com.nido.nido_backend.spaces.SpaceRepository;
import com.nido.nido_backend.topic.TopicEntity;
import com.nido.nido_backend.topic.TopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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
    void addsTwoInParenthesesWhenAnotherNoteInTheSamePlaceHasExactlyThatTitle() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("Lecture notes"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes (2)", response.title());
    }

    @Test
    void keepsTheRequestedTitleWhenAnotherNoteHasThatTitleWithDifferentCase() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("lecture NOTES"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes", response.title());
    }

    @Test
    void usesTheNextFreeNumberWhenTwoInParenthesesIsAlreadyTaken() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("Lecture notes", "Lecture notes (2)"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes (3)", response.title());
    }

    @Test
    void keepsTheRequestedTitleWhenOnlyTheNoteItselfHasThatTitle() {
        var note = regularNote("algebra");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of());

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Algebra", 1L, topicId), userId.toString());

        assertEquals("Algebra", response.title());
    }

    @Test
    void checksUniquenessInTheNotesRealTopicWhenTheRequestSendsADifferentTopicId() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("Lecture notes"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, UUID.randomUUID()), userId.toString());

        assertEquals("Lecture notes (2)", response.title());
    }

    @Test
    void checksUniquenessInTheNotesRealTopicWhenTheRequestSendsNoTopicId() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(topicId), eq(note.getNoteId())))
                .thenReturn(List.of("Lecture notes"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, null), userId.toString());

        assertEquals("Lecture notes (2)", response.title());
    }

    @Test
    void checksUniquenessAmongRootNotesWhenTheNoteIsInTheRootAndTheRequestSendsATopicId() {
        var note = regularNote("Old title");
        note.setTopicId(null);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findRootTitlesStartingWith(anyString(), eq(spaceId), eq(note.getNoteId())))
                .thenReturn(List.of("Lecture notes"));

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, topicId), userId.toString());

        assertEquals("Lecture notes (2)", response.title());
    }

    @Test
    void acceptsARequestTopicIdThatIsEqualButNotTheSameInstance() {
        var note = regularNote("Old title");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        var equalTopicId = new UUID(topicId.getMostSignificantBits(), topicId.getLeastSignificantBits());

        var response = noteService.renameNote(
                note.getNoteId(), new RenameNoteRequest("Lecture notes", 1L, equalTopicId), userId.toString());

        assertEquals("Lecture notes", response.title());
    }

    @Test
    void rejectsRenamingAnIntroNote() {
        var note = regularNote("Math");
        note.setIntro(true);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));

        assertThrows(IllegalArgumentException.class, () ->
                noteService.renameNote(
                        note.getNoteId(), new RenameNoteRequest("Algebra", 1L, topicId), userId.toString()));

        assertEquals("Math", note.getTitle());
    }

    @Test
    void throwsNotFoundWhenTheNoteDoesNotExistOrDoesNotBelongToTheUser() {
        var noteId = UUID.randomUUID();
        when(noteRepository.getByIdAndUserId(noteId, userId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () ->
                noteService.renameNote(
                        noteId, new RenameNoteRequest("Algebra", 1L, topicId), userId.toString()));
    }

    @Test
    void movesARegularNoteToATopicInTheSameSpaceAndReturnsTheNewTitleAndVersion() {
        var note = regularNote("Algebra");
        var destination = new TopicEntity();
        destination.setTopicId(UUID.randomUUID());
        destination.setSpaceId(spaceId);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(topicRepository.getByIdAndUserId(destination.getTopicId(), userId)).thenReturn(Optional.of(destination));

        var response = noteService.moveNote(
                note.getNoteId(), new MoveNoteRequest(destination.getTopicId()), userId.toString());

        assertEquals("Algebra", response.title());
        assertEquals(1L, response.version());
        assertEquals(destination.getTopicId(), note.getTopicId());
    }

    @Test
    void movesANoteFromATopicToTheSpaceRootWhenTheTopicIdIsEmpty() {
        var note = regularNote("Algebra");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));

        var response = noteService.moveNote(note.getNoteId(), new MoveNoteRequest(null), userId.toString());

        assertEquals("Algebra", response.title());
        assertEquals(1L, response.version());
        assertNull(note.getTopicId());
    }

    @Test
    void keepsTheTitleWhenTheDestinationHasNoNoteWithThatTitle() {
        var note = regularNote("Algebra");
        var destination = new TopicEntity();
        destination.setTopicId(UUID.randomUUID());
        destination.setSpaceId(spaceId);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(topicRepository.getByIdAndUserId(destination.getTopicId(), userId)).thenReturn(Optional.of(destination));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(destination.getTopicId()), eq(note.getNoteId())))
                .thenReturn(List.of("Algebra basics"));

        var response = noteService.moveNote(
                note.getNoteId(), new MoveNoteRequest(destination.getTopicId()), userId.toString());

        assertEquals("Algebra", response.title());
    }

    @Test
    void addsTwoInParenthesesWhenTheDestinationTopicAlreadyHasANoteWithThatTitle() {
        var note = regularNote("Algebra");
        var destination = new TopicEntity();
        destination.setTopicId(UUID.randomUUID());
        destination.setSpaceId(spaceId);
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(topicRepository.getByIdAndUserId(destination.getTopicId(), userId)).thenReturn(Optional.of(destination));
        when(noteRepository.findByTopicTitlesStartingWith(anyString(), eq(spaceId), eq(destination.getTopicId()), eq(note.getNoteId())))
                .thenReturn(List.of("Algebra"));

        var response = noteService.moveNote(
                note.getNoteId(), new MoveNoteRequest(destination.getTopicId()), userId.toString());

        assertEquals("Algebra (2)", response.title());
    }

    @Test
    void addsTwoInParenthesesWhenTheSpaceRootAlreadyHasANoteWithThatTitle() {
        var note = regularNote("Algebra");
        when(noteRepository.getByIdAndUserId(note.getNoteId(), userId)).thenReturn(Optional.of(note));
        when(noteRepository.findRootTitlesStartingWith(anyString(), eq(spaceId), eq(note.getNoteId())))
                .thenReturn(List.of("Algebra"));

        var response = noteService.moveNote(note.getNoteId(), new MoveNoteRequest(null), userId.toString());

        assertEquals("Algebra (2)", response.title());
    }
}
