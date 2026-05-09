export type NotificationSeverity = "INFO" | "WARNING" | "DANGER";

export type NotificationKind =
  | "HABIT_PENDING"
  | "BUDGET_THRESHOLD"
  | "GOAL_OVERDUE"
  | "RECURRING_DUE";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  href: string;
}

export interface NotificationResponse {
  total: number;
  items: NotificationItem[];
}
