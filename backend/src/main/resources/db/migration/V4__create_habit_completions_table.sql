CREATE TABLE habit_completions (
    id              BIGSERIAL   PRIMARY KEY,
    habit_id        BIGINT      NOT NULL REFERENCES habits (id),
    completed_date  DATE        NOT NULL,
    CONSTRAINT uq_habit_completions_habit_date UNIQUE (habit_id, completed_date)
);

CREATE INDEX idx_habit_completions_habit_date ON habit_completions (habit_id, completed_date);
