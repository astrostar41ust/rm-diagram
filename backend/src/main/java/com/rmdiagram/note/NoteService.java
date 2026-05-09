package com.rmdiagram.note;

import com.rmdiagram.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    private final NoteRepository noteRepository;

    @Transactional
    public NoteDto.Response createNote(Long userId, NoteDto.CreateRequest request) {
        Note note = Note.builder()
                .userId(userId)
                .title(request.title())
                .content(request.content())
                .mood(request.mood())
                .tags(request.tags())
                .deleted(false)
                .build();
        note = noteRepository.save(note);
        log.debug("Created note {} for user {}", note.getId(), userId);
        return NoteDto.Response.from(note);
    }

    @Transactional
    public NoteDto.Response updateNote(Long userId, Long id, NoteDto.UpdateRequest request) {
        Note note = findUserNote(userId, id);

        if (request.title() != null) {
            note.setTitle(request.title());
        }
        if (request.content() != null) {
            note.setContent(request.content());
        }
        if (request.mood() != null) {
            note.setMood(request.mood());
        }
        if (request.tags() != null) {
            note.setTags(request.tags());
        }

        note = noteRepository.save(note);
        log.debug("Updated note {} for user {}", note.getId(), userId);
        return NoteDto.Response.from(note);
    }

    @Transactional(readOnly = true)
    public Page<NoteDto.Response> getNotes(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return noteRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId, pageable)
                .map(NoteDto.Response::from);
    }

    @Transactional(readOnly = true)
    public NoteDto.Response getNoteById(Long userId, Long id) {
        return NoteDto.Response.from(findUserNote(userId, id));
    }

    @Transactional
    public void deleteNote(Long userId, Long id) {
        Note note = findUserNote(userId, id);
        note.setDeleted(true);
        noteRepository.save(note);
        log.debug("Deleted note {} for user {}", note.getId(), userId);
    }

    private Note findUserNote(Long userId, Long id) {
        return noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Note not found"));
    }
}
