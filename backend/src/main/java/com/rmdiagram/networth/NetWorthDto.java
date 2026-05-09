package com.rmdiagram.networth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class NetWorthDto {

    private NetWorthDto() {}

    public record CreateAccountRequest(
            @NotBlank @Size(max = 100) String name,
            @NotNull AccountType type,
            @Size(max = 10) String currency,
            BigDecimal balance) {}

    public record UpdateAccountRequest(
            @Size(max = 100) String name,
            AccountType type,
            @Size(max = 10) String currency,
            BigDecimal balance,
            Boolean archived) {}

    public record AccountResponse(
            Long id,
            String name,
            AccountType type,
            String currency,
            BigDecimal balance,
            BigDecimal balanceInBase,
            String baseCurrency,
            boolean archived) {
        public static AccountResponse from(
                Account a, BigDecimal converted, String baseCurrency) {
            return new AccountResponse(
                    a.getId(), a.getName(), a.getType(), a.getCurrency(),
                    a.getBalance(), converted, baseCurrency, a.isArchived());
        }
    }

    public record SnapshotResponse(
            LocalDate snapshotOn,
            String baseCurrency,
            BigDecimal assets,
            BigDecimal liabilities,
            BigDecimal netWorth) {
        public static SnapshotResponse from(NetWorthSnapshot s) {
            return new SnapshotResponse(
                    s.getSnapshotOn(), s.getBaseCurrency(),
                    s.getAssets(), s.getLiabilities(), s.getNetWorth());
        }
    }

    public record OverviewResponse(
            String baseCurrency,
            BigDecimal assets,
            BigDecimal liabilities,
            BigDecimal netWorth,
            List<AccountResponse> accounts,
            List<SnapshotResponse> history) {}
}
