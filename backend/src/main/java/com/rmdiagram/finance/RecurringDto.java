package com.rmdiagram.finance;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

public final class RecurringDto {

    private RecurringDto() {}

    public record CreateRequest(
            @NotNull Long categoryId,
            @NotNull TransactionType type,
            @NotNull @Positive BigDecimal amount,
            @Size(max = 10) String currency,
            @Size(max = 500) String note,
            @NotNull RecurrenceFrequency frequency,
            @Min(1) @Max(31) Integer dayOfMonth,
            DayOfWeek dayOfWeek,
            @NotNull LocalDate nextRunDate,
            LocalDate endDate
    ) {}

    public record UpdateRequest(
            Long categoryId,
            TransactionType type,
            @Positive BigDecimal amount,
            @Size(max = 10) String currency,
            @Size(max = 500) String note,
            RecurrenceFrequency frequency,
            @Min(1) @Max(31) Integer dayOfMonth,
            DayOfWeek dayOfWeek,
            LocalDate nextRunDate,
            LocalDate endDate,
            Boolean active
    ) {}

    public record Response(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryIcon,
            String categoryColor,
            TransactionType type,
            BigDecimal amount,
            String currency,
            String note,
            RecurrenceFrequency frequency,
            Integer dayOfMonth,
            DayOfWeek dayOfWeek,
            LocalDate nextRunDate,
            LocalDate endDate,
            boolean active
    ) {
        public static Response from(RecurringTransaction r, Category c) {
            return new Response(
                    r.getId(),
                    r.getCategoryId(),
                    c != null ? c.getName() : null,
                    c != null ? c.getIcon() : null,
                    c != null ? c.getColor() : null,
                    r.getType(),
                    r.getAmount(),
                    r.getCurrency(),
                    r.getNote(),
                    r.getFrequency(),
                    r.getDayOfMonth(),
                    r.getDayOfWeek(),
                    r.getNextRunDate(),
                    r.getEndDate(),
                    r.isActive()
            );
        }
    }
}
