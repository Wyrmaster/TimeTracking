import {BodyIntent} from '../../BodyIntent.ts';
import {IActivity} from './IActivity.ts';
import {HttpMethod} from '../../HttpMethod.ts';

/**
 * Intent used to create a new activity
 */
export class PostActivityIntent extends BodyIntent<void, IActivity> {

  // region Constructor

  constructor(activity: IActivity, workspaceId: number) {
    super(activity, `/api/v1/activity/${workspaceId}/`, HttpMethod.POST);
  }

  // endregion

}