package com.rmdiagram.note;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class NoteDto {

    private NoteDto() {
    }

    public record CreateRequest(
            @NotBlank String title,
            @NotBlank String content,
            Mood mood,
            String tags) {
    }

    public record UpdateRequest(
            String title,
            String content,
            Mood mood,
            String tags) {
    }

    public record Response(
            Long id,
            String title,
            String content,
            Mood mood,
            String tags,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        public static Response from(Note note) {
            return new Response(
                    note.getId(),
                    note.getTitle(),
                    note.getContent(),
                    note.getMood(),
                    note.getTags(),
                    note.getCreatedAt(),
                    note.getUpdatedAt());
        }

    }
}