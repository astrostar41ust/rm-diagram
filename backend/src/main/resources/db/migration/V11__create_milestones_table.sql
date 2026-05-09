CREATE TABLE milestones (
    id         BIGSERIAL    PRIMARY KEY,
    goal_id    BIGINT       NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    completed  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order INT          NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);
