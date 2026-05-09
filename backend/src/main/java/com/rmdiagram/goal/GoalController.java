package com.rmdiagram.goal;

import com.rmdiagram.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalDto.GoalResponse> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GoalDto.CreateGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.createGoal(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<GoalDto.GoalResponse>> getGoals(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) GoalStatus status) {
        return ResponseEntity.ok(goalService.getGoals(user.getId(), status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDto.GoalResponse> getGoalById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalById(user.getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GoalDto.GoalResponse> updateGoal(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody GoalDto.UpdateGoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        goalService.deleteGoal(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<GoalDto.GoalResponse> addMilestone(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody GoalDto.CreateMilestoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.addMilestone(user.getId(), id, request));
    }

    @PatchMapping("/{goalId}/milestones/{milestoneId}/toggle")
    public ResponseEntity<GoalDto.GoalResponse> toggleMilestone(
            @AuthenticationPrincipal User user,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId) {
        return ResponseEntity.ok(goalService.toggleMilestone(user.getId(), goalId, milestoneId));
    }

    @DeleteMapping("/{goalId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            @AuthenticationPrincipal User user,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId) {
        goalService.deleteMilestone(user.getId(), goalId, milestoneId);
        return ResponseEntity.noContent().build();
    }
}
