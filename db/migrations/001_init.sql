-- Run against your Neon database (SQL editor or `psql "$DATABASE_URL" -f ...`).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organization_settings (
  id smallint PRIMARY KEY CHECK (id = 1),
  company_name text NOT NULL DEFAULT 'C4 Photo Safaris',
  footer_url text NOT NULL DEFAULT 'https://www.c4photosafaris.com',
  logo_url text NOT NULL DEFAULT '',
  primary_color text NOT NULL DEFAULT '#C69C6D',
  accent_color text NOT NULL DEFAULT '#C69C6D',
  text_color text NOT NULL DEFAULT '#1a1a1a',
  muted_color text NOT NULL DEFAULT '#6b6b64',
  border_color text NOT NULL DEFAULT '#e8ddd0',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO organization_settings (id, company_name, footer_url, logo_url, primary_color, accent_color, text_color, muted_color, border_color)
VALUES (
  1,
  'C4 Photo Safaris',
  'https://www.c4photosafaris.com',
  '',
  '#C69C6D',
  '#C69C6D',
  '#1a1a1a',
  '#6b6b64',
  '#e8ddd0'
);

CREATE TABLE signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  job_title text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text,
  avatar_url text,
  template_id text NOT NULL DEFAULT 'default',
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signatures_email_lower ON signatures (lower(email));
