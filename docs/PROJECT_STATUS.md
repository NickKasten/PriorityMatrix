# PriorityMatrix – Project Status (GitHub Pages Branch)

## ✅ Completed Work

### Platform & Tooling
- React Router v7 configured for SPA builds (SSR disabled) with Tailwind CSS styling.
- Vite environment now driven by `VITE_*` variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_APP_BASE_PATH`).
- GitHub Pages compatible assets: `public/404.html` redirect helper and base path handling in `vite.config.ts`.

### Authentication & User Safety
- Email magic-link flow (`/login`, `/auth/callback`) with a global `AuthProvider` and account menu.
- Capacity guard page (`/capacity`) triggered when the tenant exceeds 100 active users.
- Supabase migration script (`supabase/migrations/20250215_gh_pages_auth_limits.sql`) creating:
  - `user_profiles` table to track active accounts.
  - Functions `check_user_capacity` and `ensure_user_slot` for pre-check and enforcement.
  - `handle_todo_insert` trigger enforcing 30 active tasks per user and a 1 task/sec insert rate.
  - Updated RLS policies so users only access their own tasks and profile entry.

### Application Routes & Components
- `_index.tsx` updated with auth-aware landing experience.
- `login.tsx`, `auth.callback.tsx`, and `capacity.tsx` power the auth flow.
- `add-todo.tsx` and `add-todo.position.tsx` now run completely client-side with Supabase inserts and limit messaging.
- `todos.tsx` fetches and mutates data via the browser Supabase client with optimistic drag-and-drop updates.
- UI enhancements: `AccountMenu` (sign-in/out, quick links) and `ThemeToggle` pinned in the layout.

### Data Layer Utilities
- `app/lib/supabase.client.ts` – browser Supabase singleton.
- `app/lib/auth-context.tsx` – session management + capacity awareness.
- `app/lib/utils.ts` – priority calculations remain shared across the UI.
- `app/types/todo.ts` augmented with `user_id`.

## 🚧 In Progress / Next Steps
- Author Playwright end-to-end tests covering auth, task CRUD, drag & drop, rate limit messaging, and capacity edge cases.
- Configure GitHub Actions workflow for automated GH Pages deployments.
- Document CI set-up and testing workflows in README (partially updated; final copy pending CI work).

## 🧪 Testing Status
- `npm run typecheck` passes (runs `react-router typegen` + `tsc`).
- End-to-end tests not yet implemented; Playwright scaffolding is planned in this branch.

## 🌐 Deployment Notes
- GitHub Pages: use SPA build output (`npm run build`) and the upcoming GitHub Actions workflow to push `build/client`.
- Vercel remains an optional host; update environment variables to `VITE_` names if deploying there.
- Supabase SQL script must be applied before inviting users to ensure RLS, rate limiting, and capacity controls are active.

## 📊 Database Changes Summary
- `todos.user_id` (uuid) with trigger-assigned value of `auth.uid()` plus rate limiting checks.
- `user_profiles` (id, email, created_at) gating user capacity.
- Supporting functions/triggers:
  - `check_user_capacity(email)` – returns `{ capacity_reached, is_existing_user, allow_signup }`.
  - `ensure_user_slot(user_uuid, user_email)` – inserts profile or raises `USER_CAPACITY_REACHED`.
  - `handle_todo_insert()` – enforces 30 active tasks and 1 insert/second per user.
- Updated policies restrict all `todos` CRUD to the owning user and secure the profile table.
