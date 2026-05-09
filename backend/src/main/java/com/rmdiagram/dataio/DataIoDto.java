package com.rmdiagram.dataio;

import com.rmdiagram.finance.RecurrenceFrequency;
import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.GoalLinkType;
import com.rmdiagram.goal.GoalStatus;
import com.rmdiagram.habit.FrequencyType;
import com.rmdiagram.note.Mood;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public final class DataIoDto {

    private DataIoDto() {}

    public record HabitItem(
            String name, String icon, String color,
            FrequencyType frequencyType, String scheduleDays,
            Boolean reminderEnabled, LocalTime reminderTime,
            List<LocalDate> completions
    ) {}

    public record CategoryItem(
            String name, String icon, String color, TransactionType type
    ) {}

    public record TransactionItem(
            String categoryName, TransactionType type,
            BigDecimal amount, String currency, String note,
            LocalDate transactionDate
    ) {}

    public record BudgetItem(
            String categoryName, BigDecimal monthlyLimit, int alertThreshold
    ) {}

    public record RecurringItem(
            String categoryName, TransactionType type,
            BigDecimal amount, String currency, String note,
            RecurrenceFrequency frequency, Integer dayOfMonth, DayOfWeek dayOfWeek,
            LocalDate nextRunDate, LocalDate endDate, boolean active
    ) {}

    public record NoteItem(
            String title, String content, Mood mood, String tags, LocalDate createdDate
    ) {}

    public record MilestoneItem(String title, boolean completed) {}

    public record GoalItem(
            String title, String description, GoalStatus status,
            LocalDate targetDate, GoalLinkType linkType, BigDecimal targetValue,
            List<MilestoneItem> milestones
    ) {}

    public record SettingsItem(String currency, BigDecimal monthlyBudget, String theme) {}

    public record ExportPayload(
            String version,
            String exportedAt,
            SettingsItem settings,
            List<CategoryItem> categories,
            List<HabitItem> habits,
            List<TransactionItem> transactions,
            List<BudgetItem> budgets,
            List<RecurringItem> recurring,
            List<NoteItem> notes,
            List<GoalItem> goals
    ) {}

    public record ImportSummary(
            int categories,
            int habits,
            int transactions,
            int budgets,
            int recurring,
            int notes,
            int goals
    ) {}
}
