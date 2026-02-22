import {BodyIntent} from '../../BodyIntent.ts';
import {IActivity} from './IActivity.ts';
import {HttpMethod} from '../../HttpMethod.ts';

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