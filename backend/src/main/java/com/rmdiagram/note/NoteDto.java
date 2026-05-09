package com.rmdiagram.note;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class NoteDto {

    private NoteDto() {
    }

    public record CreateRequest(
            @NotBlank String title,
            @NotBlank String content,
            Mood mood,
            String tags,
            LocalDate noteDate) {
    }

    public record UpdateRequest(
            String title,
            String content,
            Mood mood,
            String tags,
            LocalDate noteDate) {
    }

    public record Response(
            Long id,
            String title,
            String content,
            Mood mood,
            String tags,
            LocalDate noteDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        public static Response from(Note note) {
            return new Response(
                    note.getId(),
                    note.getTitle(),
                    note.getContent(),
                    note.getMood(),
                    note.getTags(),
                    note.getNoteDate(),
                    note.getCreatedAt(),
                    note.getUpdatedAt());
        }

    }

    public record MoodPoint(LocalDate date, Mood mood, int count) {
    }

    public record MoodTrendResponse(
            int windowDays,
            int totalEntries,
            double averageScore,
            List<MoodPoint> points) {
    }
}