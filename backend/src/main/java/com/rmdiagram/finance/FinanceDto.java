package com.rmdiagram.finance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class FinanceDto {

    private FinanceDto() {}

    public record CategoryResponse(
            Long id,
            String name,
            String icon,
            String color,
            TransactionType type
    ) {
        public static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getName(), c.getIcon(), c.getColor(), c.getType());
        }
    }

    public record CreateTransactionRequest(
            @NotNull Long categoryId,
            @NotNull TransactionType type,
            @NotNull @Positive BigDecimal amount,
            @Size(max = 10) String currency,
            @Size(max = 500) String note,
            @NotNull LocalDate transactionDate
    ) {}

    public record UpdateTransactionRequest(
            Long categoryId,
            TransactionType type,
            @Positive BigDecimal amount,
            @Size(max = 10) String currency,
            @Size(max = 500) String note,
            LocalDate transactionDate
    ) {}

    public record TransactionResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String categoryIcon,
            String categoryColor,
            TransactionType type,
            BigDecimal amount,
            String currency,
            BigDecimal amountInBase,
            String baseCurrency,
            String note,
            LocalDate transactionDate,
            LocalDateTime createdAt
    ) {
        public static TransactionResponse from(Transaction t, Category c, BigDecimal amountInBase, String baseCurrency) {
            return new TransactionResponse(
                    t.getId(),
                    t.getCategoryId(),
                    c != null ? c.getName() : null,
                    c != null ? c.getIcon() : null,
                    c != null ? c.getColor() : null,
                    t.getType(),
                    t.getAmount(),
                    t.getCurrency(),
                    amountInBase,
                    baseCurrency,
                    t.getNote(),
                    t.getTransactionDate(),
                    t.getCreatedAt()
            );
        }
    }

    public record MonthlySummary(
            String month,
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            BigDecimal net
    ) {}
}
