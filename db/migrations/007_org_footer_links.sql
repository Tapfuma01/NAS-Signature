ALTER TABLE organization_settings
  ADD COLUMN IF NOT EXISTS footer_url_2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS footer_url_3 text NOT NULL DEFAULT '';
