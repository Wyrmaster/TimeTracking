import type {IActivityDto} from './activityDto.ts';

/**
 * Represents an active activity with tracking information.
 */
export interface IActiveActivityDto extends IActivityDto{
  trackingSince: Date;
}