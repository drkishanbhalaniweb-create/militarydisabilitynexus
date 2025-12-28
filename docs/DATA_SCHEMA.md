# Data Schema Documentation

This document describes all data structures used in the Claim Readiness Diagnostic.

## Overview

The diagnostic uses several data structures for managing state, storing session data, and logging analytics. All data is stored in JSON format.

## localStorage Schema

### Session Data

**Key**: `diagnostic_session`

**Purpose**: Store diagnostic session data in browser localStorage for persistence and analytics.

**Structure**:
```javascript
{
  sessionId: string,              // UUID v4 format
  startTime: string,              // ISO 8601 timestamp
  endTime: string | null,         // ISO 8601 timestamp (null until completed)
  currentState: string,           // Current screen state
  answers: {
    service_connection: {
      text: string,               // Answer text selected
      points: number              // Points assigned (0, 1, or 2)
    },
    denial_handling: {
      text: string,
      points: number
    },
    pathway: {
      text: string,
      points: number
    },
    severity: {
      text: string,
      points: number
    },
    secondaries: {
      text: string,
      points: number
    }
  },
  score: number | null,           // Total score (0-10, null until calculated)
  recommendation: string | null,  // Recommendation category (null until calculated)
  userAgent: string,              // Browser user agent
  viewport: {
    width: number,                // Viewport width in pixels
    height: number                // Viewport height in pixels
  }
}
```

**Example**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2025-12-18T10:30:00.000Z",
  "endTime": "2025-12-18T10:32:15.000Z",
  "currentState": "recommendation",
  "answers": {
    "service_connection": {
      "text": "No",
      "points": 2
    },
    "denial_handling": {
      "text": "Partially",
      "points": 1
    },
    "pathway": {
      "text": "Not sure",
      "points": 2
    },
    "severity": {
      "text": "Somewhat",
      "points": 1
    },
    "secondaries": {
      "text": "No",
      "points": 2
    }
  },
  "score": 8,
  "recommendation": "REVIEW_STRONGLY_RECOMMENDED",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "viewport": {
    "width": 1920,
    "height": 1080
  }
}
```

**State Values**:
- `intro`: Intro screen
- `question_1`: Question 1 screen
- `question_2`: Question 2 screen
- `question_3`: Question 3 screen
- `question_4`: Question 4 screen
- `question_5`: Question 5 screen
- `recommendation`: Recommendation screen
- `transparency`: Transparency layer screen

**Usage**:
```javascript
// Save to localStorage
const sessionData = {
  sessionId: generateUUID(),
  startTime: new Date().toISOString(),
  // ... other fields
};
localStorage.setItem('diagnostic_session', JSON.stringify(sessionData));

// Load from localStorage
const savedData = localStorage.getItem('diagnostic_session');
const sessionData = savedData ? JSON.parse(savedData) : null;
```

## Backend Data Schema

### Diagnostic Log Entry

**Storage**: `/data/diagnostics.json` (JSON file)

**Purpose**: Store completed diagnostic data for business analytics.

**Structure**:
```javascript
{
  id: string,                     // Unique diagnostic ID
  timestamp: string,              // ISO 8601 timestamp
  answers: {
    service_connection: number,   // Points (0, 1, or 2)
    denial_handling: number,      // Points (0, 1, or 2)
    pathway: number,              // Points (0, 1, or 2)
    severity: number,             // Points (0, 1, or 2)
    secondaries: number           // Points (0, 1, or 2)
  },
  score: number,                  // Total score (0-10)
  recommendation: string          // Recommendation category
}
```

**Example**:
```json
{
  "id": "diag_1702896600000_abc123xyz",
  "timestamp": "2025-12-18T10:32:15.000Z",
  "answers": {
    "service_connection": 2,
    "denial_handling": 1,
    "pathway": 2,
    "severity": 1,
    "secondaries": 2
  },
  "score": 8,
  "recommendation": "REVIEW_STRONGLY_RECOMMENDED"
}
```

**File Format** (`/data/diagnostics.json`):
```json
[
  {
    "id": "diag_1702896600000_abc123xyz",
    "timestamp": "2025-12-18T10:32:15.000Z",
    "answers": {
      "service_connection": 2,
      "denial_handling": 1,
      "pathway": 2,
      "severity": 1,
      "secondaries": 2
    },
    "score": 8,
    "recommendation": "REVIEW_STRONGLY_RECOMMENDED"
  },
  {
    "id": "diag_1702896700000_def456uvw",
    "timestamp": "2025-12-18T11:15:30.000Z",
    "answers": {
      "service_connection": 0,
      "denial_handling": 0,
      "pathway": 0,
      "severity": 1,
      "secondaries": 0
    },
    "score": 1,
    "recommendation": "OPTIONAL_CONFIRMATION"
  }
]
```

## Configuration Data Schema

### Question Data

**Purpose**: Define diagnostic questions and answer options.

**Structure**:
```javascript
{
  id: string,                     // Unique question identifier (snake_case)
  number: number,                 // Question number (1-5)
  title: string,                  // Question text
  helper: string,                 // Helper text
  options: [                      // Array of answer options
    {
      text: string,               // Answer text
      points: number              // Points assigned (0, 1, or 2)
    }
  ]
}
```

**Example**:
```javascript
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
}
```

### Recommendation Data

**Purpose**: Define recommendation categories and display properties.

**Structure**:
```javascript
{
  CATEGORY_NAME: {
    scoreRange: [number, number], // [min, max] inclusive
    message: string,              // Recommendation message
    color: string,                // CSS color (hex)
    icon: string,                 // Emoji or icon
    ctaText: string,              // CTA button text
    ctaOptional: boolean          // Whether CTA is optional
  }
}
```

**Example**:
```javascript
{
  REVIEW_BENEFICIAL: {
    scoreRange: [3, 6],
    message: 'Your claim would BENEFIT from a Claim Readiness Review before filing.',
    color: '#f59e0b',
    icon: '⚠️',
    ctaText: 'Book Claim Readiness Review',
    ctaOptional: false
  }
}
```

### Assessment Area Data

**Purpose**: Define transparency layer assessment areas.

**Structure**:
```javascript
{
  id: string,                     // Matches question ID
  name: string,                   // Display name
  description: string             // Brief description
}
```

**Example**:
```javascript
{
  id: 'service_connection',
  name: 'Service connection clarity',
  description: 'Medical records and nexus documentation'
}
```

## Runtime Data Schema

### Answer Object

**Purpose**: Store a single answer during diagnostic flow.

**Structure**:
```javascript
{
  questionId: string,             // Question identifier
  answerText: string,             // Selected answer text
  points: number,                 // Points assigned (0, 1, or 2)
  timestamp: string               // ISO 8601 timestamp
}
```

**Example**:
```javascript
{
  questionId: 'service_connection',
  answerText: 'No',
  points: 2,
  timestamp: '2025-12-18T10:30:15.000Z'
}
```

### Recommendation Object

**Purpose**: Store recommendation result.

**Structure**:
```javascript
{
  category: string,               // Recommendation category
  score: number,                  // Score that generated recommendation
  message: string,                // Recommendation message
  color: string,                  // CSS color
  icon: string,                   // Emoji or icon
  ctaText: string,                // CTA button text
  ctaOptional: boolean,           // Whether CTA is optional
  tone: string                    // Tone indicator
}
```

**Example**:
```javascript
{
  category: 'REVIEW_BENEFICIAL',
  score: 5,
  message: 'Your claim would BENEFIT from a Claim Readiness Review before filing.',
  color: '#f59e0b',
  icon: '⚠️',
  ctaText: 'Book Claim Readiness Review',
  ctaOptional: false,
  tone: 'objective'
}
```

### Transparency Data

**Purpose**: Store transparency layer display data.

**Structure**:
```javascript
{
  assessmentAreas: [
    {
      name: string,               // Assessment area name
      status: string,             // 'adequate', 'needs_attention', 'missing'
      icon: string,               // '✅', '⚠️', '❌'
      points: number              // Points (0, 1, or 2)
    }
  ]
}
```

**Example**:
```javascript
{
  assessmentAreas: [
    {
      name: 'Service connection clarity',
      status: 'missing',
      icon: '❌',
      points: 2
    },
    {
      name: 'Denial handling',
      status: 'needs_attention',
      icon: '⚠️',
      points: 1
    },
    {
      name: 'Pathway selection',
      status: 'missing',
      icon: '❌',
      points: 2
    },
    {
      name: 'Severity documentation',
      status: 'needs_attention',
      icon: '⚠️',
      points: 1
    },
    {
      name: 'Missing secondaries',
      status: 'missing',
      icon: '❌',
      points: 2
    }
  ]
}
```

## Data Validation

### Question Validation

```javascript
function validateQuestion(question) {
  if (!question.id || typeof question.id !== 'string') {
    throw new Error('Question must have a valid id');
  }
  
  if (!question.number || typeof question.number !== 'number') {
    throw new Error('Question must have a valid number');
  }
  
  if (!question.title || typeof question.title !== 'string') {
    throw new Error('Question must have a valid title');
  }
  
  if (!Array.isArray(question.options) || question.options.length !== 3) {
    throw new Error('Question must have exactly 3 options');
  }
  
  question.options.forEach(option => {
    if (!option.text || typeof option.text !== 'string') {
      throw new Error('Option must have valid text');
    }
    
    if (![0, 1, 2].includes(option.points)) {
      throw new Error('Option points must be 0, 1, or 2');
    }
  });
  
  return true;
}
```

### Answer Validation

```javascript
function validateAnswer(answer) {
  if (!answer.questionId || typeof answer.questionId !== 'string') {
    throw new Error('Answer must have a valid questionId');
  }
  
  if (!answer.answerText || typeof answer.answerText !== 'string') {
    throw new Error('Answer must have valid answerText');
  }
  
  if (![0, 1, 2].includes(answer.points)) {
    throw new Error('Answer points must be 0, 1, or 2');
  }
  
  return true;
}
```

### Score Validation

```javascript
function validateScore(score) {
  if (typeof score !== 'number') {
    throw new Error('Score must be a number');
  }
  
  if (score < 0 || score > 10) {
    throw new Error('Score must be between 0 and 10');
  }
  
  return true;
}
```

### Diagnostic Payload Validation

```javascript
function validateDiagnosticPayload(payload) {
  if (!payload.timestamp || typeof payload.timestamp !== 'string') {
    throw new Error('Payload must have a valid timestamp');
  }
  
  if (!payload.answers || typeof payload.answers !== 'object') {
    throw new Error('Payload must have valid answers object');
  }
  
  const requiredAnswers = [
    'service_connection',
    'denial_handling',
    'pathway',
    'severity',
    'secondaries'
  ];
  
  requiredAnswers.forEach(key => {
    if (![0, 1, 2].includes(payload.answers[key])) {
      throw new Error(`Answer ${key} must be 0, 1, or 2`);
    }
  });
  
  if (typeof payload.score !== 'number' || payload.score < 0 || payload.score > 10) {
    throw new Error('Payload must have a valid score (0-10)');
  }
  
  const validRecommendations = [
    'FULLY_READY',
    'OPTIONAL_CONFIRMATION',
    'REVIEW_BENEFICIAL',
    'REVIEW_STRONGLY_RECOMMENDED'
  ];
  
  if (!validRecommendations.includes(payload.recommendation)) {
    throw new Error('Payload must have a valid recommendation');
  }
  
  return true;
}
```

## Data Migration

### Version 1.0.0 Schema

Current schema version. No migrations needed.

### Future Migrations

If schema changes are needed:

1. Add version field to data structures
2. Create migration functions
3. Run migrations on data load
4. Maintain backward compatibility

Example migration:
```javascript
function migrateSessionData(data) {
  if (!data.version) {
    // Migrate from v1.0.0 to v1.1.0
    data.version = '1.1.0';
    data.newField = defaultValue;
  }
  return data;
}
```

## Data Privacy

### PII Considerations

The diagnostic collects **NO personally identifiable information (PII)**:
- No names
- No email addresses
- No phone numbers
- No addresses
- No IP addresses (unless server logs capture them)

Only diagnostic answers and scores are collected.

### GDPR Compliance

Since no PII is collected:
- No consent required for data collection
- No right to deletion needed
- No data export required

If PII is added in the future, implement:
- Cookie consent banner
- Privacy policy
- Data deletion mechanism
- Data export mechanism

## Data Retention

### localStorage

- Data persists until user clears browser data
- No automatic expiration
- User can clear manually

### Backend Storage

- Data retained indefinitely for analytics
- Consider implementing retention policy (e.g., 2 years)
- Implement data archival for old records

## Data Access

### Reading Diagnostic Data

```javascript
// Read from localStorage
const sessionData = JSON.parse(localStorage.getItem('diagnostic_session'));

// Read from backend file
const fs = require('fs').promises;
const diagnostics = JSON.parse(await fs.readFile('/data/diagnostics.json', 'utf8'));
```

### Querying Diagnostic Data

```javascript
// Filter by recommendation
const stronglyRecommended = diagnostics.filter(
  d => d.recommendation === 'REVIEW_STRONGLY_RECOMMENDED'
);

// Calculate average score
const avgScore = diagnostics.reduce((sum, d) => sum + d.score, 0) / diagnostics.length;

// Count by score range
const scoreDistribution = {
  '0': diagnostics.filter(d => d.score === 0).length,
  '1-2': diagnostics.filter(d => d.score >= 1 && d.score <= 2).length,
  '3-6': diagnostics.filter(d => d.score >= 3 && d.score <= 6).length,
  '7-10': diagnostics.filter(d => d.score >= 7 && d.score <= 10).length
};
```

## Best Practices

1. **Validation**: Always validate data before storing
2. **Error Handling**: Handle JSON parse errors gracefully
3. **Versioning**: Add version fields for future migrations
4. **Privacy**: Never store PII without consent
5. **Backup**: Regularly backup diagnostic data
6. **Monitoring**: Monitor data storage size and growth
7. **Documentation**: Keep schema docs up to date
