package com.rmdiagram.note;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteDto.Response> createNote(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NoteDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<Page<NoteDto.Response>> getNotes(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(noteService.getNotes(user.getId(), page, size, q));
    }

    @GetMapping("/mood-trend")
    public ResponseEntity<NoteDto.MoodTrendResponse> getMoodTrend(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(noteService.getMoodTrend(user.getId(), days));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteDto.Response> getNoteById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(user.getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<NoteDto.Response> updateNote(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody NoteDto.UpdateRequest request) {
        return ResponseEntity.ok(noteService.updateNote(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        noteService.deleteNote(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
