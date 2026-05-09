-- Default categories: user_id = NULL means "global / system-provided".
-- Users see these alongside their own categories; they cannot be edited
-- or deleted by users.

INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
    (NULL, 'Food',           'utensils',       '#ef4444', 'EXPENSE', TRUE),
    (NULL, 'Transport',      'car',            '#3b82f6', 'EXPENSE', TRUE),
    (NULL, 'Shopping',       'shopping-bag',   '#ec4899', 'EXPENSE', TRUE),
    (NULL, 'Bills',          'receipt',        '#f59e0b', 'EXPENSE', TRUE),
    (NULL, 'Entertainment',  'film',           '#a855f7', 'EXPENSE', TRUE),
    (NULL, 'Health',         'heart-pulse',    '#14b8a6', 'EXPENSE', TRUE),
    (NULL, 'Education',      'graduation-cap', '#6366f1', 'EXPENSE', TRUE),
    (NULL, 'Other',          'package',        '#64748b', 'EXPENSE', TRUE),
    (NULL, 'Salary',         'briefcase',      '#22c55e', 'INCOME',  TRUE),
    (NULL, 'Freelance',      'laptop',         '#06b6d4', 'INCOME',  TRUE),
    (NULL, 'Investment',     'trending-up',    '#10b981', 'INCOME',  TRUE),
    (NULL, 'Gift',           'gift',           '#f97316', 'INCOME',  TRUE),
    (NULL, 'Other Income',   'dollar-sign',    '#84cc16', 'INCOME',  TRUE);
