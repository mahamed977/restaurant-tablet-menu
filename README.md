# Restaurant Tablet Menu

Next.js App Router + Supabase (Postgres/Auth/Storage) tablet-friendly menu with public kiosk view and authenticated admin dashboard.

## Stack
- Next.js 14 (TypeScript, App Router)
- Supabase (Postgres, Auth, Storage)
- Deploy target: Vercel

## Environment variables
Copy `.env.example` to `.env.local` and fill:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase setup
1) Create a new Supabase project.
2) In the SQL editor, paste the contents of `supabase/migrations/001_init.sql` and run it. This creates tables, seed data, the `increment_menu_version` function, and enables RLS (service role bypasses it).
3) Create first admin user in Supabase Dashboard (Auth → Users → Add user with password).
4) Add their role:
```sql
insert into public.admin_roles (user_id, role)
values ('<USER_UUID>', 'admin')
on conflict (user_id) do update set role = excluded.role;
```
5) For staff accounts, repeat with role `staff`.

## Local development
```bash
npm install
npm run dev
```
- Public menu: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin/login`

## Data flow & security
- Public reads go through `/api/public/menu` and `/api/public/version`; both read via service role on the server.
- Admin mutations use service role on the server, require a Supabase auth token in `Authorization: Bearer <access_token>`, check role from `admin_roles`, log to `admin_audit`, and call `increment_menu_version` after every mutation.
- The service role key is only used in server route handlers; it is never exposed to the browser.

## Deploy to Vercel
1) Connect this repo to Vercel.
2) Add environment variables from `.env.example` in Vercel project settings.
3) Deploy. Vercel will run `npm install` and `npm run build`.

## Reordering notes
- Categories: `/api/admin/categories/reorder` with ordered array of category IDs.
- Items: `/api/admin/items/reorder` with ordered array of item IDs (per current filtered ordering).

## Offline/UX behaviors
- Public menu polls `/api/public/version` every 30s; version change triggers refetch.
- If fetch fails, a full-screen offline overlay shows and retries every 10s.
- Idle for 2 minutes returns to `/`.
- Sold-out items can be hidden or shown with a badge via `HIDE_SOLD_OUT` in `src/config/display.ts`.
