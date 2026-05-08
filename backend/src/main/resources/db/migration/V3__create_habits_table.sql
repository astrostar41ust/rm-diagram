CREATE TABLE habits (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL REFERENCES users (id),
    name            VARCHAR(255)    NOT NULL,
    icon            VARCHAR(50),
    color           VARCHAR(7),
    frequency_type  VARCHAR(20)     NOT NULL DEFAULT 'DAILY' CHECK (frequency_type IN ('DAILY', 'SPECIFIC_DAYS', 'CUSTOM')),
    schedule_days   VARCHAR(50),
    archived        BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits (user_id);
CREATE INDEX idx_habits_user_id_archived ON habits (user_id, archived);
