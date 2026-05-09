ALTER TABLE goals
    ADD COLUMN link_type      VARCHAR(20)   NOT NULL DEFAULT 'NONE',
    ADD COLUMN link_target_id BIGINT,
    ADD COLUMN target_value   DECIMAL(12,2),
    ADD CONSTRAINT chk_goals_link_type CHECK (link_type IN ('NONE', 'HABIT', 'TRANSACTION'));
