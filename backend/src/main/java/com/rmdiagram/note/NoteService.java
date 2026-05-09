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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {

    private static final int MIN_DAYS = 7;
    private static final int MAX_DAYS = 365;

    private final NoteRepository noteRepository;

    @Transactional
    public NoteDto.Response createNote(Long userId, NoteDto.CreateRequest request) {
        Note note = Note.builder()
                .userId(userId)
                .title(request.title())
                .content(request.content())
                .mood(request.mood())
                .tags(request.tags())
                .noteDate(request.noteDate() != null ? request.noteDate() : LocalDate.now())
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
        if (request.noteDate() != null) {
            note.setNoteDate(request.noteDate());
        }

        note = noteRepository.save(note);
        log.debug("Updated note {} for user {}", note.getId(), userId);
        return NoteDto.Response.from(note);
    }

    @Transactional(readOnly = true)
    public Page<NoteDto.Response> getNotes(Long userId, int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Note> notes = (keyword == null || keyword.isBlank())
                ? noteRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId, pageable)
                : noteRepository.searchNotesByTitleOrContent(userId, keyword.trim(), pageable);
        return notes.map(NoteDto.Response::from);
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

    @Transactional(readOnly = true)
    public NoteDto.MoodTrendResponse getMoodTrend(Long userId, int days) {
        int window = Math.max(MIN_DAYS, Math.min(MAX_DAYS, days));
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(window - 1L);

        List<Object[]> rows = noteRepository.findMoodEntriesSince(userId, start);

        Map<LocalDate, Mood> latestByDay = new LinkedHashMap<>();
        Map<LocalDate, Integer> countByDay = new LinkedHashMap<>();
        long scoreSum = 0;
        int scoreEntries = 0;

        for (Object[] row : rows) {
            LocalDate day = (LocalDate) row[0];
            Mood mood = (Mood) row[1];
            // Rows are ordered ASC by noteDate then createdAt, so the last
            // assignment per day is the most recent entry for that day.
            latestByDay.put(day, mood);
            countByDay.merge(day, 1, Integer::sum);
            scoreSum += score(mood);
            scoreEntries += 1;
        }

        List<NoteDto.MoodPoint> points = new ArrayList<>(latestByDay.size());
        for (Map.Entry<LocalDate, Mood> entry : latestByDay.entrySet()) {
            points.add(new NoteDto.MoodPoint(
                    entry.getKey(),
                    entry.getValue(),
                    countByDay.getOrDefault(entry.getKey(), 0)));
        }

        double avg = scoreEntries == 0 ? 0d : (double) scoreSum / scoreEntries;
        return new NoteDto.MoodTrendResponse(window, scoreEntries, avg, points);
    }

    private static int score(Mood mood) {
        return switch (mood) {
            case GREAT -> 4;
            case GOOD -> 3;
            case OKAY -> 2;
            case BAD -> 1;
        };
    }
}
