import type {DateValue} from '@internationalized/date';
import type {ITimeEntryDto} from '../network/intents/timeEntry/timeEntryDto.ts';

// region Constants

/**
 * Amount of hour rows rendered by the time table
 */
const HOURS_PER_DAY: number = 24;

/**
 * Amount of intervals a single hour row is split into
 */
const QUARTERS_PER_HOUR: number = 4;

const MINUTES_PER_HOUR: number = 60;
const MINUTES_PER_QUARTER: number = MINUTES_PER_HOUR / QUARTERS_PER_HOUR;
const MINUTES_PER_DAY: number = HOURS_PER_DAY * MINUTES_PER_HOUR;
const MILLISECONDS_PER_MINUTE: number = 60_000;

// endregion

// region Interfaces

/**
 * Part of a time entry that is displayed within a single day column of the time table.
 *
 * A time entry may span several days, in which case it is split into one segment per day,
 * every segment being clamped to the borders of the day it belongs to.
 */
export interface ITimeEntrySegment {
  /**
   * Stable react key of the segment
   */
  key: string;
  /**
   * The time entry this segment was created from
   */
  timeEntry: ITimeEntryDto;
  /**
   * Index of the day column this segment belongs to
   */
  dayIndex: number;
  /**
   * Minutes since midnight at which the segment starts
   */
  startMinute: number;
  /**
   * Minutes since midnight at which the segment ends
   */
  endMinute: number;
  /**
   * Whether the time entry already started before the day of this segment
   */
  continuesFromPreviousDay: boolean;
  /**
   * Whether the time entry still continues after the day of this segment
   */
  continuesOnNextDay: boolean;
  /**
   * Whether the time entry is still running and therefore grows as time progresses
   */
  isActive: boolean;
}

// endregion

// region Methods

/**
 * Ensures a value received from the api is usable as a date.
 *
 * Dates are transferred as ISO strings and are therefore not revived by `JSON.parse`.
 *
 * @param value The value to convert into a date.
 */
const asDate = (value: Date|string): Date => value instanceof Date ? value : new Date(value);

/**
 * Creates the local date representing midnight of the given day.
 * @param day The day to get the start of.
 */
const getStartOfDay = (day: DateValue): Date => new Date(day.year, day.month - 1, day.day, 0, 0, 0, 0);

/**
 * Gets the minutes that passed since midnight for the given date.
 * @param date The date to get the minutes of.
 */
const getMinutesOfDay = (date: Date): number =>
  date.getHours() * MINUTES_PER_HOUR + date.getMinutes() + date.getSeconds() / 60;

/**
 * Formats minutes since midnight as `HH:mm`.
 * @param minutes The minutes since midnight.
 */
const formatMinutes = (minutes: number): string => {
  const total: number = Math.floor(minutes);

  return `${Math.floor(total / MINUTES_PER_HOUR).toString().padStart(2, '0')}`
    + `:${(total % MINUTES_PER_HOUR).toString().padStart(2, '0')}`;
};

/**
 * Checks whether the given day describes the same day as the given date.
 * @param day The day to compare.
 * @param date The date to compare against.
 */
const isSameDay = (day: DateValue, date: Date): boolean =>
  day.year == date.getFullYear() && day.month == date.getMonth() + 1 && day.day == date.getDate();

/**
 * Creates the list of hours rendered as rows by the time table.
 */
const getHoursOfDay = (): number[] => Array.from({length: HOURS_PER_DAY}, (_, hour: number) => hour);

/**
 * Splits the given time entries into segments that can be rendered within the day columns
 * of the time table.
 *
 * Every time entry is clamped to the borders of each of the given days, so an entry that spans
 * multiple days is turned into one segment per day. Time entries without an end are still running
 * and are therefore clamped to the given `now`, which makes them grow as time progresses.
 *
 * @param timeEntries The time entries to split.
 * @param days The days rendered as columns.
 * @param now The current point in time used as the end of running time entries.
 */
const splitTimeEntries = (timeEntries: ITimeEntryDto[], days: DateValue[], now: Date): ITimeEntrySegment[] => {

  const segments: ITimeEntrySegment[] = [];

  for (const timeEntry of timeEntries) {

    const isActive: boolean = timeEntry.end == null;
    const start: Date = asDate(timeEntry.start);
    const end: Date = isActive ? now : asDate(timeEntry.end as Date);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end.getTime() < start.getTime()) {
      continue;
    }

    days.forEach((day: DateValue, dayIndex: number) => {

      const dayStart: Date = getStartOfDay(day);
      const dayEnd: Date = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const from: number = Math.max(start.getTime(), dayStart.getTime());
      const to: number = Math.min(end.getTime(), dayEnd.getTime());

      // no overlap with this day at all
      if (to < from) {
        return;
      }

      // an entry ending exactly at midnight must not bleed into the following day
      if (to == from && start.getTime() != from) {
        return;
      }

      segments.push({
        key: `${timeEntry.id}-${dayIndex}`,
        timeEntry,
        dayIndex,
        startMinute: Math.max(0, (from - dayStart.getTime()) / MILLISECONDS_PER_MINUTE),
        endMinute: Math.min(MINUTES_PER_DAY, (to - dayStart.getTime()) / MILLISECONDS_PER_MINUTE),
        continuesFromPreviousDay: start.getTime() < dayStart.getTime(),
        continuesOnNextDay: end.getTime() > dayEnd.getTime(),
        isActive
      });
    });
  }

  return segments;
};

// endregion

export {
  HOURS_PER_DAY,
  QUARTERS_PER_HOUR,
  MINUTES_PER_HOUR,
  MINUTES_PER_QUARTER,
  MINUTES_PER_DAY,
  asDate,
  getStartOfDay,
  getMinutesOfDay,
  formatMinutes,
  isSameDay,
  getHoursOfDay,
  splitTimeEntries
};
