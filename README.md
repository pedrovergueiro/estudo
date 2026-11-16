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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## YPY website (`/ypy`)

The YPY institutional site lives in its own route group with a separate root layout, so it shares nothing with the study platform's UI:

- `app/(ypy)/layout.tsx`, `app/(ypy)/ypy.css`, `app/(ypy)/ypy/page.tsx` — layout, art direction and page.
- `components/ypy/*` — hero terrain/rover scene and Stake M1 viewer (three.js, loaded on demand), subsurface lens, technology sequence, YPY Intelligence concept demo, contact form.
- `app/api/ypy/contact/route.ts` — stores contact messages in the local SQLite database (table `ypy_contact`) and, if `YPY_CONTACT_WEBHOOK_URL` is set, forwards them there as JSON.

All data shown in the demos is fictional and labelled as such.
