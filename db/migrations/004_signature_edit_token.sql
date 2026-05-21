-- Per-member secret for token-gated public edit links (?token=...).
ALTER TABLE signatures
  ADD COLUMN IF NOT EXISTS edit_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex');

CREATE UNIQUE INDEX IF NOT EXISTS idx_signatures_edit_token ON signatures (edit_token);
