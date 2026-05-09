package com.rmdiagram.dashboard;

import com.rmdiagram.note.Mood;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class DashboardDto {

    private DashboardDto() {}

    public record HabitSummary(
            int totalHabits,
            int completedToday,
            int bestStreak,
            String bestStreakHabitName
    ) {}

    public record FinanceSummary(
            BigDecimal monthlyIncome,
            BigDecimal monthlyExpense,
            BigDecimal monthlyNet
    ) {}

    public record GoalSummary(
            int totalActive,
            int totalCompleted
    ) {}

    public record NotePreview(
            Long id,
            String title,
            Mood mood,
            LocalDateTime createdAt
    ) {}

    public record DashboardResponse(
            HabitSummary habitSummary,
            FinanceSummary financeSummary,
            GoalSummary goalSummary,
            List<NotePreview> recentNotes
    ) {}
}
