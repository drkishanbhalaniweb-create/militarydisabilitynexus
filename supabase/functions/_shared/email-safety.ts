import {
  sanitizeEmailAddress,
  sanitizeInlineText,
  sanitizeMultilineText,
} from './submission-utils.ts';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeSubjectLine(value: unknown, fallback: string): string {
  return sanitizeInlineText(value, 150) || fallback;
}

export function formatInlineHtml(
  value: unknown,
  fallback = 'Not provided',
  maxLength = 200,
): string {
  const sanitized = sanitizeInlineText(value, maxLength);
  return escapeHtml(sanitized || fallback);
}

export function formatMultilineHtml(
  value: unknown,
  fallback = 'Not provided',
  maxLength = 5000,
): string {
  const sanitized = sanitizeMultilineText(value, maxLength);
  return escapeHtml(sanitized || fallback).replace(/\n/g, '<br>');
}

export function formatSafeEmail(value: unknown, fallback = 'Not provided'): string {
  try {
    return escapeHtml(sanitizeEmailAddress(value));
  } catch {
    return escapeHtml(fallback);
  }
}

export function sanitizeReplyToAddress(value: unknown, fallback: string): string {
  try {
    return sanitizeEmailAddress(value);
  } catch {
    return fallback;
  }
}

export function sanitizeMailboxHeader(value: unknown, fallback: string): string {
  const raw = sanitizeInlineText(value, 200);

  if (!raw) {
    return fallback;
  }

  const mailboxMatch = raw.match(/^(.*?)<([^<>]+)>$/);

  if (mailboxMatch) {
    const displayName = sanitizeInlineText(mailboxMatch[1], 100);
    try {
      const email = sanitizeEmailAddress(mailboxMatch[2]);
      return displayName ? `${displayName} <${email}>` : email;
    } catch {
      return fallback;
    }
  }

  try {
    return sanitizeEmailAddress(raw);
  } catch {
    return fallback;
  }
}
