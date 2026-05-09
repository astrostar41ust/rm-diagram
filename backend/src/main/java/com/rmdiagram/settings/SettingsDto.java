package com.rmdiagram.settings;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class SettingsDto {

    private SettingsDto() {}

    public record UpdateRequest(
            @Size(min = 1, max = 10) String currency,
            @PositiveOrZero BigDecimal monthlyBudget,
            @Size(min = 1, max = 20) String theme
    ) {}

    public record Response(
            Long id,
            String currency,
            BigDecimal monthlyBudget,
            String theme,
            LocalDateTime updatedAt
    ) {
        public static Response from(Settings s) {
            return new Response(
                    s.getId(),
                    s.getCurrency(),
                    s.getMonthlyBudget(),
                    s.getTheme(),
                    s.getUpdatedAt()
            );
        }
    }
}
