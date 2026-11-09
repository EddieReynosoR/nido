package com.nido.nido_backend.note.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RenameNoteRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsABlankTitle() {
        var violations = validator.validate(new RenameNoteRequest("   ", 1L, null));

        assertEquals(1, violations.size());
        assertEquals("title", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void rejectsATitleLongerThan150Characters() {
        var violations = validator.validate(new RenameNoteRequest("a".repeat(151), 1L, null));

        assertEquals(1, violations.size());
        assertEquals("title", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void acceptsATitleOf150Characters() {
        var violations = validator.validate(new RenameNoteRequest("a".repeat(150), 1L, null));

        assertTrue(violations.isEmpty());
    }
}
