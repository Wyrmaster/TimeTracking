import {Intent} from '../../Intent.ts';
import {ResponseCallback} from '../../../Types/ResponseCallback.ts';
import {HttpMethod} from '../../HttpMethod.ts';
import {IActivityDto} from './IActivityDto.ts';

/**
 * Intent used to get all activities of a workspace
 */
export class GetActivitiesIntent extends Intent<IActivityDto[]>{

  // region Constructor

  constructor(workspaceId: number|null, offset: number = 0, count: number = 50 , callback: ResponseCallback<IActivityDto[]> = null) {
    super(`/api/v1/activity/${workspaceId ?? ''}?offset=${offset}&count=${count}`, HttpMethod.GET, callback);
  }

  // endregion

}