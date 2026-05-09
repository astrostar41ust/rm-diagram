package com.rmdiagram.day;

import com.rmdiagram.finance.TransactionType;
import com.rmdiagram.goal.GoalLinkType;
import com.rmdiagram.goal.GoalStatus;
import com.rmdiagram.note.Mood;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class DayDto {

    private DayDto() {}

    public record HabitItem(
            Long id, String name, String icon, String color,
            boolean scheduled, boolean completed) {}

    public record TransactionItem(
            Long id, TransactionType type, BigDecimal amount, String currency,
            BigDecimal amountInBase, String baseCurrency,
            String categoryName, String categoryIcon, String categoryColor,
            String note) {}

    public record NoteItem(
            Long id, String title, String content, Mood mood, String tags) {}

    public record GoalItem(
            Long id, String title, GoalStatus status,
            int progress, GoalLinkType linkType, LocalDate targetDate) {}

    public record DayResponse(
            LocalDate date,
            String baseCurrency,
            java.util.List<HabitItem> habits,
            java.util.List<TransactionItem> transactions,
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            java.util.List<NoteItem> notes,
            java.util.List<GoalItem> activeGoals) {}
}
