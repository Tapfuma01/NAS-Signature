-- Phase 2: signature documents, target platforms, org template defaults.

ALTER TABLE signatures
  ADD COLUMN IF NOT EXISTS document jsonb,
  ADD COLUMN IF NOT EXISTS target_platform text NOT NULL DEFAULT 'generic';

ALTER TABLE organization_settings
  ADD COLUMN IF NOT EXISTS default_template_id text NOT NULL DEFAULT 'corporate-classic',
  ADD COLUMN IF NOT EXISTS default_target_platform text NOT NULL DEFAULT 'generic';

-- Legacy template id → corporate-classic
UPDATE signatures SET template_id = 'corporate-classic' WHERE template_id = 'default';

UPDATE organization_settings
SET default_template_id = 'corporate-classic'
WHERE default_template_id IS NULL OR default_template_id = 'default';

-- Constrain target_platform values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'signatures_target_platform_check'
  ) THEN
    ALTER TABLE signatures
      ADD CONSTRAINT signatures_target_platform_check
      CHECK (
        target_platform IN (
          'outlook_desktop',
          'microsoft_365',
          'google_workspace',
          'apple_mail',
          'generic'
        )
      );
  END IF;
END $$;
