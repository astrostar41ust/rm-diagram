package com.rmdiagram.goal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class GoalDto {

    private GoalDto() {}

    public record CreateMilestoneRequest(
            @NotBlank @Size(max = 255) String title
    ) {}

    public record CreateGoalRequest(
            @NotBlank @Size(max = 255) String title,
            String description,
            LocalDate targetDate,
            @Valid List<CreateMilestoneRequest> milestones
    ) {}

    public record UpdateGoalRequest(
            @Size(max = 255) String title,
            String description,
            LocalDate targetDate,
            GoalStatus status
    ) {}

    public record MilestoneResponse(
            Long id,
            String title,
            boolean completed,
            int sortOrder
    ) {
        public static MilestoneResponse from(Milestone m) {
            return new MilestoneResponse(m.getId(), m.getTitle(), m.isCompleted(), m.getSortOrder());
        }
    }

    public record GoalResponse(
            Long id,
            String title,
            String description,
            GoalStatus status,
            LocalDate targetDate,
            int sortOrder,
            int progress,
            List<MilestoneResponse> milestones,
            LocalDateTime createdAt
    ) {
        public static GoalResponse from(Goal goal, List<Milestone> milestones) {
            int total = milestones.size();
            int done = (int) milestones.stream().filter(Milestone::isCompleted).count();
            int progress = total == 0 ? 0 : (done * 100) / total;
            List<MilestoneResponse> ms = milestones.stream()
                    .map(MilestoneResponse::from)
                    .toList();
            return new GoalResponse(
                    goal.getId(),
                    goal.getTitle(),
                    goal.getDescription(),
                    goal.getStatus(),
                    goal.getTargetDate(),
                    goal.getSortOrder(),
                    progress,
                    ms,
                    goal.getCreatedAt()
            );
        }
    }
}
