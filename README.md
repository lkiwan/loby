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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Running locally against the server database (no SSH needed)

Postgres and Redis are already published on the server (`docker-compose.server.yml`:
Postgres on port `5433`, Redis on `6379`). Any teammate can connect directly through
those ports (`IP_DU_SERVEUR` = your public server IP; the firewall must allow inbound
`5433`/`6379`).

1. Clone the repo and install:
   ```bash
   npm install   # runs `prisma generate`
   ```

2. Create a local `.env.local` (gitignored, each dev makes their own):
   ```bash
   DATABASE_URL=postgresql://postgres:my_super_secret_password@IP_DU_SERVEUR:5433/arcade_db
   REDIS_URL=redis://IP_DU_SERVEUR:6379
   NEXTAUTH_SECRET=your_own_random_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_ID=your_google_client_id
   GOOGLE_SECRET=your_google_client_secret
   AD_NETWORK_WEBHOOK_SECRET=your_shared_webhook_secret
   NEXT_PUBLIC_ADSENSE_CLIENT=your_adsense_client
   ```
   Ask the repo owner for the real values (never commit them).

3. First time only, sync the schema to the shared DB:
   ```bash
   npx prisma db push
   ```

4. Run:
   ```bash
   npm run dev
   ```

Caveats:
- Everybody shares the same data — one dev's seed/migrations affect everyone.
- Google OAuth: `http://localhost:3000` must be in the Google Console authorized
  redirect URIs, or login via Google fails.
- Set a strong `POSTGRES_PASSWORD` in `docker-compose.server.yml` before exposing the
  port to teammates.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
