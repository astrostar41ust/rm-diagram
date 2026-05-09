CREATE TABLE settings (
    id             BIGSERIAL     PRIMARY KEY,
    user_id        BIGINT        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency       VARCHAR(10)   NOT NULL DEFAULT 'THB',
    monthly_budget DECIMAL(12,2),
    theme          VARCHAR(20)   NOT NULL DEFAULT 'system',
    created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);
