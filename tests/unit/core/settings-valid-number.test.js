/**
 * VideoSpeedConfig.validNumber: stored numeric options fall back to their
 * default when invalid (older option pages stored NaN for "0,5").
 */

import { describe, it, expect } from 'vitest';

describe('VideoSpeedConfig.validNumber', () => {
  const valid = (value) =>
    window.VSC.VideoSpeedConfig.validNumber(value, 'controllerOpacity', 0, 1);
  const fallback = () => window.VSC.Constants.DEFAULT_SETTINGS.controllerOpacity;

  it('keeps finite values inside the range', () => {
    expect(valid(0)).toBe(0);
    expect(valid(0.55)).toBe(0.55);
    expect(valid(1)).toBe(1);
  });

  it.each([NaN, null, undefined, '0.5', '0,5', -0.1, 1.5, Infinity])(
    'falls back to the default for %s',
    (value) => {
      expect(valid(value)).toBe(fallback());
    }
  );
});
