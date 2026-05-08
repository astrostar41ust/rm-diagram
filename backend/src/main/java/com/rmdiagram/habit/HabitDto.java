package com.rmdiagram.habit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class HabitDto {

    private HabitDto() {}

    public record CreateRequest(
            @NotBlank String name,
            String icon,
            String color,
            @NotNull FrequencyType frequencyType,
            String scheduleDays
    ) {}

    public record UpdateRequest(
            String name,
            String icon,
            String color,
            FrequencyType frequencyType,
            String scheduleDays
    ) {}

    public record Response(
            Long id,
            String name,
            String icon,
            String color,
            FrequencyType frequencyType,
            String scheduleDays,
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
            int streak,
            List<LocalDate> completions
    ) {}
}
