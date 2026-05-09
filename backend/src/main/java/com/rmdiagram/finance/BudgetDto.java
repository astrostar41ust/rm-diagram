package com.rmdiagram.finance;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public final class BudgetDto {

    private BudgetDto() {}

    public record CreateRequest(
            @NotNull Long categoryId,
            @NotNull @PositiveOrZero BigDecimal monthlyLimit,
            @Min(1) @Max(100) Integer alertThreshold
    ) {}

    public record UpdateRequest(
            @PositiveOrZero BigDecimal monthlyLimit,
            @Min(1) @Max(100) Integer alertThreshold
    ) {}

    public record Response(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryIcon,
            String categoryColor,
            BigDecimal monthlyLimit,
            BigDecimal currentSpending,
            BigDecimal remaining,
            int percentUsed,
            int alertThreshold,
            String status,
            String baseCurrency
    ) {
        public static Response of(
                Budget budget, Category category, BigDecimal spending, String baseCurrency) {
            BigDecimal limit = budget.getMonthlyLimit();
            BigDecimal remaining = limit.subtract(spending);
            int pct = limit.signum() == 0
                    ? 0
                    : spending.multiply(BigDecimal.valueOf(100))
                            .divide(limit, 0, java.math.RoundingMode.HALF_UP)
                            .intValue();
            String status;
            if (pct >= 100) status = "OVER";
            else if (pct >= budget.getAlertThreshold()) status = "WARNING";
            else status = "OK";
            return new Response(
                    budget.getId(),
                    budget.getCategoryId(),
                    category != null ? category.getName() : null,
                    category != null ? category.getIcon() : null,
                    category != null ? category.getColor() : null,
                    limit,
                    spending,
                    remaining,
                    pct,
                    budget.getAlertThreshold(),
                    status,
                    baseCurrency
            );
        }
    }
}
