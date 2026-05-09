ALTER TABLE notes ADD COLUMN note_date DATE;
UPDATE notes SET note_date = created_at::DATE;
ALTER TABLE notes ALTER COLUMN note_date SET NOT NULL;
ALTER TABLE notes ALTER COLUMN note_date SET DEFAULT CURRENT_DATE;

CREATE INDEX idx_notes_user_note_date ON notes(user_id, note_date);
