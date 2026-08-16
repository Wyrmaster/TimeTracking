import {Intent} from '../../intent.ts';
import {HttpMethod} from '../../httpMethod.ts';

/**
 * Intent used to remove an activity
 */
export class RemoveActivityIntent extends Intent<void> {

  // region Constructor

  constructor(activityId: number) {
    super(`/api/v1/activity/${activityId}/`, HttpMethod.DELETE);
  }

  // endregion
}