package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.CreateNoteRequest;
import com.nido.nido_backend.note.dto.NoteResponse;
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
}
