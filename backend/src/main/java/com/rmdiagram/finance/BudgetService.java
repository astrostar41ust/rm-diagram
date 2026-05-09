package com.rmdiagram.finance;

import com.rmdiagram.exception.BadRequestException;
import com.rmdiagram.exception.NotFoundException;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional
    public BudgetDto.Response createBudget(Long userId, BudgetDto.CreateRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .filter(c -> c.getType() == TransactionType.EXPENSE)
                .filter(c -> c.isDefault() || (c.getUserId() != null && c.getUserId().equals(userId)))
                .orElseThrow(() -> new NotFoundException("Expense category not found: " + request.categoryId()));
        if (budgetRepository.findByUserIdAndCategoryId(userId, category.getId()).isPresent()) {
            throw new BadRequestException("Budget already exists for this category");
        }
        Budget budget = Budget.builder()
                .userId(userId)
                .categoryId(category.getId())
                .monthlyLimit(request.monthlyLimit())
                .alertThreshold(request.alertThreshold() != null ? request.alertThreshold() : 80)
                .build();
        budget = budgetRepository.save(budget);
        log.debug("Created budget {} for user {}", budget.getId(), userId);
        return toResponse(budget, category, userId);
    }

    @Transactional
    public BudgetDto.Response updateBudget(Long userId, Long id, BudgetDto.UpdateRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Budget not found"));
        if (request.monthlyLimit() != null) budget.setMonthlyLimit(request.monthlyLimit());
        if (request.alertThreshold() != null) budget.setAlertThreshold(request.alertThreshold());
        budget = budgetRepository.save(budget);
        Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
        log.debug("Updated budget {} for user {}", id, userId);
        return toResponse(budget, category, userId);
    }

    @Transactional
    public void deleteBudget(Long userId, Long id) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Budget not found"));
        budgetRepository.delete(budget);
        log.debug("Deleted budget {} for user {}", id, userId);
    }

    @Transactional(readOnly = true)
    public List<BudgetDto.Response> getBudgets(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCreatedAtAsc(userId);
        return budgets.stream()
                .map(b -> toResponse(b,
                        categoryRepository.findById(b.getCategoryId()).orElse(null), userId))
                .toList();
    }

    private BudgetDto.Response toResponse(Budget budget, Category category, Long userId) {
        String base = settingsRepository.findByUserId(userId)
                .map(s -> s.getCurrency())
                .orElse("THB");
        YearMonth ym = YearMonth.now();
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        BigDecimal spending = transactionRepository
                .findExpensesForCategoryInRange(userId, budget.getCategoryId(), from, to)
                .stream()
                .map(t -> currencyService.convert(t.getAmount(), t.getCurrency(), base))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return BudgetDto.Response.of(budget, category, spending, base);
    }
}
