-- Query performance for admin list ordering (slug already indexed via UNIQUE).

CREATE INDEX IF NOT EXISTS idx_signatures_name ON signatures (name);
