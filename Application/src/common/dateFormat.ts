// region Constants

const MILLISECONDS_PER_MINUTE: number = 60_000;

/**
 * Durations reported by the api are .NET ticks, 100 nanoseconds each
 */
const TICKS_PER_MILLISECOND: number = 10_000;

// endregion

// region Methods

/**
 * Pads a number to two digits.
 * @param value The number to pad.
 */
const twoDigits = (value: number): string => value
  .toString()
  .padStart(2, '0');

/**
 * Formats a date as the value of a `date` input (`YYYY-MM-DD`), using the local time zone.
 * @param date The date to format.
 */
const toDateInput = (date: Date): string =>
  `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;

/**
 * Parses the value of a `date` input as a local date.
 * @param value The value of the input (`YYYY-MM-DD`).
 * @param endOfDay Whether the last moment of the day should be returned instead of midnight.
 * @returns the parsed date, null if the value is empty or invalid
 */
const fromDateInput = (value: string, endOfDay: boolean = false): Date|null => {
  const [year, month, day] = value
    .split('-')
    .map(part => parseInt(part));

  if (year == undefined || month == undefined || day == undefined) {
    return null;
  }

  const date: Date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a date as the value of a `datetime-local` input (`YYYY-MM-DDTHH:mm`).
 * @param date The date to format.
 */
const toDateTimeInput = (date: Date): string =>
  `${toDateInput(date)}T${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;

/**
 * Formats a duration as `Hh MMm`, negative durations are shown as zero.
 * @param milliseconds The duration in milliseconds.
 */
const formatDuration = (milliseconds: number): string => {
  const totalMinutes: number = Math.max(0, Math.round(milliseconds / MILLISECONDS_PER_MINUTE));

  return `${Math.floor(totalMinutes / 60)}h ${twoDigits(totalMinutes % 60)}m`;
};

/**
 * Converts a duration reported by the api in .NET ticks into milliseconds.
 * @param ticks The duration in ticks.
 */
const ticksToMilliseconds = (ticks: number): number => ticks / TICKS_PER_MILLISECOND;

// endregion

export {
  toDateInput,
  fromDateInput,
  toDateTimeInput,
  formatDuration,
  ticksToMilliseconds,
};
