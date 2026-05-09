CREATE TABLE recurring_transactions (
    id               BIGSERIAL     PRIMARY KEY,
    user_id          BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      BIGINT        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type             VARCHAR(20)   NOT NULL,
    amount           DECIMAL(12,2) NOT NULL,
    currency         VARCHAR(10)   NOT NULL DEFAULT 'THB',
    note             VARCHAR(500),
    frequency        VARCHAR(20)   NOT NULL,
    day_of_month     INT,
    day_of_week      VARCHAR(20),
    next_run_date    DATE          NOT NULL,
    end_date         DATE,
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_recurring_type      CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT chk_recurring_frequency CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    CONSTRAINT chk_recurring_amount    CHECK (amount >= 0),
    CONSTRAINT chk_recurring_dom       CHECK (day_of_month IS NULL OR (day_of_month BETWEEN 1 AND 31))
);

CREATE INDEX idx_recurring_user_active   ON recurring_transactions(user_id, active);
CREATE INDEX idx_recurring_next_run_date ON recurring_transactions(next_run_date) WHERE active = TRUE;
