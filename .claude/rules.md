# Claude Code Rules

## Project Context

This is a Todo App with Eisenhower Matrix prioritization built with:
- **Framework**: Remix (TypeScript)
- **Database**: Supabase
- **Hosting**: Vercel
- **Key Features**: Importance/Urgency graph, drag-and-drop task management

## Core Principles

### 1. Always Reference the Development Plan

- **BEFORE writing any code**, review the relevant section in the development plan
- **BEFORE making architectural decisions**, confirm they align with the plan's tech stack and structure
- **BEFORE creating new files**, verify the file structure matches the plan
- If the plan is unclear or incomplete for a specific task, ask for clarification before proceeding
- When implementing features, follow the exact user flow specified in the plan:
  1. Home screen → 2. Add todo form → 3. Position graph → 4. Loading animation → 5. Todo list

### 2. Write Unit Tests for All Code

**Test Requirements:**
- Write tests using Vitest (Remix's default test framework)
- Every component MUST have corresponding tests
- Every utility function MUST have corresponding tests
- Every route with business logic MUST have tests

**Test File Structure:**
```
app/
├── components/
│   ├── ImportanceUrgencyGraph.tsx
│   └── ImportanceUrgencyGraph.test.tsx
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── routes/
    ├── todos.tsx
    └── todos.test.tsx
```

**Test Coverage Requirements:**
- **Components**: Test rendering, user interactions, prop handling, edge cases
- **Utils**: Test all function inputs/outputs, edge cases, error handling
- **Routes**: Test loaders, actions, success/error states
- Aim for >80% code coverage

**When to Write Tests:**
- Write tests IMMEDIATELY after writing the implementation
- Never commit code without corresponding tests
- If you create a new component, create its test file in the same commit

### 3. Test Writing Guidelines

**Component Tests Should Cover:**
```typescript
// Example structure for component tests
describe('ComponentName', () => {
  it('renders correctly with required props', () => {});
  it('handles user interactions', () => {});
  it('handles edge cases (empty data, null values)', () => {});
  it('calls callbacks with correct parameters', () => {});
  it('applies correct styling/classes', () => {});
});
```

**Utility Function Tests Should Cover:**
```typescript
// Example structure for utility tests
describe('functionName', () => {
  it('returns correct output for valid input', () => {});
  it('handles edge cases (0, negative, null, undefined)', () => {});
  it('handles boundary conditions', () => {});
  it('throws appropriate errors for invalid input', () => {});
});
```

**Route Tests Should Cover:**
```typescript
// Example structure for route tests
describe('Route: /path', () => {
  describe('loader', () => {
    it('fetches and returns correct data', () => {});
    it('handles database errors', () => {});
  });
  
  describe('action', () => {
    it('processes valid form data correctly', () => {});
    it('validates input', () => {});
    it('handles errors gracefully', () => {});
  });
});
```

### 4. Code Quality Standards

**TypeScript:**
- Use strict TypeScript - no `any` types without justification
- Define interfaces for all data structures
- Use the types defined in `app/types/todo.ts`

**Error Handling:**
- Always handle potential errors from Supabase calls
- Provide user-friendly error messages
- Log errors for debugging

**Accessibility:**
- Use semantic HTML
- Include ARIA labels where appropriate
- Ensure keyboard navigation works
- Test with screen readers when possible

**Performance:**
- Optimize re-renders in React components
- Use proper loading states
- Implement optimistic UI updates for drag-and-drop

**Design & Styling:**
- **ALWAYS reference `docs/StyleGuide.md` before writing any UI code**
- Follow the color palette, typography, and spacing guidelines
- Ensure WCAG 2.1 AA compliance (4.5:1 text contrast minimum)
- Use minimum 16px font size for body text
- Make touch targets at least 44px × 44px
- Respect `prefers-reduced-motion` for animations
- Include focus indicators on all interactive elements
- Never rely on color alone to convey information

## Development Workflow

### Before Starting Any Task:
1. ✅ Read the relevant section of the development plan
2. ✅ Review `docs/StyleGuide.md` for UI/styling requirements
3. ✅ Understand the user flow and technical requirements
4. ✅ Identify what files need to be created/modified
5. ✅ Plan what tests will be needed

### While Implementing:
1. ✅ Write the implementation following the plan
2. ✅ Write tests immediately after implementation
3. ✅ Run tests to ensure they pass
4. ✅ Check that code follows TypeScript best practices

### Before Marking Complete:
1. ✅ All tests pass
2. ✅ Code follows the plan's structure
3. ✅ Error handling is in place
4. ✅ No TypeScript errors
5. ✅ User flow matches the specification

## Specific Project Requirements

### Database Interactions:
- Always use the `createServerClient()` from `app/lib/supabase.server.ts`
- Never expose Supabase keys in client-side code
- Handle database errors gracefully

### Priority Calculation:
- Use the `calculatePriority()` function from `app/lib/utils.ts`
- Never implement custom sorting logic - always use `sortByPriority()`

### Drag and Drop:
- Use @dnd-kit as specified in the plan
- Implement optimistic UI updates
- Handle failed updates with error messages

### Navigation Flow:
- Maintain the exact flow: Home → Add Form → Position → Saving → List
- Never skip the loading animation screen
- Always pass state correctly between routes

## Testing Setup

### Install Testing Dependencies:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest Config (vitest.config.ts):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
```

### Run Tests:
```bash
npm run test          # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Documentation Requirements

- Add JSDoc comments to all exported functions
- Document complex logic with inline comments
- Keep README.md updated with setup instructions
- Document any deviations from the plan

## When in Doubt

- **Refer to the development plan first**
- Ask for clarification rather than making assumptions
- Prioritize following the plan over clever optimizations
- Write the test even if it seems simple

## Success Criteria

Every file you create or modify should:
1. ✅ Match the structure in the development plan
2. ✅ Have corresponding unit tests
3. ✅ Pass all tests
4. ✅ Have no TypeScript errors
5. ✅ Follow the user flow exactly as specified

---

**Remember: The development plan is your source of truth. Tests are not optional. Quality over speed.**