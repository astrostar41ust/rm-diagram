package com.rmdiagram.dashboard;

import com.rmdiagram.finance.Transaction;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
import com.rmdiagram.goal.GoalStatus;
import com.rmdiagram.habit.FrequencyType;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitCompletion;
import com.rmdiagram.habit.HabitCompletionRepository;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.note.Note;
import com.rmdiagram.note.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int RECENT_NOTES_LIMIT = 3;
    private static final int STREAK_WINDOW_DAYS = 365;

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final NoteRepository noteRepository;

    @Transactional(readOnly = true)
    public DashboardDto.DashboardResponse getDashboard(Long userId) {
        return new DashboardDto.DashboardResponse(
                buildHabitSummary(userId),
                buildFinanceSummary(userId),
                buildGoalSummary(userId),
                buildRecentNotes(userId)
        );
    }

    private DashboardDto.HabitSummary buildHabitSummary(Long userId) {
        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        if (habits.isEmpty()) {
            return new DashboardDto.HabitSummary(0, 0, 0, null);
        }

        LocalDate today = LocalDate.now();
        LocalDate windowStart = today.minusDays(STREAK_WINDOW_DAYS);
        List<Long> habitIds = habits.stream().map(Habit::getId).toList();

        Map<Long, List<HabitCompletion>> completionsByHabit = habitCompletionRepository
                .findByHabitIdInAndCompletedDateBetween(habitIds, windowStart, today)
                .stream()
                .collect(Collectors.groupingBy(HabitCompletion::getHabitId));

        int completedToday = 0;
        int bestStreak = 0;
        String bestStreakHabitName = null;

        for (Habit habit : habits) {
            List<HabitCompletion> completions = completionsByHabit
                    .getOrDefault(habit.getId(), List.of());
            Set<LocalDate> completedDates = completions.stream()
                    .map(HabitCompletion::getCompletedDate)
                    .collect(Collectors.toSet());

            if (completedDates.contains(today)) {
                completedToday++;
            }

            int streak = calculateStreak(habit.getFrequencyType(), habit.getScheduleDays(),
                    completedDates, today);
            if (streak > bestStreak) {
                bestStreak = streak;
                bestStreakHabitName = habit.getName();
            }
        }

        return new DashboardDto.HabitSummary(habits.size(), completedToday, bestStreak, bestStreakHabitName);
    }

    private DashboardDto.FinanceSummary buildFinanceSummary(Long userId) {
        YearMonth thisMonth = YearMonth.now();
        LocalDate from = thisMonth.atDay(1);
        LocalDate to = thisMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findInRange(userId, from, to);

        BigDecimal income = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expense = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardDto.FinanceSummary(income, expense, income.subtract(expense));
    }

    private DashboardDto.GoalSummary buildGoalSummary(Long userId) {
        List<Goal> goals = goalRepository.findByUserIdOrderBySortOrderAsc(userId);
        int active = 0;
        int completed = 0;
        for (Goal g : goals) {
            if (g.getStatus() == GoalStatus.COMPLETED) completed++;
            else if (g.getStatus() == GoalStatus.ACTIVE) active++;
        }
        return new DashboardDto.GoalSummary(active, completed);
    }

    private List<DashboardDto.NotePreview> buildRecentNotes(Long userId) {
        return noteRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId, PageRequest.of(0, RECENT_NOTES_LIMIT))
                .getContent()
                .stream()
                .map(this::toPreview)
                .toList();
    }

    private DashboardDto.NotePreview toPreview(Note note) {
        return new DashboardDto.NotePreview(
                note.getId(), note.getTitle(), note.getMood(), note.getCreatedAt());
    }

    private int calculateStreak(FrequencyType type, String scheduleDays,
                                Set<LocalDate> completedDates, LocalDate today) {
        Set<DayOfWeek> scheduledDays = parseScheduleDays(type, scheduleDays);
        LocalDate cursor = today;
        int streak = 0;
        for (int i = 0; i < STREAK_WINDOW_DAYS; i++) {
            if (!isScheduledDay(type, scheduledDays, cursor)) {
                cursor = cursor.minusDays(1);
                continue;
            }
            if (completedDates.contains(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    private boolean isScheduledDay(FrequencyType type, Set<DayOfWeek> scheduledDays, LocalDate date) {
        if (type == FrequencyType.DAILY) return true;
        if (type == FrequencyType.SPECIFIC_DAYS) return scheduledDays.contains(date.getDayOfWeek());
        return true;
    }

    private Set<DayOfWeek> parseScheduleDays(FrequencyType type, String scheduleDays) {
        if (type != FrequencyType.SPECIFIC_DAYS || scheduleDays == null || scheduleDays.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(scheduleDays.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toSet());
    }
}
