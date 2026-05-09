package com.rmdiagram.dataio;

import com.rmdiagram.finance.*;
import com.rmdiagram.goal.*;
import com.rmdiagram.habit.Habit;
import com.rmdiagram.habit.HabitCompletion;
import com.rmdiagram.habit.HabitCompletionRepository;
import com.rmdiagram.habit.HabitRepository;
import com.rmdiagram.note.Note;
import com.rmdiagram.note.NoteRepository;
import com.rmdiagram.settings.Settings;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataIoService {

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final NoteRepository noteRepository;
    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final SettingsRepository settingsRepository;

    @Transactional(readOnly = true)
    public DataIoDto.ExportPayload export(Long userId) {
        Settings settings = settingsRepository.findByUserId(userId).orElse(null);

        List<Category> userCategories = categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .filter(c -> !c.isDefault())
                .toList();

        List<Habit> habits = habitRepository.findByUserIdAndArchivedFalseOrderByCreatedAtAsc(userId);
        Map<Long, List<LocalDate>> completionsByHabit = new HashMap<>();
        for (Habit h : habits) {
            completionsByHabit.put(h.getId(),
                    habitCompletionRepository.findCompletionDatesSince(h.getId(), LocalDate.of(2000, 1, 1)));
        }

        Map<Long, String> categoryNames = new HashMap<>();
        for (Category c : categoryRepository.findByUserIdOrIsDefaultTrue(userId)) {
            categoryNames.put(c.getId(), c.getName());
        }

        List<Transaction> transactions = transactionRepository
                .findByUserIdOrderByTransactionDateDesc(userId,
                        org.springframework.data.domain.PageRequest.of(0, 10_000))
                .getContent();

        List<Budget> budgets = budgetRepository.findByUserIdOrderByCreatedAtAsc(userId);
        List<RecurringTransaction> recurring = recurringRepository.findByUserIdOrderByCreatedAtAsc(userId);

        List<Note> notes = noteRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(
                userId, org.springframework.data.domain.PageRequest.of(0, 100_000)).getContent();

        List<Goal> goals = goalRepository.findByUserIdOrderBySortOrderAsc(userId);

        return new DataIoDto.ExportPayload(
                "1",
                LocalDateTime.now().toString(),
                settings == null ? null
                        : new DataIoDto.SettingsItem(settings.getCurrency(),
                                settings.getMonthlyBudget(), settings.getTheme()),
                userCategories.stream()
                        .map(c -> new DataIoDto.CategoryItem(c.getName(), c.getIcon(), c.getColor(), c.getType()))
                        .toList(),
                habits.stream()
                        .map(h -> new DataIoDto.HabitItem(
                                h.getName(), h.getIcon(), h.getColor(),
                                h.getFrequencyType(), h.getScheduleDays(),
                                h.getReminderEnabled(), h.getReminderTime(),
                                completionsByHabit.getOrDefault(h.getId(), List.of())))
                        .toList(),
                transactions.stream()
                        .map(t -> new DataIoDto.TransactionItem(
                                categoryNames.get(t.getCategoryId()),
                                t.getType(), t.getAmount(), t.getCurrency(),
                                t.getNote(), t.getTransactionDate()))
                        .toList(),
                budgets.stream()
                        .map(b -> new DataIoDto.BudgetItem(
                                categoryNames.get(b.getCategoryId()),
                                b.getMonthlyLimit(), b.getAlertThreshold()))
                        .toList(),
                recurring.stream()
                        .map(r -> new DataIoDto.RecurringItem(
                                categoryNames.get(r.getCategoryId()),
                                r.getType(), r.getAmount(), r.getCurrency(), r.getNote(),
                                r.getFrequency(), r.getDayOfMonth(), r.getDayOfWeek(),
                                r.getNextRunDate(), r.getEndDate(), r.isActive()))
                        .toList(),
                notes.stream()
                        .map(n -> new DataIoDto.NoteItem(
                                n.getTitle(), n.getContent(), n.getMood(), n.getTags(),
                                n.getCreatedAt().toLocalDate()))
                        .toList(),
                goals.stream()
                        .map(g -> new DataIoDto.GoalItem(
                                g.getTitle(), g.getDescription(), g.getStatus(),
                                g.getTargetDate(), g.getLinkType(), g.getTargetValue(),
                                milestoneRepository.findByGoalIdOrderBySortOrderAsc(g.getId()).stream()
                                        .map(m -> new DataIoDto.MilestoneItem(m.getTitle(), m.isCompleted()))
                                        .toList()))
                        .toList()
        );
    }

    @Transactional
    public DataIoDto.ImportSummary importData(Long userId, DataIoDto.ExportPayload payload) {
        int catCount = 0, habitCount = 0, txCount = 0, budgetCount = 0;
        int recurCount = 0, noteCount = 0, goalCount = 0;

        if (payload.settings() != null) {
            Settings s = settingsRepository.findByUserId(userId)
                    .orElseGet(() -> Settings.builder().userId(userId).build());
            if (payload.settings().currency() != null) s.setCurrency(payload.settings().currency());
            if (payload.settings().monthlyBudget() != null) s.setMonthlyBudget(payload.settings().monthlyBudget());
            if (payload.settings().theme() != null) s.setTheme(payload.settings().theme());
            settingsRepository.save(s);
        }

        Map<String, Long> categoryIdByName = new HashMap<>();
        for (Category c : categoryRepository.findByUserIdOrIsDefaultTrue(userId)) {
            categoryIdByName.put(c.getName().toLowerCase(), c.getId());
        }

        if (payload.categories() != null) {
            for (DataIoDto.CategoryItem item : payload.categories()) {
                if (categoryIdByName.containsKey(item.name().toLowerCase())) continue;
                Category c = categoryRepository.save(Category.builder()
                        .userId(userId)
                        .name(item.name())
                        .icon(item.icon())
                        .color(item.color())
                        .type(item.type())
                        .isDefault(false)
                        .build());
                categoryIdByName.put(c.getName().toLowerCase(), c.getId());
                catCount++;
            }
        }

        if (payload.habits() != null) {
            for (DataIoDto.HabitItem item : payload.habits()) {
                Habit h = habitRepository.save(Habit.builder()
                        .userId(userId)
                        .name(item.name())
                        .icon(item.icon())
                        .color(item.color())
                        .frequencyType(item.frequencyType())
                        .scheduleDays(item.scheduleDays())
                        .reminderEnabled(Boolean.TRUE.equals(item.reminderEnabled()))
                        .reminderTime(item.reminderTime())
                        .build());
                if (item.completions() != null) {
                    for (LocalDate d : item.completions()) {
                        habitCompletionRepository.save(HabitCompletion.builder()
                                .habitId(h.getId())
                                .completedDate(d)
                                .build());
                    }
                }
                habitCount++;
            }
        }

        if (payload.transactions() != null) {
            for (DataIoDto.TransactionItem item : payload.transactions()) {
                Long categoryId = item.categoryName() == null
                        ? null : categoryIdByName.get(item.categoryName().toLowerCase());
                if (categoryId == null) continue;
                transactionRepository.save(Transaction.builder()
                        .userId(userId)
                        .categoryId(categoryId)
                        .type(item.type())
                        .amount(item.amount())
                        .currency(item.currency() != null ? item.currency() : "THB")
                        .note(item.note())
                        .transactionDate(item.transactionDate())
                        .build());
                txCount++;
            }
        }

        if (payload.budgets() != null) {
            for (DataIoDto.BudgetItem item : payload.budgets()) {
                Long categoryId = item.categoryName() == null
                        ? null : categoryIdByName.get(item.categoryName().toLowerCase());
                if (categoryId == null) continue;
                if (budgetRepository.findByUserIdAndCategoryId(userId, categoryId).isPresent()) continue;
                budgetRepository.save(Budget.builder()
                        .userId(userId)
                        .categoryId(categoryId)
                        .monthlyLimit(item.monthlyLimit())
                        .alertThreshold(item.alertThreshold() == 0 ? 80 : item.alertThreshold())
                        .build());
                budgetCount++;
            }
        }

        if (payload.recurring() != null) {
            for (DataIoDto.RecurringItem item : payload.recurring()) {
                Long categoryId = item.categoryName() == null
                        ? null : categoryIdByName.get(item.categoryName().toLowerCase());
                if (categoryId == null) continue;
                recurringRepository.save(RecurringTransaction.builder()
                        .userId(userId)
                        .categoryId(categoryId)
                        .type(item.type())
                        .amount(item.amount())
                        .currency(item.currency() != null ? item.currency() : "THB")
                        .note(item.note())
                        .frequency(item.frequency())
                        .dayOfMonth(item.dayOfMonth())
                        .dayOfWeek(item.dayOfWeek())
                        .nextRunDate(item.nextRunDate())
                        .endDate(item.endDate())
                        .active(item.active())
                        .build());
                recurCount++;
            }
        }

        if (payload.notes() != null) {
            for (DataIoDto.NoteItem item : payload.notes()) {
                noteRepository.save(Note.builder()
                        .userId(userId)
                        .title(item.title())
                        .content(item.content())
                        .mood(item.mood())
                        .tags(item.tags())
                        .deleted(false)
                        .build());
                noteCount++;
            }
        }

        if (payload.goals() != null) {
            for (DataIoDto.GoalItem item : payload.goals()) {
                Goal g = goalRepository.save(Goal.builder()
                        .userId(userId)
                        .title(item.title())
                        .description(item.description())
                        .status(item.status() != null ? item.status() : GoalStatus.ACTIVE)
                        .targetDate(item.targetDate())
                        .linkType(item.linkType() != null ? item.linkType() : GoalLinkType.NONE)
                        .targetValue(item.targetValue() != null ? item.targetValue() : BigDecimal.ZERO)
                        .build());
                if (item.milestones() != null) {
                    int sort = 0;
                    for (DataIoDto.MilestoneItem m : item.milestones()) {
                        milestoneRepository.save(Milestone.builder()
                                .goalId(g.getId())
                                .title(m.title())
                                .completed(m.completed())
                                .sortOrder(sort++)
                                .build());
                    }
                }
                goalCount++;
            }
        }

        log.info("Import summary for user {}: cat={}, habits={}, tx={}, budgets={}, recurring={}, notes={}, goals={}",
                userId, catCount, habitCount, txCount, budgetCount, recurCount, noteCount, goalCount);
        return new DataIoDto.ImportSummary(
                catCount, habitCount, txCount, budgetCount, recurCount, noteCount, goalCount);
    }
}
