CREATE TABLE budgets (
    id              BIGSERIAL     PRIMARY KEY,
    user_id         BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     BIGINT        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    monthly_limit   DECIMAL(12,2) NOT NULL,
    alert_threshold INT           NOT NULL DEFAULT 80,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_budgets_limit     CHECK (monthly_limit >= 0),
    CONSTRAINT chk_budgets_threshold CHECK (alert_threshold BETWEEN 1 AND 100),
    CONSTRAINT uq_budgets_user_category UNIQUE (user_id, category_id)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
