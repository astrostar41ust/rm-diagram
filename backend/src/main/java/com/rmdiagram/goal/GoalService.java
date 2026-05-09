package com.rmdiagram.goal;

import com.rmdiagram.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;

    @Transactional
    public GoalDto.GoalResponse createGoal(Long userId, GoalDto.CreateGoalRequest request) {
        Goal goal = Goal.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .targetDate(request.targetDate())
                .status(GoalStatus.ACTIVE)
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
        return GoalDto.GoalResponse.from(goal, milestones);
    }

    @Transactional
    public GoalDto.GoalResponse updateGoal(Long userId, Long goalId, GoalDto.UpdateGoalRequest request) {
        Goal goal = findUserGoal(userId, goalId);
        if (request.title() != null) goal.setTitle(request.title());
        if (request.description() != null) goal.setDescription(request.description());
        if (request.targetDate() != null) goal.setTargetDate(request.targetDate());
        if (request.status() != null) goal.setStatus(request.status());
        goal = goalRepository.save(goal);
        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        log.debug("Updated goal {} for user {}", goal.getId(), userId);
        return GoalDto.GoalResponse.from(goal, milestones);
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
                .map(g -> GoalDto.GoalResponse.from(
                        g, milestoneRepository.findByGoalIdOrderBySortOrderAsc(g.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalDto.GoalResponse getGoalById(Long userId, Long goalId) {
        Goal goal = findUserGoal(userId, goalId);
        List<Milestone> milestones = milestoneRepository.findByGoalIdOrderBySortOrderAsc(goal.getId());
        return GoalDto.GoalResponse.from(goal, milestones);
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
        return GoalDto.GoalResponse.from(goal, all);
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
        return GoalDto.GoalResponse.from(goal, all);
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
