package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.CreateNoteRequest;
import com.nido.nido_backend.note.dto.NoteContentResponse;
import com.nido.nido_backend.note.dto.NoteResponse;
import com.nido.nido_backend.note.dto.NoteContentRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/note")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) { this.noteService = noteService; }

    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponse> get(
            @PathVariable UUID noteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        var response = noteService.getNoteByTopicId(noteId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<NoteResponse> create(
            @Valid @RequestBody CreateNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var response = noteService.createNote(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{noteId}")
    public ResponseEntity<NoteContentResponse> updateContent(
            @PathVariable UUID noteId,
            @Valid @RequestBody NoteContentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var response = noteService.updateContent(noteId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> delete(
            @PathVariable UUID noteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        noteService.softDelete(noteId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
