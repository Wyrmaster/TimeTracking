import {BodyIntent} from '../../bodyIntent.ts';
import type {IActivity} from './activity.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to update an activity
 */
export class PutActivityIntent extends BodyIntent<void, IActivity> {

  // region Constructor

  constructor(activity: IActivity, activityId: number) {
    super(activity, `/api/v1/activity/${activityId}/`, HttpMethod.PUT);
  }

  // endregion

}