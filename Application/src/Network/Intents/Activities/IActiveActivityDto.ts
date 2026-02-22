import {IActivityDto} from './IActivityDto.ts';

/**
 * Represents an active activity with tracking information.
 */
export interface IActiveActivityDto extends IActivityDto{
  trackingSince: Date;
}