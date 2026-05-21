-- Global signature templates (single source of truth for layout/design).

CREATE TABLE IF NOT EXISTS signature_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Corporate',
  canvas_width int NOT NULL DEFAULT 500 CHECK (canvas_width IN (500, 600)),
  layout_style text NOT NULL,
  document jsonb NOT NULL,
  is_builtin boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signature_templates_updated_at_idx
  ON signature_templates (updated_at DESC);

-- Signatures store member data only; layout comes from templates at render time.
COMMENT ON COLUMN signatures.document IS 'Deprecated: legacy per-signature layout snapshots. New rows should leave NULL.';
