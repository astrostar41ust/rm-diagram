package com.rmdiagram.finance;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
public class CurrencyService {

    private static final Map<String, BigDecimal> USD_RATES = Map.ofEntries(
            Map.entry("USD", new BigDecimal("1")),
            Map.entry("EUR", new BigDecimal("0.92")),
            Map.entry("GBP", new BigDecimal("0.79")),
            Map.entry("JPY", new BigDecimal("155.0")),
            Map.entry("THB", new BigDecimal("36.5")),
            Map.entry("SGD", new BigDecimal("1.34")),
            Map.entry("AUD", new BigDecimal("1.51")),
            Map.entry("CAD", new BigDecimal("1.37")),
            Map.entry("CNY", new BigDecimal("7.24")),
            Map.entry("INR", new BigDecimal("83.5")),
            Map.entry("KRW", new BigDecimal("1370.0")),
            Map.entry("HKD", new BigDecimal("7.81"))
    );

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (amount == null) return BigDecimal.ZERO;
        if (from == null) from = "THB";
        if (to == null) to = "THB";
        if (from.equalsIgnoreCase(to)) return amount;
        BigDecimal fromRate = USD_RATES.get(from.toUpperCase());
        BigDecimal toRate = USD_RATES.get(to.toUpperCase());
        if (fromRate == null || toRate == null) return amount;
        BigDecimal usd = amount.divide(fromRate, 6, RoundingMode.HALF_UP);
        return usd.multiply(toRate).setScale(2, RoundingMode.HALF_UP);
    }

    public boolean isSupported(String code) {
        return code != null && USD_RATES.containsKey(code.toUpperCase());
    }
}
