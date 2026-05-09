package com.rmdiagram.notification;

import java.util.List;

public final class NotificationDto {

    private NotificationDto() {}

    public enum Severity { INFO, WARNING, DANGER }

    public enum Kind { HABIT_PENDING, BUDGET_THRESHOLD, GOAL_OVERDUE, RECURRING_DUE }

    public record Item(
            String id,
            Kind kind,
            Severity severity,
            String title,
            String body,
            String href) {}

    public record Response(int total, List<Item> items) {}
}
