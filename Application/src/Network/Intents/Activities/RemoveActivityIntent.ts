import {Intent} from '../../Intent.ts';
import {HttpMethod} from '../../HttpMethod.ts';

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