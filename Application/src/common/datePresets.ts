/**
 * Predefined date ranges the statistics can be filtered by
 */
export type DatePreset = 'This week' | 'Last week' | 'This month' | 'Last month' | 'This year';

export const DATE_PRESETS: DatePreset[] = [
  'This week',
  'Last week',
  'This month',
  'Last month',
  'This year',
];

/**
 * Range of days, both days are included
 */
export interface IDateRange {
  start: Date;
  end: Date;
}

/**
 * Resolves the first and the last day of a predefined date range.
 *
 * @param preset The predefined date range.
 * @param today The day the range is relative to.
 * @param firstDayOfWeek The day weeks start at (0 = Sunday, 1 = Monday, ...).
 */
export const getPresetRange = (preset: DatePreset, today: Date, firstDayOfWeek: number): IDateRange => {
  const year: number = today.getFullYear();
  const month: number = today.getMonth();

  const daysSinceWeekStart: number = (today.getDay() - firstDayOfWeek + 7) % 7;
  const weekStart: number = today.getDate() - daysSinceWeekStart;

  switch (preset) {
    case 'This week':
      return {
        start: new Date(year, month, weekStart),
        end: new Date(year, month, weekStart + 6),
      };
    case 'Last week':
      return {
        start: new Date(year, month, weekStart - 7),
        end: new Date(year, month, weekStart - 1),
      };
    case 'This month':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    case 'Last month':
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0),
      };
    case 'This year':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      };
  }
};
