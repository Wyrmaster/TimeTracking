import {describe, expect, it} from 'vitest';
import {
  formatDuration,
  fromDateInput,
  ticksToMilliseconds,
  toDateInput,
  toDateTimeInput,
} from './dateFormat.ts';

describe('dateFormat', () => {
  it('formats dates for date and datetime inputs', () => {
    const date = new Date(2026, 0, 5, 7, 3);

    expect(toDateInput(date)).toBe('2026-01-05');
    expect(toDateTimeInput(date)).toBe('2026-01-05T07:03');
  });

  it('parses date inputs as local start or end of the day', () => {
    expect(fromDateInput('2026-01-05')).toEqual(new Date(2026, 0, 5));
    expect(fromDateInput('2026-01-05', true)).toEqual(new Date(2026, 0, 5, 23, 59, 59, 999));
    expect(fromDateInput('')).toBeNull();
  });

  it('formats durations as hours and minutes', () => {
    expect(formatDuration(0)).toBe('0h 00m');
    expect(formatDuration((2 * 60 + 5) * 60_000)).toBe('2h 05m');
    expect(formatDuration(-1)).toBe('0h 00m');
  });

  it('converts .NET ticks into milliseconds', () => {
    expect(ticksToMilliseconds(36_000_000_000)).toBe(3_600_000);
  });
});
