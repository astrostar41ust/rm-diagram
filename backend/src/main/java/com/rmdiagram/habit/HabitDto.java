package com.rmdiagram.habit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public final class HabitDto {

    private HabitDto() {}

    public record CreateRequest(
            @NotBlank String name,
            String icon,
            String color,
            @NotNull FrequencyType frequencyType,
            String scheduleDays,
            Boolean reminderEnabled,
            LocalTime reminderTime
    ) {}

    public record UpdateRequest(
            String name,
            String icon,
            String color,
            FrequencyType frequencyType,
            String scheduleDays,
            Boolean reminderEnabled,
            LocalTime reminderTime
    ) {}

    public record Response(
            Long id,
            String name,
            String icon,
            String color,
            FrequencyType frequencyType,
            String scheduleDays,
            Boolean reminderEnabled,
            LocalTime reminderTime,
            Boolean archived,
            LocalDateTime createdAt
    ) {
        public static Response from(Habit habit) {
            return new Response(
                    habit.getId(),
                    habit.getName(),
                    habit.getIcon(),
                    habit.getColor(),
                    habit.getFrequencyType(),
                    habit.getScheduleDays(),
                    habit.getReminderEnabled(),
                    habit.getReminderTime(),
                    habit.getArchived(),
                    habit.getCreatedAt()
            );
        }
    }

    public record GridResponse(
            List<HabitGridItem> habits
    ) {}

    public record HabitGridItem(
            Long id,
            String name,
            String icon,
            String color,
            FrequencyType frequencyType,
            String scheduleDays,
            Boolean reminderEnabled,
            LocalTime reminderTime,
            int streak,
            List<LocalDate> completions
    ) {}

    public record DailyPoint(LocalDate date, boolean completed, boolean scheduled) {}

    public record WeeklyPoint(LocalDate weekStart, int completed, int scheduled) {}

    public record AnalyticsResponse(
            Long habitId,
            String name,
            int windowDays,
            int currentStreak,
            int longestStreak,
            int totalCompletions,
            int totalScheduled,
            double completionRate,
            List<DailyPoint> daily,
            List<WeeklyPoint> weekly
    ) {}
}
