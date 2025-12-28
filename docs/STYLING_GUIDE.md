# Styling Guide

## Overview

The VA Claim Readiness Diagnostic uses a modern, accessible CSS architecture built on custom properties (CSS variables), glassmorphism effects, and responsive design principles. This guide documents the styling system to help developers understand and migrate the visual design to React.

---

## Table of Contents

1. [CSS Architecture](#css-architecture)
2. [Design System](#design-system)
3. [Glassmorphism Effects](#glassmorphism-effects)
4. [Responsive Design](#responsive-design)
5. [Animations & Transitions](#animations--transitions)
6. [Accessibility Features](#accessibility-features)
7. [Component-Specific Styling](#component-specific-styling)
8. [Migration Considerations](#migration-considerations)

---

## CSS Architecture

### Custom Properties (CSS Variables)

All styling is built on a foundation of CSS custom properties defined in the `:root` selector. This approach provides:

- **Centralized theming**: All colors, spacing, and timing values in one place
- **Easy maintenance**: Change a value once, update everywhere
- **Runtime flexibility**: Can be modified with JavaScript if needed
- **Better DX**: Semantic naming makes code self-documenting

### Organization Structure

The CSS is organized into logical sections:

```css
:root {
  /* Brand Colors */
  /* Spacing System */
  /* Border Radius */
  /* Shadows */
  /* Glassmorphism Effects */
  /* Typography */
  /* Transitions */
  /* Z-Index Layers */
}
```

### Naming Conventions

- **Colors**: `--navy-primary`, `--blue-accent`, `--gray-600`
- **Spacing**: `--spacing-xs` through `--spacing-2xl`
- **Radius**: `--radius-sm` through `--radius-xl`
- **Shadows**: `--shadow-soft`, `--shadow-medium`, `--shadow-hard`
- **Typography**: `--font-size-sm` through `--font-size-3xl`
- **Transitions**: `--transition-fast`, `--transition-normal`, `--transition-slow`

---

## Design System

### Color Palette

#### Primary Navy Colors
```css
--navy-primary: #163b63;  /* Main brand color */
--navy-dark: #0f243d;     /* Darker variant for text/emphasis */
--navy-light: #1f4f85;    /* Lighter variant for gradients */
```

#### Accent Colors
```css
--blue-accent: #3b82f6;   /* Interactive elements, focus states */
--red-cta: #dc2626;       /* Call-to-action buttons */
```

#### Recommendation Colors
```css
--green-ready: #10b981;      /* Score 0-2: Strong/Ready */
--blue-optional: #3b82f6;    /* (Reserved for future use) */
--yellow-beneficial: #f59e0b; /* Score 3-6: Mostly ready */
--red-recommended: #dc2626;   /* Score 7-10: High risk */
```

#### Neutral Colors
```css
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-900: #111827;
```

### Spacing System

8px base unit with consistent scale:

```css
--spacing-xs: 8px;    /* Tight spacing */
--spacing-sm: 12px;   /* Small gaps */
--spacing-md: 16px;   /* Default spacing */
--spacing-lg: 24px;   /* Section spacing */
--spacing-xl: 32px;   /* Large sections */
--spacing-2xl: 48px;  /* Major sections */
```

**Usage Pattern**: Use spacing variables for all padding, margin, and gap properties to maintain consistency.

### Border Radius

```css
--radius-sm: 8px;     /* Small elements */
--radius-md: 12px;    /* Cards, buttons */
--radius-lg: 16px;    /* Large containers */
--radius-xl: 24px;    /* Pills, badges */
```

### Shadows

Three levels of elevation:

```css
--shadow-soft: 0 10px 30px rgba(15, 36, 61, 0.12);    /* Subtle depth */
--shadow-medium: 0 15px 40px rgba(15, 36, 61, 0.18);  /* Cards */
--shadow-hard: 0 20px 50px rgba(15, 36, 61, 0.25);    /* Modals */
```

### Typography

#### Font Families
```css
--font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
```

Uses system fonts for optimal performance and native feel.

#### Font Sizes
```css
--font-size-sm: 14px;    /* Helper text, labels */
--font-size-base: 16px;  /* Body text */
--font-size-lg: 18px;    /* Emphasized text */
--font-size-xl: 24px;    /* Section headings */
--font-size-2xl: 32px;   /* Page headings */
--font-size-3xl: 40px;   /* Hero titles */
```

#### Line Heights
- Body text: `1.6` (optimal readability)
- Headings: `1.3` (tighter for visual impact)
- Helper text: `1.7` (more breathing room)

---

## Glassmorphism Effects

### Core Technique

Glassmorphism creates a frosted glass effect using:

1. **Semi-transparent background**: `rgba(255, 255, 255, 0.85)`
2. **Backdrop blur**: `backdrop-filter: blur(20px)`
3. **Subtle border**: `border: 1px solid rgba(255, 255, 255, 0.4)`
4. **Soft shadow**: `box-shadow: var(--shadow-medium)`

### CSS Variables for Glass Effects

```css
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-blur: blur(10px);
```

### Implementation Pattern

```css
.glass-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);  /* Safari support */
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: var(--shadow-medium);
}
```

### Layered Glass Effects

Different opacity levels create depth:

- **Primary containers**: `rgba(255, 255, 255, 0.85)` with `blur(20px)`
- **Secondary elements**: `rgba(255, 255, 255, 0.7)` with `blur(12px)`
- **Tertiary items**: `rgba(255, 255, 255, 0.6)` with `blur(8px)`

### Background Gradient

Navy gradient with radial overlays:

```css
body {
  background: linear-gradient(135deg, 
    #0f243d 0%, 
    #163b63 25%, 
    #1f4f85 50%, 
    #163b63 75%, 
    #0f243d 100%);
  background-attachment: fixed;
}

body::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(31, 79, 133, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}
```

---

## Responsive Design

### Mobile-First Approach

All base styles are optimized for mobile, with progressive enhancement for larger screens.

### Breakpoints

```css
/* Mobile devices (≤768px) - Base styles */
/* Tablet devices (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop devices (>1024px) */
@media (min-width: 1025px) { }

/* Large desktop (>1920px) */
@media (min-width: 1921px) { }

/* Extra small mobile (≤480px) */
@media (max-width: 480px) { }

/* Tiny screens (≤320px) */
@media (max-width: 320px) { }
```

### Touch Target Sizes

All interactive elements meet WCAG 2.1 Level AAA requirements:

```css
.btn, .answer-card {
  min-height: 44px;  /* Minimum touch target */
  min-width: 44px;
}
```

### Responsive Typography

Font sizes scale down on mobile:

```css
/* Desktop */
.intro-title { font-size: var(--font-size-3xl); /* 40px */ }

/* Mobile (≤768px) */
.intro-title { font-size: var(--font-size-2xl); /* 32px */ }

/* Small mobile (≤480px) */
.intro-title { font-size: var(--font-size-xl); /* 24px */ }
```

### Responsive Containers

```css
.diagnostic-container {
  max-width: 800px;
  padding: var(--spacing-2xl) var(--spacing-md);
}

@media (max-width: 768px) {
  .diagnostic-container {
    padding: var(--spacing-lg) var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .diagnostic-container {
    padding: var(--spacing-md) var(--spacing-sm);
  }
}
```

### Responsive Grids

Two-column layouts collapse to single column on mobile:

```css
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Animations & Transitions

### Transition Timing

```css
--transition-fast: 150ms ease;     /* Micro-interactions */
--transition-normal: 300ms ease;   /* Standard transitions */
--transition-slow: 500ms ease;     /* Dramatic effects */
```

### Screen Transitions

Fade and slide animations for screen changes:

```css
.fade-out {
  opacity: 0 !important;
  transition: opacity 400ms ease;
}

.fade-in {
  opacity: 1 !important;
  transition: opacity 400ms ease;
}

.slide-out {
  transform: translateX(-30px);
  transition: transform 400ms ease, opacity 400ms ease;
}

.slide-in {
  transform: translateX(0);
  transition: transform 400ms ease, opacity 400ms ease;
}
```

### Answer Selection Feedback

Pulse animation on answer selection:

```css
@keyframes answer-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.answer-selected {
  animation: answer-pulse 300ms ease;
}
```

### Hover Effects

#### Card Hover
```css
.answer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(15, 36, 61, 0.18);
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.9);
}
```

#### Button Hover with Shine Effect
```css
.btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.btn-primary:hover::before {
  transform: translateX(100%);
}
```

### Reduced Motion Support

Respects user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0.01s;
    --transition-normal: 0.01s;
    --transition-slow: 0.01s;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implementation**: JavaScript checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and uses 0ms durations when enabled.

---

## Accessibility Features

### Skip Link

Keyboard users can skip to main content:

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--navy-primary);
  color: var(--white);
  padding: var(--spacing-sm) var(--spacing-md);
  z-index: var(--z-overlay);
}

.skip-link:focus {
  top: 0;
  outline: 3px solid var(--blue-accent);
  outline-offset: 2px;
}
```

### Focus Indicators

All interactive elements have visible focus states:

```css
.answer-card:focus {
  outline: 3px solid var(--blue-accent);
  outline-offset: 3px;
}

.btn-primary:focus {
  outline: 3px solid var(--blue-accent);
  outline-offset: 3px;
}
```

### Color Contrast

All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

- **Body text**: `#111827` on `#ffffff` (16.1:1)
- **Navy text**: `#0f243d` on `#ffffff` (14.8:1)
- **Helper text**: `#4b5563` on `#ffffff` (7.5:1)
- **White on navy**: `#ffffff` on `#163b63` (7.2:1)
- **White on red CTA**: `#ffffff` on `#dc2626` (5.9:1)

### ARIA Support

Decorative icons hidden from screen readers:

```css
.trust-note-icon[aria-hidden="true"] {
  /* Visual only, not announced */
}
```

---

## Component-Specific Styling

### Answer Cards

Glassmorphism with interactive states:

```css
.answer-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 8px 24px rgba(15, 36, 61, 0.12);
  min-height: 44px;
}

.answer-card.selected {
  background: linear-gradient(135deg, var(--navy-primary), var(--navy-light));
  color: var(--white);
  border-color: var(--navy-primary);
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(22, 59, 99, 0.3);
}
```

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, var(--navy-primary), var(--navy-light));
  color: var(--white);
  box-shadow: 0 8px 24px rgba(22, 59, 99, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  min-height: 44px;
}
```

#### CTA Button (Red)
```css
.btn-cta {
  background: linear-gradient(135deg, var(--red-cta), #b91c1c);
  color: var(--white);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
  font-size: var(--font-size-lg);
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-md);
}
```

### Progress Bar

Minimal design with gradient fill:

```css
.progress-bar-container {
  width: 100%;
  height: 2px;
  background: var(--navy-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--navy-primary), var(--blue-accent));
  border-radius: var(--radius-xl);
  transition: transform var(--transition-normal);
  transform-origin: left center;
}
```

### Trust Notes

Pill-shaped badges with glassmorphism:

```css
.trust-note {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 12px rgba(15, 36, 61, 0.08);
}
```

### Assessment Areas

Clean list items with left border accent:

```css
.assessment-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all var(--transition-fast);
}

.assessment-area:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 16px rgba(15, 36, 61, 0.12);
}
```

---

## Migration Considerations

### React/CSS-in-JS Approach

#### Option 1: CSS Modules
```jsx
import styles from './DiagnosticCard.module.css';

<div className={styles.answerCard}>
  {/* content */}
</div>
```

#### Option 2: Styled Components
```jsx
import styled from 'styled-components';

const AnswerCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  /* ... */
`;
```

#### Option 3: Tailwind CSS
Convert custom properties to Tailwind config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'navy-primary': '#163b63',
        'navy-dark': '#0f243d',
        // ...
      },
      spacing: {
        'xs': '8px',
        'sm': '12px',
        // ...
      }
    }
  }
}
```

### Preserving Glassmorphism

Ensure backdrop-filter support:

```jsx
// Check for support
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') ||
                                CSS.supports('-webkit-backdrop-filter', 'blur(10px)');

// Fallback for unsupported browsers
const glassStyle = supportsBackdropFilter
  ? { backdropFilter: 'blur(20px)' }
  : { background: 'rgba(255, 255, 255, 0.95)' }; // More opaque fallback
```

### Animation Libraries

Consider using:
- **Framer Motion**: For complex animations and gestures
- **React Spring**: For physics-based animations
- **CSS Transitions**: Keep simple transitions in CSS

### Responsive Hooks

Use React hooks for responsive behavior:

```jsx
import { useMediaQuery } from 'react-responsive';

const isMobile = useMediaQuery({ maxWidth: 768 });
const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
```

### Theme Provider Pattern

Wrap app in theme provider:

```jsx
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    navyPrimary: '#163b63',
    // ...
  },
  spacing: {
    xs: '8px',
    // ...
  }
};

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### CSS Custom Properties in React

Keep using CSS variables for runtime theming:

```jsx
// Set CSS variable dynamically
document.documentElement.style.setProperty('--primary-color', newColor);

// Or use inline styles
<div style={{ color: 'var(--navy-primary)' }}>
```

---

## Best Practices

1. **Always use CSS custom properties** for colors, spacing, and timing
2. **Test glassmorphism** across browsers (Safari, Firefox, Chrome)
3. **Verify color contrast** with tools like WebAIM Contrast Checker
4. **Test responsive design** at all breakpoints (320px, 480px, 768px, 1024px, 1920px)
5. **Check reduced motion** support with browser DevTools
6. **Validate focus indicators** are visible on all interactive elements
7. **Use semantic HTML** with proper ARIA attributes
8. **Optimize animations** to use only `transform` and `opacity` (no layout shifts)
9. **Test touch targets** on actual mobile devices (minimum 44x44px)
10. **Maintain consistent spacing** using the spacing scale

---

## Resources

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Glassmorphism Generator**: https://glassmorphism.com/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- **Backdrop Filter Support**: https://caniuse.com/css-backdrop-filter

---

**Last Updated**: December 2024
