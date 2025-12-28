# Diagnostic Components

React components for the VA Claim Readiness Diagnostic feature.

## Components

### ProgressBar

Visual progress indicator showing current question number and progress percentage.

**Props:**
- `currentStep` (number) - Current question number (1-5)
- `totalSteps` (number) - Total number of questions (5)
- `category` (string, optional) - Question category to display

**Usage:**
```jsx
<ProgressBar
  currentStep={3}
  totalSteps={5}
  category="Claim Pathway"
/>
```

### QuestionCard

Displays a question with answer options as interactive cards.

**Props:**
- `question` (object) - Question data from config
  - `id` (string) - Question identifier
  - `title` (string) - Question text
  - `helper` (string) - Helper text
  - `options` (array) - Answer options
- `onAnswer` (function) - Callback when answer selected
- `selectedAnswer` (string, optional) - Currently selected answer text

**Usage:**
```jsx
<QuestionCard
  question={QUESTIONS[0]}
  onAnswer={(questionId, answerText, points) => {
    console.log('Answer selected:', questionId, answerText, points);
  }}
  selectedAnswer="Yes — the connection is clearly documented"
/>
```

### RecommendationCard

Displays the diagnostic recommendation with score and styling.

**Props:**
- `recommendation` (object) - Recommendation data
  - `category` (string) - Recommendation category
  - `message` (string) - Main message
  - `subtitle` (string) - Subtitle text
  - `score` (number) - User's score
  - `color` (string) - Badge color
  - `badgeColor` (string) - Badge color name
  - `icon` (string) - Icon name

**Usage:**
```jsx
<RecommendationCard
  recommendation={{
    category: 'REVIEW_BENEFICIAL',
    message: 'Your claim would benefit from review',
    subtitle: 'Some areas need attention',
    score: 5,
    color: '#f59e0b',
    badgeColor: 'orange',
    icon: 'AlertTriangle'
  }}
/>
```

### AssessmentBreakdown

Shows detailed breakdown of assessment areas with status indicators.

**Props:**
- `answers` (object) - Map of question IDs to points
- `score` (number) - Total score

**Usage:**
```jsx
<AssessmentBreakdown
  answers={{
    service_connection: 2,
    denial_handling: 1,
    pathway: 0,
    severity: 1,
    secondaries: 1
  }}
  score={5}
/>
```

## Styling

All components use TailwindCSS classes and match the existing site theme:
- Primary color: Navy (#163b63)
- Responsive design (mobile-first)
- Smooth transitions and animations
- Accessible (keyboard navigation, ARIA labels)

## Dependencies

- React
- Lucide React (icons)
- TailwindCSS
- `../../lib/diagnosticConfig` (configuration)
- `../../lib/diagnosticScoring` (scoring logic)

## File Structure

```
frontend/src/components/diagnostic/
├── README.md                    # This file
├── ProgressBar.js              # Progress indicator
├── QuestionCard.js             # Question display
├── RecommendationCard.js       # Results card
└── AssessmentBreakdown.js      # Assessment details
```

## Usage Example

Complete diagnostic flow:

```jsx
import { useState } from 'react';
import ProgressBar from './components/diagnostic/ProgressBar';
import QuestionCard from './components/diagnostic/QuestionCard';
import RecommendationCard from './components/diagnostic/RecommendationCard';
import AssessmentBreakdown from './components/diagnostic/AssessmentBreakdown';
import { QUESTIONS } from './lib/diagnosticConfig';
import { calculateTotalScore, getRecommendationData } from './lib/diagnosticScoring';

function DiagnosticFlow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (questionId, answerText, points) => {
    const newAnswers = { ...answers, [questionId]: points };
    setAnswers(newAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const score = calculateTotalScore(answers);
    const recommendation = getRecommendationData(score);

    return (
      <div>
        <RecommendationCard recommendation={recommendation} />
        <AssessmentBreakdown answers={answers} score={score} />
      </div>
    );
  }

  return (
    <div>
      <ProgressBar
        currentStep={currentIndex + 1}
        totalSteps={QUESTIONS.length}
        category={QUESTIONS[currentIndex].category}
      />
      <QuestionCard
        question={QUESTIONS[currentIndex]}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
```

## Accessibility

All components follow accessibility best practices:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance (WCAG AA)

## Performance

Components are optimized for performance:
- Minimal re-renders
- CSS transitions (GPU-accelerated)
- Lazy loading of icons
- No unnecessary state updates

## Testing

Test each component independently:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from './QuestionCard';

test('calls onAnswer when option clicked', () => {
  const mockOnAnswer = jest.fn();
  const question = {
    id: 'test',
    title: 'Test Question',
    helper: 'Helper text',
    options: [
      { text: 'Option 1', points: 0 },
      { text: 'Option 2', points: 1 }
    ]
  };

  render(<QuestionCard question={question} onAnswer={mockOnAnswer} />);
  
  fireEvent.click(screen.getByText('Option 1'));
  
  expect(mockOnAnswer).toHaveBeenCalledWith('test', 'Option 1', 0);
});
```

## Customization

### Changing Colors

Edit TailwindCSS classes in each component:
```jsx
// Change progress bar color
className="bg-gradient-to-r from-navy-600 to-navy-800"

// Change selected card color
className="border-navy-600 bg-navy-50"
```

### Changing Animations

Edit transition durations:
```jsx
// Faster transitions
className="transition-all duration-200"

// Slower transitions
className="transition-all duration-700"
```

### Adding New Components

Follow the same pattern:
1. Create new component file
2. Import required dependencies
3. Define props with PropTypes or TypeScript
4. Use TailwindCSS for styling
5. Export component
6. Document in this README

## Future Enhancements

Potential improvements:
- Add loading states
- Add error boundaries
- Add skeleton loaders
- Add animations library (Framer Motion)
- Add unit tests
- Add Storybook stories
- Add TypeScript types
