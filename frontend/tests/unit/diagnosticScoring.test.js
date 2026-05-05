import { describe, expect, test } from 'vitest';
import fc from 'fast-check';
import { QUESTIONS, RECOMMENDATION_CATEGORIES } from '../../src/lib/diagnosticConfig';
import {
  calculateTotalScore,
  formatDiagnosticData,
  getRecommendationCategory,
  getRecommendationData,
  getStatusForPoints,
  isComplete,
  validateAnswer,
} from '../../src/lib/diagnosticScoring';

const answerRecordArbitrary = fc.record(
  Object.fromEntries(QUESTIONS.map((question) => [question.id, fc.integer({ min: 0, max: 2 })])),
);

describe('diagnostic scoring', () => {
  test('totals valid answer points for any complete answer set', () => {
    fc.assert(
      fc.property(answerRecordArbitrary, (answers) => {
        const expected = Object.values(answers).reduce((sum, points) => sum + points, 0);
        expect(calculateTotalScore(answers)).toBe(expected);
      }),
    );
  });

  test('maps score boundaries to recommendation categories', () => {
    expect(getRecommendationCategory(0)).toBe(RECOMMENDATION_CATEGORIES.FULLY_READY);
    expect(getRecommendationCategory(1)).toBe(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
    expect(getRecommendationCategory(2)).toBe(RECOMMENDATION_CATEGORIES.OPTIONAL_CONFIRMATION);
    expect(getRecommendationCategory(3)).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
    expect(getRecommendationCategory(6)).toBe(RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL);
    expect(getRecommendationCategory(7)).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
    expect(getRecommendationCategory(10)).toBe(RECOMMENDATION_CATEGORIES.REVIEW_STRONGLY_RECOMMENDED);
  });

  test('rejects invalid scores and point values', () => {
    expect(() => getRecommendationCategory(-1)).toThrow(/Invalid score/);
    expect(() => getRecommendationCategory(11)).toThrow(/Invalid score/);
    expect(() => getStatusForPoints(3)).toThrow(/Invalid points/);
    expect(() => validateAnswer('not_real', 0)).toThrow(/Invalid question ID/);
    expect(() => validateAnswer(QUESTIONS[0].id, 4)).toThrow(/Points must be/);
  });

  test('detects complete answer sets and returns recommendation data', () => {
    const answers = Object.fromEntries(QUESTIONS.map((question) => [question.id, 1]));

    expect(isComplete(answers)).toBe(true);
    expect(isComplete({ ...answers, [QUESTIONS[0].id]: undefined })).toBe(false);
    expect(getRecommendationData(calculateTotalScore(answers))).toMatchObject({
      category: RECOMMENDATION_CATEGORIES.REVIEW_BENEFICIAL,
      score: QUESTIONS.length,
    });
  });

  test('formats diagnostic data for server-side persistence', () => {
    const answers = Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
    const data = formatDiagnosticData(answers, 0, RECOMMENDATION_CATEGORIES.FULLY_READY);

    expect(data.session_id).toMatch(/^diagnostic_/);
    expect(data.total_score).toBe(0);
    expect(data.recommendation).toBe(RECOMMENDATION_CATEGORIES.FULLY_READY);
    expect(data.user_agent).toBeTruthy();
  });
});
