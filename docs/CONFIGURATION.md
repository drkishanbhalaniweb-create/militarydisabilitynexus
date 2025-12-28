# Configuration Documentation

This document describes all configuration options for the Claim Readiness Diagnostic.

## Question Configuration

Questions are defined in `diagnostic-config.js` as a JavaScript array.

### Question Object Structure

```javascript
{
  id: string,           // Unique identifier (snake_case)
  number: number,       // Question number (1-5)
  title: string,        // Question text displayed to user
  helper: string,       // Helper text explaining the question
  options: [            // Array of answer options
    {
      text: string,     // Answer text displayed to user
      points: number    // Points assigned (0, 1, or 2)
    }
  ]
}
```

### Complete Question Configuration

```javascript
const QUESTIONS = [
  {
    id: 'service_connection',
    number: 1,
    title: 'Service connection clearly documented?',
    helper: 'Medical records, nexus letters, or documented in-service events linking the condition.',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'denial_handling',
    number: 2,
    title: 'Prior VA denial reasons addressed?',
    helper: 'Previous denial letters explain exactly what was missing.',
    options: [
      { text: 'No', points: 2 },
      { text: 'Partially', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'pathway',
    number: 3,
    title: 'Correct claim pathway selected?',
    helper: 'New, supplemental, or increase claims must follow the correct path.',
    options: [
      { text: 'Not sure', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'severity',
    number: 4,
    title: 'Medical severity & impact documented?',
    helper: 'Symptoms, flare-ups, and functional impact on daily life.',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  },
  {
    id: 'secondaries',
    number: 5,
    title: 'All conditions & secondaries identified?',
    helper: 'Secondary conditions are often missed but materially affect ratings.',
    options: [
      { text: 'No', points: 2 },
      { text: 'Somewhat', points: 1 },
      { text: 'Yes', points: 0 }
    ]
  }
];
```

### Scoring Rules

- **0 points**: "Yes" answers - indicates readiness in this area
- **1 point**: "Somewhat", "Partially", "Not sure" - indicates partial readiness
- **2 points**: "No" answers - indicates missing or inadequate preparation

**Total Score Range**: 0-10 (sum of all five answers)

## Recommendation Configuration

Recommendations are defined in `diagnostic-config.js` as a JavaScript object.

### Recommendation Object Structure

```javascript
{
  CATEGORY_NAME: {
    scoreRange: [min, max],  // Inclusive score range
    message: string,         // Recommendation message
    color: string,           // CSS color value (hex)
    icon: string,            // Emoji or icon
    ctaText: string,         // Call-to-action button text
    ctaOptional: boolean     // Whether CTA is optional
  }
}
```

### Complete Recommendation Configuration

```javascript
const RECOMMENDATIONS = {
  FULLY_READY: {
    scoreRange: [0, 0],
    message: 'Your claim is FULLY READY. No Claim Readiness Review is needed.',
    color: '#10b981',  // Green
    icon: '✅',
    ctaText: 'Book review for peace of mind',
    ctaOptional: true
  },
  OPTIONAL_CONFIRMATION: {
    scoreRange: [1, 2],
    message: 'Your claim looks strong. A Claim Readiness Review is OPTIONAL for confirmation.',
    color: '#3b82f6',  // Blue
    icon: 'ℹ️',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false
  },
  REVIEW_BENEFICIAL: {
    scoreRange: [3, 6],
    message: 'Your claim would BENEFIT from a Claim Readiness Review before filing.',
    color: '#f59e0b',  // Yellow
    icon: '⚠️',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false
  },
  REVIEW_STRONGLY_RECOMMENDED: {
    scoreRange: [7, 10],
    message: 'Your claim is NOT READY. A Claim Readiness Review is STRONGLY RECOMMENDED.',
    color: '#dc2626',  // Red
    icon: '❌',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false
  }
};
```

### Recommendation Logic

The system maps total scores to recommendations:

| Score | Recommendation | Color | Meaning |
|-------|---------------|-------|---------|
| 0 | FULLY_READY | Green | All areas adequate, no review needed |
| 1-2 | OPTIONAL_CONFIRMATION | Blue | Strong claim, review optional |
| 3-6 | REVIEW_BENEFICIAL | Yellow | Some gaps, review would help |
| 7-10 | REVIEW_STRONGLY_RECOMMENDED | Red | Significant gaps, review essential |

## Transparency Layer Configuration

The transparency layer shows assessment area status based on answer points.

### Assessment Areas

Each question maps to an assessment area:

```javascript
const ASSESSMENT_AREAS = [
  {
    id: 'service_connection',
    name: 'Service connection clarity',
    description: 'Medical records and nexus documentation'
  },
  {
    id: 'denial_handling',
    name: 'Denial handling',
    description: 'Addressing previous denial reasons'
  },
  {
    id: 'pathway',
    name: 'Pathway selection',
    description: 'Correct claim type selection'
  },
  {
    id: 'severity',
    name: 'Severity documentation',
    description: 'Medical impact documentation'
  },
  {
    id: 'secondaries',
    name: 'Missing secondaries',
    description: 'Secondary condition identification'
  }
];
```

### Status Indicators

Status is determined by answer points:

| Points | Status | Icon | Color | Meaning |
|--------|--------|------|-------|---------|
| 0 | Adequate | ✅ | Green | Area is well-prepared |
| 1 | Needs attention | ⚠️ | Yellow | Area needs improvement |
| 2 | Missing | ❌ | Red | Area is inadequate |

## CSS Custom Properties

Brand colors and styling are defined as CSS custom properties in `diagnostic.html`.

### Color Palette

```css
:root {
  /* Brand Colors - Military Disability Nexus */
  --navy-primary: #163b63;
  --navy-dark: #0f243d;
  --navy-light: #1f4f85;
  --blue-accent: #3b82f6;
  --red-cta: #dc2626;
  
  /* Recommendation Colors */
  --green-ready: #10b981;
  --blue-optional: #3b82f6;
  --yellow-beneficial: #f59e0b;
  --red-recommended: #dc2626;
  
  /* Neutral Colors */
  --white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-900: #111827;
}
```

### Spacing

```css
:root {
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### Border Radius

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

### Shadows

```css
:root {
  --shadow-soft: 0 10px 30px rgba(15, 36, 61, 0.12);
  --shadow-medium: 0 15px 40px rgba(15, 36, 61, 0.18);
  --shadow-hard: 0 20px 50px rgba(15, 36, 61, 0.25);
}
```

### Glassmorphism

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: blur(10px);
}
```

### Typography

```css
:root {
  --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  --font-size-3xl: 40px;
}
```

### Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

## Animation Configuration

### Animation Durations

All animations use consistent timing:

- **Fast**: 150ms (hover effects, button feedback)
- **Normal**: 300ms (question transitions, fades)
- **Slow**: 500ms (complex transitions)

### Reduced Motion

Respects user preference for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Integration Configuration

### Calendly Integration

Configure Calendly URL in environment variables:

```env
CALENDLY_LINK=https://calendly.com/your-link/claim-readiness-review
```

Or directly in `CalendlyIntegration.js`:

```javascript
const calendlyUrl = 'https://calendly.com/your-link/claim-readiness-review';
```

### Stripe Integration

Configure Stripe in environment variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Environment Variables

### Required Variables

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Calendly Configuration
CALENDLY_LINK=https://calendly.com/your-link/claim-readiness-review

# Domain Configuration
DOMAIN=https://yourdomain.com
```

### Optional Variables

```env
# Analytics
GOOGLE_ANALYTICS_ID=G-...

# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_PAYMENT=true
ENABLE_LOGGING=true
```

## Modifying Configuration

### Adding a New Question

1. Add question object to `QUESTIONS` array in `diagnostic-config.js`
2. Update question number sequence
3. Update total score range (currently 0-10)
4. Add corresponding assessment area to transparency layer
5. Update tests to include new question

### Changing Recommendation Thresholds

1. Modify `scoreRange` values in `RECOMMENDATIONS` object
2. Ensure all score values (0-10) are covered
3. Update tests to reflect new thresholds
4. Update documentation

### Customizing Colors

1. Modify CSS custom properties in `diagnostic.html`
2. Update recommendation colors in `RECOMMENDATIONS` object
3. Ensure WCAG AA contrast ratios are maintained
4. Test across all screens and states

### Changing Animation Timing

1. Modify CSS custom properties for transitions
2. Update animation durations in JavaScript if needed
3. Test across all transitions
4. Ensure reduced motion preference is respected

## Best Practices

### Configuration Management

- Keep all configuration in `diagnostic-config.js`
- Use CSS custom properties for styling
- Store sensitive data in environment variables
- Document all configuration changes

### Testing Configuration Changes

- Run unit tests: `npm test`
- Run property-based tests: `npm run test:pbt`
- Test manually across all screens
- Verify accessibility compliance
- Check performance metrics

### Version Control

- Commit configuration changes separately
- Document breaking changes
- Tag configuration versions
- Maintain backward compatibility when possible
