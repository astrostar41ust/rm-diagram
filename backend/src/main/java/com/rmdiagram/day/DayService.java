package com.rmdiagram.day;

import com.rmdiagram.finance.Category;
import com.rmdiagram.finance.CategoryRepository;
import com.rmdiagram.finance.CurrencyService;
import com.rmdiagram.finance.Transaction;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
import com.rmdiagram.goal.GoalStatus;
import com.rmdiagram.habit.FrequencyType;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitCompletionRepository;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.note.Note;
import com.rmdiagram.note.NoteRepository;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DayService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final NoteRepository noteRepository;
    private final GoalRepository goalRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional(readOnly = true)
    public DayDto.DayResponse getDay(Long userId, LocalDate date) {
        String base = settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");

        List<DayDto.HabitItem> habits = buildHabits(userId, date);
        List<Transaction> txEntities = transactionRepository.findInRange(userId, date, date);

        Map<Long, Category> categoriesById = new HashMap<>();
        if (!txEntities.isEmpty()) {
            categoryRepository.findAllById(
                    txEntities.stream().map(Transaction::getCategoryId).distinct().toList())
                    .forEach(c -> categoriesById.put(c.getId(), c));
        }

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        List<DayDto.TransactionItem> transactions = new java.util.ArrayList<>();
        for (Transaction t : txEntities) {
            BigDecimal converted = currencyService.convert(t.getAmount(), t.getCurrency(), base);
            if (t.getType() == TransactionType.INCOME) income = income.add(converted);
            else expense = expense.add(converted);
            Category c = categoriesById.get(t.getCategoryId());
            transactions.add(new DayDto.TransactionItem(
                    t.getId(), t.getType(), t.getAmount(), t.getCurrency(),
                    converted, base,
                    c != null ? c.getName() : null,
                    c != null ? c.getIcon() : null,
                    c != null ? c.getColor() : null,
                    t.getNote()));
        }

        List<DayDto.NoteItem> notes = noteRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId, PageRequest.of(0, 200))
                .getContent().stream()
                .filter(n -> date.equals(n.getNoteDate()))
                .map(n -> new DayDto.NoteItem(
                        n.getId(), n.getTitle(), n.getContent(), n.getMood(), n.getTags()))
                .toList();

        List<DayDto.GoalItem> activeGoals = goalRepository
                .findByUserIdAndStatusOrderBySortOrderAsc(userId, GoalStatus.ACTIVE)
                .stream()
                .map(g -> new DayDto.GoalItem(
                        g.getId(), g.getTitle(), g.getStatus(),
                        0, g.getLinkType(), g.getTargetDate()))
                .toList();

        return new DayDto.DayResponse(
                date, base, habits, transactions, income, expense, notes, activeGoals);
    }

    private List<DayDto.HabitItem> buildHabits(Long userId, LocalDate date) {
        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        if (habits.isEmpty()) return List.of();

        List<Long> ids = habits.stream().map(Habit::getId).toList();
        Set<String> doneKeys = habitCompletionRepository
                .findByHabitIdInAndCompletedDateBetween(ids, date, date).stream()
                .map(c -> c.getHabitId() + "|" + c.getCompletedDate())
                .collect(java.util.stream.Collectors.toSet());

        return habits.stream().map(h -> {
            boolean scheduled = isScheduledOn(h.getFrequencyType(), h.getScheduleDays(), date);
            boolean completed = doneKeys.contains(h.getId() + "|" + date);
            return new DayDto.HabitItem(
                    h.getId(), h.getName(), h.getIcon(), h.getColor(),
                    scheduled, completed);
        }).toList();
    }

    private static boolean isScheduledOn(FrequencyType type, String scheduleDays, LocalDate date) {
        if (type == FrequencyType.DAILY) return true;
        if (type == FrequencyType.SPECIFIC_DAYS && scheduleDays != null) {
            return Arrays.stream(scheduleDays.split(","))
                    .map(String::trim).map(String::toUpperCase)
                    .anyMatch(d -> d.equals(date.getDayOfWeek().name()));
        }
        return false;
    }

    @SuppressWarnings("unused")
    private static Set<DayOfWeek> noOp() { return Set.of(); }
}
