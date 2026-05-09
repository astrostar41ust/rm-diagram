package com.rmdiagram.notification;

import com.rmdiagram.finance.Budget;
import com.rmdiagram.finance.BudgetRepository;
import com.rmdiagram.finance.Category;
import com.rmdiagram.finance.CategoryRepository;
import com.rmdiagram.finance.CurrencyService;
import com.rmdiagram.finance.RecurringTransaction;
import com.rmdiagram.finance.RecurringTransactionRepository;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.goal.Goal;
import com.rmdiagram.goal.GoalRepository;
import com.rmdiagram.goal.GoalStatus;
import com.rmdiagram.habit.FrequencyType;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitCompletionRepository;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final GoalRepository goalRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional(readOnly = true)
    public NotificationDto.Response getNotifications(Long userId) {
        List<NotificationDto.Item> items = new ArrayList<>();
        items.addAll(habitPending(userId));
        items.addAll(budgetThresholds(userId));
        items.addAll(goalsOverdue(userId));
        items.addAll(recurringDue(userId));
        return new NotificationDto.Response(items.size(), items);
    }

    private List<NotificationDto.Item> habitPending(Long userId) {
        LocalDate today = LocalDate.now();
        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        if (habits.isEmpty()) return List.of();
        Set<Long> doneToday = new HashSet<>();
        habitCompletionRepository
                .findByHabitIdInAndCompletedDateBetween(habits.stream().map(Habit::getId).toList(), today, today)
                .forEach(c -> doneToday.add(c.getHabitId()));

        List<NotificationDto.Item> out = new ArrayList<>();
        for (Habit h : habits) {
            if (!Boolean.TRUE.equals(h.getReminderEnabled())) continue;
            if (!isScheduledOn(h.getFrequencyType(), h.getScheduleDays(), today)) continue;
            if (doneToday.contains(h.getId())) continue;
            out.add(new NotificationDto.Item(
                    "habit-" + h.getId(),
                    NotificationDto.Kind.HABIT_PENDING,
                    NotificationDto.Severity.INFO,
                    h.getName(),
                    "Reminder pending for today" + (h.getReminderTime() != null
                            ? " at " + h.getReminderTime() : ""),
                    "/habits"));
        }
        return out;
    }

    private List<NotificationDto.Item> budgetThresholds(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (budgets.isEmpty()) return List.of();
        String base = settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");
        YearMonth ym = YearMonth.now();
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        List<NotificationDto.Item> out = new ArrayList<>();
        for (Budget b : budgets) {
            BigDecimal spent = transactionRepository
                    .findExpensesForCategoryInRange(userId, b.getCategoryId(), from, to)
                    .stream()
                    .map(t -> currencyService.convert(t.getAmount(), t.getCurrency(), base))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal limit = b.getMonthlyLimit();
            if (limit.signum() == 0) continue;
            int pct = spent.multiply(BigDecimal.valueOf(100))
                    .divide(limit, 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
            if (pct < b.getAlertThreshold()) continue;
            Category cat = categoryRepository.findById(b.getCategoryId()).orElse(null);
            String name = cat != null ? cat.getName() : "Budget";
            NotificationDto.Severity sev = pct >= 100
                    ? NotificationDto.Severity.DANGER
                    : NotificationDto.Severity.WARNING;
            out.add(new NotificationDto.Item(
                    "budget-" + b.getId(),
                    NotificationDto.Kind.BUDGET_THRESHOLD,
                    sev,
                    name + " budget at " + pct + "%",
                    spent + " / " + limit + " " + base + " this month",
                    "/finance/budgets"));
        }
        return out;
    }

    private List<NotificationDto.Item> goalsOverdue(Long userId) {
        LocalDate today = LocalDate.now();
        List<Goal> goals = goalRepository.findByUserIdAndStatusOrderBySortOrderAsc(
                userId, GoalStatus.ACTIVE);
        List<NotificationDto.Item> out = new ArrayList<>();
        for (Goal g : goals) {
            if (g.getTargetDate() == null) continue;
            if (g.getTargetDate().isBefore(today)) {
                long days = today.toEpochDay() - g.getTargetDate().toEpochDay();
                out.add(new NotificationDto.Item(
                        "goal-" + g.getId(),
                        NotificationDto.Kind.GOAL_OVERDUE,
                        NotificationDto.Severity.WARNING,
                        g.getTitle() + " is overdue",
                        "Past target by " + days + " day" + (days == 1 ? "" : "s"),
                        "/goals"));
            }
        }
        return out;
    }

    private List<NotificationDto.Item> recurringDue(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate soon = today.plusDays(3);
        List<RecurringTransaction> all = recurringRepository.findByUserIdOrderByCreatedAtAsc(userId);
        List<NotificationDto.Item> out = new ArrayList<>();
        for (RecurringTransaction r : all) {
            if (!r.isActive()) continue;
            if (r.getNextRunDate() == null || r.getNextRunDate().isAfter(soon)) continue;
            Category cat = categoryRepository.findById(r.getCategoryId()).orElse(null);
            String label = (r.getNote() != null && !r.getNote().isBlank())
                    ? r.getNote()
                    : (cat != null ? cat.getName() : "Recurring");
            out.add(new NotificationDto.Item(
                    "recurring-" + r.getId(),
                    NotificationDto.Kind.RECURRING_DUE,
                    NotificationDto.Severity.INFO,
                    label + " — " + r.getAmount() + " " + r.getCurrency(),
                    "Posts on " + r.getNextRunDate(),
                    "/finance/recurring"));
        }
        return out;
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
