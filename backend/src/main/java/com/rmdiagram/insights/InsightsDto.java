package com.rmdiagram.insights;

import com.rmdiagram.note.Mood;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class InsightsDto {

    private InsightsDto() {}

    public record CategoryTotal(String name, String icon, String color, BigDecimal total) {}

    public record HabitCompletionRate(Long id, String name, int completed, int scheduled, double rate) {}

    public record DailyMood(LocalDate date, Mood mood) {}

    public record GoalVelocity(Long id, String title, int progress, int daysActive) {}

    public record InsightsResponse(
            String baseCurrency,
            BigDecimal monthIncome,
            BigDecimal monthExpense,
            BigDecimal monthNet,
            List<CategoryTotal> topExpenseCategories,
            List<HabitCompletionRate> habitCompletionRates,
            Map<String, Integer> moodCounts,
            List<DailyMood> moodHistory,
            List<GoalVelocity> goalVelocities) {}
}
