// VA Claim Readiness Diagnostic Scoring Logic
import { QUESTIONS, RECOMMENDATIONS, RECOMMENDATION_CATEGORIES } from './diagnosticConfig';

/**
 * Calculate total score from answers
 * @param {Object} answers - Map of question IDs to points
 * @returns {number} Total score (0-10)
 */
export const calculateTotalScore = (answers) => {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Invalid answers object');
  }

  let total = 0;
  QUESTIONS.forEach(question => {
    const points = answers[question.id];
    if (typeof points === 'number' && [0, 1, 2].includes(points)) {
      total += points;
    }
  });

  return total;
};

/**
 * Get recommendation category based on score
 * @param {number} score - Total score (0-10)
 * @returns {string} Recommendation category
 */
export const getRecommendationCategory = (score) => {
  if (typeof score !== 'number' || score < 0 || score > 10) {
    throw new Error('Invalid score. Must be between 0 and 10');
  }

  // Find matching recommendation based on score range
  for (const [category, config] of Object.entries(RECOMMENDATIONS)) {
    const [min, max] = config.scoreRange;
    if (score >= min && score <= max) {
      return category;
    }
  }

  // Fallback based on score ranges
  if (score === 0) return RECOMMENDATION_CATEGORIES.FULLY_READY;
  if (score <= 2) return RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION;
  if (score <= 6) return RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL;
  return RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED;
};

/**
 * Get complete recommendation data
 * @param {number} score - Total score (0-10)
 * @returns {Object} Recommendation data
 */
export const getRecommendationData = (score) => {
  const category = getRecommendationCategory(score);
  return {
    ...RECOMMENDATIONS[category],
    score
  };
};

/**
 * Get status indicator for a specific answer
 * @param {number} points - Points for the answer (0, 1, or 2)
 * @returns {string} Status: 'ADEQUATE', 'NEEDS_ATTENTION', or 'MISSING'
 */
export const getStatusForPoints = (points) => {
  if (points === 0) return 'ADEQUATE';
  if (points === 1) return 'NEEDS_ATTENTION';
  if (points === 2) return 'MISSING';
  throw new Error('Invalid points value');
};

/**
 * Validate answer data
 * @param {string} questionId - Question identifier
 * @param {number} points - Points value
 * @returns {boolean} True if valid
 */
export const validateAnswer = (questionId, points) => {
  const question = QUESTIONS.find(q => q.id === questionId);
  if (!question) {
    throw new Error(`Invalid question ID: ${questionId}`);
  }

  if (![0, 1, 2].includes(points)) {
    throw new Error('Points must be 0, 1, or 2');
  }

  return true;
};

/**
 * Generate unique session ID
 * @returns {string} Session ID
 */
export const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `diagnostic_${timestamp}_${random}`;
};

/**
 * Format diagnostic data for Supabase
 * @param {Object} answers - Answer data
 * @param {number} score - Total score
 * @param {string} recommendation - Recommendation category
 * @returns {Object} Formatted data for database
 */
export const formatDiagnosticData = (answers, score, recommendation) => {
  const browserData = typeof window !== 'undefined' ? {
    user_agent: navigator.userAgent,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  } : {
    user_agent: 'server',
    viewport_width: 0,
    viewport_height: 0
  };

  return {
    session_id: generateSessionId(),
    service_connection: answers.service_connection,
    denial_handling: answers.denial_handling,
    pathway: answers.pathway,
    severity: answers.severity,
    secondaries: answers.secondaries,
    total_score: score,
    recommendation: recommendation,
    completed_at: new Date().toISOString(),
    ...browserData
  };
};

/**
 * Check if all questions are answered
 * @param {Object} answers - Answer data
 * @returns {boolean} True if all answered
 */
export const isComplete = (answers) => {
  if (!answers || typeof answers !== 'object') return false;

  return QUESTIONS.every(question => {
    const points = answers[question.id];
    return typeof points === 'number' && [0, 1, 2].includes(points);
  });
};
