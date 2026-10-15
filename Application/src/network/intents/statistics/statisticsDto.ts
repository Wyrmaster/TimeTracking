import type {ITimeEntryDto} from './timeEntryDto.ts';

/**
 * Dto describing the statistics of tracked time
 */
export interface IStatisticsDto {
  timeEntries: ITimeEntryDto[];
  statistics: ITimeEntryDto[];
}