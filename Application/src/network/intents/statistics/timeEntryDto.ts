/**
 * Dto describing the duration of tracked time in an activity
 */
export interface ITimeEntryDto {
  activityName: string;
  duration: number;
  color: number;
  start: Date|null;
  end: Date|null;
}