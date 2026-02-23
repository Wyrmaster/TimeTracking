import {IActivity} from './IActivity.ts';
import {IIdDto} from '../IIdDto.ts';

/**
 * Interface for DTOs that represent an activity
 */
export interface IActivityDto extends IActivity, IIdDto {
  isActive: boolean;
}