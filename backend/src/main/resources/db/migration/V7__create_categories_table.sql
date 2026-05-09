CREATE TABLE categories (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(50),
    color       VARCHAR(7),
    type        VARCHAR(20)  NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_categories_type CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
