package com.rmdiagram.goal;

import com.rmdiagram.exception.NotFoundException;
import com.rmdiagram.finance.CategoryRepository;
import com.rmdiagram.finance.CurrencyService;
import com.rmdiagram.finance.TransactionRepository;
import com.rmdiagram.habit.HabitCompletionRepository;
import com.rmdiagram.settings.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final SettingsRepository settingsRepository;
    private final CurrencyService currencyService;

    @Transactional
    public GoalDto.GoalResponse createGoal(Long userId, GoalDto.CreateGoalRequest request) {
        Goal goal = Goal.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .targetDate(request.targetDate())
                .status(GoalStatus.ACTIVE)
                .linkType(request.linkType() != null ? request.linkType() : GoalLinkType.NONE)
                .linkTargetId(request.linkTargetId())
                .targetValue(request.targetValue())
                .build();
        goal = goalRepository.save(goal);

        List<Milestone> milestones = new ArrayList<>();
        if (request.milestones() != null) {
            int sortOrder = 0;
            for (GoalDto.CreateMilestoneRequest m : request.milestones()) {
                milestones.add(milestoneRepository.save(Milestone.builder()
                        .goalId(goal.getId())
                        .title(m.title())
                        .sortOrder(sortOrder++)
                        .build()));
            }
        }
        log.debug("Created goal {} with {} milestones for user {}",
                goal.getId(), milestones.size(), userId);
        return toResponse(goal, milestones);
    }

    @Transactional
    public GoalDto.GoalResponse updateGoal(Long userId, Long goalId, GoalDto.UpdateGoalRequest request) {
        Goal goal = findUserGoal(userId, goalId);
        if (request.title() != null) goal.setTitle(request.title());
        if (request.description() != null) goal.setDescription(request.description());
        if (request.targetDate() != null) goal.setTargetDate(request.targetDate());
        if (request.status() != null) goal.setStatus(request.status());
        if (request.linkType() != null) goal.setLinkType(request.linkType());
        if (request.linkTargetId() != null) goal.setLinkTargetId(request.linkTargetId());
        if (request.targetValue() != null) goal.setTargetValue(request.targetValue());
        goal = goalRepository.save(goal);
        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        log.debug("Updated goal {} for user {}", goal.getId(), userId);
        return toResponse(goal, milestones);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = findUserGoal(userId, goalId);
        goalRepository.delete(goal);
        log.debug("Deleted goal {} for user {}", goalId, userId);
    }

    @Transactional(readOnly = true)
    public List<GoalDto.GoalResponse> getGoals(Long userId, GoalStatus status) {
        List<Goal> goals = (status == null)
                ? goalRepository.findByUserIdOrderBySortOrderAsc(userId)
                : goalRepository.findByUserIdAndStatusOrderBySortOrderAsc(userId, status);
        return goals.stream()
                .map(g -> toResponse(g,
                        milestoneRepository.findByGoalIdOrderBySortOrderAsc(g.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalDto.GoalResponse getGoalById(Long userId, Long goalId) {
        Goal goal = findUserGoal(userId, goalId);
        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        return toResponse(goal, milestones);
    }

    @Transactional
    public GoalDto.GoalResponse addMilestone(Long userId, Long goalId, GoalDto.CreateMilestoneRequest request) {
        Goal goal = findUserGoal(userId, goalId);
        List<Milestone> existing = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        int nextSort = existing.isEmpty()
                ? 0
                : existing.get(existing.size() - 1).getSortOrder() + 1;
        milestoneRepository.save(Milestone.builder()
                .goalId(goal.getId())
                .title(request.title())
                .sortOrder(nextSort)
                .build());
        List<Milestone> all = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        log.debug("Added milestone to goal {} for user {}", goalId, userId);
        return toResponse(goal, all);
    }

    @Transactional
    public GoalDto.GoalResponse toggleMilestone(Long userId, Long goalId, Long milestoneId) {
        Goal goal = findUserGoal(userId, goalId);
        Milestone milestone = milestoneRepository.findByIdAndGoalId(milestoneId, goal.getId())
                .orElseThrow(() -> new NotFoundException("Milestone not found"));
        milestone.setCompleted(!milestone.isCompleted());
        milestoneRepository.save(milestone);

        List<Milestone> all = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        if (!all.isEmpty()) {
            boolean allDone = all.stream().allMatch(Milestone::isCompleted);
            GoalStatus desired = allDone ? GoalStatus.COMPLETED : GoalStatus.ACTIVE;
            if (goal.getStatus() != desired) {
                goal.setStatus(desired);
                goal = goalRepository.save(goal);
            }
        }
        log.debug("Toggled milestone {} on goal {} for user {}", milestoneId, goalId, userId);
        return toResponse(goal, all);
    }

    private GoalDto.GoalResponse toResponse(Goal goal, List<Milestone> milestones) {
        if (goal.getLinkType() == null || goal.getLinkType() == GoalLinkType.NONE
                || goal.getTargetValue() == null || goal.getLinkTargetId() == null) {
            return GoalDto.GoalResponse.from(goal, milestones, null, null, null);
        }
        BigDecimal target = goal.getTargetValue();
        BigDecimal current;
        String label;
        LocalDate since = goal.getCreatedAt().toLocalDate();
        LocalDate end = goal.getTargetDate() != null && goal.getTargetDate().isBefore(LocalDate.now())
                ? goal.getTargetDate()
                : LocalDate.now();

        if (goal.getLinkType() == GoalLinkType.HABIT) {
            int count = habitCompletionRepository
                    .findCompletionDatesSince(goal.getLinkTargetId(), since)
                    .size();
            current = BigDecimal.valueOf(count);
            label = count + " / " + target.toPlainString() + " completions";
        } else {
            String base = settingsRepository.findByUserId(goal.getUserId())
                    .map(s -> s.getCurrency())
                    .orElse("THB");
            current = transactionRepository
                    .findForCategoryInRange(goal.getUserId(), goal.getLinkTargetId(), since, end)
                    .stream()
                    .map(t -> currencyService.convert(t.getAmount(), t.getCurrency(), base))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String unit = categoryRepository.findById(goal.getLinkTargetId())
                    .map(c -> base)
                    .orElse(base);
            label = current.setScale(2, RoundingMode.HALF_UP) + " / "
                    + target.toPlainString() + " " + unit;
        }

        int progress = target.signum() == 0
                ? 0
                : Math.min(100, current.multiply(BigDecimal.valueOf(100))
                        .divide(target, 0, RoundingMode.HALF_UP).intValue());
        return GoalDto.GoalResponse.from(goal, milestones, current, label, progress);
    }

    @Transactional
    public void deleteMilestone(Long userId, Long goalId, Long milestoneId) {
        Goal goal = findUserGoal(userId, goalId);
        Milestone milestone = milestoneRepository.findByIdAndGoalId(milestoneId, goal.getId())
                .orElseThrow(() -> new NotFoundException("Milestone not found"));
        milestoneRepository.delete(milestone);
        log.debug("Deleted milestone {} from goal {} for user {}", milestoneId, goalId, userId);
    }

    private Goal findUserGoal(Long userId, Long goalId) {
        return goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new NotFoundException("Goal not found"));
    }
}
