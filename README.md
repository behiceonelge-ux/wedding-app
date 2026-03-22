# Wedding Photo Upload App

Minimal mobile-first wedding photo upload app built with Next.js, Supabase, and Tailwind.

## Project structure

```text
.
├── app
│   ├── admin
│   │   └── [slug]
│   │       ├── not-found.tsx
│   │       └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   └── login
│   │   │       └── route.ts
│   │   ├── guest-status
│   │   │   └── route.ts
│   │   ├── guest-session
│   │   │   └── route.ts
│   │   ├── photos
│   │   │   └── download
│   │   │       └── route.ts
│   │   └── upload
│   │       └── route.ts
│   ├── event
│   │   └── [slug]
│   │       ├── not-found.tsx
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── admin-login-form.tsx
│   └── upload-card.tsx
├── lib
│   ├── admin-auth.ts
│   ├── constants.ts
│   ├── data.ts
│   ├── guest.ts
│   └── supabase.ts
├── supabase
│   └── schema.sql
├── .env.example
├── .gitignore
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## What it does

- `/event/[slug]`: guest upload page
- stable guest ID stored in `localStorage`, a 90-day cookie, and the page URL query param `g`
- max 30 photos per guest
- remaining upload counter
- camera capture input only
- `/admin/[slug]`: password-protected image gallery with View and Download buttons
- Supabase database for `events`, `guests`, `photos`
- Supabase Storage for photo files

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
SUPABASE_STORAGE_BUCKET=wedding-photos
```

### 3. Create the database tables

In Supabase SQL Editor, run:

[`supabase/schema.sql`](/Users/behiceonelge/Desktop/düğün/supabase/schema.sql)

This creates:

- `events`
- `guests`
- `photos`

It also inserts one sample event:

- slug: `demo-wedding`
- name: `Demo Wedding`

### 4. Create the storage bucket

In Supabase Storage:

- create a bucket named `wedding-photos`
- make the bucket public

If you use a different bucket name, update `SUPABASE_STORAGE_BUCKET`.

### 5. Run the app

```bash
npm run dev
```

Open:

- guest page: `http://localhost:3000/event/demo-wedding`
- admin page: `http://localhost:3000/admin/demo-wedding`

## Notes

- This app uses server-side Supabase access through the service role key for simplicity and reliability.
- Guest identity is resolved in this order: URL `g` param, cookie, `localStorage`, then a newly generated ID. The resolved ID is synced back to all three before status loads.
- The camera input uses `accept="image/*"` and `capture="environment"` for mobile browsers like iPhone Safari and Android Chrome.
- Mobile browsers control the final camera UI behavior, but this is the standard camera-only web approach.
