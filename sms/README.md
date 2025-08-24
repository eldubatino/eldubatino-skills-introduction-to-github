# School Management System (Next.js + Supabase)

## Setup

1. Copy env file
```
cp .env.example .env.local
```
Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (for admin actions), optional `RESEND_API_KEY`, `EMAIL_FROM`.

2. Initialize database (in Supabase SQL editor)
- Paste and run `supabase/schema.sql`

3. Install deps and run
```
npm install
npm run dev
```

4. Create an admin
- Sign up via `/auth/sign-up` (or invite in Supabase)
- In `public.users`, set `role = 'admin'` for your user

## Features
- Role-based dashboards: Admin, Teacher, Parent
- Admin: manage students, teachers, classes, fees, attendance, reports
- Teacher: classes, attendance, grades, announcements
- Parent: attendance, grades, announcements, fees
- Email notifications: grade posted, fee due (Resend)
- Tailwind + shadcn-like components, dark mode

## Security
- RLS across tables; helpers check roles
- Middleware protects role routes

## Notes
- This is a minimal reference app; extend validations and UI as needed.