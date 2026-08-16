import type {IActivity} from './activity.ts';
import type {IIdDto} from '../idDto.ts';

/**
 * Interface for DTOs that represent an activity
 */
export interface IActivityDto extends IActivity, IIdDto {
  isActive: boolean;
}