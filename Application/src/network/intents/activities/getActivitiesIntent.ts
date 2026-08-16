import {Intent} from '../../intent.ts';
import type {ResponseCallback} from '../../../types/responseCallback.ts';
import {HttpMethod} from '../../httpMethod.ts';
import type {IActivityDto} from './activityDto.ts';

/**
 * Intent used to get all activities of a workspace
 */
export class GetActivitiesIntent extends Intent<IActivityDto[]>{

  // region Constructor

  constructor(workspaceId: number|null, offset: number = 0, count: number = 50 , callback: ResponseCallback<IActivityDto[]> = null) {
    super(`/api/v1/activity/?`
      + (workspaceId == null ? '' : `workspaceId=${workspaceId}`)
      + `&offset=${offset}`
      + `&count=${count}`, HttpMethod.GET, callback);
  }

  // endregion

}