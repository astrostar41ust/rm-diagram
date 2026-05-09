package com.rmdiagram.finance;

import com.rmdiagram.exception.BadRequestException;
import com.rmdiagram.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CurrencyService currencyService;

    @Transactional
    public RecurringDto.Response create(Long userId, RecurringDto.CreateRequest request) {
        Category category = resolveOwnedCategory(userId, request.categoryId());
        if (category.getType() != request.type()) {
            throw new BadRequestException(
                    "Type does not match category type: " + category.getType());
        }
        validateSchedule(request.frequency(), request.dayOfMonth(), request.dayOfWeek());

        String currency = (request.currency() != null && currencyService.isSupported(request.currency()))
                ? request.currency().toUpperCase()
                : "THB";

        RecurringTransaction r = RecurringTransaction.builder()
                .userId(userId)
                .categoryId(category.getId())
                .type(request.type())
                .amount(request.amount())
                .currency(currency)
                .note(request.note())
                .frequency(request.frequency())
                .dayOfMonth(request.dayOfMonth())
                .dayOfWeek(request.dayOfWeek())
                .nextRunDate(request.nextRunDate())
                .endDate(request.endDate())
                .active(true)
                .build();
        r = recurringRepository.save(r);
        log.debug("Created recurring transaction {} for user {}", r.getId(), userId);
        return RecurringDto.Response.from(r, category);
    }

    @Transactional
    public RecurringDto.Response update(Long userId, Long id, RecurringDto.UpdateRequest request) {
        RecurringTransaction r = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Recurring transaction not found"));

        Category category;
        if (request.categoryId() != null) {
            category = resolveOwnedCategory(userId, request.categoryId());
            r.setCategoryId(category.getId());
        } else {
            category = categoryRepository.findById(r.getCategoryId()).orElse(null);
        }
        if (request.type() != null) r.setType(request.type());
        if (request.amount() != null) r.setAmount(request.amount());
        if (request.currency() != null && currencyService.isSupported(request.currency())) {
            r.setCurrency(request.currency().toUpperCase());
        }
        if (request.note() != null) r.setNote(request.note());
        if (request.frequency() != null) r.setFrequency(request.frequency());
        if (request.dayOfMonth() != null) r.setDayOfMonth(request.dayOfMonth());
        if (request.dayOfWeek() != null) r.setDayOfWeek(request.dayOfWeek());
        if (request.nextRunDate() != null) r.setNextRunDate(request.nextRunDate());
        if (request.endDate() != null) r.setEndDate(request.endDate());
        if (request.active() != null) r.setActive(request.active());

        if (category != null && r.getType() != category.getType()) {
            throw new BadRequestException(
                    "Type does not match category type: " + category.getType());
        }
        validateSchedule(r.getFrequency(), r.getDayOfMonth(), r.getDayOfWeek());

        r = recurringRepository.save(r);
        log.debug("Updated recurring transaction {} for user {}", id, userId);
        return RecurringDto.Response.from(r, category);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        RecurringTransaction r = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Recurring transaction not found"));
        recurringRepository.delete(r);
        log.debug("Deleted recurring transaction {} for user {}", id, userId);
    }

    @Transactional(readOnly = true)
    public List<RecurringDto.Response> list(Long userId) {
        return recurringRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(r -> RecurringDto.Response.from(
                        r, categoryRepository.findById(r.getCategoryId()).orElse(null)))
                .toList();
    }

    /**
     * Run every day at 02:00 server time. Posts any recurring transactions
     * whose nextRunDate is on or before today, and advances the schedule.
     * Catches up multiple missed runs per rule (e.g., after a long downtime).
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void runDueRecurring() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> due = recurringRepository
                .findByActiveTrueAndNextRunDateLessThanEqual(today);
        log.info("Recurring scheduler: {} rules due", due.size());
        for (RecurringTransaction r : due) {
            postDueOccurrences(r, today);
        }
    }

    void postDueOccurrences(RecurringTransaction r, LocalDate today) {
        int safety = 0;
        while (r.isActive() && !r.getNextRunDate().isAfter(today) && safety++ < 366) {
            if (r.getEndDate() != null && r.getNextRunDate().isAfter(r.getEndDate())) {
                r.setActive(false);
                break;
            }
            Transaction tx = Transaction.builder()
                    .userId(r.getUserId())
                    .categoryId(r.getCategoryId())
                    .type(r.getType())
                    .amount(r.getAmount())
                    .currency(r.getCurrency())
                    .note(r.getNote())
                    .transactionDate(r.getNextRunDate())
                    .build();
            transactionRepository.save(tx);
            log.debug("Posted recurring tx for rule {} on {}", r.getId(), r.getNextRunDate());
            r.setNextRunDate(advance(r));
        }
        recurringRepository.save(r);
    }

    private LocalDate advance(RecurringTransaction r) {
        LocalDate cur = r.getNextRunDate();
        return switch (r.getFrequency()) {
            case DAILY -> cur.plusDays(1);
            case WEEKLY -> {
                if (r.getDayOfWeek() == null) yield cur.plusWeeks(1);
                LocalDate next = cur.plusDays(1);
                while (next.getDayOfWeek() != r.getDayOfWeek()) next = next.plusDays(1);
                yield next;
            }
            case MONTHLY -> {
                int dom = r.getDayOfMonth() != null ? r.getDayOfMonth() : cur.getDayOfMonth();
                YearMonth nextMonth = YearMonth.from(cur).plusMonths(1);
                int day = Math.min(dom, nextMonth.lengthOfMonth());
                yield nextMonth.atDay(day);
            }
        };
    }

    private void validateSchedule(RecurrenceFrequency frequency, Integer dayOfMonth, DayOfWeek dayOfWeek) {
        if (frequency == RecurrenceFrequency.MONTHLY && dayOfMonth == null) {
            throw new BadRequestException("Monthly recurrence requires dayOfMonth");
        }
        if (frequency == RecurrenceFrequency.WEEKLY && dayOfWeek == null) {
            throw new BadRequestException("Weekly recurrence requires dayOfWeek");
        }
    }

    private Category resolveOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findById(categoryId)
                .filter(c -> c.isDefault() || (c.getUserId() != null && c.getUserId().equals(userId)))
                .orElseThrow(() -> new NotFoundException("Category not found: " + categoryId));
    }
}
