# API Documentation

This document describes all API endpoints for the Claim Readiness Diagnostic.

## Overview

The diagnostic uses serverless functions deployed on Vercel. All endpoints are located in the `/api` directory.

**Base URL**: `https://yourdomain.com/api`

**Authentication**: None required (public endpoints)

**Content Type**: `application/json`

## Endpoints

### POST /api/log-diagnostic.js

Logs diagnostic completion data for business analytics.

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "timestamp": "2025-12-18T10:30:00.000Z",
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

**Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timestamp | string | Yes | ISO 8601 timestamp of completion |
| answers | object | Yes | Answer points for each question |
| answers.service_connection | number | Yes | Points (0, 1, or 2) |
| answers.denial_handling | number | Yes | Points (0, 1, or 2) |
| answers.pathway | number | Yes | Points (0, 1, or 2) |
| answers.severity | number | Yes | Points (0, 1, or 2) |
| answers.secondaries | number | Yes | Points (0, 1, or 2) |
| score | number | Yes | Total score (0-10) |
| recommendation | string | Yes | Recommendation category |

**Recommendation Values**:
- `FULLY_READY`
- `OPTIONAL_CONFIRMATION`
- `REVIEW_BENEFICIAL`
- `REVIEW_STRONGLY_RECOMMENDED`

#### Response

**Success Response** (200 OK):
```json
{
  "success": true,
  "id": "diag_1702896600000_abc123xyz"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Always `true` on success |
| id | string | Unique diagnostic session ID |

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid payload structure"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Internal server error"
}
```

#### Example Usage

**JavaScript (Fetch API)**:
```javascript
const diagnosticData = {
  timestamp: new Date().toISOString(),
  answers: {
    service_connection: 2,
    denial_handling: 1,
    pathway: 2,
    severity: 1,
    secondaries: 2
  },
  score: 8,
  recommendation: 'REVIEW_STRONGLY_RECOMMENDED'
};

try {
  const response = await fetch('/api/log-diagnostic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(diagnosticData)
  });
  
  const result = await response.json();
  console.log('Diagnostic logged:', result.id);
} catch (error) {
  console.error('Logging failed:', error);
  // Don't block user experience on logging failure
}
```

**cURL**:
```bash
curl -X POST https://yourdomain.com/api/log-diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-18T10:30:00.000Z",
    "answers": {
      "service_connection": 2,
      "denial_handling": 1,
      "pathway": 2,
      "severity": 1,
      "secondaries": 2
    },
    "score": 8,
    "recommendation": "REVIEW_STRONGLY_RECOMMENDED"
  }'
```

#### Error Handling

The endpoint is designed to fail gracefully:

- Invalid payloads return 400 error
- Server errors return 500 error
- Client should not block user experience on logging failure
- Errors are logged server-side for monitoring

#### Data Storage

Diagnostic data is stored in `/data/diagnostics.json` as a JSON array:

```json
[
  {
    "id": "diag_1702896600000_abc123xyz",
    "timestamp": "2025-12-18T10:30:00.000Z",
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
]
```

---

### POST /api/create-checkout-session.js

Creates a Stripe Checkout Session for paid bookings.

**Status**: EXISTING - No modifications made for diagnostic

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "priceId": "price_...",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/diagnostic"
}
```

**Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| priceId | string | No | Stripe Price ID (uses env var if not provided) |
| successUrl | string | No | Redirect URL on success |
| cancelUrl | string | No | Redirect URL on cancel |

#### Response

**Success Response** (200 OK):
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| url | string | Stripe Checkout Session URL |

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to create checkout session"
}
```

#### Example Usage

**JavaScript (Fetch API)**:
```javascript
try {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const { url } = await response.json();
  window.location.href = url;
} catch (error) {
  console.error('Payment error:', error);
  alert('Unable to process payment. Please try again.');
}
```

---

### POST /api/webhook.js

Handles Stripe webhook events for payment lifecycle.

**Status**: EXISTING - No modifications made for diagnostic

#### Request

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Stripe-Signature: t=...,v1=...
```

**Body**: Stripe webhook event payload

#### Response

**Success Response** (200 OK):
```json
{
  "received": true
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Webhook signature verification failed"
}
```

#### Webhook Events

Handled events:
- `checkout.session.completed`: Payment successful
- `checkout.session.expired`: Payment session expired
- `payment_intent.succeeded`: Payment processed
- `payment_intent.payment_failed`: Payment failed

#### Configuration

Configure webhook endpoint in Stripe Dashboard:
- URL: `https://yourdomain.com/api/webhook`
- Events: Select relevant checkout and payment events
- Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var

---

## CORS Configuration

All API endpoints support CORS for cross-origin requests:

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

For production, restrict `Access-Control-Allow-Origin` to your domain:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

## Rate Limiting

Consider implementing rate limiting for production:

```javascript
// Example using Vercel Edge Config
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

## Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid payload, missing required fields |
| 401 | Unauthorized | Invalid API key (if auth added) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, database unavailable |

## Testing

### Test Endpoints Locally

Start local development server:
```bash
npm run dev
```

Test log-diagnostic endpoint:
```bash
curl -X POST http://localhost:3001/api/log-diagnostic \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-18T10:30:00.000Z",
    "answers": {
      "service_connection": 2,
      "denial_handling": 1,
      "pathway": 2,
      "severity": 1,
      "secondaries": 2
    },
    "score": 8,
    "recommendation": "REVIEW_STRONGLY_RECOMMENDED"
  }'
```

### Test Stripe Integration

Use Stripe test mode:
- Test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Automated Testing

Run API tests:
```bash
npm test -- __tests__/log-diagnostic.test.js
```

## Monitoring

### Vercel Logs

View function logs in Vercel dashboard:
1. Go to your project
2. Click "Logs" tab
3. Filter by function name

### Error Tracking

Consider integrating error tracking:
- Sentry
- Rollbar
- Bugsnag

Example Sentry integration:
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

module.exports = async (req, res) => {
  try {
    // ... endpoint logic
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## Security

### Input Validation

Always validate request payloads:

```javascript
function validateDiagnosticPayload(data) {
  if (!data.timestamp || !data.answers || !data.score || !data.recommendation) {
    throw new Error('Missing required fields');
  }
  
  if (typeof data.score !== 'number' || data.score < 0 || data.score > 10) {
    throw new Error('Invalid score');
  }
  
  const validRecommendations = [
    'FULLY_READY',
    'OPTIONAL_CONFIRMATION',
    'REVIEW_BENEFICIAL',
    'REVIEW_STRONGLY_RECOMMENDED'
  ];
  
  if (!validRecommendations.includes(data.recommendation)) {
    throw new Error('Invalid recommendation');
  }
  
  return true;
}
```

### Environment Variables

Never expose sensitive data:
- Store API keys in environment variables
- Don't commit `.env` files
- Use Vercel's environment variable management

### HTTPS

Always use HTTPS in production:
- Vercel provides HTTPS automatically
- Redirect HTTP to HTTPS
- Use secure cookies for sessions

## Best Practices

1. **Error Handling**: Always catch and log errors
2. **Validation**: Validate all inputs
3. **Logging**: Log important events for debugging
4. **Performance**: Keep functions lightweight
5. **Security**: Validate, sanitize, and never trust client input
6. **Monitoring**: Set up alerts for errors
7. **Documentation**: Keep API docs up to date

## Changelog

### Version 1.0.0 (2025-12-18)
- Initial release
- Added `/api/log-diagnostic.js` endpoint
- Integrated with existing Stripe endpoints
