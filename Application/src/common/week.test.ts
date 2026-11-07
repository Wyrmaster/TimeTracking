import {describe, expect, it} from 'vitest';
import {CalendarDate} from '@internationalized/date';
import {generateWeekDays} from './week.ts';

// Wednesday
const date = new CalendarDate(2026, 11, 4);

describe('generateWeekDays', () => {
  it('shows monday to friday for a work week', () => {
    const days = generateWeekDays(date, true, 0);

    expect(days.map(day => day.toString())).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ]);
  });

  it('starts a full week at the configured first day', () => {
    expect(generateWeekDays(date, false, 0)[0].toString()).toBe('2026-11-01');
    expect(generateWeekDays(date, false, 1)[0].toString()).toBe('2026-11-02');
    expect(generateWeekDays(date, false, 1)).toHaveLength(7);
  });
});
