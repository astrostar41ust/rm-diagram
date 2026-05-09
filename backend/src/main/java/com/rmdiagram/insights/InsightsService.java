package com.rmdiagram.insights;

import com.rmdiagram.finance.Category;
import com.rmdiagram.finance.CategoryRepository;
import com.rmdiagram.finance.CurrencyService;
import com.rmdiagram.finance.Transaction;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
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
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private static final int TOP_CATEGORIES = 5;
    private static final int MOOD_HISTORY_LIMIT = 60;
    private static final int HABIT_WINDOW_DAYS = 30;

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final NoteRepository noteRepository;
    private final GoalRepository goalRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional(readOnly = true)
    public InsightsDto.InsightsResponse getInsights(Long userId) {
        String base = settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");

        YearMonth ym = YearMonth.now();
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        List<Transaction> monthTx = transactionRepository.findInRange(userId, from, to);

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        Map<Long, BigDecimal> expenseByCategory = new HashMap<>();
        for (Transaction t : monthTx) {
            BigDecimal converted = currencyService.convert(t.getAmount(), t.getCurrency(), base);
            if (t.getType() == TransactionType.INCOME) {
                income = income.add(converted);
            } else {
                expense = expense.add(converted);
                expenseByCategory.merge(t.getCategoryId(), converted, BigDecimal::add);
            }
        }

        Map<Long, Category> categoriesById = new HashMap<>();
        if (!expenseByCategory.isEmpty()) {
            categoryRepository.findAllById(expenseByCategory.keySet())
                    .forEach(c -> categoriesById.put(c.getId(), c));
        }

        List<InsightsDto.CategoryTotal> topCategories = expenseByCategory.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(TOP_CATEGORIES)
                .map(e -> {
                    Category c = categoriesById.get(e.getKey());
                    return new InsightsDto.CategoryTotal(
                            c != null ? c.getName() : "—",
                            c != null ? c.getIcon() : null,
                            c != null ? c.getColor() : null,
                            e.getValue());
                })
                .toList();

        List<InsightsDto.HabitCompletionRate> habitRates = computeHabitRates(userId);

        List<Note> notes = noteRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(
                        userId, PageRequest.of(0, MOOD_HISTORY_LIMIT))
                .getContent();

        Map<String, Integer> moodCounts = new HashMap<>();
        List<InsightsDto.DailyMood> moodHistory = new ArrayList<>();
        for (Note n : notes) {
            if (n.getMood() == null) continue;
            moodCounts.merge(n.getMood().name(), 1, Integer::sum);
            moodHistory.add(new InsightsDto.DailyMood(
                    n.getCreatedAt().toLocalDate(), n.getMood()));
        }

        List<InsightsDto.GoalVelocity> goalVelocities = goalRepository
                .findByUserIdOrderBySortOrderAsc(userId).stream()
                .map(this::velocityFor)
                .sorted(Comparator.comparingInt(InsightsDto.GoalVelocity::progress).reversed())
                .toList();

        return new InsightsDto.InsightsResponse(
                base, income, expense, income.subtract(expense),
                topCategories, habitRates, moodCounts, moodHistory, goalVelocities);
    }

    private List<InsightsDto.HabitCompletionRate> computeHabitRates(Long userId) {
        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        if (habits.isEmpty()) return List.of();
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(HABIT_WINDOW_DAYS - 1L);

        Map<Long, Set<LocalDate>> doneByHabit = habitCompletionRepository
                .findByHabitIdInAndCompletedDateBetween(
                        habits.stream().map(Habit::getId).toList(), from, today)
                .stream()
                .collect(Collectors.groupingBy(
                        c -> c.getHabitId(),
                        Collectors.mapping(c -> c.getCompletedDate(), Collectors.toSet())));

        List<InsightsDto.HabitCompletionRate> out = new ArrayList<>();
        for (Habit h : habits) {
            Set<LocalDate> done = doneByHabit.getOrDefault(h.getId(), Set.of());
            int scheduled = 0;
            int completed = 0;
            for (int i = 0; i < HABIT_WINDOW_DAYS; i++) {
                LocalDate d = from.plusDays(i);
                if (!isScheduledOn(h.getFrequencyType(), h.getScheduleDays(), d)) continue;
                scheduled++;
                if (done.contains(d)) completed++;
            }
            double rate = scheduled == 0 ? 0 : (double) completed / scheduled;
            out.add(new InsightsDto.HabitCompletionRate(
                    h.getId(), h.getName(), completed, scheduled, rate));
        }
        out.sort(Comparator.comparingDouble(InsightsDto.HabitCompletionRate::rate).reversed());
        return out;
    }

    private InsightsDto.GoalVelocity velocityFor(Goal g) {
        long days = Math.max(1,
                LocalDate.now().toEpochDay() - g.getCreatedAt().toLocalDate().toEpochDay());
        return new InsightsDto.GoalVelocity(g.getId(), g.getTitle(), 0, (int) days);
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
