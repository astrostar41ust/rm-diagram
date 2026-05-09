package com.rmdiagram.ai;

import com.rmdiagram.finance.Transaction;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.note.Note;
import com.rmdiagram.note.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private static final int WEEK_DAYS = 7;
    private static final int RECENT_NOTES_LIMIT = 10;

    private final OllamaClient ollamaClient;
    private final HabitRepository habitRepository;
    private final NoteRepository noteRepository;
    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;

    @Transactional(readOnly = true)
    public AiDto.GenerateResponse generateWeekSummary(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(WEEK_DAYS);

        List<Habit> habits = habitRepository
                .findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        List<Note> notes = noteRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(
                        userId, PageRequest.of(0, RECENT_NOTES_LIMIT))
                .getContent();
        List<Transaction> transactions = transactionRepository
                .findInRange(userId, weekAgo, today);
        List<Goal> goals = goalRepository.findByUserIdOrderBySortOrderAsc(userId);

        String habitsText = habits.isEmpty()
                ? "(no habits)"
                : habits.stream()
                        .map(h -> "- " + h.getName() + " (" + h.getFrequencyType() + ")")
                        .collect(Collectors.joining("\n"));

        String spendingText = transactions.isEmpty()
                ? "(no transactions this week)"
                : transactions.stream()
                        .map(t -> "- "
                                + (t.getType() == TransactionType.INCOME ? "+" : "-")
                                + t.getAmount() + " THB — " + t.getNote()
                                + " (" + t.getTransactionDate() + ")")
                        .collect(Collectors.joining("\n"));

        String journalText = notes.isEmpty()
                ? "(no recent notes)"
                : notes.stream()
                        .map(n -> "- " + n.getTitle()
                                + (n.getMood() != null ? " [mood: " + n.getMood() + "]" : ""))
                        .collect(Collectors.joining("\n"));

        String goalsText = goals.isEmpty()
                ? "(no active goals)"
                : goals.stream()
                        .map(g -> "- " + g.getTitle() + " (" + g.getStatus() + ")")
                        .collect(Collectors.joining("\n"));

        String prompt = """
                You are a personal life coach analyzing a user's weekly data.

                HABITS:
                %s

                SPENDING:
                %s

                JOURNAL:
                %s

                GOALS:
                %s

                Write a brief 3-sentence encouraging summary.
                Include one specific suggestion for next week.
                Keep it conversational, not formal.
                """.formatted(habitsText, spendingText, journalText, goalsText);

        String response = ollamaClient.generate(prompt);
        return new AiDto.GenerateResponse(response);
    }

    @Transactional(readOnly = true)
    public AiDto.GenerateResponse generatePrompt(Long userId, String prompt) {
        String response = ollamaClient.generate(prompt);
        return new AiDto.GenerateResponse(response);
    }
}
