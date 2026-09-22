14:34:45.408 Running build in Washington, D.C., USA (East) – iad1
14:34:45.410 Build machine configuration: 2 cores, 8 GB
14:34:45.501 Cloning github.com/lkiwan/loby (Branch: master, Commit: 16fa799)
14:34:45.503 Skipping build cache, deployment was triggered without cache.
14:34:46.849 Cloning completed: 1.347s
14:34:47.537 Running "vercel build"
14:34:47.577 Vercel CLI 59.23.2
14:34:47.823 Installing dependencies...
14:35:13.170
14:35:13.170 > loby@0.1.0 postinstall
14:35:13.170 > prisma generate
14:35:13.170
14:35:13.796 Prisma schema loaded from prisma/schema.prisma
14:35:14.449
14:35:14.451 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 234ms
14:35:14.452
14:35:14.452 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
14:35:14.453
14:35:14.453 Tip: Easily identify and fix slow SQL queries in your app. Optimize helps you enhance your visibility: https://pris.ly/--optimize
14:35:14.453
14:35:14.678
14:35:14.679 added 396 packages in 27s
14:35:14.679
14:35:14.680 156 packages are looking for funding
14:35:14.680 run

`npm fund` for details
14:35:14.681 npm warn allow-scripts 4 packages have install scripts not yet covered by allowScripts:
14:35:14.681 npm warn allow-scripts @prisma/client@5.22.0 (postinstall: node scripts/postinstall.js)
14:35:14.682 npm warn allow-scripts @prisma/engines@5.22.0 (postinstall: node scripts/postinstall.js)
14:35:14.682 npm warn allow-scripts prisma@5.22.0 (preinstall: node scripts/preinstall-entry.js)
14:35:14.683 npm warn allow-scripts unrs-resolver@1.12.2 (postinstall: node postinstall.js)
14:35:14.683 npm warn allow-scripts
14:35:14.683 npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
14:35:14.759 Detected Next.js version: 16.3.5
14:35:14.770 Running "npm run build"
14:35:15.045
14:35:15.046 > loby@0.1.0 build
14:35:15.046 > next build
14:35:15.046
14:35:15.456 ▲ Next.js 16.3.5 (Turbopack)
14:35:15.533 Applying modifyConfig from Vercel
14:35:15.535 ✓ Running next.config.ts took 82ms
14:35:15.575 Attention: Next.js now collects completely anonymous telemetry regarding usage.
14:35:15.576 This information is used to shape Next.js' roadmap and prioritize features.
14:35:15.576 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
14:35:15.577 https://nextjs.org/telemetry
14:35:15.577
14:35:15.591
14:35:15.625 Creating an optimized production build ...
14:35:26.580 ✓ Compiled successfully in 10.1s
14:35:26.590 Running TypeScript ...
14:35:33.132 Finished TypeScript in 6.5s ...
14:35:33.136 Collecting page data using 1 worker ...
14:35:33.971 Generating static pages using 1 worker (0/28) ...
14:35:34.297 Generating static pages using 1 worker (7/28)
14:35:34.302 Generating static pages using 1 worker (14/28)
14:35:34.344 Generating static pages using 1 worker (21/28)
14:35:34.387 ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
14:35:34.388 at Object.X (/vercel/path0/.next/server/chunks/ssr/node*modules_next_0x3i8za.*.js:121:3038)
14:35:34.388 at q (/vercel/path0/.next/server/chunks/ssr/node*modules_next_0x3i8za.*.js:1:9742)
14:35:34.388 at /vercel/path0/.next/server/chunks/ssr/_18rx29t._.js:2:12324
14:35:34.388 at al (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:85944)
14:35:34.388 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87760)
14:35:34.388 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.390 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.390 at au (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:86296)
14:35:34.390 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87805)
14:35:34.390 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106280)
14:35:34.393 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.394 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.394 at aS (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:114685)
14:35:34.394 at ap (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:111684)
14:35:34.395 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109897)
14:35:34.395 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.395 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:100962)
14:35:34.395 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.395 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.395 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:105898)
14:35:34.395 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.395 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.396 at au (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:86296)
14:35:34.396 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87805)
14:35:34.396 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.396 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.396 at aS (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:114685)
14:35:34.396 at ap (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:111684)
14:35:34.397 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109897)
14:35:34.397 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.397 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87724)
14:35:34.397 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.397 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.397 at au (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:86296)
14:35:34.397 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87805)
14:35:34.398 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.398 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.401 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87724)
14:35:34.401 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.401 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.401 at au (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:86296)
14:35:34.401 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87805)
14:35:34.401 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.401 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.401 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:100962)
14:35:34.401 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.401 at af (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:106940)
14:35:34.401 at au (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:86296)
14:35:34.401 at ac (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:87805)
14:35:34.401 at ah (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js:2:109623)
14:35:34.403 Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
14:35:34.403 Export encountered an error on /page: /, exiting the build.
14:35:34.428 ⨯ Next.js build worker exited with code: 1 and signal: null
14:35:34.508 Error: Command "npm run build" exited with 1This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
