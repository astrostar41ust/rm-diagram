package com.rmdiagram.finance;

import com.rmdiagram.exception.BadRequestException;
import com.rmdiagram.exception.NotFoundException;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    private String baseCurrency(Long userId) {
        return settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");
    }

    private String resolveTxCurrency(String requested, Long userId) {
        if (requested != null && currencyService.isSupported(requested)) {
            return requested.toUpperCase();
        }
        return baseCurrency(userId);
    }

    private FinanceDto.TransactionResponse toResponse(Transaction t, Category c, String base) {
        BigDecimal converted = currencyService.convert(t.getAmount(), t.getCurrency(), base);
        return FinanceDto.TransactionResponse.from(t, c, converted, base);
    }

    @Transactional(readOnly = true)
    public List<FinanceDto.CategoryResponse> getCategories(Long userId) {
        return categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .map(FinanceDto.CategoryResponse::from)
                .toList();
    }

    @Transactional
    public FinanceDto.TransactionResponse createTransaction(
            Long userId, FinanceDto.CreateTransactionRequest request) {
        Category category = resolveOwnedCategory(userId, request.categoryId());
        if (category.getType() != request.type()) {
            throw new BadRequestException(
                    "Transaction type does not match category type: " + category.getType());
        }
        Transaction tx = Transaction.builder()
                .userId(userId)
                .categoryId(category.getId())
                .type(request.type())
                .amount(request.amount())
                .currency(resolveTxCurrency(request.currency(), userId))
                .note(request.note())
                .transactionDate(request.transactionDate())
                .build();
        tx = transactionRepository.save(tx);
        log.debug("Created transaction {} for user {}", tx.getId(), userId);
        return toResponse(tx, category, baseCurrency(userId));
    }

    @Transactional
    public FinanceDto.TransactionResponse updateTransaction(
            Long userId, Long id, FinanceDto.UpdateTransactionRequest request) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Category category;
        if (request.categoryId() != null) {
            category = resolveOwnedCategory(userId, request.categoryId());
            tx.setCategoryId(category.getId());
        } else {
            category = categoryRepository.findById(tx.getCategoryId()).orElse(null);
        }
        if (request.type() != null) tx.setType(request.type());
        if (request.amount() != null) tx.setAmount(request.amount());
        if (request.currency() != null && currencyService.isSupported(request.currency())) {
            tx.setCurrency(request.currency().toUpperCase());
        }
        if (request.note() != null) tx.setNote(request.note());
        if (request.transactionDate() != null) tx.setTransactionDate(request.transactionDate());

        if (category != null && tx.getType() != category.getType()) {
            throw new BadRequestException(
                    "Transaction type does not match category type: " + category.getType());
        }

        tx = transactionRepository.save(tx);
        log.debug("Updated transaction {} for user {}", tx.getId(), userId);
        return toResponse(tx, category, baseCurrency(userId));
    }

    @Transactional
    public void deleteTransaction(Long userId, Long id) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));
        transactionRepository.delete(tx);
        log.debug("Deleted transaction {} for user {}", id, userId);
    }

    @Transactional(readOnly = true)
    public Page<FinanceDto.TransactionResponse> getTransactions(
            Long userId, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> txs = (categoryId == null)
                ? transactionRepository.findByUserIdOrderByTransactionDateDesc(userId, pageable)
                : transactionRepository.findByUserIdAndCategoryIdOrderByTransactionDateDesc(
                        userId, categoryId, pageable);

        Map<Long, Category> categoriesById = loadCategories(
                txs.getContent().stream().map(Transaction::getCategoryId).toList());
        String base = baseCurrency(userId);

        return txs.map(t -> toResponse(t, categoriesById.get(t.getCategoryId()), base));
    }

    @Transactional(readOnly = true)
    public List<FinanceDto.MonthlySummary> getMonthlySummary(Long userId, int year) {
        String base = baseCurrency(userId);
        Map<String, BigDecimal[]> byMonth = new java.util.TreeMap<>();
        for (Transaction t : transactionRepository.findInYear(userId, year)) {
            String month = String.format("%d-%02d", t.getTransactionDate().getYear(),
                    t.getTransactionDate().getMonthValue());
            BigDecimal converted = currencyService.convert(t.getAmount(), t.getCurrency(), base);
            BigDecimal[] cell = byMonth.computeIfAbsent(month,
                    k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if (t.getType() == TransactionType.INCOME) {
                cell[0] = cell[0].add(converted);
            } else {
                cell[1] = cell[1].add(converted);
            }
        }
        return byMonth.entrySet().stream()
                .map(e -> new FinanceDto.MonthlySummary(
                        e.getKey(), e.getValue()[0], e.getValue()[1],
                        e.getValue()[0].subtract(e.getValue()[1])))
                .toList();
    }

    private Category resolveOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findById(categoryId)
                .filter(c -> c.isDefault() || (c.getUserId() != null && c.getUserId().equals(userId)))
                .orElseThrow(() -> new NotFoundException("Category not found: " + categoryId));
    }

    private Map<Long, Category> loadCategories(List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        Map<Long, Category> map = new HashMap<>();
        for (Category c : categoryRepository.findAllById(Set.copyOf(ids))) {
            map.put(c.getId(), c);
        }
        return map;
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(value.toString());
    }
}
