This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database (Neon)

1. Create a [Neon](https://neon.com) project and copy the connection string.
2. Copy [.env.example](.env.example) to `.env.local` and set `DATABASE_URL` (and optionally `NEXT_PUBLIC_APP_URL` for correct share links when not using the request host).
3. Run the SQL in [db/migrations/001_init.sql](db/migrations/001_init.sql) against your database (Neon SQL editor or `psql "$DATABASE_URL" -f db/migrations/001_init.sql`).
4. Use [http://localhost:3000/admin](http://localhost:3000/admin) to manage team signatures. Public install pages live at `/{slug}`.

`/admin` is not authenticated in this template; add auth (e.g. middleware + session) before exposing it on the public internet.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
