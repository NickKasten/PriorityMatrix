# CLAUDE.md - AI Assistant Development Guide for PriorityMatrix

This document provides comprehensive guidance for AI assistants working on the PriorityMatrix codebase. It explains the project structure, development workflows, key conventions, and best practices to follow.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Technology Stack](#technology-stack)
4. [Development Environment](#development-environment)
5. [Key Conventions](#key-conventions)
6. [Development Workflows](#development-workflows)
7. [Database Schema & RLS](#database-schema--rls)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

**PriorityMatrix** is a modern todo application with Eisenhower Matrix prioritization, built as a static SPA (Single Page Application) for GitHub Pages deployment.

### Key Features

- Eisenhower Matrix for task categorization (importance × urgency)
- Drag-and-drop task management with optimistic UI updates
- Email magic-link authentication via Supabase Auth
- Per-user data isolation with Row Level Security (RLS)
- Usage guardrails: 100 user cap, 30 active tasks/user, 1 task/sec insert rate
- Responsive, accessible UI with Tailwind CSS

### Primary Use Case

Users organize tasks on a 2D graph by importance and urgency, creating four quadrants:
- **DO FIRST**: High importance, high urgency
- **SCHEDULE**: High importance, low urgency
- **DELEGATE**: Low importance, high urgency
- **ELIMINATE**: Low importance, low urgency

---

## Codebase Structure

```
PriorityMatrix/
├── .claude/                      # Claude Code configuration
│   └── rules.md                  # Development rules and guidelines
├── .github/
│   └── workflows/
│       └── deploy-gh-pages.yml   # CI/CD for GitHub Pages
├── app/                          # Main application source
│   ├── components/               # React components
│   │   ├── AccountMenu.tsx       # Auth menu (sign in/out, profile)
│   │   ├── ImportanceUrgencyGraph.tsx  # 2D graph for task positioning
│   │   ├── TaskCard.tsx          # Draggable task card
│   │   ├── ThemeToggle.tsx       # Light/dark mode toggle
│   │   └── TodoColumn.tsx        # Kanban column (To Do, Scheduled, Completed)
│   ├── lib/                      # Utilities and shared logic
│   │   ├── auth-context.tsx      # Auth provider & session management
│   │   ├── supabase.client.ts    # Browser Supabase client singleton
│   │   └── utils.ts              # Priority calculation & sorting
│   ├── routes/                   # Route components (React Router v7)
│   │   ├── _index.tsx            # Landing page
│   │   ├── add-todo.tsx          # Task creation form
│   │   ├── add-todo.position.tsx # Importance/urgency graph for new tasks
│   │   ├── auth.callback.tsx     # OAuth callback handler
│   │   ├── capacity.tsx          # User capacity exceeded page
│   │   ├── home.tsx              # Authenticated home
│   │   ├── login.tsx             # Magic link login
│   │   └── todos.tsx             # Main task board (drag & drop)
│   ├── types/
│   │   └── todo.ts               # TypeScript interfaces
│   ├── welcome/
│   │   └── welcome.tsx           # Welcome component
│   ├── app.css                   # Global styles
│   ├── root.tsx                  # App root with providers
│   └── routes.ts                 # Route configuration
├── docs/                         # Documentation
│   ├── PROJECT_STATUS.md         # Current implementation status
│   └── StyleGuide.md             # Design system & accessibility rules
├── public/
│   ├── 404.html                  # SPA redirect helper for GitHub Pages
│   └── favicon.ico
├── supabase/
│   └── migrations/
│       └── 20250215_gh_pages_auth_limits.sql  # RLS + capacity controls
├── tests/
│   └── e2e/
│       └── app.spec.ts           # Playwright end-to-end tests
├── Dockerfile                    # Container build config
├── package.json                  # Dependencies & scripts
├── playwright.config.ts          # E2E test configuration
├── react-router.config.ts        # React Router config (SSR disabled)
├── tsconfig.json                 # TypeScript compiler options
└── vite.config.ts                # Vite build configuration
```

---

## Technology Stack

### Core Framework & Language

- **Framework**: React Router v7 (SSR disabled for static SPA)
- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4

### Backend & Authentication

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email magic links)
- **Client SDK**: `@supabase/supabase-js`

### UI Libraries

- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Date Utilities**: `date-fns`
- **Icons**: (Check components for specific usage)

### Testing

- **Type Checking**: TypeScript compiler + React Router typegen
- **E2E Tests**: Playwright (Chromium, Firefox, WebKit)
- **Unit Tests**: Not yet implemented (see .claude/rules.md for Vitest setup)

### Deployment

- **Primary**: GitHub Pages (static SPA via GitHub Actions)
- **Alternative**: Vercel, Docker (AWS ECS, GCP Cloud Run, etc.)

---

## Development Environment

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: Comes with Node.js
- **Supabase Account**: Free tier available at supabase.com

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for all environments
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: GitHub Pages base path (e.g., /PriorityMatrix)
VITE_APP_BASE_PATH=/PriorityMatrix
```

**Important**: The app uses `VITE_*` prefixed variables. The `vite.config.ts` also handles legacy `SUPABASE_URL` and `SUPABASE_ANON_KEY` for backward compatibility.

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Apply Supabase migration**:
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor
   - Run the script from `supabase/migrations/20250215_gh_pages_auth_limits.sql`
   - This enables RLS, capacity controls, and rate limiting

3. **Start development server**:
   ```bash
   npm run dev
   ```
   App runs at http://localhost:5173

4. **Type checking**:
   ```bash
   npm run typecheck
   ```

5. **Run E2E tests**:
   ```bash
   npm run test:e2e          # Headless
   npm run test:e2e:headed   # Headed Chromium for debugging
   ```

---

## Key Conventions

### 1. File Naming & Organization

- **Components**: PascalCase (e.g., `TaskCard.tsx`, `ImportanceUrgencyGraph.tsx`)
- **Routes**: kebab-case (e.g., `add-todo.tsx`, `auth.callback.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `supabase.client.ts`)
- **Types**: camelCase file, PascalCase exports (e.g., `todo.ts` exports `Todo` interface)

### 2. TypeScript Standards

- **Strict mode**: Enabled in `tsconfig.json`
- **No `any` types**: Without clear justification
- **Type imports**: Use `import type` for type-only imports
- **Path aliases**: `~/` maps to `app/` (e.g., `~/types/todo`)

### 3. React Router v7 Patterns

- **No SSR**: `ssr: false` in `react-router.config.ts`
- **Client-side data fetching**: Use Supabase client directly in components
- **Navigation**: Use `<Link>` from `react-router` for SPA routing
- **State passing**: Use route state for multi-step flows (e.g., add-todo → position)

### 4. Supabase Client Usage

- **Browser client**: Always use `supabaseClient` from `app/lib/supabase.client.ts`
- **Session management**: Handled by `AuthProvider` in `app/lib/auth-context.tsx`
- **Error handling**: Always catch and handle Supabase errors gracefully

### 5. Styling Conventions

- **Always reference `docs/StyleGuide.md`** before writing UI code
- **Tailwind CSS**: Use utility classes; avoid custom CSS unless necessary
- **Color palette**: Use design tokens from StyleGuide.md
- **Accessibility**: WCAG 2.1 AA compliance is mandatory
  - 4.5:1 text contrast minimum
  - 16px minimum font size for body text
  - 44px × 44px minimum touch targets
  - Focus indicators on all interactive elements
  - Respect `prefers-reduced-motion`

### 6. Component Patterns

- **Functional components**: Use React hooks (no class components)
- **Props interfaces**: Define TypeScript interfaces for all component props
- **Event handlers**: Prefix with `handle` (e.g., `handleDragEnd`, `handleSubmit`)
- **Optimistic UI**: Implement for drag-and-drop and mutations

---

## Development Workflows

### Before Starting Any Task

1. ✅ Read relevant sections of `.claude/rules.md`
2. ✅ Review `docs/StyleGuide.md` for UI/styling requirements
3. ✅ Check `docs/PROJECT_STATUS.md` for current implementation status
4. ✅ Understand the user flow and technical requirements
5. ✅ Identify files to create/modify and plan tests

### Adding a New Feature

1. **Plan**:
   - Define user flow
   - Identify affected components/routes
   - Review existing similar features

2. **Implement**:
   - Follow TypeScript strict mode
   - Use existing utilities (e.g., `calculatePriority`, `sortByPriority`)
   - Handle errors gracefully with user-friendly messages
   - Implement loading states

3. **Test**:
   - Write unit tests (Vitest - see `.claude/rules.md` for setup)
   - Test manually in browser
   - Run `npm run typecheck`
   - Add E2E tests if user-facing flow

4. **Style**:
   - Follow `docs/StyleGuide.md`
   - Ensure accessibility (keyboard nav, ARIA labels, screen reader support)
   - Test with `prefers-reduced-motion` enabled

5. **Document**:
   - Add JSDoc comments to exported functions
   - Update `docs/PROJECT_STATUS.md` if needed
   - Document complex logic with inline comments

### Making Changes to Existing Code

1. **Read the code first**: Understand current implementation
2. **Maintain consistency**: Follow existing patterns in the file
3. **Run tests**: Ensure no regressions
4. **Update tests**: Modify tests to reflect changes
5. **Check related files**: Update imports, types, etc.

### Git Commit Guidelines

- **Descriptive messages**: Focus on "why" not "what"
- **Present tense**: "Add feature" not "Added feature"
- **Reference issues**: Include issue/PR numbers if applicable
- **Atomic commits**: One logical change per commit

Example:
```
Add task deletion with confirmation modal

Users can now delete tasks with a confirmation dialog to prevent
accidental deletions. Implements RLS policy for delete operations.

Fixes #42
```

---

## Database Schema & RLS

### Tables

#### `todos` Table

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  importance integer not null check (importance >= 0 and importance <= 100),
  urgency integer not null check (urgency >= 0 and urgency <= 100),
  status text not null default 'todo' check (status in ('todo', 'scheduled', 'completed')),
  position integer not null default 0,
  completed_at timestamptz
);
```

#### `user_profiles` Table

```sql
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);
```

### Row Level Security (RLS)

**IMPORTANT**: The Supabase migration script (`supabase/migrations/20250215_gh_pages_auth_limits.sql`) must be applied before inviting users.

#### Policies

- **todos**: Users can only select/insert/update/delete their own tasks
- **user_profiles**: Users can only select/insert/update their own profile

#### Capacity & Rate Limiting

- **User capacity**: Hard limit of 100 active user accounts
  - Function `ensure_user_slot()` enforces this on first task creation
  - Function `check_user_capacity()` allows pre-checking before signup

- **Task limits per user**:
  - Maximum 30 active (non-completed) tasks
  - Maximum 1 task insert per second
  - Enforced via `handle_todo_insert()` trigger on `todos` table

#### Error Codes

When limits are exceeded, Supabase raises exceptions:
- `PMCAP`: User capacity reached (100 users)
- `PMTMA`: Task max reached (30 active tasks)
- `PMTRL`: Task rate limit (1 task/sec)
- `PMNUL`: User ID required but null

Handle these in the UI with user-friendly messages.

---

## Testing Strategy

### Type Checking

```bash
npm run typecheck
```

Runs React Router type generation + TypeScript compiler. **Must pass** before committing.

### End-to-End Tests (Playwright)

Located in `tests/e2e/app.spec.ts`. Configuration in `playwright.config.ts`.

**Current test mode**: Uses `.env.test` for test environment variables.

```bash
npm run test:e2e          # Headless (CI-friendly)
npm run test:e2e:headed   # Headed mode for debugging
```

**Test scenarios to cover**:
- User signup and login flow
- Task creation (form → position graph → save)
- Drag-and-drop task status updates
- Task filtering and sorting
- Capacity limits and error messages
- Rate limiting feedback

### Unit Tests (Planned)

See `.claude/rules.md` for Vitest setup instructions. Test coverage requirements:
- **Components**: Rendering, interactions, props, edge cases
- **Utilities**: All function inputs/outputs, edge cases, error handling
- **Routes**: Loaders, actions, success/error states

**Target coverage**: >80%

---

## Deployment

### GitHub Pages (Primary)

**Workflow**: `.github/workflows/deploy-gh-pages.yml`

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Process**:
1. Install dependencies (`npm ci`)
2. Build static SPA (`npm run build -- --mode production`)
   - Sets `VITE_APP_BASE_PATH=/<repo-name>/`
   - Uses secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Upload `build/client` artifact
4. Deploy to GitHub Pages via `actions/deploy-pages@v4`

**First-time setup**:
1. Add repository secrets in GitHub:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Enable GitHub Pages:
   - Go to repo Settings → Pages
   - Set source to "GitHub Actions"
3. Apply Supabase migration script
4. Push to `main` or trigger workflow manually

**Local testing**:
```bash
npm run build -- --mode production
npx serve build/client --single
```

### Vercel (Alternative)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Docker (Alternative)

**Dockerfile** is provided for containerized deployments.

```bash
docker build -t priority-matrix .
docker run -p 3000:3000 priority-matrix
```

**Compatible platforms**:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

---

## Common Tasks

### Adding a New Route

1. Create route file in `app/routes/` (e.g., `my-route.tsx`)
2. Export default component:
   ```tsx
   export default function MyRoute() {
     return <div>My Route</div>;
   }
   ```
3. React Router will auto-discover the route
4. Link to it: `<Link to="/my-route">Go</Link>`

### Adding a New Component

1. Create component file in `app/components/` (e.g., `MyComponent.tsx`)
2. Define props interface:
   ```tsx
   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }
   ```
3. Export component:
   ```tsx
   export default function MyComponent({ title, onAction }: MyComponentProps) {
     return <button onClick={onAction}>{title}</button>;
   }
   ```
4. Import in route: `import MyComponent from "~/components/MyComponent";`

### Querying Supabase

```tsx
import { supabaseClient } from "~/lib/supabase.client";

// Fetch data
const { data, error } = await supabaseClient
  .from("todos")
  .select("*")
  .eq("status", "todo")
  .order("created_at", { ascending: false });

if (error) {
  console.error("Error fetching todos:", error);
  // Handle error
}

// Insert data
const { data, error } = await supabaseClient
  .from("todos")
  .insert({ title, importance, urgency, status: "todo" })
  .select()
  .single();

// Update data
const { error } = await supabaseClient
  .from("todos")
  .update({ status: "completed" })
  .eq("id", todoId);

// Delete data
const { error } = await supabaseClient
  .from("todos")
  .delete()
  .eq("id", todoId);
```

### Using Priority Calculation

```tsx
import { calculatePriority, sortByPriority } from "~/lib/utils";
import type { Todo } from "~/types/todo";

// Calculate priority for a single task
const priority = calculatePriority(task);

// Sort tasks by priority
const sortedTasks = [...tasks].sort(sortByPriority);
```

### Implementing Drag & Drop

Use `@dnd-kit` as demonstrated in `app/routes/todos.tsx`:

```tsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;

  // Optimistic UI update
  // Then sync to Supabase
}

<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
    {tasks.map(task => <TaskCard key={task.id} task={task} />)}
  </SortableContext>
</DndContext>
```

### Handling Authentication State

Use the `AuthProvider` and `useAuth` hook:

```tsx
import { useAuth } from "~/lib/auth-context";

function MyComponent() {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <Link to="/login">Sign In</Link>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## Troubleshooting

### Build Issues

**Issue**: `Module not found` errors
- **Fix**: Run `npm install` to ensure all dependencies are installed
- Check that path aliases in `tsconfig.json` match imports

**Issue**: Environment variables not working
- **Fix**: Ensure variables are prefixed with `VITE_`
- Restart dev server after changing `.env`

### Supabase Issues

**Issue**: `Missing Supabase environment variables`
- **Fix**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: Authentication not working
- **Fix**: Check Supabase dashboard → Authentication → Settings
- Ensure magic link redirects to correct URL (e.g., `http://localhost:5173/auth/callback`)

**Issue**: RLS policy blocking queries
- **Fix**: Ensure Supabase migration has been applied
- Check that user is authenticated (`auth.uid()` is not null)
- Verify policies in Supabase dashboard → Database → Policies

**Issue**: `PMCAP` or `PMTMA` errors
- **Fix**: These are expected when limits are reached
- Display user-friendly messages in UI
- For capacity errors, show the `/capacity` page

### Deployment Issues

**Issue**: GitHub Pages shows 404 for routes
- **Fix**: The `public/404.html` redirect helper should be in place
- Ensure `react-router.config.ts` has correct `basename`

**Issue**: Assets not loading on GitHub Pages
- **Fix**: Check `VITE_APP_BASE_PATH` is set correctly (e.g., `/PriorityMatrix/`)
- Verify `base` in `vite.config.ts` uses the environment variable

**Issue**: Environment secrets not working in GitHub Actions
- **Fix**: Add secrets in repo Settings → Secrets and variables → Actions
- Ensure secret names match exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Testing Issues

**Issue**: Playwright tests fail locally
- **Fix**: Install browsers: `npx playwright install`
- Ensure `.env.test` exists with test environment variables

**Issue**: Type errors after pulling changes
- **Fix**: Run `npm run typecheck` to regenerate types
- Clear `.react-router` directory and rebuild

---

## Best Practices for AI Assistants

### 1. Always Reference Documentation First

- Check `.claude/rules.md` for project-specific rules
- Consult `docs/StyleGuide.md` before writing UI code
- Review `docs/PROJECT_STATUS.md` for current implementation state

### 2. Maintain Code Quality

- Run `npm run typecheck` before committing
- Handle all errors gracefully with user-friendly messages
- Add JSDoc comments to exported functions
- Write tests for new features (see `.claude/rules.md`)

### 3. Follow Accessibility Guidelines

- Ensure WCAG 2.1 AA compliance
- Use semantic HTML elements
- Add ARIA labels for screen readers
- Test keyboard navigation
- Respect `prefers-reduced-motion`

### 4. Security Considerations

- Never expose Supabase keys in client-side code
- Always rely on RLS policies for data access control
- Validate user input on the client
- Handle rate limiting and capacity errors gracefully

### 5. Performance Optimization

- Use optimistic UI updates for better UX
- Minimize re-renders with proper React patterns
- Leverage Supabase query filters to reduce data transfer
- Implement proper loading states

### 6. Version Control

- Write clear, descriptive commit messages
- Make atomic commits (one logical change per commit)
- Keep commits focused and reviewable
- Follow the project's Git workflow

---

## Additional Resources

- **React Router v7 Docs**: https://reactrouter.com/
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **@dnd-kit Docs**: https://docs.dndkit.com/
- **Playwright Docs**: https://playwright.dev/

---

## Summary

PriorityMatrix is a well-structured, type-safe SPA with clear separation of concerns. Follow the conventions outlined in this document, reference the style guide for UI work, and always prioritize accessibility and security. When in doubt, check the existing code for patterns and consult the documentation.

Happy coding! 🚀
