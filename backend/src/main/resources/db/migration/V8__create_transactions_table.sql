CREATE TABLE transactions (
    id               BIGSERIAL     PRIMARY KEY,
    user_id          BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      BIGINT        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type             VARCHAR(20)   NOT NULL,
    amount           DECIMAL(12,2) NOT NULL,
    note             VARCHAR(500),
    transaction_date DATE          NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_transactions_type   CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT chk_transactions_amount CHECK (amount >= 0)
);

CREATE INDEX idx_transactions_user_date     ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
