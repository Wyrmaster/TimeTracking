import {type DateValue, getDayOfWeek} from '@internationalized/date';

/**
 * Days of a work week, which always starts on monday
 */
const WORK_WEEK_DAYS: number = 5;

const DAYS_PER_WEEK: number = 7;

const MONDAY: number = 1;

/**
 * Generates the days of the week the given date belongs to.
 *
 * A work week shows monday to friday, a full week starts at the configured first day of the week.
 *
 * @param date The date within the week.
 * @param useWorkWeek Whether only the work week is shown.
 * @param firstDayOfWeek The day full weeks start at (0 = Sunday, 1 = Monday, ...).
 */
export const generateWeekDays = (date: DateValue, useWorkWeek: boolean, firstDayOfWeek: number): DateValue[] => {
  const weekStartDay: number = useWorkWeek ? MONDAY : firstDayOfWeek;

  // with the en-US locale 0 is sunday, the same as Date.getDay()
  const daysSinceWeekStart: number = (getDayOfWeek(date, 'en-US') - weekStartDay + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const startOfWeek: DateValue = date.subtract({days: daysSinceWeekStart});

  return Array.from(
    {length: useWorkWeek ? WORK_WEEK_DAYS : DAYS_PER_WEEK},
    (_, day: number) => startOfWeek.add({days: day}),
  );
};
