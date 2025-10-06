import { beforeEach, describe, expect, it } from 'vitest';
import { DataCaptureSubmissionError, OnlineDataCapture } from './dataCapture';

describe('OnlineDataCapture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('rejects when every configured service throws', async () => {
    const capture = new OnlineDataCapture({ enableTracking: false });

    let capturedError: unknown;
    try {
      await capture.captureAnalyticsEvent('test_event');
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).toBeInstanceOf(DataCaptureSubmissionError);

    const error = capturedError as DataCaptureSubmissionError;
    expect(error.context.type).toBe('analytics_event');
    expect(error.context.servicesAttempted).toEqual([
      'sendToWebhook',
      'sendToGoogleSheets',
      'sendToFormspree',
      'sendToNetlifyForms',
    ]);
    expect(error.context.errors).toHaveLength(4);

    const errorMessages = error.context.errors.map((entry) => entry.message);
    expect(errorMessages).toEqual([
      'No webhook URL configured',
      'No Google Sheets URL configured',
      'No Formspree URL configured',
      'No Netlify form URL configured',
    ]);

    expect(capture.getFallbackData()).toHaveLength(1);
    const storedFallback = localStorage.getItem('fallback_data');
    expect(storedFallback).not.toBeNull();
    expect(JSON.parse(storedFallback!)).toHaveLength(1);
  });
});
