import {BodyIntent} from '../../bodyIntent.ts';
import type {IActivity} from './activity.ts';
import {HttpMethod} from '../../httpMethod.ts';

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