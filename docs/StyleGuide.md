# PriorityMatrix Style Guide

## Design Philosophy

- **Accessibility First**: WCAG 2.1 AA compliant colors, keyboard navigation, screen reader friendly
- **Easy on the Eyes**: Soft colors, reduced contrast where appropriate, generous whitespace
- **Clear Hierarchy**: Visual weight guides attention to important elements
- **Smooth Interactions**: Subtle animations that don't distract

## Color Palette

### Primary Colors
```css
--primary-50: #f0f9ff;    /* Lightest blue - backgrounds */
--primary-100: #e0f2fe;   /* Light blue - hover states */
--primary-200: #bae6fd;   /* Soft blue - borders */
--primary-500: #0ea5e9;   /* Main blue - primary actions */
--primary-600: #0284c7;   /* Deep blue - hover on primary */
--primary-700: #0369a1;   /* Darker blue - active states */
```

### Neutral Colors
```css
--gray-50: #f9fafb;       /* Background */
--gray-100: #f3f4f6;      /* Card backgrounds */
--gray-200: #e5e7eb;      /* Borders */
--gray-300: #d1d5db;      /* Disabled elements */
--gray-400: #9ca3af;      /* Placeholder text */
--gray-500: #6b7280;      /* Secondary text */
--gray-600: #4b5563;      /* Body text */
--gray-700: #374151;      /* Headings */
--gray-800: #1f2937;      /* Dark headings */
--gray-900: #111827;      /* Maximum contrast text */
```

### Semantic Colors
```css
--success-100: #d1fae5;   /* Light green backgrounds */
--success-500: #10b981;   /* Success green */
--success-600: #059669;   /* Success hover */

--warning-100: #fef3c7;   /* Light yellow backgrounds */
--warning-500: #f59e0b;   /* Warning amber */
--warning-600: #d97706;   /* Warning hover */

--error-100: #fee2e2;     /* Light red backgrounds */
--error-500: #ef4444;     /* Error red */
--error-600: #dc2626;     /* Error hover */

--info-100: #dbeafe;      /* Light blue backgrounds */
--info-500: #3b82f6;      /* Info blue */
--info-600: #2563eb;      /* Info hover */
```

### Quadrant Colors (Eisenhower Matrix)
```css
--quadrant-do-first: #fee2e2;      /* Soft red - High Importance, High Urgency */
--quadrant-schedule: #dbeafe;      /* Soft blue - High Importance, Low Urgency */
--quadrant-delegate: #fef3c7;      /* Soft yellow - Low Importance, High Urgency */
--quadrant-eliminate: #f3f4f6;     /* Soft gray - Low Importance, Low Urgency */
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px - Small labels */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text (MINIMUM for readability) */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Section headings */
--text-3xl: 1.875rem;    /* 30px - Page headings */
--text-4xl: 2.25rem;     /* 36px - Hero text */
```

### Font Weights
```css
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasis */
--font-semibold: 600;    /* Buttons, labels */
--font-bold: 700;        /* Headings */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Comfortable reading */
```

## Spacing Scale

Use consistent spacing based on 4px increments:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## Component Styles

### Buttons

```css
/* Primary Button */
.btn-primary {
  background-color: var(--primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 150ms ease-in-out;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.btn-primary:hover {
  background-color: var(--primary-600);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transform: translateY(-1px);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Secondary Button */
.btn-secondary {
  background-color: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 150ms ease-in-out;
}

.btn-secondary:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}
```

### Cards

```css
.card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: box-shadow 150ms ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.card-dragging {
  opacity: 0.5;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

### Form Inputs

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--gray-900);
  background-color: white;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  transition: all 150ms ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.1);
}

.input::placeholder {
  color: var(--gray-400);
}

.input:disabled {
  background-color: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}
```

### Labels

```css
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}
```

## Layout Guidelines

### Container Widths
```css
.container-sm {
  max-width: 640px;   /* Forms, simple content */
  margin: 0 auto;
  padding: 0 1rem;
}

.container-md {
  max-width: 768px;   /* Standard content */
  margin: 0 auto;
  padding: 0 1rem;
}

.container-lg {
  max-width: 1024px;  /* Task list, wide layouts */
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Page Padding
```css
.page {
  padding: 2rem 1rem;
  min-height: 100vh;
  background-color: var(--gray-50);
}
```

## Accessibility Requirements

### Focus States
- All interactive elements MUST have visible focus indicators
- Use `outline` or `box-shadow` for focus rings
- Minimum contrast ratio of 3:1 for focus indicators

### Color Contrast
- Text contrast ratio: **4.5:1 minimum** for normal text
- Large text (18px+ or 14px+ bold): **3:1 minimum**
- Never rely on color alone to convey information

### Touch Targets
- Minimum size: **44px × 44px** (use padding to achieve this)
- Minimum spacing between targets: **8px**

### Screen Reader Support
```html
<!-- Always include aria-labels for icon-only buttons -->
<button aria-label="Close dialog">
  <XIcon />
</button>

<!-- Use aria-live for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  Task added successfully
</div>

<!-- Proper heading hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

## Animation Guidelines

### Transition Timing
```css
/* Fast - UI feedback */
--transition-fast: 150ms ease-in-out;

/* Normal - Most interactions */
--transition-normal: 250ms ease-in-out;

/* Slow - Complex animations */
--transition-slow: 350ms ease-in-out;
```

### Reduced Motion
Always respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Dark Mode (Future Enhancement)

Prepare for dark mode support:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--gray-900);
    --bg-secondary: var(--gray-800);
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-400);
  }
}
```

## Tailwind CSS Configuration

Add these to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        quadrant: {
          'do-first': '#fee2e2',
          'schedule': '#dbeafe',
          'delegate': '#fef3c7',
          'eliminate': '#f3f4f6',
        }
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'hard': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'soft': '0.75rem',
      }
    },
  },
  plugins: [],
}
```

## Implementation Checklist

- [ ] Use minimum 16px font size for body text
- [ ] Ensure 4.5:1 contrast ratio for all text
- [ ] Add focus indicators to all interactive elements
- [ ] Make touch targets at least 44px × 44px
- [ ] Include aria-labels for screen readers
- [ ] Respect `prefers-reduced-motion`
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify color-blind friendly (don't rely on color alone)

## Example Component Usage

```tsx
// Task Card Example
<div className="bg-white rounded-lg p-4 shadow-soft hover:shadow-medium transition-shadow cursor-move">
  <h3 className="text-lg font-semibold text-gray-800 mb-2">
    Task Title
  </h3>
  <div className="flex gap-2 mb-2">
    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
      I: 75
    </span>
    <span className="text-xs px-2 py-1 bg-warning-100 text-warning-700 rounded">
      U: 60
    </span>
  </div>
  <p className="text-sm text-gray-600">
    Due: March 15, 2025
  </p>
</div>
```

---

**Remember: Accessibility is not optional. Every user should be able to use this app comfortably.**