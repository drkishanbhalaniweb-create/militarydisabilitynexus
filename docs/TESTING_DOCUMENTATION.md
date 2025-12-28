# Testing Documentation

## Overview

The VA Claim Readiness Diagnostic uses a comprehensive testing strategy built on Jest and property-based testing with fast-check. This guide documents the testing architecture, patterns, and practices to help developers understand and migrate the test suite to React.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Environment Setup](#test-environment-setup)
3. [Property-Based Testing](#property-based-testing)
4. [Test Coverage Areas](#test-coverage-areas)
5. [Running Tests](#running-tests)
6. [Test File Structure](#test-file-structure)
7. [Testing Patterns](#testing-patterns)
8. [Migration to React Testing Library](#migration-to-react-testing-library)

---

## Testing Philosophy

### Why Property-Based Testing?

Traditional example-based testing checks specific inputs and outputs:
```javascript
test('score of 0 is valid', () => {
  expect(validateScore(0)).toBe(true);
});
```

Property-based testing verifies universal properties across many generated inputs:
```javascript
test('all scores 0-10 are valid', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 10 }),
      (score) => {
        expect(validateScore(score)).toBe(true);
      }
    )
  );
});
```

**Benefits**:
- **Broader coverage**: Tests hundreds of cases automatically
- **Edge case discovery**: Finds bugs you didn't think to test
- **Specification as tests**: Properties document system behavior
- **Confidence**: Proves correctness across input space

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Future)
      /____\     
     /      \    Integration Tests
    /________\   
   /          \  Unit Tests + Property Tests
  /____________\ 
```

Current focus: **Unit tests** with **property-based testing** for universal correctness.

---

## Test Environment Setup

### Jest Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',  // Browser-like environment
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true
};
```

**Key Settings**:
- `testEnvironment: 'jsdom'`: Provides DOM APIs (document, window, etc.)
- `setupFilesAfterEnv`: Runs setup code before each test file
- `verbose: true`: Detailed test output

### Jest Setup File

**File**: `jest.setup.js`

```javascript
// Polyfill for TextEncoder/TextDecoder (required by jsdom)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

**Purpose**: Provides polyfills and global test utilities.

### Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.x",
    "jest-environment-jsdom": "^29.x",
    "jsdom": "^22.x",
    "fast-check": "^3.x"
  }
}
```

---

## Property-Based Testing

### What is fast-check?

fast-check is a property-based testing library that generates random test cases to verify universal properties.

### Basic Pattern

```javascript
const fc = require('fast-check');

test('property description', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 10 }),  // Arbitrary generator
      (score) => {                       // Test function
        // Property that should always hold
        expect(validateScore(score)).toBe(true);
      }
    ),
    { numRuns: 100 }  // Run 100 random test cases
  );
});
```

### Arbitrary Generators

fast-check provides generators for various data types:

```javascript
// Integers
fc.integer({ min: 0, max: 10 })

// Strings
fc.string()

// Booleans
fc.boolean()

// Arrays
fc.array(fc.integer())

// Objects
fc.record({
  name: fc.string(),
  age: fc.integer({ min: 0, max: 120 })
})

// Constants from a set
fc.constantFrom('Yes', 'No', 'Somewhat')

// Custom combinations
fc.tuple(fc.integer(), fc.string())
```

### Example: Scoring Engine Properties

**Property 6**: Yes answers score zero points
```javascript
test('should assign 0 points for any "Yes" answer across all questions', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...QUESTIONS.map(q => q.id)),
      (questionId) => {
        const question = QUESTIONS.find(q => q.id === questionId);
        const yesOption = question.options.find(opt => opt.text === 'Yes');
        
        if (yesOption) {
          const points = engine.getPointsForAnswer(questionId, 'Yes');
          expect(points).toBe(0);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 9**: Total score is sum of answer points
```javascript
test('should equal sum of all answer points for any answer combination', () => {
  fc.assert(
    fc.property(
      fc.record({
        service_connection: fc.integer({ min: 0, max: 2 }),
        denial_handling: fc.integer({ min: 0, max: 2 }),
        pathway: fc.integer({ min: 0, max: 2 }),
        severity: fc.integer({ min: 0, max: 2 }),
        secondaries: fc.integer({ min: 0, max: 2 })
      }),
      (answers) => {
        const totalScore = engine.calculateTotalScore(answers);
        const expectedSum = Object.values(answers).reduce((a, b) => a + b, 0);
        
        expect(totalScore).toBe(expectedSum);
      }
    ),
    { numRuns: 100 }
  );
});
```

---

## Test Coverage Areas

### 1. Unit Tests

**Files**:
- `__tests__/ScoringEngine.test.js`
- `__tests__/RecommendationEngine.test.js`
- `__tests__/DiagnosticController.test.js`
- `__tests__/QuestionRenderer.test.js`
- `__tests__/DataLogger.test.js`
- `__tests__/StripeIntegration.test.js`

**Coverage**:
- Individual module functionality
- Edge cases and error handling
- Input validation
- State management

### 2. Integration Tests

**Files**:
- `__tests__/diagnostic-integration.test.js`
- `__tests__/payment-integration.test.js`
- `__tests__/log-diagnostic.test.js`

**Coverage**:
- Module interactions
- Data flow between components
- API endpoint behavior
- End-to-end user flows

### 3. Accessibility Tests

**File**: `__tests__/accessibility.test.js`

**Coverage**:
- ARIA labels on interactive elements
- Keyboard navigation support
- WCAG color contrast compliance
- Focus indicator visibility
- Semantic HTML structure
- Screen reader compatibility

**Example Property**:
```javascript
test('should have ARIA labels on all interactive elements for any question', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...QUESTIONS),
      (question) => {
        renderer.renderQuestion(question, question.number, 5);
        
        const interactiveElements = getAllInteractiveElements(container);
        
        interactiveElements.forEach(element => {
          expect(hasAccessibleName(element)).toBe(true);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### 4. Responsive Design Tests

**File**: `__tests__/responsive.test.js`

**Coverage**:
- Viewport-specific layouts
- Touch target sizes (44x44px minimum)
- Text scaling and readability
- Grid/flexbox behavior at breakpoints
- Image and media responsiveness

### 5. Animation Tests

**File**: `__tests__/animations.test.js`

**Coverage**:
- Screen transition animations
- Answer selection feedback
- Animation duration constraints (300-500ms)
- Reduced motion support
- No layout shift from animations

**Example Property**:
```javascript
test('should automatically advance to next question after answer selection', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 3 }),  // Questions 1-4
      fc.integer({ min: 0, max: 2 }),  // Answer option
      (questionIndex, answerIndex) => {
        // Render question
        renderer.renderQuestion(questionData, currentStep, 5);
        
        // Select answer
        const answerCards = container.querySelectorAll('.answer-card');
        answerCards[answerIndex].click();
        
        // Verify auto-advance (no Next button needed)
        const nextButton = container.querySelector('#next-button');
        expect(nextButton).toBeNull();
      }
    ),
    { numRuns: 100 }
  );
});
```

### 6. CSS Custom Properties Tests

**File**: `__tests__/css-custom-properties.test.js`

**Coverage**:
- All custom properties defined in :root
- No hardcoded color values (use CSS variables)
- Spacing values use custom properties
- Transition properties use custom properties
- Valid CSS values for all custom properties

### 7. Performance Tests

**File**: `__tests__/performance.test.js`

**Coverage**:
- Rendering performance
- Memory usage
- Animation frame rates
- Bundle size constraints

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ScoringEngine.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Property 6"
```

### Test Output

```
PASS  __tests__/ScoringEngine.test.js
  ScoringEngine
    Property 6: Yes answers score zero points
      ✓ should assign 0 points for any "Yes" answer across all questions (125ms)
    Property 7: Middle-ground answers score one point
      ✓ should assign 1 point for any middle-ground answer (98ms)
    Property 8: Negative answers score two points
      ✓ should assign 2 points for any negative answer (102ms)
    Property 9: Total score is sum of answer points
      ✓ should equal sum of all answer points for any answer combination (156ms)
```

### Coverage Report

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory:
- `coverage/lcov-report/index.html` - Visual coverage report
- `coverage/lcov.info` - Machine-readable coverage data

**Target Coverage**: 80%+ for all modules

---

## Test File Structure

### Standard Test File Template

```javascript
/**
 * Property-Based Tests for [Module Name]
 * 
 * These tests verify universal correctness properties using fast-check
 * to generate random test cases and ensure properties hold across all inputs.
 */

const fc = require('fast-check');
const ModuleName = require('../ModuleName');
const { QUESTIONS } = require('../diagnostic-config');

describe('ModuleName', () => {
  let instance;

  beforeEach(() => {
    instance = new ModuleName();
  });

  /**
   * Feature: claim-readiness-diagnostic, Property X: [Property description]
   * Validates: Requirements X.X
   */
  describe('Property X: [Property name]', () => {
    test('should [behavior] for any [input]', () => {
      fc.assert(
        fc.property(
          fc.arbitrary(),  // Generator
          (input) => {
            // Test logic
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Additional unit tests for edge cases
  describe('Edge cases and validation', () => {
    test('should handle edge case', () => {
      expect(instance.method(edgeCase)).toBe(expected);
    });
  });
});
```

### DOM Testing Setup

For tests that need DOM manipulation:

```javascript
const { JSDOM } = require('jsdom');

function setupDOM() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html lang="en">
    <body>
      <div class="diagnostic-container">
        <!-- Test HTML structure -->
      </div>
    </body>
    </html>
  `);
  
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  
  return dom;
}

describe('Component Tests', () => {
  let dom;
  let container;

  beforeEach(() => {
    dom = setupDOM();
    container = dom.window.document.querySelector('.diagnostic-container');
  });

  afterEach(() => {
    if (dom) {
      dom.window.close();
    }
  });

  test('renders correctly', () => {
    // Test logic
  });
});
```

---

## Testing Patterns

### Pattern 1: Testing Pure Functions

**Example**: ScoringEngine

```javascript
test('calculateTotalScore returns sum of points', () => {
  const answers = {
    service_connection: 0,
    denial_handling: 1,
    pathway: 2,
    severity: 0,
    secondaries: 1
  };
  
  const score = engine.calculateTotalScore(answers);
  expect(score).toBe(4);
});
```

### Pattern 2: Testing State Management

**Example**: DiagnosticController

```javascript
test('state transitions correctly', () => {
  controller.setState('intro');
  expect(controller.getCurrentState()).toBe('intro');
  
  controller.nextQuestion();
  expect(controller.getCurrentState()).toBe('question_1');
});
```

### Pattern 3: Testing DOM Rendering

**Example**: QuestionRenderer

```javascript
test('renders question with correct structure', () => {
  const question = QUESTIONS[0];
  renderer.renderQuestion(question, 1, 5);
  
  const title = container.querySelector('.question-title');
  expect(title.textContent).toBe(question.question);
  
  const answerCards = container.querySelectorAll('.answer-card');
  expect(answerCards.length).toBe(question.options.length);
});
```

### Pattern 4: Testing Event Handlers

**Example**: Answer selection

```javascript
test('calls callback on answer selection', () => {
  const mockCallback = jest.fn();
  renderer.onAnswerSelected(mockCallback);
  
  renderer.renderQuestion(QUESTIONS[0], 1, 5);
  
  const answerCard = container.querySelector('.answer-card');
  answerCard.click();
  
  expect(mockCallback).toHaveBeenCalledWith(
    QUESTIONS[0].id,
    expect.any(String),
    expect.any(Number)
  );
});
```

### Pattern 5: Testing Async Operations

**Example**: API calls

```javascript
test('logs diagnostic data successfully', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true })
  });
  global.fetch = mockFetch;
  
  const result = await logger.logDiagnostic(diagnosticData);
  
  expect(result.success).toBe(true);
  expect(mockFetch).toHaveBeenCalledWith(
    '/api/log-diagnostic',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  );
});
```

### Pattern 6: Testing Error Handling

**Example**: Invalid input

```javascript
test('throws error for invalid question ID', () => {
  expect(() => {
    engine.getPointsForAnswer('invalid_question', 'Yes');
  }).toThrow('Question not found: invalid_question');
});
```

### Pattern 7: Testing Accessibility

**Example**: ARIA labels

```javascript
test('all interactive elements have accessible names', () => {
  renderer.renderQuestion(QUESTIONS[0], 1, 5);
  
  const interactiveElements = container.querySelectorAll('button, [role="button"]');
  
  interactiveElements.forEach(element => {
    const hasLabel = element.hasAttribute('aria-label') ||
                     element.textContent.trim() !== '';
    expect(hasLabel).toBe(true);
  });
});
```

### Pattern 8: Testing Responsive Behavior

**Example**: Touch target sizes

```javascript
test('all interactive elements meet minimum touch target size', () => {
  renderer.renderQuestion(QUESTIONS[0], 1, 5);
  
  const answerCards = container.querySelectorAll('.answer-card');
  
  answerCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(44);
    expect(rect.height).toBeGreaterThanOrEqual(44);
  });
});
```

---

## Migration to React Testing Library

### Why React Testing Library?

React Testing Library encourages testing from the user's perspective:
- Query by accessible roles and labels
- Interact with elements as users would
- Avoid testing implementation details

### Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Configuration

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### Migration Patterns

#### Pattern 1: Rendering Components

**Vanilla JS**:
```javascript
const container = document.createElement('div');
renderer.renderQuestion(question, 1, 5);
```

**React Testing Library**:
```javascript
import { render } from '@testing-library/react';

const { container } = render(
  <QuestionCard question={question} step={1} totalSteps={5} />
);
```

#### Pattern 2: Querying Elements

**Vanilla JS**:
```javascript
const button = container.querySelector('#start-diagnostic-btn');
```

**React Testing Library**:
```javascript
import { screen } from '@testing-library/react';

const button = screen.getByRole('button', { name: /start diagnostic/i });
```

#### Pattern 3: User Interactions

**Vanilla JS**:
```javascript
answerCard.click();
```

**React Testing Library**:
```javascript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(answerCard);
```

#### Pattern 4: Async Operations

**Vanilla JS**:
```javascript
await new Promise(resolve => setTimeout(resolve, 400));
```

**React Testing Library**:
```javascript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText(/next question/i)).toBeInTheDocument();
});
```

### Example: Migrated Test

**Before (Vanilla JS)**:
```javascript
test('renders question with answer options', () => {
  const container = document.createElement('div');
  const renderer = new QuestionRenderer(container);
  
  renderer.renderQuestion(QUESTIONS[0], 1, 5);
  
  const title = container.querySelector('.question-title');
  expect(title.textContent).toBe(QUESTIONS[0].question);
  
  const answerCards = container.querySelectorAll('.answer-card');
  expect(answerCards.length).toBe(3);
});
```

**After (React Testing Library)**:
```javascript
test('renders question with answer options', () => {
  render(<QuestionCard question={QUESTIONS[0]} step={1} totalSteps={5} />);
  
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
    QUESTIONS[0].question
  );
  
  const answerButtons = screen.getAllByRole('button', { name: /yes|no|somewhat/i });
  expect(answerButtons).toHaveLength(3);
});
```

### Property-Based Testing with React

fast-check works seamlessly with React Testing Library:

```javascript
test('renders any question correctly', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...QUESTIONS),
      (question) => {
        const { unmount } = render(
          <QuestionCard question={question} step={1} totalSteps={5} />
        );
        
        expect(screen.getByRole('heading')).toHaveTextContent(question.question);
        
        const answerButtons = screen.getAllByRole('button');
        expect(answerButtons).toHaveLength(question.options.length);
        
        unmount();
      }
    ),
    { numRuns: 100 }
  );
});
```

### Accessibility Testing with React

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(<DiagnosticApp />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

**Bad**:
```javascript
test('calls internal method', () => {
  expect(controller._internalMethod).toHaveBeenCalled();
});
```

**Good**:
```javascript
test('advances to next question on answer selection', () => {
  controller.recordAnswer('service_connection', 'Yes', 0);
  expect(controller.getCurrentState()).toBe('question_2');
});
```

### 2. Use Descriptive Test Names

**Bad**:
```javascript
test('works', () => { /* ... */ });
```

**Good**:
```javascript
test('should assign 0 points for any "Yes" answer across all questions', () => {
  /* ... */
});
```

### 3. Arrange-Act-Assert Pattern

```javascript
test('calculates total score correctly', () => {
  // Arrange
  const answers = { /* ... */ };
  
  // Act
  const score = engine.calculateTotalScore(answers);
  
  // Assert
  expect(score).toBe(4);
});
```

### 4. Test Edge Cases

```javascript
test('handles empty answers object', () => {
  expect(engine.calculateTotalScore({})).toBe(0);
});

test('handles null input', () => {
  expect(() => engine.calculateTotalScore(null)).toThrow();
});
```

### 5. Use Property-Based Testing for Universal Properties

When you can express a property that should hold for all inputs, use fast-check:

```javascript
// Instead of testing specific cases
test('score 0 is valid', () => expect(validateScore(0)).toBe(true));
test('score 5 is valid', () => expect(validateScore(5)).toBe(true));
test('score 10 is valid', () => expect(validateScore(10)).toBe(true));

// Test the universal property
test('all scores 0-10 are valid', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 10 }),
      (score) => expect(validateScore(score)).toBe(true)
    )
  );
});
```

### 6. Mock External Dependencies

```javascript
// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true })
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;
```

### 7. Clean Up After Tests

```javascript
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  if (dom) {
    dom.window.close();
  }
});
```

### 8. Test Accessibility

Always include accessibility tests:

```javascript
test('has proper ARIA labels', () => {
  const button = screen.getByRole('button', { name: /start diagnostic/i });
  expect(button).toBeInTheDocument();
});

test('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
});
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Resources

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **fast-check Documentation**: https://fast-check.dev/
- **React Testing Library**: https://testing-library.com/react
- **jest-axe (Accessibility)**: https://github.com/nickcolley/jest-axe
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Last Updated**: December 2024
