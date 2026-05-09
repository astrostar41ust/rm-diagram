CREATE TABLE accounts (
    id          BIGSERIAL     PRIMARY KEY,
    user_id     BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    type        VARCHAR(20)   NOT NULL,
    currency    VARCHAR(10)   NOT NULL DEFAULT 'THB',
    balance     DECIMAL(14,2) NOT NULL DEFAULT 0,
    archived    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_accounts_type CHECK (type IN ('CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'ASSET', 'LIABILITY'))
);
CREATE INDEX idx_accounts_user ON accounts(user_id, archived);

CREATE TABLE net_worth_snapshots (
    id          BIGSERIAL      PRIMARY KEY,
    user_id     BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_on DATE           NOT NULL,
    base_currency VARCHAR(10)  NOT NULL,
    assets      DECIMAL(14,2)  NOT NULL,
    liabilities DECIMAL(14,2)  NOT NULL,
    net_worth   DECIMAL(14,2)  NOT NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_snapshot UNIQUE (user_id, snapshot_on)
);
CREATE INDEX idx_snapshot_user_date ON net_worth_snapshots(user_id, snapshot_on);
