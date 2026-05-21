# NAS Signature

A production-ready email signature platform for teams. Admins manage organization branding, signature templates, and team members; members install signatures via a public link without logging in.

Built with **Next.js** (App Router), **Neon Postgres**, and optional **Cloudflare R2** for logo uploads.

## Features

| Area | Description |
|------|-------------|
| **Admin dashboard** | Manage signatures, templates, and organization settings |
| **Template editor** | Visual block editor with live preview and undo/redo |
| **Public install pages** | Per-member URLs at `/{slug}` for copy-to-clipboard install |
| **Token-based member edit** | Members update contact details via a secure link (no admin account) |
| **Platform profiles** | Outlook, Microsoft 365, Google Workspace, Apple Mail, and generic HTML |
| **Email invites** | Optional Brevo integration to send install links to members |

## Architecture (overview)

```
app/                 Next.js routes (admin, public slug pages, sign-in)
app/actions/         Server Actions (auth, signatures, templates, media)
components/          UI and editor (client islands where interactivity is needed)
lib/                 Data access, rendering, auth, templates, storage
db/migrations/       Postgres schema (run in order on Neon)
```

- **Server-first**: Pages and mutations run on the server; client components are limited to forms, the editor, and previews.
- **Templates are global**: Layout lives in `signature_templates`; member rows store contact fields and template assignment only.
- **Rendering**: Signatures compile from a block document model to email-safe HTML per target platform.

## Requirements

- Node.js 20+
- A [Neon](https://neon.com) Postgres database
- For production: `ADMIN_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`

Optional: Cloudflare R2 (logo/avatar uploads), Brevo (invite emails).

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in values. See the example file for variable names and short descriptions.

3. **Database**

   Run migrations in order against your Neon database:

   ```bash
   psql "$DATABASE_URL" -f db/migrations/001_init.sql
   psql "$DATABASE_URL" -f db/migrations/002_document_templates.sql
   psql "$DATABASE_URL" -f db/migrations/003_global_templates.sql
   psql "$DATABASE_URL" -f db/migrations/004_signature_edit_token.sql
   psql "$DATABASE_URL" -f db/migrations/005_performance_indexes.sql
   ```

4. **Development**

   ```bash
   npm run dev
   ```

   - Sign in: [http://localhost:3000](http://localhost:3000) (when `ADMIN_SECRET` is set)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Public signature example: `http://localhost:3000/{slug}`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js host that supports Next.js 16.

1. Set environment variables in the hosting dashboard (mirror `.env.example`).
2. Run database migrations on your production Neon branch.
3. Set `NEXT_PUBLIC_APP_URL` to your public origin so signature images and share links resolve correctly in email clients.
4. Set a strong `ADMIN_SECRET` in production (auth is required when `NODE_ENV=production`).

For high-traffic production, add edge rate limiting (e.g. Vercel Firewall) on `/` (login) and public save actions.

## Security notes (high level)

- Admin routes are protected by signed session cookies and role checks.
- Public member edits require a per-signature secret token in the URL.
- HTML output is escaped at render time; previews use sandboxed iframes.
- Security headers are applied on all responses.

Do not commit `.env.local` or secrets to version control.

## License

Private — C4 Photo Safaris / internal use unless otherwise specified.
