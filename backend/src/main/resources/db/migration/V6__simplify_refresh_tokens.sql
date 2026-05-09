-- Refresh tokens become opaque random strings stored as SHA-256 hashes.
-- Existing rows are dropped: the old format is incompatible, so all sessions
-- are invalidated and users will need to re-authenticate.

TRUNCATE TABLE refresh_tokens;

DROP INDEX IF EXISTS idx_refresh_tokens_token;

ALTER TABLE refresh_tokens DROP COLUMN token;

ALTER TABLE refresh_tokens
    ADD COLUMN token_hash VARCHAR(64) NOT NULL UNIQUE;

CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
