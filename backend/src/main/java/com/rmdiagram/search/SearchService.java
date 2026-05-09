package com.rmdiagram.search;

import com.rmdiagram.finance.Category;
import com.rmdiagram.finance.CategoryRepository;
import com.rmdiagram.finance.Transaction;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.note.Note;
import com.rmdiagram.note.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SearchService {

    private static final int LIMIT_PER_TYPE = 5;

    private final HabitRepository habitRepository;
    private final NoteRepository noteRepository;
    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public SearchDto.Response search(Long userId, String query) {
        if (query == null || query.isBlank()) {
            return new SearchDto.Response(0, List.of());
        }
        String q = query.trim().toLowerCase(Locale.ROOT);
        List<SearchDto.Result> results = new ArrayList<>();

        habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId).stream()
                .filter(h -> contains(h.getName(), q))
                .limit(LIMIT_PER_TYPE)
                .map(this::habitResult)
                .forEach(results::add);

        noteRepository.searchNotesByTitleOrContent(userId, q,
                        PageRequest.of(0, LIMIT_PER_TYPE))
                .getContent().stream()
                .map(this::noteResult)
                .forEach(results::add);

        transactionRepository.findByUserIdOrderByTransactionDateDesc(userId,
                        PageRequest.of(0, 200))
                .getContent().stream()
                .filter(t -> contains(t.getNote(), q))
                .limit(LIMIT_PER_TYPE)
                .map(this::transactionResult)
                .forEach(results::add);

        goalRepository.findByUserIdOrderBySortOrderAsc(userId).stream()
                .filter(g -> contains(g.getTitle(), q) || contains(g.getDescription(), q))
                .limit(LIMIT_PER_TYPE)
                .map(this::goalResult)
                .forEach(results::add);

        categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .filter(c -> contains(c.getName(), q))
                .limit(LIMIT_PER_TYPE)
                .map(this::categoryResult)
                .forEach(results::add);

        return new SearchDto.Response(results.size(), results);
    }

    private SearchDto.Result habitResult(Habit h) {
        return new SearchDto.Result(
                "habit-" + h.getId(),
                SearchDto.Kind.HABIT,
                h.getName(),
                h.getFrequencyType().name().toLowerCase().replace('_', ' '),
                "/habits");
    }

    private SearchDto.Result noteResult(Note n) {
        String preview = n.getContent() == null ? null
                : n.getContent().substring(0, Math.min(80, n.getContent().length()));
        return new SearchDto.Result(
                "note-" + n.getId(),
                SearchDto.Kind.NOTE,
                n.getTitle(),
                preview,
                "/notes");
    }

    private SearchDto.Result transactionResult(Transaction t) {
        Category c = categoryRepository.findById(t.getCategoryId()).orElse(null);
        return new SearchDto.Result(
                "tx-" + t.getId(),
                SearchDto.Kind.TRANSACTION,
                t.getNote() != null ? t.getNote() : "Transaction",
                (c != null ? c.getName() : "")
                        + " · " + t.getAmount() + " " + t.getCurrency()
                        + " · " + t.getTransactionDate(),
                "/finance/transactions");
    }

    private SearchDto.Result goalResult(Goal g) {
        return new SearchDto.Result(
                "goal-" + g.getId(),
                SearchDto.Kind.GOAL,
                g.getTitle(),
                g.getStatus().name().toLowerCase(),
                "/goals");
    }

    private SearchDto.Result categoryResult(Category c) {
        return new SearchDto.Result(
                "cat-" + c.getId(),
                SearchDto.Kind.CATEGORY,
                c.getName(),
                c.getType().name().toLowerCase(),
                "/finance");
    }

    private static boolean contains(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase(Locale.ROOT).contains(needle);
    }
}
