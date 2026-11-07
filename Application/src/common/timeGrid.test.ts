import {describe, expect, it} from 'vitest';
import {CalendarDate} from '@internationalized/date';
import {formatMinutes, splitTimeEntries} from './timeGrid.ts';
import type {ITimeEntryDto} from '../network/intents/timeEntry/timeEntryDto.ts';

const monday = new CalendarDate(2026, 11, 2);
const tuesday = new CalendarDate(2026, 11, 3);

const timeEntry = (start: Date, end: Date|null): ITimeEntryDto => ({
  id: 1,
  description: '',
  start,
  end,
  activity: null,
});

describe('formatMinutes', () => {
  it('formats minutes since midnight as HH:mm', () => {
    expect(formatMinutes(0)).toBe('00:00');
    expect(formatMinutes(9 * 60 + 5)).toBe('09:05');
    expect(formatMinutes(23 * 60 + 59.9)).toBe('23:59');
  });
});

describe('splitTimeEntries', () => {
  it('places an entry within its day', () => {
    const segments = splitTimeEntries(
      [timeEntry(new Date(2026, 10, 2, 8, 0), new Date(2026, 10, 2, 9, 30))],
      [monday, tuesday],
      new Date(2026, 10, 3, 12, 0),
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      dayIndex: 0,
      startMinute: 8 * 60,
      endMinute: 9 * 60 + 30,
      isActive: false,
    });
  });

  it('splits an entry spanning midnight into one segment per day', () => {
    const segments = splitTimeEntries(
      [timeEntry(new Date(2026, 10, 2, 22, 0), new Date(2026, 10, 3, 2, 0))],
      [monday, tuesday],
      new Date(2026, 10, 3, 12, 0),
    );

    expect(segments.map(segment => segment.dayIndex)).toEqual([0, 1]);
    expect(segments[0]).toMatchObject({continuesOnNextDay: true, endMinute: 24 * 60});
    expect(segments[1]).toMatchObject({
continuesFromPreviousDay: true, startMinute: 0, endMinute: 2 * 60,
});
  });

  it('keeps a running entry that started after the given now', () => {
    const now = new Date(2026, 10, 2, 10, 0, 0);
    const startedLater = new Date(2026, 10, 2, 10, 0, 20);

    const segments = splitTimeEntries([timeEntry(startedLater, null)], [monday], now);

    expect(segments).toHaveLength(1);
    expect(segments[0].isActive).toBe(true);
  });
});
